/**
 * AGT-242: Agent Performance Tracking — Velocity + Cost
 *
 * Tracks agent performance metrics for Elon Dashboard:
 * - Tasks completed per hour (velocity)
 * - Cost per task (API tokens)
 * - Time per task (duration)
 * - Utilization % (active vs idle)
 * - Error rate
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Record a task completion event for performance tracking
 * Called internally when a task is completed
 */
export const recordTaskCompletion = internalMutation({
  args: {
    agentName: v.string(),
    taskId: v.optional(v.id("tasks")),
    durationMinutes: v.optional(v.number()),
    success: v.boolean(), // true = completed, false = failed
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nowDate = new Date(now);

    // Calculate hour bucket (e.g., "2026-02-04T06")
    const hourBucket = `${nowDate.getUTCFullYear()}-${String(nowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowDate.getUTCDate()).padStart(2, '0')}T${String(nowDate.getUTCHours()).padStart(2, '0')}`;
    const date = hourBucket.substring(0, 10); // "2026-02-04"

    // Find or create metrics bucket for this agent/hour
    let metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_hour", (q) =>
        q.eq("agentName", args.agentName).eq("hourBucket", hourBucket)
      )
      .first();

    if (!metrics) {
      // Create new hourly bucket
      await ctx.db.insert("performanceMetrics", {
        agentName: args.agentName,
        hourBucket,
        date,
        tasksCompleted: args.success ? 1 : 0,
        tasksStarted: 0,
        tasksFailed: args.success ? 0 : 1,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        totalDurationMinutes: args.durationMinutes || 0,
        avgDurationMinutes: args.durationMinutes,
        activeMinutes: 0,
        idleMinutes: 0,
        offlineMinutes: 0,
        errorCount: 0,
        velocityPerHour: args.success ? 1 : 0,
        avgCostPerTask: 0,
        errorRate: args.success ? 0 : 1,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update existing bucket
      const tasksCompleted = args.success ? metrics.tasksCompleted + 1 : metrics.tasksCompleted;
      const tasksFailed = args.success ? metrics.tasksFailed : metrics.tasksFailed + 1;
      const totalTasks = tasksCompleted + tasksFailed;
      const totalDurationMinutes = metrics.totalDurationMinutes + (args.durationMinutes || 0);

      await ctx.db.patch(metrics._id, {
        tasksCompleted,
        tasksFailed,
        totalDurationMinutes,
        avgDurationMinutes: totalTasks > 0 ? totalDurationMinutes / totalTasks : undefined,
        velocityPerHour: tasksCompleted,
        errorRate: totalTasks > 0 ? tasksFailed / totalTasks : 0,
        updatedAt: now,
      });
    }
  },
});

/**
 * Record task start for velocity tracking
 */
export const recordTaskStart = internalMutation({
  args: {
    agentName: v.string(),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nowDate = new Date(now);

    const hourBucket = `${nowDate.getUTCFullYear()}-${String(nowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowDate.getUTCDate()).padStart(2, '0')}T${String(nowDate.getUTCHours()).padStart(2, '0')}`;
    const date = hourBucket.substring(0, 10);

    let metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_hour", (q) =>
        q.eq("agentName", args.agentName).eq("hourBucket", hourBucket)
      )
      .first();

    if (!metrics) {
      await ctx.db.insert("performanceMetrics", {
        agentName: args.agentName,
        hourBucket,
        date,
        tasksCompleted: 0,
        tasksStarted: 1,
        tasksFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        totalDurationMinutes: 0,
        activeMinutes: 0,
        idleMinutes: 0,
        offlineMinutes: 0,
        errorCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(metrics._id, {
        tasksStarted: metrics.tasksStarted + 1,
        updatedAt: now,
      });
    }
  },
});

/**
 * Record cost data from API usage
 * Called after task completion with token counts
 */
export const recordCost = internalMutation({
  args: {
    agentName: v.string(),
    taskId: v.optional(v.id("tasks")),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nowDate = new Date(now);

    const hourBucket = `${nowDate.getUTCFullYear()}-${String(nowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowDate.getUTCDate()).padStart(2, '0')}T${String(nowDate.getUTCHours()).padStart(2, '0')}`;
    const date = hourBucket.substring(0, 10);

    let metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_hour", (q) =>
        q.eq("agentName", args.agentName).eq("hourBucket", hourBucket)
      )
      .first();

    if (!metrics) {
      await ctx.db.insert("performanceMetrics", {
        agentName: args.agentName,
        hourBucket,
        date,
        tasksCompleted: 0,
        tasksStarted: 0,
        tasksFailed: 0,
        totalInputTokens: args.inputTokens,
        totalOutputTokens: args.outputTokens,
        totalCost: args.cost,
        totalDurationMinutes: 0,
        activeMinutes: 0,
        idleMinutes: 0,
        offlineMinutes: 0,
        errorCount: 0,
        avgCostPerTask: args.cost,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const totalInputTokens = metrics.totalInputTokens + args.inputTokens;
      const totalOutputTokens = metrics.totalOutputTokens + args.outputTokens;
      const totalCost = metrics.totalCost + args.cost;
      const totalTasks = metrics.tasksCompleted + metrics.tasksFailed;

      await ctx.db.patch(metrics._id, {
        totalInputTokens,
        totalOutputTokens,
        totalCost,
        avgCostPerTask: totalTasks > 0 ? totalCost / totalTasks : totalCost,
        updatedAt: now,
      });
    }
  },
});

/**
 * Record utilization data from heartbeat
 * Called periodically to track agent status
 */
export const recordUtilization = internalMutation({
  args: {
    agentName: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("busy"),
      v.literal("idle"),
      v.literal("offline")
    ),
    minutes: v.number(), // Duration in this status
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nowDate = new Date(now);

    const hourBucket = `${nowDate.getUTCFullYear()}-${String(nowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowDate.getUTCDate()).padStart(2, '0')}T${String(nowDate.getUTCHours()).padStart(2, '0')}`;
    const date = hourBucket.substring(0, 10);

    let metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_hour", (q) =>
        q.eq("agentName", args.agentName).eq("hourBucket", hourBucket)
      )
      .first();

    const isActive = args.status === "online" || args.status === "busy";
    const isIdle = args.status === "idle";
    const isOffline = args.status === "offline";

    if (!metrics) {
      const activeMinutes = isActive ? args.minutes : 0;
      const idleMinutes = isIdle ? args.minutes : 0;
      const offlineMinutes = isOffline ? args.minutes : 0;
      const totalActiveTime = activeMinutes + idleMinutes;

      await ctx.db.insert("performanceMetrics", {
        agentName: args.agentName,
        hourBucket,
        date,
        tasksCompleted: 0,
        tasksStarted: 0,
        tasksFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        totalDurationMinutes: 0,
        activeMinutes,
        idleMinutes,
        offlineMinutes,
        utilizationPercent: totalActiveTime > 0 ? (activeMinutes / totalActiveTime) * 100 : 0,
        errorCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const activeMinutes = metrics.activeMinutes + (isActive ? args.minutes : 0);
      const idleMinutes = metrics.idleMinutes + (isIdle ? args.minutes : 0);
      const offlineMinutes = metrics.offlineMinutes + (isOffline ? args.minutes : 0);
      const totalActiveTime = activeMinutes + idleMinutes;

      await ctx.db.patch(metrics._id, {
        activeMinutes,
        idleMinutes,
        offlineMinutes,
        utilizationPercent: totalActiveTime > 0 ? (activeMinutes / totalActiveTime) * 100 : undefined,
        updatedAt: now,
      });
    }
  },
});

/**
 * Record an error event
 */
export const recordError = internalMutation({
  args: {
    agentName: v.string(),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nowDate = new Date(now);

    const hourBucket = `${nowDate.getUTCFullYear()}-${String(nowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowDate.getUTCDate()).padStart(2, '0')}T${String(nowDate.getUTCHours()).padStart(2, '0')}`;
    const date = hourBucket.substring(0, 10);

    let metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_hour", (q) =>
        q.eq("agentName", args.agentName).eq("hourBucket", hourBucket)
      )
      .first();

    if (!metrics) {
      await ctx.db.insert("performanceMetrics", {
        agentName: args.agentName,
        hourBucket,
        date,
        tasksCompleted: 0,
        tasksStarted: 0,
        tasksFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        totalDurationMinutes: 0,
        activeMinutes: 0,
        idleMinutes: 0,
        offlineMinutes: 0,
        errorCount: 1,
        errorRate: 1,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const errorCount = metrics.errorCount + 1;
      const totalTasks = metrics.tasksCompleted + metrics.tasksFailed;

      await ctx.db.patch(metrics._id, {
        errorCount,
        errorRate: totalTasks > 0 ? metrics.tasksFailed / totalTasks : 0,
        updatedAt: now,
      });
    }
  },
});

/**
 * Query: Get agent performance for a specific date range
 */
export const getAgentMetrics = query({
  args: {
    agentName: v.string(),
    startDate: v.optional(v.string()), // "2026-02-04"
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_date", (q) => q.eq("agentName", args.agentName));

    // If date range provided, filter by date
    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("date"), args.startDate!));
    }
    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("date"), args.endDate!));
    }

    const metrics = await query.collect();

    // Sort by hour bucket descending (most recent first)
    metrics.sort((a, b) => b.hourBucket.localeCompare(a.hourBucket));

    if (args.limit) {
      return metrics.slice(0, args.limit);
    }

    return metrics;
  },
});

/**
 * Query: Get aggregated metrics for all agents (for dashboard overview)
 */
export const getAllAgentsMetrics = query({
  args: {
    date: v.optional(v.string()), // "2026-02-04" - defaults to today
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const date = args.date || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;

    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    // Group by agent and aggregate
    const agentMetrics = new Map<string, {
      agentName: string;
      totalTasksCompleted: number;
      totalTasksFailed: number;
      totalCost: number;
      avgDurationMinutes: number;
      utilizationPercent: number;
      errorRate: number;
      velocityPerHour: number;
    }>();

    for (const m of metrics) {
      const existing = agentMetrics.get(m.agentName) || {
        agentName: m.agentName,
        totalTasksCompleted: 0,
        totalTasksFailed: 0,
        totalCost: 0,
        avgDurationMinutes: 0,
        utilizationPercent: 0,
        errorRate: 0,
        velocityPerHour: 0,
      };

      existing.totalTasksCompleted += m.tasksCompleted;
      existing.totalTasksFailed += m.tasksFailed;
      existing.totalCost += m.totalCost;
      existing.avgDurationMinutes = m.avgDurationMinutes || 0;
      existing.utilizationPercent = m.utilizationPercent || 0;
      existing.errorRate = m.errorRate || 0;
      existing.velocityPerHour = m.velocityPerHour || 0;

      agentMetrics.set(m.agentName, existing);
    }

    return Array.from(agentMetrics.values());
  },
});

/**
 * Query: Get latest metrics for an agent (for real-time dashboard)
 */
export const getLatestMetrics = query({
  args: {
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nowDate = new Date(now);
    const hourBucket = `${nowDate.getUTCFullYear()}-${String(nowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowDate.getUTCDate()).padStart(2, '0')}T${String(nowDate.getUTCHours()).padStart(2, '0')}`;

    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_hour", (q) =>
        q.eq("agentName", args.agentName).eq("hourBucket", hourBucket)
      )
      .first();

    return metrics || null;
  },
});

/**
 * Query: Get velocity trend (tasks per hour over time)
 */
export const getVelocityTrend = query({
  args: {
    agentName: v.string(),
    hours: v.optional(v.number()), // Last N hours (default 24)
  },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const now = Date.now();
    const startTime = now - (hours * 60 * 60 * 1000);
    const startDate = new Date(startTime);
    const startDateStr = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;

    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_agent_date", (q) => q.eq("agentName", args.agentName))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Sort by hour bucket ascending
    metrics.sort((a, b) => a.hourBucket.localeCompare(b.hourBucket));

    return metrics.map(m => ({
      hourBucket: m.hourBucket,
      tasksCompleted: m.tasksCompleted,
      velocityPerHour: m.velocityPerHour,
    }));
  },
});

/**
 * Query: Get cost breakdown by agent
 */
export const getCostBreakdown = query({
  args: {
    date: v.optional(v.string()), // "2026-02-04" - defaults to today
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const date = args.date || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;

    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    // Group by agent
    const costByAgent = new Map<string, {
      agentName: string;
      totalCost: number;
      totalTasks: number;
      avgCostPerTask: number;
      totalTokens: number;
    }>();

    for (const m of metrics) {
      const existing = costByAgent.get(m.agentName) || {
        agentName: m.agentName,
        totalCost: 0,
        totalTasks: 0,
        avgCostPerTask: 0,
        totalTokens: 0,
      };

      existing.totalCost += m.totalCost;
      existing.totalTasks += m.tasksCompleted;
      existing.totalTokens += m.totalInputTokens + m.totalOutputTokens;
      existing.avgCostPerTask = existing.totalTasks > 0 ? existing.totalCost / existing.totalTasks : 0;

      costByAgent.set(m.agentName, existing);
    }

    return Array.from(costByAgent.values()).sort((a, b) => b.totalCost - a.totalCost);
  },
});
