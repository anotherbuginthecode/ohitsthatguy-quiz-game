import { Actor, Title } from "@/tmdb/tmdb.types";

export type QuestionType =
  | "ACTOR_TO_MOVIE" // 3 titles, pick the one featuring the actor
  | "MOVIE_TO_ACTOR" // 3 faces, pick the actor in that title
  | "POPULARITY" // Higher / Lower / Same
  | "ACTOR_IN_MOVIE_TF"; // Yes / No

export type Difficulty = "easy" | "hard";

export interface BaseRound<T extends QuestionType = QuestionType> {
  type: T;
  difficulty: Difficulty;
  timeLimitSec: number;
}

export interface ActorToMovieRound extends BaseRound<"ACTOR_TO_MOVIE"> {
  actor: Actor;
  correctId: number; // title id
  choices: Title[]; // 3 titles
}

export interface MovieToActorRound extends BaseRound<"MOVIE_TO_ACTOR"> {
  title: Title;
  correctId: number; // actor tmdb_id
  choices: Actor[]; // 3 actors
}

export interface PopularityRound extends BaseRound<"POPULARITY"> {
  left: Actor;
  right: Actor;
  correctAnswer: "HIGHER" | "LOWER" | "SAME";
  popularityDelta: number; // left.popularity - right.popularity
}

export interface ActorInMovieTFRound extends BaseRound<"ACTOR_IN_MOVIE_TF"> {
  actor: Actor;
  title: Title;
  correctAnswer: "YES" | "NO";
}

export type Round =
  | ActorToMovieRound
  | MovieToActorRound
  | PopularityRound
  | ActorInMovieTFRound;

export interface GameRoundsSet {
  rounds: Round[];
  meta: {
    totalTime: number;
    mode: "standard" | "classic";
  };
}

export interface GameRoundsSetWithSignatures extends GameRoundsSet {
  _sys: {
    gameSig: string;
    roundSigs: string[];
    servedCount: number;
    lastServedAt: Date | null;
    createdAt: Date;
    version: number;
  };
}
