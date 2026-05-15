// domain/game/roundBuilder.ts
import {
  Round,
  Difficulty,
  ActorToMovieRound,
  MovieToActorRound,
  PopularityRound,
  ActorInMovieTFRound,
} from "./game.types";

import { Actor, Title } from "@/tmdb/tmdb.types";

import { DataAPI } from "@/tmdb/tmdb.interface";
import {
  weightTitle,
  sampleWeighted,
  plausibilityScore,
  pickTopTitles,
  pickFromRemainder,
} from "./game.utils";

// --- A) ACTOR → MOVIE (3 opzioni, 1 corretta) ---
export async function buildActorToMovie(
  api: DataAPI,
  actor: Actor,
  difficulty: Difficulty,
  usedTitleIds: Set<number>,
  timeLimitSec = 10,
  globalTitlesPool: Title[] = []
): Promise<ActorToMovieRound> {
  const credits = (await api.getFilteredCredits(actor.tmdb_id)).filter(
    (t) =>
      !usedTitleIds.has(t.id) &&
      ["en", "it"].includes(t.original_language ?? "en")
  );

  if (!credits.length) throw new Error("No credits for actor " + actor.name);

  const correctPool =
    difficulty === "easy"
      ? pickTopTitles(credits, 10)
      : pickFromRemainder(credits, 10);
  const correct = correctPool.length
    ? sampleWeighted(correctPool, weightTitle)
    : sampleWeighted(credits, weightTitle);

  // Distractors dalla sfera del titolo corretto
  const pool: Title[] = [];
  const pushUnique = (arr: Title[]) => {
    for (const x of arr)
      if (x.id !== correct.id && !pool.some((p) => p.id === x.id)) pool.push(x);
  };
  pushUnique(await api.getSimilar(correct, 10));
  pushUnique(await api.getRecommendations(correct, 10));

  // Filtra titoli in cui l'attore NON recita
  const candidates: Title[] = [];
  for (const t of pool) {
    if (t.medium !== correct.medium) continue;
    const castIds = await api.getTopCast(t.id, t.medium, 10);
    if (!castIds.includes(actor.tmdb_id)) candidates.push(t);
  }

  // Ordina per plausibilità
  candidates.sort(
    (a, b) => plausibilityScore(correct, b) - plausibilityScore(correct, a)
  );
  let distractors = candidates.slice(0, 2);

  // Fallback se non bastano
  if (distractors.length < 2) {
    const safeDistractors = globalTitlesPool.filter(
      (t) => t.id !== correct.id && !usedTitleIds.has(t.id)
    );
    distractors = [
      ...distractors,
      ...safeDistractors.slice(0, 2 - distractors.length),
    ];
  }

  const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
  choices.forEach((c) => usedTitleIds.add(c.id));

  return {
    type: "ACTOR_TO_MOVIE",
    difficulty,
    timeLimitSec,
    actor,
    choices,
    correctId: correct.id,
  };
}

// --- B) MOVIE → ACTOR (3 facce, 1 corretta) ---
export async function buildMovieToActor(
  api: DataAPI,
  title: Title,
  difficulty: Difficulty,
  usedActorIds: Set<number>,
  timeLimitSec = 10
): Promise<MovieToActorRound> {
  // Attori del film
  const cast = await api.getCastDetailed(title.id, title.medium, 12);
  const topCast = cast.filter((p) => p.image).slice(0, 6); // miglior compromesso visivo

  if (topCast.length < 1) throw new Error("No cast for title " + title.name);

  // Corretto
  const correct =
    topCast.find((p) => !usedActorIds.has(p.tmdb_id)) ?? topCast[0];

  // Distractors: attori popolari di film simili/recommendations che NON sono nel cast del titolo
  const similarTitles = [
    ...(await api.getSimilar(title, 5)),
    ...(await api.getRecommendations(title, 5)),
  ];

  const distractorPool: Actor[] = [];
  for (const t of similarTitles) {
    const scast = await api.getCastDetailed(t.id, t.medium, 8);
    scast.forEach((p) => {
      if (
        !topCast.some((c) => c.tmdb_id === p.tmdb_id) &&
        !distractorPool.some((x) => x.tmdb_id === p.tmdb_id) &&
        p.image
      ) {
        distractorPool.push(p);
      }
    });
    if (distractorPool.length >= 10) break;
  }

  // Ordina distrattori per popolarità (per qualità immagini e riconoscibilità)
  distractorPool.sort((a, b) => b.popularity - a.popularity);
  const distractors =
    distractorPool.slice(0, 2).length >= 2
      ? distractorPool.slice(0, 2)
      : (await api.getPopularPeople(1))
          .filter((p) => !topCast.some((c) => c.tmdb_id === p.tmdb_id))
          .slice(0, 2);

  const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
  choices.forEach((c) => usedActorIds.add(c.tmdb_id));

  return {
    type: "MOVIE_TO_ACTOR",
    difficulty,
    timeLimitSec,
    title,
    choices,
    correctId: correct.tmdb_id,
  };
}

// --- C) POPULARITY (Higher / Lower / Same) ---
export function buildPopularityRound(
  left: Actor,
  right: Actor,
  timeLimitSec = 10
): PopularityRound {
  const delta = left.popularity - right.popularity;
  const abs = Math.abs(delta);

  let correct: "HIGHER" | "LOWER" | "SAME";
  if (abs < 0.5) correct = "SAME"; // soglia per non rendere trivial
  else if (delta > 0) correct = "HIGHER";
  else correct = "LOWER";

  return {
    type: "POPULARITY",
    difficulty: abs < 1 ? "hard" : "easy", // “vicini” è più difficile
    timeLimitSec,
    left,
    right,
    correctAnswer: correct,
    popularityDelta: delta,
  };
}

// --- D) TRUE/FALSE: ACTOR IN MOVIE ---
/**
 * Builds a True/False round for the "Actor in Movie" quiz game.
 *
 * This function randomly generates a round where the player must determine if a given actor
 * appeared in a specified movie title. The round is generated with a 50% chance of being a "YES"
 * (the actor is in the movie) or "NO" (the actor is not in the movie) question. It ensures the
 * pairing is valid by checking the movie's cast list. If the pairing is invalid, an error is thrown.
 *
 * @param api - The data API used to fetch cast information.
 * @param actor - The actor to be checked against the movie title.
 * @param title - The movie title to check for the actor's appearance.
 * @param timeLimitSec - Optional time limit for the round in seconds (default is 10).
 * @returns A promise that resolves to an `ActorInMovieTFRound` object representing the round.
 * @throws If the provided actor-title pair does not match the intended "YES" or "NO" scenario.
 */
export async function buildActorInMovieTF(
  api: DataAPI,
  actor: Actor,
  title: Title,
  timeLimitSec = 10
): Promise<ActorInMovieTFRound> {
  // 50% YES, 50% NO
  const isYes = Math.random() < 0.5;

  if (isYes) {
    // Assicurati che l’attore sia davvero nel cast del titolo
    const castIds = await api.getTopCast(title.id, title.medium, 20);
    const yes = castIds.includes(actor.tmdb_id);
    // Se non lo è, cerca un titolo dove l’attore è effettivamente nel cast
    if (!yes) {
      // Trova tutti i titoli in cui l'attore ha recitato
      const credits = await api.getFilteredCredits(actor.tmdb_id);
      // Scegli un titolo casuale tra quelli disponibili
      const validTitles = credits.filter((t) => {
        // Solo titoli con lingua supportata
        return ["en", "it"].includes(t.original_language ?? "en");
      });
      if (!validTitles.length)
        throw new Error("No valid titles found for actor");
      const newTitle =
        validTitles[Math.floor(Math.random() * validTitles.length)];
      // Verifica che l'attore sia effettivamente nel cast del nuovo titolo
      const newCastIds = await api.getTopCast(newTitle.id, newTitle.medium, 20);
      if (newCastIds.includes(actor.tmdb_id)) {
        return {
          type: "ACTOR_IN_MOVIE_TF",
          difficulty: "easy",
          timeLimitSec,
          actor,
          title: newTitle,
          correctAnswer: "YES",
        };
      }
      throw new Error(
        `Cannot build YES round: actor ${actor.tmdb_id} not found in fallback title ${newTitle.id}`
      );
    }
    return {
      type: "ACTOR_IN_MOVIE_TF",
      difficulty: "easy",
      timeLimitSec,
      actor,
      title,
      correctAnswer: "YES",
    };
  } else {
    // Assicurati che NON sia nel cast, e che il pairing sia plausibile (stesso genere/decade/medium)
    const castIds = await api.getTopCast(title.id, title.medium, 20);
    // If the actor is actually in the movie, retry with a different title where the actor is not in the cast
    if (castIds.includes(actor.tmdb_id)) {
      // Find titles where the actor is NOT in the cast, but are plausible (same medium/language)
      const credits = await api.getFilteredCredits(actor.tmdb_id);
      // Collect plausible titles not featuring the actor
      const plausibleTitles = credits
        .filter(
          (t) =>
            t.medium === title.medium &&
            ["en", "it"].includes(t.original_language ?? "en")
        )
        .map((t) => t.id);

      // Fetch a pool of similar/recommended titles to the original, excluding those the actor is in
      const similarTitles = [
        ...(await api.getSimilar(title, 10)),
        ...(await api.getRecommendations(title, 10)),
      ].filter(
        (t) =>
          t.medium === title.medium &&
          ["en", "it"].includes(t.original_language ?? "en") &&
          !plausibleTitles.includes(t.id)
      );

      // Try to find a title where the actor is not in the cast
      for (const candidate of similarTitles) {
        const candidateCastIds = await api.getTopCast(
          candidate.id,
          candidate.medium,
          20
        );
        if (!candidateCastIds.includes(actor.tmdb_id)) {
          // Return the round with the new title
          return {
            type: "ACTOR_IN_MOVIE_TF",
            difficulty: "hard",
            timeLimitSec,
            actor,
            title: candidate,
            correctAnswer: "NO",
          };
        }
      }
      throw new Error(
        "Could not find a plausible NO pairing for actor and title"
      );
    }
    return {
      type: "ACTOR_IN_MOVIE_TF",
      difficulty: "hard",
      timeLimitSec,
      actor,
      title,
      correctAnswer: "NO",
    };
  }
}
