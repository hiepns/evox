#!/bin/bash
# AGT-249: Test Parallel Execution System
# Usage: ./scripts/test-parallel.sh

set -e

echo "🚀 AGT-249: Testing Parallel Execution System"
echo ""

# Test 1: Create a simple parallel plan
echo "📝 Test 1: Creating parallel plan..."
PLAN_RESULT=$(npx convex run parallelExecution:createParallelPlan '{
  "parentAgent": "sam",
  "taskId": "AGT-249",
  "description": "Test parallel execution with 3 workers",
  "strategy": "by_files",
  "subTasks": [
    {
      "id": "worker-1",
      "description": "Process file 1",
      "command": "process",
      "payload": "{\"file\": \"test1.ts\"}"
    },
    {
      "id": "worker-2",
      "description": "Process file 2",
      "command": "process",
      "payload": "{\"file\": \"test2.ts\"}"
    },
    {
      "id": "worker-3",
      "description": "Process file 3",
      "command": "process",
      "payload": "{\"file\": \"test3.ts\"}"
    }
  ],
  "maxParallel": 2
}')

echo "✅ Plan created: $PLAN_RESULT"
echo ""

# Extract plan ID (assuming JSON response)
PLAN_ID=$(echo "$PLAN_RESULT" | grep -o '"planId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PLAN_ID" ]; then
  echo "❌ Failed to extract plan ID"
  exit 1
fi

echo "Plan ID: $PLAN_ID"
echo ""

# Test 2: Start execution
echo "▶️  Test 2: Starting execution..."
npx convex run parallelExecution:startExecution "{\"planId\": \"$PLAN_ID\"}"
echo ""

# Test 3: Check status
echo "📊 Test 3: Checking plan status..."
npx convex run parallelExecution:getPlanStatus "{\"planId\": \"$PLAN_ID\"}"
echo ""

# Test 4: List all plans for Sam
echo "📋 Test 4: Listing all plans for Sam..."
npx convex run parallelExecution:listPlans '{"agentName": "sam"}'
echo ""

echo "✅ All tests completed!"
echo ""
echo "📌 Next steps:"
echo "   1. Workers are now spawned (status: running)"
echo "   2. In production, workers would be actual agent sessions"
echo "   3. Workers report completion via reportWorkerComplete"
echo "   4. Plan finalizes when all workers complete"
echo ""
echo "🔍 Monitor progress with:"
echo "   npx convex run parallelExecution:getPlanStatus '{\"planId\": \"$PLAN_ID\"}'"
