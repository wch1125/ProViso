Create an implementation plan before building. Do NOT start coding yet.

## Context Gathering

1. Read the relevant instruction file (e.g., `V10_BUILD_INSTRUCTIONS.md`)
2. Check `.claude/status/current-status.md` for what's already done
3. Understand dependencies and prerequisites

## Plan Structure

Create a plan covering:

### 1. Objective
- What are we building?
- What's the acceptance criteria?
- What does "done" look like?

### 2. Approach
- High-level approach
- Key design decisions
- Any alternatives considered and why rejected

### 3. File Changes
| File | Action | Description |
|------|--------|-------------|
| `path/to/file` | Create/Modify/Delete | What changes |

### 4. Implementation Order
```
1. [ ] First step (why this first)
2. [ ] Second step (depends on #1)
3. [ ] Third step
...
N. [ ] Run tests
N+1. [ ] Update documentation
```

### 5. Risks & Unknowns
- What could go wrong?
- What needs clarification?
- Any blockers?

### 6. Estimate
- Scope: Small / Medium / Large
- Estimated steps: {N}

## Output Format

```
## Implementation Plan: {Feature Name}

### Objective
{What we're building and why}

### Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}

### Approach
{High-level approach in 2-3 sentences}

### Files to Change
| File | Action | Description |
|------|--------|-------------|
| ... | ... | ... |

### Steps
1. [ ] {Step}
2. [ ] {Step}
...

### Risks
- {Risk or unknown}

### Ready to Proceed?
{Yes / No — if no, what's blocking}
```

## Rules
- Do NOT start implementing
- Ask clarifying questions if requirements are unclear
- Be realistic about scope
- Identify dependencies before starting
