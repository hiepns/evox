Complete a task/ticket with proper documentation. Argument: ticket ID (e.g., AGT-340).

Execute this completion protocol:

1. Verify the work:
   - `git log --oneline -5` -- find the commit(s) for this ticket
   - `git diff --stat` -- check no uncommitted changes remain
   - `npx next build` -- verify build passes

2. Commit if needed:
   - Stage relevant files
   - Commit with message: `closes AGT-XX: description`
   - Push to remote

3. Update Linear:
   - Post comment on the ticket with:
     - Commit hash
     - Files changed
     - Build status
     - Brief summary of what was done
   - Move ticket status to Done

4. Log to Convex:
   - Call taskAssignments.updateStatus with status "done"
   - Post to activity log

5. Update dispatch log:
   - Append completion entry to docs/dispatch-log.md

Report: ticket ID, commit hash, files changed, build status, Linear updated (yes/no).
