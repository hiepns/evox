# LEO — AGT-336: Loop P3 CEO Dashboard Loop Visibility

You are LEO, the frontend agent. Your task is AGT-336: Loop P3 — CEO Dashboard with Loop Visibility.

## Context
The Loop (sent → seen → reply → act → report) backend is DONE (P1 + P2). Your job is P3: make the Loop VISIBLE on the CEO dashboard.

## What to build

### 1. Loop Status Overview Widget
File: `components/evox/CEODashboard.tsx` (EDIT existing — do NOT create a new dashboard!)
- Add a "Loop Health" section showing:
  - Total messages in each stage (sent/seen/replied/acted/reported)
  - Number of SLA breaches (reply >15min, action >2h, report >24h)
  - Overall loop completion rate %

### 2. Agent Accountability Grid
File: `components/evox/CEODashboard.tsx` or new sub-component `components/evox/LoopAgentGrid.tsx`
- Table/grid showing each agent's Loop stats:
  - Agent name | Pending replies | Avg reply time | SLA breaches | Compliance %
- Color-coded: green (on track), yellow (warning), red (breached)

### 3. Loop Timeline
File: new sub-component `components/evox/LoopTimeline.tsx`
- Visual timeline for a selected message showing:
  - sent → seen (Xmin) → replied (Xmin) → acted (Xmin) → reported (Xmin)
  - Highlight stages that breached SLA in red

### 4. SLA Breach Alerts
File: `components/evox/CEODashboard.tsx`
- Alert banner when active SLA breaches exist
- Click to see which agent/message is breaching

## Data sources (Convex queries to use)
- `api.loopMetrics.*` — aggregated metrics
- `api.loopMonitor.*` — SLA breach detection
- `api.messageStatus.*` — individual message status
- `api.unifiedMessages.*` — message list with statusCode field (0=sent, 1=seen, 2=replied, 3=acted, 4=reported, 5=broken)

Read `convex/messageStatus.ts` to understand the StatusLabels and SLA constants.

## Rules (MANDATORY)
1. Read CLAUDE.md first — follow all 8 architecture rules
2. EDIT CEODashboard.tsx — do NOT create another dashboard variant
3. Use Tailwind + shadcn/ui — no raw CSS, no hardcoded hex colors
4. Import agent list from lib/constants.ts — NEVER hardcode ["sam", "leo", ...]
5. Status colors: use exhaustive maps, not ternaries (see docs/patterns/STATUS-COLORS.md)
6. When done: `git add <files> && git commit -m "feat: Loop P3 CEO dashboard visibility (AGT-336)" && git push`

## Files you own (do NOT touch convex/ backend)
- components/evox/CEODashboard.tsx
- components/evox/LoopAgentGrid.tsx (NEW - ok to create)
- components/evox/LoopTimeline.tsx (NEW - ok to create)
- components/dashboard-v2/ (if extending existing components)

## Proof of work (required)
When done, run:
```bash
git log --oneline -1
git diff --stat HEAD~1
npx next build
```

## Start
```bash
cd /Users/sonpiaz/evox && git pull origin main
```
Then read CLAUDE.md, then read components/evox/CEODashboard.tsx and convex/messageStatus.ts. Then implement.
