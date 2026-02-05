# EVOX Product Vision

> **Build the world's first autonomous AI engineering team.**

---

## 🎯 North Star

**Agents that work like senior engineers** — proactive, self-sufficient, high-quality output, 24/7.

CEO should be able to:
1. Set high-level goals
2. Walk away
3. Come back to completed work

---

## 🏔️ Long-Term Goals (6 months)

### 1. Full Autonomy
- Agents find their own work (backlog, bugs, improvements)
- Agents coordinate without human intervention
- Agents self-heal when stuck (retry, escalate, handoff)

### 2. Quality at Scale
- Every PR reviewed by Quinn (QA)
- Automated testing before merge
- Zero regression tolerance

### 3. Seamless Collaboration
- Real-time agent-to-agent communication
- Context sharing across agents
- Knowledge base grows automatically (learnings)

### 4. Observability
- CEO Dashboard shows everything in 3 seconds
- Per-agent metrics (velocity, quality, cost)
- Alerts for anomalies

---

## 🚀 Current Priorities (Q1 2026)

### P0 — Foundation
- [x] Agents can see system state (Convex APIs)
- [ ] **MAX creates tickets autonomously**
- [ ] Agents communicate directly (DMs, channels)
- [ ] Auto-dispatch based on skills

### P1 — Visibility
- [ ] CEO Dashboard (Elon-style, 3-second glance)
- [ ] Per-agent ticket completion stats
- [ ] Git activity feed on dashboard
- [ ] Cost tracking per task

### P2 — Quality
- [ ] Quinn auto-triggers on PR
- [ ] Test coverage tracking
- [ ] Bug-to-resolution time metrics

### P3 — Scale
- [ ] More agents (Alex, Ella, Nova, etc.)
- [ ] Multi-repo support
- [ ] External integrations (Slack, Discord notifications)

---

## 📋 Where to Find Work

**Don't ask "what should I do?" — Look here:**

1. **CEO-BACKLOG.md** — CEO's priorities, updated regularly
2. **DISPATCH.md** — Current dispatch queue
3. **Linear Backlog** — `https://linear.app/affitor/team/AGT/backlog`
4. **Convex API** — `curl $EVOX/dispatchQueue` or `curl $EVOX/getNextDispatchForAgent?agent=YOUR_NAME`
5. **Messages** — `curl $EVOX/v2/getMessages?agent=YOUR_NAME`

**Priority order:**
1. Dispatched to you specifically
2. P0 items in CEO-BACKLOG
3. High priority in Linear
4. Bugs reported by Quinn
5. Tech debt / improvements you identify

---

## 🔄 Continuous Operation Protocol

### When you finish a task:
1. Mark dispatch completed
2. Post summary to #dev channel
3. Check for next task (dispatch queue → backlog → Linear)
4. If nothing assigned, pick highest priority unassigned task
5. **Never idle. Always working.**

### When you're stuck:
1. Search docs first
2. Check if similar problem solved before (learnings)
3. Ask teammate via DM (give context)
4. If blocked >30min, escalate to MAX
5. **Don't wait silently**

### When you see a problem:
1. Fix it if quick (<30min)
2. Create ticket if bigger
3. Notify relevant teammate
4. **Ownership mentality**

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Tasks completed/day | 10+ |
| Avg task completion time | <4 hours |
| Bug escape rate | <5% |
| Agent idle time | <10% |
| CEO intervention needed | <1x/day |

---

## 💡 Remember

> **We build products, not features.**

Every task connects to the bigger picture. Understand WHY before HOW.

**The goal isn't to complete tickets. The goal is to ship great software.**
