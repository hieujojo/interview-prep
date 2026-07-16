
# 📝 Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/),
aligned with the branch types defined in [`rule.md`](./rule.md) section 4.

## Format

```
<type>(<scope>): <short subject, imperative, lowercase, no period>

[optional body — explain WHAT and WHY, not HOW]

[optional footer — issue reference]
```

## Allowed types

Must match one of the 7 fixed branches in `rule.md`:

| Type | Use for | Matching branch |
|------|---------|------------------|
| `feat` | New feature | `feat/hieu`  |
| `fix` | Bug fix | `fix/hieu` |
| `refactor` | Code refactor, no functional change | `refactor/hieu` |
| `chore` | Config, dependencies, code formatting | `chore/hieu` |
| `opt` | Performance optimization | `opt/hieu` |
| `docs` | README, rule.md, comments | `docs/hieu` |
| `test` | Adding or fixing test cases | `test/hieu` |

## Scope

Scope should match the route/feature area being touched, based on this
project's page structure:

`interview` · `exercises` · `profile` · `jd-analyzer` · `documents` ·
`achievements` · `history` · `notes` · `cv-analysis` · `email` · `auth` ·
`dashboard`

Use `shared` for changes that cut across multiple routes (e.g. a shared
component, the `useAIProviderStore`, or the Supabase client itself).

Scope is optional when the change doesn't belong to one specific area
(e.g. a repo-wide `chore` like updating `.gitignore`).

## Closing an issue

If this commit resolves a GitHub issue, **always** add `Closes #<issue-number>`
on its own line in the footer. GitHub will auto-close the issue once this
commit is merged into `release`.

```
fix(notes): correct notes not syncing after session ends

The `inProgressNotes` state was reset before the save effect ran,
causing notes to be lost on submit.

Closes #32
```

## Body — required for `feat` and `fix`

For `feat` and `fix` commits, the body should briefly list the main files
touched and explain *why* the change was made — not just repeat the diff.
Optional for other types.

## Examples

```
feat(history): add per-topic score trend chart

- Added useTopicScoreTrend.ts to compute per-category score series
- Added TopicTrendChart.tsx to render the chart with a topic filter

Closes #55
```

```
fix(interview): prevent double session save on finish screen

- Guarded saveSession() in useInterviewSession.ts with hasSavedRef
  to stop duplicate inserts when isFinished flips twice in dev mode

Closes #40
```

```
refactor(history): extract useTopicScoreTrend hook from HistoryView
```

```
chore: add issue templates and PR template
```

```
opt(interview): memoize question pool filtering in useInterviewSession
```

```
docs: update README with CV recommendations feature
```

```
test(exercises): add unit tests for pickQuestionsByDifficulty
```

## Rules

1. Subject line: lowercase after the colon, imperative mood ("add", not "added"
   or "adds"), no trailing period, ideally under 72 characters.
2. One logical change per commit — don't mix `feat` and `fix` in the same commit.
3. `feat`/`fix` commits must include a body listing the main files changed and why.
4. `Closes #<issue-number>` must be on its own line, exactly as written
   (GitHub only recognizes specific keywords: `close`, `closes`, `closed`,
   `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`).
5. Never write commit messages only in Vietnamese if the project intends to
   go open-source — keep at least the `type(scope): subject` line in English
   so external contributors and GitHub's UI stay consistent.