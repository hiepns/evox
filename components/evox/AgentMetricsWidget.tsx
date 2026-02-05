"use client";

/**
 * AGT-292: Agent Metrics Dashboard Widget
 *
 * Four key metrics for CEO visibility:
 * - Velocity: Tasks completed per hour
 * - Cost: Tokens per task (average)
 * - Quality: Error rate (failures/total)
 * - Efficiency: Average time to complete task
 *
 * Real-time via Convex subscriptions.
 */

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface AgentMetricsWidgetProps {
  className?: string;
}

type PerformanceMetric = {
  agentName: string;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  totalCost: number;
  avgDurationMinutes: number;
  utilizationPercent: number;
  errorRate: number;
  velocityPerHour: number;
};

type TeamSummary = {
  team: {
    completed24h: number;
    completed7d: number;
    completedAllTime: number;
    inProgress: number;
  };
  velocity: {
    tasksPerHour: number;
    tasksPerDay: number;
  };
  agentBreakdown: Record<string, number>;
  updatedAt: number;
};

type CostBreakdown = {
  agentName: string;
  totalCost: number;
  totalTasks: number;
  avgCostPerTask: number;
  totalTokens: number;
};

export function AgentMetricsWidget({ className }: AgentMetricsWidgetProps) {
  const teamSummary = useQuery(api.agentStats.getTeamSummary) as TeamSummary | undefined;
  const allMetrics = useQuery(api.performanceMetrics.getAllAgentsMetrics) as PerformanceMetric[] | undefined;
  const costBreakdown = useQuery(api.performanceMetrics.getCostBreakdown) as CostBreakdown[] | undefined;

  const metrics = useMemo(() => {
    if (!teamSummary) {
      return null;
    }

    // Velocity: tasks per hour (from team summary)
    const velocity = teamSummary.velocity.tasksPerHour;

    // Cost: average tokens per task (from cost breakdown)
    let avgCost = 0;
    let totalTokens = 0;
    let totalTasks = 0;
    if (costBreakdown && costBreakdown.length > 0) {
      for (const c of costBreakdown) {
        totalTokens += c.totalTokens;
        totalTasks += c.totalTasks;
      }
      avgCost = totalTasks > 0 ? Math.round(totalTokens / totalTasks) : 0;
    }

    // Quality: error rate (from all metrics)
    let errorRate = 0;
    let totalCompleted = 0;
    let totalFailed = 0;
    if (allMetrics && allMetrics.length > 0) {
      for (const m of allMetrics) {
        totalCompleted += m.totalTasksCompleted;
        totalFailed += m.totalTasksFailed;
      }
      const total = totalCompleted + totalFailed;
      errorRate = total > 0 ? Math.round((totalFailed / total) * 100) : 0;
    }

    // Efficiency: average duration (from all metrics)
    let avgDuration = 0;
    let durationCount = 0;
    if (allMetrics && allMetrics.length > 0) {
      for (const m of allMetrics) {
        if (m.avgDurationMinutes && m.avgDurationMinutes > 0) {
          avgDuration += m.avgDurationMinutes;
          durationCount++;
        }
      }
      avgDuration = durationCount > 0 ? Math.round(avgDuration / durationCount) : 0;
    }

    return {
      velocity,
      avgCost,
      errorRate,
      avgDuration,
      tasksToday: teamSummary.team.completed24h,
      tasksWeek: teamSummary.team.completed7d,
      inProgress: teamSummary.team.inProgress,
    };
  }, [teamSummary, allMetrics, costBreakdown]);

  if (!metrics) {
    return (
      <div className={cn("rounded border border-white/10 bg-zinc-900/50 p-4", className)}>
        <div className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-3">
          Agent Metrics
        </div>
        <div className="text-xs text-white/30 animate-pulse">Loading metrics...</div>
      </div>
    );
  }

  // Determine health status for each metric
  const velocityStatus = metrics.velocity >= 0.5 ? "good" : metrics.velocity >= 0.2 ? "warning" : "bad";
  const costStatus = metrics.avgCost <= 50000 ? "good" : metrics.avgCost <= 100000 ? "warning" : "bad";
  const qualityStatus = metrics.errorRate <= 10 ? "good" : metrics.errorRate <= 25 ? "warning" : "bad";
  const efficiencyStatus = metrics.avgDuration <= 30 ? "good" : metrics.avgDuration <= 60 ? "warning" : "bad";

  const statusColor = (status: string) => {
    switch (status) {
      case "good": return "text-emerald-400";
      case "warning": return "text-yellow-400";
      case "bad": return "text-red-400";
      default: return "text-white";
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "good": return "bg-emerald-500/10 border-emerald-500/30";
      case "warning": return "bg-yellow-500/10 border-yellow-500/30";
      case "bad": return "bg-red-500/10 border-red-500/30";
      default: return "bg-zinc-800/50 border-white/10";
    }
  };

  return (
    <div className={cn("rounded border border-white/10 bg-zinc-900/50 p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[9px] font-medium uppercase tracking-wider text-white/30">
          Agent Metrics
        </div>
        <div className="text-[10px] text-white/40">
          Today: {metrics.tasksToday} tasks | In Progress: {metrics.inProgress}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Velocity */}
        <div className={cn("rounded border p-3", statusBg(velocityStatus))}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-wider text-white/50">Velocity</span>
            <span className="text-[10px] text-white/40">tasks/hr</span>
          </div>
          <div className={cn("text-2xl font-bold tabular-nums", statusColor(velocityStatus))}>
            {metrics.velocity.toFixed(2)}
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            Target: &gt; 0.5/hr
          </div>
        </div>

        {/* Cost */}
        <div className={cn("rounded border p-3", statusBg(costStatus))}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-wider text-white/50">Cost</span>
            <span className="text-[10px] text-white/40">tokens/task</span>
          </div>
          <div className={cn("text-2xl font-bold tabular-nums", statusColor(costStatus))}>
            {metrics.avgCost > 0 ? `${(metrics.avgCost / 1000).toFixed(1)}K` : "—"}
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            Target: &lt; 50K
          </div>
        </div>

        {/* Quality */}
        <div className={cn("rounded border p-3", statusBg(qualityStatus))}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-wider text-white/50">Quality</span>
            <span className="text-[10px] text-white/40">error rate</span>
          </div>
          <div className={cn("text-2xl font-bold tabular-nums", statusColor(qualityStatus))}>
            {metrics.errorRate}%
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            Target: &lt; 10%
          </div>
        </div>

        {/* Efficiency */}
        <div className={cn("rounded border p-3", statusBg(efficiencyStatus))}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-wider text-white/50">Efficiency</span>
            <span className="text-[10px] text-white/40">avg time</span>
          </div>
          <div className={cn("text-2xl font-bold tabular-nums", statusColor(efficiencyStatus))}>
            {metrics.avgDuration > 0 ? `${metrics.avgDuration}m` : "—"}
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            Target: &lt; 30 min
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
        <span className="text-white/40">
          Week: {metrics.tasksWeek} completed
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded",
          velocityStatus === "good" && qualityStatus === "good"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-yellow-500/20 text-yellow-400"
        )}>
          {velocityStatus === "good" && qualityStatus === "good" ? "On Track" : "Needs Attention"}
        </span>
      </div>
    </div>
  );
}
