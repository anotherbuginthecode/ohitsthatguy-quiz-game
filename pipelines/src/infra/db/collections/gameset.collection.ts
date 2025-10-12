import { getMongoClient } from "@/infra/db/client";

async function createGameSetCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collectionName = "gamesets";

  // if already exists, skip creation, drop if in dev mode
  const existing = await db.listCollections({ name: collectionName }).toArray();
  if (existing.length) {
    console.log(`Collection '${collectionName}' already exists`);
    // await db.collection(collectionName).drop();
  }

  console.log(`Creating '${collectionName}' collection...`);
  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["rounds", "meta", "_sys"],
        properties: {
          rounds: {
            bsonType: "array",
            minItems: 1,
            items: {
              bsonType: "object",
              required: ["type"],
              properties: {
                type: {
                  enum: [
                    "ACTOR_TO_MOVIE",
                    "MOVIE_TO_ACTOR",
                    "POPULARITY",
                    "ACTOR_IN_MOVIE_TF",
                  ],
                },
                actor: {
                  bsonType: ["object", "null"],
                  properties: {
                    id: { bsonType: "int" },
                    name: { bsonType: "string" },
                    profileUrl: { bsonType: ["string", "null"] },
                  },
                },
                title: {
                  bsonType: ["object", "null"],
                  properties: {
                    id: { bsonType: "int" },
                    name: { bsonType: "string" },
                    medium: { enum: ["movie", "tv"] },
                    posterUrl: { bsonType: ["string", "null"] },
                  },
                },
                left: {
                  bsonType: ["object", "null"],
                  properties: {
                    id: { bsonType: "int" },
                    name: { bsonType: "string" },
                  },
                },
                right: {
                  bsonType: ["object", "null"],
                  properties: {
                    id: { bsonType: "int" },
                    name: { bsonType: "string" },
                  },
                },
                choices: { bsonType: ["array", "null"] },
                correctId: { bsonType: ["int", "null"] },
                correctAnswer: { bsonType: ["string", "null"] },
              },
            },
          },
          meta: {
            bsonType: "object",
            required: ["mode", "totalTime"],
            properties: {
              mode: { enum: ["standard", "classic"] },
              totalTime: { bsonType: "int" },
            },
          },
          _sys: {
            bsonType: "object",
            required: ["gameSig", "roundSigs", "servedCount", "createdAt"],
            properties: {
              gameSig: { bsonType: "string" },
              roundSigs: { bsonType: "array", items: { bsonType: "string" } },
              servedCount: { bsonType: "int" },
              lastServedAt: { bsonType: ["date", "null"] },
              createdAt: { bsonType: "date" },
              version: { bsonType: "int" },
            },
          },
        },
      },
    },
  });

  const coll = db.collection(collectionName);

  // Crea indici
  await coll.createIndex({ "_sys.gameSig": 1 }, { unique: true });
  await coll.createIndex({
    "meta.mode": 1,
    "_sys.servedCount": 1,
    "_sys.createdAt": -1,
  });
  await coll.createIndex({ "_sys.createdAt": -1 });

  console.log("✅ Collection created and indexed successfully.");
  await client.close();
}

createGameSetCollection().catch((err) => {
  console.error("Error creating collection:", err);
  process.exit(1);
});
