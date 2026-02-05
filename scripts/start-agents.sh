#!/bin/bash
# start-agents.sh - Start all agents WITH identity
# This ensures agents know who they are, the org, and why they work

set -e

EVOX_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$EVOX_DIR"

AGENTS=(max sam leo maya quinn cole)

echo "🚀 EVOX Agent Startup"
echo "===================="

# 1. Boot each agent (generate context files)
echo ""
echo "📖 Loading identity for each agent..."
for agent in "${AGENTS[@]}"; do
  ./scripts/agent-boot.sh "$agent" > /dev/null 2>&1
  echo "   ✅ $agent identity loaded"
done

# 2. Inject identity into running sessions
echo ""
echo "💉 Injecting identity into sessions..."
for agent in "${AGENTS[@]}"; do
  AGENT_UPPER=$(echo "$agent" | tr '[:lower:]' '[:upper:]')
  
  # Create identity injection message
  IDENTITY_MSG="ĐỌC BẮT BUỘC trước khi làm việc:
1. .context/boot-prompt-$agent.md - Danh tính của bạn
2. docs/NORTH-STAR.md - Tổ chức này là gì, tại sao tồn tại
3. docs/ROADMAP-V2.md - Kế hoạch dài hạn, bốc task của bạn

Bạn là $AGENT_UPPER. Đọc xong báo cáo: '$AGENT_UPPER online, đã hiểu identity và mission.'"

  tmux send-keys -t "evox-$agent" "$IDENTITY_MSG" Enter
  echo "   ✅ $agent injected"
done

echo ""
echo "===================="
echo "✅ All agents started with identity!"
echo ""
echo "Agents should now understand:"
echo "- Who they are (identity)"
echo "- What EVOX is (organization)"
echo "- Why they work (mission)"
echo "- What to do (roadmap)"
