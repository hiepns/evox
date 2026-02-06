# EVOX Mission Control — Agent Rules

Auto-loaded every Claude Code session. Last updated: Feb 5, 2026.

## Constitution

**Read First:** [docs/VISION.md](docs/VISION.md) — The organizational DNA, values, and genius thinking framework.

## Project

| Key | Value |
|-----|-------|
| App | EVOX Mission Control — AI agent orchestration dashboard |
| Stack | Next.js 14 App Router + Convex + Tailwind + shadcn/ui |
| Deploy | Vercel → evox-ten.vercel.app |
| Repo | github.com/sonpiaz/evox |

## Team Territories

| Agent | Territory | Files |
|-------|-----------|-------|
| Sam | Backend | `convex/`, `lib/evox/`, `scripts/` |
| Leo | Frontend | `app/`, `components/` |
| Quinn | QA | `*.test.ts`, `e2e/`, code review |
| Max | PM | Linear docs, planning, coordination |

**Rule:** Territories are guidelines, not walls. Cross-territory edits allowed — just report in #dev.

## Agent Instructions
- Sam: [Linear Doc](https://linear.app/affitorai/document/sam-instructions-backend-agent-a0ad2c23626a)
- Leo: [Linear Doc](https://linear.app/affitorai/document/leo-instructions-frontend-agent-c84654462a4d)
- Quinn: [Linear Doc](https://linear.app/affitorai/document/quinn-operating-rules-e12df74361ab)

## Team Culture
**Read:** [docs/CULTURE.md](docs/CULTURE.md) — How we communicate, collaborate, and share learnings.

---

## Playbooks

| Playbook | When | Link |
|----------|------|------|
| Session Start | Every new session | [docs/playbooks/SESSION-START.md](docs/playbooks/SESSION-START.md) |
| Pre-Commit | Before every commit | [docs/playbooks/PRE-COMMIT.md](docs/playbooks/PRE-COMMIT.md) |
| Task Complete | After finishing any ticket | [docs/playbooks/TASK-COMPLETE.md](docs/playbooks/TASK-COMPLETE.md) |

---

## Patterns

| Pattern | Problem | Link |
|---------|---------|------|
| Display IDs | Never show raw Convex `_id` | [docs/patterns/DISPLAY-IDS.md](docs/patterns/DISPLAY-IDS.md) |
| Status Colors | Use exhaustive maps, not ternaries | [docs/patterns/STATUS-COLORS.md](docs/patterns/STATUS-COLORS.md) |
| Attribution | Agent name from caller, not API key | [docs/patterns/ATTRIBUTION.md](docs/patterns/ATTRIBUTION.md) |
| Convex Actions | When to use actions vs mutations | [docs/patterns/CONVEX-ACTIONS.md](docs/patterns/CONVEX-ACTIONS.md) |

---

## Quick Reference

### Session Start
```
1. Read CLAUDE.md → Rules
2. Read DISPATCH.md → Task queue
3. Read SOUL.md → Identity
4. Read WORKING.md → Last session context
5. Check @mentions → Anyone need me?
6. Act or report HEARTBEAT_OK
```

### Pre-Commit
```bash
npx next build                    # Must pass
git status                        # No untracked files
git diff --stat HEAD              # Review changes
```

### Task Complete
```bash
git commit -m "closes AGT-XX: description" && git push
npx convex run agentActions:completeTask '{"agent":"sam","ticket":"AGT-XX","action":"completed","summary":"..."}'
./scripts/linear-report.sh AGT-XX "Done. [summary]. Files: [list]."
```

---

## Architecture Rules (MANDATORY — Feb 5, 2026)

These rules exist because we found 30-40% of the codebase is duplicate or dead code.
**Every agent MUST follow these rules. Violations will be rejected in review.**

### Rule 1: No New Files Without Search

Before creating ANY new file, search for existing files that do the same thing:
```bash
# Before creating a new component
grep -rn "ActivityFeed\|activity.*feed" components/ --include="*.tsx" -l
# Before creating a new convex function
grep -rn "getMessages\|sendMessage" convex/ --include="*.ts" -l
```
**If a similar file exists → EDIT it. Do NOT create a new one.**

We currently have 7 dashboard variants and 4 feed variants because agents kept creating instead of editing.

### Rule 2: Agent Identity — Use String Names, NOT Convex IDs

The canonical agent identifier is the **lowercase string name**: `"sam"`, `"leo"`, `"max"`, `"quinn"`.

| Context | Use | Example |
|---------|-----|---------|
| API params | `v.string()` | `agentName: "sam"` |
| DB storage (new tables) | `v.string()` | `fromAgent: "sam"` |
| DB storage (legacy tables) | `v.id("agents")` | Resolve with `resolveAgentIdByName()` |
| Comparing DB field to name | **ALWAYS resolve first** | `resolveAgentNameById(msg.to) === "sam"` |

**NEVER compare `v.id("agents")` directly with a string name. They are different types.**

```typescript
// WRONG — will always fail
if (message.to !== agentName) { ... }

// CORRECT — resolve ID to name first
const recipientName = await resolveAgentNameById(ctx.db, message.to);
if (recipientName !== agentName) { ... }
```

### Rule 3: Single Source of Truth

These constants must be imported, never duplicated:

| Constant | Source File | What |
|----------|------------|------|
| Agent list | `convex/agentRegistry.ts` | `AGENT_ID_MAP` — all agents |
| Valid agents | `convex/agentRegistry.ts` | `VALID_AGENTS` array |
| Status codes | `convex/messageStatus.ts` | `MessageStatus` enum (0-5) |
| SLA timers | `convex/messageStatus.ts` | `SLA` object |
| Status labels | `convex/messageStatus.ts` | `StatusLabels` map |

**NEVER hardcode agent lists like `["sam", "leo", "max"]` in random files.**

### Rule 4: One Messaging Table

All new messaging code MUST use `unifiedMessages` table.

| Table | Status | Action |
|-------|--------|--------|
| `unifiedMessages` | **ACTIVE — use this** | All new code |
| `agentMessages` | Legacy (Loop depends on it) | Read-only until migrated |
| `messages` | Legacy | Do not use |
| `meshMessages` | Legacy | Do not use |

### Rule 5: No New Schema Tables Without CEO Approval

We have 48 tables. Most MVPs have 10-15.

**Before adding a table:**
1. Check if an existing table can be extended
2. Document why a new table is needed
3. Get CEO approval via EVOX

**Tables that probably should be merged:**
- `activities` + `activityEvents` + `activityLogs` → 1 table
- `learnings` + `orgLearnings` + `agentLearnings` → 1 table
- `executionLogs` + `engineLogs` → 1 table

### Rule 6: Proof of Work

Marking a ticket "Done" requires:
```
1. Commit hash (git log --oneline -1)
2. Files changed (git diff --stat HEAD~1)
3. Build status (npx next build → pass/fail)
```
**No commit hash = not done.** EVOX will verify.

### Rule 7: Delete Dead Code

When replacing a component or function:
1. **Delete the old file** — don't leave it "just in case"
2. **Remove imports** referencing the old file
3. **Verify build passes** after deletion

If unsure whether code is used: `grep -rn "ComponentName" . --include="*.tsx" --include="*.ts" | grep -v node_modules`

### Rule 8: Max File Size

| File Type | Max Lines | Action if exceeded |
|-----------|-----------|-------------------|
| Convex function file | 500 | Split into queries + mutations |
| React component | 300 | Extract sub-components |
| HTTP routes | 500 | Split by domain (agents, tasks, messaging) |

**Current violators:** `http.ts` (3,396), `schema.ts` (1,411), `tasks.ts` (1,210), `agentActions.ts` (922)

---

## Quality Gates

| Rule | Check |
|------|-------|
| No raw `_id` in UI | `grep -rn "\._id" app/ components/ --include="*.tsx" \| grep -v "key="` |
| Build passes | `npx next build` |
| All files committed | `git status` |
| Case-insensitive status | Always `.toLowerCase()` |
| Attribution correct | Use `completeTask` API, not direct DB writes |
| No duplicate files | Search before creating (Rule 1) |
| Agent identity correct | String names, resolve IDs (Rule 2) |
| No hardcoded agent lists | Import from `agentRegistry.ts` (Rule 3) |
| Proof of work | Commit hash + files + build status (Rule 6) |

---

## Architecture Decisions

| ADR | Decision |
|-----|----------|
| [ADR-001](docs/decisions/ADR-001.md) | External persistent state for agent memory |
| [ADR-002](docs/decisions/ADR-002.md) | Hierarchical memory (SOUL/WORKING/daily) |
| [ADR-003](docs/decisions/ADR-003.md) | Shared communication via Convex |
| [ADR-004](docs/decisions/ADR-004.md) | Scheduler-driven agent activation |
| [ADR-005](docs/decisions/ADR-005.md) | Permission levels and human oversight |
| [ADR-006](docs/decisions/ADR-006.md) | Headless agent authentication via tmux |

---

## Security Rules

1. **KHÔNG hardcode secrets** — API keys, tokens, passwords phải ở `.env.local`
2. **Pre-commit check** — Grep for secrets trước khi commit
3. **Review LESSONS.md** — Học từ sai lầm trước


---

## Session End Protocol (MANDATORY)

Trước khi restart session, PHẢI chạy:
```bash
./scripts/restart-agent.sh <agent>
```

Script sẽ tự động:
1. Capture terminal output
2. Hỏi agent 3 lessons learned
3. Log to `docs/sessions/YYYY-MM-DD-<agent>.md`
4. Post to Convex activity
5. THEN restart

**KHÔNG được restart bằng cách khác!**

### Lessons Format
```markdown
1. **Keyword** — Giải thích ngắn gọn, actionable
2. **Keyword** — Specific, không generic
3. **Keyword** — Có thể apply cho agents khác
```

### Org-wide Lessons
Nếu lesson quan trọng cho tất cả agents:
1. Copy vào `docs/LESSONS.md`
2. Thêm date và context
3. Commit với message: `docs: Add lesson - [keyword]`
