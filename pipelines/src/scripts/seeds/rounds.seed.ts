/* Generate all possible rounds for the game using the most popular actors in the actors collection */
import { Actor } from "@/tmdb/tmdb.types";
import { getAllActors } from "@/db/repositories/actors.repo";
import { createGame } from "@/domain/rounds/rounds.service";
import { addRound } from "@/infra/db/repositories/rounds.repo";
import { RoundsObject } from "@/domain/rounds/rounds.types";

(async () => {
  try {
    const actors = await getAllActors();

    for (const actorDoc of actors) {
      if (!actorDoc) throw new Error("No actors found in the database");
      // Convert the MongoDB document to Actor type
      const actor: Actor = {
        tmdb_id: actorDoc.tmdb_id,
        name: actorDoc.name,
        image: actorDoc.image,
        // Add any other required fields for Actor schema here
        // For example, if Actor requires 'popularity' or 'birthday', add them:
        // popularity: actorDoc.popularity,
        // birthday: actorDoc.birthday,
      };

      const game: RoundsObject = await createGame(actor);
      console.debug("Generated game round:", JSON.stringify(game, null, 2));
      if (!game) throw new Error("Failed to create game round");
      // Save the generated round to the database
      await addRound(game);
      console.log("✅ Round added successfully");
    }
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
