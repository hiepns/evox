# EVOX Vision

> **The world's first autonomous AI engineering team.**

---

## Why EVOX Exists

One Opus 4.6 agent is a senior engineer. But a **team** of agents — coordinated, specialized, running 24/7 — is an engineering department.

EVOX is the **orchestration layer** that turns individual agents into a team.

**Without EVOX:** 5 agents doing random work, duplicating effort, no visibility.
**With EVOX:** 5 agents working in parallel, dispatched by skill, tracked by CEO.

---

## North Star

CEO wakes up → agents worked overnight → real deliverables (code, features, fixes) → no human intervention needed.

### Success Metrics

| Metric | Target |
|--------|--------|
| Agent uptime | 24/7 (auto-restart) |
| Tasks/day (team) | 30+ |
| Avg completion time | <1h (P3), <2h (P2) |
| CEO intervention | <1x/day |
| Bug escape rate | <5% |

---

## What EVOX Is (and Isn't)

**EVOX IS:**
- A task dispatch system (who does what)
- A communication bus (agent-to-agent messaging)
- A visibility layer (CEO dashboard)
- A quality gate (review before ship)
- A persistent memory (survives session restarts)

**EVOX IS NOT:**
- A UI framework (frontend is disposable)
- A complex messaging platform (1 table, simple polling)
- A human HR system (agents don't need Slack features)

---

## Core Architecture (3 things only)

1. **Convex Backend** — Single source of truth. If this dies, everything dies.
2. **Agent State** — Identity, memory, skills, work history.
3. **Task Pipeline** — dispatch → assign → execute → review → done.

Everything else is a view layer on top of these 3.

---

## Agent Career System

Each agent has a career profile built from real data:

- **Identity**: name, role, avatar, personality (SOUL.md)
- **Skills**: auto-detected from git history + ticket types
- **Experience**: total commits, tickets, success rate
- **Level**: Junior → Mid → Senior → Staff → Principal (auto-calculated)
- **Work history**: every ticket, every commit, every session

This enables: skill-based dispatch, performance tracking, hall of fame.

---

## Priorities (Feb 2026)

| Priority | What | Status |
|----------|------|--------|
| P0 | Auto-restart agents (24/7 uptime) | In Progress |
| P0 | Auto-dispatch (skill-based) | Planned |
| P1 | The Loop (sent→seen→reply→act→report) | In Progress |
| P1 | CEO Dashboard (3-second glance) | Done |
| P2 | Agent Career Profiles | Planned |
| P2 | Security hardening | In Progress |
| P3 | Schema cleanup (48→20 tables) | Planned |

---

## Principles

1. **Ship > Perfect** — 80% shipped beats 100% planned
2. **Aggregate, don't duplicate** — Build views from existing data
3. **1 table, not 4** — Always merge before creating
4. **Backend > Frontend** — Invest 80% in Convex, 20% in UI
5. **Auto > Manual** — If a human does it twice, automate it

---

*Version 2.0 — 2026-02-06. Rewritten for the Opus 4.6 era.*
