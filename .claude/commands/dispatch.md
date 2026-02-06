Dispatch a task to an EVOX agent. Usage: /dispatch [agent] [task description]

Parse the argument to extract: target agent name and task description.

Execute dispatch protocol:

1. Verify target agent is alive:
   ```bash
   tmux capture-pane -t evox-work:<agent> -p | tail -3
   ```
   If dead: report and suggest restart.

2. Choose dispatch method:
   - **tmux send-keys** (preferred for immediate tasks):
     ```bash
     tmux send-keys -t evox-work:<agent> "<task prompt>" Enter
     ```
   - **Convex API** (for tracked/async tasks):
     Post to /v2/sendMessage via Python urllib

3. Log the dispatch (MANDATORY):
   - Append to docs/dispatch-log.md:
     ```
     | YYYY-MM-DD HH:MM | <agent> | <ticket-or-task> | <summary> | dispatched |
     ```
   - Call taskAssignments.assign() in Convex if applicable

4. Confirm:
   - Agent: <name>
   - Method: tmux/convex
   - Task: <description>
   - Logged: yes/no

If no agent specified, suggest the best agent based on task type:
- Backend/Convex/API -> SAM
- Frontend/UI/Components -> LEO
- Testing/QA/Review -> QUINN
- Planning/Tickets/Coordination -> MAX
- Security/Audit -> NOVA
