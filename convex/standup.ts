import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get daily standup report per agent (AGT-134: group by task.agentName, not assignee).
 * Returns breakdown of completed, in-progress, backlog, blocked for each canonical agent (max, sam, leo).
 *
 * @param startTs - Start of day (UTC ms). Frontend sends user's local day range.
 * @param endTs - End of day (UTC ms).
 */
export const getDaily = query({
  args: {
    startTs: v.optional(v.number()),
    endTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dayStart =
      args.startTs ?? new Date(new Date().toISOString().split("T")[0]).setHours(0, 0, 0, 0);
    const dayEnd =
      args.endTs ?? new Date(new Date().toISOString().split("T")[0]).setHours(23, 59, 59, 999);

    // AGT-134: Use agentMappings (max, sam, leo) for column order; group tasks by task.agentName
    const mappings = await ctx.db.query("agentMappings").collect();
    const allTasks = await ctx.db.query("tasks").collect();

    const allActivities = await ctx.db
      .query("activities")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    const activities = allActivities.filter(
      (a) => a.createdAt >= dayStart && a.createdAt <= dayEnd
    );

    // Task IDs moved to "done" today (any agent) — for "completed today" column
    const completedTaskIdsToday = new Set(
      activities
        .filter(
          (a) =>
            a.action === "updated_task_status" &&
            (a.metadata as { to?: string } | undefined)?.to === "done"
        )
        .map((a) => a.target)
    );

    const agentReports = await Promise.all(
      mappings.map(async (mapping) => {
        const agent = await ctx.db.get(mapping.convexAgentId);
        if (!agent) return null;
        const canonicalName = mapping.name;

        // AGT-134: filter tasks by task.agentName (not assignee)
        const byAgentName = (t: { agentName?: string | null }) =>
          (t.agentName ?? "").toLowerCase() === canonicalName.toLowerCase();

        const completedTasks = allTasks.filter(
          (t) =>
            byAgentName(t) &&
            t.status === "done" &&
            completedTaskIdsToday.has(t._id)
        );
        const inProgressTasks = allTasks.filter(
          (t) => byAgentName(t) && t.status === "in_progress"
        );
        const backlogTasks = allTasks.filter(
          (t) =>
            byAgentName(t) &&
            (t.status === "backlog" || t.status === "todo")
        );
        const blockedTasks = allTasks.filter(
          (t) =>
            byAgentName(t) &&
            (t.title.toLowerCase().includes("blocked") ||
              t.description.toLowerCase().includes("blocked"))
        );

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
          backlog: backlogTasks.map((t) => ({
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
      startTs: dayStart,
      endTs: dayEnd,
      agents: agentReports.filter((r): r is NonNullable<typeof r> => r != null),
    };
  },
});

/**
 * Get daily standup summary with aggregate stats
 * Returns overall metrics for the day
 *
 * @param startTs - Start of day (UTC ms). Frontend sends user's local day range.
 * @param endTs - End of day (UTC ms).
 */
export const getDailySummary = query({
  args: {
    startTs: v.optional(v.number()),
    endTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dayStart =
      args.startTs ?? new Date(new Date().toISOString().split("T")[0]).setHours(0, 0, 0, 0);
    const dayEnd =
      args.endTs ?? new Date(new Date().toISOString().split("T")[0]).setHours(23, 59, 59, 999);

    // Get all tasks
    const allTasks = await ctx.db.query("tasks").collect();

    // Get activities for the day
    // Note: Convex indexes don't support range queries, so we filter after fetching
    const allActivitiesForSummary = await ctx.db
      .query("activities")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    const activities = allActivitiesForSummary.filter(
      (a) => a.createdAt >= dayStart && a.createdAt <= dayEnd
    );

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

    // Backlog = status backlog or todo (do not count as blocked)
    const tasksBacklog = allTasks.filter(
      (t) => t.status === "backlog" || t.status === "todo"
    ).length;

    // Blocked = only keyword "blocked" in title/description
    const tasksBlocked = allTasks.filter(
      (t) =>
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
      startTs: dayStart,
      endTs: dayEnd,
      totalActivities,
      tasksCompleted,
      tasksInProgress,
      tasksBacklog,
      tasksBlocked,
      agentsActive: activeAgentIds.size,
      messagesSent,
    };
  },
});
