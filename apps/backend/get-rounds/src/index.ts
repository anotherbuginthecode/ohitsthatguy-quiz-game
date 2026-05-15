import "dotenv/config";

import {
  Context,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { getMongoClient } from "./db/mongoClient";
import { Round, RoundDocument } from "./types";

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.ohitsthatguy.xyz",
    "https://ohitsthatguy.xyz",
  ];
  const origin =
    event.headers?.origin ||
    event.headers?.Origin ||
    event.headers?.referer ||
    event.headers?.Referer ||
    "";
  const corsOrigin = allowedOrigins.find((o) => origin.startsWith(o)) || "";

  if (!process.env.API_KEY || event.headers?.["x-api-key"] !== process.env.API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ status: "error", message: "Unauthorized" }),
    };
  }

  const method = event.requestContext?.http?.method;
  if (method !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ status: "error", message: "Method Not Allowed" }),
    };
  }

  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("rounds");

    const rounds = await collection
      .aggregate([{ $sample: { size: 6 } }]) // 5 rounds + 1 extra for second chance
      .toArray();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin",
      },
      body: JSON.stringify({
        status: "success",
        data: {
          rounds: rounds.slice(0, 5) as RoundDocument[],
          second_chance: rounds[5] as RoundDocument,
        },
      }),
    };
  } catch (err) {
    console.error("Unhandled error in get-rounds:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ status: "error", message: "Internal server error" }),
    };
  }
};
