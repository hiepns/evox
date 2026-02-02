"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsBarProps {
  taskCounts: {
    backlog: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
}

/** AGT-181 fix: Analytics bar — horizontal stats above kanban */
export function AnalyticsBar({ taskCounts }: AnalyticsBarProps) {
  const dashboardStats = useQuery(api.dashboard.getStats);

  const stats = useMemo(() => {
    const total = taskCounts.backlog + taskCounts.todo + taskCounts.inProgress + taskCounts.review + taskCounts.done;
    const completed = taskCounts.done;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgress = taskCounts.inProgress + taskCounts.review;
    const lastSyncTime = dashboardStats?.lastSyncTime ?? null;

    return {
      total,
      completed,
      completionRate,
      inProgress,
      todo: taskCounts.todo,
      backlog: taskCounts.backlog,
      lastSyncTime,
    };
  }, [taskCounts, dashboardStats]);

  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">Completion</span>
        <span className="text-sm font-semibold text-white/90">{stats.completionRate}%</span>
        <span className="text-xs text-white/40">({stats.completed}/{stats.total})</span>
      </div>
      <div className="h-4 w-px bg-white/[0.08]" />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">In Progress</span>
        <span className="text-sm font-semibold text-white/90">{stats.inProgress}</span>
      </div>
      <div className="h-4 w-px bg-white/[0.08]" />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">Queue</span>
        <span className="text-sm font-semibold text-white/90">{stats.todo}</span>
      </div>
      <div className="h-4 w-px bg-white/[0.08]" />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">Backlog</span>
        <span className="text-sm font-semibold text-white/90">{stats.backlog}</span>
      </div>
      {stats.lastSyncTime && (
        <>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">Last Sync</span>
            <span className="text-xs text-white/40">{formatDistanceToNow(stats.lastSyncTime, { addSuffix: true })}</span>
          </div>
        </>
      )}
    </div>
  );
}
