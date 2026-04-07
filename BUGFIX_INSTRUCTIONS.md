# ProViso Bug Fix Instructions

Two bugs to fix. Both are small and surgical — do not refactor anything else.

---

## Bug 1: `query` command throws "Undefined identifier: amount"

### What's happening

When you run:
```bash
node dist/cli.js query examples/corporate_revolver.proviso "Dividends"
```

The interpreter evaluates the PROHIBIT clause's EXCEPT WHEN conditions, which reference
`amount` (e.g. `amount <= AVAILABLE(RestrictedPayments)`). The `evaluationContext`
binding for `amount` is only set when the user passes `--amount` via the CLI flag.
When no `--amount` is provided, `evaluationContext.bindings` is empty, and
`resolveIdentifier("amount")` falls through to throw `Undefined identifier: amount`.

### The fix

**File: `src/interpreter.ts`**

In the `checkProhibition` method (around line 1257), the block that sets
`evaluationContext` only fires when `amount !== undefined`:

```typescript
// Current code — only sets context if amount was passed
if (amount !== undefined) {
  this.evaluationContext = { bindings: { amount } };
}
```

Change it so that when no amount is provided, `amount` is bound to `0` as a
safe default, AND wrap `amount`-referencing condition evaluation in a try/catch
so it degrades gracefully with a warning rather than crashing:

```typescript
// Fixed: always bind 'amount', default to 0 if not provided
this.evaluationContext = { bindings: { amount: amount ?? 0 } };
```

Then, in the same method, update the action line printed to the console (this
is in `src/cli.ts` around line 437, not the interpreter) to note when amount
was defaulted:

```typescript
// In src/cli.ts, query command handler — update the amount display line:
const amountDisplay = options.amount
  ? ` ($${parseFloat(options.amount).toLocaleString()})`
  : ' (no amount specified — checking structural permission only)';
console.log(`Action: ${action}${amountDisplay}`);
```

### Expected behavior after fix

```
node dist/cli.js query examples/corporate_revolver.proviso "Dividends"

QUERY RESULT
──────────────────────────────────────────────────
Action: Dividends (no amount specified — checking structural permission only)
Result: ✓ PERMITTED
...

node dist/cli.js query examples/corporate_revolver.proviso "Dividends" --amount 5000000

QUERY RESULT
──────────────────────────────────────────────────
Action: Dividends ($5,000,000)
Result: ✓ PERMITTED
...
```

---

## Bug 2: Amendment files reject `//` comments inside AMENDMENT blocks

### What's happening

When you run:
```bash
node dist/cli.js amendments examples/corporate_revolver.proviso -a examples/amendment_001.proviso
```

The parser throws:
```
Parse Error
  --> examples/amendment_001.proviso:11:3
   |
11 |   // Increase maximum leverage ratio from 4.50x to 5.00x
   |   ^
Error: Expected "ADDS", "DELETES", "MODIFIES", "REPLACES", or whitespace but "/" found.
```

### Root cause

`CommentStatement` is handled at the top-level `Statement` rule, so `//` lines
work fine between top-level declarations. But inside an `AMENDMENT` block, the
parser expects only `AmendmentDirective` tokens (`REPLACES`, `ADDS`, `DELETES`,
`MODIFIES`). The grammar rule for `AmendmentDirective` has no comment alternative.

**File: `grammar/proviso.pegjs`**

Current `AmendmentDirective` rule (around line 1140):

```pegjs
AmendmentDirective
  = ReplacesDirective
  / AddsDirective
  / DeletesDirective
  / ModifiesDirective
```

### The fix

Add an inline comment rule as an alternative in `AmendmentDirective`:

```pegjs
AmendmentDirective
  = ReplacesDirective
  / AddsDirective
  / DeletesDirective
  / ModifiesDirective
  / InlineComment

InlineComment
  = "//" [^\n]* _ { return null; }
```

Then in `src/interpreter.ts`, wherever `amendment.directives` is iterated,
filter out nulls (comments) before processing:

Search for the loop that processes directives — it will look something like:
```typescript
for (const directive of amendment.directives) {
```

Change it to:
```typescript
for (const directive of amendment.directives.filter(Boolean)) {
```

After making grammar changes, rebuild the parser:
```bash
npm run build:grammar
npm run build:ts
npm run build
```

### Expected behavior after fix

```bash
node dist/cli.js amendments examples/corporate_revolver.proviso -a examples/amendment_001.proviso
```

Should parse cleanly and display the applied amendments without error.

---

## Verification

After both fixes, run:

```bash
npm run build
npm test

# Then manually verify both commands:
node dist/cli.js query examples/corporate_revolver.proviso "Dividends"
node dist/cli.js query examples/corporate_revolver.proviso "Dividends" --amount 5000000
node dist/cli.js amendments examples/corporate_revolver.proviso -a examples/amendment_001.proviso
```

All 530 tests should still pass. The two manual commands should produce clean output.

---

## What NOT to touch

- Do not change the grammar for top-level `CommentStatement` — it already works
- Do not change `checkProhibition`'s logic beyond the `evaluationContext` default
- Do not refactor `resolveIdentifier` — the fix is upstream of it
