import { Document } from "mongodb";

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
  createdAt: Date;
};

export type RoundDocument = Round & Document;
