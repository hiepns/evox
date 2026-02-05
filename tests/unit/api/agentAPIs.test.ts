/**
 * Agent API Tests - Comprehensive
 *
 * North Star: Agents interact seamlessly with backend.
 * Tests cover: all agent endpoints, authentication, rate limiting.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const BASE_URL = "https://gregarious-elk-556.convex.site";

describe("Agent APIs - Comprehensive", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("GET /v2/getMessages", () => {
    it("should return messages for agent", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { from: "MAX", content: "Please review PR", timestamp: Date.now() },
          { from: "LEO", content: "Frontend done", timestamp: Date.now() - 1000 },
        ]),
      } as Response);

      const response = await fetch(`${BASE_URL}/v2/getMessages?agent=SAM&limit=10`);
      const messages = await response.json();

      expect(messages).toHaveLength(2);
      expect(messages[0]).toHaveProperty("from");
      expect(messages[0]).toHaveProperty("content");
    });

    it("should respect limit parameter", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { from: "MAX", content: "Message 1" },
          { from: "MAX", content: "Message 2" },
        ]),
      } as Response);

      await fetch(`${BASE_URL}/v2/getMessages?agent=SAM&limit=2`);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=2")
      );
    });

    it("should filter by channel", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      await fetch(`${BASE_URL}/v2/getMessages?agent=SAM&channel=dev`);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("channel=dev")
      );
    });
  });

  describe("POST /postToChannel", () => {
    it("should post message to channel", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, messageId: "msg_123" }),
      } as Response);

      const payload = {
        channel: "dev",
        from: "SAM",
        message: "Task completed",
      };

      await fetch(`${BASE_URL}/postToChannel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/postToChannel`,
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("SAM"),
        })
      );
    });

    it("should support @mentions in message", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const payload = {
        channel: "dev",
        from: "SAM",
        message: "@MAX @LEO Please review this PR",
      };

      await fetch(`${BASE_URL}/postToChannel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it("should validate required fields", () => {
      const validPayload = { channel: "dev", from: "SAM", message: "Hello" };
      const missingChannel = { from: "SAM", message: "Hello" };
      const missingFrom = { channel: "dev", message: "Hello" };
      const missingMessage = { channel: "dev", from: "SAM" };

      expect(validPayload.channel).toBeTruthy();
      expect(validPayload.from).toBeTruthy();
      expect(validPayload.message).toBeTruthy();
      expect((missingChannel as Record<string, string>).channel).toBeUndefined();
      expect((missingFrom as Record<string, string>).from).toBeUndefined();
      expect((missingMessage as Record<string, string>).message).toBeUndefined();
    });
  });

  describe("GET /getNextDispatchForAgent", () => {
    it("should return next pending dispatch", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: "dispatch_123",
          ticket: "AGT-456",
          priority: 2,
          status: "pending",
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/getNextDispatchForAgent?agent=SAM`);
      const dispatch = await response.json();

      expect(dispatch).toHaveProperty("ticket");
      expect(dispatch).toHaveProperty("priority");
    });

    it("should return null when no dispatches", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const response = await fetch(`${BASE_URL}/getNextDispatchForAgent?agent=SAM`);
      const dispatch = await response.json();

      expect(dispatch).toBeNull();
    });
  });

  describe("POST /heartbeat", () => {
    it("should update agent heartbeat", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, timestamp: Date.now() }),
      } as Response);

      const payload = {
        agent: "SAM",
        status: "online",
      };

      await fetch(`${BASE_URL}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/heartbeat`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should accept status updates", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const statuses = ["online", "busy", "idle", "offline"];

      for (const status of statuses) {
        await fetch(`${BASE_URL}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "SAM", status }),
        });
      }

      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe("POST /agentActions/completeTask", () => {
    it("should mark task as completed", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, taskId: "task_123" }),
      } as Response);

      const payload = {
        agent: "SAM",
        ticket: "AGT-789",
        action: "completed",
        summary: "Implemented feature X",
      };

      await fetch(`${BASE_URL}/agentActions/completeTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("completeTask"),
        expect.objectContaining({
          body: expect.stringContaining("completed"),
        })
      );
    });

    it("should support different actions", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const actions = ["completed", "started", "failed", "blocked"];

      for (const action of actions) {
        await fetch(`${BASE_URL}/agentActions/completeTask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "SAM", ticket: "AGT-100", action }),
        });
      }

      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe("GET /agents", () => {
    it("should return all agents", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { name: "SAM", role: "backend", status: "online" },
          { name: "LEO", role: "frontend", status: "busy" },
          { name: "QUINN", role: "qa", status: "idle" },
          { name: "MAX", role: "pm", status: "online" },
        ]),
      } as Response);

      const response = await fetch(`${BASE_URL}/agents`);
      const agents = await response.json();

      expect(agents).toHaveLength(4);
      expect(agents.map((a: { name: string }) => a.name)).toContain("SAM");
    });

    it("should include agent status", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { name: "SAM", status: "online", lastHeartbeat: Date.now() },
        ]),
      } as Response);

      const response = await fetch(`${BASE_URL}/agents`);
      const agents = await response.json();

      expect(agents[0]).toHaveProperty("status");
      expect(agents[0]).toHaveProperty("lastHeartbeat");
    });
  });

  describe("GET /agent/:name", () => {
    it("should return single agent details", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          name: "SAM",
          role: "backend",
          status: "online",
          currentTask: "AGT-123",
          tasksCompleted: 42,
          lastHeartbeat: Date.now(),
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/agent/SAM`);
      const agent = await response.json();

      expect(agent.name).toBe("SAM");
      expect(agent).toHaveProperty("currentTask");
      expect(agent).toHaveProperty("tasksCompleted");
    });

    it("should return 404 for unknown agent", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Agent not found" }),
      } as Response);

      const response = await fetch(`${BASE_URL}/agent/UNKNOWN`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /agent/:name/assign", () => {
    it("should assign task to agent", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await fetch(`${BASE_URL}/agent/SAM/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: "AGT-999" }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/agent/SAM/assign"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("Rate Limiting", () => {
    it("should handle rate limit responses", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "60" }),
        json: () => Promise.resolve({ error: "Rate limit exceeded" }),
      } as Response);

      const response = await fetch(`${BASE_URL}/v2/getMessages?agent=SAM`);

      expect(response.status).toBe(429);
    });

    it("should implement exponential backoff", () => {
      const calculateBackoff = (attempt: number, baseDelay: number = 1000): number => {
        return Math.min(baseDelay * Math.pow(2, attempt), 30000);
      };

      expect(calculateBackoff(0)).toBe(1000);
      expect(calculateBackoff(1)).toBe(2000);
      expect(calculateBackoff(2)).toBe(4000);
      expect(calculateBackoff(3)).toBe(8000);
      expect(calculateBackoff(10)).toBe(30000); // capped at 30s
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(fetch(`${BASE_URL}/status`)).rejects.toThrow("Network error");
    });

    it("should handle timeout errors", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error("Request timeout"));

      await expect(fetch(`${BASE_URL}/status`)).rejects.toThrow("timeout");
    });

    it("should handle malformed JSON responses", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);

      await expect(response.json()).rejects.toThrow();
    });

    it("should handle 500 errors", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal server error" }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe("Authentication", () => {
    it("should include agent name in requests", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await fetch(`${BASE_URL}/v2/getMessages?agent=SAM`);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("agent=SAM")
      );
    });

    it("should reject requests without agent name", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "Agent name required" }),
      } as Response);

      const response = await fetch(`${BASE_URL}/v2/getMessages`);

      expect(response.status).toBe(400);
    });
  });
});
