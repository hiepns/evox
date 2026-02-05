/**
 * AGT-268: Per-Agent Ticket Completion Stats
 *
 * Backend queries for agent productivity visibility:
 * - Tickets completed per agent (24h, 7d, all-time)
 * - Real-time via Convex subscriptions
 * - Used by CEO/Elon Dashboard
 */
import { v } from "convex/values";
import { query } from "./_generated/server";

// Time period constants (milliseconds)
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Get per-agent ticket completion stats for dashboard.
 * Returns completion counts for each agent across time periods.
 *
 * Real-time updates via Convex subscription.
 *
 * Usage:
 * - useQuery(api.agentStats.getCompletionStats)
 */
export const getCompletionStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const past24h = now - DAY_MS;
    const past7d = now - 7 * DAY_MS;

    // Get all agents
    const agents = await ctx.db.query("agents").collect();

    // Get completed tasks (status = "done")
    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "done"))
      .collect();

    // Build stats per agent
    const stats = agents.map((agent) => {
      const agentNameLower = agent.name.toLowerCase();

      // Filter tasks by agent attribution (agentName field per ADR-001)
      const agentTasks = completedTasks.filter(
        (t) => t.agentName?.toLowerCase() === agentNameLower
      );

      // Count by time period
      const last24h = agentTasks.filter(
        (t) => t.completedAt && t.completedAt >= past24h
      ).length;

      const last7d = agentTasks.filter(
        (t) => t.completedAt && t.completedAt >= past7d
      ).length;

      const allTime = agentTasks.length;

      return {
        name: agent.name,
        role: agent.role,
        status: agent.status,
        avatar: agent.avatar,
        last24h,
        last7d,
        allTime,
      };
    });

    // Sort by all-time completions (most productive first)
    stats.sort((a, b) => b.allTime - a.allTime);

    return {
      stats,
      updatedAt: now,
      periods: {
        last24h: { start: past24h, end: now },
        last7d: { start: past7d, end: now },
      },
    };
  },
});

/**
 * Get completion stats for a specific agent.
 *
 * Usage:
 * - useQuery(api.agentStats.getAgentCompletionStats, { agent: "sam" })
 */
export const getAgentCompletionStats = query({
  args: {
    agent: v.string(),
  },
  handler: async (ctx, { agent }) => {
    const now = Date.now();
    const past24h = now - DAY_MS;
    const past7d = now - 7 * DAY_MS;
    const past30d = now - 30 * DAY_MS;

    const agentNameLower = agent.toLowerCase();

    // Get agent document
    const agentDoc = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", agent.toUpperCase()))
      .first();

    if (!agentDoc) {
      // Try lowercase
      const agentDocLower = await ctx.db
        .query("agents")
        .filter((q) => q.eq(q.field("name"), agent))
        .first();
      if (!agentDocLower) {
        return null;
      }
    }

    // Get completed tasks for this agent
    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_agentName", (q) => q.eq("agentName", agentNameLower))
      .filter((q) => q.eq(q.field("status"), "done"))
      .collect();

    // Count by time period
    const last24h = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= past24h
    ).length;

    const last7d = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= past7d
    ).length;

    const last30d = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= past30d
    ).length;

    const allTime = completedTasks.length;

    // Recent completions (last 5)
    const recentCompletions = completedTasks
      .filter((t) => t.completedAt)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      .slice(0, 5)
      .map((t) => ({
        id: t.linearIdentifier ?? t._id,
        title: t.title,
        completedAt: t.completedAt,
      }));

    return {
      agent: agentNameLower,
      agentDoc: agentDoc
        ? {
            name: agentDoc.name,
            role: agentDoc.role,
            status: agentDoc.status,
            avatar: agentDoc.avatar,
          }
        : null,
      stats: {
        last24h,
        last7d,
        last30d,
        allTime,
      },
      recentCompletions,
      updatedAt: now,
    };
  },
});

/**
 * Get team-wide completion stats summary.
 * Quick glance view for CEO dashboard.
 *
 * Usage:
 * - useQuery(api.agentStats.getTeamSummary)
 */
export const getTeamSummary = query({
  handler: async (ctx) => {
    const now = Date.now();
    const past24h = now - DAY_MS;
    const past7d = now - 7 * DAY_MS;

    // Get all completed tasks
    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "done"))
      .collect();

    // Get in-progress tasks
    const inProgressTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .collect();

    // Team totals
    const team = {
      completed24h: completedTasks.filter(
        (t) => t.completedAt && t.completedAt >= past24h
      ).length,
      completed7d: completedTasks.filter(
        (t) => t.completedAt && t.completedAt >= past7d
      ).length,
      completedAllTime: completedTasks.length,
      inProgress: inProgressTasks.length,
    };

    // Per-agent breakdown (quick summary)
    const agentBreakdown: Record<string, number> = {};
    for (const task of completedTasks) {
      if (task.agentName) {
        const name = task.agentName.toLowerCase();
        agentBreakdown[name] = (agentBreakdown[name] ?? 0) + 1;
      }
    }

    // Calculate velocity (tasks per hour, last 24h)
    const tasksLast24h = team.completed24h;
    const velocityPerHour = tasksLast24h / 24;

    return {
      team,
      agentBreakdown,
      velocity: {
        tasksPerHour: Math.round(velocityPerHour * 100) / 100,
        tasksPerDay: tasksLast24h,
      },
      updatedAt: now,
    };
  },
});

/**
 * Get completion stats with trend comparison.
 * Shows if agents are improving week-over-week.
 *
 * Usage:
 * - useQuery(api.agentStats.getCompletionTrends)
 */
export const getCompletionTrends = query({
  handler: async (ctx) => {
    const now = Date.now();
    const past7d = now - 7 * DAY_MS;
    const past14d = now - 14 * DAY_MS;

    // Get all completed tasks
    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "done"))
      .collect();

    // Get agents
    const agents = await ctx.db.query("agents").collect();

    // Build trends per agent
    const trends = agents.map((agent) => {
      const agentNameLower = agent.name.toLowerCase();
      const agentTasks = completedTasks.filter(
        (t) => t.agentName?.toLowerCase() === agentNameLower
      );

      // This week (last 7 days)
      const thisWeek = agentTasks.filter(
        (t) => t.completedAt && t.completedAt >= past7d
      ).length;

      // Last week (7-14 days ago)
      const lastWeek = agentTasks.filter(
        (t) =>
          t.completedAt &&
          t.completedAt >= past14d &&
          t.completedAt < past7d
      ).length;

      // Trend calculation
      let trend: "up" | "down" | "stable" = "stable";
      let trendPercent = 0;

      if (lastWeek > 0) {
        trendPercent = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
        if (trendPercent > 10) trend = "up";
        else if (trendPercent < -10) trend = "down";
      } else if (thisWeek > 0) {
        trend = "up";
        trendPercent = 100;
      }

      return {
        name: agent.name,
        role: agent.role,
        thisWeek,
        lastWeek,
        trend,
        trendPercent,
      };
    });

    // Sort by this week's completions
    trends.sort((a, b) => b.thisWeek - a.thisWeek);

    return {
      trends,
      updatedAt: now,
    };
  },
});

/**
 * Task 3.1: Get detailed task history for an agent.
 * Returns full task completion history with timing analytics.
 *
 * Usage:
 * - useQuery(api.agentStats.getTaskHistory, { agent: "sam", limit: 50 })
 */
export const getTaskHistory = query({
  args: {
    agent: v.string(),
    limit: v.optional(v.number()),
    since: v.optional(v.number()), // Timestamp to filter from
  },
  handler: async (ctx, { agent, limit = 50, since }) => {
    const now = Date.now();
    const agentNameLower = agent.toLowerCase();

    // Get all tasks for this agent
    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_agentName", (q) => q.eq("agentName", agentNameLower))
      .collect();

    // Filter by since timestamp if provided
    if (since) {
      tasks = tasks.filter((t) => (t.completedAt ?? t.updatedAt) >= since);
    }

    // Sort by completion/update time (most recent first)
    tasks.sort((a, b) => (b.completedAt ?? b.updatedAt) - (a.completedAt ?? a.updatedAt));

    // Limit results
    const limitedTasks = tasks.slice(0, limit);

    // Calculate analytics
    const completed = tasks.filter((t) => t.status === "done");
    const failed = tasks.filter((t) => t.status === "backlog" && t.lastError);

    // Calculate average completion time (for tasks with both createdAt and completedAt)
    const tasksWithDuration = completed.filter((t) => t.completedAt && t.createdAt);
    const avgDurationMs = tasksWithDuration.length > 0
      ? tasksWithDuration.reduce(
          (sum, t) => sum + ((t.completedAt ?? 0) - t.createdAt),
          0
        ) / tasksWithDuration.length
      : 0;

    const history = limitedTasks.map((t) => ({
      id: t._id,
      linearId: t.linearIdentifier,
      title: t.title,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      completedAt: t.completedAt,
      durationMs: t.completedAt && t.createdAt ? t.completedAt - t.createdAt : null,
      error: t.lastError,
      retryCount: t.retryCount,
    }));

    return {
      agent: agentNameLower,
      history,
      analytics: {
        total: tasks.length,
        completed: completed.length,
        failed: failed.length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        successRate: tasks.length > 0
          ? Math.round((completed.length / (completed.length + failed.length || 1)) * 100)
          : 100,
        avgDurationMs: Math.round(avgDurationMs),
        avgDurationMins: Math.round(avgDurationMs / 60000),
      },
      pagination: {
        returned: history.length,
        total: tasks.length,
        hasMore: tasks.length > limit,
      },
      updatedAt: now,
    };
  },
});

/**
 * Task 3.1: Get team-wide task history summary.
 * Overview of all agents' task completion patterns.
 */
export const getTeamTaskHistory = query({
  args: {
    days: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, { days = 7 }) => {
    const now = Date.now();
    const since = now - days * DAY_MS;

    // Get all agents
    const agents = await ctx.db.query("agents").collect();

    // Get recent tasks
    const recentTasks = await ctx.db
      .query("tasks")
      .filter((q) => q.gte(q.field("updatedAt"), since))
      .collect();

    // Build per-agent history
    const agentHistories = agents.map((agent) => {
      const agentNameLower = agent.name.toLowerCase();
      const agentTasks = recentTasks.filter(
        (t) => t.agentName?.toLowerCase() === agentNameLower
      );

      const completed = agentTasks.filter((t) => t.status === "done");
      const tasksWithDuration = completed.filter((t) => t.completedAt && t.createdAt);
      const avgDurationMs = tasksWithDuration.length > 0
        ? tasksWithDuration.reduce(
            (sum, t) => sum + ((t.completedAt ?? 0) - t.createdAt),
            0
          ) / tasksWithDuration.length
        : 0;

      return {
        agent: agent.name,
        role: agent.role,
        status: agent.status,
        taskCount: agentTasks.length,
        completed: completed.length,
        inProgress: agentTasks.filter((t) => t.status === "in_progress").length,
        avgDurationMins: Math.round(avgDurationMs / 60000),
        recentTasks: completed.slice(0, 3).map((t) => ({
          id: t.linearIdentifier ?? t._id,
          title: t.title.slice(0, 50),
          completedAt: t.completedAt,
        })),
      };
    });

    // Sort by completed count
    agentHistories.sort((a, b) => b.completed - a.completed);

    // Team totals
    const teamTotal = {
      tasks: recentTasks.length,
      completed: recentTasks.filter((t) => t.status === "done").length,
      inProgress: recentTasks.filter((t) => t.status === "in_progress").length,
    };

    return {
      period: { days, since, until: now },
      team: teamTotal,
      agents: agentHistories,
      updatedAt: now,
    };
  },
});
