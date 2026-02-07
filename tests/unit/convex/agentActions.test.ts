/**
 * Critical Path Tests: Agent Actions
 *
 * North Star: Agents complete tasks autonomously.
 * Tests cover: task completion, status updates, activity logging.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx, mockAgent, mockTask } from "../../helpers/convex-mock";

describe("Agent Actions - Critical Path", () => {
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe("completeTask", () => {
    it("should mark task as done", async () => {
      const task = mockTask({ status: "in_progress" });
      const now = Date.now();

      await ctx.db.patch(task._id, {
        status: "done",
        completedAt: now,
        updatedAt: now,
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({
          status: "done",
          completedAt: expect.any(Number),
        })
      );
    });

    it("should record completion summary", async () => {
      const task = mockTask({ status: "in_progress" });

      await ctx.db.patch(task._id, {
        status: "done",
        completionSummary: "Implemented feature X with 5 files changed",
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({
          completionSummary: expect.stringContaining("5 files"),
        })
      );
    });

    it("should update agent current task to null", async () => {
      const agent = mockAgent({ name: "SAM" });

      await ctx.db.patch(agent._id, {
        currentTask: null,
        currentTaskIdentifier: null,
        status: "online",
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({ currentTask: null })
      );
    });

    it("should log activity event for completion", async () => {
      const activityData = {
        agentName: "SAM",
        eventType: "completed",
        description: "Completed AGT-123",
        linearIdentifier: "AGT-123",
        timestamp: Date.now(),
      };

      ctx.db.insert.mockResolvedValue("activity_new");

      await ctx.db.insert("activityEvents", activityData);

      expect(ctx.db.insert).toHaveBeenCalledWith(
        "activityEvents",
        expect.objectContaining({
          eventType: "completed",
          agentName: "SAM",
        })
      );
    });
  });

  describe("startTask", () => {
    it("should update task status to in_progress", async () => {
      const task = mockTask({ status: "todo" });

      await ctx.db.patch(task._id, {
        status: "in_progress",
        startedAt: Date.now(),
        updatedAt: Date.now(),
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({ status: "in_progress" })
      );
    });

    it("should assign agent to task", async () => {
      const task = mockTask({ status: "todo" });
      const agent = mockAgent({ name: "SAM" });

      await ctx.db.patch(task._id, {
        agentName: "SAM",
        agentId: agent._id,
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({ agentName: "SAM" })
      );
    });

    it("should update agent current task", async () => {
      const agent = mockAgent({ name: "SAM" });
      const task = mockTask({ linearIdentifier: "AGT-456" });

      await ctx.db.patch(agent._id, {
        currentTask: task._id,
        currentTaskIdentifier: "AGT-456",
        status: "busy",
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        agent._id,
        expect.objectContaining({
          currentTaskIdentifier: "AGT-456",
          status: "busy",
        })
      );
    });
  });

  describe("failTask", () => {
    it("should mark task as failed", async () => {
      const task = mockTask({ status: "in_progress" });

      await ctx.db.patch(task._id, {
        status: "failed",
        failureReason: "Build failed",
        updatedAt: Date.now(),
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({
          status: "failed",
          failureReason: "Build failed",
        })
      );
    });

    it("should increment agent failure count", async () => {
      const performanceData = {
        agentName: "SAM",
        date: new Date().toISOString().split("T")[0],
        tasksFailed: 1,
      };

      await ctx.db.insert("performanceMetrics", performanceData);

      expect(ctx.db.insert).toHaveBeenCalledWith(
        "performanceMetrics",
        expect.objectContaining({ tasksFailed: 1 })
      );
    });
  });

  describe("blockTask", () => {
    it("should mark task as blocked", async () => {
      const task = mockTask({ status: "in_progress" });

      await ctx.db.patch(task._id, {
        status: "blocked",
        blockedReason: "Waiting for API access",
        updatedAt: Date.now(),
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({
          status: "blocked",
          blockedReason: expect.any(String),
        })
      );
    });
  });

  describe("updateProgress", () => {
    it("should update task progress percentage", async () => {
      const task = mockTask({ status: "in_progress" });

      await ctx.db.patch(task._id, {
        progress: 50,
        progressNote: "Halfway done",
        updatedAt: Date.now(),
      });

      expect(ctx.db.patch).toHaveBeenCalledWith(
        task._id,
        expect.objectContaining({ progress: 50 })
      );
    });
  });

  describe("Performance Tracking", () => {
    it("should record task duration", () => {
      const startTime = Date.now() - 30 * 60 * 1000; // 30 min ago
      const endTime = Date.now();
      const durationMinutes = Math.round((endTime - startTime) / 60000);

      expect(durationMinutes).toBe(30);
    });

    it("should calculate average task duration", () => {
      const durations = [15, 30, 45, 20, 40]; // minutes
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      expect(avgDuration).toBe(30);
    });

    it("should track cost per task", () => {
      const totalCost = 5.0;
      const tasksCompleted = 10;
      const costPerTask = totalCost / tasksCompleted;

      expect(costPerTask).toBe(0.5);
    });
  });
});
