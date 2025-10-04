import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchJobsSchema, chatRequestSchema, type Job } from "@shared/schema";

const API_BASE_URL = "https://sea-lion-app-mfl5w.ondigitalocean.app";

const geocodeCache = new Map<string, { lat: number; lon: number }>();
let lastGeocodeRequest = 0;
const GEOCODE_DELAY = 1000;

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  if (geocodeCache.has(location)) {
    return geocodeCache.get(location)!;
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastGeocodeRequest;
  if (timeSinceLastRequest < GEOCODE_DELAY) {
    await new Promise(resolve => setTimeout(resolve, GEOCODE_DELAY - timeSinceLastRequest));
  }

  try {
    lastGeocodeRequest = Date.now();
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'JobSearchMapApp/1.0 (job-search-app@example.com)',
        },
      }
    );

    if (!response.ok) {
      console.error(`Geocoding failed with status ${response.status} for location: ${location}`);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      geocodeCache.set(location, coords);
      return coords;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateJobCoordinates(
  centerLat: number,
  centerLon: number,
  radiusMiles: number,
  index: number,
  total: number
): { lat: number; lon: number } {
  const radiusInDegrees = radiusMiles / 69;
  
  const rings = Math.ceil(Math.sqrt(total));
  const currentRing = Math.floor(index / (total / rings));
  const ringRadius = ((currentRing + 1) / rings) * radiusInDegrees * 0.8;
  
  const angle = (index / total) * 2 * Math.PI + (currentRing * 0.5);
  const randomOffset = (Math.random() - 0.5) * 0.2 * radiusInDegrees;
  
  return {
    lat: centerLat + (ringRadius + randomOffset) * Math.cos(angle),
    lon: centerLon + (ringRadius + randomOffset) * Math.sin(angle),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const validation = searchJobsSchema.safeParse({
        city: req.query.city,
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid parameters",
          details: validation.error.errors,
        });
      }

      const { city, radius } = validation.data;
      const query = req.query.query || "software engineer";

      const centerCoords = await geocodeLocation(city);
      if (!centerCoords) {
        return res.status(400).json({ error: "Could not find location. Please try a different city." });
      }

      const apiUrl = `${API_BASE_URL}/api/usajobs?query=${encodeURIComponent(query as string)}&location=${encodeURIComponent(city)}&radius=${radius}&limit=50`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.success || !data.jobs) {
        return res.status(500).json({ error: "Failed to fetch jobs from external API" });
      }

      const jobsWithLocations: Job[] = data.jobs.map((job: any, index: number) => {
        const coords = generateJobCoordinates(
          centerCoords.lat,
          centerCoords.lon,
          radius,
          index,
          data.jobs.length
        );

        const distance = calculateDistance(
          centerCoords.lat,
          centerCoords.lon,
          coords.lat,
          coords.lon
        );

        const mappedJob: Job = {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary || undefined,
          postedDate: job.posted?.replace("Posted ", "") || "Recently",
          latitude: coords.lat,
          longitude: coords.lon,
          distance: Math.round(distance * 10) / 10,
          description: job.description || "No description available",
        };

        return mappedJob;
      });

      res.json({
        jobs: jobsWithLocations,
        center: centerCoords,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const validation = chatRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid chat request",
          details: validation.error.errors,
        });
      }

      const chatApiKey = process.env.CHAT_API_KEY;
      if (!chatApiKey) {
        return res.status(500).json({ error: "Chat API key not configured" });
      }

      const chatApiUrl = "https://kljuttuu7ewfmcijfonkroyf.agents.do-ai.run/api/v1/chat/completions";
      
      const response = await fetch(chatApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${chatApiKey}`,
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Chat API error:", response.status, errorText);
        return res.status(response.status).json({ 
          error: "Chat API request failed",
          details: errorText,
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error calling chat API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
