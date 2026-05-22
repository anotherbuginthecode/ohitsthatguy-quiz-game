import { describe, it, expect } from "vitest";
import { request, TEST_ORIGIN } from "./helpers/client";

describe("GET /api/rounds", () => {
  it("returns 200 with status success", async () => {
    const { status, body } = await request<any>("/api/rounds");

    expect(status).toBe(200);
    expect(body.status).toBe("success");
  });

  it("returns exactly 5 rounds and a second_chance round", async () => {
    const { body } = await request<any>("/api/rounds");

    expect(Array.isArray(body.data.rounds)).toBe(true);
    expect(body.data.rounds).toHaveLength(5);
    expect(body.data.second_chance).toBeDefined();
    expect(typeof body.data.second_chance).toBe("object");
  });

  it("each round has the expected shape", async () => {
    const { body } = await request<any>("/api/rounds");

    for (const round of body.data.rounds) {
      expect(round.actor).toBeDefined();
      expect(typeof round.actor.tmdb_id).toBe("number");
      expect(typeof round.actor.name).toBe("string");
      expect(typeof round.actor.image).toBe("string");
      expect(typeof round.correctId).toBe("number");
      expect(Array.isArray(round.choices)).toBe(true);
      expect(round.choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("correct answer is among the choices for each round", async () => {
    const { body } = await request<any>("/api/rounds");

    for (const round of body.data.rounds) {
      const choiceIds = round.choices.map((c: any) => c.id);
      expect(choiceIds).toContain(round.correctId);
    }
  });

  it("returns CORS allow-origin header for an allowed origin", async () => {
    const { headers } = await request("/api/rounds", { origin: TEST_ORIGIN });

    expect(headers.get("access-control-allow-origin")).toBe(TEST_ORIGIN);
    expect(headers.get("access-control-allow-credentials")).toBe("true");
  });

  // Route is GET /api/rounds — API Gateway rejects other methods with 404.

  it("rejects POST", async () => {
    const { status } = await request<any>("/api/rounds", {
      method: "POST",
      body: {},
    });

    expect(status).toBe(404);
  });

  it("rejects DELETE", async () => {
    const { status } = await request("/api/rounds", { method: "DELETE" });
    expect(status).toBe(404);
  });
});
