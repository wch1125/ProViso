# CreditLang: Domain-Specific Language for Credit Agreements

## Planning Document v0.1

---

## 1. Vision & Value Proposition

### What Is This?

A domain-specific language (DSL) that allows credit agreements to be expressed as executable logic. The "source file" reads like a credit agreement but runs like code—answering compliance questions, tracking basket utilization, and simulating proposed transactions.

### Core Value Props

| Stakeholder | Pain Point | CreditLang Solution |
|-------------|-----------|---------------------|
| **Borrower/Sponsor** | "Can we do X?" requires $50K legal memo and 2 weeks | Real-time query: `CHECK Acquisition(30M)` → instant answer with cite |
| **CFO** | Uncertain about headroom before board meetings | Dashboard showing covenant cushion, basket availability |
| **Admin Agent** | Manual basket tracking in Excel, error-prone | Automated ledger with full audit trail |
| **Outside Counsel** | Amendment negotiations argue about prose, not outcomes | Both sides see executable logic; negotiate the actual rules |
| **Project Finance Parties** | Complex CP tracking, milestone interdependencies | State machine that tracks everything, alerts on deadlines |

### What This Is NOT

- **Not smart contracts / automated enforcement** — Courts enforce agreements fine. This is an information/analysis layer.
- **Not AI "reading" agreements** — This is human-authored formal logic, not NLP extraction.
- **Not replacing lawyers** — Lawyers author the CreditLang file; this is a better artifact than a PDF.

---

## 2. Domain Model

### 2.1 Core Concepts (All Deal Types)

```
DEFINITIONS
├── Computed values (ConsolidatedEBITDA, TotalDebt, etc.)
├── Can reference other definitions
├── May have add-backs, exclusions, caps
└── Temporal (point-in-time vs. trailing 12-month)

COVENANTS
├── Financial covenants (ratios, minimums, maximums)
│   ├── Test frequency (quarterly, annually)
│   ├── Cure rights (equity cure, limited uses)
│   └── Consequences of breach
├── Negative covenants (prohibitions with exceptions)
└── Affirmative covenants (required actions)

BASKETS
├── Fixed dollar amounts
├── Grower baskets (% of TTM EBITDA, Total Assets, etc.)
├── Builder baskets (cumulative from excess cash flow, asset sales, etc.)
├── Reclassification rights
├── Shared vs. separate capacity
└── Usage tracking over time

CONDITIONS
├── Reusable boolean bundles
├── NoDefault, NoUnmaturedDefault
├── ProFormaCompliance
├── MaterialAdverseEffect carve-outs

EXCEPTIONS
├── Override general prohibitions
├── Can be nested (exception to an exception)
├── May require conditions to be satisfied
└── "Notwithstanding" = highest precedence override

EVENTS OF DEFAULT
├── Payment defaults (with grace periods)
├── Covenant defaults (with cure periods)
├── Cross-defaults (threshold amounts)
├── Judgment defaults
├── Change of control
├── Cascading consequences
└── Materiality qualifiers

NOTICES
├── Trigger conditions
├── Timing requirements (X business days)
├── Sinx consequences (failure to notify)
└── Required recipients
```

### 2.2 Project Finance Extensions

```
PHASES
├── Development → Construction → COD → Operations → [Tail]
├── Different rules apply in different phases
├── Phase transitions triggered by milestones
└── Some covenants only active in certain phases

MILESTONES
├── Target dates
├── Longstop dates (breach = EoD)
├── Dependencies (Milestone B requires Milestone A)
├── Triggers (unlock draws, change pricing, shift phase)
└── Partial completion / punchlist items

CONDITIONS PRECEDENT
├── Initial CP (closing conditions)
├── Draw request CP (each funding)
├── Phase-specific CP
├── Documentary vs. factual conditions
└── Waiver tracking

ACCOUNTS & WATERFALL
├── Account types (Revenue, O&M, Debt Service, DSRA, Distribution, etc.)
├── Waterfall priority ordering
├── Conditional steps (if DSCR > X then Y)
├── Sweep mechanics
├── Reserve account targets and replenishment

RESERVE ACCOUNTS
├── DSRA (Debt Service Reserve)
├── O&M Reserve
├── Major Maintenance Reserve
├── LC vs. cash funding
├── Target balance calculations
└── Replenishment priority in waterfall

CONSTRUCTION SPECIFIC
├── Budget tracking (hard costs, soft costs, contingency)
├── Draw requests against budget line items
├── Independent Engineer approval workflow
├── Cost overrun provisions
├── Delay LDs from contractors
```

### 2.3 Data Types

```
PRIMITIVE TYPES
├── Currency ($50_000_000, supports underscores for readability)
├── Percentage (5%, 50bps)
├── Ratio (4.50x, or computed as A / B)
├── Date (2025-06-30, supports relative: COD + 90 DAYS)
├── Duration (30 DAYS, 6 MONTHS, 1 YEAR)
├── Boolean (true/false, or complex conditions)
└── Enum (phase names, covenant types, etc.)

COMPOUND TYPES
├── DateRange (FROM date TO date)
├── TimeSeries (quarterly values over time)
├── Money with currency (USD, EUR—likely USD-only for MVP)
└── Threshold (>, >=, <, <=, =)

SPECIAL CONSTRUCTS
├── GreaterOf(A, B) / LesserOf(A, B)
├── Trailing(12 MONTHS, metric)
├── ProForma(transaction, metric)
├── AsOf(date, metric)
└── AVAILABLE(basket) — remaining capacity
```

---

## 3. Language Design

### 3.1 Design Principles

1. **Reads like the agreement** — Syntax should feel familiar to lawyers, not just programmers.
2. **Explicit over implicit** — No magic. If a rule applies, it's stated.
3. **Composable** — Small pieces combine into complex structures.
4. **Auditable** — Every answer traces back to specific provisions.
5. **Versioned** — Amendments create new versions; history is preserved.

### 3.2 Keywords (Reserved)

```
// Structure
DEFINE, AS, COVENANT, BASKET, CONDITION, EVENT, PHASE, MILESTONE, NOTICE, WATERFALL, ACCOUNT, PROJECT, IMPORT, USES

// Logic
REQUIRES, PROHIBIT, EXCEPT, WHEN, AND, OR, NOT, IF, THEN, ELSE, NOTWITHSTANDING, SUBJECT TO, INCLUDING, EXCLUDING

// Temporal
TESTED, QUARTERLY, ANNUALLY, MONTHLY, WITHIN, AFTER, BEFORE, DURING, ACTIVE_DURING, STARTS, ENDS, DUE, GRACE_PERIOD, CURE_PERIOD, LONGSTOP

// Actions & Consequences
TRIGGERS, CONSEQUENCE, BREACH, DEFAULT, TRAP, SWEEP, BLOCK

// Queries
LOAD, CHECK, SIMULATE, QUERY, STATUS, HISTORY, RUN

// Built-in Functions
AVAILABLE(), RATIO(), GREATEROF(), LESSEROF(), TRAILING(), PROFORMA(), SUM(), EXISTS()
```

### 3.3 Syntax Patterns

**Definition:**
```
DEFINE DefinedTerm AS
  base_component
  + addback_1
  + addback_2
  - deduction_1
  EXCLUDING exclusion_list
  CAPPED AT $X OR Y% OF Z
```

**Financial Covenant:**
```
COVENANT CovenantName
  REQUIRES metric threshold value
  TESTED frequency
  [CURE equity_cure_mechanics]
  [BREACH → consequence]
```

**Negative Covenant with Exceptions:**
```
PROHIBIT ActionType
  EXCEPT WHEN
    | condition_1
    | AND condition_2
  EXCEPT BasketException
    | amount <= AVAILABLE(BasketName)
  NOTWITHSTANDING Section_X  // explicit override
```

**Basket:**
```
BASKET BasketName
  CAPACITY base_amount
  [PLUS growth_component]
  [PLUS builder_component]
  [SHARED WITH OtherBasket]
  [SUBJECT TO conditions]
```

**Milestone (Project Finance):**
```
MILESTONE MilestoneName
  DUE target_date
  [LONGSTOP drop_dead_date → consequence]
  [REQUIRES prerequisite_conditions]
  [TRIGGERS downstream_effects]
```

**Waterfall:**
```
WATERFALL AccountName
  1. first_priority
  2. second_priority
  3. IF condition THEN action ELSE alternative
  4. REMAINING → destination
```

### 3.4 Precedence & Override Mechanics

This is crucial—credit agreements are full of "notwithstanding" and "subject to" language.

```
PRECEDENCE (low to high):
1. General prohibitions (PROHIBIT)
2. Enumerated exceptions (EXCEPT)
3. Basket permissions (if conditions met)
4. Specific carve-outs (EXCEPT ... NOTWITHSTANDING)
5. NOTWITHSTANDING clauses (explicit override)
6. Amendment provisions (supersede original)
```

**Resolution logic:**
```
EVALUATE action:
  1. Find all applicable rules
  2. Sort by precedence
  3. Highest precedence rule wins
  4. Return: PERMITTED | PROHIBITED | CONDITIONAL(missing_requirements)
```

### 3.5 Cross-References & Composition

Agreements are full of internal references. The language must support:

```
// Reference another definition
DEFINE TotalDebt AS FundedDebt + CapitalLeases

// Reference another covenant's compliance
CONDITION ProFormaCompliant AS
  COMPLIANT(MaxLeverage) AND COMPLIANT(MinDSCR)

// Import from standard library
IMPORT Waterfall.Standard
IMPORT Covenants.Leverage
```

---

## 4. Architecture

### 4.1 High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         SOURCE FILES                            │
├─────────────────────────────────────────────────────────────────┤
│  deal.crl          Main credit agreement logic                  │
│  amendments/       Amendment files (versioned)                  │
│  stdlib/           Standard library (common patterns)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ PARSE
┌─────────────────────────────────────────────────────────────────┐
│                      ABSTRACT SYNTAX TREE                       │
├─────────────────────────────────────────────────────────────────┤
│  Definitions, Covenants, Baskets, Conditions, etc.              │
│  Validated: no undefined references, type checking              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ COMPILE
┌─────────────────────────────────────────────────────────────────┐
│                       EXECUTABLE MODEL                          │
├─────────────────────────────────────────────────────────────────┤
│  Dependency graph of all definitions                            │
│  Rule engine (precedence-aware)                                 │
│  State machine (phases, milestones)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ RUNTIME
┌─────────────────────────────────────────────────────────────────┐
│                          RUNTIME                                │
├─────────────────────────────────────────────────────────────────┤
│  + Financial data (JSON/CSV)                                    │
│  + Transaction history (ledger)                                 │
│  + Current state (phase, utilization)                           │
│  → Queries, simulations, compliance checks                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ OUTPUT
┌─────────────────────────────────────────────────────────────────┐
│                          OUTPUTS                                │
├─────────────────────────────────────────────────────────────────┤
│  Compliance reports (with section citations)                    │
│  Basket utilization dashboard                                   │
│  Simulation results                                             │
│  Audit trail / history                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Breakdown

**Parser**
- Input: `.crl` source files (CreditLang)
- Output: AST
- Technology options:
  - Tree-sitter (fast, good editor support)
  - PEG.js / Peggy (JavaScript, easy prototyping)
  - ANTLR (mature, multi-language targets)
  - Hand-written recursive descent (full control)
- Recommendation for MVP: **Peggy (PEG.js successor)** — fast iteration, JS ecosystem

**Semantic Analyzer**
- Validates AST
- Resolves cross-references
- Type checking
- Builds dependency graph
- Detects circular definitions

**Compiler**
- Transforms AST into executable form
- Options:
  - Compile to Rego (Open Policy Agent) — policy evaluation engine
  - Compile to Datalog — logic programming, good for recursive queries
  - Custom interpreter — full control, but more work
  - Compile to TypeScript — leverage existing ecosystem
- Recommendation for MVP: **Custom TypeScript interpreter** — simplest path, can optimize later

**Runtime**
- Loads compiled model
- Ingests financial data
- Maintains state (ledger, phase, utilization)
- Executes queries
- Key operations:
  - `evaluate(definition)` → computed value
  - `check(covenant)` → compliant/breach
  - `available(basket)` → remaining capacity
  - `simulate(transaction)` → pro forma results
  - `permitted(action)` → yes/no with reasoning

**Ledger / State Store**
- Tracks all transactions against baskets
- Immutable append-only log
- Each entry: timestamp, basket, amount, description, approval_ref
- Enables: historical queries, audit trail, undo via compensating entries

### 4.3 Data Interfaces

**Financial Data Input (quarterly compliance):**
```json
{
  "period_end": "2024-09-30",
  "financials": {
    "revenue": 142000000,
    "ebitda": 38500000,
    "net_income": 22000000,
    "interest_expense": 8200000,
    "capex": 12000000,
    "funded_debt": 156000000,
    "cash": 28400000,
    "total_assets": 340000000
  },
  "adjustments": {
    "extraordinary_items": 1500000,
    "non_cash_charges": 3200000
  }
}
```

**Transaction Input (proposed action):**
```json
{
  "type": "acquisition",
  "amount": 30000000,
  "funding_source": "revolver",
  "target": "TargetCo LLC",
  "same_line_of_business": true,
  "proposed_date": "2024-11-15"
}
```

**Query Output:**
```json
{
  "query": "CHECK Acquisition(30M)",
  "result": "PERMITTED",
  "reasoning": [
    {
      "rule": "PermittedAcquisitions",
      "cite": "Section 7.02(g)",
      "evaluation": "amount <= $75M threshold: PASS"
    },
    {
      "rule": "ProFormaCompliance",
      "cite": "Section 7.02(g)(iv)",
      "evaluation": "pro forma leverage 4.12x <= 4.50x: PASS"
    },
    {
      "rule": "NoDefault",
      "cite": "Section 7.02(g)(i)",
      "evaluation": "no existing default: PASS"
    }
  ],
  "basket_impact": {
    "GeneralInvestmentBasket": {
      "before": 43200000,
      "after": 13200000
    }
  },
  "warnings": []
}
```

### 4.4 File Structure

```
/deal-name/
├── main.crl                 # Primary agreement logic
├── definitions.crl          # Defined terms (can split out)
├── covenants/
│   ├── financial.crl
│   └── negative.crl
├── baskets.crl
├── amendments/
│   ├── 001_2024-06-15.crl   # First amendment
│   └── 002_2024-09-01.crl   # Second amendment
├── data/
│   ├── q1_2024.json
│   ├── q2_2024.json
│   └── q3_2024.json
├── ledger.json              # Transaction history
└── state.json               # Current phase, utilization snapshot
```

---

## 5. Standard Library

Pre-built components for common patterns:

### 5.1 Common Definitions

```
// stdlib/definitions/ebitda.crl
DEFINE ConsolidatedEBITDA.Standard AS
  ConsolidatedNetIncome
  + InterestExpense
  + IncomeTaxExpense
  + Depreciation
  + Amortization
  EXCLUDING ExtraordinaryItems
  EXCLUDING NonCashCharges  // optional add-back
```

### 5.2 Common Covenants

```
// stdlib/covenants/leverage.crl
TEMPLATE Covenant.MaxLeverage(ratio, frequency)
  COVENANT MaxLeverage
    REQUIRES TotalDebt / EBITDA <= {ratio}
    TESTED {frequency}
```

### 5.3 Waterfall Templates

```
// stdlib/waterfall/project_finance_standard.crl
TEMPLATE Waterfall.ProjectFinance
  1. OM_Expenses
  2. Senior_Debt_Service
  3. DSRA_Replenishment TO target
  4. MajorMaintenance_Reserve TO target
  5. Subordinated_Debt_Service
  6. IF DSCR >= distribution_threshold
     THEN Distributions
     ELSE CashTrap
```

### 5.4 Project Finance Modules

```
// stdlib/project_finance/
├── phases.crl           # Construction/COD/Operations state machine
├── milestones.crl       # Milestone tracking with longstops
├── draw_requests.crl    # CP checklist for construction draws
├── reserves.crl         # DSRA, O&M, MajorMaintenance patterns
└── ie_approval.crl      # Independent Engineer workflow
```

---

## 6. Hard Problems & Edge Cases

### 6.1 Ambiguity in Legal Language

**Problem:** Lawyers draft with deliberate ambiguity ("material," "reasonable").

**Approach:**
- Some terms must be parameterized at runtime:
  ```
  DEFINE MaterialContract AS
    contract WHERE value >= THRESHOLD(materiality)
  
  // At runtime:
  SET THRESHOLD(materiality) = $5_000_000
  ```
- For true judgment calls, the system returns `REQUIRES_JUDGMENT` with the relevant factors:
  ```
  CHECK Acquisition
  >> REQUIRES_JUDGMENT: "same line of business" determination
  >> Factors to consider: [SIC codes, revenue mix, customer overlap]
  >> If YES → PERMITTED
  >> If NO → PROHIBITED
  ```

### 6.2 Circular Definitions

**Problem:** Definition A references B, B references A.

**Approach:**
- Semantic analyzer detects cycles
- Error at compile time with clear message
- Force author to break the cycle

### 6.3 Temporal Complexity

**Problem:** "Trailing 12 months" "as of the last day of the fiscal quarter" "within 365 days of"

**Approach:**
- First-class date/time arithmetic
- Built-in functions:
  ```
  TRAILING(12 MONTHS, EBITDA)              // TTM
  AS_OF(quarter_end, TotalDebt)            // point-in-time
  WITHIN(365 DAYS, asset_sale_proceeds)    // builder basket timing
  ```
- Calendar awareness (business days, fiscal periods)

### 6.4 Pro Forma Calculations

**Problem:** "Giving pro forma effect to the proposed transaction..."

**Approach:**
- `PROFORMA` operator creates a hypothetical state:
  ```
  PROFORMA(acquisition(30M, funded_by: revolver))
    CHECK MaxLeverage
  ```
- Under the hood:
  1. Clone current financial state
  2. Apply transaction effects
  3. Evaluate covenant
  4. Return result without persisting changes

### 6.5 Basket Reclassification

**Problem:** Many agreements allow reclassifying usage between baskets after the fact.

**Approach:**
- Ledger entries can be reclassified:
  ```
  RECLASSIFY transaction_id FROM GeneralBasket TO AcquisitionBasket
  ```
- Audit trail shows original and reclassification
- System recomputes capacity as of each point in time

### 6.6 Amendment Layering

**Problem:** Amendment 3 modifies language added by Amendment 1, which modified the original.

**Approach:**
- Amendments are overlays, applied in order
- Each amendment file specifies:
  ```
  AMENDMENT 3
  EFFECTIVE 2024-09-01
  
  REPLACES COVENANT MaxLeverage WITH
    REQUIRES TotalDebt / EBITDA <= 5.00  // loosened from 4.50
  
  ADDS BASKET NewBasket
    CAPACITY $10_000_000
  
  DELETES CONDITION OldCondition
  ```
- Version history preserved; can query as of any point

### 6.7 Cross-Default Complexity

**Problem:** Cross-default provisions reference external agreements.

**Approach:**
- External state as inputs:
  ```
  EXTERNAL other_facility_default: Boolean
  EXTERNAL material_judgment: Currency
  
  EVENT CrossDefault
    TRIGGERS WHEN other_facility_default = true
    OR material_judgment > $10_000_000
  ```
- System prompts for these values or integrates with external data source

### 6.8 Cure Rights & Grace Periods

**Problem:** Breach ≠ Default. There are cure periods, equity cure rights, limited cure uses.

**Approach:**
- Model the state machine:
  ```
  COVENANT MaxLeverage
    BREACH → UnmaturedDefault
    CURE_PERIOD 30 DAYS
    CURE_MECHANISM EquityCure
      MAX_USES 3 OVER life_of_facility
      MAX_AMOUNT LesserOf(breach_shortfall, $20_000_000)
    UNCURED → EventOfDefault
  ```

---

## 7. MVP Scope

### 7.1 MVP Feature Set

**In Scope:**
- [ ] Core parser for basic syntax
- [ ] DEFINE statements with arithmetic
- [ ] Financial covenants (ratio-based)
- [ ] Simple baskets (fixed capacity)
- [ ] NoDefault condition
- [ ] LOAD financial data from JSON
- [ ] CHECK covenant compliance
- [ ] AVAILABLE basket query
- [ ] SIMULATE transaction (pro forma)
- [ ] Basic CLI interface
- [ ] Citation tracking (which rule produced this result)

**Deferred to v0.2:**
- [ ] Grower/builder baskets
- [ ] Cure rights mechanics
- [ ] Amendment overlays
- [ ] Project finance phases/milestones
- [ ] Waterfall execution
- [ ] Web UI dashboard
- [ ] Multi-party access control

**Deferred to v1.0:**
- [ ] Full project finance module
- [ ] Integration with accounting systems
- [ ] Notification/alerting
- [ ] API for external systems
- [ ] Diff/compare between agreements
- [ ] Natural language query interface

### 7.2 MVP Deliverables

1. **Grammar specification** (Peggy PEG file)
2. **Parser** → AST
3. **Interpreter** (TypeScript)
4. **CLI tool**: `creditlang check deal.crl --data q3.json`
5. **Sample deal file** (simplified corporate revolver)
6. **Test suite** (known scenarios with expected outputs)
7. **Documentation** (syntax reference, getting started)

### 7.3 Sample MVP Deal File

```
// simple_revolver.crl

DEFINE EBITDA AS
  net_income + interest + taxes + depreciation + amortization

DEFINE TotalDebt AS
  funded_debt + capital_leases

DEFINE Leverage AS
  TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

COVENANT MinInterestCoverage
  REQUIRES EBITDA / interest >= 2.50
  TESTED QUARTERLY

BASKET GeneralInvestments
  CAPACITY $25_000_000

BASKET RestrictedPayments
  CAPACITY GreaterOf($10_000_000, 5% OF total_assets)

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault)

PROHIBIT Investments
  EXCEPT WHEN
    | amount <= AVAILABLE(GeneralInvestments)
    | AND NoDefault

PROHIBIT Dividends
  EXCEPT WHEN
    | amount <= AVAILABLE(RestrictedPayments)
    | AND NoDefault
    | AND COMPLIANT(MaxLeverage) PROFORMA
```

---

## 8. Open Questions

### Language Design

1. **Syntax for "including but not limited to"** — How to represent non-exhaustive lists?
   - Option A: `INCLUDING [item1, item2, ...]` implies non-exhaustive
   - Option B: Explicit `INCLUDING_WITHOUT_LIMITATION [...]`

2. **Handling "material" and other judgment terms** — Parameterize? Flag for human review?

3. **Error messages** — What does a "compile error" look like for a lawyer? Need domain-appropriate messaging.

4. **Comments and annotations** — Allow prose explanations alongside logic? Section references?
   ```
   // Section 7.02(a) - Limitation on Indebtedness
   PROHIBIT Indebtedness
     ...
   ```

### Architecture

5. **Hosting model** — Local CLI? Cloud service? Embedded in existing legal tech?

6. **Collaboration** — Multiple people editing same deal file? Git-based workflow?

7. **Data integration** — Manual JSON upload? Connect to ERP/accounting? Bank feeds?

8. **Access control** — Different views for borrower vs lender? Sensitive terms?

### Business

9. **Who authors the CreditLang file?** — Outside counsel as part of closing? Borrower's team? Third-party service?

10. **Liability** — If the tool says "permitted" and it's wrong, who's responsible? Needs clear disclaimers.

11. **Moat** — Is the value in the language, the tooling, or the library of encoded agreements?

12. **Pricing model** — Per deal? Per query? Subscription? Part of legal fee?

---

## 9. Implementation Roadmap

### Phase 1: Proof of Concept (2-3 weeks)

- [ ] Define grammar (Peggy PEG)
- [ ] Build parser → AST
- [ ] Simple interpreter for DEFINE, COVENANT
- [ ] CLI: `creditlang eval file.crl`
- [ ] Test with one real (simplified) credit agreement
- [ ] Validate with domain expert (Will) that output matches manual analysis

**Exit criteria:** Can answer "what's my leverage ratio?" and "am I in compliance?" for a simple deal.

### Phase 2: Core Features (4-6 weeks)

- [ ] Basket tracking with ledger
- [ ] PROHIBIT/EXCEPT logic with precedence
- [ ] SIMULATE/PROFORMA queries
- [ ] Multiple data periods (trend analysis)
- [ ] Section citations in output
- [ ] Error handling and validation
- [ ] Test suite with edge cases

**Exit criteria:** Can model a real-world corporate credit agreement end-to-end.

### Phase 3: Project Finance (4-6 weeks)

- [ ] Phase state machine
- [ ] Milestone tracking
- [ ] CP checklists
- [ ] Waterfall execution
- [ ] Reserve account logic
- [ ] Project finance sample deal

**Exit criteria:** Can model a real project finance deal with construction → COD → operations.

### Phase 4: Productization (6-8 weeks)

- [ ] Web UI dashboard
- [ ] Amendment overlay system
- [ ] Multi-deal management
- [ ] User authentication
- [ ] API endpoints
- [ ] Documentation site
- [ ] Standard library of common patterns

**Exit criteria:** Usable product that can be demoed to potential customers.

---

## 10. Technical Recommendations

### Language / Framework

- **Parser:** Peggy (JavaScript PEG parser generator)
- **Interpreter/Runtime:** TypeScript
- **CLI:** Commander.js or similar
- **Web UI (later):** React + Next.js
- **Data store:** SQLite for MVP (ledger, state); PostgreSQL for production

### File Extension

- `.crl` — CreditLang (or `.creditlang` if we're being explicit)

### Development Approach

1. **Test-driven:** Write expected outputs first, then implement
2. **Iterate with real agreements:** Keep validating against actual credit docs
3. **Domain expert in loop:** Will reviews every design decision

---

## 11. Success Metrics

### MVP Success

- [ ] Can parse and evaluate a 100-line credit agreement file
- [ ] Correctly answers 10 compliance queries that match manual analysis
- [ ] Domain expert (BigLaw attorney) validates accuracy
- [ ] Execution time < 1 second for typical queries

### Product Success (Future)

- [ ] Time-to-answer for "can we do X?" reduced from days → minutes
- [ ] Admin agent headcount reduction or reallocation
- [ ] Zero basket tracking errors over 12-month period
- [ ] Adoption by 3+ law firms or corporates

---

## 12. Appendix: Syntax Cheat Sheet

```
// ===== DEFINITIONS =====
DEFINE Name AS expression

// ===== COVENANTS =====
COVENANT Name
  REQUIRES condition
  TESTED frequency
  [CURE mechanics]
  [BREACH → consequence]

// ===== BASKETS =====
BASKET Name
  CAPACITY amount
  [PLUS growth/builder]
  [SUBJECT TO conditions]

// ===== PROHIBITIONS =====
PROHIBIT action
  EXCEPT WHEN conditions
  [NOTWITHSTANDING override]

// ===== CONDITIONS =====
CONDITION Name AS boolean_expression

// ===== EVENTS =====
EVENT Name
  TRIGGERS WHEN condition
  [GRACE_PERIOD duration]
  CONSEQUENCE effect

// ===== PROJECT FINANCE =====
PHASE Name
  STARTS trigger
  ENDS trigger

MILESTONE Name
  DUE date
  [LONGSTOP date → consequence]
  [REQUIRES conditions]
  [TRIGGERS effects]

WATERFALL Name
  1. priority_1
  2. priority_2
  ...

// ===== RUNTIME =====
LOAD "file.json"
CHECK CovenantName
AVAILABLE(BasketName)
SIMULATE transaction
STATUS
HISTORY metric
```

---

*Document version: 0.1*
*Last updated: January 2025*
*Author: Planning session with Will (domain expert) and Claude*
