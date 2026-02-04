#!/bin/bash
# AGT-251: Install Launchd daemon for 100x autonomous agents
# Auto-starts agents on system boot

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_SOURCE="$PROJECT_DIR/scripts/launchd/com.evox.agents.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.evox.agents.plist"
LOGS_DIR="$PROJECT_DIR/logs"

echo "╔════════════════════════════════════════════════╗"
echo "║  EVOX Launchd Installer                       ║"
echo "║  Auto-start agents on system boot             ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Create logs directory
echo "Creating logs directory..."
mkdir -p "$LOGS_DIR"

# Unload existing daemon if running
if launchctl list | grep -q "com.evox.agents"; then
  echo "Unloading existing daemon..."
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi

# Copy plist to LaunchAgents
echo "Installing daemon..."
cp "$PLIST_SOURCE" "$PLIST_DEST"

# Load daemon
echo "Loading daemon..."
launchctl load "$PLIST_DEST"

echo ""
echo "✅ Launchd daemon installed successfully"
echo ""
echo "Agents will now auto-start on system boot and restart on crash."
echo ""
echo "Commands:"
echo "  Stop:    launchctl unload $PLIST_DEST"
echo "  Start:   launchctl load $PLIST_DEST"
echo "  Status:  launchctl list | grep evox"
echo "  Logs:    tail -f $LOGS_DIR/agents-stdout.log"
echo ""
