export type Medium = "movie";
export type Title = {
  id: number;
  name: string; // display name EN/IT
  original_language: string;
  medium: Medium;
  year?: number;
  genres: number[];
  popularity: number;
};

export type Actor = { tmdb_id: number; name: string; image: string };
