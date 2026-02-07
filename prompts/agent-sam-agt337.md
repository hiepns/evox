# SAM — AGT-337: Loop P4 Enforcement & Auto-Escalation

You are SAM, the backend agent. Your task is AGT-337: Loop P4 — Enforcement & Auto-Escalation.

## Context
The Loop (sent → seen → reply → act → report) P1 and P2 are DONE. Your job is P4: make the Loop enforceable.

## What to build

### 1. Auto-escalation when SLA breached
File: `convex/loopMonitor.ts` (EDIT existing, do NOT create new file)
- When reply SLA > 15 min → auto-notify MAX
- When action SLA > 2 hours → auto-notify CEO (via dispatch)
- When report SLA > 24 hours → mark loop as broken + alert

### 2. Enforcement mutations
File: `convex/messageStatus.ts` (EDIT existing)
- Add `enforceLoopOrder` mutation: agents CANNOT skip stages (e.g., can't mark "acted" before "replied")
- Add `escalateToManager` mutation: create escalation dispatch when SLA breached
- Add `getAgentLoopCompliance` query: return compliance % per agent

### 3. HTTP endpoints for escalation
File: `convex/http.ts` (EDIT existing, add new routes)
- GET /loop/compliance?agent=sam → agent compliance stats
- GET /loop/breaches → list of current SLA breaches
- POST /loop/escalate → manually escalate a stuck message

### 4. Cron enhancement
File: `convex/crons.ts` (EDIT existing)
- Existing SLA monitor runs every 5 min — enhance to auto-escalate (not just detect)

## Rules (MANDATORY)
1. Read CLAUDE.md first — follow all 8 architecture rules
2. Agent identity: use string names "sam"/"leo", resolve IDs via agentMappings.ts
3. Import from agentRegistry.ts — NEVER hardcode agent arrays
4. Use unifiedMessages table for new messaging
5. NO new schema tables without CEO approval
6. When done: `git add <files> && git commit -m "feat: Loop P4 enforcement (AGT-337)" && git push`

## Files you own (do NOT touch frontend)
- convex/messageStatus.ts
- convex/loopMonitor.ts
- convex/loopMetrics.ts
- convex/agentActions.ts
- convex/http.ts (backend routes only)
- convex/crons.ts

## Proof of work (required)
When done, run:
```bash
git log --oneline -1
git diff --stat HEAD~1
npx next build
```
All three must succeed before marking as done.

## Start
```bash
cd /Users/sonpiaz/evox && git pull origin main
```
Then read CLAUDE.md, then read convex/messageStatus.ts and convex/loopMonitor.ts to understand current code. Then implement.
