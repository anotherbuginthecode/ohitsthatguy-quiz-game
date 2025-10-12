export type Medium = "movie";
export type Title = {
  id: number;
  name: string; // display name EN/IT
  original_language: string;
  medium: Medium;
  year?: number;
  genres: number[];
  popularity: number;
  posterUrl?: string;
};

export type Actor = {
  tmdb_id: number;
  name: string;
  image: string | undefined;
  popularity: number;
};

export type ActorWithMovies = Actor & { movies: Movie[] };

export type Movie = {
  tmdb_id: number;
  original_language: string;
  poster_path: string;
  release_date: string;
  original_title: string;
  popularity: number;
};
