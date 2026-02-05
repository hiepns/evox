"use client";

/**
 * AgentGrid - Agent status at a glance
 * Shows: Green/red dots based on heartbeat, current task
 */

interface Agent {
  name: string;
  computedStatus: "online" | "busy" | "idle" | "offline";
  currentTask?: string;
  lastSeen?: number;
}

interface AgentGridProps {
  agents: Agent[];
}

const statusColors: Record<string, string> = {
  online: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
  busy: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]",
  idle: "bg-zinc-500",
  offline: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
};

function getStatusColor(status: string): string {
  return statusColors[status.toLowerCase()] || statusColors.offline;
}

function formatLastSeen(timestamp?: number): string {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h`;
}

export function AgentGrid({ agents }: AgentGridProps) {
  const onlineCount = agents.filter(
    (a) => a.computedStatus === "online" || a.computedStatus === "busy"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-400">Team Status</h2>
        <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
          {onlineCount}/{agents.length} online
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {agents.slice(0, 6).map((agent, i) => (
          <div
            key={agent.name || i}
            className="flex flex-col items-center gap-1.5 p-3 sm:p-2 rounded-lg bg-zinc-900/50 active:bg-zinc-800 sm:hover:bg-zinc-900 transition-colors min-h-[60px]"
          >
            {/* Status dot */}
            <div className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full ${getStatusColor(agent.computedStatus)}`} />

            {/* Name */}
            <span className="text-[11px] sm:text-[10px] font-medium text-zinc-300 truncate w-full text-center">
              {agent.name || "?"}
            </span>

            {/* Last seen (if not online) */}
            {agent.computedStatus !== "online" && agent.lastSeen && (
              <span className="text-[9px] text-zinc-600">
                {formatLastSeen(agent.lastSeen)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Current tasks (if any agent is busy) */}
      {agents.some((a) => a.computedStatus === "busy" && a.currentTask) && (
        <div className="mt-3 space-y-1">
          {agents
            .filter((a) => a.computedStatus === "busy" && a.currentTask)
            .map((agent) => (
              <div
                key={agent.name}
                className="text-xs text-zinc-500 flex items-center gap-2"
              >
                <span className="text-zinc-400 font-medium">{agent.name}</span>
                <span className="truncate">{agent.currentTask}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
