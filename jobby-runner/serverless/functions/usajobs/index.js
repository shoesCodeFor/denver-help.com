/*
 DigitalOcean Function: get-usajobs
 - Exposed as a web action (HTTP)
 - Accepts: query (string), location (string), radius (number, default 25), limit (number, default 50)
 - Proxies to an upstream API specified via API_BASE_URL env var
   (defaults to your existing DO app endpoint)
*/

const DEFAULT_BASE_URL =
  process.env.API_BASE_URL ||
  "https://sea-lion-app-mfl5w.ondigitalocean.app/api/usajobs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function jsonResponse(statusCode, bodyObj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders
    },
    body: JSON.stringify(bodyObj)
  };
}

function parseBodyIfPresent(args) {
  // OpenWhisk/DO Functions may populate args directly.
  // If raw body is present, attempt to parse JSON.
  if (args && typeof args.__ow_body === "string") {
    try {
      const isBase64 = args.__ow_isBase64 === true || args.__ow_isBase64 === "true";
      const raw = isBase64
        ? Buffer.from(args.__ow_body, "base64").toString("utf8")
        : args.__ow_body;
      const parsed = JSON.parse(raw);
      return { ...args, ...parsed };
    } catch (_) {
      // ignore parse errors; fall back to args
      return args;
    }
  }
  return args || {};
}

function normalizeParams(args) {
  let { query, location, radius, limit } = args;

  if (typeof radius === "string") radius = Number(radius);
  if (typeof limit === "string") limit = Number(limit);

  return {
    query: typeof query === "string" ? query.trim() : undefined,
    location: typeof location === "string" ? location.trim() : undefined,
    radius: Number.isFinite(radius) ? radius : 25,
    limit: Number.isFinite(limit) ? limit : 50
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

exports.main = async function main(args) {
  // Handle CORS preflight
  if (args && (args.__ow_method === "options" || args.__ow_method === "OPTIONS")) {
    return {
      statusCode: 204,
      headers: { ...CORS_HEADERS }
    };
  }

  const merged = parseBodyIfPresent(args);
  const { query, location, radius, limit } = normalizeParams(merged);

  if (!query || !location) {
    return jsonResponse(400, {
      error: "Missing required parameters: 'query' and 'location'.",
      received: { query: query ?? null, location: location ?? null }
    });
  }

  const params = new URLSearchParams({
    query,
    location,
    radius: String(radius),
    limit: String(limit)
  });

  const url = `${DEFAULT_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetchWithTimeout(url, { method: "GET" }, 15000);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return jsonResponse(response.status, {
        error: "Upstream request failed",
        status: response.status,
        statusText: response.statusText,
        details: text?.slice(0, 1000) || undefined
      });
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    // If upstream returned text, wrap it; otherwise pass JSON through
    const body = typeof data === "string" ? { data } : data;
    return jsonResponse(200, body);
  } catch (err) {
    const isAbort = err && (err.name === "AbortError" || err.code === "ABORT_ERR");
    return jsonResponse(isAbort ? 504 : 502, {
      error: isAbort ? "Upstream request timed out" : "Request failed",
      message: err && (err.message || String(err))
    });
  }
};

