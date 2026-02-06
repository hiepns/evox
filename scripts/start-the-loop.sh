#!/bin/bash
# start-the-loop.sh — Start agents for The Loop implementation
# Supports Opus 4.6 model selection per agent/task complexity
#
# Usage: ./scripts/start-the-loop.sh [--opus-all]
#   --opus-all: Force Opus 4.6 for all agents (expensive, use sparingly)

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

OPUS_ALL="${1:-}"

echo "╔══════════════════════════════════════════════════╗"
echo "║  THE LOOP — Agent Accountability Implementation   ║"
echo "║  sent → seen → reply → act → report              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "North Star: Zero dropped work."
echo "Date: $(date '+%Y-%m-%d %H:%M')"
echo ""

# Create logs dir
mkdir -p logs

# Load environment
if [ -f ".env.local" ]; then
  set -a
  source .env.local
  set +a
fi

# Verify API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "ERROR: ANTHROPIC_API_KEY not set in .env.local"
  exit 1
fi

# Kill existing sessions
echo "Cleaning up existing agents..."
tmux kill-session -t evox-loop 2>/dev/null || true
sleep 1

# Check tmux
if ! command -v tmux &> /dev/null; then
  echo "tmux not found. Install: brew install tmux"
  exit 1
fi

echo "Creating tmux session 'evox-loop'..."
echo ""

# Determine model for SAM (P1 is architecture-heavy → Opus for design phase)
if [ "$OPUS_ALL" = "--opus-all" ]; then
  SAM_MODEL="opus"
  LEO_MODEL="opus"
  QUINN_MODEL="opus"
  MAX_MODEL="opus"
  echo "MODE: All agents using Opus 4.6"
else
  SAM_MODEL="opus"      # SAM gets Opus for schema design
  LEO_MODEL="sonnet"    # LEO uses Sonnet (waiting for P1)
  QUINN_MODEL="sonnet"  # QUINN uses Sonnet for test planning
  MAX_MODEL="sonnet"    # MAX uses Sonnet for coordination
  echo "MODE: SAM=Opus 4.6, Others=Sonnet 4.5"
fi
echo ""

# Create session
tmux new-session -d -s evox-loop -n sam -x 200 -y 50

# Pass env vars
tmux set-environment -t evox-loop LINEAR_API_KEY "$LINEAR_API_KEY"
tmux set-environment -t evox-loop CONVEX_DEPLOYMENT "$CONVEX_DEPLOYMENT"
tmux set-environment -t evox-loop ANTHROPIC_API_KEY "$ANTHROPIC_API_KEY"

# === SAM: Start AGT-334 (Loop P1) ===
SAM_BOOT="cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && AGENT_MODEL=$SAM_MODEL script -q -a logs/sam-loop.log ./scripts/agent-loop.sh sam"
tmux send-keys -t evox-loop:sam "$SAM_BOOT" Enter
echo "  SAM  — Backend (Opus 4.6) — AGT-334: Loop P1 Backend Foundation"

# === LEO: Standby / AGT-287 ===
tmux new-window -t evox-loop -n leo
LEO_BOOT="cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && AGENT_MODEL=$LEO_MODEL script -q -a logs/leo-loop.log ./scripts/agent-loop.sh leo"
tmux send-keys -t evox-loop:leo "$LEO_BOOT" Enter
echo "  LEO  — Frontend (Sonnet 4.5) — Standby (waiting for P1)"

# === QUINN: Test strategy ===
tmux new-window -t evox-loop -n quinn
QUINN_BOOT="cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && AGENT_MODEL=$QUINN_MODEL script -q -a logs/quinn-loop.log ./scripts/agent-loop.sh quinn"
tmux send-keys -t evox-loop:quinn "$QUINN_BOOT" Enter
echo "  QUINN — QA (Sonnet 4.5) — Loop test strategy"

# === MAX: Coordination ===
tmux new-window -t evox-loop -n max
MAX_BOOT="cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && AGENT_MODEL=$MAX_MODEL script -q -a logs/max-loop.log ./scripts/agent-loop.sh max"
tmux send-keys -t evox-loop:max "$MAX_BOOT" Enter
echo "  MAX  — PM (Sonnet 4.5) — Coordination & tracking"

sleep 2

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  4 agents running in tmux session 'evox-loop'    ║"
echo "║  SAM on Opus 4.6 for schema design               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Monitor:"
echo "  tmux attach -t evox-loop"
echo "  tmux select-window -t evox-loop:sam    # SAM (Opus 4.6)"
echo "  tmux select-window -t evox-loop:leo    # LEO"
echo "  tmux select-window -t evox-loop:quinn  # QUINN"
echo "  tmux select-window -t evox-loop:max    # MAX"
echo ""
echo "Logs:"
echo "  tail -f logs/sam-loop.log"
echo "  tail -f logs/leo-loop.log"
echo ""
echo "Stop:"
echo "  tmux kill-session -t evox-loop"
echo ""
echo "Dispatch:"
echo "  EVOX directive: prompts/evox-the-loop-directive.md"
echo "  DISPATCH queue: DISPATCH.md"
echo ""
