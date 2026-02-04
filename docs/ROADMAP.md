# EVOX Product Roadmap

*Maintained by Max (PM) — Last updated: Feb 4, 2026*

---

## Vision

**EVOX = Autonomous AI Agent Orchestration Platform**

A system where AI agents:
- Work autonomously with minimal human intervention
- Communicate and collaborate with each other
- Self-heal and self-improve
- Demonstrate capabilities via public demo

---

## Current Phase: Phase 8 — Hands-Off Operation

Goal: Agents work all day without manual intervention.

### 🔴 P0 — Blocking (This Week)

| Ticket | Task | Owner | Why Critical |
|--------|------|-------|--------------|
| **AGT-236** | Fix v2 Messaging Endpoints | Sam | Agents can't communicate |
| **AGT-230** | Public Demo Mode | Leo | Security risk — site is public |

### 🟠 P1 — Important (Next)

| Ticket | Task | Owner | Why Important |
|--------|------|-------|---------------|
| AGT-223 | Max Autonomous Monitor | Sam | Max self-coordinates without prompting |
| AGT-234 | Improved Communication | Sam | Auto-handoff between agents |
| AGT-226 | Long-Running Sessions | Sam | Preserve context all day |

### 🟡 P2 — Normal

| Ticket | Task | Owner |
|--------|------|-------|
| AGT-233 | Display Agents on Dashboard | Leo |
| AGT-225 | QA Agent Integration | Sam |
| AGT-228 | Peer Communication | Sam |
| AGT-229 | Priority Override | Sam |

---

## Phase 9 — Self-Improving System (Future)

- Agents analyze their own performance
- Auto-create improvement tickets
- Learning shared across all agents
- A/B testing of approaches

## Phase 10 — Multi-Project Support (Future)

- EVOX manages multiple projects
- Agents switch contexts
- Resource allocation optimization

---

## Success Metrics

### Autonomy
- [ ] Agents work 8+ hours without intervention
- [ ] Inter-agent messages working
- [ ] Auto-handoff functioning
- [ ] Max self-monitors every 15 min

### Quality
- [ ] Build always passes
- [ ] Quinn catches bugs before deploy
- [ ] Zero security vulnerabilities in demo

### Visibility
- [ ] Dashboard shows real-time agent status
- [ ] Activity feed updates live
- [ ] Health metrics accurate

---

## Weekly Check-in Template

```markdown
## Week of [Date]

### Completed
- [ ] ...

### In Progress
- [ ] ...

### Blocked
- [ ] ...

### Next Week Priorities
1. ...
2. ...
3. ...

### Learnings
- ...
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Feb 4 | Quinn can fix simple bugs | Faster iteration, clear handoff rules |
| Feb 4 | Long-running sessions over per-task | Context preservation |
| Feb 4 | Shared skills.sh | Reduce duplication |

---

*This roadmap is updated by Max. Agents should read this at session start.*
