---
description: Generate commit message following this project's convention
---

// turbo-all
1. Get the diff of staged changes: `git diff --cached`
2. Generate a commit message following the format in `rule/COMMIT_TEMPLATE.md`:
   `<type>(<scope>): <subject>` — type must be one of feat/fix/refactor/chore/opt/docs/test,
   scope must match the route touched (interview/exercises/profile/history/...).
   Include `Closes #<issue-number>` if applicable.
3. Execute: `git commit -m "<generated_message>"`