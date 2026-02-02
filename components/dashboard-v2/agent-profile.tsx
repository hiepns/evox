"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface AgentProfileProps {
  agentId: Id<"agents">;
  name: string;
  role: string;
  status: string;
  avatar: string;
  onClose: () => void;
}

const statusDot: Record<string, string> = {
  online: "bg-green-500",
  busy: "bg-yellow-500",
  idle: "bg-gray-500",
  offline: "bg-red-500",
};

export function AgentProfile({ name, role, status, avatar, onClose }: AgentProfileProps) {
  const dot = statusDot[status?.toLowerCase() ?? "offline"] ?? statusDot.offline;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-50">Agent Profile</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-50"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-zinc-800">
            <AvatarFallback className="bg-zinc-800 text-zinc-50">{avatar}</AvatarFallback>
          </Avatar>
          <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900", dot)} />
        </div>
        <div>
          <p className="font-medium text-zinc-50">{name}</p>
          <p className="text-xs text-zinc-500">{role}</p>
          <p className="text-xs capitalize text-zinc-400">{status}</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase text-zinc-500">About / SOUL</h4>
          <p className="mt-1 text-sm text-zinc-400 italic">—</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-zinc-500">Skills</h4>
          <p className="mt-1 text-sm text-zinc-400 italic">—</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-zinc-500">Current tasks</h4>
          <p className="mt-1 text-sm text-zinc-400 italic">—</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-zinc-500">Send message</h4>
          <textarea
            placeholder="Type a message..."
            className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
            rows={2}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
