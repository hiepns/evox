"use client";

/**
 * AGT-342: Agent Career Profile
 *
 * Route: /agents/[name]
 * Sections: Hero, Stats Grid, Skills, Feedback, Timeline, Learnings.
 */

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const AGENT_COLORS: Record<string, string> = {
  max: "text-purple-400",
  sam: "text-emerald-400",
  leo: "text-blue-400",
  quinn: "text-amber-400",
};

const STATUS_DOT: Record<string, string> = {
  online: "bg-green-500",
  busy: "bg-yellow-500",
  idle: "bg-zinc-500",
  offline: "bg-red-500",
};

function timeAgo(ts: number) {
  return formatDistanceToNow(ts, { addSuffix: true });
}

export default function AgentProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const agentName = name.toLowerCase();

  const profile = useQuery(api.agentProfiles.getCareerProfile, { agentName });
  const timeline = useQuery(api.agentProfiles.getCareerTimeline, { agentName, limit: 10 });
  const learningsData = useQuery(api.agentLearning.getLearnings, { agent: agentName, verifiedOnly: true, limit: 10 });

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading profile...</div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Agent not found</div>
      </div>
    );
  }

  const statusKey = (profile.status ?? "offline").toLowerCase();
  const stats = [
    { label: "Tasks Done", value: profile.tasksCompleted, sub: `${profile.tasksCompleted24h} today` },
    { label: "Success", value: `${Math.round(profile.successRate * 100)}%`, sub: `${profile.tasksCompleted7d} this week` },
    { label: "Loop", value: `${Math.round(profile.loopCompletionRate * 100)}%`, sub: `${profile.slaBreaches} breaches` },
    { label: "Rating", value: profile.avgRating.toFixed(1), sub: `${profile.totalFeedbackCount} reviews` },
    { label: "Cost 7d", value: `$${profile.totalCost7d.toFixed(2)}`, sub: `$${profile.avgCostPerTask.toFixed(3)}/task` },
    { label: "Learnings", value: profile.verifiedLearnings, sub: `${profile.totalLearnings} total` },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-zinc-800/60">
        <Link href="/agents" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
          &larr; Hall of Fame
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h1 className={cn("text-3xl font-bold uppercase", AGENT_COLORS[agentName] ?? "text-zinc-200")}>
              {profile.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-zinc-500 capitalize">{profile.role}</span>
              <span className="text-zinc-700">|</span>
              <span className="text-sm text-zinc-500">{profile.autonomyLevelName}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[statusKey] ?? STATUS_DOT.offline)} />
              <span className="text-xs text-zinc-500 capitalize">{statusKey}</span>
              {profile.daysSinceFirstTask > 0 && (
                <>
                  <span className="text-zinc-700">|</span>
                  <span className="text-xs text-zinc-600">{profile.daysSinceFirstTask}d tenure</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid (2x3) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{s.label}</div>
              <div className="text-xl font-bold tabular-nums text-white">{s.value}</div>
              <div className="text-[10px] text-zinc-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Skills</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {profile.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400">{skill.name}</span>
                    <span className="text-[10px] tabular-nums text-zinc-500">{skill.proficiency}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", skill.verified ? "bg-emerald-500" : "bg-zinc-500")}
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback by Category */}
        {Object.keys(profile.feedbackByCategory).length > 0 && (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Feedback ({profile.totalFeedbackCount})
              </span>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(profile.feedbackByCategory).map(([cat, rating]) => (
                <div key={cat} className="flex items-center justify-between bg-zinc-900 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-zinc-500 capitalize">{cat}</span>
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    rating >= 4 ? "text-emerald-400" : rating >= 3 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Timeline</span>
          </div>
          <div className="divide-y divide-zinc-800/30">
            {timeline && timeline.length > 0 ? (
              timeline.map((item, i) => (
                <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                  <div className={cn(
                    "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                    item.type === "task" ? "bg-emerald-500" : "bg-zinc-600"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-300 truncate">{item.title}</span>
                      {item.linearUrl && (
                        <a
                          href={item.linearUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-zinc-600 hover:text-zinc-400 shrink-0"
                        >
                          {item.linearIdentifier ?? "Linear"}
                        </a>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-700 mt-0.5">{timeAgo(item.timestamp)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-xs text-zinc-700">No recent activity</div>
            )}
          </div>
        </div>

        {/* Learnings */}
        {learningsData && learningsData.learnings.length > 0 && (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Verified Learnings ({learningsData.stats.verified})
              </span>
            </div>
            <div className="divide-y divide-zinc-800/30">
              {learningsData.learnings.slice(0, 8).map((learning, i) => (
                <div key={learning._id ?? i} className="px-4 py-2.5 flex items-start gap-2">
                  <span className="text-emerald-500 text-xs shrink-0 mt-0.5">&#10003;</span>
                  <span className="text-xs text-zinc-400">{learning.lesson}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
