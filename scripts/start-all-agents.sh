#!/bin/bash
# start-all-agents.sh — Start agents with API key for headless operation
# Uses tmux for process management and log capture
#
# Supports both subscription auth (TTY) and API key auth (headless)

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "╔════════════════════════════════════════════════╗"
echo "║  EVOX — Automation Squad (API key auth)        ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "North Star: 100% AUTOMATION"
echo ""

# Create logs dir
mkdir -p logs

# Load environment variables
if [ -f ".env.local" ]; then
  set -a
  source .env.local
  set +a
fi

# Kill existing
echo "Cleaning up..."
tmux kill-session -t evox 2>/dev/null || true
pkill -f "agent-loop.sh" 2>/dev/null || true
rm -f .lock-* 2>/dev/null || true
sleep 2

# Check tmux
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux not found. Install with: brew install tmux"
    exit 1
fi

echo "Creating tmux session 'evox' with 4 agent windows..."
echo ""

# Create detached tmux session with first window (sam)
tmux new-session -d -s evox -n sam -x 200 -y 50

# Set environment in tmux
tmux set-environment -t evox LINEAR_API_KEY "$LINEAR_API_KEY"
tmux set-environment -t evox CONVEX_DEPLOYMENT "$CONVEX_DEPLOYMENT"
tmux set-environment -t evox ANTHROPIC_API_KEY "$ANTHROPIC_API_KEY"

# Start SAM in first window - run directly in tmux (TTY preserved, tmux captures output)
# Mac script syntax: script [-aq] file command...
tmux send-keys -t evox:sam "cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && script -q -a logs/sam.log ./scripts/agent-loop.sh sam" Enter
echo "  ✅ SAM  — Backend (tmux window 0)"

# Create and start LEO
tmux new-window -t evox -n leo
tmux send-keys -t evox:leo "cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && script -q -a logs/leo.log ./scripts/agent-loop.sh leo" Enter
echo "  ✅ LEO  — Frontend (tmux window 1)"

# Create and start MAX
tmux new-window -t evox -n max
tmux send-keys -t evox:max "cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && script -q -a logs/max.log ./scripts/agent-loop.sh max" Enter
echo "  ✅ MAX  — PM (tmux window 2)"

# Create and start QUINN
tmux new-window -t evox -n quinn
tmux send-keys -t evox:quinn "cd $PROJECT_DIR && export \$(grep -v '^#' .env.local | cut -d'#' -f1 | xargs) && script -q -a logs/quinn.log ./scripts/agent-loop.sh quinn" Enter
echo "  ✅ QUINN — QA (tmux window 3)"

sleep 2

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  4 agents running in tmux session 'evox'       ║"
echo "║  Using API key auth (headless ready)           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Monitor agents:"
echo "  tmux attach -t evox          # View all"
echo "  tmux select-window -t evox:0 # SAM"
echo "  tmux select-window -t evox:1 # LEO"
echo "  tmux select-window -t evox:2 # MAX"
echo "  tmux select-window -t evox:3 # QUINN"
echo ""
echo "View logs:"
echo "  tail -f logs/sam.log"
echo "  tail -f logs/leo.log"
echo "  tail -f logs/max.log"
echo "  tail -f logs/quinn.log"
echo ""
echo "Stop all:"
echo "  ./scripts/stop-all-agents.sh"
echo ""
