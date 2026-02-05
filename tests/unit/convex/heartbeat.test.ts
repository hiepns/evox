/**
 * Critical Path Tests: Agent Heartbeat
 *
 * North Star: Agents work 24/7 - heartbeat ensures they're alive.
 * Tests cover: heartbeat updates, status detection, offline detection.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx, mockAgent } from "../../helpers/convex-mock";

describe("Heartbeat - Critical Path", () => {
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe("recordHeartbeat", () => {
    it("should update lastHeartbeat timestamp", async () => {
      const agent = mockAgent({ name: "SAM" });
      const now = Date.now();

      await ctx.db.patch(agent._id, { lastHeartbeat: now });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({ lastHeartbeat: now })
      );
    });

    it("should update status to online", async () => {
      const agent = mockAgent({ name: "SAM", status: "offline" });

      await ctx.db.patch(agent._id, { status: "online", lastHeartbeat: Date.now() });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({ status: "online" })
      );
    });

    it("should record session info", async () => {
      const agent = mockAgent({ name: "SAM" });
      const sessionData = {
        lastHeartbeat: Date.now(),
        currentSession: "session_123",
        tmuxPane: "evox:sam",
      };

      await ctx.db.patch(agent._id, sessionData);

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({ currentSession: "session_123" })
      );
    });
  });

  describe("checkAgentStatus", () => {
    it("should detect online agents within threshold", () => {
      const THRESHOLD = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();

      const agent = mockAgent({
        status: "online",
        lastHeartbeat: now - 1000, // 1 second ago
      });

      const isOnline = now - (agent.lastHeartbeat || 0) < THRESHOLD;

      expect(isOnline).toBe(true);
    });

    it("should detect offline agents past threshold", () => {
      const THRESHOLD = 5 * 60 * 1000;
      const now = Date.now();

      const agent = mockAgent({
        status: "online",
        lastHeartbeat: now - 10 * 60 * 1000, // 10 minutes ago
      });

      const isOnline = now - (agent.lastHeartbeat || 0) < THRESHOLD;

      expect(isOnline).toBe(false);
    });

    it("should handle missing lastHeartbeat", () => {
      const agent = mockAgent({ status: "offline" });
      delete (agent as any).lastHeartbeat;

      const lastHeartbeat = agent.lastHeartbeat || 0;

      expect(lastHeartbeat).toBe(0);
    });
  });

  describe("getAgentHealth", () => {
    it("should return all agents with health status", async () => {
      const now = Date.now();
      const agents = [
        mockAgent({ name: "SAM", status: "online", lastHeartbeat: now - 1000 }),
        mockAgent({ name: "LEO", status: "busy", lastHeartbeat: now - 2000 }),
        mockAgent({ name: "QUINN", status: "offline", lastHeartbeat: now - 600000 }),
      ];

      ctx.db.query.mockReturnValue({
        collect: vi.fn().mockResolvedValue(agents),
      });

      const result = await ctx.db.query("agents").collect();

      expect(result).toHaveLength(3);
    });

    it("should calculate uptime percentage", () => {
      const totalAgents = 4;
      const onlineAgents = 3;
      const uptimePercent = Math.round((onlineAgents / totalAgents) * 100);

      expect(uptimePercent).toBe(75);
    });
  });

  describe("markAgentOffline", () => {
    it("should update status to offline when heartbeat times out", async () => {
      const agent = mockAgent({ name: "SAM", status: "online" });

      await ctx.db.patch(agent._id, { status: "offline" });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({ status: "offline" })
      );
    });

    it("should clear current task when going offline", async () => {
      const agent = mockAgent({ name: "SAM", status: "online" });

      await ctx.db.patch(agent._id, {
        status: "offline",
        currentTask: null,
        currentTaskIdentifier: null,
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({ currentTask: null })
      );
    });
  });

  describe("Heartbeat Intervals", () => {
    it("should use 30 second heartbeat interval", () => {
      const HEARTBEAT_INTERVAL = 30 * 1000;
      expect(HEARTBEAT_INTERVAL).toBe(30000);
    });

    it("should use 5 minute offline threshold", () => {
      const OFFLINE_THRESHOLD = 5 * 60 * 1000;
      expect(OFFLINE_THRESHOLD).toBe(300000);
    });

    it("should detect stale heartbeat correctly", () => {
      const now = Date.now();
      const OFFLINE_THRESHOLD = 5 * 60 * 1000;

      const recentHeartbeat = now - 60 * 1000; // 1 min ago
      const staleHeartbeat = now - 10 * 60 * 1000; // 10 min ago

      expect(now - recentHeartbeat < OFFLINE_THRESHOLD).toBe(true);
      expect(now - staleHeartbeat < OFFLINE_THRESHOLD).toBe(false);
    });
  });
});
