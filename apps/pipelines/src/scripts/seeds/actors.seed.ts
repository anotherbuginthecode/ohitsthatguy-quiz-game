import { Actor, ActorWithMovies } from "@/tmdb/tmdb.types";
import { getAllActors, updateActor } from "@/db/repositories/actors.repo";
import { createTmdbApi } from "@/tmdb/tmdb";
import { DataAPI } from "@/infra/tmdb/tmdb.interface";

const DEBUG = process.env.DEBUG === "1" || false;
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function collectActorsAndMovie(api: DataAPI) {
  try {
    const actors = await getAllActors();
    

    for (const actorDoc of actors) {
      if (!actorDoc) throw new Error("No actors found in the database");
      const data = await api.getPerson(actorDoc.tmdb_id);
      await sleep(100); // evitare rate-limit
      const actor: ActorWithMovies = {
        tmdb_id: actorDoc.tmdb_id,
        name: actorDoc.name,
        image: actorDoc.image,
        popularity: data?.popularity || 0,
        movies: actorDoc.movies || []
      };

      if (DEBUG) {
        console.log(
          `🎭 Updating actor: ${actor.name} (TMDB ID: ${actor.tmdb_id}) with popularity ${actor.popularity}`
        );
      }else{
        console.log(`🎭 Updating actor: ${actor.name} (TMDB ID: ${actor.tmdb_id})`);
        await updateActor(actor.tmdb_id, actor);
      }
    }

  } catch (error: any) {
    console.error(error);
    // Check for MongoDB validation error and log schema rules not satisfied
    if (error.name === "ValidationError") {
      for (const field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
      }
    }
    throw error; // Re-throw the error after logging
  }
}


(async () => {
  const API = createTmdbApi();
  console.log("✅ TMDB client initialized");
  await collectActorsAndMovie(API);
 
  console.log("\n🏁 Seeding process completed.");
  process.exit(0);
})();