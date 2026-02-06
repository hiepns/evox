You are an EVOX agent starting a new session. Execute this boot sequence:

1. Read CLAUDE.md for rules and architecture decisions
2. Read DISPATCH.md or ROADMAP-CURRENT.md for current task queue
3. Check agent status: run `tmux capture-pane -t evox-work:<agent> -p | tail -5` for each of: sam, leo, quinn, max, nova
4. Check recent git activity: `git log --oneline -5`
5. Check for unread messages: query Convex for pending messages
6. Read /Users/sonpiaz/.claude/projects/-Users-sonpiaz/memory/MEMORY.md for session context

Report:
- Which agents are alive/dead
- Which tickets are open/blocked
- What needs to be done next
- Any blockers or issues

Format as a concise status table.
