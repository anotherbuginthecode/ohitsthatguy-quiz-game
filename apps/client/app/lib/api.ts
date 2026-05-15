import { mockClassicGame } from "./mock";

const BASE_URL = (import.meta.env.VITE_APP_API_URL as string).replace(/\/$/, "");

// In dev, requests go directly to API Gateway and must carry the key.
// In production, CloudFront injects the key server-side — never set in the prod bundle.
function devHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (import.meta.env.DEV && import.meta.env.VITE_APP_API_KEY) {
    h["x-api-key"] = import.meta.env.VITE_APP_API_KEY as string;
  }
  return h;
}

export async function fetchData(endpoint: string) {
  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: devHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function postData(endpoint: string, data: any) {
  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: devHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchClassicGameset() {
  if (import.meta.env.DEV) {
    console.log("Using mock classic game data");
    return Promise.resolve(mockClassicGame);
  }
  return fetchData("api/gameset?mode=classic");
}

export async function fetchStandardGameset() {
  return fetchData("api/gameset?mode=standard");
}
