# ProViso — Implementation Plan for New Constructs

**Purpose.** A build plan for adding the constructs from the gap analysis, written to think through how each fits the *existing* system rather than to specify code. It leads with the shared foundations, the canonical cash order, and the interaction map — the "measure twice" work — because most of the 18 gaps are not independent features; they lean on four missing pieces of plumbing and on each other. A code instance should treat the phase order and the decision log as the spine, and resolve the decisions before writing the first construct.

**How to read it:** §1–2 are the rules of the road. §3 is the core reasoning (four foundations + interaction map). §4 is the canonical per-period cash order that makes everything deterministic. §5 is the phased roadmap, with Phases 1–2 taken to design level. §6 is a worked example that doubles as a test. §7 is testing/rollout. §8 is the decision log — resolved, pending your sign-off. §9 reconciles the whole plan against the current codebase (the Coder's `fix/code-review-defects` branch) — read it before starting, as it moves several Phase-0 items to "already done" and several foundations to "reuse, don't rebuild."

*No code — this is design a code instance implements, not a spec to transcribe.*

---

## 1. Design principles (non-negotiables)

- **Backward compatibility.** Every existing `.proviso` file must parse and evaluate identically after each phase. New constructs are additive; new foundations must have a fallback so a file that uses none of them behaves exactly as today.
- **Determinism, no model-in-the-loop.** Preserve the core promise: same inputs → same outputs, always. No probabilistic anything in evaluation.
- **Single source of truth.** The biggest risk in this expansion is two places disagreeing about the same fact — most acutely, "what is total debt?" Every new construct must either *derive* from an authoritative source or *be* the authoritative source, never a parallel copy.
- **Name-referenced, and therefore validated.** The language wires constructs together by name (a phase names covenants; a waterfall names a reserve). Every new cross-reference must be checked by the validator — not optional, because the validator is currently thin (no duplicate-name or cycle detection, and several existing references go unchecked). Adding 18 constructs without closing that gap turns silent mis-references into wrong answers.
- **Lawyer-readable.** Syntax should continue to read like the agreement. If a construct can't be expressed in language a deal lawyer would recognize, the design isn't done.
- **One construct, one full slice.** "Done" means every layer below is complete, not just the interpreter.

## 2. Definition of done — the slice every construct completes

Each new construct passes through the same layers. This checklist *is* the per-construct spec:

1. **Grammar** — new keywords added to the reserved-word set so they can't be silently parsed as identifiers (watch for collisions with existing metric names in the demos).
2. **AST + result types** — the parsed shape and the evaluated-result shape.
3. **Interpreter** — evaluation semantics, plus explicit answers to: does it participate in pro forma (`simulate`)? Is it period-aware / as-of-aware? Is it phase-scoped? Does it carry state across periods?
4. **Validator** — reference resolution (do the names it points at exist, with the right type?) and participation in cycle detection.
5. **Amendment support** — can it be REPLACED / ADDED / DELETED / MODIFIED, and which fields are modifiable? Plus diff/classification coverage so the negotiation module doesn't report "no change" on a real change.
6. **CLI + dashboard** — a command/report and a UI surface, with correct pass/fail exit codes and JSON.
7. **Tests + glossary** — unit, interaction, and regression tests (plus a red-team case), and a glossary entry.
8. **Cash slot (if applicable)** — every cash-moving construct declares its step in the canonical settlement order (§4); no construct may move cash at an undeclared point.
9. **Metric registration (if applicable)** — every derived metric registers once with the resolver and the validator, so there is exactly one definition of `TotalDebt`, `InterestExpense`, `ECF`, etc., and a user `DEFINE` colliding with a derived name is caught.

A construct that skips layer 4 or 5 will *appear* to work while quietly breaking validation guarantees or the redline — the two things the product sells.

---

## 3. The core: four foundations + interaction map

**Key realization:** the Tier 1–2 gaps aren't 18 separate constructs. They are a handful of new *objects* plus a lot of *rules that reference those objects*. Build the objects first, in dependency order, or later constructs each reinvent (and disagree on) the same plumbing.

### Foundation A — The Facility / debt spine
A `FACILITY` / `TRANCHE` object (commitment, drawn/undrawn, maturity, amortization, sublimits) that becomes the **authoritative source of the debt stack**. Foundational because "debt" is referenced everywhere as a supplied metric today, and five later constructs (pricing grid, incremental, mandatory prepayment, borrowing base, incurrence tests) need the *actual* tranches, not a single number. Design detail in §5, Phase 1.

### Foundation B — The pro forma / adjustment engine
A single, centralized engine that (i) builds "adjusted EBITDA" from an ordered add-back stack with per-item caps, an aggregate cap, and run-rate/time limits, and (ii) recomputes any ratio "as if" a proposed transaction occurred. Foundational because **every ratio flows through EBITDA**, and incurrence tests, incremental capacity, pricing grids, ECF, and sweep step-downs are all ratios evaluated pro forma. It must be computed **once and centrally**, then consumed by all ratio users — not re-derived per construct. It **replaces the current `simulate()` approach** (which swaps raw inputs) and builds on the now-fixed `simulate` (the cache-invalidation bug is already resolved on the fix branch — see §9), rather than the old raw-input swap. `DEFINE`'s existing "excluding" and single "cap" modifiers are its seed.

### Foundation C — Dependency graph + evaluation ordering
Formal dependency analysis over all named values, with **cycle detection** and a deterministic (topological) evaluation order. Foundational because the new constructs introduce genuine circular-reference risk: the pricing grid sets margin from leverage, margin drives interest, interest feeds coverage, and a covenant step-down or sweep can key off that coverage; and add-backs reference the EBITDA they inflate. Cycle detection and cross-reference graph tooling already exist in pieces today (runtime definition-cycle guards; the defined-terms module's graph and circular-reference helpers — see §9); this **consolidates** them into one static pass for existing `DEFINE`s and everything new, and gives every construct one place to hook reference validation (satisfying DoD layer 4).

### Foundation D — Stateful roll-forward, and (separately) forward projection
Two time capabilities the engine lacks:
- **Sequential period roll-forward with carry-forward state.** Mandatory prepayments, ECF sweeps, cash traps, and facility balances are *flows* that change *stocks* period over period. Today's multi-period support is backward-looking snapshots; this adds an ordered simulation where each period's ending state feeds the next. The basket ledger already does a small version — generalize it.
- **Forward projection + discounting (NPV).** LLCR/PLCR need projected future cash flows and a discount rate. Genuinely new and heavier; kept isolated to the project-finance phase so it doesn't block corporate work (see D4).

### The cross-cutting interaction map (applies to every phase)
- **"What is debt?"** Once facilities exist, leverage, incurrence, incremental headroom, sweeps, and waterfalls must agree. Resolution in D1.
- **Pro forma consistency.** One adjustment engine feeds all ratio users; `simulate` layers a transaction on top of it. No construct computes its own EBITDA.
- **Flows vs. stocks.** Point-in-time constructs (covenants, baskets) and period-flow constructs (sweeps, reporting, cash trap) evaluate differently; the roll-forward mode is opt-in per evaluation, not a global change.
- **Phase awareness.** Decide, per construct, whether it's phase-scoped (ECF sweep and distribution lock-up are operations-phase; hedging is a CP plus an ongoing covenant; a pricing grid usually spans phases). Extend the phase system so new constructs — not just covenants — can be suspended/activated.
- **Amendment + redline.** Incremental facilities, pricing-grid changes, and sweep step-downs are commonly amended, and the negotiation module must diff them. Extend the amendable-statement set and the diff/classifier for every new construct, or changes to them silently show as "no change" (a known differ weakness).
- **Entity scope.** Guarantor coverage and restricted-subsidiary leakage need per-entity metrics. The data model is flat today; reserve room for optional entity attribution now (D3) so Phase 4 isn't a rewrite.
- **Capacity composition.** Permitted-action capacity (debt, restricted payments, investments) comes from several sources at once — fixed/grower/builder baskets, ratio prongs, incremental facilities — that must be modeled as *one system per action-type*, or the same headroom gets counted twice. Detail in Phase 3.

---

## 4. The canonical per-period settlement order

The backbone that makes cash deterministic. Every construct that moves cash declares which step it occupies; the engine runs the steps in this fixed order each period and carries ending balances forward.

1. **Open** — load start-of-period balances (facility drawn, reserve balances, pending reinvestment timers).
2. **Draws** — apply new facility draws, each gated by its Conditions-Precedent checklist and current phase (reuses existing CP + phase constructs).
3. **Accrue interest & fees** — apply the pricing-grid margin (from the *prior-settled* leverage, per D6) to compute interest; add commitment/LC fees.
4. **Operating cash in** — revenue and operating results for the period.
5. **Waterfall tiers** — run the priority cascade (PF deals) on a *corrected* remainder; reserve draws top up tiers without depleting the revenue remainder (the Phase-0 fix).
6. **Scheduled amortization** — mandatory scheduled principal on term tranches.
7. **Excess-cash-flow determination** — compute ECF from a *defined* residual (its own small adjustment stack).
8. **Mandatory prepayment sweeps** — ECF sweep (%, stepped by leverage) and any asset-sale/casualty/debt-issuance proceeds due; applied against tranche balances per the debt-stack application order (D2a).
9. **Cash trap / distribution lock-up test** — if distribution conditions fail, route would-be distributions to a named reserve instead of releasing (Phase 6 extends the waterfall gate to "trap" rather than merely "block").
10. **Distributions / restricted payments out** — released only if the lock-up passed and basket capacity permits.
11. **Close** — record ending balances and a per-period ledger entry (audit trail, consistent with the basket ledger).

Any new cash construct must name its step. Ambiguity here is nondeterministic cash — the one thing the product cannot ship.

---

## 5. Phased roadmap

Ordering is by dependency and value-per-unit-risk. Each phase lists what it adds, dependencies, the interactions to resolve, and the main risk. Phases 1–3 are taken to design level; later phases stay at the planning level until their turn to be measured.

### Phase 0 — Foundations & de-risking (no new user-facing constructs)
*Status update: most of the correctness fixes listed here already landed on the `fix/code-review-defects` branch (770/770 tests) — see §9. Merge that first; Phase 0 then reduces to the forward-looking scaffolding (resolver chokepoint, adjustment engine, consolidating the existing dependency-graph tooling).*
- Build Foundation B (adjustment engine, replacing/fixing `simulate`) and Foundation C (dependency graph + cycle detection + validator hook).
- Route **all metric access through one resolver chokepoint** so entity attribution (D3) and roll-forward can be added later without touching every call site — this is the cheap Phase-0 move that prevents a Phase-4 rewrite.
- Land the correctness fixes that get worse with more constructs: pro-forma cache invalidation, validator reference/cycle gaps, diff field-coverage, and **the waterfall remainder double-count** (a hard prerequisite — sweeps and cash traps build on remainder).
- **Risk:** touching EBITDA/ratio computation and `simulate` affects existing results; gate on the full existing suite staying green plus new interaction tests and golden-file snapshots of the demo deals.

### Phase 1 — The facility spine
**Object model.** A deal has ≥1 `FACILITY`; a facility has ≥1 `TRANCHE` (facility = tranche for simple deals). Tranche attributes: type (revolver / TLA / TLB / delayed-draw / incremental), commitment, drawn, maturity, amortization schedule (term tranches), applicable margin *or* a reference to a pricing grid, status. Revolver adds availability (commitment − drawn − LC usage) and sublimits (LC, swingline).

**Derived, period-aware quantities** (registered as canonical names in the resolver): total commitment, total drawn (gross facility debt), undrawn, revolver utilization %, weighted margin, period interest, scheduled amortization due, period debt service. Build **revolver utilization as a first-class derived series** even though its consumer (springing covenants) arrives in Phase 5.

**Statefulness.** Drawn balances roll forward through the §4 order: draws raise them; scheduled amortization and mandatory prepayments lower them. Generalize the basket-ledger carry-forward pattern.

**Rewiring of existing constructs (no syntax change to them — the *source* of numbers shifts):**
- **Covenants** read facility-derived debt and debt service; interest-coverage can read grid-driven interest.
- **Reserves** — a DSRA target can reference "N × monthly debt service" from the facility (optional; free expressions still work).
- **Waterfall** — debt-service tiers reference tranche debt service; the ECF residual (§4 step 7) originates here.
- **Baskets** — a debt-incurrence basket and the facility's incremental capacity are the *same capacity viewed twice*; Phase 1 makes a debt basket's "used" reflect incremental draws, with full unification in Phase 3.
- **Conditions Precedent & Phases** — facility *draws* are gated by CP completion and phase (construction draws), reusing existing constructs rather than new machinery.

**Depends on:** Phase 0 (roll-forward scaffolding). **Risk:** the "single source of truth" switch (D1) must be invisible to files that declare no facility — golden-file regression on the demos.

### Phase 2 — Loan economics on the facility
- **Pricing grid / margin ratchet** — a table of leverage bands → applicable margin, evaluated each period from the interest-independent leverage (D6); output feeds interest accrual (§4 step 3). The grid is amendable, so it needs amendment + diff coverage. Interest accrual convention is D-int.
- **Fees** — commitment/unused (rate × undrawn revolver), LC fees (rate × LC outstanding), optional default interest — derived costs that flow into cash and coverage.
- **Mandatory prepayments / sweeps** (typed cash events at §4 step 8):
  - **ECF sweep** — sweep % (stepped by leverage) × ECF, where **ECF is itself an adjustment stack** (operating cash − capex − scheduled debt service − taxes − permitted items); reuse Foundation B, don't hardcode it.
  - **Asset-sale / casualty proceeds sweep** — with a **reinvestment right**: proceeds must be swept *unless reinvested within X months*, making the sweep **time-stateful** (a proceeds amount sits "on the clock" across periods until reinvested or swept), plus a de-minimis threshold.
  - **Debt-issuance sweep** — 100% of non-permitted debt proceeds.
  - **Debt-stack application order (D2a)** — how a prepayment is applied across tranches (pro rata vs. sequential) and against future scheduled amortization (forward vs. inverse) is a *modeled attribute*, not hardcoded; it changes future debt service, hence future coverage.
- **Prepayment premium / call protection** — a schedule keyed to months since closing, applied to *voluntary* prepayments; mandatory sweeps are usually premium-free — model the exemption.

**Depends on:** Phases 0–1. **Risk:** circularity and flow/stock sequencing — exactly what Foundations C and D exist to handle.

### Phase 3 — Incurrence regime & the unified capacity model
The deliverable here is **not three constructs — it is one capacity system** that baskets, incremental facilities, and incurrence tests all express. Getting the *relationships between capacity sources* right is the whole job; double-counted capacity and a mis-resolved ratio prong are the two ways it goes wrong.

**A. The capacity model.** Capacity is organized by **action-type** — debt, restricted payments, investments, liens, junior-debt prepayments, asset sales — the same targets `PROHIBIT` already names. For each action-type a deal has one or more **capacity sources**:
- Fixed basket (dollar cap; "free and clear").
- Grower basket (greater of $X or Y% of a metric).
- Builder / available-amount basket (accumulates from multiple build components — a starter plus % of consolidated net income, equity proceeds, investment returns, declined prepayments — net of usage).
- Ratio prong ("unlimited," subject to a pro forma incurrence test).
- Incremental facility capacity (debt only): a free-and-clear amount plus a ratio prong, with MFN.

The existing `BASKET` (fixed/grower/builder) becomes a *source registered under an action-type*, semantics preserved. A proposed action of size S is permitted if S can be **allocated** across the available sources for its action-type; the engine tracks usage per source in a **generalized capacity ledger** — the existing basket ledger, extended to multiple sources.

**B. Source composition (D7).** Sources for an action-type relate as **additive** (stack; total = sum), **shared** (a common pool; using one reduces another), or **elected** (borrower must pick one prong per incurrence). The canonical case to get right is incremental free-and-clear vs. a general debt basket — additive in some drafts, shared in others. Model the relationship explicitly per source; default additive.

**C. Ratio prongs — how "available" is computed (D8).** A ratio prong's capacity is the action size that *just* satisfies the pro forma test — a **solve, not a lookup**. Where the ratio is linear in the action (max debt = threshold × adjusted EBITDA − existing net debt), it's closed-form; where the action itself changes EBITDA (acquisition synergies) or proceeds net against debt, it needs a defined computation or an iterate-to-tolerance. Recommendation: **report** available ratio capacity via the solve (so the dashboard can show "$X of ratio debt capacity") while the **test** of any specific proposed amount stays ground truth, and reconcile the two so they never disagree at the boundary.

**D. Pro forma "give effect to" (D-pf).** Define the standard pro forma event bundle: the action itself (new debt ↑ debt; an RP ↓ cash/equity), any related acquisition (target EBITDA + capped synergies), and use-of-proceeds netting (proceeds repaying debt reduce pro forma debt). This runs through Foundation B, and the add-back caps (D5/D5a) apply to the combined figure. Order of operations is fixed and documented, because "ratio debt tested on a leverage that already includes the new debt" is a fixed point that must resolve deterministically.

**E. Reclassification & division (D9).** Agreements let a borrower **divide** one incurrence across multiple prongs and later **reclassify** amounts between sources (debt first taken under the ratio prong, later reclassified to a fixed basket as the ratio tightens). v1: support **division** (allocate one action across sources at incur time) and model **reclassification** as an explicit ledger event; defer automatic optimal reclassification. The capacity ledger records allocations and can move usage from source A to B when B has room.

**F. Interactions with existing constructs.**
- **PROHIBIT / EXCEPT** — an exception can now reference the capacity system for its action-type ("permitted up to available capacity" or "if the incurrence test is met"), not just a single `AVAILABLE(basket)`. This is the natural home for incurrence prongs.
- **COVENANT** — incurrence tests reuse covenant ratio evaluation and step-down machinery, but on a *pro forma* basis with *no default consequence*. Keep the ratio logic shared, the tested-basis and consequence distinct — never conflate an incurrence FCCR with a maintenance FCCR that share a formula.
- **FACILITY (Phase 1)** — ratio-based incremental debt, once incurred, *becomes a tranche* and changes the debt stack, closing the loop with Phase 1. **MFN** references existing margins / the pricing grid (Phase 2): incremental priced above existing-plus-a-cushion triggers a repricing of the existing tranche.
- **Builder / available-amount** — investment *returns* flow back into RP/investment capacity, a feedback that must be **period-lagged** to stay acyclic (Foundation C).
- **"No default" gating** — most prongs also require no default/EOD; compose the existing `EXISTS` / `COMPLIANT` checks rather than re-implementing.
- **Amendment + diff** — thresholds, basket sizes, and incremental capacity are among the most-amended terms in any deal; full amendment + redline coverage is mandatory here.

**Depends on:** Phases 0–2 (adjustment engine, facility, pricing grid for MFN). **Risk:** the unification itself — double-counted capacity and the ratio-prong fixed point — both contained by making source composition (D7) and the pro forma bundle (D-pf) explicit rather than implicit. (Phase 4, the entity model, is the next candidate for a design-level pass.)

### Phase 4 — Entities, guarantors, restricted subsidiaries
*Paused per direction — deferred until Phases 1–3 are implemented and merged. Kept here for sequence; do not start until the facility, economics, and incurrence work has landed.*
- `OBLIGOR` / entity model with restricted/unrestricted designations; **guarantor coverage test** (entity-attributed metrics); **RP/investment leakage** to unrestricted subs (basket usage becomes entity-aware).
- **Depends on:** Phase 0 resolver chokepoint (D3). **Risk:** invasive to the data model — the reason Phase 0 reserves room. Could move earlier if buyer feedback makes the entity model bedrock.

### Phase 5 — Credit support & reporting
- **Borrowing base** (advance rates × eligible collateral; ABL/RBL — depends on Phase 4 collateral/entity model); **collateral & LTV** tracking; **reporting / information covenants** (delivery deadlines + responsible party + default-on-miss, reusing CP items + EVENT grace); **springing covenants / covenant holidays** (extend `COVENANT` with a trigger keyed off Phase-1 revolver utilization).

### Phase 6 — Project-finance depth
- **Distribution lock-up / cash trap** as a first-class gate (historical + projected DSCR, reserves funded, no default; blocked cash routed to a reserve) — extends waterfall + reserves; **hedging requirements** (CP + ongoing covenant); **insurance requirements** (modeled on the regulatory-requirement pattern); **LLCR / PLCR** + the forward-projection/discounting engine (Foundation D-ii, the heaviest single item, isolated here; see D4).

### Phase 7 — Governance & negotiation depth
- **Amendment consent thresholds / sacred rights** (required-lender vs. affected/all-lender votes — enriches the negotiation module); **change of control + mandatory offer** (extend `EVENT` + prepayment); **reps & warranties / bring-down** (the affirmative side of conditions precedent).

---

## 6. Worked propagation example (validates the interaction web; doubles as a test)

Trace a de-leveraging event through one period into the next:

1. Period *n* ECF is computed (step 7) and the sweep (step 8) pays down the TLB → **drawn debt falls**.
2. Period *n+1* opens with lower debt → **leverage falls** (debt/EBITDA; interest plays no part, per D6).
3. The **pricing grid** reads lower leverage → **margin steps down**.
4. Lower margin → **interest falls** (step 3, using the *prior-settled* leverage, so no within-period cycle).
5. Lower interest → **fixed-charge coverage improves** → coverage covenants gain headroom.
6. Lower leverage also **steps down the ECF sweep %** → *less* mandatory prepayment next period — self-damping, resolved across periods, never within one.

Every arrow points forward in the §4 order or forward in time; none closes a within-period loop. That acyclicity is what D6 / Foundation C must guarantee — and this sequence is a test case, not just an illustration.

---

## 7. Testing & rollout

- **Interaction tests are the priority, not unit tests.** The failure mode of this expansion is two constructs interacting wrongly (a sweep that miscounts against a facility a covenant also reads). Every phase needs cross-construct scenarios.
- **Golden-file regression.** Snapshot the full evaluated output of the existing example deals; assert byte-for-byte stability through Phases 0–1, where the source-of-truth and adjustment-engine changes are most likely to move an existing number.
- **Red-team each phase**, consistent with the existing red-team test file — adversarial inputs (over-utilized capacity, circular references, zero denominators, missing periods).
- **Ship behind the existing versioning scheme** (v2.x → v3.x), one phase per minor version, each independently releasable and keeping `main` deployable (it auto-deploys).
- **Word generation + diff must keep pace.** A construct isn't shippable until it renders to prose and diffs correctly, or the "code → correct agreement" and "accurate redline" claims regress.

---

## 8. Decision log — resolve before coding

Recommendations shown; these need your sign-off, not a coder's.

- **D1 — Debt source of truth → facility derives; supplements explicit; netting separate.** Gross debt = Σ(tranche balances) + tagged non-facility debt; net debt = gross − min(unrestricted cash, cap). Declared facilities derive canonical `TotalDebt`/`DebtService`; a directly-supplied same-named metric triggers a validator mismatch warning and the derived value wins; no-facility files are untouched.
- **D1a — Cash-netting cap** is a facility-level attribute and couples with sweeps (prepaid cash can't also net).
- **D2 — Sweep vs. waterfall ordering → the canonical §4 settlement order.** Not a pairwise rule; every cash event declares a slot by source type.
- **D2a — Prepayment application order** across the debt stack and against scheduled amortization is a modeled attribute, not hardcoded (affects future coverage).
- **D3 — Entity model timing → scaffold in Phase 0, build in Phase 4.** Route metric access through one resolver now; add entities as an additive capability later. Revisit if sponsor/LBO buyers make it bedrock.
- **D4 — Projection engine scope → defer NPV.** Near-term, support LLCR/PLCR only as covenant tests against externally-supplied projected values; build historical roll-forward now; mark true forward NPV a deliberate future major version.
- **D5 — Add-back stack → ordered add-backs, per-item caps, one aggregate cap, run-rate with expiry.**
- **D5a — Aggregate cap basis** must be explicit and acyclic; recommend measuring the cap against EBITDA *before* the capped add-backs.
- **D6 — Pricing-grid feedback → grid test-ratio must be interest-independent within a period.** Interest is downstream; cross-period lag is allowed; Foundation C enforces acyclicity.
- **D-int — Interest accrual convention** — average vs. period-end drawn; recommend average of open/close.
- **D7 — Capacity source composition → explicit per source; default additive.** Sources for an action-type are additive (stack), shared (common pool), or elected (pick one prong); the incremental free-and-clear vs. general debt basket relationship is the canonical case to pin down.
- **D8 — Ratio-capacity computation → solve for reporting, gate for truth.** Report available ratio capacity via a closed-form solve where the ratio is linear in the action (iterate to tolerance otherwise); the pro forma test of a specific proposed amount remains ground truth; reconcile so they never disagree at the boundary.
- **D9 — Reclassification / division scope → division in v1, reclassification explicit.** Support splitting one incurrence across prongs now; model reclassification as an explicit ledger event; defer automatic optimal reclassification.
- **D-pf — Pro forma "give effect to" bundle.** Define the standard bundle: the action, related acquisition EBITDA + capped synergies, and use-of-proceeds netting; fixed, documented order of operations so the ratio-debt fixed point resolves deterministically.
- **Out of scope for v1 (flag explicitly):** multicurrency, benchmark/rate-transition mechanics, true forward NPV (D4), and automatic optimal basket reclassification (D9).

Answer D1–D6 plus the sub-decisions (D1a, D2a, D5a, D-int, D7, D8, D9, D-pf), and the phase order above becomes a straight build sequence a code instance can execute one minor version at a time.

---

## 9. Reconciliation with the current codebase (branch `fix/code-review-defects`)

The code-review remediation is complete on an unmerged branch (770/770 tests, +91). That changes what this plan should still build. Read this section as amendments to the phases above.

### Already fixed — do NOT redo in Phase 0
- **Pro-forma cache invalidation.** Solved with a period-qualified definition cache key (`<period>::<name>`) plus a `try/finally` in `simulate()`. The same fix corrects the `TRAILING × DEFINE` miscalculation (it had been returning 4× the *oldest* period, not the sum — worse than the original review found). **Foundation B no longer carries a bugfix burden**; it builds on a now-correct `simulate`.
- **Waterfall remainder double-count.** Fixed. This was the hard prerequisite for the §4 sweep/cash-trap steps (8–9); that dependency is now clear.
- **Validator** duplicate-name detection, `TECHNICAL_MILESTONE` and `PHASE … REQUIRED` reference checks, and `TRANSITION`-as-trigger — added. DoD layer 4 is partially met by the validator itself now.
- **Diff engine** field coverage (reserve `fundedBy`/`releasedTo`/`releasedFor`, milestone `requires`, phase `requiredCovenants`) and strict `<`/`>` classification — fixed. The amendment/redline interaction risk is reduced, though each *new* construct still needs its own diff coverage (DoD layer 5).
- **Word** section-key collisions and invisible-definitions — fixed; generated text now carries unique section references. Side effect to respect: the generated `fullText` is materially wider now, so any fixture captured from the old format won't match — relevant when new constructs add to Word output.
- **`CovenantResult` now carries a `unit`** (ratio/currency/percentage/number). Directly useful for the capacity "solve for reporting" (D8) and for formatting — new ratio-bearing results should carry the same field.

### Not greenfield — reuse, don't rebuild
- **Foundation C.** Runtime cycle detection already exists in definition evaluation (v2.6), and the **defined-terms module already ships `buildCrossReferenceGraph()`, `findCircularReferences()`, and `validateCrossReferences()`.** Foundation C becomes *generalize and wire this existing tooling into one static dependency pass with a topological evaluation order* — materially de-risking the pricing-grid acyclicity work (D6).
- **Foundation A / Phase 1.** `closing-enums.ts` already defines a `TransactionType` taxonomy (7 facility types incl. revolving, term loans, ABL), the ontology ships covenant/basket templates, and the forms system has `basket-fixed`/`basket-grower`/`covenant-simple` definitions. The Facility spine should build on `TransactionType` and the ontology rather than inventing a parallel taxonomy, and each new construct should ship a matching form definition so it appears in the negotiation editors.

### Product decisions the Coder surfaced — folded in
- **D-cure (ratio cure adequacy).** Currently `applyCure` reports `shortfallVerified: false` and a $1 cure on a ratio covenant still "succeeds." **This plan answers it:** once Foundation B (adjustment engine) and the facility exist, an equity cure is a *defined pro-forma adjustment* (add to EBITDA or reduce debt) and a payment cure reduces a tranche balance — so the cure's effect on the ratio becomes computable. Decide which input each cure type lands in, then adequacy is checkable. Sequence after Foundation B.
- **Partial `TRAILING` window** — currently warns. Recommend keeping the warning but surfacing an explicit "insufficient-data" flag on the result so downstream ratios can refuse rather than silently pass.
- **`getCureUsage` shape** — now that allowances are per-covenant, recommend making the usage summary per-covenant to match (it currently aggregates per-mechanism).
- **Currency decimals** — already decided (now accepted); the earlier "$1000.50" open item is closed.

### Operational / gating (do before Phase 1)
- **Merge and redeploy the fix branch.** It is unmerged and unpushed; the live site still runs pre-fix code. This plan assumes the fixes are in — building Phase 1 on an unmerged branch invites divergence. Use the normal branch → build → test → PR flow (`main` auto-deploys).
- **Demo-content bug, surfaced not fixed:** `solar_utility.proviso` and `wind_onshore.proviso` reference `Draw2Available` / `Draw3Available` / `Draw4Available`, which nothing defines — now that `TECHNICAL_MILESTONE` validation is on, these will warn. Fix the demo files before merge so the flagship examples validate clean. (Same two files as the de-identification pass — worth doing together.)

### Near-term build sequence (with Phase 4 paused)
Merge fix branch → Phase 0 (scaffolding only) → Phase 1 → Phase 2 → Phase 3. Phase 4 and beyond wait, per direction.
