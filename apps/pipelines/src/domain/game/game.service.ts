import { DataAPI } from "@/tmdb/tmdb.interface";
import { Round, GameRoundsSet, Difficulty } from "./game.types";
import {
  buildActorToMovie,
  buildMovieToActor,
  buildPopularityRound,
  buildActorInMovieTF,
} from "./rounds.service";
import { Actor, Title } from "@/tmdb/tmdb.types";

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export async function generateStandardGameSet(
  api: DataAPI,
  actorsPool: Actor[],
  titlesPool: Title[] = [],
  opts?: { totalTime?: number }
): Promise<GameRoundsSet> {
  // 5 round (2 easy, 3 hard) – solo actor→movie
  const usedTitleIds = new Set<number>();
  const usedActorIds = new Set<number>();
  const rounds: Round[] = [];

  for (let i = 0; i < 5; i++) {
    let actor = pick(actorsPool);
    let attempts = 0;
    while (usedActorIds.has(actor.tmdb_id) && attempts < 10) {
      actor = pick(actorsPool);
      attempts++;
    }
    usedActorIds.add(actor.tmdb_id);
    const difficulty: Difficulty = i < 2 ? "easy" : "hard";
    const r = await buildActorToMovie(
      api,
      actor,
      difficulty,
      usedTitleIds,
      10 /*time/round suggerito*/,
      titlesPool
    );
    rounds.push(r);
  }

  return {
    rounds,
    meta: { totalTime: opts?.totalTime ?? 90, mode: "standard" },
  };
}

export async function generateClassicChallenge(
  api: DataAPI,
  actorsPool: Actor[],
  titlesPool: Title[]
): Promise<GameRoundsSet> {
  const rounds: Round[] = [];
  const usedTitleIds = new Set<number>();
  const usedActorIds = new Set<number>();
  const actorToMovieActorIds = new Set<number>();

  // 4 Actor→Movie
  for (let i = 0; i < 4; i++) {
    let actor = pick(actorsPool);
    let attempts = 0;
    while (actorToMovieActorIds.has(actor.tmdb_id) && attempts < 10) {
      actor = pick(actorsPool);
      attempts++;
    }
    actorToMovieActorIds.add(actor.tmdb_id);
    const diff: Difficulty = i === 0 ? "easy" : "hard";
    rounds.push(await buildActorToMovie(api, actor, diff, usedTitleIds, 10, titlesPool));
  }

  // 4 Movie→Actor
  for (let i = 0; i < 4; i++) {
    const title = pick(titlesPool);
    const diff: Difficulty = i === 0 ? "easy" : "hard";
    rounds.push(await buildMovieToActor(api, title, diff, usedActorIds, 10));
  }

  // // 3 Popularity
  // for (let i = 0; i < 3; i++) {
  //   const a = pick(actorsPool);
  //   let b = pick(actorsPool);
  //   let tries = 0;
  //   while (b.tmdb_id === a.tmdb_id && tries++ < 5) b = pick(actorsPool);
  //   rounds.push(buildPopularityRound(a, b, 10));
  // }

  // 2 True/False
  const movieOnly = titlesPool.filter((t) => t.medium === "movie");
  for (let i = 0; i < 2; i++) {
    let tfRound = null;
    let tfAttempts = 0;
    while (!tfRound && tfAttempts < 5) {
      tfAttempts++;
      try {
        const actor = pick(actorsPool);
        const title = pick(movieOnly.length ? movieOnly : titlesPool);
        tfRound = await buildActorInMovieTF(api, actor, title, 10);
      } catch {
        // retry with a different actor/title pair
      }
    }
    if (tfRound) rounds.push(tfRound);
  }

  return { rounds, meta: { totalTime: 100, mode: "classic" } };
}
