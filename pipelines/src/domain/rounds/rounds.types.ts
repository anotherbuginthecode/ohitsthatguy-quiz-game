import { Actor, Title } from "@/tmdb/tmdb.types";

export type Round = {
  actor: Actor;
  correctId: number;
  choices: Title[];
};

export type RoundsObject = Round & {
  meta: { totalTime: number; mode: "standard" };
};

// MongoDB document type for rounds
export type RoundsDocument = {
  _id: string; // MongoDB ObjectId as string
  createdAt: number; // timestamp
} & RoundsObject;
