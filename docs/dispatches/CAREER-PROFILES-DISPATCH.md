# EVOX DISPATCH: Career Profiles + Hall of Fame

**Date:** Feb 6, 2026
**From:** CEO (via MAX)
**Priority:** P2 — Ship this week

---

## OVERVIEW

Build Agent Career Profiles + Hall of Fame Dashboard. Data đã có sẵn trong Convex — chỉ cần aggregate và đưa lên UI. **Không tạo table mới.**

2 trang mới:
- `/agents` — Hall of Fame (leaderboard, rankings)
- `/agents/[name]` — Career Profile (full page per agent)

---

## TICKETS & ASSIGNMENTS

### SAM — Backend (DO FIRST)

**AGT-340: Agent career profile aggregation queries**
https://linear.app/affitorai/issue/AGT-340

Tạo `convex/agentProfiles.ts` với 3 queries:

**1. `getCareerProfile(agentName: string)`**
Aggregate từ existing tables:
```
agents → identity, status, soul
agentSkills → autonomyLevel, skills[], tasksCompleted
agentFeedback → avgRating, feedbackByCategory (quality/speed/communication/coordination/autonomy/accuracy)
agentLearnings → count verified + total
tasks → completed count (24h, 7d, all-time), successRate
performanceMetrics → totalCost7d, avgCostPerTask
loopMetrics → completionRate, avgSeenTimeMs, slaBreaches
```

**2. `getHallOfFame()`**
Return ranked agents. Composite score:
- 40% tasks completed (normalized)
- 30% loop completion rate
- 20% avg rating (normalized to 0-1)
- 10% success rate

Include badges array: "Top Performer", "Loop Master", "Most Productive", "Cost Efficient"
Return: `topPerformer`, `mostTasks`, `bestLoopRate` (agent names)

**3. `getCareerTimeline(agentName: string, limit: number)`**
Recent tasks + activity events merged + sorted by time.
Each task includes `linearUrl` for shareable links.

**Rules:**
- Import from `agentRegistry.ts` (Rule 3)
- Use string names not IDs (Rule 2)
- Max 500 lines (Rule 8)
- Use existing indexes — don't create new ones

---

### LEO — Frontend (AFTER SAM)

**AGT-341: Hall of Fame leaderboard page**
https://linear.app/affitorai/issue/AGT-341

Route: `/agents` → `app/agents/page.tsx`

Sections:
1. Header — "Hall of Fame" + back link to `/ceo`
2. Podium — Top 3 (gold/silver/bronze cards, large)
3. Leaderboard table — Rank | Agent | Tasks | Success% | Loop% | Rating | Badges
4. Category Winners — "Most Tasks", "Best Loop", "Fastest Response"

Click agent → `/agents/[name]`

---

**AGT-342: Agent career profile full page**
https://linear.app/affitorai/issue/AGT-342

Route: `/agents/[name]` → `app/agents/[name]/page.tsx`

Sections:
1. Hero — avatar, name, role, status, level, tenure
2. Stats grid (2x3) — Tasks Done, Success%, Loop%, Rating, Cost 7d, Learnings
3. Skills — bars with proficiency%
4. Feedback — by category breakdown
5. Timeline — recent tasks (click → Linear URL, shareable)
6. Learnings — verified list

Reuse patterns from existing `components/dashboard-v2/agent-profile.tsx`

---

**AGT-343: Navigation links**
https://linear.app/affitorai/issue/AGT-343

- CEO Dashboard agent dots → click → `/agents/[name]`
- Add "Team" link → `/agents`
- AgentCard → wrap in `Link`
- Profile modal → "View full profile" link

---

## EXECUTION ORDER

```
SAM: AGT-340 (backend) ──→ LEO: AGT-341 (hall of fame)
                          ──→ LEO: AGT-342 (career profile)
                                    ──→ LEO: AGT-343 (navigation)
```

SAM làm trước. LEO đợi SAM xong AGT-340 rồi mới bắt đầu.

## DESIGN RULES

- Dark theme: `bg-black`, `bg-zinc-900/950`, `text-zinc-50`
- Mobile-first (P0 — CULTURE.md)
- Touch targets 44x44px
- No horizontal scroll
- Max 300 lines per component
- Use `next/link` for navigation
- Tasks link to Linear URLs (shareable)

## DEFINITION OF DONE

- [ ] `npx next build` passes
- [ ] Mobile viewport works (< 640px)
- [ ] All agents show on Hall of Fame
- [ ] Each agent profile loads data
- [ ] Task links open Linear (shareable)
- [ ] Commit hash in ticket comment
