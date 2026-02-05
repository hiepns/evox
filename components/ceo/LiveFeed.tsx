"use client";

/**
 * LiveFeed - Unified Activity + Communications feed
 * Shows what's happening RIGHT NOW. Filtered for signal, not noise.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";

interface LiveFeedProps {
  limit?: number;
  className?: string;
}

export function LiveFeed({ limit = 8, className }: LiveFeedProps) {
  const feed = useQuery(api.ceoMetrics.getLiveFeed, { limit });

  if (!feed) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-6 text-zinc-500 text-sm">
          No recent activity
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {feed.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 py-2 px-2 rounded hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-lg shrink-0">{item.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="font-semibold text-white text-sm">
                  {item.agent}
                </span>
                <span className="text-zinc-400 text-sm">{item.action}</span>
                <span className="text-zinc-300 text-sm truncate">
                  {item.detail}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-zinc-500 shrink-0">
              {formatDistanceToNow(item.timestamp, { addSuffix: false })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
