import { Actor, Title } from "@/tmdb/tmdb.types";
import { getAllActors } from "@/db/repositories/actors.repo";
import { createTmdbApi } from "@/tmdb/tmdb";
import { generateClassicChallenge } from "@/domain/game/game.service";
import { GameRoundsSetWithSignatures } from "@/domain/game/game.types";
import { roundSignature, gameSignature } from "@/domain/game/game.utils";
import { addGameSet } from "@/infra/db/repositories/gameset.repo";

const DEBUG = process.env.DEBUG === "1" || false;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function seedClassicGame(mode: "classic", target = 100) {
  try {
    const api = createTmdbApi();
    console.log("✅ TMDB client initialized");

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
      `🎭 Actors loaded: ${actors.length} | 🎬 Titles loaded: ${titles.length}`
    );

    let created = 0,
      attempts = 0;

    while (created < target && attempts < target * 3) {
      attempts++;

      const gameSet = await generateClassicChallenge(
        api,
        popularActors,
        titles
      );
      const roundSigs = gameSet.rounds.map(roundSignature);
      const gameSig = gameSignature("classic", gameSet.rounds);
      const gameSetWithSigs: GameRoundsSetWithSignatures = {
        ...gameSet,
        _sys: {
          gameSig,
          roundSigs,
          servedCount: 0,
          lastServedAt: null,
          createdAt: new Date(),
          version: 1,
        },
      };

      if (DEBUG) {
        console.log("✅ Classic Challenge generated successfully!");
        console.log("📊 Metadata:", gameSetWithSigs.meta);
        console.log("🎮 Sample round:", gameSetWithSigs.rounds[0]);

        // --- 5️⃣ Output finale (puoi salvarlo nel DB o loggarlo) ---
        console.log(JSON.stringify(gameSetWithSigs, null, 2));
        process.exit(0);
      } else {
        try {
          const result = await addGameSet(gameSetWithSigs);
          if (result.inserted) {
            created++;
            // opzionale: log progress ogni 10
            if (created % 10 === 0) {
              console.log(`[${mode}] seeded ${created}/${target}`);
            }
          }
        } catch (err: any) {
          if (err.code === 11000) {
            console.warn(
              `⚠️ Duplicate game set detected (gameSig: ${gameSig}), skipping...`
            );
          } else {
            console.error("❌ Error inserting game set:", err);
          }
        }
      }
    }
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
}

(async () => {
  await seedClassicGame("classic", 100);
})();
