EVOX Ticket Writing Guidelines
================================

This is a public project. Anyone can see ticket titles and status.
AI agents (Sam, Leo, Max) need enough detail to execute.
Strategy stays private.


TITLE FORMAT
------------
[PREFIX]-[NUMBER]: [Action verb] + [What] + [Where]

Good:
  AGT-109: Implement WORKING.md memory system per agent
  AGT-118: Add agent-to-agent direct messaging via Convex
  AGT-120: Build daily standup auto-generation cron

Bad:
  AGT-109: Memory stuff
  AGT-118: Messaging feature
  AGT-120: Fix the standup thing


ACTION VERBS
------------
Build    - new feature from scratch
Add      - new capability to existing feature
Fix      - bug or broken behavior
Refactor - improve code without changing behavior
Update   - change existing content or config
Remove   - delete feature or code
Test     - add or fix tests


DESCRIPTION TEMPLATE
--------------------
## What
[1-2 sentences. What does this ticket deliver?]

## Why
[1 sentence. Which constraint or truth does this solve?
 Keep it technical, not strategic.]

## Spec
[Technical details. Enough for an AI agent to execute.
 Include: files to create/modify, schema changes,
 API endpoints, UI components.]

## Acceptance
- [ ] [Testable criteria]
- [ ] [Testable criteria]


DESCRIPTION RULES
-----------------
DO:
  - Write technical specs (file paths, schema, API shape)
  - Reference other tickets by ID (AGT-109)
  - Include code snippets or pseudocode
  - State constraints ("must work with existing Convex schema")

DON'T:
  - Mention competitors by name
  - Explain business strategy or market positioning
  - Include revenue targets or growth metrics
  - Link to private strategy docs


EXAMPLE: GOOD TICKET
--------------------
Title: AGT-109: Implement WORKING.md memory system per agent

## What
Create per-agent persistent memory using Convex agentMemory table.
Each agent reads their WORKING.md on boot to restore context.

## Why
LLMs lose all context between sessions (Truth 1).
External persistent state is required for continuity.

## Spec
- New Convex table: agentMemory
  - agentId: string
  - type: "working" | "daily" | "longterm"
  - content: string
  - updatedAt: number
- New Convex functions:
  - getAgentMemory(agentId, type)
  - updateAgentMemory(agentId, type, content)
- Boot protocol reads working memory in context-boot sequence

## Acceptance
- [ ] Each agent has isolated memory (Sam can't read Leo's)
- [ ] Memory persists across sessions
- [ ] Boot protocol loads working memory in under 2 seconds
- [ ] UI shows memory content in agent detail view


EXAMPLE: BAD TICKET
-------------------
Title: AGT-109: Build memory system

We need memory so our agents are better than competitor X.
This will help us capture the agent orchestration market.
See strategy doc: [link to private Notion page]
Just make it work like Clawdbot's WORKING.md system.


PRIORITY LABELS
---------------
Urgent  - Blocking other work. Do today.
High    - Core roadmap. Do this week.
Normal  - Important but not blocking.
Low     - Nice to have. Backlog.


STATUS FLOW
-----------
Backlog -> Todo -> In Progress -> In Review -> Done

Only one "In Progress" per agent at a time.
Move to "In Review" when PR is ready.
Move to "Done" when merged + verified.


PROJECT TAGS
------------
Every ticket belongs to exactly one project:
  EVOX      - Agent orchestration system
  Affitor   - Affiliate marketing platform
  MyTimezone - Timezone converter tool

Cross-project work: create separate tickets in each project,
link them by ID in description.
