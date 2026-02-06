"use client";

import type { KanbanTask } from "./task-card";

/** AGT-173: Task Detail stub — title + description (full detail in future AGT-114) */
interface TaskDetailStubProps {
  task: KanbanTask | null;
  onClose: () => void;
  /** When true, omit header (used inside context panel) */
  embedded?: boolean;
}

export function TaskDetailStub({ task, onClose, embedded = false }: TaskDetailStubProps) {
  if (!task) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {!embedded && (
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <h3 className="text-xs font-medium tracking-widest uppercase text-secondary">Task Detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-secondary transition-colors hover:text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-secondary">Title</h4>
            <p className="mt-1 text-sm text-primary">{task.title}</p>
          </div>
          {task.linearIdentifier && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-secondary">Ticket</h4>
              <a
                href={task.linearUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 font-mono text-xs text-secondary hover:text-primary"
              >
                {task.linearIdentifier}
              </a>
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-secondary">Description</h4>
            <p className="mt-1 text-sm italic text-secondary">—</p>
          </div>
        </div>
      </div>
    </div>
  );
}
