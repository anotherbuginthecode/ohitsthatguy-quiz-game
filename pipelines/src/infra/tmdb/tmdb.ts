// src/services/tmdb.ts
import { Title, Medium, Actor } from "./tmdb.types";
import { DataAPI } from "./tmdb.interface";

type Cfg = {
  apiKey?: string;
  language?: string; // es. "en-US" | "it-IT"
  imageBase?: string; // TMDB image base (default: "https://image.tmdb.org/t/p")
};

const DEFAULT_IMAGE_BASE = "https://image.tmdb.org/t/p";
const PROFILE_SIZE = "w300";
const POSTER_SIZE = "w342";
const BASE = "https://api.themoviedb.org/3";

function assertApiKey(k?: string): string {
  const key = k ?? process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not set");
  return key;
}

function lang(l?: string): string {
  return l ?? process.env.TMDB_LANG ?? "en-US";
}

function imgUrl(
  base: string,
  size: string,
  path?: string | null
): string | undefined {
  if (!path) return undefined;
  return `${base}/${size}${path}`;
}

function parseYear(date?: string | null): number | undefined {
  if (!date) return undefined;
  const y = date.slice(0, 4);
  const n = Number(y);
  return Number.isFinite(n) ? n : undefined;
}

function mapTitle(raw: any, medium: Medium, imageBase: string): Title {
  // raw può venire da /movie|/tv, /similar, /recommendations, /combined_credits
  const name = raw.title ?? raw.name ?? "";
  const year =
    medium === "movie"
      ? parseYear(raw.release_date)
      : parseYear(raw.first_air_date);

  return {
    id: raw.id,
    name,
    original_language: raw.original_language ?? "en",
    medium,
    year,
    genres: Array.isArray(raw.genre_ids)
      ? raw.genre_ids
      : Array.isArray(raw.genres)
      ? raw.genres.map((g: any) => g.id)
      : [],
    popularity: Number(raw.popularity ?? 0),
    posterUrl: imgUrl(imageBase, POSTER_SIZE, raw.poster_path),
  };
}

function mapPerson(raw: any, imageBase: string): Actor {
  return {
    tmdb_id: raw.id,
    name: raw.name,
    popularity: Number(raw.popularity ?? 0),
    image: imgUrl(imageBase, PROFILE_SIZE, raw.profile_path),
  };
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

function q(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  return usp.toString();
}

export function createTmdbApi(cfg: Cfg = {}): DataAPI {
  const API_KEY = assertApiKey(cfg.apiKey);
  const LANGUAGE = lang(cfg.language);
  const IMAGE_BASE = cfg.imageBase ?? DEFAULT_IMAGE_BASE;

  // Helpers per URL
  const withKeyLang = (
    params: Record<string, string | number | undefined> = {}
  ) => q({ api_key: API_KEY, language: LANGUAGE, ...params });

  return {
    async getPerson(personId: number): Promise<Actor | null> {
      const url = `${BASE}/person/${personId}?${withKeyLang()}`;
      try {
        const raw = await fetchJSON<any>(url);
        return mapPerson(raw, IMAGE_BASE);
      } catch {
        return null;
      }
    },

    async getFilteredCredits(actorId: number): Promise<Title[]> {
      const data = await fetchJSON<{ cast: any[] }>(
        `${BASE}/person/${actorId}/movie_credits?${withKeyLang()}`
      );
      return data.cast
        .filter((c) => (c.popularity ?? 0) >= 2)
        .map((c) => ({
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

    // 3) Persone popolari (fallback per distractors facce)
    async getPopularPeople(page = 1): Promise<Actor[]> {
      const url = `${BASE}/person/popular?${withKeyLang({ page })}`;
      const data = await fetchJSON<{ results: any[] }>(url);
      return (data.results ?? []).map((p) => mapPerson(p, IMAGE_BASE));
    },

    // async getSimilar(t: Title, limit: number): Promise<Title[]> {
    //   const data = await fetchJSON<{ results: any[] }>(
    //     `${BASE}/${t.medium}/${t.id}/similar?${withKeyLang()}`
    //   );
    //   return data.results.slice(0, limit).map((c) => ({
    //     id: c.id,
    //     name: c.title || c.name,
    //     original_language: c.original_language,
    //     medium: t.medium,
    //     year: (c.release_date || c.first_air_date || "").slice(0, 4)
    //       ? parseInt((c.release_date || c.first_air_date).slice(0, 4))
    //       : undefined,
    //     genres: c.genre_ids ?? [],
    //     popularity: c.popularity,
    //   }));
    // },

    async getSimilar(t: Title, limit: number): Promise<Title[]> {
      const url =
        t.medium === "movie"
          ? `${BASE}/movie/${t.id}/similar?${withKeyLang()}`
          : `${BASE}/tv/${t.id}/similar?${withKeyLang()}`;
      const data = await fetchJSON<{ results: any[] }>(url);
      const mapped = (data.results ?? []).map((r) =>
        mapTitle(r, t.medium, IMAGE_BASE)
      );
      return mapped.slice(0, limit);
    },

    async getTitleDetails(id: number, medium: Medium): Promise<Title | null> {
      const url =
        medium === "movie"
          ? `${BASE}/movie/${id}?${withKeyLang()}`
          : `${BASE}/tv/${id}?${withKeyLang()}`;
      try {
        const raw = await fetchJSON<any>(url);
        return mapTitle(raw, medium, IMAGE_BASE);
      } catch {
        return null;
      }
    },

    // async getRecommendations(t: Title, limit: number): Promise<Title[]> {
    //   const data = await fetchJSON<{ results: any[] }>(
    //     `${BASE}/${t.medium}/${t.id}/recommendations?${withKeyLang()}`
    //   );
    //   return data.results.slice(0, limit).map((c) => ({
    //     id: c.id,
    //     name: c.title || c.name,
    //     original_language: c.original_language,
    //     medium: t.medium,
    //     year: (c.release_date || c.first_air_date || "").slice(0, 4)
    //       ? parseInt((c.release_date || c.first_air_date).slice(0, 4))
    //       : undefined,
    //     genres: c.genre_ids ?? [],
    //     popularity: c.popularity,
    //   }));
    // },

    // 6) Recommendations
    async getRecommendations(t: Title, limit: number): Promise<Title[]> {
      const url =
        t.medium === "movie"
          ? `${BASE}/movie/${t.id}/recommendations?${withKeyLang()}`
          : `${BASE}/tv/${t.id}/recommendations?${withKeyLang()}`;
      const data = await fetchJSON<{ results: any[] }>(url);
      const mapped = (data.results ?? []).map((r) =>
        mapTitle(r, t.medium, IMAGE_BASE)
      );
      return mapped.slice(0, limit);
    },
    // 7) Top cast (only IDs)
    async getTopCast(
      titleId: number,
      medium: Medium,
      limit = 10
    ): Promise<number[]> {
      const url =
        medium === "movie"
          ? `${BASE}/movie/${titleId}/credits?${withKeyLang()}`
          : `${BASE}/tv/${titleId}/credits?${withKeyLang()}`;
      const data = await fetchJSON<{ cast: any[] }>(url);
      return (data.cast ?? [])
        .slice(0, limit)
        .map((c) => Number(c.id))
        .filter(Boolean);
    },

    async getCastDetailed(
      titleId: number,
      medium: Medium,
      limit = 12
    ): Promise<Actor[]> {
      const url =
        medium === "movie"
          ? `${BASE}/movie/${titleId}/credits?${withKeyLang()}`
          : `${BASE}/tv/${titleId}/credits?${withKeyLang()}`;
      const data = await fetchJSON<{ cast: any[] }>(url);
      const cast = (data.cast ?? [])
        .filter((c) => !!c.profile_path)
        .slice(0, limit)
        .map((c) => mapPerson(c, IMAGE_BASE));
      return cast;
    },

    // 9) Discover per genere & decade (fallback/varietà)
    async searchByGenreAndDecade(
      genres: number[],
      medium: Medium,
      year?: number,
      limit = 20
    ): Promise<Title[]> {
      // decade boundaries
      const baseYear = year ?? 2000;
      const decadeStart = Math.floor(baseYear / 10) * 10;
      const decadeEnd = decadeStart + 9;

      const common = {
        with_genres: genres.length ? genres.join(",") : undefined,
        sort_by: "popularity.desc",
        "vote_count.gte": 50, // qualità minima
        page: 1,
      };

      let url: string;
      if (medium === "movie") {
        url = `${BASE}/discover/movie?${withKeyLang({
          ...common,
          "primary_release_date.gte": `${decadeStart}-01-01`,
          "primary_release_date.lte": `${decadeEnd}-12-31`,
        })}`;
      } else {
        url = `${BASE}/discover/tv?${withKeyLang({
          ...common,
          "first_air_date.gte": `${decadeStart}-01-01`,
          "first_air_date.lte": `${decadeEnd}-12-31`,
        })}`;
      }

      const data = await fetchJSON<{ results: any[] }>(url);
      const mapped = (data.results ?? []).map((r) =>
        mapTitle(r, medium, IMAGE_BASE)
      );
      return mapped.slice(0, limit);
    },
  };
}
