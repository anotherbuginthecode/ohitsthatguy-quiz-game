import "dotenv/config";

import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getMongoClient } from "./db/mongoClient";
import { Actor } from "./types";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB);
  const collection = db.collection("actors");

  const actors = await collection
    .aggregate([{ $sample: { size: 3 } }])
    .toArray();

  // CORS: consenti solo localhost e stesso dominio
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.ohitsthatguy.xyz",
    "https://ohitsthatguy.xyz",
  ];

  const origin =
    event.headers.origin ||
    event.headers.Origin ||
    event.headers.referer ||
    event.headers.Referer ||
    "";

  const corsOrigin = allowedOrigins.find((o) => origin.startsWith(o)) || "";

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    },
    body: JSON.stringify({
      status: "success",
      data: actors as Actor[],
    }),
  };
};
