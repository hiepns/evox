"use client";

/**
 * EVOX Dashboard v0.2 - Lean & Clean
 * 
 * Only what matters:
 * 1. Agent status (dots)
 * 2. Key metrics (tasks, cost)
 * 3. Live activity feed
 * 4. Alerts (if any)
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function V2Dashboard() {
  const status = useQuery(api.http.getStatus);
  
  if (!status) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const agents = status.agents || [];
  const activities = status.recentActivity || [];
  const onlineCount = agents.filter((a: any) => a.computedStatus === "online").length;
  const totalCount = agents.length;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">EVOX v0.2</h1>
        <span className="text-zinc-500 text-sm">Lean Dashboard</span>
      </header>

      {/* Agent Status */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {agents.slice(0, 6).map((agent: any, i: number) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                agent.computedStatus === "online" ? "bg-green-500" :
                agent.computedStatus === "busy" ? "bg-yellow-500" :
                "bg-red-500"
              }`}
              title={agent.name}
            />
          ))}
          <span className="text-zinc-400 text-sm ml-2">
            {onlineCount}/{totalCount} online
          </span>
        </div>
        <div className="flex gap-4 text-sm text-zinc-500">
          {agents.slice(0, 6).map((agent: any, i: number) => (
            <span key={i} className="w-4 text-center">{agent.name?.[0]}</span>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="text-2xl font-bold">{activities.length}</div>
          <div className="text-zinc-500 text-sm">activities</div>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="text-2xl font-bold">{onlineCount}</div>
          <div className="text-zinc-500 text-sm">agents online</div>
        </div>
      </section>

      {/* Alerts - Only show if agents offline */}
      {onlineCount < totalCount && (
        <section className="mb-6">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
            <div className="text-red-400 font-medium">
              ⚠️ {totalCount - onlineCount} agent(s) offline
            </div>
            <div className="text-red-300/70 text-sm mt-1">
              {agents
                .filter((a: any) => a.computedStatus !== "online")
                .map((a: any) => a.name)
                .join(", ")}
            </div>
          </div>
        </section>
      )}

      {/* Live Activity */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Live Activity</h2>
        <div className="space-y-2">
          {activities.slice(0, 10).map((activity: any, i: number) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-lg p-3 flex items-start gap-3"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.eventType === "channel_message" ? "bg-blue-500" :
                activity.eventType === "dm_sent" ? "bg-purple-500" :
                activity.eventType === "task_completed" ? "bg-green-500" :
                "bg-zinc-500"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {activity.agentName || "System"}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <div className="text-zinc-400 text-sm truncate">
                  {activity.description || activity.title || "Activity"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-zinc-800 text-center text-zinc-600 text-xs">
        EVOX v0.2 • Database preserved from v0.1
      </footer>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
