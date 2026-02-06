# EVOX Current Roadmap

> **Last Updated:** 2026-02-06
> **Consolidated from:** `DISPATCH.md`, `SPRINT.md`

---

## Section 1: Current Sprint

**Sprint:** Week of Feb 5-9, 2026
**Sprint Goal:** Complete Phase 2 Self-Healing System + CEO Metrics Dashboard + The Loop (P3/P4)

### Key Metrics to Track

| Metric | Definition | Target |
|--------|------------|--------|
| **Velocity** | Tasks completed per hour | > 0.5/hr |
| **Cost** | Tokens per task (avg) | < 50K tokens |
| **Quality** | Error rate (failures/total) | < 10% |
| **Efficiency** | Avg time to complete task | < 30 min |

### Definition of Done

- Code committed with descriptive message
- Build passes (`npx next build`)
- Linear ticket updated to Done
- Dispatch marked complete via API
- Status posted to #dev channel

### Dependencies & Blockers

| Blocker | Impact | Owner | Resolution |
|---------|--------|-------|------------|
| AGT-185 (webhooks) | Activity feed incomplete | CEO | Manual config needed |
| MAX stale dispatch | MAX can't pick up new work | DREW | Clear dispatch system |

### Daily Standup Schedule

| Time | Action |
|------|--------|
| 09:00 | Agents check messages, pick up work |
| 12:00 | Mid-day status update to #dev |
| 18:00 | End-of-day summary, handoffs |

---

## Section 2: Dispatch Queue

### P0 -- THE LOOP (North Star Priority)

> `sent -> seen -> reply -> act -> report` -- Zero dropped work.

| Ticket | Task | Owner | Priority | Status |
|--------|------|-------|----------|--------|
| ~~AGT-334~~ | ~~Loop P1: Backend Foundation~~ | SAM | ~~Urgent~~ | **DONE** |
| ~~AGT-335~~ | ~~Loop P2: Agent Protocol Integration~~ | SAM | ~~Urgent~~ | **DONE** |
| **AGT-336** | **Loop P3: CEO Dashboard - Full Visibility** | LEO | **High** | **Todo -- Start** |
| **AGT-337** | **Loop P4: Enforcement & Auto-Escalation** | SAM | **High** | **Todo -- Start** |
| AGT-338 | Loop P5: Analytics & Optimization | LEO | Medium | Blocked by AGT-336 |

Spec & Docs:
- **Main:** `docs/THE-LOOP.md`
- **Implementation:** `docs/THE-LOOP-IMPLEMENTATION.md`
- **Directive:** `prompts/evox-the-loop-directive.md`

### P0 -- Sprint Tasks (Must Complete This Week)

| Ticket | Task | Owner | Deadline | Status |
|--------|------|-------|----------|--------|
| AGT-276 | Auto-Retry Failed Tasks with Smart Recovery | SAM | Feb 7 | Ready |
| AGT-278 | Auto-Detect Blockers & Escalate | SAM | Feb 8 | Ready |
| AGT-292 | Agent Metrics Dashboard (Velocity/Cost/Quality/Efficiency) | LEO | Feb 6 | In Progress |
| AGT-185 | Wire up webhooks (GitHub + Linear + Vercel) | CEO | Feb 6 | Blocked (manual) |

### P1 -- Secondary (do while waiting / between Loop phases)

| Ticket | Task | Owner | Priority |
|--------|------|-------|----------|
| AGT-280 | Self-Improvement Loop -- Learn from Mistakes | SAM | Medium |
| AGT-82 | Slack notifications -- push events to CEO | SAM | Backlog |
| ~~AGT-287~~ | ~~Replace hardcoded hex colors with Tailwind tokens~~ | ~~LEO~~ | **DONE** |

QUINN (QA):

| Task | Status |
|------|--------|
| Loop test coverage (unit + integration) | IN PROGRESS |
| QA patrol -- test recent commits | ONGOING |

### P2 -- Backlog

| Ticket | Task | Owner | Priority |
|--------|------|-------|----------|
| AGT-280 | Self-Improvement Loop | SAM | Medium |
| AGT-282 | User Feedback Analysis | SAM | Medium |
| AGT-283 | Feature Proposal System | MAX | Medium |
| AGT-289 | Dispatch reorder mutation | SAM | Low |
| AGT-291 | Tech Debt: Consolidate messaging tables | SAM | Low |
| AGT-284 | Priority Voting | -- | Phase 3 |
| AGT-288 | Minimal-Oversight Shipping | -- | Phase 3 |

---

## Section 3: Agent Assignments

### Current Status

| Agent | Current Task | Status | Model |
|-------|-------------|--------|-------|
| SAM | **AGT-337 (Loop P4)** | **Ready to start** | Opus 4.6 |
| LEO | **AGT-336 (Loop P3)** | **Ready to start** | Sonnet 4.5 |
| QUINN | Loop test coverage | In progress | Sonnet 4.5 |
| MAX | Coordination | Active | Opus 4.6 |
| DREW | Execution tracking | Active | -- |

### SAM (Backend)

1. **Feb 6-7**: AGT-337 (Loop P4: Enforcement & Auto-Escalation). Read `docs/THE-LOOP-IMPLEMENTATION.md` Phase 4. Key deliverables: loopGuardian cron, auto-nudges, escalation protocol, daily health report.
2. **Feb 7-8**: AGT-276 (Auto-Retry) -- Extend retry logic with smart recovery
3. **Feb 8-9**: AGT-278 (Auto-Detect Blockers) -- Build blocker detection + escalation
4. **If time**: AGT-280 (Self-Improvement Loop)

### LEO (Frontend)

1. **Feb 5-6**: AGT-292 (Metrics Dashboard) -- Build Velocity/Cost/Quality/Efficiency widgets
2. **Feb 6-7**: AGT-336 (Loop P3: CEO Dashboard). Read `docs/THE-LOOP-IMPLEMENTATION.md` Phase 3. Key deliverables: LoopStatusWidget, LoopTimeline, AgentAccountabilityGrid, LoopAlertsPanel, `/app/loop/page.tsx`. Follow EVOX Design System. Rule 1: search before creating.
3. **Feb 8-9**: AGT-287 (Tailwind cleanup) -- If time permits

### QUINN (QA)

1. **Ongoing**: QA patrol on recent commits
2. **Feb 7**: Test AGT-276 (Auto-Retry) when complete
3. **Feb 8**: Test AGT-278 (Auto-Detect Blockers) when complete
4. **Feb 9**: Full system health check
5. Write unit tests for new P1/P2 mutations in `convex/messageStatus.ts` and `convex/loopMonitor.ts`. Integration tests for full loop flow.

### MAX (PM/Coordination)

1. **Daily**: Dispatch coordination, blocker removal
2. **Feb 6**: Clear stale dispatch (AGT-108)
3. **Feb 7**: Mid-sprint check-in
4. **Feb 9**: Sprint retrospective
5. Monitor AGT-336 and AGT-337 progress. Next check in 2 hours.

### DREW (PM/Execution)

1. **Feb 5**: Sprint planning, DISPATCH.md updates
2. **Daily**: Execution tracking, status updates
3. **Feb 9**: Sprint summary report

---

## Completed Recently

- AGT-334: Loop P1 -- Backend Foundation (SAM) -- `c747a3e`
- AGT-335: Loop P2 -- Agent Protocol Integration (SAM) -- `4774194`
- AGT-287: Tailwind token cleanup (LEO) -- `abbebe2`
- Cleanup: 4,690 lines deleted, 14 unused components removed, 12 tables restored
- AGT-332: Agent Identity System (SAM)
- AGT-331: v0.3-MINIMAL Dashboard (SAM)
- AGT-281: System Health Widget (LEO)

---

*P1 and P2 are DONE. SAM and LEO can now work in parallel on P3 (frontend) and P4 (enforcement).*
*Sprint runs Feb 5-9, 2026. Review progress daily.*
