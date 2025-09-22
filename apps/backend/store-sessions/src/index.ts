import "dotenv/config";

import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getMongoClient } from "./db/mongoClient";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const game_uuid = event.queryStringParameters?.game_uuid;
  if (!game_uuid) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Missing game_uuid query parameter",
      }),
    };
  }
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB);
  const collection = db.collection("sessions");

  const timestamp = new Date();
  await collection.insertOne({
    game_uuid: game_uuid,
    timestamp: timestamp,
  });

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
      message: "Session stored successfully",
    }),
  };
};
