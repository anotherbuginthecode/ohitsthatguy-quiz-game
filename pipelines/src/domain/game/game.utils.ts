// domain/game/utils.ts
import { Title } from "@/tmdb/tmdb.types";
import crypto from "crypto";
import { Round } from "./game.types";

export const recencyBoost = (year?: number) => {
  if (!year) return 1;
  const decade = Math.floor(year / 10) * 10;
  return decade >= 2010 ? 1.2 : decade >= 2000 ? 1.1 : 1.0;
};

export const weightTitle = (t: Title) => t.popularity * recencyBoost(t.year);

export function sampleWeighted<T>(items: T[], w: (x: T) => number): T {
  const total = items.reduce((s, it) => s + w(it as any), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= w(it as any);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

export const plausibilityScore = (a: Title, b: Title): number => {
  const type = a.medium === b.medium ? 1 : 0;
  const decade =
    a.year && b.year ? (Math.abs(a.year - b.year) <= 10 ? 1 : 0) : 0.5;
  const genreOverlap = a.genres.filter((g) => b.genres.includes(g)).length;
  return type * 2 + decade + genreOverlap * 0.3;
};

export const pickTopTitles = (credits: Title[], k: number) =>
  [...credits].sort((a, b) => b.popularity - a.popularity).slice(0, k);

export const pickFromRemainder = (credits: Title[], topK: number) =>
  [...credits].sort((a, b) => b.popularity - a.popularity).slice(topK);

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function roundSignature(r: Round): string {
  switch (r.type) {
    case "ACTOR_TO_MOVIE": {
      const ids = r.choices.map((c) => c.id).sort((a, b) => a - b);
      return `r:ATM|a:${r.actor.tmdb_id}|t:${ids.join(",")}`;
    }
    case "MOVIE_TO_ACTOR": {
      const ids = r.choices.map((c) => c.tmdb_id).sort((a, b) => a - b);
      return `r:MTA|m:${r.title.id}|p:${ids.join(",")}`;
    }
    case "POPULARITY": {
      const a = Math.min(r.left.tmdb_id, r.right.tmdb_id);
      const b = Math.max(r.left.tmdb_id, r.right.tmdb_id);
      return `r:POP|l:${a}|r:${b}`;
    }
    case "ACTOR_IN_MOVIE_TF": {
      return `r:TF|a:${r.actor.tmdb_id}|m:${r.title.id}|ans:${r.correctAnswer}`;
    }
  }
}

export function gameSignature(
  mode: "standard" | "classic",
  rounds: Round[]
): string {
  const sigs = rounds.map(roundSignature).join("|");
  const hash = sha256(`${mode}|${sigs}`);
  return `gs:${mode}|h:${hash}`;
}
