import { getMongoClient } from "../client";
import { GameRoundsSetWithSignatures } from "@/domain/game/game.types";
import { Document, ObjectId } from "mongodb";

export async function addGameSet(
  data: GameRoundsSetWithSignatures
): Promise<Document> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("gamesets");
  return collection.insertOne(data);
}

export async function addMultipleGameSets(
  data: GameRoundsSetWithSignatures[]
): Promise<Document[]> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("gamesets");
  const result = await collection.insertMany(data);
  return Object.values(result.insertedIds).map((id) => ({ _id: id }));
}

export async function getGameSetById(id: string): Promise<Document | null> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("gamesets");
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function getAllGameSets(): Promise<Document[]> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("gamesets");
  return collection.find({}).toArray();
}

export async function deleteGameSetById(id: string): Promise<boolean> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("gamesets");
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function updateGameSetById(
  id: string,
  data: Partial<Document>
): Promise<boolean> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("gamesets");
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );
  return result.modifiedCount === 1;
}
