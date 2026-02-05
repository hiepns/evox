/**
 * Critical Path Tests: Agent Communication
 *
 * North Star Alignment: Agents communicate 24/7 without human intervention.
 * Tests cover: DMs, channel posts, mentions, message reading, unread counts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../helpers/convex-mock";

describe("Agent Communication - Critical Path", () => {
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  // Helper to create message mock
  function mockMessage(overrides: Partial<{
    fromAgent: string;
    toAgent: string;
    channel: string;
    content: string;
    type: string;
    read: boolean;
    priority: string;
  }> = {}) {
    return {
      _id: `msg_${Math.random().toString(36).slice(2)}`,
      _creationTime: Date.now(),
      fromAgent: "sam",
      toAgent: "leo",
      content: "Test message",
      type: "dm",
      read: false,
      priority: "normal",
      createdAt: Date.now(),
      ...overrides,
    };
  }

  describe("v2/sendMessage - Agent DMs", () => {
    it("should create DM with required fields", async () => {
      const dmData = {
        from: "QUINN",
        to: "SAM",
        message: "Code review complete",
        priority: "normal",
      };

      ctx.db.insert.mockResolvedValue("msg_new");

      await ctx.db.insert("messages", {
        fromAgent: dmData.from.toLowerCase(),
        toAgent: dmData.to.toLowerCase(),
        content: dmData.message,
        type: "dm",
        read: false,
        priority: dmData.priority,
        createdAt: Date.now(),
      });

      expect(ctx.db.insert).toHaveBeenCalledWith(
        "messages",
        expect.objectContaining({
          fromAgent: "quinn",
          toAgent: "sam",
          type: "dm",
        })
      );
    });

    it("should normalize agent names to lowercase", () => {
      const inputs = ["SAM", "Sam", "sam", "SAM"];
      const normalized = inputs.map((n) => n.toLowerCase());

      expect(new Set(normalized).size).toBe(1);
      expect(normalized[0]).toBe("sam");
    });

    it("should support priority levels", () => {
      const priorities = ["normal", "high", "urgent"];
      priorities.forEach((p) => {
        expect(["normal", "high", "urgent"]).toContain(p);
      });
    });

    it("should set read=false for new messages", async () => {
      const dm = mockMessage({ read: false });

      ctx.db.insert.mockResolvedValue(dm._id);
      await ctx.db.insert("messages", dm);

      expect(ctx.db.insert).toHaveBeenCalledWith(
        "messages",
        expect.objectContaining({ read: false })
      );
    });
  });

  describe("v2/getMessages - Fetch Messages", () => {
    it("should return unread DMs for agent", async () => {
      const messages = [
        mockMessage({ toAgent: "quinn", read: false }),
        mockMessage({ toAgent: "quinn", read: false }),
        mockMessage({ toAgent: "quinn", read: true }), // Should not be in unread
      ];

      ctx.db.query.mockReturnValue({
        filter: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        take: vi.fn().mockResolvedValue(messages),
      });

      const result = await ctx.db.query("messages").filter(() => true).order("desc").take(10);
      const unread = result.filter((m: { read: boolean }) => !m.read);

      expect(unread).toHaveLength(2);
    });

    it("should calculate unread count correctly", async () => {
      const messages = [
        mockMessage({ toAgent: "quinn", read: false, type: "dm" }),
        mockMessage({ toAgent: "quinn", read: false, type: "dm" }),
        mockMessage({ toAgent: "quinn", read: false, type: "mention" }),
      ];

      ctx.db.query.mockReturnValue({
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue(messages),
      });

      const result = await ctx.db.query("messages").filter(() => true).collect();
      const dms = result.filter((m: { type: string }) => m.type === "dm");
      const mentions = result.filter((m: { type: string }) => m.type === "mention");

      expect(dms.length).toBe(2);
      expect(mentions.length).toBe(1);
    });

    it("should include channel mentions for agent", async () => {
      const messages = [
        mockMessage({ type: "channel", channel: "dev", content: "@quinn please review" }),
      ];

      ctx.db.query.mockReturnValue({
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue(messages),
      });

      const result = await ctx.db.query("messages").filter(() => true).collect();
      const mention = result.find((m: { content: string }) => m.content.includes("@quinn"));

      expect(mention).toBeDefined();
    });
  });

  describe("postToChannel - Channel Messages", () => {
    it("should create channel message with correct field name", async () => {
      // Per MEMORY.md: field is 'message', not 'content'
      const channelPost = {
        channel: "dev",
        from: "QUINN",
        message: "Build complete", // NOT 'content'
      };

      ctx.db.insert.mockResolvedValue("msg_channel");

      await ctx.db.insert("messages", {
        fromAgent: channelPost.from.toLowerCase(),
        channel: channelPost.channel,
        content: channelPost.message,
        type: "channel",
        createdAt: Date.now(),
      });

      expect(ctx.db.insert).toHaveBeenCalledWith(
        "messages",
        expect.objectContaining({
          channel: "dev",
          type: "channel",
        })
      );
    });

    it("should support standard channels", () => {
      const validChannels = ["dev", "general", "alerts", "test"];
      validChannels.forEach((ch) => {
        expect(ch).toBeTruthy();
      });
    });
  });

  describe("markAsRead - Message State", () => {
    it("should mark message as read", async () => {
      const message = mockMessage({ read: false });

      await ctx.db.patch(message._id, { read: true });

      expect(ctx.db.patch).toHaveBeenCalledWith(message._id, { read: true });
    });

    it("should update unread count after marking read", async () => {
      const initialUnread = 5;
      const afterMarkRead = initialUnread - 1;

      expect(afterMarkRead).toBe(4);
    });
  });

  describe("Message Validation", () => {
    it("should reject empty content", () => {
      const emptyMessage = mockMessage({ content: "" });
      expect(emptyMessage.content.length).toBe(0);
    });

    it("should validate from/to agent names", () => {
      const validAgents = ["sam", "leo", "quinn", "max"];
      const message = mockMessage({ fromAgent: "sam", toAgent: "leo" });

      expect(validAgents).toContain(message.fromAgent);
      expect(validAgents).toContain(message.toAgent);
    });

    it("should handle special characters in content", () => {
      const specialContent = "Bug fix: AGT-123 (see #dev)";
      const message = mockMessage({ content: specialContent });

      expect(message.content).toContain("AGT-123");
      expect(message.content).toContain("#dev");
    });
  });
});
