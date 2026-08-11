# ProViso — Implementation Plan, Iteration 2

**Deepening the plan** on two fronts: (A) resolving the six open decisions with recommendations and rationale, and (B) a design-level pass on the facility spine and loan economics (Phases 1–2) — data model, the canonical per-period order that makes cash deterministic, and the rewiring of existing constructs. Section F is the honest part of "measure twice": the deeper look surfaced new sharp edges and sub-decisions, listed rather than hidden.

Still no code — this is design a code instance implements, not a spec to transcribe.

---

## A. The six decisions, resolved

### D1 — Debt source of truth → **Facility derives, supplements are explicit, netting is separate**
When a `FACILITY` is declared it becomes authoritative, but "total debt" is a *composition*, not just the sum of facility tranches. Define it precisely:

> **Gross debt** = Σ(tranche drawn balances) **+** explicitly-flagged non-facility debt (other debt, capital leases, supplied as tagged inputs).
> **Net debt** = Gross debt − netted cash, where netted cash = min(unrestricted cash, a stated cap).

Recommendation: facilities derive the canonical `TotalDebt`/`SeniorDebt`/`DebtService`; any directly-supplied same-named metric triggers a validator **mismatch warning** and the derived value wins; non-facility debt is added, never silently dropped; net-vs-gross is a *derived convention* (leverage covenants pick which). Files with no facility are untouched.
**Why:** one number for debt across covenants, incurrence tests, incremental headroom, and sweeps — but without pretending every deal's debt is 100% inside the modeled facilities, and without ignoring that leverage is usually **net**.
**Surfaced sub-decision → D1a:** the cash-netting cap (a dollar cap on how much cash can offset debt) is deal-specific and interacts with sweeps (cash spent on a prepayment is no longer available to net). Model the cap as a facility-level attribute.

### D2 — Sweep vs. waterfall ordering → **Neither; a single canonical per-period settlement order (Section B)**
The question assumes one global rule, but corporate and PF cash mechanics differ. Resolve it by defining *one deterministic per-period sequence* into which every cash event declares its slot by **source type**, rather than ordering "sweep vs. waterfall" pairwise. A corporate ECF sweep and a PF waterfall tier then occupy well-defined, non-overlapping slots. See Section B.
**Prerequisite it exposes:** the existing waterfall's remainder accounting must be corrected first (the reserve-draw double-count from the code review) — sweeps and cash traps build on remainder, so a wrong remainder poisons them. This moves into Phase 0.

### D3 — Entity model timing → **Scaffold in Phase 0, build in Phase 4**
Don't build entities early, but in Phase 0 route *all* metric access through a single resolver chokepoint so that later it can become entity-aware (period → entity → metric → value with a consolidation function) without touching every call site. Cost now: near-zero (mostly ensuring one resolution path). Benefit: Phase 4 becomes an additive capability, not a data-model migration.
**Caveat to revisit:** if target buyers are LBO/sponsor shops, guarantor coverage and unrestricted-sub leakage are core and may justify pulling entities earlier — a buyer-feedback trigger, not a code decision.

### D4 — Projection engine scope → **Defer NPV; accept supplied projected values now**
Full forward projection + discounting (for true LLCR/PLCR) is a large, separable subsystem that risks turning ProViso into an FP&A model. Recommendation: near-term, support LLCR/PLCR only as **covenant tests against an externally-supplied projected figure** (as MinLLCR already can be expressed), build the *historical* roll-forward engine (needed anyway for sweeps), and mark real forward NPV a deliberate future major version with a clean boundary so no one half-builds it.

### D5 — Add-back stack expressiveness → **Ordered add-backs, per-item caps, one aggregate cap, run-rate with expiry — and a defined cap basis**
v1 covers the majority of deals with: ordered add-backs, per-item caps, a single aggregate cap, and a run-rate/synergy flag with a look-forward window and expiry date.
**The subtlety that must be nailed (D5a):** an aggregate cap "25% of Consolidated EBITDA" is *circular* — the cap depends on the EBITDA the add-backs are inflating. Adopt an explicit convention (recommended: **cap measured against EBITDA before the capped add-backs**), make it a documented setting, and let the dependency graph (Foundation C) enforce that the chosen basis is acyclic. This is precisely why Foundation C exists.

### D6 — Pricing-grid feedback → **Grid test-ratio must be interest-independent within a period**
Rule: the ratio that drives the pricing grid (leverage = debt/EBITDA) must not reference the interest expense the grid produces. Interest is a *downstream output* that may feed coverage covenants and sweeps, but those may not feed back into the grid's own input within the same period. Cross-period lag (a trailing-leverage grid where last period's interest already settled) is allowed — a lagged dependency, not a cycle. Foundation C enforces this and errors clearly if a design violates it.

---

## B. The canonical per-period settlement order

This is the backbone that makes cash deterministic and answers D2 generally. Every construct that moves cash declares which step it occupies; the engine runs the steps in this fixed order each period and carries ending balances forward. (Order shown; the coder implements it as the single settlement routine.)

1. **Open** — load start-of-period balances (facility drawn, reserve balances, pending reinvestment timers).
2. **Draws** — apply new facility draws, each gated by its Conditions-Precedent checklist and current phase (reuses the existing CP + phase constructs).
3. **Accrue interest & fees** — apply the pricing-grid margin (from the *prior-settled* leverage per D6) to compute interest; add commitment/LC fees.
4. **Operating cash in** — revenue and operating results for the period.
5. **Waterfall tiers** — run the priority cascade (PF deals) on a *corrected* remainder; reserve draws top up tiers without depleting the revenue remainder (the Phase-0 fix).
6. **Scheduled amortization** — mandatory scheduled principal on term tranches.
7. **Excess-cash-flow determination** — compute ECF from a *defined* residual (its own small adjustment stack — see D-note).
8. **Mandatory prepayment sweeps** — ECF sweep (%, stepped by leverage) and any asset-sale/casualty/debt-issuance proceeds due; apply against tranche balances per the debt-stack application order (D2a).
9. **Cash trap / distribution lock-up test** — if distribution conditions fail, route would-be distributions to a named reserve instead of releasing (Phase 6 extends the waterfall gate to "trap" rather than merely "block").
10. **Distributions / restricted payments out** — released only if the lock-up passed and basket capacity permits.
11. **Close** — record ending balances and a per-period ledger entry (audit trail, consistent with the basket ledger).

Any new cash construct must name its step. Ambiguity here is nondeterministic cash — the one thing the product cannot ship.

---

## C. Deep design — the Facility spine (Phase 1)

**Object model (conceptual).** A deal has ≥1 `FACILITY`; a facility has ≥1 `TRANCHE` (facility = tranche for simple deals). Tranche attributes: type (revolver / TLA / TLB / delayed-draw / incremental), commitment, drawn, maturity, amortization schedule (term tranches), applicable margin *or* a reference to a pricing grid, and status. Revolver adds availability (commitment − drawn − LC usage) and sublimits (LC, swingline) as sub-caps.

**Derived, period-aware quantities** (registered as canonical names in the resolver, per D1/D3): total commitment, total drawn (= gross facility debt), undrawn, revolver utilization %, weighted margin, period interest, scheduled amortization due, and period debt service (interest + scheduled amort).

**Statefulness.** Drawn balances roll forward through the Section-B order: draws raise them; scheduled amortization and mandatory prepayments lower them. Generalize the basket-ledger carry-forward pattern rather than inventing a new state mechanism.

**Rewiring of existing constructs (no syntax change to them — the *source* of numbers shifts):**
- **Covenants** — leverage/coverage read facility-derived debt and debt service; interest-coverage can now read grid-driven interest.
- **Reserves** — a DSRA target can reference "N × monthly debt service" from the facility instead of a free expression (make the facility reference optional; free expressions still work).
- **Waterfall** — debt-service tiers reference tranche debt service; this is also where the ECF residual (step 7) originates.
- **Baskets** — a debt-incurrence basket and the facility's incremental capacity are the *same capacity viewed twice*; Phase 1 should at minimum make a debt basket's "used" reflect incremental draws, with full unification in Phase 3.
- **Conditions Precedent & Phases** — facility *draws* are gated by CP completion and phase (construction draws), a clean reuse of existing constructs rather than new machinery.

**Back-compat.** The derived-metric layer is inert unless a `FACILITY` is declared; the existing demos (which supply `TotalDebt` and declare no facility) must produce byte-identical output — golden-file regression gate.

---

## D. Deep design — loan economics (Phase 2)

**Pricing grid / margin ratchet.** A table of leverage bands → applicable margin, evaluated each period from the interest-independent leverage (D6). Output feeds interest accrual (step 3). The grid itself is amendable (pricing step-downs on de-leveraging), so it needs amendment + diff coverage.
- **Sub-decision D-int:** interest accrual convention — average drawn vs. period-end drawn balance. Revolvers fluctuate intra-period; pick and document one (recommended: average of open/close for the period).

**Fees.** Commitment/unused fee (rate × undrawn revolver), LC fees (rate × LC outstanding), optional default interest. Derived costs that flow into cash and coverage.

**Mandatory prepayments / sweeps.** Three sources, each a typed cash event at step 8:
- **ECF sweep** — sweep % (stepped by leverage, like a grid) × ECF. **ECF is itself an adjustment stack** (operating cash − capex − scheduled debt service − taxes − permitted items); reuse Foundation B, do not hardcode it. This is a second consumer of the adjustment engine, reinforcing why it's a foundation.
- **Asset-sale / casualty proceeds sweep** — with a **reinvestment right**: proceeds must be swept *unless reinvested within X months*. This makes the sweep **time-stateful** — a proceeds amount sits "on the clock" across periods until reinvested or swept. New state on the roll-forward timeline, plus a de-minimis threshold.
- **Debt-issuance sweep** — 100% of non-permitted debt proceeds.
- **Debt-stack application order (D2a):** how a prepayment is applied across tranches (pro rata vs. sequential) and against future scheduled amortization (forward vs. inverse order) is a *modeled attribute*, not hardcoded — it changes future debt service, hence future coverage, a deliberate cross-period coupling.

**Prepayment premium / call protection.** A schedule keyed to months since closing, applied to *voluntary* prepayments (and sometimes repricing); mandatory sweeps are usually premium-free — model that exemption explicitly.

---

## E. Worked propagation example (validates the interaction web)

Trace a single real event — the borrower de-levers via an ECF sweep — through one period and into the next, to confirm the dependency direction is sound:

1. Period *n* ECF is computed (step 7) and the sweep (step 8) pays down the TLB → **drawn debt falls**.
2. Period *n+1* opens with lower debt → **leverage falls** (debt/EBITDA; interest plays no part in this ratio, per D6).
3. The **pricing grid** reads the lower leverage → **margin steps down**.
4. Lower margin → **interest expense falls** (step 3, using the *prior-settled* leverage, so no within-period cycle).
5. Lower interest → **fixed-charge coverage improves** → any coverage covenant has more headroom.
6. Lower leverage also **steps down the ECF sweep %** → *less* mandatory prepayment next period — a self-damping feedback, resolved across periods, never within one.

Every arrow points forward in the Section-B order or forward in time; none closes a within-period loop. That is the acyclicity D6/Foundation C must guarantee — and this example is a test case, not just an illustration.

---

## F. Newly surfaced risks & sub-decisions (this pass's "measure" output)

The deeper look revealed items the first plan didn't have. Log them now:

- **D1a** — the cash-netting cap (gross vs. net debt) is a facility attribute and couples with sweeps (prepaid cash can't also net).
- **D2a** — prepayment application order across the debt stack and against scheduled amortization (modeled, not hardcoded) — affects future coverage.
- **D5a** — aggregate add-back cap basis (against pre- or post-add-back EBITDA); recommend pre, must be explicit and acyclic.
- **D-int** — interest accrual convention (average vs. period-end drawn).
- **ECF is an adjustment stack**, not a formula — second consumer of Foundation B; canonicalize its definition.
- **Reinvestment timers** make asset-sale sweeps time-stateful — a new kind of pending state on the roll-forward clock.
- **Waterfall remainder correction is a hard prerequisite** (moves into Phase 0) — sweeps/traps inherit its bug otherwise.
- **Revolver utilization must be a first-class derived series** — springing covenants (Phase 5) key off it, so build it in Phase 1 even though its consumer comes later.
- **Out of scope v1, flag explicitly:** multicurrency, benchmark/rate-transition mechanics, and true forward NPV (D4).

---

## G. Additions to the "definition of done"

Phases 1–2 add two standing requirements to the per-construct checklist:

- **Every cash-moving construct declares its step in the Section-B settlement order** — no construct may move cash at an undeclared point.
- **Every derived metric registers once with the resolver and the validator** — so there is exactly one definition of `TotalDebt`, `InterestExpense`, `ECF`, etc., and a user `DEFINE` colliding with a derived name is caught (now possible because the validator has cycle/collision detection from Foundation C).

Resolve D1a, D2a, D5a, and D-int alongside the original six, and Phases 1–2 are ready to hand to a code instance as a straight build.
