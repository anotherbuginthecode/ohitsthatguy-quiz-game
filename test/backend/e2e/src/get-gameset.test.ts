import { describe, it, expect } from "vitest";
import { request, TEST_ORIGIN } from "./helpers/client";

describe("GET /api/gameset", () => {
  describe("standard mode", () => {
    it("returns 200 with status success", async () => {
      const { status, body } = await request<any>("/api/gameset?mode=standard");

      expect(status).toBe(200);
      expect(body.status).toBe("success");
    });

    it("returns meta with mode standard and a totalTime", async () => {
      const { body } = await request<any>("/api/gameset?mode=standard");

      expect(body.data.meta.mode).toBe("standard");
      expect(typeof body.data.meta.totalTime).toBe("number");
      expect(body.data.meta.totalTime).toBeGreaterThan(0);
    });

    it("returns exactly 5 rounds", async () => {
      const { body } = await request<any>("/api/gameset?mode=standard");

      expect(Array.isArray(body.data.rounds)).toBe(true);
      expect(body.data.rounds).toHaveLength(5);
    });

    it("each round has the expected fields", async () => {
      const { body } = await request<any>("/api/gameset?mode=standard");

      for (const round of body.data.rounds) {
        expect(round.type).toBeDefined();
        expect(round.difficulty).toMatch(/^(easy|hard)$/);
        expect(typeof round.timeLimitSec).toBe("number");
        expect(round.actor).toBeDefined();
        expect(typeof round.actor.tmdb_id).toBe("number");
        expect(typeof round.actor.name).toBe("string");
        expect(Array.isArray(round.choices)).toBe(true);
        expect(round.choices.length).toBeGreaterThanOrEqual(2);
        expect(typeof round.correctId).toBe("number");
      }
    });

    it("correct answer is always among the choices", async () => {
      const { body } = await request<any>("/api/gameset?mode=standard");

      for (const round of body.data.rounds) {
        const choiceIds = round.choices.map((c: any) => c.id);
        expect(choiceIds).toContain(round.correctId);
      }
    });
  });

  describe("classic mode", () => {
    it("returns 200 with status success", async () => {
      const { status, body } = await request<any>("/api/gameset?mode=classic");

      expect(status).toBe(200);
      expect(body.status).toBe("success");
    });

    it("returns meta with mode classic", async () => {
      const { body } = await request<any>("/api/gameset?mode=classic");

      expect(body.data.meta.mode).toBe("classic");
      expect(typeof body.data.meta.totalTime).toBe("number");
    });

    it("returns 10 rounds (4 ACTOR_TO_MOVIE + 4 MOVIE_TO_ACTOR + 2 TF)", async () => {
      const { body } = await request<any>("/api/gameset?mode=classic");

      expect(Array.isArray(body.data.rounds)).toBe(true);
      expect(body.data.rounds).toHaveLength(10);
    });

    it("includes ACTOR_IN_MOVIE_TF rounds with YES or NO answer", async () => {
      const { body } = await request<any>("/api/gameset?mode=classic");

      const tfRounds = body.data.rounds.filter(
        (r: any) => r.type === "ACTOR_IN_MOVIE_TF"
      );
      expect(tfRounds.length).toBeGreaterThanOrEqual(1);

      for (const round of tfRounds) {
        expect(round.correctAnswer).toMatch(/^(YES|NO)$/);
        expect(round.actor).toBeDefined();
        expect(round.title).toBeDefined();
      }
    });
  });

  describe("validation", () => {
    it("returns 400 when mode is missing", async () => {
      const { status, body } = await request<any>("/api/gameset");

      expect(status).toBe(400);
      expect(body.status).toBe("error");
    });

    it("returns 400 when mode is invalid", async () => {
      const { status, body } = await request<any>("/api/gameset?mode=unknown");

      expect(status).toBe(400);
      expect(body.status).toBe("error");
    });

    it("rejects POST — API Gateway returns 404 for unmatched route method", async () => {
      // Route is GET /api/gameset; API Gateway rejects POST before Lambda is invoked.
      // The Lambda-level method-before-mode ordering (hotfix #2) is exercised only
      // by GET requests with/without a valid mode parameter.
      const { status } = await request("/api/gameset?mode=standard", {
        method: "POST",
        body: {},
      });

      expect(status).toBe(404);
    });

    it("rejects POST even with an invalid mode — route mismatch takes precedence", async () => {
      const { status } = await request("/api/gameset?mode=invalid", {
        method: "POST",
        body: {},
      });

      expect(status).toBe(404);
    });
  });

  describe("CORS", () => {
    it("returns the allow-origin header for an allowed origin", async () => {
      const { headers } = await request("/api/gameset?mode=standard", {
        origin: TEST_ORIGIN,
      });

      expect(headers.get("access-control-allow-origin")).toBe(TEST_ORIGIN);
      expect(headers.get("access-control-allow-credentials")).toBe("true");
    });

    it("returns vary: origin header", async () => {
      const { headers } = await request("/api/gameset?mode=standard", {
        origin: TEST_ORIGIN,
      });

      expect(headers.get("vary")?.toLowerCase()).toContain("origin");
    });
  });
});
