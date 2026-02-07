Run a comprehensive EVOX system health check.

1. Agent status (tmux):
   ```bash
   for agent in sam leo quinn max nova; do
     echo "=== $agent ==="
     tmux capture-pane -t evox-work:$agent -p 2>/dev/null | tail -3 || echo "DEAD"
   done
   ```

2. Git status:
   - Current branch
   - Last commit
   - Uncommitted changes
   - Unpushed commits

3. Deployment status:
   - Check https://evox-ten.vercel.app with a quick fetch
   - Report: UP or DOWN

4. Build health:
   - Any known build errors from recent activity

5. Active tickets:
   - List tickets that are In Progress or In Review

Format as a dashboard table:
| Component | Status | Details |
|-----------|--------|---------|
| SAM | Alive/Dead | last activity |
| ... | ... | ... |
| Git | Clean/Dirty | branch + last commit |
| Deploy | Up/Down | URL |
| Build | Pass/Fail | last known |
