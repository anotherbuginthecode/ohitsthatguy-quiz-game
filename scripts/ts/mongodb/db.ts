import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "";
if (!uri) throw new Error("MONGODB_URI not defined");

export const client = new MongoClient(uri);

export async function connectDB() {
  if (!client.topology?.isConnected()) {
    await client.connect();
  }
  return client.db(process.env.DB_NAME || "ohitsthatguy");
}
