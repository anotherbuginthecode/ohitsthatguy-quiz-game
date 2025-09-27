import { Actor, Title, Medium } from "@/tmdb/tmdb.types";
import { DataAPI } from "@/tmdb/tmdb.interface";
import { tmdbApi } from "@/tmdb/tmdb";
import { Round, RoundsObject } from "./rounds.types";

// Rules for generating a question (round) given an actor:
// - choose a "correct" title from their credits
// - choose 2 "distractor" titles similar to the correct one but in which the actor is not present
// - return a question with 3 choices (1 correct + 2 distractors) shuffled
// - exclude titles already used previously
// - weigh the selection of the correct title by popularity + decade
// - weigh the selection of distractors by plausibility (same medium, close decade, overlapping genres)
// - exclude titles already used previously

const recencyBoost = (year?: number) => {
  if (!year) return 1;
  const decade = Math.floor(year / 10) * 10;
  return decade >= 2010 ? 1.2 : decade >= 2000 ? 1.1 : 1.0;
};

const weight = (t: Title) => t.popularity * recencyBoost(t.year);

function sampleWeighted<T>(items: T[], w: (x: T) => number): T {
  const total = items.reduce((s, it) => s + w(it), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= w(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function plausibilityScore(a: Title, b: Title): number {
  // stessa tipologia + decade vicina + genere sovrapposto
  const type = a.medium === b.medium ? 1 : 0;
  const decade =
    a.year && b.year ? (Math.abs(a.year - b.year) <= 10 ? 1 : 0) : 0.5;
  const genreOverlap = a.genres.filter((g) => b.genres.includes(g)).length;
  return type * 2 + decade + genreOverlap * 0.3;
}

async function notInCast(api: DataAPI, actorId: number, t: Title) {
  const cast = await api.getTopCast(t.id, t.medium);
  return !cast.includes(actorId);
}

/**
 * Builds a quiz question for a given actor by selecting a correct title and plausible distractors.
 *
 * The function performs the following steps:
 * 1. Selects a correct title from the actor's credits, excluding already used titles.
 * 2. Gathers a pool of candidate distractor titles using similarity and recommendation APIs.
 * 3. Filters and scores candidates based on medium, language, and cast membership.
 * 4. Chooses the top 2 distractors, with fallback logic if not enough candidates are found.
 * 5. Shuffles the choices and returns the question data.
 *
 * @param api - The data API used to fetch credits, recommendations, and other title information.
 * @param actor - The actor for whom the question is being built.
 * @param usedTitleIds - A set of title IDs that have already been used and should be excluded.
 * @returns An object containing the actor, the correct title ID, shuffled choices, and metadata about the round.
 * @throws If no available credits are found for the actor.
 */
export async function generateRound(
  api: DataAPI,
  actor: Actor,
  usedTitleIds: Set<number>
) {
  // 1) titolo corretto
  const credits = (await api.getFilteredCredits(actor.tmdb_id)).filter(
    (t) => !usedTitleIds.has(t.id)
  );
  if (credits.length === 0) throw new Error("No credits available");

  const correct = sampleWeighted(credits, weight);

  // 2) candidati distractor
  const pool: Title[] = [];
  const pushUnique = (arr: Title[]) => {
    for (const x of arr)
      if (x.id !== correct.id && !pool.some((p) => p.id === x.id)) pool.push(x);
  };

  pushUnique(await api.getSimilar(correct, 10));
  pushUnique(await api.getRecommendations(correct, 10));

  // fallback: stesso medium + genere/decade da tutto il catalogo (metti un tuo index/cache)
  // pushUnique(await api.searchByGenreAndDecade(correct.genres, correct.medium, correct.year));

  // 3) filtri + scoring
  const candidates: { t: Title; score: number }[] = [];
  for (const c of pool) {
    if (c.medium !== correct.medium) continue; // no giveaway
    if (c.original_language && !["en", "it"].includes(c.original_language))
      continue;
    if (await notInCast(api, actor.tmdb_id, c)) {
      candidates.push({ t: c, score: plausibilityScore(correct, c) });
    }
  }

  // 4) scegli i 2 migliori; se pochi candidati, allarga i criteri
  candidates.sort((a, b) => b.score - a.score);
  let distractors = candidates.slice(0, 2).map((c) => c.t);

  if (distractors.length < 2) {
    // hard fallback: prendi per genere/decade globali con check notInCast
    // distractors = await fallbackDistinctors(...);
  }

  // 5) shuffle scelte
  const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);

  return {
    actor,
    correctId: correct.id,
    choices, // [{id,name,year,...} x3]
  };
}

export async function createGame(actor: Actor): Promise<RoundsObject> {
  const usedTitleIds = new Set<number>();

  const round: Round = await generateRound(tmdbApi, actor, usedTitleIds);
  round.choices.forEach((c) => usedTitleIds.add(c.id));
  return {
    ...round,
    meta: { totalTime: 90, mode: "standard" as const },
  };
}
