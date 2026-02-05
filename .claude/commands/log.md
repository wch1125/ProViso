Update all workflow documentation for this session.

## 1. Session Log

Create a new file in `.claude/logs/` with filename: `{YYYY-MM-DD}-{role}-{brief-description}.md`

Use this structure:
```markdown
# {ROLE} Session Log - {YYYY-MM-DD}

## Objective
{What this session aimed to accomplish}

## Work Completed
{For each task:}
### {Task Name}
- What was done
- Files modified: `path/to/file`
- How it was verified

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| {choice} | {why} |

## Open Questions
- [ ] {Any unresolved questions}

## Handoff Notes
### For Next Session
- Continue with...
- Watch out for...

## Files Changed
```
{git diff --name-status or list of files}
```
```

## 2. Current Status

Update `.claude/status/current-status.md`:
- Set "Last Updated" to today's date
- Update version if changed
- Move completed items to "What's Done"
- Update "What's In Progress"
- Update "Known Issues"
- Update "Next Steps"
- Add entry to "Recent Activity" table

## 3. Changelog

Add entry to `.claude/status/changelog.md` if version changed:
```markdown
## [{version}] - {YYYY-MM-DD}

### Added
- {new features}

### Changed
- {modifications}

### Fixed
- {bug fixes}
```

## Guidelines
- Be concise but thorough
- Use existing files as format reference
- Don't invent work that wasn't done
- Be honest about incomplete items
