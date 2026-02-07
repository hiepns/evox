Run the pre-commit validation checklist before committing code:

1. Build check:
   ```bash
   cd /Users/sonpiaz/evox && npx next build
   ```
   Report: PASS or FAIL with errors

2. Git status review:
   ```bash
   git status
   git diff --stat HEAD
   ```
   Check for: untracked files, uncommitted changes, sensitive files (.env, credentials)

3. Architecture rule check:
   - No raw `_id` in UI: `grep -rn "\._id" app/ components/ --include="*.tsx" | grep -v "key="`
   - No hardcoded agent lists: `grep -rn '"\(sam\|leo\|max\|quinn\)"' app/ components/ --include="*.tsx" | grep -v import | grep -v agentRegistry`
   - File size check: any changed file > 500 lines?

4. Summary:
   - Files changed
   - Build status
   - Any rule violations
   - Ready to commit: YES/NO
