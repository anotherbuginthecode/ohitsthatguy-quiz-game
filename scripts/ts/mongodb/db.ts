import "dotenv/config";

import { MongoClient } from "mongodb";
let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    console.log("🔌 Connecting to MongoDB Atlas...");
    const uri = (process.env.MONGODB_URI || "").trim();
    client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
  }
  return client;
}
