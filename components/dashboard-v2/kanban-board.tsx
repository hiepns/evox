"use client";

import { TaskCard } from "./task-card";
import type { KanbanTask } from "./task-card";

export type { KanbanTask };
import { cn } from "@/lib/utils";

type KanbanStatus = "todo" | "in_progress" | "review" | "done";

const COLUMNS: { status: KanbanStatus; title: string }[] = [
  { status: "todo", title: "TODO" },
  { status: "in_progress", title: "IN PROGRESS" },
  { status: "review", title: "REVIEW" },
  { status: "done", title: "DONE" },
];

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
  className?: string;
}

export function KanbanBoard({ tasks, onTaskClick, className = "" }: KanbanBoardProps) {
  const byStatus = (status: KanbanStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className={cn("flex h-full gap-4 overflow-x-auto pb-4", className)}>
      {COLUMNS.map((col) => {
        const columnTasks = byStatus(col.status);
        return (
          <div
            key={col.status}
            className="flex w-64 shrink-0 flex-col rounded-lg border border-zinc-800 bg-zinc-900/30"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{col.title}</h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{columnTasks.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
