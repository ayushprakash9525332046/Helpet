import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 30000,
});

// ── In-memory GET cache (60 s TTL) ───────────────────────────────
const CACHE_TTL = 60_000;
const PUBLIC_CACHE_PREFIXES = ["/services", "/services/categories"];

interface CacheEntry { data: unknown; ts: number }
const memCache = new Map<string, CacheEntry>();

function isCacheable(url: string): boolean {
  return PUBLIC_CACHE_PREFIXES.some((p) => url.startsWith(p));
}

// Attach token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serve from cache on GET for public endpoints; populate cache on response
api.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() !== "get") return config;
  const url = config.url ?? "";
  if (!isCacheable(url)) return config;

  const entry = memCache.get(url);
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    // Return a resolved promise that short-circuits the real request
    config.adapter = () =>
      Promise.resolve({
        data: entry.data,
        status: 200,
        statusText: "OK (cached)",
        headers: {},
        config,
      });
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const url = res.config.url ?? "";
    if (res.config.method?.toLowerCase() === "get" && isCacheable(url)) {
      memCache.set(url, { data: res.data, ts: Date.now() });
    }
    return res;
  },
  (err) => {
    const url = err.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/");
    if (err.response?.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Call this after admin creates/updates/deletes a service or category
export function invalidateServiceCache() {
  for (const key of memCache.keys()) {
    if (isCacheable(key)) memCache.delete(key);
  }
}

export default api;
