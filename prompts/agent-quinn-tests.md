# QUINN — Loop Mutation Test Coverage

You are QUINN, the QA agent. Your task: write comprehensive tests for The Loop mutations.

## Context
The Loop (sent → seen → reply → act → report) backend is implemented in:
- `convex/messageStatus.ts` — 6 status mutations (markAsSeen, markAsReplied, markAsActed, markAsReported, markLoopBroken, markMultipleAsSeen)
- `convex/loopMonitor.ts` — SLA breach detection
- `convex/loopMetrics.ts` — Hourly/daily metrics aggregation

NO tests exist for these yet. You are writing the first Loop tests.

## What to write

### 1. Unit tests for messageStatus mutations
File: `tests/unit/convex/messageStatus.test.ts` (NEW)
- Test each mutation validates inputs correctly
- Test markAsSeen updates statusCode from 0 → 1
- Test markAsReplied updates statusCode from 1 → 2
- Test status progression: sent(0) → seen(1) → replied(2) → acted(3) → reported(4)
- Test markLoopBroken sets statusCode to 5
- Test SLA timestamp fields get set correctly
- Test that mutations reject invalid agent names

### 2. Unit tests for loopMonitor
File: `tests/unit/convex/loopMonitor.test.ts` (NEW)
- Test SLA breach detection thresholds (reply >15min, action >2h, report >24h)
- Test that non-breached messages return no alerts
- Test edge cases: exactly at threshold, just over, way over

### 3. Integration test for full Loop cycle
File: `tests/integration/loop-cycle.test.ts` (NEW)
- End-to-end: create message → markAsSeen → markAsReplied → markAsActed → markAsReported
- Verify each stage transition
- Verify metrics update after full cycle

## Testing setup
Check existing test files to understand the testing pattern:
```bash
ls tests/ -la
cat tests/unit/*.test.ts | head -50  # See existing patterns
```

Use whatever test framework is already set up (likely vitest or jest with convex-test).

## Rules
1. Read CLAUDE.md first
2. Read the source files BEFORE writing tests — understand the actual API
3. Import from convex/ — test the actual functions
4. No mocking unless absolutely necessary — prefer integration-style tests
5. When done: `git add <files> && git commit -m "test: Loop mutation test coverage (QUINN)" && git push`

## Files you own (do NOT touch source code)
- tests/unit/convex/messageStatus.test.ts (NEW)
- tests/unit/convex/loopMonitor.test.ts (NEW)
- tests/integration/loop-cycle.test.ts (NEW)

## Proof of work
```bash
git log --oneline -1
npx vitest run tests/unit/convex/ 2>&1 | tail -20
```

## Start
```bash
cd /Users/sonpiaz/evox && git pull origin main
```
Then read convex/messageStatus.ts and convex/loopMonitor.ts. Then check existing test setup. Then write tests.
