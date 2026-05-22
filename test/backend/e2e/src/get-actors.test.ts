import { describe, it, expect } from "vitest";
import { request, TEST_ORIGIN, BLOCKED_ORIGIN } from "./helpers/client";

describe("GET /api/actors", () => {
  it("returns 200 with status success and an array of 3 actors", async () => {
    const { status, body } = await request<any>("/api/actors");

    expect(status).toBe(200);
    expect(body.status).toBe("success");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(3);
  });

  it("each actor has the expected shape", async () => {
    const { body } = await request<any>("/api/actors");

    for (const actor of body.data) {
      expect(typeof actor.name).toBe("string");
      expect(actor.name.length).toBeGreaterThan(0);
      expect(typeof actor.tmdb_id).toBe("number");
      expect(typeof actor.image).toBe("string");
    }
  });

  it("returns CORS allow-origin header matching the request origin", async () => {
    const { headers } = await request("/api/actors", { origin: TEST_ORIGIN });

    expect(headers.get("access-control-allow-origin")).toBe(TEST_ORIGIN);
    expect(headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("returns no CORS allow-origin header for a disallowed origin", async () => {
    const { status, headers } = await request("/api/actors", {
      origin: BLOCKED_ORIGIN,
    });

    expect(status).toBe(200);
    // corsOrigin will be "" (empty string) for unknown origins
    const allowOrigin = headers.get("access-control-allow-origin") ?? "";
    expect(allowOrigin).not.toBe(BLOCKED_ORIGIN);
  });

  // Route is currently ANY /api/actors (Lambda returns 405).
  // After the infrastructure hotfix changes it to GET /api/actors,
  // API Gateway will return 404 instead — both are acceptable rejections.

  it("rejects POST", async () => {
    const { status } = await request<any>("/api/actors", {
      method: "POST",
      body: {},
    });

    expect([404, 405]).toContain(status);
  });

  it("rejects DELETE", async () => {
    const { status } = await request("/api/actors", { method: "DELETE" });
    expect([404, 405]).toContain(status);
  });
});
