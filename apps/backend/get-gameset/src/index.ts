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
  const method = event.requestContext?.http?.method;

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

  if (method !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        status: "error",
        message: "Method Not Allowed",
      }),
    };
  }

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

  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB);
  const collection = db.collection("gamesets");

  const gameSetDoc = await db
    .collection<GameSetDoc>("gamesets")
    .find({ "meta.mode": mode })
    .sort({ "_sys.servedCount": 1, "_sys.createdAt": -1 })
    .limit(1)
    .next();

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

  // Incrementa servedCount e aggiorna lastServedAt
  await collection.updateOne(
    { "_sys.gameSig": gameSetDoc._sys.gameSig },
    {
      $inc: { "_sys.servedCount": 1 },
      $set: { "_sys.lastServedAt": new Date() },
    }
  );

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
      data: {
        rounds,
        meta,
      },
    }),
  };
};
