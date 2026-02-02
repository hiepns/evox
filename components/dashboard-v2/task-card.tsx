"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type KanbanStatus = "todo" | "in_progress" | "review" | "done";
type Priority = "low" | "medium" | "high";

const priorityColors: Record<Priority, string> = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-blue-500",
};

export interface KanbanTask {
  id: string;
  title: string;
  status: KanbanStatus;
  priority: Priority;
  assigneeAvatar?: string;
  assigneeName?: string;
  linearIdentifier?: string;
  linearUrl?: string;
  updatedAt?: number;
  tags?: string[];
}

interface TaskCardProps {
  task: KanbanTask;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = (task.priority ?? "low") as Priority;
  const barColor = priorityColors[priority] ?? priorityColors.low;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800/80",
        "border-l-4",
        barColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-50">{task.title}</p>
          {task.linearIdentifier && (
            <a
              href={task.linearUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-zinc-500 hover:text-zinc-400"
            >
              {task.linearIdentifier}
            </a>
          )}
        </div>
        {task.assigneeAvatar && (
          <Avatar className="h-6 w-6 shrink-0 border border-zinc-700">
            <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-50">{task.assigneeAvatar}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            {tag}
          </span>
        ))}
        {task.updatedAt != null && (
          <span className="text-[10px] text-zinc-500">{formatDistanceToNow(task.updatedAt, { addSuffix: true })}</span>
        )}
      </div>
    </button>
  );
}
