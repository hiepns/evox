"use client";

import { usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notification-bell";

/** AGT-143: Map Convex notification doc to UI shape; filter to last 24h to avoid stale data */
const NOTIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

function useNotificationsForHeader() {
  const agents = useQuery(api.agents.list);
  const agentId = Array.isArray(agents) && agents.length > 0 ? (agents[0] as { _id: Id<"agents"> })._id : null;
  const rawNotifications = useQuery(
    api.notifications.getByAgent,
    agentId ? { agent: agentId } : "skip"
  );
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const cutoff = Date.now() - NOTIFICATION_TTL_MS;
  const list =
    Array.isArray(rawNotifications) && agentId
      ? rawNotifications
          .filter((n) => n.createdAt >= cutoff)
          .map((n) => {
            const title = n.title ?? "";
            const agentName = title.split(" ")[0] ?? "System";
            return {
              id: n._id,
              type: n.type as "mention" | "assignment" | "status_change",
              agentName,
              agentAvatar: agentName.slice(0, 2).toUpperCase(),
              title,
              timestamp: new Date(n.createdAt),
              isUnread: !n.read,
            };
          })
      : [];

  const onMarkAllRead = () => {
    if (agentId) markAllAsRead({ agent: agentId });
  };

  return { notifications: list, onMarkAllRead };
}

export function Header() {
  const pathname = usePathname();
  const { notifications, onMarkAllRead } = useNotificationsForHeader();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.length > 0
    ? segments.map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
    : ["Dashboard"];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-8">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">EVOX</span>
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-zinc-600" />
            <span className={i === breadcrumbs.length - 1 ? "text-zinc-50" : "text-zinc-400"}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
        />
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
            SP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
