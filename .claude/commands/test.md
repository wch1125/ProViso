Run the test suite and report results clearly.

## Steps

### 1. Identify Test Runner
Check `package.json` for test script, or look for:
- `vitest` / `jest` / `mocha` (JavaScript/TypeScript)
- `pytest` (Python)
- `cargo test` (Rust)
- `go test` (Go)

### 2. Run Full Test Suite
```bash
npm test
```
(or equivalent for the project)

### 3. Run Linter
```bash
npm run lint
```
(or equivalent)

### 4. Run Type Check (if TypeScript)
```bash
npx tsc --noEmit
```

### 5. Report Results

```
## Test Report — {Date}

### Summary
| Check | Status | Details |
|-------|--------|---------|
| Tests | ✅/❌ | {X passed, Y failed} |
| Lint | ✅/❌ | {clean / N errors} |
| Types | ✅/❌ | {clean / N errors} |

### Test Results
**{X} tests passing** ({duration})

{If any failures:}
### ❌ Failing Tests
1. `{test name}`
   - File: `{file path}`
   - Error: {error message}
   - Likely cause: {brief analysis}

### Lint Issues
{List any lint errors/warnings, or "Clean"}

### Type Errors  
{List any type errors, or "Clean"}

### Recommendations
{What to fix, in priority order}
```

## If Tests Fail

1. Report the failures clearly
2. Analyze the likely cause
3. Do NOT automatically fix them — wait for instruction
4. Suggest which failures are most critical

## If All Pass

Keep it short:
```
## Test Report — {Date}

✅ **All checks passing**
- Tests: {N} passed ({duration})
- Lint: Clean
- Types: Clean
```
