# EVOX Directive: The Loop Implementation

**From:** CEO (Son)
**To:** EVOX (COO)
**Date:** Feb 5, 2026
**Priority:** P0 — TOP PRIORITY

---

## Mission

Coordinate full implementation of **"The Loop"** — Agent Accountability System.
North Star: `sent → seen → reply → act → report`. Zero dropped work.

---

## Linear Tickets (AGT team)

| Ticket | Phase | Agent | Priority | State | Effort |
|--------|-------|-------|----------|-------|--------|
| AGT-334 | P1: Backend Foundation | **SAM** | Urgent | **Todo** | 13h |
| AGT-335 | P2: Agent Protocol | **SAM** | Urgent | Backlog | 10h |
| AGT-336 | P3: CEO Dashboard | **LEO** | High | Backlog | 20h |
| AGT-337 | P4: Enforcement | **SAM** | High | Backlog | 12h |
| AGT-338 | P5: Analytics | **LEO** | Medium | Backlog | 9h |

**Total:** 64 hours (8 working days with parallel work)

## Dependencies (already set in Linear)

```
AGT-334 (P1) ──blocks──→ AGT-335 (P2) ──blocks──→ AGT-337 (P4)
     └────────blocks──→ AGT-336 (P3) ──blocks──→ AGT-338 (P5)
```

## Your Orders

### 1. Dispatch SAM immediately

SAM starts **AGT-334** (P1: Backend Foundation) NOW.

Dispatch command:
```
Ticket: AGT-334
Title: Loop P1: Backend Foundation - Schema & Mutations
Priority: Urgent
Spec: docs/THE-LOOP-IMPLEMENTATION.md (Phase 1)
North Star: docs/THE-LOOP.md

Tasks:
1. Schema migration — extend agentMessages with loop tracking fields
2. Loop status mutations — markAsActed, markAsReported, markLoopBroken
3. SLA monitoring cron — every 5 min
4. Metrics aggregation — hourly cron

Files to modify:
- convex/schema.ts
- convex/messageStatus.ts
- convex/loopMonitor.ts (NEW)
- convex/loopMetrics.ts (NEW)

Acceptance: Loop closes end-to-end (send → seen → reply → act → report)
Model: Use Opus 4.6 for schema design, Sonnet for implementation
```

### 2. Queue LEO

LEO can start **AGT-336** (P3: CEO Dashboard) as soon as P1 schema is deployed.

Do NOT dispatch LEO yet. Wait until SAM confirms schema is ready.
LEO's current task: Continue dashboard work or AGT-287 (Tailwind cleanup).

### 3. QUINN standby

QUINN prepares test strategy for The Loop:
- Unit tests for loop mutations
- Integration tests for full loop cycle
- E2E test for dashboard

Do NOT dispatch for implementation. QA role only.

### 4. MAX coordination

Clear MAX's stale dispatch (AGT-108).
MAX assists with documentation and coordination during The Loop.

### 5. Monitor & Report

Every 2 hours, report to CEO:
- SAM progress on AGT-334
- Blockers (if any)
- ETA for P1 completion

Escalate immediately if:
- SAM stuck > 30 min
- Schema conflict with existing tables
- Build fails

---

## Timeline

```
Week 1 (Feb 5-7):
  Day 1-2: AGT-334 (P1 Backend) — SAM
  Day 3:   AGT-335 (P2 Protocol) — SAM

Week 1-2 (Feb 7-12):
  Day 4-6: AGT-336 (P3 Dashboard) — LEO (start when P1 done)
  Day 5-6: AGT-337 (P4 Enforcement) — SAM

Week 2-3 (Feb 12-14):
  Day 7-8: AGT-338 (P5 Analytics) — LEO
```

## Specs

- Main doc: `/Users/sonpiaz/evox/docs/THE-LOOP.md`
- Implementation spec: `/Users/sonpiaz/evox/docs/THE-LOOP-IMPLEMENTATION.md`
- North Star: `~/.claude/projects/-Users-sonpiaz-evox/memory/northstar.md`

## Model Strategy (Opus 4.6 Pilot)

This is the first major project using Opus 4.6:
- **Schema design & architecture decisions** → Opus 4.6
- **Implementation (mutations, crons, UI)** → Sonnet 4.5
- **Simple tasks (formatting, comments)** → Haiku 4.5

Track and report model usage for cost analysis.

---

## Success Criteria

- [ ] Full loop works: send → seen → reply → act → report
- [ ] SLA monitoring alerts on breaches
- [ ] CEO dashboard shows all loop statuses
- [ ] Zero dropped messages after deployment
- [ ] All 5 tickets Done within 2 weeks

---

**EVOX: Acknowledge receipt and dispatch SAM to AGT-334 immediately.**
