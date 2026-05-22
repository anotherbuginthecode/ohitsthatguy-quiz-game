import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

if (!process.env.API_URL) {
  throw new Error(
    "API_URL is not set. Copy .env.example to .env and set the deployed API Gateway URL."
  );
}
