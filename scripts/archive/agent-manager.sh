#!/bin/bash
# agent-manager.sh — Multi-Agent Orchestration Tool
# Usage: ./scripts/agent-manager.sh <command> [agents...]
#
# Commands:
#   start [agent|all]  - Start agent(s) via supervisor
#   stop [agent|all]   - Stop agent(s) gracefully
#   status [agent|all] - Show agent(s) status
#   health             - Check health via API
#   restart [agent]    - Restart specific agent
#   logs [agent]       - Tail agent logs
#
# Examples:
#   ./scripts/agent-manager.sh start SAM
#   ./scripts/agent-manager.sh start all
#   ./scripts/agent-manager.sh status
#   ./scripts/agent-manager.sh health
#   ./scripts/agent-manager.sh logs SAM

set -euo pipefail

EVOX_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EVOX_API="https://gregarious-elk-556.convex.site"

# Default agents to manage
DEFAULT_AGENTS=("SAM" "LEO" "MAX" "QUINN")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  EVOX Agent Manager${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
  echo ""
}

print_usage() {
  echo "Usage: $0 <command> [agents...]"
  echo ""
  echo "Commands:"
  echo "  start [agent|all]  - Start agent(s) via supervisor"
  echo "  stop [agent|all]   - Stop agent(s) gracefully"
  echo "  status [agent|all] - Show agent(s) status"
  echo "  health             - Check health via API"
  echo "  restart [agent]    - Restart specific agent"
  echo "  logs [agent]       - Tail agent logs"
  echo ""
  echo "Examples:"
  echo "  $0 start SAM"
  echo "  $0 start all"
  echo "  $0 status"
  echo "  $0 health"
  echo "  $0 logs SAM"
}

get_agents() {
  local input="${1:-all}"
  if [ "$input" = "all" ]; then
    echo "${DEFAULT_AGENTS[@]}"
  else
    echo "$input"
  fi
}

agent_to_lower() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

agent_to_upper() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

# ============================================================================
# AGENT CONTROL FUNCTIONS
# ============================================================================

start_agent() {
  local agent=$(agent_to_upper "$1")
  local agent_lower=$(agent_to_lower "$1")
  local pid_file="$EVOX_DIR/logs/agent-$agent_lower.pid"
  local supervisor_pid_file="$EVOX_DIR/logs/supervisor-$agent_lower.pid"

  # Check if already running
  if [ -f "$supervisor_pid_file" ]; then
    local pid=$(cat "$supervisor_pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      echo -e "${YELLOW}⚠ $agent already running (supervisor PID: $pid)${NC}"
      return 0
    fi
  fi

  echo -e "${BLUE}🚀 Starting $agent...${NC}"

  # Create log directory
  mkdir -p "$EVOX_DIR/logs"

  # Start supervisor in background
  nohup "$EVOX_DIR/scripts/agent-supervisor.sh" "$agent" \
    > "$EVOX_DIR/logs/supervisor-$agent_lower.log" 2>&1 &

  local new_pid=$!
  echo "$new_pid" > "$supervisor_pid_file"

  sleep 2

  if kill -0 "$new_pid" 2>/dev/null; then
    echo -e "${GREEN}✓ $agent started (supervisor PID: $new_pid)${NC}"
  else
    echo -e "${RED}✗ Failed to start $agent${NC}"
    return 1
  fi
}

stop_agent() {
  local agent=$(agent_to_upper "$1")
  local agent_lower=$(agent_to_lower "$1")
  local supervisor_pid_file="$EVOX_DIR/logs/supervisor-$agent_lower.pid"
  local work_pid_file="$EVOX_DIR/logs/agent-$agent_lower.pid"

  echo -e "${BLUE}🛑 Stopping $agent...${NC}"

  # Stop supervisor first
  if [ -f "$supervisor_pid_file" ]; then
    local pid=$(cat "$supervisor_pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
      sleep 2
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$supervisor_pid_file"
  fi

  # Stop work loop if still running
  if [ -f "$work_pid_file" ]; then
    local pid=$(cat "$work_pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
      sleep 2
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$work_pid_file"
  fi

  # Kill tmux session
  tmux kill-session -t "evox-$agent_lower" 2>/dev/null || true

  echo -e "${GREEN}✓ $agent stopped${NC}"
}

restart_agent() {
  local agent=$(agent_to_upper "$1")
  echo -e "${BLUE}🔄 Restarting $agent...${NC}"
  stop_agent "$agent"
  sleep 2
  start_agent "$agent"
}

status_agent() {
  local agent=$(agent_to_upper "$1")
  local agent_lower=$(agent_to_lower "$1")
  local supervisor_pid_file="$EVOX_DIR/logs/supervisor-$agent_lower.pid"
  local work_pid_file="$EVOX_DIR/logs/agent-$agent_lower.pid"
  local health_file="$EVOX_DIR/logs/health-$agent_lower.json"

  local supervisor_status="${RED}○ Stopped${NC}"
  local work_status="${RED}○ Stopped${NC}"
  local tmux_status="${RED}○ No session${NC}"
  local health_info=""

  # Check supervisor
  if [ -f "$supervisor_pid_file" ]; then
    local pid=$(cat "$supervisor_pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      supervisor_status="${GREEN}● Running (PID: $pid)${NC}"
    fi
  fi

  # Check work loop
  if [ -f "$work_pid_file" ]; then
    local pid=$(cat "$work_pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      work_status="${GREEN}● Running (PID: $pid)${NC}"
    fi
  fi

  # Check tmux session
  if tmux has-session -t "evox-$agent_lower" 2>/dev/null; then
    tmux_status="${GREEN}● Active${NC}"
  fi

  # Check health file
  if [ -f "$health_file" ]; then
    local status=$(python3 -c "import json; d=json.load(open('$health_file')); print(d.get('status','?'))" 2>/dev/null || echo "?")
    local cycle=$(python3 -c "import json; d=json.load(open('$health_file')); print(d.get('cycle',0))" 2>/dev/null || echo "0")
    local uptime=$(python3 -c "import json; d=json.load(open('$health_file')); print(d.get('uptime_seconds',0))" 2>/dev/null || echo "0")
    health_info="Status: $status, Cycle: $cycle, Uptime: ${uptime}s"
  fi

  echo -e "${BLUE}$agent:${NC}"
  echo -e "  Supervisor: $supervisor_status"
  echo -e "  Work Loop:  $work_status"
  echo -e "  Tmux:       $tmux_status"
  if [ -n "$health_info" ]; then
    echo -e "  Health:     $health_info"
  fi
}

show_logs() {
  local agent=$(agent_to_upper "$1")
  local agent_lower=$(agent_to_lower "$1")
  local log_file="$EVOX_DIR/logs/agent-$agent_lower.log"
  local supervisor_log="$EVOX_DIR/logs/supervisor-$agent_lower.log"

  if [ -f "$log_file" ]; then
    echo -e "${BLUE}=== Work Loop Logs (last 50 lines) ===${NC}"
    tail -50 "$log_file"
  else
    echo -e "${YELLOW}No work loop log found${NC}"
  fi

  if [ -f "$supervisor_log" ]; then
    echo ""
    echo -e "${BLUE}=== Supervisor Logs (last 20 lines) ===${NC}"
    tail -20 "$supervisor_log"
  fi
}

check_health_api() {
  echo -e "${BLUE}Fetching health from API...${NC}"
  echo ""

  local response=$(curl -s "$EVOX_API/agentHealth")

  if [ -z "$response" ]; then
    echo -e "${RED}Failed to fetch health data${NC}"
    return 1
  fi

  # Parse and display
  echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)

print('Summary:')
summary = data.get('summary', {})
print(f\"  Total: {summary.get('total', 0)} | Healthy: {summary.get('healthy', 0)} | Unhealthy: {summary.get('unhealthy', 0)} | Avg Score: {summary.get('avgHealthScore', 0)}%\")
print('')

print('Agents:')
for agent in data.get('agents', []):
    name = agent['agent']['name']
    score = agent['health']['score']
    status = agent['status']['computed']
    completed = agent['metrics']['last24h']['completed']

    # Color code based on health
    if score >= 70:
        color = '\033[0;32m'  # Green
    elif score >= 40:
        color = '\033[1;33m'  # Yellow
    else:
        color = '\033[0;31m'  # Red

    print(f\"  {color}{name:<8}\033[0m Score: {score:3}% | Status: {status:<7} | 24h: {completed} tasks\")

    issues = agent['health'].get('issues', [])
    for issue in issues:
        print(f\"           ⚠ {issue}\")
"
}

# ============================================================================
# MAIN
# ============================================================================

print_header

COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  start)
    agents=$(get_agents "${1:-all}")
    for agent in $agents; do
      start_agent "$agent"
    done
    ;;

  stop)
    agents=$(get_agents "${1:-all}")
    for agent in $agents; do
      stop_agent "$agent"
    done
    ;;

  restart)
    if [ -z "${1:-}" ]; then
      echo -e "${RED}Error: Agent name required for restart${NC}"
      exit 1
    fi
    restart_agent "$1"
    ;;

  status)
    agents=$(get_agents "${1:-all}")
    for agent in $agents; do
      status_agent "$agent"
      echo ""
    done
    ;;

  health)
    check_health_api
    ;;

  logs)
    if [ -z "${1:-}" ]; then
      echo -e "${RED}Error: Agent name required for logs${NC}"
      exit 1
    fi
    show_logs "$1"
    ;;

  help|--help|-h)
    print_usage
    ;;

  *)
    echo -e "${RED}Unknown command: $COMMAND${NC}"
    print_usage
    exit 1
    ;;
esac

echo ""
