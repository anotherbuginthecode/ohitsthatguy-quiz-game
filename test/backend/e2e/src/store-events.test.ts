import { describe, it, expect } from "vitest";
import { request, TEST_ORIGIN } from "./helpers/client";

// A fixed test session ID — valid RFC 4122 UUID (version 4, variant a).
// Clearly labelled so test events are easy to identify and purge from
// the events collection if needed.
const TEST_SESSION_ID = "e2e00000-0000-4000-a000-000000000001";

const validPayload = () => ({
  sessionid: TEST_SESSION_ID,
  event: "e2e_test_event",
  props: {
    source: "e2e",
    timestamp: new Date().toISOString(),
  },
});

describe("POST /api/store/events", () => {
  describe("happy path", () => {
    it("returns 200 with status success for a valid payload", async () => {
      const { status, body } = await request<any>("/api/store/events", {
        method: "POST",
        body: validPayload(),
      });

      expect(status).toBe(200);
      expect(body.status).toBe("success");
    });

    it("accepts a payload without optional props field", async () => {
      const { status, body } = await request<any>("/api/store/events", {
        method: "POST",
        body: {
          sessionid: TEST_SESSION_ID,
          event: "e2e_test_minimal",
        },
      });

      expect(status).toBe(200);
      expect(body.status).toBe("success");
    });

    it("returns CORS allow-origin header for an allowed origin", async () => {
      const { headers } = await request("/api/store/events", {
        method: "POST",
        body: validPayload(),
        origin: TEST_ORIGIN,
      });

      expect(headers.get("access-control-allow-origin")).toBe(TEST_ORIGIN);
      expect(headers.get("access-control-allow-credentials")).toBe("true");
    });
  });

  describe("validation errors", () => {
    it("returns 400 when body is missing", async () => {
      const { status, body } = await request<any>("/api/store/events", {
        method: "POST",
        body: undefined,
      });

      expect(status).toBe(400);
      expect(body.status).toBe("error");
    });

    it("returns 400 when sessionid is missing", async () => {
      const { status, body } = await request<any>("/api/store/events", {
        method: "POST",
        body: { event: "e2e_test" },
      });

      expect(status).toBe(400);
      expect(body.status).toBe("error");
    });

    it("returns 400 when sessionid is not a valid UUID", async () => {
      const { status, body } = await request<any>("/api/store/events", {
        method: "POST",
        body: { sessionid: "not-a-uuid", event: "e2e_test" },
      });

      expect(status).toBe(400);
      expect(body.status).toBe("error");
    });

    it("returns 400 when event name is missing", async () => {
      const { status, body } = await request<any>("/api/store/events", {
        method: "POST",
        body: { sessionid: TEST_SESSION_ID },
      });

      expect(status).toBe(400);
      expect(body.status).toBe("error");
    });

    it("does not leak Zod schema internals in validation error response", async () => {
      const { body } = await request<any>("/api/store/events", {
        method: "POST",
        body: { sessionid: "bad-uuid", event: "e2e_test" },
      });

      // The message must be a plain string, not an array of Zod issue objects
      expect(typeof body.message).toBe("string");
      expect(Array.isArray(body.message)).toBe(false);
    });
  });

  describe("method guard", () => {
    // The route is POST /api/store/events — API Gateway rejects other methods
    // at the routing layer with 404 before the Lambda is invoked.

    it("rejects GET", async () => {
      const { status } = await request<any>("/api/store/events");
      expect(status).toBe(404);
    });

    it("rejects PUT", async () => {
      const { status } = await request("/api/store/events", {
        method: "PUT",
        body: validPayload(),
      });

      expect(status).toBe(404);
    });

    it("rejects DELETE", async () => {
      const { status } = await request("/api/store/events", { method: "DELETE" });
      expect(status).toBe(404);
    });
  });
});
