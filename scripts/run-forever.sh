#!/bin/bash
# run-forever.sh — Keep agent running 24/7
# Usage: ./scripts/run-forever.sh <agent>
# Runs in tmux, auto-restarts when session ends

set -e

AGENT="${1:-}"
if [ -z "$AGENT" ]; then
  echo "Usage: ./scripts/run-forever.sh <agent>"
  exit 1
fi

AGENT_LOWER=$(echo "$AGENT" | tr '[:upper:]' '[:lower:]')
AGENT_UPPER=$(echo "$AGENT" | tr '[:lower:]' '[:upper:]')
SESSION="evox-$AGENT_LOWER"
EVOX_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EVOX_API="https://gregarious-elk-556.convex.site"

# Kill existing session
tmux kill-session -t "$SESSION" 2>/dev/null || true

# Create infinite loop script
LOOP_SCRIPT=$(cat <<'SCRIPT'
#!/bin/bash
AGENT_LOWER="__AGENT_LOWER__"
AGENT_UPPER="__AGENT_UPPER__"
EVOX_DIR="__EVOX_DIR__"
EVOX_API="__EVOX_API__"

cd "$EVOX_DIR"

while true; do
  echo "=========================================="
  echo "🚀 Starting $AGENT_UPPER at $(date)"
  echo "=========================================="
  
  # Boot context
  ./scripts/boot.sh "$AGENT_LOWER"
  
  # Build prompt
  PROMPT="You are $AGENT_UPPER. Read docs/CULTURE.md and docs/VISION.md first.

Your job: Work continuously. When you finish a task:
1. Mark it complete
2. Post summary to #dev
3. Get next task from dispatch queue or backlog
4. Never idle.

Check these for work:
- curl -s '$EVOX_API/getNextDispatchForAgent?agent=$AGENT_UPPER' | jq
- curl -s '$EVOX_API/v2/getMessages?agent=$AGENT_UPPER' | jq
- Read CEO-BACKLOG.md and DISPATCH.md

Start now. Find your next task and execute."

  # Run Claude Code
  claude --dangerously-skip-permissions \
    --system-prompt "$(cat .claude-context)" \
    "$PROMPT" || true
  
  echo ""
  echo "⏳ Session ended. Restarting in 10s..."
  sleep 10
done
SCRIPT
)

# Replace placeholders
LOOP_SCRIPT="${LOOP_SCRIPT//__AGENT_LOWER__/$AGENT_LOWER}"
LOOP_SCRIPT="${LOOP_SCRIPT//__AGENT_UPPER__/$AGENT_UPPER}"
LOOP_SCRIPT="${LOOP_SCRIPT//__EVOX_DIR__/$EVOX_DIR}"
LOOP_SCRIPT="${LOOP_SCRIPT//__EVOX_API__/$EVOX_API}"

# Write temp script
TEMP_SCRIPT="/tmp/evox-loop-$AGENT_LOWER.sh"
echo "$LOOP_SCRIPT" > "$TEMP_SCRIPT"
chmod +x "$TEMP_SCRIPT"

# Start tmux session with loop
tmux new-session -d -s "$SESSION" -c "$EVOX_DIR" "$TEMP_SCRIPT"

echo "✅ $AGENT_UPPER running 24/7 in tmux session: $SESSION"
echo "   Attach: tmux attach -t $SESSION"
echo "   Stop:   tmux kill-session -t $SESSION"
