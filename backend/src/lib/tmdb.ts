import { cacheGet, cacheSet } from "./cache.js";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY || "";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  genres: { id: number; name: string }[];
  overview?: string;
  credits?: {
    crew: { job: string; name: string }[];
    cast: { name: string }[];
  };
}

export async function searchTmdb(query: string, type?: "movie" | "tv") {
  if (!TMDB_KEY) {
    return { error: "TMDB_API_KEY not configured" };
  }

  const cacheKey = `tmdb:search:${type || "multi"}:${query.toLowerCase().trim()}`;
  const cached = cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ query, language: "en-US", page: "1" });
  if (type) params.set("include_adult", "false");

  const endpoint = type
    ? `${TMDB_BASE}/search/${type}`
    : `${TMDB_BASE}/search/multi`;

  const res = await fetch(`${endpoint}?${params}`, {
    headers: { Authorization: `Bearer ${TMDB_KEY}` },
  });

  if (!res.ok) {
    return { error: `TMDB error: ${res.status}` };
  }

  const data = await res.json();
  const results = data.results as TmdbSearchResult[];
  cacheSet(cacheKey, results, CACHE_TTL);
  return results;
}

export async function getTmdbDetails(tmdbId: number, type: "movie" | "tv") {
  if (!TMDB_KEY) {
    return { error: "TMDB_API_KEY not configured" };
  }

  const res = await fetch(
    `${TMDB_BASE}/${type}/${tmdbId}?append_to_response=credits&language=en-US`,
    { headers: { Authorization: `Bearer ${TMDB_KEY}` } }
  );

  if (!res.ok) {
    return { error: `TMDB error: ${res.status}` };
  }

  const data = (await res.json()) as TmdbDetails;

  return {
    tmdbId: data.id,
    title: data.title || data.name || "Unknown",
    type: type === "movie" ? "film" : "series",
    posterPath: data.poster_path,
    releaseYear: parseInt(data.release_date?.slice(0, 4) || data.first_air_date?.slice(0, 4) || "0"),
    runtimeMinutes: data.runtime || null,
    genres: data.genres?.map((g) => g.name) || [],
    director:
      data.credits?.crew?.find((c) => c.job === "Director")?.name || null,
    castList: data.credits?.cast?.slice(0, 10).map((c) => c.name) || [],
  };
}

export function tmdbImageUrl(path: string | null, size = "w500"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
