# Anthropic Authentication Setup for Headless Agents

## Problem

Claude CLI supports two authentication methods:
- **Subscription auth**: Requires interactive TTY (terminal). Works with `claude` command in terminal.
- **API key auth**: Works headless (background processes, nohup, cron, etc.). Uses `ANTHROPIC_API_KEY`.

For 100% automation, agents must run headless → requires API key auth.

## Solution

### 1. Get API Key

1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. Add credits at https://console.anthropic.com/settings/billing ($20-50 recommended)

### 2. Configure Environment

Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 3. Verify Setup

Run validation script:
```bash
./scripts/validate-auth.sh
```

Should output:
```
✅ ANTHROPIC_API_KEY set
✅ API key valid
✅ Credits available
```

## How It Works

1. **start-all-agents.sh** loads `.env.local` and sets `ANTHROPIC_API_KEY` in tmux environment
2. **agent-loop.sh** inherits environment variables from tmux
3. **Claude CLI** detects `ANTHROPIC_API_KEY` and uses API auth instead of subscription
4. Agents run headless without "Credit balance too low" errors

## Troubleshooting

### "Credit balance too low"
- API key not set: Check `.env.local` has `ANTHROPIC_API_KEY`
- No credits: Add credits at https://console.anthropic.com/settings/billing

### "Authentication failed"
- Invalid API key: Regenerate at https://console.anthropic.com/settings/keys
- Key not exported: Restart agents with `./scripts/start-all-agents.sh`

## Architecture Decision

See [ADR-006: Headless agent authentication](decisions/ADR-006.md) for full context.
