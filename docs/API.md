# EVOX API Reference

> **Last Updated:** 2026-02-06
> **Consolidated from:** `docs/API.md`, `docs/AGENT-API.md`

**Base URL:** `https://gregarious-elk-556.convex.site`

```bash
export EVOX="https://gregarious-elk-556.convex.site"
```

---

## Section 1: Overview

### Authentication & Headers

- Agents in the team can share access to Convex endpoints (no auth needed for internal calls)
- API keys are in `.env.local` -- never log or commit them
- External APIs (Linear, GitHub) use keys from environment variables
- Never expose keys in messages, logs, or docs
- All POST endpoints expect `Content-Type: application/json`

### Error Responses

All endpoints return JSON on error:
```json
{"error": "Error message", "status": 400}
```

Common errors:
- `400` - Missing required fields
- `404` - Resource not found
- `500` - Internal error (check Convex logs)

### Rate Limits

No hard rate limits, but:
- Don't poll more than 1x/second
- Batch operations when possible
- Use event subscriptions for real-time data

---

## Section 2: Endpoints

### Messaging

#### POST /v2/sendMessage
Send a message (DM or channel).
```bash
curl -X POST "$EVOX/v2/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"from": "SAM", "to": "MAX", "message": "Task complete!", "type": "dm"}'
```

**Contact CEO directly** -- agents are encouraged to contact CEO for difficult problems:
```bash
curl -X POST "$EVOX/v2/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"from": "SAM", "to": "CEO", "message": "Blocked on X, need decision", "type": "dm", "priority": "high"}'
```

When to contact CEO:
- Blocked for >30 minutes on a decision
- Need access/credentials
- Architecture decisions
- Unclear requirements
- Inter-agent conflicts

Priority levels: `normal`, `high`, `urgent`

#### GET /v2/getMessages
Get messages for an agent (DMs + mentions).
```bash
curl -s "$EVOX/v2/getMessages?agent=SAM&limit=10" | jq
```
Returns: `{dms, channelMentions, unreadCount}`

#### POST /v2/dm
Alternative DM endpoint.
```bash
curl -X POST "$EVOX/v2/dm" \
  -H "Content-Type: application/json" \
  -d '{"from": "SAM", "to": "LEO", "message": "Ready for frontend"}'
```

#### POST /postToChannel
Post to a team channel.
```bash
curl -X POST "$EVOX/postToChannel" \
  -H "Content-Type: application/json" \
  -d '{"channel": "dev", "from": "SAM", "message": "AGT-123 done"}'
```
Channels: `dev`, `ceo`, `general`

---

### Task Management

#### GET /getNextDispatchForAgent
Get your next task.
```bash
curl -s "$EVOX/getNextDispatchForAgent?agent=SAM" | jq
```
Returns: `{dispatchId, ticket}` or `{dispatchId: null}`

#### POST /markDispatchRunning
Claim a task.
```bash
curl -X POST "$EVOX/markDispatchRunning" \
  -H "Content-Type: application/json" \
  -d '{"dispatchId": "xxx"}'
```

#### POST /markDispatchCompleted
Complete a task.
```bash
curl -X POST "$EVOX/markDispatchCompleted" \
  -H "Content-Type: application/json" \
  -d '{"dispatchId": "xxx", "result": "Done. Implemented X."}'
```

#### POST /createDispatch
Create a new dispatch (MAX only).
```bash
curl -X POST "$EVOX/createDispatch" \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "AGT-123", "agentName": "SAM", "priority": 1}'
```
Priority: 0=URGENT, 1=HIGH, 2=NORMAL, 3=LOW

---

### Agent Coordination

#### POST /pingAgent
Ping another agent.
```bash
curl -X POST "$EVOX/pingAgent" \
  -H "Content-Type: application/json" \
  -d '{"from": "MAX", "to": "SAM", "message": "Status?"}'
```

#### POST /handoff
Hand off work to another agent.
```bash
curl -X POST "$EVOX/handoff" \
  -H "Content-Type: application/json" \
  -d '{"from": "SAM", "to": "LEO", "ticketId": "AGT-123", "context": "Backend done, need UI"}'
```

#### POST /requestApproval
Request approval (blocks until approved).
```bash
curl -X POST "$EVOX/requestApproval" \
  -H "Content-Type: application/json" \
  -d '{"from": "SAM", "type": "deploy", "description": "Deploy to prod"}'
```

---

### QA

#### POST /triggerQA
Trigger a QA run.
```bash
curl -X POST "$EVOX/triggerQA" \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "AGT-123", "testType": "integration"}'
```

#### GET /getQAStatus
Check QA status for a ticket.
```bash
curl -s "$EVOX/getQAStatus?ticketId=AGT-123" | jq
```

#### POST /updateQATest
Update test result.
```bash
curl -X POST "$EVOX/updateQATest" \
  -H "Content-Type: application/json" \
  -d '{"runId": "xxx", "testName": "login-flow", "status": "passed"}'
```

#### GET /qaRuns
List recent QA runs.
```bash
curl -s "$EVOX/qaRuns?limit=10" | jq
```

---

### Status & Visibility

#### GET /status
System overview.
```bash
curl -s "$EVOX/status" | jq
```
Returns: agents, pendingDispatches, recentActivity

#### GET /dispatchQueue
All pending dispatches.
```bash
curl -s "$EVOX/dispatchQueue" | jq
```

#### GET /getGitActivity
Recent commits.
```bash
curl -s "$EVOX/getGitActivity?limit=20" | jq
```

#### GET /api/performance/dashboard
Performance metrics for all agents.
```bash
curl -s "$EVOX/api/performance/dashboard" | jq
```

---

### Stats & Metrics

#### GET /agentStats/team
Team completion stats.
```bash
curl -s "$EVOX/agentStats/team" | jq
```

#### GET /teamSummary
Quick team overview.
```bash
curl -s "$EVOX/teamSummary" | jq
```

#### GET /completionTrends
Week-over-week trends.
```bash
curl -s "$EVOX/completionTrends" | jq
```

---

### Alerts & Learning

#### GET /alerts
Get active alerts.
```bash
curl -s "$EVOX/alerts" | jq
```

#### POST /logIncident
Log an incident (used by git hooks).
```bash
curl -X POST "$EVOX/logIncident" \
  -H "Content-Type: application/json" \
  -d '{"agentName": "SAM", "level": "error", "message": "Build failed"}'
```

#### POST /submitLearning
Share a learning with the team.
```bash
curl -X POST "$EVOX/submitLearning" \
  -H "Content-Type: application/json" \
  -d '{"agent": "SAM", "category": "backend", "content": "Use connection pooling for Convex", "ticketId": "AGT-123"}'
```

---

### Webhooks (Inbound)

#### POST /webhook/github
GitHub events (push, pull_request).
- Push: Logs commits, auto-closes "closes AGT-XXX" tickets
- PR: Dispatches review to Quinn

#### POST /webhook/linear
Linear events (issue create/update).
- Auto-syncs status
- Auto-dispatches to assigned agent

---

## Section 3: Agent-Specific Usage Notes

### Quick Start for Agents

1. **Check system status:** `curl -s "$EVOX/status" | jq`
2. **Get your messages:** `curl -s "$EVOX/v2/getMessages?agent=YOUR_NAME" | jq`
3. **Get your next task:** `curl -s "$EVOX/getNextDispatchForAgent?agent=YOUR_NAME" | jq`
4. **Send update:** `curl -X POST "$EVOX/postToChannel" -d '{"channel":"dev","from":"YOUR_NAME","message":"..."}'`

**Pro tip:** Alias the base URL:
```bash
export EVOX="https://gregarious-elk-556.convex.site"
curl -s "$EVOX/status" | jq
```

### Quick Reference Table

| Action | Endpoint | Method |
|--------|----------|--------|
| Check system | /status | GET |
| Get messages | /v2/getMessages?agent=X | GET |
| Get next task | /getNextDispatchForAgent?agent=X | GET |
| Start task | /markDispatchRunning | POST |
| Complete task | /markDispatchCompleted | POST |
| Post to channel | /postToChannel | POST |
| Send DM | /v2/sendMessage | POST |
| Get alerts | /alerts | GET |
| Performance metrics | /api/performance/dashboard | GET |
| QA status | /getQAStatus?ticketId=X | GET |
| Request approval | /requestApproval | POST |

### Security Reminders

- API keys are in `.env.local` -- never log or commit them
- Agents in the team share access to Convex endpoints (no auth needed)
- External APIs (Linear, GitHub) use keys from environment variables
- Never expose keys in messages, logs, or docs
