# AGT-XXX: Enable MAX to Create Tickets

**Priority:** P0 (Critical)
**Owner:** SAM (Backend) → then MAX
**Requested by:** CEO via EVOX (COO)
**Date:** 2026-02-05

## Context

CEO requires that MAX (PM agent) can autonomously create tickets in Linear without human intervention. This is the foundation for agent-to-agent communication and autonomous operation.

## Current State

- ✅ Linear API key created: `EVOX Agents`
- ✅ `createLinearIssue()` function added to `lib/evox/linear-client.ts`
- ✅ API endpoint created: `POST /api/agent/create-ticket`
- ✅ MAX config updated with API usage instructions
- ⏳ Code committed locally, needs push to GitHub
- ⏳ `LINEAR_API_KEY` needs to be added to Vercel environment

## Requirements

### Phase 1: Deploy API (SAM)
- [ ] Push code to GitHub (or coordinate with human)
- [ ] Add `LINEAR_API_KEY` to Vercel environment variables
- [ ] Verify endpoint works: `GET /api/agent/create-ticket` returns health check
- [ ] Test ticket creation: `POST /api/agent/create-ticket`

### Phase 2: MAX Integration (MAX)
- [ ] MAX learns to use the create-ticket API
- [ ] MAX creates tickets based on CEO/EVOX directives
- [ ] MAX assigns tickets to appropriate agents (SAM/LEO)
- [ ] Tickets appear in Linear and sync to EVOX dashboard

## API Specification

```bash
POST https://evox-ten.vercel.app/api/agent/create-ticket
Content-Type: application/json

{
  "title": "Feature: Add X to Y",
  "description": "## Context\n...\n\n## Requirements\n- ...",
  "priority": "urgent|high|medium|low",
  "assignee": "sam|leo|max|quinn",
  "from": "max"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "uuid",
    "identifier": "AGT-XXX",
    "url": "https://linear.app/affitorai/issue/AGT-XXX",
    "title": "..."
  }
}
```

## Acceptance Criteria

- [ ] MAX can create a ticket by calling the API
- [ ] Ticket appears in Linear within 5 seconds
- [ ] Ticket syncs to EVOX dashboard via webhook
- [ ] Activity logged in Messages/Activity feed

## Technical Notes

- Linear API key is stored in `.env.local` (local) and needs to be in Vercel env
- Endpoint validates required fields and returns proper errors
- Logs ticket creation to Convex for audit trail

## Dependencies

- Blocked by: Git push access, Vercel env access
- Blocks: All autonomous agent operation
