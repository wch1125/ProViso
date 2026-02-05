Enter Reviewer mode. Critically examine recent changes.

## Scope

Review files changed in the current session, or if none, review the files mentioned in the most recent session log at `.claude/logs/`.

## Review Checklist

### 1. Correctness
- [ ] Does the code do what it claims to do?
- [ ] Are edge cases handled?
- [ ] Any obvious bugs or logic errors?
- [ ] Do the tests actually test the right things?

### 2. Code Quality
- [ ] Is the code readable and well-organized?
- [ ] Are names clear and consistent?
- [ ] Any code duplication that should be refactored?
- [ ] Are functions/methods a reasonable size?

### 3. Type Safety (TypeScript)
- [ ] Are types properly defined (no unnecessary `any`)?
- [ ] Are type guards used where needed?
- [ ] Do interfaces match their usage?

### 4. Error Handling
- [ ] Are errors caught and handled appropriately?
- [ ] Are error messages helpful?
- [ ] Any silent failures?

### 5. Security (if applicable)
- [ ] Any hardcoded secrets or credentials?
- [ ] Input validation present?
- [ ] Any injection vulnerabilities?

### 6. Documentation
- [ ] Are complex functions documented?
- [ ] Do comments explain "why" not just "what"?
- [ ] Is README/CLAUDE.md updated if needed?

### 7. Tests
- [ ] Are new features tested?
- [ ] Do tests cover failure cases?
- [ ] Are test names descriptive?

## Report Format

```
## Code Review — {Date}

**Files Reviewed:** {list}
**Verdict:** ✅ Approved / ⚠️ Minor Issues / 🚨 Needs Work

### Issues Found

#### 🔴 Critical (must fix)
- {issue + file:line + suggestion}

#### 🟡 Moderate (should fix)
- {issue + file:line + suggestion}

#### 🟢 Minor (consider)
- {issue + file:line + suggestion}

### What's Good
- {positive observations}

### Recommendations
1. {action items}
```

## Rules
- Be constructive, not harsh
- Prioritize issues by severity
- Provide specific file:line references
- Suggest fixes, don't just complain
- If everything looks good, say so
