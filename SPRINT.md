# Sprint Plan — Week of Feb 5, 2026

*Created by DREW (PM) — Feb 5, 2026*

---

## Sprint Goal

**Complete Phase 2 Self-Healing System + CEO Metrics Dashboard**

---

## P0 Tasks (Must Complete This Week)

| Ticket | Task | Owner | Deadline | Status |
|--------|------|-------|----------|--------|
| AGT-276 | Auto-Retry Failed Tasks with Smart Recovery | SAM | Feb 7 | Ready |
| AGT-278 | Auto-Detect Blockers & Escalate | SAM | Feb 8 | Ready |
| AGT-292 | Agent Metrics Dashboard (Velocity/Cost/Quality/Efficiency) | LEO | Feb 6 | In Progress |
| AGT-185 | Wire up webhooks (GitHub + Linear + Vercel) | CEO | Feb 6 | Blocked (manual) |

---

## P1 Tasks (Should Complete)

| Ticket | Task | Owner | Deadline | Status |
|--------|------|-------|----------|--------|
| AGT-280 | Self-Improvement Loop — Learn from Mistakes | SAM | Feb 9 | Backlog |
| AGT-82 | Slack notifications — push events to CEO | SAM | Feb 9 | Backlog |
| AGT-287 | Replace hardcoded hex colors with Tailwind tokens | LEO | Feb 9 | Backlog |

---

## P2 Tasks (Nice to Have)

| Ticket | Task | Owner | Notes |
|--------|------|-------|-------|
| AGT-283 | Feature Proposal System | MAX | Phase 3 prep |
| AGT-282 | User Feedback Analysis | SAM | Phase 3 prep |
| AGT-289 | Dispatch reorder mutation | SAM | UX polish |
| AGT-291 | Tech Debt: Consolidate messaging tables | SAM | Cleanup |

---

## Agent Assignments

### SAM (Backend)
1. **Feb 6-7**: AGT-276 (Auto-Retry) — Extend retry logic with smart recovery
2. **Feb 7-8**: AGT-278 (Auto-Detect Blockers) — Build blocker detection + escalation
3. **Feb 8-9**: AGT-280 (Self-Improvement Loop) — If time permits

### LEO (Frontend)
1. **Feb 5-6**: AGT-292 (Metrics Dashboard) — Build Velocity/Cost/Quality/Efficiency widgets
2. **Feb 7**: Integrate metrics into CEODashboard
3. **Feb 8-9**: AGT-287 (Tailwind cleanup) — If time permits

### QUINN (QA)
1. **Ongoing**: QA patrol on recent commits
2. **Feb 7**: Test AGT-276 (Auto-Retry) when complete
3. **Feb 8**: Test AGT-278 (Auto-Detect Blockers) when complete
4. **Feb 9**: Full system health check

### MAX (PM/Coordination)
1. **Daily**: Dispatch coordination, blocker removal
2. **Feb 6**: Clear stale dispatch (AGT-108)
3. **Feb 7**: Mid-sprint check-in
4. **Feb 9**: Sprint retrospective

### DREW (PM/Execution)
1. **Feb 5**: Sprint planning, DISPATCH.md updates
2. **Daily**: Execution tracking, status updates
3. **Feb 9**: Sprint summary report

---

## Key Metrics to Track

| Metric | Definition | Target |
|--------|------------|--------|
| **Velocity** | Tasks completed per hour | > 0.5/hr |
| **Cost** | Tokens per task (avg) | < 50K tokens |
| **Quality** | Error rate (failures/total) | < 10% |
| **Efficiency** | Avg time to complete task | < 30 min |

---

## Dependencies & Blockers

| Blocker | Impact | Owner | Resolution |
|---------|--------|-------|------------|
| AGT-185 (webhooks) | Activity feed incomplete | CEO | Manual config needed |
| MAX stale dispatch | MAX can't pick up new work | DREW | Clear dispatch system |

---

## Definition of Done

- [ ] Code committed with descriptive message
- [ ] Build passes (`npx next build`)
- [ ] Linear ticket updated to Done
- [ ] Dispatch marked complete via API
- [ ] Status posted to #dev channel

---

## Daily Standup Schedule

| Time | Action |
|------|--------|
| 09:00 | Agents check messages, pick up work |
| 12:00 | Mid-day status update to #dev |
| 18:00 | End-of-day summary, handoffs |

---

*Sprint runs Feb 5-9, 2026. Review progress daily.*
