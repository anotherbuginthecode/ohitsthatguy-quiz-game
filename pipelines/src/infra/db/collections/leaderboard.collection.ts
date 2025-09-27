import { getMongoClient } from "@/infra/db/client";

async function createLeaderboardCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collectionName = "leaderboard";

  // 1. Se non esiste già, creala con validator JSON Schema
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "mode", "score", "createdAt"],
          properties: {
            userId: { bsonType: "string" },
            username: { bsonType: "string" },
            mode: { enum: ["standard", "express"] },
            score: { bsonType: "int" },
            timeRemaining: { bsonType: "int" },
            streakMax: { bsonType: "int" },
            roundsCorrect: { bsonType: "int" },
            createdAt: { bsonType: "date" },
          },
        },
      },
    });
    console.log(`Collection '${collectionName}' created with validator ✅`);
  } else {
    console.log(`Collection '${collectionName}' already exists ✅`);
  }

  const collection = db.collection(collectionName);

  // 2. Indici
  await collection.createIndex({ mode: 1, score: -1, createdAt: -1 });
  await collection.createIndex({ userId: 1, score: -1, createdAt: -1 });
  await collection.createIndex({ createdAt: -1 });

  console.log("Indexes created ✅");

  await client.close();
}

createLeaderboardCollection().catch((err) => {
  console.error("Error creating collection:", err);
});
