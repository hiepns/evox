# CEO Dashboard — Final Design Specification

> **Author:** MAYA (Design) + COLE (Research) | **Date:** 2026-02-05
> **For:** LEO (Frontend Implementation)
> **Status:** APPROVED FOR IMPLEMENTATION

---

## Executive Summary

**Goal:** CEO sees system health and decides in 3 seconds.

**Key Insights from Research:**
- Linear: Monochrome + status colors only, keyboard-first
- Mercury: Hero metrics pattern, generous whitespace
- Vercel: Status dots, relative timestamps, progressive disclosure
- Datadog: Grid layout, investigation workflow
- Arc/Raycast: Command palette, hidden chrome

---

## Design Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | **3-Second Rule** | Critical info above fold |
| 2 | **Traffic Light** | Green/Yellow/Red only |
| 3 | **Mobile-First** | 375px base, scale up |
| 4 | **Glanceable** | Numbers > text |
| 5 | **Action-Oriented** | Show what needs attention |

---

## Information Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  SECOND 1: Is everything OK?                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              🟢 ALL GOOD                              │  │
│  │           4 agents • 12 tasks                         │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  SECOND 2: Are we productive?                               │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │       12        │  │     $4.20       │                   │
│  │   tasks today   │  │   cost today    │                   │
│  └─────────────────┘  └─────────────────┘                   │
├─────────────────────────────────────────────────────────────┤
│  SECOND 3: What needs my attention?                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔴 SAM offline 15m                              [Ping]│  │
│  │ 🟡 AGT-280 blocked 2h                           [View]│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. HeroStatus

**Purpose:** Single glance system health indicator

**Props:**
```typescript
interface HeroStatusProps {
  status: "green" | "yellow" | "red";
  headline: string;           // "ALL GOOD" | "2 BLOCKERS" | "ACTION NEEDED"
  subtext: string;            // "4 agents • 12 tasks"
  lastSync?: Date;            // For stale data indicator
  onClick?: () => void;       // Expand for details
}
```

**Visual States:**
```
GREEN (All Good)              YELLOW (Warning)              RED (Critical)
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│                     │      │                     │      │                     │
│   🟢 ALL GOOD       │      │   🟡 2 BLOCKERS     │      │   🔴 ACTION NEEDED  │
│                     │      │                     │      │                     │
│  4 agents • 12 tasks│      │  Check alerts below │      │  1 agent offline    │
│                     │      │                     │      │                     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
bg-green-500/10               bg-yellow-500/10              bg-red-500/10
border-green-500/30           border-yellow-500/30          border-red-500/30
```

**Status Logic:**
```typescript
function calculateHeroStatus(data: DashboardData): HeroStatus {
  // Priority 1: Critical (RED)
  if (data.offlineAgents > 0) {
    return {
      status: "red",
      headline: "ACTION NEEDED",
      subtext: `${data.offlineAgents} agent${data.offlineAgents > 1 ? 's' : ''} offline`
    };
  }

  // Priority 2: Warning (YELLOW)
  if (data.blockedTasks > 0) {
    return {
      status: "yellow",
      headline: `${data.blockedTasks} BLOCKER${data.blockedTasks > 1 ? 'S' : ''}`,
      subtext: "Check alerts below"
    };
  }

  // Priority 3: All Good (GREEN)
  return {
    status: "green",
    headline: "ALL GOOD",
    subtext: `${data.activeAgents} agents • ${data.tasksToday} tasks`
  };
}
```

**Dimensions:**
| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Height | 120px | 140px | 160px |
| Width | 100% | 100% | 50% |
| Padding | 24px | 32px | 40px |
| Font (headline) | 24px | 28px | 32px |
| Font (subtext) | 14px | 16px | 18px |

**Accessibility:**
```jsx
<div
  role="status"
  aria-live="polite"
  aria-label={`System status: ${headline}. ${subtext}`}
>
  <span aria-hidden="true">{statusIcon}</span>
  <h1>{headline}</h1>
  <p>{subtext}</p>
</div>
```

---

### 2. MetricCard

**Purpose:** Single key metric with trend indicator

**Props:**
```typescript
interface MetricCardProps {
  value: string | number;     // "12" or 12
  label: string;              // "tasks today"
  trend?: {
    direction: "up" | "down" | "flat";
    value: string;            // "+3" or "-2" or "same"
    comparison: string;       // "vs yesterday"
  };
  color?: "emerald" | "red" | "zinc";  // Value color
  onClick?: () => void;       // Drill down
}
```

**Visual:**
```
┌─────────────────────┐
│                     │
│         12          │  ← Value: 24px bold, emerald-400
│     tasks today     │  ← Label: 10px uppercase, white/40
│     ↑ 3 vs avg      │  ← Trend: 12px, green-400 or red-400
│                     │
└─────────────────────┘
```

**Dimensions:**
| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Height | 80px | 100px | 120px |
| Width | calc(50% - 6px) | calc(25% - 9px) | 200px |
| Padding | 12px | 16px | 20px |
| Value font | 24px | 28px | 32px |
| Label font | 10px | 11px | 12px |

**Required Metrics (CEO Dashboard):**
1. **Tasks Today** — Count of completed tasks
2. **Cost Today** — Total token cost in USD
3. **Active Agents** — X of Y online
4. **Automation Rate** — % tasks without human intervention

---

### 3. AlertList

**Purpose:** Show items requiring CEO attention

**Props:**
```typescript
interface AlertListProps {
  alerts: Alert[];
  maxVisible?: number;        // Default: 3
  onAction?: (alert: Alert, action: string) => void;
}

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  icon: "offline" | "blocked" | "stuck" | "error";
  title: string;              // "SAM offline"
  duration: string;           // "15m"
  actions: AlertAction[];
}

interface AlertAction {
  label: string;              // "Ping"
  action: string;             // "ping_agent"
  primary?: boolean;
}
```

**Visual:**
```
NEEDS ATTENTION (2)
┌───────────────────────────────────────────────────────────┐
│ 🔴 SAM offline 15m                                 [Ping] │  ← 44px height
├───────────────────────────────────────────────────────────┤
│ 🟡 AGT-280 blocked 2h                              [View] │  ← 44px height
└───────────────────────────────────────────────────────────┘

Empty state: Section hidden (not "No alerts")
```

**Severity Colors:**
```typescript
const severityStyles = {
  critical: {
    icon: "bg-red-500",
    text: "text-red-400",
    border: "border-red-500/30"
  },
  warning: {
    icon: "bg-yellow-500",
    text: "text-yellow-400",
    border: "border-yellow-500/30"
  },
  info: {
    icon: "bg-blue-500",
    text: "text-blue-400",
    border: "border-blue-500/30"
  }
};
```

**Alert Types:**
| Type | Icon | Severity | Example |
|------|------|----------|---------|
| Agent offline | 🔴 | critical | "SAM offline 15m" |
| Task blocked | 🟡 | warning | "AGT-280 blocked 2h" |
| Task stuck | 🟡 | warning | "AGT-281 stuck 45m" |
| Build failed | 🔴 | critical | "Build failed on uat" |
| Review needed | 🔵 | info | "PR #42 needs review" |

---

### 4. AgentStrip (TeamStrip)

**Purpose:** Quick team health overview

**Props:**
```typescript
interface AgentStripProps {
  agents: AgentSummary[];
  maxVisible?: number;        // Default: 4 mobile, 6 tablet, all desktop
  onAgentClick?: (agent: AgentSummary) => void;
}

interface AgentSummary {
  id: string;
  name: string;               // "MAX"
  role: "pm" | "backend" | "frontend" | "qa" | "design";
  status: "online" | "busy" | "idle" | "offline";
  currentTask?: string;       // "AGT-281"
  tasksToday: number;
  costToday: number;
}
```

**Visual:**
```
TEAM (4/5)
┌────────┬────────┬────────┬────────┬────────┬──────┐
│  MAX   │  SAM   │  LEO   │ QUINN  │  MAYA  │  +1  │
│   🟢   │   🔴   │   🟡   │   🟢   │   🟢   │      │
│   PM   │Backend │Frontend│   QA   │ Design │      │
└────────┴────────┴────────┴────────┴────────┴──────┘
         ← horizontal scroll on mobile →
```

**Agent Pill Dimensions:**
| Property | Value |
|----------|-------|
| Width | 60px |
| Height | 72px |
| Border radius | 8px |
| Avatar | 24px circle |
| Name font | 10px bold |
| Role font | 8px |

**Status Indicator:**
```typescript
const statusColors = {
  online: "bg-green-500",     // Working on task
  busy: "bg-yellow-500",      // Processing/building
  idle: "bg-zinc-500",        // Online, no task
  offline: "bg-red-500",      // Not responding
} as const;
```

**Overflow Pill:**
```
┌──────┐
│  +3  │  ← Shows count of hidden agents
│      │     Tap to expand all
└──────┘
```

---

### 5. ActivityFeed

**Purpose:** Real-time activity stream

**Props:**
```typescript
interface ActivityFeedProps {
  activities: Activity[];
  maxVisible?: number;        // Default: 5 mobile, 10 desktop
  showTimestamp?: "relative" | "absolute";
}

interface Activity {
  id: string;
  timestamp: Date;
  agent: string;              // "MAX"
  action: string;             // "completed"
  target: string;             // "AGT-281"
  details?: string;           // "fix: postToChannel docs"
}
```

**Visual:**
```
LIVE                                      ● synced 2s ago
┌───────────────────────────────────────────────────────────┐
│ ◉ 2m   MAX   completed AGT-281                            │  ← Pulse animation
│ ○ 5m   LEO   pushed to uat                                │
│ ○ 8m   SAM   started AGT-282                              │
│ ○ 12m  QUINN approved PR #42                              │
│ ○ 15m  MAYA  shipped design system                        │
└───────────────────────────────────────────────────────────┘
```

**Row Layout:**
```
┌───────────────────────────────────────────────────────────┐
│ ◉    2m     MAX    completed AGT-281                      │
│ ↑    ↑      ↑      ↑                                      │
│ dot  time   agent  action + target                        │
│ 8px  40px   48px   flex-1                                 │
└───────────────────────────────────────────────────────────┘
```

**Time Formatting:**
```typescript
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
```

**Visual Freshness:**
```typescript
const freshnessStyles = {
  fresh: "text-white",        // < 10 seconds
  recent: "text-zinc-300",    // < 5 minutes
  stale: "text-zinc-500",     // > 5 minutes
};
```

---

### 6. AgentDetailSheet

**Purpose:** Bottom sheet with agent details (mobile)

**Props:**
```typescript
interface AgentDetailSheetProps {
  agent: AgentDetail;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: "ping" | "assign" | "view_tasks") => void;
}

interface AgentDetail extends AgentSummary {
  lastSeen: Date;
  currentTaskDetails?: {
    ticket: string;
    title: string;
    startedAt: Date;
  };
  recentActivity: Activity[];
  stats: {
    tasksToday: number;
    tasksWeek: number;
    costToday: number;
    avgCostPerTask: number;
  };
}
```

**Visual:**
```
┌─────────────────────────────────────────────────────────────┐
│                    (main dashboard dimmed 50%)              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ← SAM                                            🔴    ││
│  │                                                         ││
│  │  Backend Engineer                                       ││
│  │  Offline 15 min                                         ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  TODAY         THIS WEEK      AVG COST             │││
│  │  │    3              12          $0.47                │││
│  │  │  tasks          tasks         /task                │││
│  │  └─────────────────────────────────────────────────────┘││
│  │                                                         ││
│  │  CURRENT TASK                                           ││
│  │  None (offline)                                         ││
│  │                                                         ││
│  │  RECENT ACTIVITY                                        ││
│  │  • Completed AGT-279                                    ││
│  │  • Pushed fix to uat                                    ││
│  │  • Started at 07:30                                     ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │              PING SAM                               │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Animation:**
```css
/* Sheet slide up */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-enter {
  animation: slideUp 250ms ease-out;
}

.sheet-exit {
  animation: slideUp 200ms ease-in reverse;
}

/* Backdrop fade */
.backdrop {
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 200ms;
}
```

---

## Layout Specifications

### Mobile (< 640px)

```
┌─────────────────────────────────┐
│  EVOX                      ⚙️   │  48px header
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │       🟢 ALL GOOD         │  │  120px hero
│  │    4 agents • 12 tasks    │  │
│  └───────────────────────────┘  │
│                                 │  16px gap
│  ┌─────────────┬─────────────┐  │
│  │     12      │    $4.20    │  │  80px metrics (2 col)
│  │   tasks     │    spent    │  │
│  └─────────────┴─────────────┘  │
│                                 │  16px gap
│  NEEDS ATTENTION                │
│  ┌───────────────────────────┐  │
│  │ 🔴 SAM offline 15m        │  │  44px × n alerts
│  │ 🟡 AGT-280 blocked        │  │
│  └───────────────────────────┘  │
│                                 │  16px gap
│  TEAM (4/5)                     │
│  ┌────┬────┬────┬────┬───┐     │  72px pills (scroll)
│  │MAX │SAM │LEO │QUI │+1 │     │
│  └────┴────┴────┴────┴───┘     │
│                                 │  16px gap
│  LIVE              ● synced 2s  │
│  ┌───────────────────────────┐  │
│  │ 2m  MAX  completed...     │  │  36px × n activity
│  │ 5m  LEO  pushed uat       │  │
│  │ 8m  SAM  started...       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Padding: 16px
Section gap: 16px
Total width: 375px
```

### Tablet (640px - 1024px)

```
┌───────────────────────────────────────────────────────────┐
│  EVOX                                               ⚙️ 👤  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │                         │  │  METRICS                │ │
│  │     🟢 ALL GOOD         │  │ ┌─────────┬───────────┐ │ │
│  │                         │  │ │   12    │   $4.20   │ │ │
│  │   4 agents • 12 tasks   │  │ │  tasks  │   spent   │ │ │
│  │                         │  │ └─────────┴───────────┘ │ │
│  └─────────────────────────┘  │ ┌─────────┬───────────┐ │ │
│                               │ │   4/5   │   85%     │ │ │
│                               │ │ agents  │  automate │ │ │
│                               │ └─────────┴───────────┘ │ │
│                               └─────────────────────────┘ │
│                                                           │
│  ┌───────────────────────────────────────────────────────┐│
│  │  TEAM                                                 ││
│  │ ┌────────┬────────┬────────┬────────┬────────┬──────┐││
│  │ │  MAX   │  SAM   │  LEO   │ QUINN  │  MAYA  │  +1  │││
│  │ │   🟢   │   🔴   │   🟡   │   🟢   │   🟢   │      │││
│  │ └────────┴────────┴────────┴────────┴────────┴──────┘││
│  └───────────────────────────────────────────────────────┘│
│                                                           │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │  NEEDS ATTENTION (2)    │  │  LIVE        ● synced   │ │
│  │  🔴 SAM offline 15m     │  │  2m  MAX  AGT-281       │ │
│  │  🟡 AGT-280 blocked 2h  │  │  5m  LEO  pushed uat    │ │
│  │                         │  │  8m  SAM  completed     │ │
│  └─────────────────────────┘  └─────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘

Padding: 24px
Grid: 2 columns
Gap: 16px
```

### Desktop (> 1024px)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  EVOX Mission Control                                           🔔  ⚙️  👤     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │                              │  │  ┌─────────┬─────────┬─────────┬─────┐ │ │
│  │      🟢 ALL SYSTEMS GO       │  │  │   12    │  $4.20  │   85%   │ 4/5 │ │ │
│  │                              │  │  │  tasks  │  spent  │ automat │team │ │ │
│  │    4 agents working          │  │  └─────────┴─────────┴─────────┴─────┘ │ │
│  │    12 tasks completed        │  │                                         │ │
│  │    $4.20 spent today         │  │  VELOCITY (7 days)                      │ │
│  │                              │  │  ▁▂▄▆█▇▅▃▂▁                             │ │
│  └──────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  TEAM STATUS                                                              │  │
│  │ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐  │  │
│  │ │ MAX 🟢      │ SAM 🔴      │ LEO 🟡      │ QUINN 🟢    │ MAYA 🟢     │  │  │
│  │ │ PM          │ Backend     │ Frontend    │ QA          │ Design      │  │  │
│  │ │ AGT-281     │ Offline     │ Building    │ AGT-280     │ Idle        │  │  │
│  │ │ 3 • $0.80   │ 3 • $1.40   │ 2 • $0.90   │ 2 • $0.60   │ 1 • $0.50   │  │  │
│  │ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  🚨 NEEDS ATTENTION (2)         │  │  📋 LIVE ACTIVITY      ● synced 2s  │  │
│  │ ┌─────────────────────────────┐ │  │  07:45 MAX created AGT-281          │  │
│  │ │ 🔴 SAM offline 15 min       │ │  │  07:44 LEO pushed to uat            │  │
│  │ │    Last: Completed AGT-279  │ │  │  07:42 SAM completed AGT-279        │  │
│  │ │    [Ping] [View Logs]       │ │  │  07:40 QUINN approved PR #42        │  │
│  │ └─────────────────────────────┘ │  │  07:38 MAYA pushed design system    │  │
│  │ ┌─────────────────────────────┐ │  │  07:35 MAX assigned LEO             │  │
│  │ │ 🟡 AGT-280 blocked 2h       │ │  │                                     │  │
│  │ │    Waiting: Deploy access   │ │  │  [View all activity →]              │  │
│  │ │    [View] [Reassign]        │ │  │                                     │  │
│  │ └─────────────────────────────┘ │  └─────────────────────────────────────┘  │
│  └─────────────────────────────────┘                                           │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Color System

### Status Colors (ONLY THESE)

```typescript
const STATUS_COLORS = {
  online: {
    bg: "bg-green-500",
    text: "text-green-400",
    border: "border-green-500/30",
    bgSubtle: "bg-green-500/10",
  },
  busy: {
    bg: "bg-yellow-500",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    bgSubtle: "bg-yellow-500/10",
  },
  idle: {
    bg: "bg-zinc-500",
    text: "text-zinc-400",
    border: "border-zinc-500/30",
    bgSubtle: "bg-zinc-500/10",
  },
  offline: {
    bg: "bg-red-500",
    text: "text-red-400",
    border: "border-red-500/30",
    bgSubtle: "bg-red-500/10",
  },
} as const;
```

### Background Colors

```typescript
const BG_COLORS = {
  page: "bg-black",           // #000000
  surface: "bg-zinc-900",     // #18181b
  raised: "bg-zinc-800",      // #27272a
  hover: "bg-zinc-700",       // #3f3f46
} as const;
```

### Text Colors

```typescript
const TEXT_COLORS = {
  primary: "text-white",      // #ffffff
  secondary: "text-zinc-300", // #d4d4d8
  muted: "text-zinc-500",     // #71717a
  disabled: "text-zinc-600",  // #52525b
} as const;
```

---

## Typography

```typescript
const TYPOGRAPHY = {
  // Hero
  hero: "text-2xl sm:text-3xl lg:text-4xl font-bold",
  heroSub: "text-sm sm:text-base text-zinc-400",

  // Metrics
  metricValue: "text-2xl sm:text-3xl font-bold text-emerald-400",
  metricLabel: "text-[10px] sm:text-xs uppercase tracking-wider text-white/40",
  metricTrend: "text-xs",

  // Section headers
  sectionTitle: "text-[10px] font-bold uppercase tracking-wider text-white/40",

  // Body
  alertText: "text-sm font-medium",
  activityText: "text-xs sm:text-sm text-zinc-400",
  agentName: "text-[10px] font-medium",
  agentRole: "text-[8px] text-zinc-500",

  // Timestamps
  timestamp: "text-[10px] text-zinc-500",
} as const;
```

---

## Spacing System

```typescript
const SPACING = {
  // Page
  pagePadding: "p-4 sm:p-6 lg:p-8",

  // Sections
  sectionGap: "space-y-4 sm:space-y-6",

  // Components
  cardPadding: "p-3 sm:p-4",
  cardGap: "gap-3 sm:gap-4",

  // Elements
  elementGap: "gap-2",
  inlineGap: "gap-1",
} as const;
```

---

## Touch Targets

All interactive elements must meet **44px minimum** touch target:

| Element | Actual Size | Touch Area |
|---------|-------------|------------|
| Hero | 120px × 100% | Full area tappable |
| Metric card | 80px × 50% | Full area tappable |
| Alert row | 44px × 100% | Full area tappable |
| Agent pill | 72px × 60px | Full area tappable |
| Activity row | 36px × 100% | Expand to 44px padding |
| Action button | 32px × 60px | Expand to 44px hitbox |

---

## Animation Specifications

### Timing

```typescript
const ANIMATION = {
  // Duration
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",

  // Easing
  easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
} as const;
```

### Specific Animations

```css
/* Status change pulse */
@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* New activity item */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Loading shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #27272a 0%,
    #3f3f46 50%,
    #27272a 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## Accessibility Checklist

### Required for All Components

- [ ] `role` attribute where appropriate
- [ ] `aria-label` for icon-only buttons
- [ ] `aria-live="polite"` for dynamic content
- [ ] Focus ring visible (`ring-2 ring-white ring-offset-2`)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Color contrast 4.5:1 minimum

### Screen Reader Labels

```typescript
const ARIA_LABELS = {
  hero: (status: string, subtext: string) =>
    `System status: ${status}. ${subtext}`,

  agent: (name: string, role: string, status: string) =>
    `Agent ${name}, ${role}, currently ${status}`,

  alert: (severity: string, message: string) =>
    `${severity} alert: ${message}`,

  metric: (value: string, label: string, trend?: string) =>
    `${label}: ${value}${trend ? `, ${trend}` : ''}`,
};
```

---

## Data Fetching

### Convex Queries Required

```typescript
// api/dashboard.ts
export const getCEODashboard = query({
  args: {},
  returns: v.object({
    hero: v.object({
      status: v.string(),
      headline: v.string(),
      subtext: v.string(),
    }),
    metrics: v.object({
      tasksToday: v.number(),
      costToday: v.number(),
      activeAgents: v.number(),
      totalAgents: v.number(),
      automationRate: v.number(),
    }),
    alerts: v.array(v.object({
      id: v.string(),
      severity: v.string(),
      icon: v.string(),
      title: v.string(),
      duration: v.string(),
      actions: v.array(v.object({
        label: v.string(),
        action: v.string(),
      })),
    })),
    agents: v.array(v.object({
      id: v.string(),
      name: v.string(),
      role: v.string(),
      status: v.string(),
      currentTask: v.optional(v.string()),
      tasksToday: v.number(),
      costToday: v.number(),
    })),
    activities: v.array(v.object({
      id: v.string(),
      timestamp: v.number(),
      agent: v.string(),
      action: v.string(),
      target: v.string(),
      details: v.optional(v.string()),
    })),
    lastSync: v.number(),
  }),
});
```

---

## Implementation Checklist for LEO

### Phase 1: Core Components (Priority: P0)

- [ ] `HeroStatus.tsx` — Status banner with 3 states
- [ ] `MetricCard.tsx` — Single metric with trend
- [ ] `AlertList.tsx` — Actionable alert rows
- [ ] `AgentStrip.tsx` — Horizontal team view
- [ ] `ActivityFeed.tsx` — Real-time activity

### Phase 2: Mobile Layout (Priority: P0)

- [ ] `MobileCEODashboard.tsx` — Mobile layout composition
- [ ] Pull-to-refresh functionality
- [ ] Bottom sheet for agent details
- [ ] Skeleton loading states

### Phase 3: Responsive (Priority: P1)

- [ ] Tablet breakpoint (640px)
- [ ] Desktop breakpoint (1024px)
- [ ] Sparklines for metrics
- [ ] Time range selector

### Phase 4: Polish (Priority: P2)

- [ ] Animations and transitions
- [ ] Empty states
- [ ] Error states
- [ ] Keyboard shortcuts
- [ ] Command palette (Cmd+K)

---

## File Structure

```
components/evox/redesign/
├── index.ts                    # Exports
├── HeroStatus.tsx              # Hero status banner
├── MetricCard.tsx              # Single metric card
├── MetricGrid.tsx              # Grid of metrics
├── AlertList.tsx               # Alert list
├── AlertRow.tsx                # Single alert
├── AgentStrip.tsx              # Team horizontal strip
├── AgentPill.tsx               # Single agent pill
├── AgentDetailSheet.tsx        # Agent detail bottom sheet
├── ActivityFeed.tsx            # Activity stream
├── ActivityRow.tsx             # Single activity
├── MobileCEODashboard.tsx      # Mobile composition
├── TabletCEODashboard.tsx      # Tablet composition
├── DesktopCEODashboard.tsx     # Desktop composition
├── CEODashboard.tsx            # Responsive wrapper
└── skeletons/
    ├── HeroStatusSkeleton.tsx
    ├── MetricCardSkeleton.tsx
    └── DashboardSkeleton.tsx
```

---

## Testing Requirements

### Visual Regression

- [ ] Mobile (375px) — iPhone SE
- [ ] Mobile (428px) — iPhone 14 Pro Max
- [ ] Tablet (768px) — iPad Mini
- [ ] Desktop (1280px) — Laptop
- [ ] Desktop (1920px) — Full HD

### Accessibility

- [ ] Screen reader (VoiceOver, NVDA)
- [ ] Keyboard navigation only
- [ ] Color contrast analyzer
- [ ] Focus indicator visibility

### Performance

- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s
- [ ] Bundle size < 50KB (component)
- [ ] No layout shifts (CLS = 0)

---

## References

- COLE Research: `docs/DASHBOARD-RESEARCH.md`
- Wireframes: `docs/WIREFRAMES.md`
- Design System: `docs/DESIGN-SYSTEM.md`
- Current Implementation: `components/evox/redesign/`

---

_MAYA | Design Lead | Feb 5, 2026_
_Approved for implementation. LEO — start with Phase 1._
