Quickly load project context. Lightweight version of /scout.

## Read These Files

1. `.claude/status/current-status.md`
2. `CLAUDE.md` (if exists)
3. Most recent file in `.claude/logs/`

## Output

Provide a brief summary (keep it short):

```
## Context Loaded

**Project:** {name}
**Version:** {version}
**Phase:** {current phase/status}

**Recent Work:**
{1-2 sentences about last session}

**Current Focus:**
- {What's in progress}

**Next Up:**
- {What's next in the queue}

Ready for instructions.
```

## Rules
- Be brief — this is just orientation
- Don't run tests or do investigation
- Don't make changes
- Just load context and await instructions
