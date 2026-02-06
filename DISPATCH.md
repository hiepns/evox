# Agent Dispatch Queue

*Updated: Feb 6, 2026 — MAX (PM coordination)*

---

## P0 — THE LOOP (North Star Priority)

> `sent → seen → reply → act → report` — Zero dropped work.

### SAM (Backend) — START AGT-337
| Ticket | Task | Priority | Status |
|--------|------|----------|--------|
| ~~AGT-334~~ | ~~Loop P1: Backend Foundation~~ | ~~Urgent~~ | **DONE** |
| ~~AGT-335~~ | ~~Loop P2: Agent Protocol Integration~~ | ~~Urgent~~ | **DONE** |
| **AGT-337** | **Loop P4: Enforcement & Auto-Escalation** | **High** | **Todo → Start** |

### LEO (Frontend) — START AGT-336
| Ticket | Task | Priority | Status |
|--------|------|----------|--------|
| **AGT-336** | **Loop P3: CEO Dashboard - Full Visibility** | **High** | **Todo → Start** |
| AGT-338 | Loop P5: Analytics & Optimization | Medium | Blocked by AGT-336 |

### Spec & Docs
- **Main:** `docs/THE-LOOP.md`
- **Implementation:** `docs/THE-LOOP-IMPLEMENTATION.md`
- **Directive:** `prompts/evox-the-loop-directive.md`

---

## P1 — Secondary (do while waiting / between Loop phases)

### SAM
| Ticket | Task | Priority |
|--------|------|----------|
| AGT-276 | Auto-Retry Failed Tasks with Smart Recovery | High |
| AGT-278 | Auto-Detect Blockers & Escalate | High |
| AGT-289 | Implement reorderDispatch mutation for drag-drop | Low |

### LEO
| Ticket | Task | Priority |
|--------|------|----------|
| ~~AGT-287~~ | ~~Replace hardcoded hex colors with Tailwind tokens~~ | ~~Low~~ | **DONE** |

### QUINN (QA)
| Task | Status |
|------|--------|
| Loop test coverage (unit + integration) | IN PROGRESS |
| QA patrol — test recent commits | ONGOING |

---

## P2 — Backlog

| Ticket | Task | Owner | Priority |
|--------|------|-------|----------|
| AGT-280 | Self-Improvement Loop | Sam | Medium |
| AGT-282 | User Feedback Analysis | Sam | Medium |
| AGT-283 | Feature Proposal System | Max | Medium |
| AGT-291 | Tech Debt: Consolidate messaging tables | Sam | Low |
| AGT-284 | Priority Voting | — | Phase 3 |
| AGT-288 | Minimal-Oversight Shipping | — | Phase 3 |

---

## Agent Status

| Agent | Current Task | Status | Model |
|-------|-------------|--------|-------|
| SAM | **AGT-337 (Loop P4)** | **Ready to start** | Opus 4.6 |
| LEO | **AGT-336 (Loop P3)** | **Ready to start** | Sonnet 4.5 |
| QUINN | Loop test coverage | In progress | Sonnet 4.5 |
| MAX | Coordination | Active | Opus 4.6 |

---

## Completed Recently

- AGT-334: Loop P1 — Backend Foundation (Sam) — `c747a3e`
- AGT-335: Loop P2 — Agent Protocol Integration (Sam) — `4774194`
- AGT-287: Tailwind token cleanup (Leo) — `abbebe2`
- Cleanup: 4,690 lines deleted, 14 unused components removed, 12 tables restored
- AGT-332: Agent Identity System (Sam)
- AGT-331: v0.3-MINIMAL Dashboard (Sam)
- AGT-281: System Health Widget (Leo)

---

## Instructions

**SAM:** Start AGT-337 (Loop P4: Enforcement & Auto-Escalation). P1 and P2 are done — you have the backend foundation. Read `docs/THE-LOOP-IMPLEMENTATION.md` Phase 4. Key deliverables: loopGuardian cron, auto-nudges, escalation protocol, daily health report.

**LEO:** Start AGT-336 (Loop P3: CEO Dashboard). P1 backend is live — queries are ready. Read `docs/THE-LOOP-IMPLEMENTATION.md` Phase 3. Key deliverables: LoopStatusWidget, LoopTimeline, AgentAccountabilityGrid, LoopAlertsPanel, `/app/loop/page.tsx`. Follow EVOX Design System. Remember Rule 1: search before creating.

**QUINN:** Continue Loop test coverage. Write unit tests for the new P1/P2 mutations in `convex/messageStatus.ts` and `convex/loopMonitor.ts`. Integration tests for full loop flow.

**MAX:** Monitor progress. Next check in 2 hours. Track AGT-336 and AGT-337 progress.

---

*P1 and P2 are DONE. SAM and LEO can now work in parallel on P3 (frontend) and P4 (enforcement).*
