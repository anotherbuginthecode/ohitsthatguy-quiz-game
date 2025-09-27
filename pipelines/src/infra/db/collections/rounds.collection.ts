import { getMongoClient } from "@/infra/db/client";

async function createRoundsCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collectionName = "rounds";

  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["actor", "correctId", "choices", "meta"],
          properties: {
            actor: {
              bsonType: "object",
              required: ["tmdb_id", "name"],
              properties: {
                tmdb_id: { bsonType: "int" },
                name: { bsonType: "string" },
                image: { bsonType: "string" },
              },
            },
            correctId: { bsonType: "int" },
            choices: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: [
                  "id",
                  "name",
                  "original_language",
                  "medium",
                  "year",
                  "genres",
                ],
                properties: {
                  id: { bsonType: "int" },
                  name: { bsonType: "string" },
                  original_language: { bsonType: "string" },
                  medium: { bsonType: "string" },
                  year: { bsonType: "int" },
                  genres: {
                    bsonType: "array",
                    items: { bsonType: "int" },
                  },
                  popularity: { bsonType: "double" },
                },
              },
            },
            meta: {
              bsonType: "object",
              required: ["totalTime", "mode"],
              properties: {
                totalTime: { bsonType: "int" },
                mode: { enum: ["standard", "express"] },
              },
            },
            createdAt: { bsonType: "date", default: new Date() },
          },
        },
      },
    });
    console.log(`Collection '${collectionName}' created with validator ✅`);
  } else {
    console.log(`Collection '${collectionName}' already exists ✅`);
  }

  const collection = db.collection(collectionName);
  await collection.createIndex({ "actor.tmdb_id": 1 });
  await collection.createIndex({ correctId: 1 });
  await collection.createIndex({ "meta.mode": 1 });
  await client.close();
}

createRoundsCollection().catch((err) => {
  console.error("Error creating collection:", err);
});
