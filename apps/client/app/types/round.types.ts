export type Round = {
  actor: {
    tmdb_id: number;
    name: string;
    image: string;
  };
  correctId: number;
  choices: {
    id: number;
    name: string;
    original_language: string;
    medium: string;
    year: number;
    genres: number[];
    popularity: number;
  }[];
  meta: {
    totalTime: number;
    mode: string;
  };
};


export type ClassicRound =
  | ActorToMovieRound
  | MovieToActorRound
  | PopularityRound
  | ActorInMovieTFRound;

export type ActorToMovieRound = {
  type: "ACTOR_TO_MOVIE";
  difficulty: "easy" | "hard";
  timeLimitSec: number;
  actor: {
    tmdb_id: number;
    name: string;
    image: string;
    popularity: number | null;
  };
  choices: Array<{
    id: number;
    name: string;
    original_language: string;
    medium: string;
    year: number;
    genres: number[];
    popularity: number;
    posterUrl?: string;
  }>;
  correctId: number;
};

export type MovieToActorRound = {
  type: "MOVIE_TO_ACTOR";
  difficulty: "easy" | "hard";
  timeLimitSec: number;
  title: {
    id: number;
    name: string;
    original_language: string;
    medium: string;
    year: number;
    genres: number[];
    popularity: number;
  };
  choices: Array<{
    tmdb_id: number;
    name: string;
    popularity: number;
    image: string;
  }>;
  correctId: number;
};

export type PopularityRound = {
  type: "POPULARITY";
  difficulty: "easy" | "hard";
  timeLimitSec: number;
  left: {
    tmdb_id: number;
    name: string;
    image: string;
    popularity: number | null;
  };
  right: {
    tmdb_id: number;
    name: string;
    image: string;
    popularity: number | null;
  };
  correctAnswer: "LOWER" | "HIGHER";
  popularityDelta: number | null;
};

export type ActorInMovieTFRound = {
  type: "ACTOR_IN_MOVIE_TF";
  difficulty: "easy" | "hard";
  timeLimitSec: number;
  actor: {
    tmdb_id: number;
    name: string;
    image: string;
    popularity: number | null;
  };
  title: {
    id: number;
    name: string;
    original_language: string;
    medium: string;
    year: number;
    genres: number[];
    popularity: number;
  };
  correctAnswer: "YES" | "NO";
};
