"use client";

/**
 * AlertsBanner - Red banner for critical issues
 * Shows: Agents offline >30min, circuit breakers, stuck tasks
 */

interface Alert {
  id: string;
  type: "agent_offline" | "circuit_breaker" | "task_stuck" | "health_check";
  severity: "critical" | "warning";
  title: string;
  description?: string;
  timestamp?: number;
}

interface AlertsBannerProps {
  alerts: Alert[];
  offlineAgents?: string[];
}

export function AlertsBanner({ alerts, offlineAgents = [] }: AlertsBannerProps) {
  // Combine offline agents with other alerts
  const allAlerts: Alert[] = [
    ...alerts,
    ...(offlineAgents.length > 0
      ? [
          {
            id: "offline-agents",
            type: "agent_offline" as const,
            severity: "critical" as const,
            title: `${offlineAgents.length} agent${offlineAgents.length > 1 ? "s" : ""} offline`,
            description: offlineAgents.join(", "),
          },
        ]
      : []),
  ];

  const criticalAlerts = allAlerts.filter((a) => a.severity === "critical");
  const warningAlerts = allAlerts.filter((a) => a.severity === "warning");

  if (allAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Critical alerts */}
      {criticalAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="text-red-400 font-semibold text-base sm:text-sm">
              {alert.title}
            </span>
          </div>
          {alert.description && (
            <div className="text-red-300/60 text-sm sm:text-xs mt-2 pl-6">
              {alert.description}
            </div>
          )}
        </div>
      ))}

      {/* Warning alerts */}
      {warningAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-yellow-950/30 border border-yellow-900/30 rounded-xl p-4 min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
            <span className="text-yellow-400 font-semibold text-base sm:text-sm">
              {alert.title}
            </span>
          </div>
          {alert.description && (
            <div className="text-yellow-300/60 text-sm sm:text-xs mt-2 pl-6">
              {alert.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
