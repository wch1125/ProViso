# ProViso — Code Review / Issue Spot

**Reviewed:** DSL engine (grammar, parser, interpreter, validator), the hub subsystems (versioning/diff, Word generation, forms), and the dashboard's computational utilities. Static review only — I could not run your 679-test suite in this environment, so treat each item as "confirmed against the source" rather than "reproduced at runtime," and pair each fix with a regression test.

**Overall:** The engine is genuinely substantial and mostly sound — step-down covenant selection, grower-basket math, reserve floors, MACRS/P-value tables, and division-by-zero handling all check out (details at the end). The real defects cluster in a handful of places: boolean precedence, pro-forma cache invalidation, Word prose generation, cure mechanics, the waterfall, trailing-period windows, and some demo-facing dashboard formatting. Several of these are **demo-visible** — i.e., a prospect clicking around could hit them — which matters given you're about to put this in front of people.

**Meta-finding:** Bugs this basic (AND/OR precedence, `" to 1.00"` on every covenant, the pro-forma cache) surviving 679 tests means the suite has blind spots around operator precedence, pro-forma cache invalidation, and generated-prose correctness. Worth adding targeted tests there regardless of which fixes you take.

**Status of your two documented bugs (`BUGFIX_INSTRUCTIONS.md`):**
- `query`/`amount` crash — **fixed** (interpreter binds `amount ?? 0` in `checkProhibition` with a `try/finally`; CLI prints the "no amount specified" line). Good.
- `//` comments in AMENDMENT blocks — **half-fixed.** The grammar now accepts them (`InlineComment` alternative, line 1160), but the AST-build action still stores `directives: directives` unfiltered (line 1140), so `null` entries leak into the tree. See H-7 below.

---

## Tier 1 — Critical (fix before you demo or hand code to anyone)

### C-1. `AND` and `OR` have equal precedence — boolean logic is silently wrong
`grammar/proviso.pegjs:1293`
```
BooleanExpression
  = head:BooleanTerm tail:(_ ("AND" / "OR") _ BooleanTerm)* { return buildBinaryExpr(head, tail); }
```
Both operators fold into one left-associative list, so `A OR B AND C` evaluates as `(A OR B) AND C` instead of the conventional `A OR (B AND C)`. In a language whose whole point is executing credit-agreement logic deterministically, this flips CONDITION/covenant outcomes on any mixed expression.
**Trigger:** `CONDITION risky AS default_flag OR revenue > 100 AND coverage > 1.2x` — if `default_flag` is true but coverage fails, the intended `true` returns `false`.
**Fix:** Split into two precedence tiers so `AND` binds tighter than `OR`:
```
BooleanExpression = head:OrTerm tail:(_ "OR" _ OrTerm)* { return buildBinaryExpr(head, tail); }
OrTerm            = head:BooleanTerm tail:(_ "AND" _ BooleanTerm)* { return buildBinaryExpr(head, tail); }
```
Regenerate the parser after.

### C-2. Pro-forma `simulate()` never clears the definition cache — stale results + corrupted state
`src/interpreter.ts:1525` (`simulate`), with the memo at `:572`/`:600`
`evaluateDefinition` memoizes each DEFINE by name into `definitionEvalCache`. That cache is cleared in `loadFinancials`, `setEvaluationPeriod`, `getComplianceHistory`, and `applyAmendment` — but **not** in `simulate()`. Consequence on any interpreter instance that has already evaluated once: (a) the simulation reuses pre-simulation DEFINE values and can report a covenant as still passing, and (b) after `simulate` restores the raw inputs, the cache is left holding *simulated* values, corrupting the next real check.
**Nuance:** The CLI is safe (each command spins up a fresh interpreter, empty cache). The **dashboard is not** — it holds one long-lived interpreter (`ProVisoContext`), so "run status, then simulate" is the exact hazardous sequence, and simulate is a headline demo move.
**Fix:** `this.definitionEvalCache.clear()` at the start of `simulate` and again in a `finally` after restoring state — both the multi-period branch (~line 1547) and the simple branch (~line 1568).

### C-3. Every covenant's Word prose gets `" to 1.00"` appended, regardless of type
`src/hub/word/templates.ts:161`
```ts
prose += `to ${operatorDisplay} ${thresholdPart} to 1.00`;
```
Unconditional. A liquidity covenant renders as *"…to be less than **$50,000,000 to 1.00**"*; a leverage covenant as *"…to exceed **3.5x to 1.00**"* (double ratio notation — `formatRatio` is never called). This is the "change the code → get correct Word" claim visibly breaking, on the exact artifact you'd hand a client.
**Fix:** Only append `" to 1.00"` when the threshold is a `Ratio`, and route ratios through `formatRatio` (`3.5` → `3.50 to 1.00`); emit currency/percentage thresholds verbatim.

---

## Tier 2 — High (correctness or demo-visible)

### H-1. Waterfall double-counts reserve draws, understating cash to lower tiers
`src/interpreter.ts:3305–3313` (`executeTier`) → `remainder -= tierResult.paid` in `executeWaterfall`
`paid = min(requested, available)` (revenue), then `paid += reserveDrawn` (money pulled from a *reserve*, not revenue). The waterfall subtracts the full `paid` from the revenue remainder, so reserve-sourced cash is deducted from revenue it never came from. Remainder can go negative, starving junior tiers, and `totalDistributed` can exceed revenue.
**Trigger:** Revenue $100M; Tier 1 requests $150M with a $50M shortfall reserve → `paid = 150`, `remainder = 100 − 150 = −$50M`; all lower tiers pay $0.
**Fix:** Subtract only the revenue portion (`min(requested, available)`) from `remainder`; report `reserveDrawn` without folding it into the revenue depletion.

### H-2. `TRAILING N QUARTERS` silently uses fewer periods, and its type filter is a dead no-op
`src/interpreter.ts:435–460` (`getTrailingPeriods`), `:395–410` (`evaluateTrailing`)
Two problems in one path. (a) The period-type filter always returns `true` (line 448) — the `quarters/months/years` matching above it is inert, so a stray annual/monthly row gets pulled into a `TRAILING 4 QUARTERS` window and summed. (b) When fewer than `N` periods exist, the window is silently truncated (`slice`), and `evaluateTrailing` sums whatever's there with no flag — so "trailing 4 quarters" with 2 quarters loaded returns a half-year number treated as TTM.
**Trigger:** Only Q1–Q2 loaded; `TotalDebt / (TRAILING 4 QUARTERS OF EBITDA) <= 4.0` computes ~2× true leverage and falsely breaches (or a coverage covenant falsely passes).
**Fix:** Actually filter by `periodType`; and either throw or surface an "insufficient trailing data" flag on the result when `periods.length < count` so a partial window is never reported as a clean pass/fail.

### H-3. `CURE_PERIOD` is computed but never enforced — cures succeed forever
`src/interpreter.ts:3535` (`applyCure`), deadline built at `:3601`
`applyCure` checks uses, max amount, compliance, and shortfall — but never compares today's date to `state.cureDeadline`. `calculateCureDeadline` runs only to *store* the deadline; nothing gates on it. A `CURE_PERIOD 10 DAYS` covenant can be cured 60 days after breach.
**Fix:** In `applyCure`, reject when `new Date() > state.cureDeadline` (deriving the deadline from the breach), returning a "cure period expired" failure.
**Related, same method:**
- **H-3b (unit mismatch):** `calculateShortfall` returns a *ratio* delta for `<=`/`>=` covenants (e.g. 4.5x − 4.0x = 0.5), but line 3566 compares it to `amount`, a *dollar* cure. `amount < shortfall` is comparing dollars to a ratio, so adequacy is never really tested (a $1 cure "satisfies" a 0.5x gap). Compute the shortfall in the covenant's underlying units.
- **H-3c (MAX_USES scope):** `cureUsage` is keyed by `covenant.cure.type` (line 3571), not by covenant, so two covenants both using `EquityCure` share one counter; and `details.overPeriod` (e.g. "2 per fiscal year") is ignored, making a per-period limit a lifetime one.

### H-4. Diff engine misses material fields → "no change" on real changes
`src/hub/versioning/differ.ts:453` (phases), `:477` (milestones), `:495` (reserves)
The type-specific comparators only inspect a subset of fields. `diffReserves` compares `target`/`minimum` but not `fundedBy`/`releasedTo`/`releasedFor` — all of which the Word generator renders. `diffMilestones` ignores `requires`; `diffPhases` ignores `requiredCovenants`.
**Trigger:** Party B changes `RELEASED_TO Sponsor` → `RELEASED_TO Lender`. The Word doc changes; the diff reports **no change**. Directly undercuts "party-vs-party diffs are accurate."
**Fix:** Compare all rendered fields per type, or fall back to a structural (JSON) comparison for fields not explicitly handled.
**Related:** classifier (`classifier.ts:170`) only handles `<=`/`>=`, so a genuine loosening on a strict `<`/`>` covenant is classified `neutral`/immaterial.

### H-5. Word section keys collide, hiding drift and definitions
`src/hub/word/drift.ts:189` + `round-trip.ts:257`, root cause in `generator.ts`
Each element group restarts subsection lettering at `(a)`, and `parseSections` keys purely on that label, so the first covenant and the first basket both map to `"(a)"` — the later overwrites the earlier, dropping the covenant from comparison → `detectDrift` returns `hasDrift: false` on a real edit. Separately, definitions are emitted with no section token at all, so `parseSections`' regex skips them entirely — definition edits in Word are invisible to drift/round-trip.
**Fix:** Key sections by their full reference (`7.11(a)`) using the generator's `sectionReference` rather than re-parsing prose; give definitions a stable section token.

### H-6. CLI accepts bad numeric/date input and silently produces `NaN`/garbage
`src/cli.ts` — `waterfall --revenue` (906), `query --amount` (431), `milestones --as-of` (785), `ledger --since` (634); `draw --json` (982)
`parseFloat`/`new Date` with no validity guard (the `cure` command *does* guard `isNaN` — these don't). `waterfall … -r abc` → every tier `$NaN`; `query … --amount 10x` → `$NaN` permission check; `milestones --as-of 2026-13-40` → `NaNd to target`; `ledger --since notadate` → silently empty. And `draw --json` returns exit 0 even when CPs are pending (the non-JSON path exits 1), so a CI gate reads a blocked draw as success.
**Fix:** Guard each parse (`isNaN(...)` → error + `exit(1)`), matching the `cure` command; in `draw --json`, `process.exit(result.complete ? 0 : 1)`.

### H-7. Demo terminal `baskets` command crashes on an over-utilized or zero-capacity basket
`dashboard/src/utils/commandRunner.ts:181`
```ts
const filledWidth = Math.round((basket.used / basket.capacity) * barWidth);
const bar = '[' + '='.repeat(filledWidth) + ' '.repeat(barWidth - filledWidth) + ']';
```
Unclamped. If `used > capacity`, `barWidth - filledWidth` is negative → `RangeError`; if `capacity === 0`, `filledWidth` is `Infinity` → also throws. `executeCommand` has no try/catch, so the terminal command dies. An over-100%-utilized basket is an expected state your narratives already handle elsewhere.
**Trigger:** Type `baskets` in the demo terminal with any basket over 100% utilized.
**Fix:** `const filledWidth = Math.max(0, Math.min(barWidth, Math.round((basket.used / (basket.capacity || 1)) * barWidth)));`

### H-8. Compliance certificate treats `headroom` as a percentage; other modules treat it as an absolute value
`dashboard/src/utils/complianceExport.ts:64–71, 401, 411`
Here `headroom` drives status as a 0–100 percent (`< 10` danger, `< 25` warning) and is rendered with `formatPercent`. But `commandRunner.ts` (`formatHeadroom` → `formatRatio(Math.abs(headroom))`) and `narratives.ts` treat the same field as an absolute ratio/currency value. Two of three consumers agree it's absolute, so the certificate is likely the outlier — meaning a healthy covenant with, say, 0.75x headroom renders as a red "At Risk" badge with "0.8%" on the client-facing PDF.
**Fix:** Pin down the semantics of `headroom` (I'd bet absolute), then compute a real headroom % for the certificate's thresholds/bar and format the displayed value with `formatRatio`, not `formatPercent`.

---

## Tier 3 — Medium / Low (cobwebs)

- **Validator has no duplicate-name detection** (`validator.ts:80`): two covenants named `leverage` both parse; the second silently shadows the first, `validate()` returns `valid: true`. Add a collision check in `buildSymbolTable`.
- **Validator skips `TECHNICAL_MILESTONE` reference checks** (`validator.ts:221`) on a false "self-contained" assumption — its `TRIGGERS`/`REQUIRES` identifiers go unvalidated though the plain `MILESTONE` sibling is checked. Also **`PHASE … REQUIRED`** covenant refs are omitted from `validatePhase` (`:530`) while `SUSPENDED`/`ACTIVE` are checked.
- **`wordGenerator.ts:134` rounds millions to whole numbers** (`toFixed(0)`): a $7.5M basket prints "$8 million" in generated prose. Use `toFixed(1)` or exact separators. (This is the dashboard's own `wordGenerator`, separate from the hub one.)
- **`wordGenerator.ts:150/183` hardcodes "Section 7.11"/"7.02"** into every covenant/basket prose, duplicating the generated section ref ("7.11(b) Section 7.11 …").
- **Subsection lettering breaks past 26 elements** (`hub/word/generator.ts`): `String.fromCharCode(97 + i)` yields `{`, `|`, `}` at i≥26. And CP/waterfall labels start at `(b)` (skip `(a)`) due to an `i > 0 ? … : ''` off-by-one (`:226`, `:322`).
- **Grammar: currency literals reject decimals** (`proviso.pegjs:1332`): `$1000.50` parses as `$1000` and leaves `.50` dangling. Mirror the `Number` rule's optional decimal.
- **Grammar: `AND`/`OR` lack a word-boundary guard** (`:1294`): an identifier like `ORDINARY_COURSE` can be chopped into `OR DINARY_COURSE`. Add `!([a-zA-Z0-9_])` after the operator.
- **`parser.ts:20` swallows the real load error** and always says "Parser not generated," hiding a genuine runtime failure in an existing `parser.generated.js`.
- **Post-closing draw numbers are globally sequential, not per-deal** (`hub/postclosing/api.ts:37`): deal B's first draw is labeled "Draw #2." Use a `Map<dealId, number>` like `store.ts` does for versions.
- **`getComplianceHistory` (post-closing api) returns newest-first** but is consumed as chronological elsewhere; re-sort ascending or document it.
- **`thresholds.ts:53` / strict operators at the boundary**: `utilization > 1` shows amber "danger" when `actual === threshold` is actually a breach for strict `<`/`>`; drive the zone from the interpreter's `compliant` flag.
- **`complianceExport.ts:375/464` renders `NaN%`/`Infinity%`** when a reserve `target` is 0 (guarded only on array length, not denominator).
- **`commandRunner.ts` ratio/currency heuristic** (`const isRatio = actual < 100`): a percentage covenant of value 15 prints "15.00x." Carry an explicit unit from the engine instead of inferring from magnitude.
- **`commandRunner.ts` free-typed `simulate KEY=VALUE` for a novel key** leaks the value into the shared dashboard interpreter (restore step skips previously-absent keys). Canned demo commands are safe; free-typed novel keys are not.

---

## Checked and cleared (not bugs) — for your confidence
- `query`/`amount` fix present and correct (interpreter + CLI).
- Step-down covenant selection picks the latest activated step correctly; ISO-date comparison valid.
- `/` throws on divide-by-zero rather than yielding a silent `NaN`-as-pass (one bad ratio aborts the batch — a design choice, not a correctness bug).
- Grower-basket "greater of floor vs %" math correct; `drawFromReserve` floors at `minimum`.
- MACRS tables and P50/P75/P90/P99 ordering correct.
- React contexts use functional `setState` updaters on the mutating paths; no direct state mutation of displayed numbers found.
- Hub store version counters are per-deal; version IDs unique; deal/party lookups filter by the right `dealId`.
- CLI file reads are wrapped in try/catch that print a clean `Error:` message (no raw stack).

---

## Suggested order of attack
1. **C-1, C-2, C-3** first — they're either logically wrong (precedence), silently wrong under normal dashboard use (pro-forma cache), or visibly wrong on a client artifact (Word prose).
2. The **demo-visible** highs next, since you're about to show this: **H-7** (terminal crash), **H-8** (certificate red-flagging healthy covenants), **H-2**/**H-1** (wrong headline numbers).
3. Then the rest of Tier 2, then Tier 3 as cleanup.

Each fix is small; the risk is regression, so add a failing test first, then fix, then run `npm test` before pushing (branch → build → test → PR, per your normal flow).
