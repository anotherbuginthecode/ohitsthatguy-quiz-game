import "dotenv/config";

import {
  Context,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { getMongoClient } from "./db/mongoClient";
import { GameSetDoc } from "./types";

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.ohitsthatguy.com",
    "https://ohitsthatguy.com",
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

  const mode = event.queryStringParameters?.mode;
  if (mode !== "standard" && mode !== "classic") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Invalid or missing 'mode' query parameter",
      }),
    };
  }

  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection<GameSetDoc>("gamesets");

    const gameSetDoc = await collection.findOneAndUpdate(
      { "meta.mode": mode },
      {
        $inc: { "_sys.servedCount": 1 },
        $set: { "_sys.lastServedAt": new Date() },
      },
      {
        sort: { "_sys.servedCount": 1, "_sys.createdAt": -1 },
        returnDocument: "before",
      }
    );

    if (!gameSetDoc) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({
          status: "error",
          message: "No game set found for the specified mode",
        }),
      };
    }

    const { rounds, meta } = gameSetDoc;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin",
      },
      body: JSON.stringify({
        status: "success",
        data: { rounds, meta },
      }),
    };
  } catch (err) {
    console.error("Unhandled error in get-gameset:", err);
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
