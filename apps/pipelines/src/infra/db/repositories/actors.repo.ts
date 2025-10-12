import { getMongoClient } from "../client";

export async function getAllActors() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("actors");
  return collection.find().toArray();
}

export async function getActorById(actorId: number) {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("actors");
  return collection.findOne({ id: actorId });
}
