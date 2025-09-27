import { getMongoClient } from "@/infra/db/client";

async function createActorsCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collectionName = "actors";

  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tmdb_id", "name"],
          properties: {
            tmdb_id: { bsonType: "int" },
            name: { bsonType: "string" },
            image: { bsonType: "string" },
            movies: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["tmdb_id", "original_language"],
                properties: {
                  tmdb_id: { bsonType: "int" },
                  original_language: { bsonType: "string" },
                  poster_path: { bsonType: "string" },
                  release_date: { bsonType: "string" },
                  original_title: { bsonType: "string" },
                  popularity: { bsonType: "double" },
                },
              },
            },
          },
        },
      },
    });
    console.log(`Collection '${collectionName}' created with validator ✅`);
  } else {
    console.log(`Collection '${collectionName}' already exists ✅`);
  }

  const collection = db.collection(collectionName);
  await collection.createIndex({ tmdb_id: 1 }, { unique: true });
  await client.close();
}

createActorsCollection().catch((err) => {
  console.error("Error creating collection:", err);
});
