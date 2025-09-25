import "dotenv/config";

import {
  Context,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { z } from "zod";
import { getMongoClient } from "./db/mongoClient";

export const BaseEvent = {
  sessionid: z.uuid(),
  event: z.string(),
  timestamp: z.date().default(new Date()),
  props: z.record(z.string(), z.any()).optional(),
};

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext?.http?.method;

  if (method !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        status: "error",
        message: "Method Not Allowed",
      }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Bad Request: Missing body",
      }),
    };
  }

  let parsedBody: any;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Bad Request: Invalid JSON",
      }),
    };
  }

  const validation = z.object(BaseEvent).safeParse(parsedBody);
  if (!validation.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: validation.error.issues,
      }),
    };
  }

  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB);
  const collection = db.collection("events");
  await collection.insertOne(validation.data);

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
      message: "Event stored successfully",
    }),
  };
};
