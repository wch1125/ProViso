# ProViso Red-Team Tests

This folder includes an adversarial test suite (`redteam.test.ts`) designed to surface issues that tend to break trust in production covenant/compliance platforms.

## What this suite tries to catch

### 1) Parsed-but-ignored semantics
Cases where the DSL grammar accepts constructs, but the interpreter does not implement their meaning (i.e., silent no-ops).

### 2) Runtime safety hazards
Circular definitions, division-by-zero, and missing-period behavior that can cause crashes or misleading outputs.

### 3) State correctness
Cross-covenant coupling in cure usage, amendment side effects (e.g., basket utilization resets), and flip/structure association bugs.

### 4) PF-specific correctness traps
Waterfall/reserve invariants and date parsing sensitivity.

## How to use

Run alongside the existing `vitest` suite. In CI, treat failures here as "stop-ship" unless you intentionally accept the limitation.

## Philosophy

Most of these tests *pass* today by asserting the current (often undesirable) behavior so the limitation is explicit and reproducible.
When you fix a limitation, update the corresponding test to assert the intended behavior.
