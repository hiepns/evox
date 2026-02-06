# The Loop: Implementation Specification

**Implementation plan for the Agent Accountability Loop system**

---

## Phase 1: Backend Foundation (Week 1)

**Owner:** SAM
**Estimated:** 13 hours (1.5 days)
**Depends on:** None (can start immediately)

### 1.1 Schema Migration

**File:** `convex/schema.ts`

**Changes:**

```typescript
// Extend agentMessages table
agentMessages: defineTable({
  // ... existing fields ...

  // Extended status (0-5 instead of 0-3)
  statusCode: v.optional(v.number()), // 0=PENDING, 1=DELIVERED, 2=SEEN, 3=REPLIED, 4=ACTED, 5=REPORTED

  // Stage timestamps
  deliveredAt: v.optional(v.number()),
  seenAt: v.optional(v.number()),
  repliedAt: v.optional(v.number()),
  actedAt: v.optional(v.number()),
  reportedAt: v.optional(v.number()),

  // Loop metadata
  loopBroken: v.optional(v.boolean()),
  loopBrokenReason: v.optional(v.string()),
  loopBrokeAt: v.optional(v.number()),

  // SLA tracking
  expectedReplyBy: v.optional(v.number()),
  expectedActionBy: v.optional(v.number()),
  expectedReportBy: v.optional(v.number()),

  // Work linkage
  linkedTaskId: v.optional(v.id("tasks")),
  linkedDispatchId: v.optional(v.id("dispatches")),
  finalReport: v.optional(v.string()),
})
  .index("by_status", ["statusCode", "_creationTime"])
  .index("by_recipient_status", ["to", "statusCode"])

// New table: loopMetrics
loopMetrics: defineTable({
  date: v.string(),              // "2026-02-05"
  hourBucket: v.string(),        // "2026-02-05T14"
  agentName: v.string(),

  // Completion stats
  totalMessagesSent: v.number(),
  loopsCompleted: v.number(),
  loopsBroken: v.number(),

  // SLA adherence
  onTimeSeen: v.number(),
  onTimeReplied: v.number(),
  onTimeActed: v.number(),
  onTimeReported: v.number(),

  // Average times (milliseconds)
  avgTimeToSeen: v.number(),
  avgTimeToReply: v.number(),
  avgTimeToAction: v.number(),
  avgTimeToReport: v.number(),

  // Quality
  loopCompletionRate: v.number(), // 0-100
  slaAdherenceRate: v.number(),   // 0-100

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_agent_date", ["agentName", "date"])
  .index("by_date", ["date"])
  .index("by_hour", ["hourBucket"])

// New table: loopAlerts
loopAlerts: defineTable({
  messageId: v.id("agentMessages"),
  loopStage: v.union(
    v.literal("seen"),
    v.literal("reply"),
    v.literal("act"),
    v.literal("report")
  ),
  alertType: v.union(
    v.literal("sla_breach"),
    v.literal("loop_stalled"),
    v.literal("loop_broken")
  ),

  // Context
  fromAgent: v.string(),
  toAgent: v.string(),
  taskRef: v.optional(v.id("tasks")),
  messageContent: v.string(), // First 100 chars for reference

  // Alert details
  expectedBy: v.number(),
  actualTime: v.optional(v.number()),
  breachDuration: v.number(), // Milliseconds

  // Escalation
  escalatedTo: v.optional(v.string()),
  resolved: v.boolean(),
  resolvedAt: v.optional(v.number()),
  resolution: v.optional(v.string()),

  createdAt: v.number(),
})
  .index("by_unresolved", ["resolved", "createdAt"])
  .index("by_agent", ["toAgent", "resolved", "createdAt"])
  .index("by_message", ["messageId"])
```

**Migration script:** `convex/migrations/001_the_loop_schema.ts`

```typescript
import { internalMutation } from "./_generated/server";

export const backfillLoopFields = internalMutation({
  handler: async (ctx) => {
    const messages = await ctx.db.query("agentMessages").collect();
    let updated = 0;

    for (const msg of messages) {
      // Set default values for missing fields
      await ctx.db.patch(msg._id, {
        deliveredAt: msg.deliveredAt ?? msg._creationTime,
        loopBroken: msg.loopBroken ?? false,
        // Don't backfill SLA times for old messages (would be inaccurate)
      });
      updated++;
    }

    return { success: true, updated };
  },
});
```

**Effort:** 2 hours

---

### 1.2 Loop Status Mutations

**File:** `convex/messageStatus.ts` (extend existing)

**New mutations:**

```typescript
/**
 * Mark message as ACTED (work started)
 * Links message to task for tracking
 */
export const markAsActed = mutation({
  args: {
    messageId: v.id("agentMessages"),
    taskId: v.optional(v.id("tasks")),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Only allow recipient to mark as acted
    if (message.to !== args.agentName) {
      throw new Error("Only recipient can mark as acted");
    }

    // Update message
    await ctx.db.patch(args.messageId, {
      statusCode: 4, // ACTED
      actedAt: Date.now(),
      linkedTaskId: args.taskId,
      expectedReportBy: Date.now() + (24 * 60 * 60 * 1000), // +24 hours
    });

    // If task provided, link back
    if (args.taskId) {
      await ctx.db.patch(args.taskId, {
        linkedMessageId: args.messageId,
      });
    }

    return { success: true, status: "acted" };
  },
});

/**
 * Mark message as REPORTED (work completed)
 * Final stage of the loop
 */
export const markAsReported = mutation({
  args: {
    messageId: v.id("agentMessages"),
    report: v.string(), // Summary of what was done
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.to !== args.agentName) {
      throw new Error("Only recipient can mark as reported");
    }

    const now = Date.now();

    // Update message
    await ctx.db.patch(args.messageId, {
      statusCode: 5, // REPORTED
      reportedAt: now,
      finalReport: args.report,
    });

    // Clear any pending alerts for this message
    const alerts = await ctx.db
      .query("loopAlerts")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("resolved"), false))
      .collect();

    for (const alert of alerts) {
      await ctx.db.patch(alert._id, {
        resolved: true,
        resolvedAt: now,
        resolution: "Loop completed successfully",
      });
    }

    return { success: true, status: "reported", loopClosed: true };
  },
});

/**
 * Mark loop as broken with reason
 * For cases where work cannot be completed
 */
export const markLoopBroken = mutation({
  args: {
    messageId: v.id("agentMessages"),
    reason: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.to !== args.agentName) {
      throw new Error("Only recipient can mark loop broken");
    }

    const now = Date.now();

    // Update message
    await ctx.db.patch(args.messageId, {
      loopBroken: true,
      loopBrokenReason: args.reason,
      loopBrokeAt: now,
    });

    // Create alert
    await ctx.db.insert("loopAlerts", {
      messageId: args.messageId,
      loopStage: "report", // Broken at final stage
      alertType: "loop_broken",
      fromAgent: message.from,
      toAgent: message.to,
      messageContent: message.content.slice(0, 100),
      expectedBy: message.expectedReportBy ?? now,
      breachDuration: 0,
      escalatedTo: "max", // Auto-escalate to MAX
      resolved: false,
      createdAt: now,
    });

    return { success: true, status: "broken", reason: args.reason };
  },
});
```

**Update existing mutations:**

```typescript
// In markAsSeen:
expectedReplyBy: Date.now() + (15 * 60 * 1000), // +15 minutes

// In markAsReplied:
expectedActionBy: Date.now() + (2 * 60 * 60 * 1000), // +2 hours
```

**Effort:** 4 hours

---

### 1.3 SLA Monitoring Service

**File:** `convex/loopMonitor.ts` (new file)

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every 5 minutes
crons.interval(
  "check loop SLAs",
  { minutes: 5 },
  internal.loopMonitor.checkSLAs
);

export default crons;

// Internal mutation to check SLAs
export const checkSLAs = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active loops (not yet reported or broken)
    const activeMessages = await ctx.db
      .query("agentMessages")
      .filter((q) =>
        q.and(
          q.lt(q.field("statusCode"), 5), // Not reported
          q.neq(q.field("loopBroken"), true) // Not broken
        )
      )
      .collect();

    let alertsCreated = 0;

    for (const msg of activeMessages) {
      // Check SEEN SLA (5 min)
      if (msg.statusCode === 1 && msg.expectedReplyBy && now > msg.expectedReplyBy) {
        // Should have replied by now
        const existing = await ctx.db
          .query("loopAlerts")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .filter((q) => q.eq(q.field("loopStage"), "reply"))
          .first();

        if (!existing) {
          await ctx.db.insert("loopAlerts", {
            messageId: msg._id,
            loopStage: "reply",
            alertType: "sla_breach",
            fromAgent: msg.from,
            toAgent: msg.to,
            messageContent: msg.content.slice(0, 100),
            expectedBy: msg.expectedReplyBy,
            breachDuration: now - msg.expectedReplyBy,
            resolved: false,
            createdAt: now,
          });
          alertsCreated++;
        }
      }

      // Check ACT SLA (2 hours)
      if (msg.statusCode === 3 && msg.expectedActionBy && now > msg.expectedActionBy) {
        const existing = await ctx.db
          .query("loopAlerts")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .filter((q) => q.eq(q.field("loopStage"), "act"))
          .first();

        if (!existing) {
          await ctx.db.insert("loopAlerts", {
            messageId: msg._id,
            loopStage: "act",
            alertType: "sla_breach",
            fromAgent: msg.from,
            toAgent: msg.to,
            messageContent: msg.content.slice(0, 100),
            expectedBy: msg.expectedActionBy,
            breachDuration: now - msg.expectedActionBy,
            escalatedTo: "max", // Escalate to MAX after 2hr breach
            resolved: false,
            createdAt: now,
          });
          alertsCreated++;
        }
      }

      // Check REPORT SLA (24 hours)
      if (msg.statusCode === 4 && msg.expectedReportBy && now > msg.expectedReportBy) {
        const existing = await ctx.db
          .query("loopAlerts")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .filter((q) => q.eq(q.field("loopStage"), "report"))
          .first();

        if (!existing) {
          await ctx.db.insert("loopAlerts", {
            messageId: msg._id,
            loopStage: "report",
            alertType: "sla_breach",
            fromAgent: msg.from,
            toAgent: msg.to,
            messageContent: msg.content.slice(0, 100),
            expectedBy: msg.expectedReportBy,
            breachDuration: now - msg.expectedReportBy,
            escalatedTo: "ceo", // Escalate to CEO after 24hr breach
            resolved: false,
            createdAt: now,
          });
          alertsCreated++;
        }
      }
    }

    return { checked: activeMessages.length, alertsCreated };
  },
});
```

**Effort:** 4 hours

---

### 1.4 Metrics Aggregation

**File:** `convex/loopMetrics.ts` (new file)

```typescript
import { internalMutation } from "./_generated/server";

// Run hourly via cron
export const aggregateHourlyMetrics = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const hourBucket = new Date(now).toISOString().slice(0, 13); // "2026-02-05T14"
    const date = hourBucket.slice(0, 10); // "2026-02-05"

    // Get all agents
    const agents = await ctx.db.query("agents").collect();

    for (const agent of agents) {
      const agentName = agent.name.toLowerCase();

      // Get messages sent by this agent in past hour
      const oneHourAgo = now - (60 * 60 * 1000);
      const sentMessages = await ctx.db
        .query("agentMessages")
        .filter((q) =>
          q.and(
            q.eq(q.field("from"), agentName),
            q.gt(q.field("_creationTime"), oneHourAgo)
          )
        )
        .collect();

      if (sentMessages.length === 0) continue;

      // Calculate metrics
      const completed = sentMessages.filter((m) => m.statusCode === 5);
      const broken = sentMessages.filter((m) => m.loopBroken);

      const onTimeSeen = sentMessages.filter(
        (m) => m.seenAt && m.seenAt <= (m._creationTime + 5 * 60 * 1000)
      ).length;

      const onTimeReplied = sentMessages.filter(
        (m) => m.repliedAt && m.expectedReplyBy && m.repliedAt <= m.expectedReplyBy
      ).length;

      // Calculate averages
      const seenTimes = sentMessages
        .filter((m) => m.seenAt)
        .map((m) => m.seenAt! - m._creationTime);
      const avgTimeToSeen = seenTimes.length
        ? seenTimes.reduce((a, b) => a + b, 0) / seenTimes.length
        : 0;

      // Upsert metrics
      const existing = await ctx.db
        .query("loopMetrics")
        .withIndex("by_agent_date", (q) =>
          q.eq("agentName", agentName).eq("date", date)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          totalMessagesSent: existing.totalMessagesSent + sentMessages.length,
          loopsCompleted: existing.loopsCompleted + completed.length,
          loopsBroken: existing.loopsBroken + broken.length,
          avgTimeToSeen: (existing.avgTimeToSeen + avgTimeToSeen) / 2,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("loopMetrics", {
          date,
          hourBucket,
          agentName,
          totalMessagesSent: sentMessages.length,
          loopsCompleted: completed.length,
          loopsBroken: broken.length,
          onTimeSeen,
          onTimeReplied,
          onTimeActed: 0,
          onTimeReported: 0,
          avgTimeToSeen,
          avgTimeToReply: 0,
          avgTimeToAction: 0,
          avgTimeToReport: 0,
          loopCompletionRate: (completed.length / sentMessages.length) * 100,
          slaAdherenceRate: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true, date, hourBucket };
  },
});
```

**Effort:** 3 hours

---

### Phase 1 Deliverables

- ✅ Extended schema with loop tracking
- ✅ Loop status mutations (markAsActed, markAsReported, markLoopBroken)
- ✅ SLA monitoring cron job (every 5 min)
- ✅ Metrics aggregation (hourly)
- ✅ Migration script for backfilling

**Total Effort:** 13 hours

---

## Phase 2: Agent Protocol Integration (Week 1-2)

**Owner:** SAM + All Agents
**Estimated:** 10 hours (1.5 days)
**Depends on:** Phase 1 complete

### 2.1 Agent Message Handling

**File:** Update `docs/playbooks/SESSION-START.md`

Add new section:

```markdown
## 5. Process Inbox & Acknowledge Messages

Every agent must check inbox and complete loop stages:

### Step 1: Get unread messages
\`\`\`bash
npx convex run agentMessages:getUnreadMessages '{"agentName":"sam"}'
\`\`\`

### Step 2: For each message, mark as SEEN
\`\`\`bash
npx convex run messageStatus:markAsSeen '{
  "messageId": "[ID from step 1]",
  "agentName": "sam"
}'
\`\`\`

### Step 3: Send acknowledgment REPLY
\`\`\`bash
npx convex run agentMessaging:sendDirectMessage '{
  "fromAgent": "sam",
  "toAgent": "[sender name]",
  "content": "Got it. [understanding]. ETA: [time]",
  "priority": "normal"
}'
\`\`\`

### Step 4: If actionable, create task and mark ACTED
\`\`\`bash
# Create task
taskId=$(npx convex run tasks:create '{
  "title": "AGT-XXX: ...",
  "assignedTo": "sam",
  "status": "in_progress"
}' | jq -r .taskId)

# Link to message
npx convex run messageStatus:markAsActed '{
  "messageId": "[message ID]",
  "taskId": "'$taskId'",
  "agentName": "sam"
}'
\`\`\`

### Step 5: When done, mark REPORTED
See TASK-COMPLETE.md playbook
```

**Effort:** 3 hours (includes updating all agent-specific playbooks)

---

### 2.2 Task-Message Linkage

**File:** `convex/tasks.ts` (update schema)

Add field to tasks:

```typescript
tasks: defineTable({
  // ... existing fields ...
  linkedMessageId: v.optional(v.id("agentMessages")), // Message that spawned this task
})
  .index("by_message", ["linkedMessageId"])
```

**File:** `convex/agentActions.ts` (update completeTask)

```typescript
export const completeTask = mutation({
  // ... existing code ...
  handler: async (ctx, args) => {
    // ... existing task completion logic ...

    // NEW: Check if task is linked to a message
    const task = await ctx.db.get(taskId);
    if (task.linkedMessageId) {
      // Mark message loop as REPORTED
      await ctx.runMutation(api.messageStatus.markAsReported, {
        messageId: task.linkedMessageId,
        report: args.summary,
        agentName: args.agent,
      });
    }

    // ... rest of existing code ...
  },
});
```

**Effort:** 2 hours

---

### 2.3 Reply Templates

**File:** `docs/templates/LOOP-REPLIES.md` (new file)

```markdown
# Loop Reply Templates

Standard replies for common scenarios.

## Acknowledgment (REPLY stage)

### Task Accepted
\`\`\`
Got it. Starting [TASK] now. ETA: [TIME].
\`\`\`

### Need Clarification
\`\`\`
Received. Need clarification on [X]. Can you provide [details]?
\`\`\`

### Already In Progress
\`\`\`
Already working on this (started [TIME AGO]). ETA: [REMAINING TIME].
\`\`\`

## Action Started (ACT stage)

### Simple Update
\`\`\`
Started [TASK]. Will report when complete.
\`\`\`

### Progress Update
\`\`\`
In progress: [X% complete]. Completed [A, B]. Next: [C].
\`\`\`

### Blocked
\`\`\`
Blocked on [X]. Waiting for [Y from Z]. New ETA: [TIME].
\`\`\`

## Completion (REPORT stage)

### Success
\`\`\`
[TASK] complete.
- [What was done]
- Files: [list]
- Tests: [passed/results]
- Deployed: [where]
\`\`\`

### Partial Success
\`\`\`
[TASK] partially complete.
Done: [X, Y]
Remaining: [Z] (reason: [why])
Next steps: [what]
\`\`\`

### Failed
\`\`\`
[TASK] failed.
Attempted: [what]
Error: [details]
Need: [help/decision/resources]
\`\`\`

## Loop Broken

### Cannot Complete
\`\`\`
Cannot complete [TASK].
Reason: [requirements changed / blocked / out of scope]
Recommendation: [what should happen instead]
\`\`\`
```

**Effort:** 2 hours

---

### Phase 2 Deliverables

- ✅ Agent session-start protocol updated
- ✅ Task-message linkage working
- ✅ Auto-report on task completion
- ✅ Reply templates documented

**Total Effort:** 10 hours (cumulative: 23 hours)

---

## Implementation Timeline Summary

| Phase | Owner | Effort | Calendar Time | Cumulative |
|-------|-------|--------|---------------|------------|
| Phase 1: Backend Foundation | SAM | 13h | 1.5 days | 1.5 days |
| Phase 2: Agent Protocol | SAM + All | 10h | 1.5 days | 3 days |
| Phase 3: CEO Dashboard | LEO | 20h | 2.5 days | 5.5 days |
| Phase 4: Enforcement | SAM + MAX | 12h | 1.5 days | 7 days |
| Phase 5: Analytics | SAM + LEO | 9h | 1 day | 8 days |

**Total:** ~64 hours of dev work, 8 calendar days with parallel work

---

## Critical Dependencies

```
Phase 1 (Backend)
    ↓
Phase 2 (Agent Protocol)
    ↓
Phase 3 (CEO Dashboard) ← Can start during Phase 2
    ↓
Phase 4 (Enforcement)
    ↓
Phase 5 (Analytics)
```

---

**Next:** Create Linear tickets for each phase
