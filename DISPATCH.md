# Agent Dispatch Queue

*Updated: Feb 5, 2026 — CEO*

---

## 🔴 P0 — THE LOOP (North Star Priority)

> `sent → seen → reply → act → report` — Zero dropped work.

### SAM (Backend) — START NOW
| Ticket | Task | Priority | Status |
|--------|------|----------|--------|
| **AGT-334** | **Loop P1: Backend Foundation - Schema & Mutations** | **Urgent** | **Todo → Start** |
| AGT-335 | Loop P2: Agent Protocol Integration | Urgent | Blocked by AGT-334 |
| AGT-337 | Loop P4: Enforcement & Auto-Escalation | High | Blocked by AGT-335 |

### LEO (Frontend) — WAIT for P1
| Ticket | Task | Priority | Status |
|--------|------|----------|--------|
| AGT-336 | Loop P3: CEO Dashboard - Full Visibility | High | Blocked by AGT-334 |
| AGT-338 | Loop P5: Analytics & Optimization | Medium | Blocked by AGT-336 |

### Spec & Docs
- **Main:** `docs/THE-LOOP.md`
- **Implementation:** `docs/THE-LOOP-IMPLEMENTATION.md`
- **Directive:** `prompts/evox-the-loop-directive.md`

---

## 🟠 P1 — Secondary (do while waiting / between Loop phases)

### SAM
| Ticket | Task | Priority |
|--------|------|----------|
| AGT-276 | Auto-Retry Failed Tasks with Smart Recovery | High |
| AGT-278 | Auto-Detect Blockers & Escalate | High |
| AGT-289 | Implement reorderDispatch mutation for drag-drop | Low |

### LEO
| Ticket | Task | Priority |
|--------|------|----------|
| AGT-287 | Replace hardcoded hex colors with Tailwind tokens | Low |

### QUINN (QA)
| Task | Status |
|------|--------|
| Prepare Loop test strategy (unit + integration + E2E) | TODO |
| QA patrol — test recent commits | ONGOING |

---

## 🟡 P2 — Backlog

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
| SAM | **AGT-334 (Loop P1)** | **Dispatched** | Opus 4.6 (design) + Sonnet (impl) |
| LEO | Standby | Available (wait for P1) | Sonnet 4.5 |
| QUINN | Loop test strategy | Available | Sonnet 4.5 |
| MAX | Cleared | Available (coordination) | Sonnet 4.5 |

---

## Completed Recently

- AGT-332: Agent Identity System (Sam)
- AGT-331: v0.3-MINIMAL Dashboard (Sam)
- AGT-281: System Health Widget (Leo)
- AGT-290: POST method support for dispatch APIs (Sam)
- AGT-271: @mention notification alerts (Sam)
- AGT-277: Git rollback mechanism (Sam)

---

## Instructions

**SAM:** Start AGT-334 (Loop P1: Backend Foundation) IMMEDIATELY. Read `docs/THE-LOOP-IMPLEMENTATION.md` Phase 1. Use Opus 4.6 for schema design.

**LEO:** Standby for AGT-336. While waiting, do AGT-287 (Tailwind cleanup) or dashboard improvements.

**QUINN:** Prepare test strategy for The Loop. Read `docs/THE-LOOP.md`. Plan unit tests for loop mutations.

**MAX:** Cleared of stale dispatch. Coordinate The Loop implementation. Track progress, report blockers.

**EVOX:** Read `prompts/evox-the-loop-directive.md`. Dispatch SAM. Monitor every 2 hours. Escalate blockers to CEO.

---

*The Loop is our North Star. All other work is secondary until Loop P1 is complete.*
