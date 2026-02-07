#!/bin/bash
# restart-agent.sh — Safe restart with lesson capture
# Usage: ./scripts/restart-agent.sh <agent>

set -euo pipefail

AGENT="${1:-}"
if [ -z "$AGENT" ]; then
  echo "Usage: ./scripts/restart-agent.sh <agent>"
  exit 1
fi

AGENT_LOWER=$(echo "$AGENT" | tr '[:upper:]' '[:lower:]')
EVOX_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔄 Restarting $AGENT..."
echo ""

# Step 1: Capture lessons
echo "Step 1/3: Capturing session lessons..."
"$EVOX_DIR/scripts/session-end.sh" "$AGENT"

# Step 2: Wait for agent to respond (max 30s)
echo ""
echo "Step 2/3: Waiting 30s for agent to log lessons..."
sleep 30

# Step 3: Kill and restart
echo ""
echo "Step 3/3: Restarting session..."
tmux kill-session -t "evox-$AGENT_LOWER" 2>/dev/null || true
sleep 2

# Start fresh session
"$EVOX_DIR/scripts/start-agent.sh" "$AGENT_LOWER" 2>/dev/null || {
  echo "Creating new session..."
  tmux new-session -d -s "evox-$AGENT_LOWER" -c "$EVOX_DIR"
  tmux send-keys -t "evox-$AGENT_LOWER" "claude" Enter
  sleep 3
  "$EVOX_DIR/scripts/agent-boot.sh" "$AGENT_LOWER" | tmux send-keys -t "evox-$AGENT_LOWER"
  tmux send-keys -t "evox-$AGENT_LOWER" Enter
}

echo ""
echo "✅ $AGENT restarted with fresh context!"
