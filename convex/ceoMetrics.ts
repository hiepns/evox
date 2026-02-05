/**
 * CEO Dashboard Metrics
 * Optimized queries for 3-second glanceability
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get agent online status summary
 * Returns: { online: number, total: number, agents: AgentStatus[] }
 */
export const getAgentStatus = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const now = Date.now();
    const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    const agentStatuses = agents.map((agent) => {
      const lastSeen = agent.lastSeen || agent.lastHeartbeat || 0;
      const status = agent.status?.toLowerCase() || "offline";
      const isOnline =
        (status === "online" || status === "busy") &&
        now - lastSeen < ONLINE_THRESHOLD;

      return {
        name: agent.name,
        avatar: agent.avatar || "?",
        status: isOnline ? (status === "busy" ? "busy" : "online") : "offline",
        isOnline,
      };
    });

    const online = agentStatuses.filter((a) => a.isOnline).length;

    return {
      online,
      total: agents.length,
      agents: agentStatuses,
    };
  },
});

/**
 * Get today's key metrics
 * Returns: { completed: number, inProgress: number, blocked: number, cost: number }
 */
export const getTodayMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const tasks = await ctx.db.query("tasks").collect();

    // Count tasks by status
    let completed = 0;
    let inProgress = 0;
    let blocked = 0;

    for (const task of tasks) {
      const status = task.status?.toLowerCase() || "";

      if (status === "done" && task.completedAt && task.completedAt >= todayStart) {
        completed++;
      } else if (status === "in_progress" || status === "review") {
        inProgress++;
      } else if (status === "backlog" || status === "todo") {
        // Consider tasks in backlog with urgent priority as blocked
        if (task.priority?.toLowerCase() === "urgent") {
          blocked++;
        }
      }
    }

    // Get today's cost from performance metrics
    const today = now.toISOString().split("T")[0];
    const metrics = await ctx.db
      .query("performanceMetrics")
      .filter((q) => q.eq(q.field("date"), today))
      .collect();

    const cost = metrics.reduce((sum, m) => sum + (m.totalCost || 0), 0);

    return {
      completed,
      inProgress,
      blocked,
      cost,
    };
  },
});

/**
 * Get blockers requiring attention
 * Only returns urgent items
 */
export const getBlockers = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();

    const blockers = tasks
      .filter((task) => {
        const status = task.status?.toLowerCase() || "";
        const priority = task.priority?.toLowerCase() || "";
        // Urgent tasks not yet in progress, or stale in-progress
        return (
          (priority === "urgent" && (status === "backlog" || status === "todo")) ||
          (status === "in_progress" && Date.now() - (task.updatedAt || 0) > 24 * 60 * 60 * 1000)
        );
      })
      .slice(0, 5)
      .map((task) => ({
        id: task._id,
        title: task.title || task.linearIdentifier || "Unknown",
        linearId: task.linearIdentifier,
        owner: task.agentName || "Unassigned",
        urgent: task.priority?.toLowerCase() === "urgent",
        stale: Date.now() - (task.updatedAt || 0) > 24 * 60 * 60 * 1000,
      }));

    return blockers;
  },
});

/**
 * Get today's wins (completed tasks)
 */
export const getWins = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const tasks = await ctx.db.query("tasks").collect();

    const wins = tasks
      .filter((task) => {
        const status = task.status?.toLowerCase() || "";
        return status === "done" && task.completedAt && task.completedAt >= todayStart;
      })
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 5)
      .map((task) => ({
        id: task._id,
        title: task.title || task.linearIdentifier || "Task completed",
        linearId: task.linearIdentifier,
        agent: task.agentName || "Unknown",
        completedAt: task.completedAt,
      }));

    return wins;
  },
});

/**
 * Get unified live feed (activity + communications merged)
 * Filtered to only meaningful events
 */
export const getLiveFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get recent activity events
    const activities = await ctx.db
      .query("activityEvents")
      .order("desc")
      .take(limit * 2);

    // Get recent messages
    const messages = await ctx.db
      .query("unifiedMessages")
      .order("desc")
      .take(limit * 2);

    // Get agents for enrichment
    const agents = await ctx.db.query("agents").collect();
    const agentMap = new Map(agents.map((a) => [a.name.toLowerCase(), a]));

    // Merge and sort by timestamp
    type FeedItem = {
      id: string;
      type: "activity" | "message";
      agent: string;
      avatar: string;
      action: string;
      detail: string;
      timestamp: number;
    };

    const feedItems: FeedItem[] = [];

    // Process activities - filter out noise
    for (const act of activities) {
      const eventType = act.eventType?.toLowerCase() || "";
      // Skip noisy events
      if (["channel_message", "heartbeat"].includes(eventType)) continue;

      const agent = agentMap.get(act.agentName?.toLowerCase() || "");
      const avatar = agent?.avatar || "?";

      let action = "";
      let detail = "";

      if (eventType === "created") {
        action = "created";
        detail = act.linearIdentifier || act.description?.slice(0, 40) || "";
      } else if (eventType === "completed" || eventType === "status_change") {
        action = eventType === "completed" ? "completed" : "moved";
        detail = act.linearIdentifier || act.description?.slice(0, 40) || "";
      } else if (eventType === "push" || eventType === "pr_merged") {
        action = eventType === "push" ? "pushed" : "merged";
        detail = act.description?.slice(0, 40) || "";
      } else {
        continue; // Skip other events
      }

      feedItems.push({
        id: act._id,
        type: "activity",
        agent: act.agentName?.toUpperCase() || "?",
        avatar,
        action,
        detail,
        timestamp: act.timestamp || act._creationTime,
      });
    }

    // Process messages - only DMs with content
    for (const msg of messages) {
      if (!msg.content || msg.type === "channel") continue;

      const fromAgent = agentMap.get(msg.fromAgent?.toLowerCase() || "");
      const avatar = fromAgent?.avatar || "?";

      // Extract summary from message
      let detail = msg.content.slice(0, 50);
      if (msg.content.length > 50) detail += "...";

      feedItems.push({
        id: msg._id,
        type: "message",
        agent: msg.fromAgent?.toUpperCase() || "?",
        avatar,
        action: "says",
        detail,
        timestamp: msg.createdAt || msg._creationTime,
      });
    }

    // Sort by timestamp descending
    feedItems.sort((a, b) => b.timestamp - a.timestamp);

    return feedItems.slice(0, limit);
  },
});

/**
 * Get North Star progress
 * Based on vision milestones
 */
export const getNorthStarProgress = query({
  args: {},
  handler: async (ctx) => {
    // Check vision progress from database
    const progress = await ctx.db.query("visionProgress").first();

    if (progress) {
      return {
        percentage: progress.percentComplete || 0,
        weeklyChange: progress.weeklyChange || 0,
        phase: progress.currentPhase || "Unknown",
        milestones: progress.milestones || [],
      };
    }

    // Fallback: calculate from automation metrics
    const automationMetrics = await ctx.db.query("automationMetrics").order("desc").first();

    return {
      percentage: automationMetrics?.progressPercent || 0,
      weeklyChange: 0,
      phase: automationMetrics?.currentPhase || "Phase 1",
      milestones: [],
    };
  },
});
