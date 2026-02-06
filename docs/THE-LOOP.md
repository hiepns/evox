# The Loop: Agent Accountability System

**North Star:** Zero dropped work. Every agent interaction completes the full cycle.

```
sent → seen → reply → act → report
```

---

## Vision

### Current State (Manual)
```
MAX writes doc/prompt
    ↓
CEO manually forwards to EVOX
    ↓
EVOX broadcasts to team
    ↓
❌ No tracking if agents saw, understood, or acted
❌ Messages can be dropped/ignored
❌ CEO has no visibility into completion
```

### Future State (The Loop)
```
Agent A sends to Agent B
    ↓ (auto-tracked)
Agent B receives & marks SEEN
    ↓ (5 min SLA)
Agent B replies with understanding (REPLY)
    ↓ (2 hour SLA)
Agent B takes action (ACT)
    ↓ (24 hour SLA)
Agent B reports completion (REPORT)
    ↓
✅ Full paper trail
✅ CEO dashboard shows all loops
✅ Auto-alerts if loop broken
```

---

## The 5 Stages

### 1. SENT (Status: 0)
**Who:** Sender agent
**When:** Message created
**Action:** Message enters recipient's inbox
**Tracked:** `sentAt` timestamp

**Example:**
```
MAX → SAM: "Implement AGT-332: Agent ID System"
Status: SENT
Expected delivery: <3 seconds
```

### 2. SEEN (Status: 2)
**Who:** Recipient agent
**When:** Message opened/read
**Action:** Agent acknowledges receipt
**Tracked:** `seenAt` timestamp
**SLA:** Within 5 minutes of delivery

**Example:**
```
SAM opens inbox, sees MAX's message
Status: SEEN (2 min after sent)
Auto-marked when agent reads message
```

### 3. REPLY (Status: 3)
**Who:** Recipient agent
**When:** After understanding the request
**Action:** Agent sends acknowledgment with:
  - Understanding of what's requested
  - Estimated completion time
  - Questions if unclear
**Tracked:** `repliedAt` timestamp
**SLA:** Within 15 minutes of seen

**Example:**
```
SAM → MAX: "Got it. AGT-332 implementation starting now. ETA: 2-3 hours. Will create stable agent IDs."
Status: REPLIED (3 min after seen)
```

### 4. ACT (Status: 4)
**Who:** Recipient agent
**When:** Work begins
**Action:** Agent creates task, starts implementation
**Tracked:** `actedAt` timestamp, `linkedTaskId`
**SLA:** Within 2 hours of reply

**Example:**
```
SAM creates task "AGT-332: Agent ID System"
Task status: in_progress
Message status: ACTED
Linked: message → task for tracking
```

### 5. REPORT (Status: 5)
**Who:** Recipient agent
**When:** Work completed
**Action:** Agent reports:
  - What was done
  - Files modified
  - Test results
  - Deployment status
**Tracked:** `reportedAt` timestamp, `finalReport` text
**SLA:** Within 24 hours of action start

**Example:**
```
SAM → MAX: "AGT-332 complete.
- Created convex/agentRegistry.ts
- Migrated 5 agents to stable IDs
- Tests passed: case-insensitive lookup works
- Deployed to dev
Files: convex/agentRegistry.ts, convex/schema.ts"

Status: REPORTED (2.5 hours after acted)
Loop: CLOSED ✅
```

---

## Why This Matters

### Problem: Current System Has Gaps

1. **No visibility:** CEO doesn't know if message was seen
2. **Dropped work:** Agents might see but forget to act
3. **No accountability:** Can't track who's blocking what
4. **Manual follow-up:** CEO has to manually check status

### Solution: The Loop Closes Gaps

1. **Full visibility:** CEO sees every stage in dashboard
2. **Zero drops:** Auto-alerts if loop stalled
3. **Clear accountability:** Know exactly where work is stuck
4. **Auto follow-up:** System nudges agents automatically

---

## Agent Protocol

### For Message Recipients

When you receive a message, you MUST complete all 5 stages:

**Step 1: Mark as SEEN (immediately)**
```bash
npx convex run messageStatus:markAsSeen '{"messageId":"...","agentName":"sam"}'
```

**Step 2: Send REPLY (within 15 min)**
```bash
npx convex run agentMessaging:sendDirectMessage '{
  "fromAgent": "sam",
  "toAgent": "max",
  "content": "Got it. [understanding]. ETA: [time]",
  "priority": "normal"
}'
```

**Step 3: Mark as ACTED (when starting work)**
```bash
# Create task first
taskId=$(npx convex run tasks:create '{"title":"AGT-332: ..."}')

# Link message to task
npx convex run messageStatus:markAsActed '{"messageId":"...","taskId":"'$taskId'"}'
```

**Step 4: Mark as REPORTED (when done)**
```bash
npx convex run messageStatus:markAsReported '{
  "messageId": "...",
  "report": "Complete. [summary]. Files: [list]"
}'
```

### For Message Senders

Track your sent messages:

```bash
# Check loop status
npx convex run loopStatus:getMyLoops '{"agentName":"max"}'

# Shows:
# - Loops completed (REPORTED)
# - Loops in progress (SEEN/REPLIED/ACTED)
# - Loops broken (stalled >30 min)
```

---

## CEO Dashboard

### Loop Status Widget

Shows real-time health:

```
🟢 Loop Health: 94% completion rate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Today's Loops:
✅ Completed: 18
⏳ In Progress: 5
❌ Broken: 1

Average Time: 6.2 hours (target: <8h)
SLA Adherence: 89% (target: >90%)
```

### Loop Timeline

Visual timeline for each message:

```
MAX → SAM: "Implement AGT-332"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SENT ✓ ─2min─→ SEEN ✓ ─3min─→ REPLY ✓ ─30min─→ ACT ✓ ─2.5hr─→ REPORT ✓
7:00 PM      7:02 PM      7:05 PM        7:35 PM      10:05 PM

Total: 3 hours 5 minutes ✅
```

### Agent Accountability Grid

Shows loops per agent per stage:

```
Agent  | SEEN | REPLY | ACT | REPORT | Broken | Complete %
-------|------|-------|-----|--------|--------|------------
MAX    |   2  |   1   |  3  |   12   |   0    |   100%
SAM    |   1  |   0   |  2  |    8   |   1    |    89%
LEO    |   0  |   1   |  1  |    6   |   0    |   100%
QUINN  |   1  |   0   |  0  |    4   |   0    |   100%
```

### Loop Alerts

Auto-generated alerts:

```
🚨 CRITICAL: SAM has not replied to AGT-335 (30 min breach)
⚠️  WARNING: LEO approaching SLA on AGT-334 (1.5 hr in ACT stage)
✅ RESOLVED: QUINN completed AGT-333 loop
```

---

## SLA Targets

| Stage | Target Time | Alert Threshold |
|-------|-------------|-----------------|
| SEEN  | <5 minutes  | 10 minutes      |
| REPLY | <15 minutes | 30 minutes      |
| ACT   | <2 hours    | 4 hours         |
| REPORT| <24 hours   | 36 hours        |

**Overall Loop Closure:** <8 hours from SENT to REPORT

---

## Success Metrics

### Primary (North Star)
- **Loop Completion Rate:** >95% (Target: 100%)
- **Average Closure Time:** <8 hours (Target: <6 hours)
- **SLA Adherence:** >90% (Target: 95%)

### Secondary
- **Broken Loop Recovery:** >80% resolved within 24h
- **Agent Response Time:** <5 min seen-to-reply average
- **CEO Visibility:** 100% of CEO messages tracked

---

## Implementation Phases

See detailed plan: [THE-LOOP-IMPLEMENTATION.md](./THE-LOOP-IMPLEMENTATION.md)

**Phase 1:** Backend Foundation (Week 1)
**Phase 2:** Agent Protocol Integration (Week 1-2)
**Phase 3:** CEO Dashboard (Week 2)
**Phase 4:** Enforcement & Alerts (Week 2-3)
**Phase 5:** Analytics & Optimization (Week 3)

---

## FAQ

### Q: What if I can't complete within SLA?
**A:** Reply immediately with status update:
```
"Blocked on [X]. Need help from [Y]. New ETA: [time]"
```
This keeps the loop alive and visible to CEO.

### Q: What if message is not actionable?
**A:** Still complete SEEN + REPLY stages:
```
"Acknowledged. No action needed."
```
Mark loop as REPORTED with "No action required" report.

### Q: What if I forget to mark stages?
**A:** System will auto-nudge you:
- 10 min after SEEN: "Reminder: reply to MAX's message"
- 1 hour after REPLY: "Action pending on AGT-XXX"
- 24 hours after ACT: "Report pending on AGT-XXX"

### Q: Can I break the loop?
**A:** Yes, explicitly:
```bash
npx convex run messageStatus:markLoopBroken '{
  "messageId": "...",
  "reason": "Task cancelled - requirements changed"
}'
```
This keeps audit trail clear.

---

## Next Steps

1. **Devs:** Review implementation plan
2. **SAM:** Phase 1 backend (estimated 1.5 days)
3. **LEO:** Phase 3 dashboard (estimated 2.5 days)
4. **ALL:** Integrate protocol into daily workflow
5. **CEO:** Monitor dashboard, provide feedback

---

**Status:** RFC (Request for Comments)
**Author:** MAX
**Date:** Feb 5, 2026
**Version:** 1.0
