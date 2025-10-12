import { Actor } from "@/tmdb/tmdb.types";
import { getAllActors } from "@/db/repositories/actors.repo";
import { createTmdbApi } from "@/tmdb/tmdb";
import { generateStandardGameSet } from "@/domain/game/game.service";
import { GameRoundsSetWithSignatures } from "@/domain/game/game.types";
import { roundSignature, gameSignature } from "@/domain/game/game.utils";

const DEBUG = process.env.DEBUG === "1" || false;

(async () => {
  try {
    const api = createTmdbApi();

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

    // genera il primo set di round
    const game = await generateStandardGameSet(api, popularActors);
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

    // if (DEBUG) {
    //   console.log("✅ Standard Game generated successfully!");
    //   console.log("📊 Metadata:", gameSetWithSigs.meta);
    //   console.log("🎮 Sample round:", gameSetWithSigs.rounds[0]);
    // }

    // return gameSetWithSigs;

    console.log("✅ Standard Game generated successfully!");
    console.log("📊 Metadata:", gameSetWithSigs.meta);
    console.log("🎮 Sample round:", gameSetWithSigs.rounds[0]);
    process.exit(0);
  } catch (error: any) {
    console.error(error);
    // Check for MongoDB validation error and log schema rules not satisfied
    if (error?.errInfo?.details?.schemaRulesNotSatisfied) {
      console.error(
        "Schema rules not satisfied:",
        JSON.stringify(error.errInfo.details.schemaRulesNotSatisfied, null, 2)
      );
      process.exit(1);
    }
    process.exit(1);
  }
})();
