import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "@/components/SearchForm";
import JobMap from "@/components/JobMap";
import JobList from "@/components/JobList";
import ChatModal from "@/components/ChatModal";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { Job } from "@shared/schema";

interface JobSearchResponse {
  jobs: Job[];
  center: {
    lat: number;
    lon: number;
  };
}

export default function Home() {
  const [searchParams, setSearchParams] = useState<{ city: string; radius: number } | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { data, isLoading, error } = useQuery<JobSearchResponse>({
    queryKey: ["/api/jobs/search", searchParams],
    queryFn: async () => {
      if (!searchParams) return { jobs: [], center: { lat: 0, lon: 0 } };
      
      const params = new URLSearchParams({
        city: searchParams.city,
        radius: searchParams.radius.toString(),
      });
      
      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch jobs" }));
        throw new Error(errorData.error || "Failed to fetch jobs");
      }
      
      return response.json();
    },
    enabled: !!searchParams,
  });

  const jobs: Job[] = data?.jobs || [];
  const center: [number, number] = data?.center 
    ? [data.center.lat, data.center.lon] 
    : [37.7749, -122.4194];

  const handleSearch = (city: string, radius: number) => {
    console.log('Searching for jobs:', { city, radius });
    setSearchParams({ city, radius });
    setSelectedJobId(null);
  };

  const handleJobSelect = (jobId: string) => {
    console.log('Job selected:', jobId);
    setSelectedJobId(jobId);
  };

  const mapZoom = useMemo(() => {
    if (jobs.length > 0) {
      const maxDistance = Math.max(...jobs.map(job => job.distance));
      if (maxDistance < 5) return 13;
      if (maxDistance < 15) return 11;
      if (maxDistance < 30) return 10;
      return 9;
    }
    return 12;
  }, [jobs]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Job Search Map</h1>
            <Button
              data-testid="button-open-chat"
              onClick={() => setChatOpen(true)}
              variant="outline"
              size="default"
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </Button>
          </div>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!searchParams ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Find Your Next Job
              </h2>
              <p className="text-muted-foreground">
                Search for jobs by city and radius to see available positions
                on an interactive map
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching for jobs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Error Loading Jobs
              </h2>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] lg:h-[calc(100vh-220px)]">
              <JobMap
                jobs={jobs}
                selectedJobId={selectedJobId}
                onJobSelect={handleJobSelect}
                center={center}
                zoom={mapZoom}
              />
            </div>
            <div className="lg:col-span-1 h-[500px] lg:h-[calc(100vh-220px)] overflow-y-auto">
              <JobList
                jobs={jobs}
                selectedJobId={selectedJobId}
                onJobSelect={handleJobSelect}
              />
            </div>
          </div>
        )}
      </main>
      <ChatModal open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
