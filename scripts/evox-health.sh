#!/bin/bash
# evox-health.sh — Quick health check for all EVOX agents
# Usage: ./scripts/evox-health.sh
# Run at session start or anytime to get full status overview

SESSION="${EVOX_SESSION:-evox-work}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Colors
G='\033[0;32m'  # Green
Y='\033[1;33m'  # Yellow
R='\033[0;31m'  # Red
C='\033[0;36m'  # Cyan
B='\033[1m'     # Bold
N='\033[0m'     # Reset

echo ""
echo -e "${B}══════════════════════════════════════════════${N}"
echo -e "${B}  EVOX Health Check — $(date '+%Y-%m-%d %H:%M')${N}"
echo -e "${B}══════════════════════════════════════════════${N}"
echo ""

# ── 1. TMUX SESSION ──────────────────────────────────
if ! tmux has-session -t "$SESSION" 2>/dev/null; then
  echo -e "${R}  TMUX session '$SESSION' not found!${N}"
  echo "  Run: ./scripts/start-all-agents.sh"
  exit 1
fi

WINDOWS=$(tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null)

echo -e "${C}  Agents${N}"
echo "  ─────────────────────────────────────────"

detect_status() {
  local pane_output="$1"
  # Check for active thinking indicators
  if echo "$pane_output" | grep -qE '(Thinking|thinking|Elucidating|Cogitat|Baked|Brewed|Sautéed|Working|Pondering|Reflecting|Ruminating|Musing|Contemplat)'; then
    echo "ACTIVE"
  # Check for tool execution
  elif echo "$pane_output" | grep -qE '(⏺ (Bash|Read|Write|Edit|Glob|Grep)|esc to interrupt)'; then
    echo "WORKING"
  # Check if at empty prompt (idle)
  elif echo "$pane_output" | grep -qE '^❯ *$'; then
    echo "IDLE"
  # Check if at prompt with text (has pending input)
  elif echo "$pane_output" | grep -qE '^❯ .+'; then
    echo "PENDING"
  # Check for context limit
  elif echo "$pane_output" | grep -qiE 'context limit|/compact|/clear'; then
    echo "CRASHED"
  else
    echo "UNKNOWN"
  fi
}

status_icon() {
  case "$1" in
    ACTIVE)  echo -e "${G}●${N} Active " ;;
    WORKING) echo -e "${G}◉${N} Working" ;;
    IDLE)    echo -e "${Y}○${N} Idle   " ;;
    PENDING) echo -e "${Y}◑${N} Pending" ;;
    CRASHED) echo -e "${R}✗${N} Crashed" ;;
    *)       echo -e "${R}?${N} Unknown" ;;
  esac
}

AGENT_COUNT=0
ACTIVE_COUNT=0
PROBLEM_COUNT=0

for WIN in $WINDOWS; do
  AGENT_COUNT=$((AGENT_COUNT + 1))
  PANE=$(tmux capture-pane -t "$SESSION:$WIN" -p 2>/dev/null | tail -15)
  STATUS=$(detect_status "$PANE")

  # Get last meaningful line (skip empty lines and status bars)
  LAST_LINE=$(echo "$PANE" | grep -E '^(❯|⏺|✻|✳|✢)' | tail -1 | cut -c1-60)

  ICON=$(status_icon "$STATUS")
  printf "  %-6s %s  %s\n" "$(echo "$WIN" | tr '[:lower:]' '[:upper:]')" "$ICON" "$LAST_LINE"

  case "$STATUS" in
    ACTIVE|WORKING) ACTIVE_COUNT=$((ACTIVE_COUNT + 1)) ;;
    CRASHED)        PROBLEM_COUNT=$((PROBLEM_COUNT + 1)) ;;
  esac
done

echo ""

# ── 2. GIT STATUS ────────────────────────────────────
echo -e "${C}  Git${N}"
echo "  ─────────────────────────────────────────"

BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
CHANGES=$(git -C "$PROJECT_DIR" status --porcelain 2>/dev/null | wc -l | xargs)
STAGED=$(git -C "$PROJECT_DIR" diff --cached --stat 2>/dev/null | tail -1)
UNSTAGED=$(git -C "$PROJECT_DIR" diff --stat 2>/dev/null | tail -1)
LAST_COMMIT=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null || echo "none")

echo "  Branch: $BRANCH"
echo "  Last commit: $LAST_COMMIT"
if [ "$CHANGES" -gt 0 ]; then
  echo -e "  Changes: ${Y}${CHANGES} files modified${N}"
  [ -n "$STAGED" ] && echo "  Staged: $STAGED"
  [ -n "$UNSTAGED" ] && echo "  Unstaged: $UNSTAGED"
else
  echo -e "  Changes: ${G}clean${N}"
fi

echo ""

# ── 3. CLAUDE PROCESSES ──────────────────────────────
echo -e "${C}  Processes${N}"
echo "  ─────────────────────────────────────────"

CLAUDE_PROCS=$(ps aux | grep -c '[c]laude --dangerously-skip-permissions' 2>/dev/null || echo "0")
CLAUDE_NORMAL=$(ps aux | grep '[c]laude' | grep -v 'dangerously' | grep -v 'Claude.app' | grep -v grep | wc -l | xargs)

echo "  Agent processes (skip-perms): $CLAUDE_PROCS"
echo "  Interactive processes: $CLAUDE_NORMAL"

if [ "$CLAUDE_PROCS" -ne "$AGENT_COUNT" ]; then
  echo -e "  ${Y}Warning: $CLAUDE_PROCS processes vs $AGENT_COUNT tmux windows${N}"
fi

echo ""

# ── 4. SUMMARY ───────────────────────────────────────
echo -e "${B}══════════════════════════════════════════════${N}"
if [ "$PROBLEM_COUNT" -gt 0 ]; then
  echo -e "  ${R}$PROBLEM_COUNT agent(s) need attention${N}"
elif [ "$ACTIVE_COUNT" -gt 0 ]; then
  echo -e "  ${G}$ACTIVE_COUNT/$AGENT_COUNT agents active${N} — system healthy"
else
  echo -e "  ${Y}All agents idle${N} — ready for dispatch"
fi
echo -e "${B}══════════════════════════════════════════════${N}"
echo ""
