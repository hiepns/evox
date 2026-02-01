/**
 * Agent Completion API (AGT-124)
 *
 * Problem: All 30 tasks attributed to SON because Linear API key = Son's.
 * Solution: Agents write directly to Convex with correct attribution.
 *
 * ADR-001: Attribution comes from caller (agent name), not Linear API key.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveAgentIdByName } from "./agentMappings";

// Valid agent names
const AGENT_NAMES = ["leo", "sam", "max", "ella"] as const;

// Valid actions
const ACTIONS = ["completed", "in_progress", "comment"] as const;

// Map action to task status
const ACTION_TO_STATUS: Record<string, "done" | "in_progress" | undefined> = {
  completed: "done",
  in_progress: "in_progress",
  comment: undefined, // comment doesn't change status
};

/**
 * Complete/update a task with correct agent attribution.
 *
 * Usage from CLI:
 * npx convex run agentActions:completeTask '{"agent":"sam","ticket":"AGT-124","action":"completed","summary":"Built the API"}'
 */
export const completeTask = mutation({
  args: {
    agent: v.union(
      v.literal("leo"),
      v.literal("sam"),
      v.literal("max"),
      v.literal("ella")
    ),
    ticket: v.string(), // e.g., "AGT-124"
    action: v.union(
      v.literal("completed"),
      v.literal("in_progress"),
      v.literal("comment")
    ),
    summary: v.string(),
    filesChanged: v.optional(v.array(v.string())),
    commitHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Resolve agent name → Convex agent ID
    const agentId = await resolveAgentIdByName(ctx.db, args.agent);
    const agentDoc = await ctx.db.get(agentId);
    if (!agentDoc) {
      throw new Error(`Agent not found for ID: ${agentId}`);
    }

    // 2. Find task by linearIdentifier (e.g., "AGT-124")
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_linearId")
      .collect();

    // Find by linearIdentifier (case-insensitive)
    const task = tasks.find(
      (t) => t.linearIdentifier?.toUpperCase() === args.ticket.toUpperCase()
    );

    if (!task) {
      // Task not in Convex yet — log activity anyway for visibility
      await ctx.db.insert("activities", {
        agent: agentId,
        action: args.action === "completed" ? "completed_task" :
                args.action === "in_progress" ? "started_task" : "commented",
        target: args.ticket,
        metadata: {
          summary: args.summary,
          filesChanged: args.filesChanged,
          commitHash: args.commitHash,
          source: "agent_api",
          note: "Task not found in Convex, activity logged for tracking",
        },
        createdAt: now,
      });

      return {
        success: true,
        warning: `Task ${args.ticket} not found in Convex. Activity logged.`,
        agent: args.agent,
        agentId,
      };
    }

    // 3. Update task status if action changes it
    const newStatus = ACTION_TO_STATUS[args.action];
    const oldStatus = task.status;

    if (newStatus && newStatus !== oldStatus) {
      await ctx.db.patch(task._id, {
        status: newStatus,
        assignee: agentId, // Ensure agent is assigned
        updatedAt: now,
      });
    }

    // 4. Create activity record with correct agent attribution
    const activityAction = args.action === "completed" ? "completed_task" :
                          args.action === "in_progress" ? "started_task" : "commented_task";

    await ctx.db.insert("activities", {
      agent: agentId,
      action: activityAction,
      target: task._id,
      metadata: {
        summary: args.summary,
        filesChanged: args.filesChanged,
        commitHash: args.commitHash,
        source: "agent_api",
        linearIdentifier: task.linearIdentifier,
        statusChange: newStatus ? { from: oldStatus, to: newStatus } : undefined,
      },
      createdAt: now,
    });

    // 5. Create a message/comment on the task (for thread visibility)
    const commentContent = [
      `**${agentDoc.name.toUpperCase()}** ${args.action === "completed" ? "completed" : args.action === "in_progress" ? "started working on" : "commented on"} ${task.linearIdentifier}`,
      "",
      args.summary,
      args.filesChanged?.length ? `\n**Files:** ${args.filesChanged.join(", ")}` : "",
      args.commitHash ? `\n**Commit:** ${args.commitHash}` : "",
    ].filter(Boolean).join("\n");

    await ctx.db.insert("messages", {
      from: agentId,
      content: commentContent,
      channel: "dev",
      mentions: [],
      createdAt: now,
    });

    return {
      success: true,
      taskId: task._id,
      agent: args.agent,
      agentId,
      action: args.action,
      statusChange: newStatus ? { from: oldStatus, to: newStatus } : null,
      linearIdentifier: task.linearIdentifier,
    };
  },
});

/**
 * Query to verify agent completion stats (for dashboard).
 */
export const getAgentStats = query({
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const tasks = await ctx.db.query("tasks").collect();

    const stats = agents.map((agent) => {
      const agentTasks = tasks.filter((t) => t.assignee === agent._id);
      const completed = agentTasks.filter((t) => t.status === "done").length;
      const inProgress = agentTasks.filter((t) => t.status === "in_progress").length;
      const total = agentTasks.length;

      return {
        name: agent.name,
        role: agent.role,
        completed,
        inProgress,
        total,
      };
    });

    return stats;
  },
});
