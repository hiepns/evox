#!/bin/bash
# install-agent-service.sh — Install agent as macOS launchd service
# Usage: ./scripts/install-agent-service.sh <agent>
#
# This installs the agent supervisor as a launchd service that:
# - Starts automatically on boot
# - Restarts if it crashes
# - Runs 24/7 in background

set -euo pipefail

AGENT="${1:-}"
if [ -z "$AGENT" ]; then
  echo "Usage: ./scripts/install-agent-service.sh <agent>"
  echo "Example: ./scripts/install-agent-service.sh SAM"
  exit 1
fi

AGENT_LOWER=$(echo "$AGENT" | tr '[:upper:]' '[:lower:]')
EVOX_DIR="$(cd "$(dirname "$0")/.." && pwd)"

PLIST_SRC="$EVOX_DIR/scripts/launchd/com.evox.agent.$AGENT_LOWER.plist"
PLIST_DST="$HOME/Library/LaunchAgents/com.evox.agent.$AGENT_LOWER.plist"

echo "🔧 Installing $AGENT agent service..."

# Check if plist template exists
if [ ! -f "$PLIST_SRC" ]; then
  echo "Creating plist from template..."
  mkdir -p "$EVOX_DIR/scripts/launchd"

  cat > "$PLIST_SRC" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.evox.agent.$AGENT_LOWER</string>
    <key>ProgramArguments</key>
    <array>
        <string>$EVOX_DIR/scripts/agent-supervisor.sh</string>
        <string>$AGENT</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$EVOX_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$EVOX_DIR/logs/launchd-$AGENT_LOWER.log</string>
    <key>StandardErrorPath</key>
    <string>$EVOX_DIR/logs/launchd-$AGENT_LOWER-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
        <key>HOME</key>
        <string>$HOME</string>
    </dict>
    <key>ThrottleInterval</key>
    <integer>30</integer>
</dict>
</plist>
EOF
fi

# Unload if already loaded
if launchctl list | grep -q "com.evox.agent.$AGENT_LOWER"; then
  echo "Stopping existing service..."
  launchctl unload "$PLIST_DST" 2>/dev/null || true
fi

# Copy plist to LaunchAgents
mkdir -p "$HOME/Library/LaunchAgents"
cp "$PLIST_SRC" "$PLIST_DST"

# Load the service
echo "Loading service..."
launchctl load "$PLIST_DST"

echo ""
echo "✅ Service installed successfully!"
echo ""
echo "Commands:"
echo "  Start:   launchctl start com.evox.agent.$AGENT_LOWER"
echo "  Stop:    launchctl stop com.evox.agent.$AGENT_LOWER"
echo "  Status:  launchctl list | grep evox"
echo "  Logs:    tail -f $EVOX_DIR/logs/launchd-$AGENT_LOWER.log"
echo "  Remove:  launchctl unload $PLIST_DST && rm $PLIST_DST"
echo ""
echo "The agent will now start automatically on boot!"
