"use client";

/**
 * EVOX Dashboard v0.2 - Lean & Mobile-first
 * Includes AgentCommsWidget for agent-to-agent communication
 */

import { useEffect, useState } from "react";
import { AgentCommsWidget } from "@/components/dashboard-v2";

interface Agent {
  name: string;
  computedStatus?: string;
  status?: string;
}

interface Activity {
  _id: string;
  agentName?: string;
  eventType?: string;
  description?: string;
  title?: string;
  timestamp: number;
}

interface StatusData {
  agents: Agent[];
  recentActivity: Activity[];
}

export default function V2Dashboard() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://gregarious-elk-556.convex.site/status");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading EVOX...</div>
      </div>
    );
  }

  const agents = data.agents || [];
  const activities = data.recentActivity || [];
  const onlineCount = agents.filter(
    (a) => a.computedStatus === "online" || a.computedStatus === "busy" || a.status === "busy"
  ).length;

  // Filter channel messages for AgentCommsWidget
  const channelMessages = activities.filter((a) => a.eventType === "channel_message");

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">EVOX</h1>
          <span className="text-zinc-600 text-xs">v0.2</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-zinc-400 text-xs">Live</span>
        </div>
      </header>

      {/* Agent Status Grid */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-400">Team Status</h2>
          <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
            {onlineCount}/{agents.length} online
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {agents.slice(0, 6).map((agent, i) => {
            const isOnline = agent.computedStatus === "online" || agent.computedStatus === "busy" || agent.status === "busy";
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-zinc-900/50 active:bg-zinc-800 min-h-[52px]"
              >
                <div
                  className={`w-4 h-4 rounded-full ${
                    isOnline
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                      : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  }`}
                />
                <span className="text-[11px] font-medium text-zinc-300 truncate w-full text-center">
                  {agent.name || "?"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
          <div className="text-3xl font-bold text-green-400">{onlineCount}</div>
          <div className="text-zinc-500 text-xs uppercase tracking-wide mt-1">Online</div>
        </div>
        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
          <div className="text-3xl font-bold text-blue-400">{activities.length}</div>
          <div className="text-zinc-500 text-xs uppercase tracking-wide mt-1">Activities</div>
        </div>
      </section>

      {/* Agent Communications Widget */}
      <section className="mb-6">
        <AgentCommsWidget messages={channelMessages} limit={6} />
      </section>

      {/* Live Activity Feed */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-400">Live Activity</h2>
          <span className="text-[10px] text-zinc-600">{activities.length} events</span>
        </div>
        <div className="space-y-2">
          {activities.slice(0, 6).map((activity, i) => (
            <div
              key={activity._id || i}
              className="bg-zinc-900/50 active:bg-zinc-800 rounded-lg p-4 min-h-[56px]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-blue-400">
                  {activity.agentName || "System"}
                </span>
                <span className="text-zinc-600 text-xs">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              <div className="text-zinc-400 text-sm line-clamp-2">
                {activity.description || activity.title || "Activity"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 pb-6 border-t border-zinc-800/50 text-center">
        <span className="text-zinc-700 text-xs tracking-wider uppercase">
          EVOX v0.2 • Auto-refresh 5s
        </span>
      </footer>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h`;
}
