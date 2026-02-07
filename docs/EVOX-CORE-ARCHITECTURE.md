# EVOX Core Architecture

**Version 2.0 — Feb 6, 2026 (Opus 4.6 Era)**

---

## 3 Core Layers

```
┌─────────────────────────────────┐
│  VISIBILITY (CEO Dashboard)     │  ← Disposable UI
├─────────────────────────────────┤
│  TASK PIPELINE                  │  ← dispatch → assign → execute → done
├─────────────────────────────────┤
│  AGENT STATE                    │  ← identity, memory, skills, health
├─────────────────────────────────┤
│  CONVEX BACKEND                 │  ← Single source of truth
└─────────────────────────────────┘
```

### Layer 1: Convex Backend (Foundation)

Single source of truth. Real-time sync across Mac Mini + MacBook.

**If this dies → everything dies.**

Key tables (target: 20 or fewer):
- `agents` — identity, status, current task
- `tasks` — the work
- `unifiedMessages` — all agent communication (1 table)
- `agentProfiles` — career data, skills, experience
- `dispatchQueue` — task assignment queue
- `settings` — system config

### Layer 2: Agent State

Each agent has:
- **Identity**: name (lowercase string), role, avatar
- **Memory**: SOUL.md (permanent), WORKING.md (session), daily notes
- **Career**: commits, tickets, skills, level (auto-computed)
- **Health**: status, last seen, current task, uptime

Identity resolution: always use lowercase string name (`"sam"`), never raw Convex IDs in business logic.

### Layer 3: Task Pipeline

```
CEO/EVOX creates task
    → dispatch queue (priority + skill match)
    → agent picks up (or auto-assigned)
    → execute (commits, PRs)
    → review (QUINN)
    → done (proof of work: commit hash + build pass)
```

---

## Fundamental Truths

1. **Frontend is disposable** — Delete `app/`, rebuild from Convex in days. Lose Convex → months to recover.
2. **1 table, not 4** — All messaging in `unifiedMessages`. No more `agentMessages`, `messages`, `meshMessages`.
3. **Agents are senior engineers** — Don't micromanage. Give goal, let them plan + execute.
4. **Schema changes are high-risk** — Always add fields as optional. Test on dev first.
5. **Aggregate, don't duplicate** — Career profiles computed from git + Linear + Convex, not stored separately.

---

## What We Killed (Feb 2026)

| Removed | Why |
|---------|-----|
| 4 messaging tables → 1 | `unifiedMessages` only |
| 7 dashboard variants → 1 | Single CEO dashboard + Kanban |
| 8 tabs → 4 | CEO, Kanban, Health, Comms |
| Complex agent ID system (`agt-*`) | Lowercase strings work fine |
| Terminal/Messages/Automation tabs | Dead features |
| Ghost agents in sidebar | Filtered to AGENT_ORDER only |

---

## Agent Career System

Built from real data, auto-computed:

```
Agent Profile = git history + Linear tickets + Convex state + session logs
```

| Field | Source |
|-------|--------|
| Total commits | `git log --author=<name>` |
| Tickets completed | Linear API |
| Skills | File types touched in git |
| Success rate | Tickets done / tickets assigned |
| Level | Auto: Junior(1) → Mid(2) → Senior(3) → Staff(4) → Principal(5) |

---

## Security Rules

1. No hardcoded secrets — `.env.local` only
2. Webhooks require HMAC signature verification (fail closed)
3. HTTP API requires `x-api-key` header
4. CORS restricted to `evox-ten.vercel.app`
5. Pre-commit grep for secrets

---

*Maintained by: CEO + Opus 4.6*
*Previous version: 1.0 by MAX (Sonnet 4.5), 610 lines → now 120 lines*
