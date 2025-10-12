import { getMongoClient } from "../client";
import { RoundsObject, RoundsDocument } from "@/domain/rounds/rounds.types";
import { Document } from "mongodb";

// Add a single round document
export async function addRound(data: RoundsObject): Promise<Document> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("rounds");
  return collection.insertOne(data);
}

// Add multiple round documents
export async function addRounds(data: RoundsObject[]): Promise<Document[]> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection("rounds");
  const result = await collection.insertMany(data);
  // Fetch the inserted documents using their insertedIds
  const insertedDocs = await collection
    .find({ _id: { $in: Object.values(result.insertedIds) } })
    .toArray();
  return insertedDocs;
}

// Get all round documents
export async function getAllRounds(): Promise<RoundsDocument[]> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection<RoundsDocument>("rounds");
  return collection.find().toArray();
}

// Get a round document by its MongoDB _id
export async function getRoundById(
  roundId: string
): Promise<RoundsDocument | null> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection<RoundsDocument>("rounds");
  return collection.findOne({ _id: roundId });
}

// Delete all round documents
export async function deleteAllRounds() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection<RoundsDocument>("rounds");
  return collection.deleteMany({});
}

// Count all round documents
export async function countRounds(): Promise<number> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection<RoundsDocument>("rounds");
  return collection.countDocuments();
}

// Drop the rounds collection
export async function dropRoundsCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection<RoundsDocument>("rounds");
  return collection.drop();
}
