import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get daily standup report per agent
 * Returns breakdown of completed, in-progress, and blocked tasks for each agent
 *
 * @param date - Optional date string (YYYY-MM-DD), defaults to today
 */
export const getDaily = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split("T")[0];
    const dayStart = new Date(targetDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999);

    // Get all agents
    const agents = await ctx.db.query("agents").collect();

    // Get all tasks
    const allTasks = await ctx.db.query("tasks").collect();

    // Get activities for the day to track task completions
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_created_at", (q) =>
        q.gte("createdAt", dayStart).lte("createdAt", dayEnd)
      )
      .collect();

    // Build per-agent report
    const agentReports = await Promise.all(
      agents.map(async (agent) => {
        // Completed: tasks moved to "done" status today
        const completedTaskIds = activities
          .filter(
            (a) =>
              a.agent === agent._id &&
              a.action === "updated_task_status" &&
              a.metadata?.to === "done"
          )
          .map((a) => a.target);

        const completedTasks = allTasks.filter((t) =>
          completedTaskIds.includes(t._id)
        );

        // In Progress: currently assigned tasks with in_progress status
        const inProgressTasks = allTasks.filter(
          (t) => t.assignee === agent._id && t.status === "in_progress"
        );

        // Blocked: tasks with "blocked" in title/description or specific blocked status
        // Note: We don't have a "blocked" status in schema yet, so we check for keyword
        const blockedTasks = allTasks.filter(
          (t) =>
            t.assignee === agent._id &&
            (t.status === "backlog" ||
              t.title.toLowerCase().includes("blocked") ||
              t.description.toLowerCase().includes("blocked"))
        );

        // Count activities for this agent today
        const todayActivities = activities.filter(
          (a) => a.agent === agent._id
        ).length;

        return {
          agent: {
            id: agent._id,
            name: agent.name,
            role: agent.role,
            avatar: agent.avatar,
            status: agent.status,
          },
          completed: completedTasks.map((t) => ({
            id: t._id,
            title: t.title,
            priority: t.priority,
            linearIdentifier: t.linearIdentifier,
          })),
          inProgress: inProgressTasks.map((t) => ({
            id: t._id,
            title: t.title,
            priority: t.priority,
            linearIdentifier: t.linearIdentifier,
          })),
          blocked: blockedTasks.map((t) => ({
            id: t._id,
            title: t.title,
            priority: t.priority,
            linearIdentifier: t.linearIdentifier,
          })),
          activityCount: todayActivities,
        };
      })
    );

    return {
      date: targetDate,
      agents: agentReports,
    };
  },
});

/**
 * Get daily standup summary with aggregate stats
 * Returns overall metrics for the day
 *
 * @param date - Optional date string (YYYY-MM-DD), defaults to today
 */
export const getDailySummary = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split("T")[0];
    const dayStart = new Date(targetDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999);

    // Get all tasks
    const allTasks = await ctx.db.query("tasks").collect();

    // Get activities for the day
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_created_at", (q) =>
        q.gte("createdAt", dayStart).lte("createdAt", dayEnd)
      )
      .collect();

    // Count unique agents active today
    const activeAgentIds = new Set(activities.map((a) => a.agent));

    // Tasks completed today (moved to "done" status)
    const completedTaskIds = activities
      .filter(
        (a) => a.action === "updated_task_status" && a.metadata?.to === "done"
      )
      .map((a) => a.target);

    const tasksCompleted = new Set(completedTaskIds).size;

    // Tasks currently in progress
    const tasksInProgress = allTasks.filter(
      (t) => t.status === "in_progress"
    ).length;

    // Blocked tasks (keyword-based detection)
    const tasksBlocked = allTasks.filter(
      (t) =>
        t.status === "backlog" ||
        t.title.toLowerCase().includes("blocked") ||
        t.description.toLowerCase().includes("blocked")
    ).length;

    // Messages sent today
    const messagesSent = activities.filter(
      (a) => a.action === "sent_message"
    ).length;

    // Total activities
    const totalActivities = activities.length;

    return {
      date: targetDate,
      totalActivities,
      tasksCompleted,
      tasksInProgress,
      tasksBlocked,
      agentsActive: activeAgentIds.size,
      messagesSent,
    };
  },
});
