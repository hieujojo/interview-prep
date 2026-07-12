---
description: Generate commit message following this project's convention
---

// turbo-all
1. Get the diff of staged changes: `git diff --cached`
2. Read `rule/COMMIT_TEMPLATE.md` fully — follow its Format, Allowed types,
   Scope, and Examples sections exactly.
3. Based on the actual diff, write a commit message with a real type, real
   scope, and a real imperative subject describing what changed.
   Do NOT output the literal placeholder text — always substitute concrete
   values derived from the diff.
   Include `Closes #<issue-number>` if applicable.
4. Execute: `git commit -m "<generated_message>"`