/**
 * AGT-340: Career Profiles + Hall of Fame
 *
 * Three read-only queries aggregating existing tables for agent career
 * profile cards and hall of fame leaderboard. No new tables created.
 */
import { v } from "convex/values";
import { query } from "./_generated/server";
import { VALID_AGENTS } from "./agentRegistry";
import { resolveAgentIdByName } from "./agentMappings";

const DAY_MS = 24 * 60 * 60 * 1000;
const AUTONOMY_LEVELS: Record<number, string> = { 1: "Intern", 2: "Specialist", 3: "Lead" };

/** Build array of date strings for the last N days (YYYY-MM-DD). */
function recentDateStrings(days: number): string[] {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) =>
    new Date(now - i * DAY_MS).toISOString().slice(0, 10)
  );
}

// ---------------------------------------------------------------------------
// Query 1: getCareerProfile
// ---------------------------------------------------------------------------
export const getCareerProfile = query({
  args: { agentName: v.string() },
  handler: async (ctx, { agentName }) => {
    const name = agentName.toLowerCase();
    const now = Date.now();
    const past24h = now - DAY_MS;
    const past7d = now - 7 * DAY_MS;

    // Agent identity — resolve via agentMappings (case-insensitive)
    let agentId;
    try {
      agentId = await resolveAgentIdByName(ctx.db, name);
    } catch {
      return null;
    }
    const agent = await ctx.db.get(agentId);
    if (!agent) return null;

    // Skills
    const skillsDoc = await ctx.db.query("agentSkills").withIndex("by_agent", (q) => q.eq("agentId", agent._id)).first();
    const autonomyLevel = skillsDoc?.autonomyLevel ?? 1;
    const skills = (skillsDoc?.skills ?? []).map((s) => ({
      name: s.name, proficiency: s.proficiency, verified: s.verified,
    }));

    // Tasks (done + failed counts by period)
    const allAgentTasks = await ctx.db.query("tasks").withIndex("by_agentName", (q) => q.eq("agentName", name)).collect();
    const doneTasks = allAgentTasks.filter((t) => t.status === "done");
    const failedTasks = allAgentTasks.filter((t) => t.status === "backlog" && t.lastError);
    const tasksCompleted = doneTasks.length;
    const tasksCompleted7d = doneTasks.filter((t) => t.completedAt && t.completedAt >= past7d).length;
    const tasksCompleted24h = doneTasks.filter((t) => t.completedAt && t.completedAt >= past24h).length;
    const totalAttempted = tasksCompleted + failedTasks.length;
    const successRate = totalAttempted > 0 ? tasksCompleted / totalAttempted : 0;

    // Tenure
    const sorted = [...allAgentTasks].sort((a, b) => a.createdAt - b.createdAt);
    const firstTaskDate = sorted.length > 0 ? sorted[0].createdAt : null;
    const daysSinceFirstTask = firstTaskDate ? Math.floor((now - firstTaskDate) / DAY_MS) : 0;

    // Feedback
    const feedbackDocs = await ctx.db.query("agentFeedback").withIndex("by_target", (q) => q.eq("targetAgent", name)).collect();
    const totalFeedbackCount = feedbackDocs.length;
    const avgRating = totalFeedbackCount > 0
      ? feedbackDocs.reduce((s, f) => s + f.rating, 0) / totalFeedbackCount : 0;
    const catAccum: Record<string, { sum: number; count: number }> = {};
    for (const fb of feedbackDocs) {
      const c = catAccum[fb.category] ?? (catAccum[fb.category] = { sum: 0, count: 0 });
      c.sum += fb.rating; c.count += 1;
    }
    const feedbackByCategory: Record<string, number> = {};
    for (const [cat, d] of Object.entries(catAccum)) {
      feedbackByCategory[cat] = Math.round((d.sum / d.count) * 100) / 100;
    }

    // Learnings
    const learnings = await ctx.db.query("agentLearnings").withIndex("by_agent", (q) => q.eq("agent", name)).collect();
    const totalLearnings = learnings.length;
    const verifiedLearnings = learnings.filter((l) => l.verified).length;

    // Loop Metrics (latest daily)
    const latestLoop = await ctx.db.query("loopMetrics")
      .withIndex("by_agent_period", (q) => q.eq("agentName", name).eq("period", "daily"))
      .order("desc").first();

    // Cost (performanceMetrics, last 7 days)
    const dates7d = recentDateStrings(7);
    let totalCost7d = 0, totalTasksForCost = 0;
    for (const date of dates7d) {
      const rows = await ctx.db.query("performanceMetrics")
        .withIndex("by_agent_date", (q) => q.eq("agentName", name).eq("date", date)).collect();
      for (const m of rows) { totalCost7d += m.totalCost; totalTasksForCost += m.tasksCompleted; }
    }
    totalCost7d = Math.round(totalCost7d * 10000) / 10000;
    const avgCostPerTask = totalTasksForCost > 0
      ? Math.round((totalCost7d / totalTasksForCost) * 10000) / 10000 : 0;

    return {
      name: agent.name, role: agent.role, avatar: agent.avatar ?? null,
      status: agent.status, soul: agent.soul ?? null,
      autonomyLevel, autonomyLevelName: AUTONOMY_LEVELS[autonomyLevel] ?? "Unknown",
      tasksCompleted, tasksCompleted7d, tasksCompleted24h,
      successRate: Math.round(successRate * 1000) / 1000,
      loopCompletionRate: latestLoop?.completionRate ?? 0,
      avgResponseTimeMs: latestLoop?.avgReplyTimeMs ?? 0,
      slaBreaches: latestLoop?.slaBreaches ?? 0,
      skills, verifiedLearnings, totalLearnings,
      avgRating: Math.round(avgRating * 100) / 100,
      feedbackByCategory, totalFeedbackCount,
      totalCost7d, avgCostPerTask, firstTaskDate, daysSinceFirstTask,
    };
  },
});

// ---------------------------------------------------------------------------
// Query 2: getHallOfFame
// ---------------------------------------------------------------------------
export const getHallOfFame = query({
  handler: async (ctx) => {
    const now = Date.now();
    const validNames = new Set(VALID_AGENTS.map((a) => a.toLowerCase()));
    const agents = (await ctx.db.query("agents").collect()).filter((a) => validNames.has(a.name.toLowerCase()));

    // Bulk-fetch shared data
    const allDone = await ctx.db.query("tasks").withIndex("by_status", (q) => q.eq("status", "done")).collect();
    const allTasks = await ctx.db.query("tasks").collect();
    const allFeedback = await ctx.db.query("agentFeedback").collect();
    const allLoop = await ctx.db.query("loopMetrics")
      .withIndex("by_period", (q) => q.eq("period", "daily")).order("desc").collect();
    const dates7d = recentDateStrings(7);
    const allPerf = (await ctx.db.query("performanceMetrics").collect())
      .filter((m) => dates7d.includes(m.date));

    // Per-agent scoring
    type Entry = {
      name: string; role: string; avatar: string | null; status: string;
      tasksCompleted: number; successRate: number; loopCompletionRate: number;
      avgRating: number; avgCostPerTask: number; avgResponseTimeMs: number;
      feedbackGivenCount: number; compositeScore: number; rank: number; badges: string[];
    };
    const entries: Entry[] = [];

    for (const agent of agents) {
      const n = agent.name.toLowerCase();
      const done = allDone.filter((t) => t.agentName?.toLowerCase() === n);
      const tc = done.length;
      const failed = allTasks.filter((t) => t.agentName?.toLowerCase() === n && t.status === "backlog" && t.lastError);
      const att = tc + failed.length;
      const sr = att > 0 ? tc / att : 0;
      const loop = allLoop.find((m) => m.agentName.toLowerCase() === n);
      const fb = allFeedback.filter((f) => f.targetAgent.toLowerCase() === n);
      const ar = fb.length > 0 ? fb.reduce((s, f) => s + f.rating, 0) / fb.length : 0;
      const perf = allPerf.filter((m) => m.agentName.toLowerCase() === n);
      const costSum = perf.reduce((s, m) => s + m.totalCost, 0);
      const perfTasks = perf.reduce((s, m) => s + m.tasksCompleted, 0);
      const fbGiven = allFeedback.filter((f) => f.fromAgent?.toLowerCase() === n).length;

      entries.push({
        name: agent.name, role: agent.role, avatar: agent.avatar ?? null, status: agent.status,
        tasksCompleted: tc,
        successRate: Math.round(sr * 1000) / 1000,
        loopCompletionRate: loop?.completionRate ?? 0,
        avgRating: Math.round(ar * 100) / 100,
        avgCostPerTask: perfTasks > 0 ? Math.round((costSum / perfTasks) * 10000) / 10000 : 0,
        avgResponseTimeMs: loop?.avgReplyTimeMs ?? 0,
        feedbackGivenCount: fbGiven,
        compositeScore: 0, rank: 0, badges: [],
      });
    }

    // Composite score: 40% tasks, 30% loop, 20% rating, 10% success
    const maxTasks = Math.max(...entries.map((e) => e.tasksCompleted), 1);
    for (const e of entries) {
      e.compositeScore = Math.round(
        (0.4 * (e.tasksCompleted / maxTasks) +
         0.3 * e.loopCompletionRate +
         0.2 * (e.avgRating / 5) +
         0.1 * e.successRate) * 1000
      ) / 1000;
    }

    entries.sort((a, b) => b.compositeScore - a.compositeScore);
    entries.forEach((e, i) => { e.rank = i + 1; });

    // Badges
    if (entries.length > 0) {
      entries[0].badges.push("Top Performer");
      const byTasks = [...entries].sort((a, b) => b.tasksCompleted - a.tasksCompleted);
      if (byTasks[0].tasksCompleted > 0) byTasks[0].badges.push("Most Productive");
      const byLoop = [...entries].sort((a, b) => b.loopCompletionRate - a.loopCompletionRate);
      if (byLoop[0].loopCompletionRate > 0.9) byLoop[0].badges.push("Loop Master");
      const costEligible = entries.filter((e) => e.tasksCompleted > 5);
      if (costEligible.length > 0) {
        [...costEligible].sort((a, b) => a.avgCostPerTask - b.avgCostPerTask)[0].badges.push("Cost Efficient");
      }
      const responders = entries.filter((e) => e.avgResponseTimeMs > 0);
      if (responders.length > 0) {
        [...responders].sort((a, b) => a.avgResponseTimeMs - b.avgResponseTimeMs)[0].badges.push("Quick Responder");
      }
      const byMentor = [...entries].sort((a, b) => b.feedbackGivenCount - a.feedbackGivenCount);
      if (byMentor[0].feedbackGivenCount > 0) byMentor[0].badges.push("Mentor");
    }

    const topPerformer = entries.length > 0 ? entries[0].name : null;
    const mostTasks = entries.length > 0
      ? [...entries].sort((a, b) => b.tasksCompleted - a.tasksCompleted)[0].name : null;
    const bestLoopRate = entries.length > 0
      ? [...entries].sort((a, b) => b.loopCompletionRate - a.loopCompletionRate)[0].name : null;

    const leaderboard = entries.map(({ avgCostPerTask: _c, avgResponseTimeMs: _r, feedbackGivenCount: _f, ...rest }) => rest);

    return { leaderboard, topPerformer, mostTasks, bestLoopRate, updatedAt: now };
  },
});

// ---------------------------------------------------------------------------
// Query 3: getCareerTimeline
// ---------------------------------------------------------------------------
export const getCareerTimeline = query({
  args: { agentName: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { agentName, limit = 20 }) => {
    const name = agentName.toLowerCase();

    // Completed tasks
    const tasks = await ctx.db.query("tasks")
      .withIndex("by_agentName", (q) => q.eq("agentName", name))
      .filter((q) => q.eq(q.field("status"), "done"))
      .collect();
    const taskItems = tasks.filter((t) => t.completedAt).map((t) => ({
      type: "task" as const, title: t.title, timestamp: t.completedAt!,
      linearIdentifier: t.linearIdentifier ?? undefined,
      linearUrl: t.linearUrl ?? undefined, taskStatus: t.status,
    }));

    // Activity events (resolve agent to use by_agent index)
    let agentId;
    try {
      agentId = await resolveAgentIdByName(ctx.db, name);
    } catch {
      return taskItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }
    let eventItems: { type: "event"; title: string; timestamp: number; category?: string; eventType?: string }[] = [];
    {
      const events = await ctx.db.query("activityEvents")
        .withIndex("by_agent", (q) => q.eq("agentId", agentId))
        .order("desc").take(limit * 2);
      eventItems = events.map((e) => ({
        type: "event" as const, title: e.title, timestamp: e.timestamp,
        category: e.category, eventType: e.eventType,
      }));
    }

    // Merge and sort
    return [...taskItems, ...eventItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
});
