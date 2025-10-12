import { Actor, Title } from "@/tmdb/tmdb.types";
import { getAllActors } from "@/db/repositories/actors.repo";
import { createTmdbApi } from "@/tmdb/tmdb";
import {
  generateClassicChallenge,
  generateStandardGameSet,
} from "@/domain/game/game.service";
import {
  GameRoundsSet,
  GameRoundsSetWithSignatures,
} from "@/domain/game/game.types";
import { roundSignature, gameSignature } from "@/domain/game/game.utils";
import { addGameSet } from "@/infra/db/repositories/gameset.repo";
import { DataAPI } from "@/infra/tmdb/tmdb.interface";

const DEBUG = process.env.DEBUG === "1" || false;
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function collectActorsAndMovie(api: DataAPI) {
  try {
    const actors = await getAllActors();
    const popularActors: Actor[] = [];

    for (const actorDoc of actors) {
      if (!actorDoc) throw new Error("No actors found in the database");
      // Convert the MongoDB document to Actor type
      const actor: Actor = {
        tmdb_id: actorDoc.tmdb_id,
        name: actorDoc.name,
        image: actorDoc.image,
        popularity: actorDoc.popularity,
      };
      popularActors.push(actor);
    }
    //   const popularActors = await api.getPopularPeople(1);
    console.log(`🎭 Loaded ${actors.length} popular actors`);

    const titles: Title[] = [];
    // Shuffle actors array and pick 10 random actors
    const shuffledActors = [...actors].sort(() => Math.random() - 0.5);
    const randomActors = shuffledActors.slice(0, 10);
    for (const actor of randomActors) {
      // primi 10 per evitare rate-limit
      const credits = await api.getFilteredCredits(actor.tmdb_id);
      // Prendo i primi 5 titoli più popolari di ciascun attore
      credits.slice(0, 5).forEach((c) => titles.push(c));
      await sleep(200); // evitare rate-limit
    }
    console.log(
      `🎭 Actors loaded: ${popularActors.length} | 🎬 Titles loaded: ${titles.length}`
    );

    return { popularActors, titles };
  } catch (error: any) {
    console.error(error);
    // Check for MongoDB validation error and log schema rules not satisfied
    if (error.name === "ValidationError") {
      for (const field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
      }
    }
    process.exit(1);
  }
}

async function insertGameSet(game: GameRoundsSet): Promise<boolean> {
  try {
    const roundSigs = game.rounds.map(roundSignature);
    const gameSig = gameSignature("standard", game.rounds);
    const gameSetWithSigs: GameRoundsSetWithSignatures = {
      ...game,
      _sys: {
        gameSig,
        roundSigs,
        servedCount: 0,
        lastServedAt: null,
        createdAt: new Date(),
        version: 1,
      },
    };

    await addGameSet(gameSetWithSigs);

    if (DEBUG) {
      console.log("✅ GameSet inserted successfully!");
      console.log("📊 Metadata:", gameSetWithSigs.meta);
      console.log("🎮 Sample round:", gameSetWithSigs.rounds[0]);
    }

    return true;
  } catch (error: any) {
    console.error("❌ Failed to insert GameSet:", error.message);
    return false;
  }
}

async function seedingData(
  api: DataAPI,
  actors: Actor[],
  titles: Title[],
  mode: "standard" | "classic",
  TARGET_COUNT: number = 100
) {
  console.log(`\n🧩 Seeding ${mode.toUpperCase()} mode...`);
  let created = 0;
  let attempts = 0;
  const target = TARGET_COUNT;

  while (created < target && attempts < target * 4) {
    attempts++;
    const game =
      mode === "standard"
        ? await generateStandardGameSet(api, actors)
        : await generateClassicChallenge(api, actors, titles);

    const success = await insertGameSet(game);
    if (success) {
      created++;
      if (created % 10 === 0)
        console.log(`✅ ${mode}: ${created}/${target} done`);
    }

    await sleep(150); // piccolo delay tra richieste
  }

  console.log(
    `🎯 ${mode} mode completed. Created: ${created} | Attempts: ${attempts}`
  );
}

(async () => {
  const API = createTmdbApi();
  console.log("✅ TMDB client initialized");

  // Load actors and titles
  const { popularActors, titles } = await collectActorsAndMovie(API);

  // const MODES: ("standard" | "classic")[] = ["standard", "classic"];
  const MODES: ("standard" | "classic")[] = ["standard"];

  const TARGET_COUNT = 50; // numero di game set per modalità

  for (const mode of MODES) {
    await seedingData(API, popularActors, titles, mode, TARGET_COUNT);
  }

  console.log("\n🏁 Seeding process completed.");
  process.exit(0);
})();
