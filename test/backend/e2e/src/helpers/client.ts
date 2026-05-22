const BASE_URL = (process.env.API_URL ?? "").replace(/\/$/, "");
export const TEST_ORIGIN = process.env.TEST_ORIGIN ?? "http://localhost:5173";
export const BLOCKED_ORIGIN = "https://evil.example.com";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** Pass null to omit the Origin header entirely. */
  origin?: string | null;
}

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Headers;
  body: T;
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, origin = TEST_ORIGIN } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (origin !== null) headers["Origin"] = origin;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let parsed: T;
  try {
    parsed = (await res.json()) as T;
  } catch {
    parsed = null as T;
  }

  return { status: res.status, headers: res.headers, body: parsed };
}
