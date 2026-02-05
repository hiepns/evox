#!/bin/bash
# agent-supervisor.sh — Bulletproof 24/7 Agent Supervisor
# Usage: ./scripts/agent-supervisor.sh <agent>
#
# This script supervises agent-work-loop.sh and NEVER lets it die.
# If the work loop crashes, it restarts it immediately.
#
# Run this instead of agent-work-loop.sh for true 24/7 operation.

set -u  # No -e, we handle errors ourselves

# ============================================================================
# CONFIGURATION
# ============================================================================

AGENT="${1:-}"
if [ -z "$AGENT" ]; then
  echo "Usage: ./scripts/agent-supervisor.sh <agent>"
  echo "Example: ./scripts/agent-supervisor.sh SAM"
  exit 1
fi

AGENT_LOWER=$(echo "$AGENT" | tr '[:upper:]' '[:lower:]')
AGENT_UPPER=$(echo "$AGENT" | tr '[:lower:]' '[:upper:]')
EVOX_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EVOX_API="https://gregarious-elk-556.convex.site"

LOG_FILE="$EVOX_DIR/logs/supervisor-$AGENT_LOWER.log"
HEALTH_FILE="$EVOX_DIR/logs/supervisor-health-$AGENT_LOWER.json"
PID_FILE="$EVOX_DIR/logs/agent-$AGENT_LOWER.pid"
WORK_LOOP="$EVOX_DIR/scripts/agent-work-loop.sh"

# Timing
RESTART_DELAY=10        # Seconds to wait before restarting crashed loop
MAX_RAPID_RESTARTS=5    # Max restarts within RAPID_WINDOW before backing off
RAPID_WINDOW=300        # 5 minutes
BACKOFF_TIME=300        # 5 minutes backoff after too many rapid restarts

# Tracking
RESTART_COUNT=0
RESTART_TIMES=()
TOTAL_RESTARTS=0
START_TIME=$(date +%s)

# ============================================================================
# SETUP
# ============================================================================

cd "$EVOX_DIR"
mkdir -p "$EVOX_DIR/logs"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUPERVISOR] $1" | tee -a "$LOG_FILE"
}

update_health() {
  local status="$1"
  local restarts="$2"
  local uptime=$(($(date +%s) - START_TIME))
  echo "{\"agent\":\"$AGENT_UPPER\",\"status\":\"$status\",\"restarts\":$restarts,\"uptime\":$uptime,\"timestamp\":$(date +%s),\"pid\":$$}" > "$HEALTH_FILE"
}

post_status() {
  local message="$1"
  curl -s -X POST "$EVOX_API/postToChannel" \
    -H "Content-Type: application/json" \
    -d "{\"channel\": \"dev\", \"from\": \"$AGENT_UPPER\", \"message\": \"[SUPERVISOR] $message\"}" 2>/dev/null || true
}

# ============================================================================
# SIGNAL HANDLING
# ============================================================================

SHUTDOWN=0

cleanup() {
  log "Received shutdown signal"
  SHUTDOWN=1

  # Kill the work loop if running
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      log "Stopping work loop (PID: $pid)..."
      kill -TERM "$pid" 2>/dev/null || true
      sleep 2
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi

  update_health "stopped" "$TOTAL_RESTARTS"
  post_status "🛑 Supervisor stopped. Total restarts: $TOTAL_RESTARTS"
  exit 0
}

trap cleanup SIGTERM SIGINT

# ============================================================================
# RAPID RESTART DETECTION
# ============================================================================

check_rapid_restarts() {
  local now=$(date +%s)
  local cutoff=$((now - RAPID_WINDOW))

  # Filter restart times within window
  local new_times=()
  for t in "${RESTART_TIMES[@]:-}"; do
    if [ "$t" -gt "$cutoff" ]; then
      new_times+=("$t")
    fi
  done
  RESTART_TIMES=("${new_times[@]:-}")

  # Check if too many restarts
  if [ "${#RESTART_TIMES[@]}" -ge "$MAX_RAPID_RESTARTS" ]; then
    return 0  # Too many rapid restarts
  fi
  return 1
}

# ============================================================================
# MAIN SUPERVISOR LOOP
# ============================================================================

log "=========================================="
log "🛡️ $AGENT_UPPER SUPERVISOR STARTING"
log "=========================================="
log "Work loop: $WORK_LOOP"
log "Restart delay: ${RESTART_DELAY}s"
log "Max rapid restarts: $MAX_RAPID_RESTARTS in ${RAPID_WINDOW}s"
log ""

update_health "starting" "0"
post_status "🛡️ Supervisor started. Monitoring $AGENT_UPPER work loop."

while [ "$SHUTDOWN" -eq 0 ]; do
  # Check for rapid restart pattern
  if check_rapid_restarts; then
    log "⚠️ Too many rapid restarts ($MAX_RAPID_RESTARTS in ${RAPID_WINDOW}s). Backing off for ${BACKOFF_TIME}s..."
    post_status "⚠️ Too many crashes. Backing off for 5 min..."
    update_health "backoff" "$TOTAL_RESTARTS"
    sleep "$BACKOFF_TIME"
    RESTART_TIMES=()  # Clear after backoff
    continue
  fi

  log "🚀 Starting work loop..."
  update_health "running" "$TOTAL_RESTARTS"

  # Start work loop in background and capture PID
  "$WORK_LOOP" "$AGENT" &
  LOOP_PID=$!
  echo "$LOOP_PID" > "$PID_FILE"

  log "Work loop started (PID: $LOOP_PID)"

  # Wait for work loop to exit
  wait "$LOOP_PID"
  EXIT_CODE=$?

  rm -f "$PID_FILE"

  # Check if we're shutting down
  if [ "$SHUTDOWN" -eq 1 ]; then
    break
  fi

  # Work loop exited unexpectedly
  TOTAL_RESTARTS=$((TOTAL_RESTARTS + 1))
  RESTART_TIMES+=("$(date +%s)")

  log "⚠️ Work loop exited with code $EXIT_CODE (restart #$TOTAL_RESTARTS)"
  post_status "⚠️ Work loop crashed (code: $EXIT_CODE). Restarting in ${RESTART_DELAY}s... (restart #$TOTAL_RESTARTS)"
  update_health "restarting" "$TOTAL_RESTARTS"

  # Wait before restarting
  sleep "$RESTART_DELAY"
done

log "🛑 Supervisor exiting"
update_health "stopped" "$TOTAL_RESTARTS"
