# AGT-??? Terminal UI for Agent Monitoring

**Priority:** P0 - CEO Visibility  
**Owner:** SAM (backend) + LEO (frontend)  
**Status:** ✅ MVP Complete

---

## Problem

CEO cần nhìn thấy agents đang làm gì trong real-time, ngay trên Dashboard, không cần SSH/tmux.

## Solution Implemented

### ttyd Web Terminal

```bash
# Install
brew install ttyd

# Start all agent terminals
./scripts/start-terminals.sh
```

**Ports:**
- MAX: http://localhost:7681
- SAM: http://localhost:7682
- LEO: http://localhost:7683
- QUINN: http://localhost:7684

**Remote (Tailscale):** http://100.106.143.17:7681-7684

### Dashboard Component

Created `components/evox/AgentTerminals.tsx`:
- Tabbed interface for switching agents
- Expandable terminal view (300px / 600px)
- Read-only for safety
- Integrated into CEODashboard

## Files Changed

- `scripts/start-terminals.sh` — Startup script for all ttyd instances
- `components/evox/AgentTerminals.tsx` — React component
- `components/evox/CEODashboard.tsx` — Added terminal row

## Architecture

```
┌─────────────────────────────────────────┐
│           EVOX Dashboard                │
│  ┌──────────┬──────────┬──────────┐     │
│  │  MAX     │   SAM    │   LEO    │     │
│  │ terminal │ terminal │ terminal │     │
│  │ (iframe) │ (iframe) │ (iframe) │     │
│  └──────────┴──────────┴──────────┘     │
└─────────────────────────────────────────┘
          │           │           │
          ▼           ▼           ▼
     ttyd:7681   ttyd:7682   ttyd:7683
          │           │           │
          ▼           ▼           ▼
   tmux evox-max  evox-sam   evox-leo
```

## Usage

1. **Start terminals:**
   ```bash
   cd evox && ./scripts/start-terminals.sh
   ```

2. **View in dashboard:**
   - Open EVOX Dashboard
   - Scroll to "Agent Terminals" section
   - Click agent tab to view their terminal

3. **Direct access:**
   - Local: http://localhost:7681 (MAX)
   - Remote: http://100.106.143.17:7681

## Future Improvements

- [ ] LaunchAgent for auto-start on boot
- [ ] Auth layer (basic auth or Convex session)
- [ ] Terminal search/filter
- [ ] Copy terminal output
- [ ] Fullscreen mode
