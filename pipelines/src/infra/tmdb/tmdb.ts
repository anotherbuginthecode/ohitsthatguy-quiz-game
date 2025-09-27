// src/services/tmdb.ts
import { Title, Medium } from "./tmdb.types";
import { DataAPI } from "./tmdb.interface";

const API_KEY = process.env.TMDB_KEY!;
const BASE = "https://api.themoviedb.org/3";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export const tmdbApi: DataAPI = {
  async getFilteredCredits(actorId: number): Promise<Title[]> {
    const data = await fetchJSON<{ cast: any[] }>(
      `${BASE}/person/${actorId}/movie_credits?api_key=${API_KEY}`
    );
    return data.cast.map((c) => ({
      id: c.id,
      name: c.title || c.name,
      original_language: c.original_language,
      medium: "movie" as Medium,
      year: (c.release_date || c.first_air_date || "").slice(0, 4)
        ? parseInt((c.release_date || c.first_air_date).slice(0, 4))
        : undefined,
      genres: c.genre_ids ?? [],
      popularity: c.popularity,
    }));
  },

  async getSimilar(t: Title, limit: number): Promise<Title[]> {
    const data = await fetchJSON<{ results: any[] }>(
      `${BASE}/${t.medium}/${t.id}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    return data.results.slice(0, limit).map((c) => ({
      id: c.id,
      name: c.title || c.name,
      original_language: c.original_language,
      medium: t.medium,
      year: (c.release_date || c.first_air_date || "").slice(0, 4)
        ? parseInt((c.release_date || c.first_air_date).slice(0, 4))
        : undefined,
      genres: c.genre_ids ?? [],
      popularity: c.popularity,
    }));
  },

  async getRecommendations(t: Title, limit: number): Promise<Title[]> {
    const data = await fetchJSON<{ results: any[] }>(
      `${BASE}/${t.medium}/${t.id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
    );
    return data.results.slice(0, limit).map((c) => ({
      id: c.id,
      name: c.title || c.name,
      original_language: c.original_language,
      medium: t.medium,
      year: (c.release_date || c.first_air_date || "").slice(0, 4)
        ? parseInt((c.release_date || c.first_air_date).slice(0, 4))
        : undefined,
      genres: c.genre_ids ?? [],
      popularity: c.popularity,
    }));
  },

  async getTopCast(titleId: number, medium: Medium): Promise<number[]> {
    const data = await fetchJSON<{ cast: any[] }>(
      `${BASE}/${medium}/${titleId}/credits?api_key=${API_KEY}`
    );
    return data.cast.map((c) => c.id);
  },
};
