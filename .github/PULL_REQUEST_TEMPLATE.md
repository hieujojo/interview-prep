<!--
⚠️ Before opening this PR, please confirm:
- Base branch is `release` (NEVER `main`)
- You have read `rule.md` and this PR follows its conventions
-->

## Summary
<!-- What does this PR do? One or two sentences. -->

## Related Issue
<!-- Use "Closes #<issue-number>" so GitHub auto-closes the issue when this PR
     is merged into `release`. Leave blank only if there's no related issue. -->
Closes #

## Type of change
- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `refactor` — Code refactor (no functional change)
- [ ] `chore` — Config, dependencies, docs
- [ ] `opt` — Performance optimization

## Changes made
<!-- Bullet list of the concrete changes in this PR. -->
-
-

## Checklist
- [ ] Base branch is `release` (not `main`)
- [ ] Follows `page.tsx` = imports only; UI in `components/`, logic in `hooks/`
- [ ] New feature calling AI/DB has a matching `app/api/[feature]/route.ts`
- [ ] `README.md` updated if a new feature was added
- [ ] No `localStorage`/`sessionStorage` used for persistent data
- [ ] All Supabase queries check `auth.getUser()` and filter by `user_id`
- [ ] No `react-hooks/exhaustive-deps` disabled without an explanatory comment
- [ ] Tested locally, no console errors

## Screenshots (if UI change)
<!-- Drag & drop images here, if applicable. -->

## Notes for reviewer
<!-- Anything the reviewer should pay special attention to, edge cases, or known limitations. -->