Pre-release checklist. Verify everything is ready to ship.

## Automated Checks

Run these and report results:

```bash
# Tests
npm test

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build (if applicable)
npm run build
```

## Manual Verification Checklist

### Code Quality
- [ ] All tests passing
- [ ] No lint errors
- [ ] No type errors
- [ ] Build succeeds (if applicable)

### Documentation
- [ ] README.md is current
- [ ] CLAUDE.md reflects current version
- [ ] Changelog has entry for this version
- [ ] New features are documented with examples

### Version & Status
- [ ] Version number bumped appropriately in package.json
- [ ] `current-status.md` is up to date
- [ ] No "in progress" items that should block release

### Examples & Tests
- [ ] Example files work correctly
- [ ] New features have tests
- [ ] Edge cases covered

### Cleanup
- [ ] No console.log debugging statements left
- [ ] No commented-out code that should be removed
- [ ] No TODO comments that should be addressed

## Report Format

```
## Ship Check — v{version}

### Automated Checks
| Check | Status |
|-------|--------|
| Tests | ✅/❌ {details} |
| Lint | ✅/❌ |
| Types | ✅/❌ |
| Build | ✅/❌ |

### Documentation
| Item | Status |
|------|--------|
| README | ✅/❌ |
| CLAUDE.md | ✅/❌ |
| Changelog | ✅/❌ |
| Examples | ✅/❌ |

### Blockers
{List any issues that must be fixed before shipping, or "None"}

### Verdict
🚀 **Ready to ship**
— or —
🛑 **Not ready** — {reasons}
```

## Rules
- Be thorough — this is the last check
- Don't rubber-stamp, actually verify
- List specific blockers, not vague concerns
- If not ready, prioritize what must be fixed
