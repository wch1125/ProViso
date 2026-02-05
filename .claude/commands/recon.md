Enter recon mode. Reconnaissance only — do NOT make any changes.

## Your Mission

Understand the current state of this project and report back clearly.

## Read These Files (in order)

1. `.claude/status/current-status.md` — Where things stand
2. `.claude/status/changelog.md` — Recent history (last 2-3 versions)
3. `CLAUDE.md` or `README.md` — Project overview
4. `.claude/logs/` — Check the most recent 1-2 session logs
5. `package.json` — Dependencies and scripts (if exists)

## Then Investigate

1. **Project Health**
   - Run `npm test` (or equivalent) — do tests pass?
   - Run `npm run lint` (or equivalent) — any lint errors?
   - Any TypeScript/build errors?

2. **Codebase Structure**
   - What are the main source files?
   - Approximate lines of code in key files
   - Test coverage (number of tests)

3. **Open Items**
   - What's marked as "in progress"?
   - What's in "known issues"?
   - Any blockers noted?

## Report Format

Provide a concise report:

```
## Recon Report — {Project Name}

**Version:** {current version}
**Health:** 🟢 Good / 🟡 Minor Issues / 🔴 Problems

### Summary
{2-3 sentence overview}

### Test Status
{X tests passing/failing}

### Current State
- In Progress: {items}
- Blocked: {items or "None"}
- Known Issues: {count}

### Key Files
| File | Lines | Purpose |
|------|-------|---------|
| ... | ... | ... |

### Recommendations
1. {What to do next}
2. {Any concerns}
```

## Rules
- Do NOT modify any files
- Do NOT start implementing anything
- Just observe and report
- Be honest about problems
