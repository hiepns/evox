# AGT-281: Health & Error Dashboard Widget

> **Priority:** Medium
> **Owner:** LEO
> **Status:** To Do

---

## Problem

No visibility into system health. Can't see error rates or incidents.

## Solution

Dashboard widget showing real-time health metrics.

## Design

```
┌─────────────────────────────────────────┐
│ System Health                    [Live] │
├─────────────────────────────────────────┤
│ ● Overall: 94% healthy                  │
│                                         │
│ Agent Uptime (24h)                      │
│ MAX   ████████████████████ 98%          │
│ SAM   ██████████████████░░ 92%          │
│ LEO   ████████████████████ 99%          │
│ QUINN ████████████████░░░░ 85%          │
│                                         │
│ Error Rate (1h)                         │
│ Build failures: 2                       │
│ API errors: 0                           │
│ Timeouts: 1                             │
│                                         │
│ Recent Incidents                        │
│ ⚠️ SAM: Build failed (auto-rolled back) │
│ ✓ Resolved: 5min ago                    │
└─────────────────────────────────────────┘
```

## Implementation

### Backend Query

```typescript
// convex/monitoring.ts
export const getSystemHealth = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // Agent uptime from heartbeats
    const agents = await ctx.db.query("agents").collect();
    const uptime = await Promise.all(
      agents.map(async (agent) => {
        const heartbeats = await ctx.db
          .query("heartbeats")
          .withIndex("by_agent", (q) => q.eq("agent", agent._id))
          .filter((q) => q.gt(q.field("timestamp"), oneDayAgo))
          .collect();

        const onlineCount = heartbeats.filter(
          (h) => h.status === "online" || h.status === "busy"
        ).length;

        return {
          name: agent.name,
          uptime: heartbeats.length > 0
            ? Math.round((onlineCount / heartbeats.length) * 100)
            : 0,
          status: agent.status,
        };
      })
    );

    // Error counts
    const errors = await ctx.db
      .query("executionLogs")
      .withIndex("by_level", (q) => q.eq("level", "error"))
      .filter((q) => q.gt(q.field("timestamp"), oneHourAgo))
      .collect();

    const errorsByType = {
      build: errors.filter((e) => e.message.includes("build")).length,
      api: errors.filter((e) => e.message.includes("API")).length,
      timeout: errors.filter((e) => e.message.includes("timeout")).length,
    };

    // Recent incidents
    const incidents = await ctx.db
      .query("executionLogs")
      .withIndex("by_level", (q) => q.eq("level", "error"))
      .order("desc")
      .take(5);

    // Overall health score
    const avgUptime = uptime.reduce((sum, a) => sum + a.uptime, 0) / uptime.length;
    const errorPenalty = Math.min(errors.length * 2, 20);
    const healthScore = Math.max(0, Math.round(avgUptime - errorPenalty));

    return {
      healthScore,
      uptime,
      errorsByType,
      totalErrors: errors.length,
      incidents: incidents.map((i) => ({
        agent: i.agentName,
        message: i.message.slice(0, 100),
        timestamp: i.timestamp,
        resolved: i.metadata?.resolved ?? false,
      })),
    };
  },
});
```

### Frontend Component

```typescript
// components/evox/HealthWidget.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function HealthWidget() {
  const health = useQuery(api.monitoring.getSystemHealth);

  if (!health) return <HealthSkeleton />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Health</CardTitle>
        <Badge variant={health.healthScore > 90 ? "success" : "warning"}>
          {health.healthScore}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uptime bars */}
        <div>
          <h4 className="text-sm font-medium mb-2">Agent Uptime (24h)</h4>
          {health.uptime.map((agent) => (
            <div key={agent.name} className="flex items-center gap-2 mb-1">
              <span className="w-12 text-xs">{agent.name}</span>
              <Progress value={agent.uptime} className="flex-1" />
              <span className="w-10 text-xs text-right">{agent.uptime}%</span>
            </div>
          ))}
        </div>

        {/* Error counts */}
        <div>
          <h4 className="text-sm font-medium mb-2">Errors (1h)</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-950/30 rounded p-2">
              <div className="text-lg font-bold">{health.errorsByType.build}</div>
              <div className="text-xs text-zinc-400">Build</div>
            </div>
            <div className="bg-red-950/30 rounded p-2">
              <div className="text-lg font-bold">{health.errorsByType.api}</div>
              <div className="text-xs text-zinc-400">API</div>
            </div>
            <div className="bg-red-950/30 rounded p-2">
              <div className="text-lg font-bold">{health.errorsByType.timeout}</div>
              <div className="text-xs text-zinc-400">Timeout</div>
            </div>
          </div>
        </div>

        {/* Recent incidents */}
        {health.incidents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Incidents</h4>
            {health.incidents.slice(0, 3).map((incident, i) => (
              <div key={i} className="flex items-start gap-2 text-xs mb-1">
                <span>{incident.resolved ? "✓" : "⚠️"}</span>
                <span className="font-medium">{incident.agent}:</span>
                <span className="text-zinc-400 truncate flex-1">
                  {incident.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `convex/monitoring.ts` | Add getSystemHealth |
| `components/evox/HealthWidget.tsx` | Create |
| `app/page.tsx` | Add widget to dashboard |

## Success Criteria

- [ ] Real-time health metrics visible
- [ ] Agent uptime percentages accurate
- [ ] Error counts by type
- [ ] Recent incidents list
- [ ] Auto-refresh (Convex real-time)

## Testing

```bash
# Generate some errors
curl -X POST "$EVOX/logIncident" \
  -H "Content-Type: application/json" \
  -d '{"agentName": "SAM", "level": "error", "message": "Test build failure"}'

# Check health endpoint
curl -s "$EVOX/systemHealth" | jq
```
