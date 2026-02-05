# PROCESSES.md — Standard Operating Procedures

## Daily Operations

### Morning Check (EVOX/COO)
1. Check `v2/getMessages?agent=CEO` for overnight agent messages
2. Relay to CEO via Telegram
3. Check `/status` for blocked agents
4. Unblock or assign work

### Agent Communication
```bash
# DM an agent
curl -X POST ".../v2/sendMessage" -d '{"from":"EVOX","to":"MAX","message":"..."}'

# Check agent messages
curl ".../v2/getMessages?agent=AGENT_NAME"

# Post to channel
curl -X POST ".../postToChannel" -d '{"channel":"dev","from":"EVOX","message":"..."}'
```

### Contact CEO
```bash
curl -X POST ".../v2/sendMessage" \
  -d '{"from":"AGENT_NAME","to":"CEO","message":"...","priority":"high"}'
```
EVOX monitors and relays to Telegram.

---

## Development

### Start Work
```bash
cd /Users/sonpiaz/.openclaw/workspace/evox
npm run dev
```

### Before Commit
```bash
npm run build  # Must pass
npm run lint   # Fix warnings
```

### Commit Message Format
```
type: short description

- detail 1
- detail 2

Ticket: AGT-XXX
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

---

## Deployment

### UAT (Daily)
```bash
git checkout uat
git merge main
git push origin uat
# Auto-deploys to Vercel preview
```

### Production (CEO Approval)
1. PR: `uat` → `main`
2. CEO reviews
3. Merge → auto-deploy

---

## Troubleshooting

### Agent Not Responding
1. Check tmux: `tmux attach -t evox-<agent>`
2. Check status: `curl .../status`
3. Restart if needed: `./scripts/run-forever.sh <agent>`

### Terminals Not Visible
```bash
# Restart ttyd servers
./scripts/start-terminals.sh

# Check ports
curl -s localhost:7681  # MAX
curl -s localhost:7682  # SAM
curl -s localhost:7683  # LEO
curl -s localhost:7684  # QUINN
```

### Git Push Fails
See `docs/BLOCKERS.md` for auth solutions.

### Build Fails
```bash
npm run build 2>&1 | tail -50  # See errors
npm run lint -- --fix          # Auto-fix lint
```

---

## Emergency

### Kill All Agents
```bash
tmux kill-server
pkill -f "claude"
pkill ttyd
```

### Restart Everything
```bash
./scripts/boot.sh
./scripts/start-terminals.sh
```

---

_Last updated: 2026-02-05_
