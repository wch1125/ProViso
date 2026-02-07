# ProViso

**Domain-Specific Language for Credit Agreements**

ProViso is an executable DSL that allows credit agreements to be expressed as code. The source files read like legal documents but run like programs—answering compliance questions, tracking basket utilization, and simulating proposed transactions.

**Version 2.6** | **679 Tests Passing** | **Live Demo: [proviso-demo.haslun.online](https://proviso-demo.haslun.online)**

---

## What ProViso Does

| Traditional Approach | ProViso Approach |
|---------------------|---------------------|
| "Can we do X?" costs $50K and 2 weeks | Instant answer with citation |
| Basket tracking is manual Excel | Automatic ledger with audit trail |
| Covenant compliance is quarterly scramble | Real-time monitoring dashboard |
| Pro forma for M&A is slow and uncertain | Simulate in seconds |

---

## Quick Start

```bash
# Install
npm install
npm run build

# Check compliance
npm run dev -- status examples/corporate_revolver.proviso -d examples/q3_2024_financials.json

# Run the dashboard
cd dashboard && npm install && cd ..
npm run dashboard
```

**Dashboard:** http://localhost:3000

---

## Example Output

```
╔══════════════════════════════════════════════════════════╗
║                   PROVISO STATUS REPORT                   ║
╚══════════════════════════════════════════════════════════╝

FINANCIAL COVENANTS
────────────────────────────────────────────────────────────
  ✓ MaxLeverage               3.60x <= 4.50x (headroom: 0.90x)
  ✓ MinInterestCoverage       5.45x >= 2.50x (headroom: 2.95x)
  ✓ MinLiquidity              $28.4M >= $15.0M

BASKET AVAILABILITY
────────────────────────────────────────────────────────────
  GeneralInvestments    [░░░░░░░░░░░░░░░░░░░░] $25.0M available
  RestrictedPayments    [░░░░░░░░░░░░░░░░░░░░] $17.0M available
  PermittedAcquisitions [░░░░░░░░░░░░░░░░░░░░] $75.0M available

════════════════════════════════════════════════════════════
OVERALL STATUS: ✓ COMPLIANT
════════════════════════════════════════════════════════════
```

---

## Feature Overview

### Core Language (v0.1-v0.3)

| Feature | Description |
|---------|-------------|
| **DEFINE** | Computed values (EBITDA, TotalDebt, ratios) |
| **TRAILING** | Period calculations (TRAILING 4 QUARTERS OF EBITDA) |
| **COVENANT** | Financial tests with thresholds and cure rights |
| **BASKET** | Fixed, grower (scales with metrics), and builder (accumulates) |
| **CONDITION** | Reusable boolean expressions |
| **PROHIBIT/EXCEPT** | Negative covenants with exceptions |
| **EVENT** | Default triggers and consequences |
| **AMENDMENT** | Overlay changes (REPLACES, ADDS, DELETES, MODIFIES) |

### Project Finance Module (v1.0)

| Feature | Description |
|---------|-------------|
| **PHASE** | Project phases (Construction → COD → Operations) |
| **TRANSITION** | Phase transition conditions (ALL_OF, ANY_OF) |
| **MILESTONE** | Construction milestones with target/longstop dates |
| **RESERVE** | Reserve accounts (DSRA, Maintenance, etc.) |
| **WATERFALL** | Cash distribution with tiered priorities |
| **CONDITIONS_PRECEDENT** | Draw eligibility checklists |

### Deal Hub (v2.0)

| Feature | Description |
|---------|-------------|
| **Deal Management** | Create, track, and manage credit facilities |
| **Version Control** | Full version history with diff and changelog |
| **Form System** | Generate ProViso code from forms |
| **Word Integration** | Generate Word prose, detect drift |
| **Closing Dashboard** | CP tracking, documents, signatures |
| **Post-Closing** | Financial submissions, draws, scenarios |

---

## CLI Commands (17 total)

### Core Commands
```bash
npm run dev -- parse file.proviso        # Parse and output AST
npm run dev -- validate file.proviso     # Validate syntax/semantics
npm run dev -- check file.proviso        # Check covenant compliance
npm run dev -- status file.proviso       # Full status report
npm run dev -- query file.proviso action # Check if action is permitted
```

### Basket Commands
```bash
npm run dev -- baskets file.proviso      # Show basket utilization
npm run dev -- simulate file.proviso     # Pro forma simulation
npm run dev -- accumulate file.proviso   # Builder basket accumulation
npm run dev -- ledger file.proviso       # Transaction history
```

### Multi-Period Commands
```bash
npm run dev -- history file.proviso      # Compliance history
npm run dev -- check file.proviso --as-of 2026-Q1  # Point-in-time
```

### Project Finance Commands
```bash
npm run dev -- phase file.proviso        # Current phase status
npm run dev -- milestones file.proviso   # Milestone tracking
npm run dev -- reserves file.proviso     # Reserve account status
npm run dev -- waterfall file.proviso    # Execute waterfall
npm run dev -- draw file.proviso         # Check draw eligibility
```

### Amendment Commands
```bash
npm run dev -- amendments file.proviso   # List amendments
npm run dev -- cure file.proviso cov amt # Apply cure
```

All commands support:
- `-d, --data <file>` - Financial data JSON
- `-a, --amendments <files...>` - Amendment overlay files
- `--as-of <period>` - Evaluate as of specific period

---

## Language Syntax

### Definitions
```
DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation
  EXCLUDING extraordinary_items

DEFINE LTM_EBITDA AS
  TRAILING 4 QUARTERS OF EBITDA

DEFINE Leverage AS
  TotalDebt / LTM_EBITDA
```

### Covenants
```
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility MAX_AMOUNT $20_000_000
```

### Baskets
```
// Fixed capacity
BASKET GeneralInvestments
  CAPACITY $25_000_000

// Grower (scales with metrics)
BASKET PermittedAcquisitions
  CAPACITY GreaterOf($50_000_000, 15% * EBITDA)
  FLOOR $30_000_000

// Builder (accumulates over time)
BASKET AvailableAmount
  BUILDS_FROM RetainedExcessCashFlow
  STARTING $0
  MAXIMUM $100_000_000
```

### Project Finance
```
PHASE Construction
  UNTIL COD
  COVENANTS SUSPENDED MaxLeverage, MinCoverage
  REQUIRED Equity >= 30% * TotalProjectCost

MILESTONE MechanicalCompletion
  TARGET 2026-06-30
  LONGSTOP 2026-09-30
  TRIGGERS SubstantialCompletion

WATERFALL Monthly
  TIER 1: PAY DebtService FROM AvailableCash
  TIER 2: PAY TO DSRA UNTIL target
  TIER 3: PAY MaintenanceReserve IF month = 6
  TIER 4: PAY Distributions IF ProFormaCompliance
```

---

## Dashboard

The ProViso Dashboard provides a visual interface for the full deal lifecycle.

```bash
npm run dashboard        # Development server
npm run dashboard:build  # Production build
npm run dashboard:preview
```

### Routes

| Route | Purpose |
|-------|---------|
| `/deals` | Deal list and management |
| `/deals/:id/negotiate` | Negotiation Studio with version comparison |
| `/deals/:id/closing` | CP tracking, documents, signatures |
| `/deals/:id/monitor` | Post-closing compliance monitoring |

### Dashboard Features

**Negotiation Studio**
- Version timeline with send/receive workflow
- Side-by-side diff viewer with syntax highlighting
- Change classification (borrower/lender favorable)
- Form-based covenant and basket creation

**Closing Dashboard**
- Readiness meter with KPIs
- Conditions precedent checklist by category
- Document tracker with signature status
- Days-to-close countdown

**Monitoring Dashboard**
- Compliance trend charts
- Financial submission workflow
- Draw request pipeline
- Scenario simulator ("what if" analysis)

---

## Project Structure

```
proviso/
├── grammar/
│   └── proviso.pegjs        # PEG grammar definition
├── src/
│   ├── cli.ts                  # Command-line interface
│   ├── parser.ts               # Parser wrapper
│   ├── interpreter.ts          # Runtime evaluator
│   ├── types.ts                # Core type definitions
│   └── hub/                    # v2.0 Deal Hub
│       ├── api.ts              # Deal, version, party management
│       ├── store.ts            # Persistence layer
│       ├── forms/              # Form system
│       ├── versioning/         # Diff and changelog
│       ├── word/               # Word integration
│       ├── closing/            # Closing workflow
│       └── postclosing/        # Post-closing workflow
├── dashboard/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Route pages
│   │   └── data/               # Demo data
│   └── vite.config.ts          # Build configuration
├── examples/
│   ├── corporate_revolver.proviso  # Sample credit agreement
│   ├── project_finance.proviso     # Project finance example
│   └── *.json                  # Financial data files
├── tests/
│   ├── proviso.test.ts      # Core tests (220)
│   ├── hub.test.ts             # Hub API tests (45)
│   ├── versioning.test.ts      # Versioning tests (42)
│   ├── forms.test.ts           # Form tests (36)
│   ├── word.test.ts            # Word integration tests (53)
│   ├── closing.test.ts         # Closing tests (38)
│   ├── postclosing.test.ts     # Post-closing tests (27)
│   └── e2e.test.ts             # End-to-end tests (9)
└── docs/
    └── GETTING_STARTED.md      # User guide
```

---

## Development

```bash
# Build
npm run build              # Full build
npm run build:grammar      # Grammar only
npm run build:ts           # TypeScript only

# Test
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Quality
npm run typecheck          # TypeScript checking
npm run lint               # ESLint
npm run lint:fix           # Auto-fix
npm run format             # Prettier
```

---

## Version History

### v2.1.0 (Current) - Production Ready
- Deal Hub with full lifecycle management
- Version control with diff and changelog
- Form-based code generation
- Word document integration
- Closing and post-closing dashboards
- Industry-specific constructs (solar, wind, data center)
- Performance guarantees, regulatory tracking, tax equity
- 530 tests passing

### v1.0.0 - Project Finance
- Phase state machine
- Milestone tracking with longstops
- Reserve account management
- Waterfall execution
- Conditions precedent

### v0.3.0 - Multi-Period
- Trailing period calculations
- Multi-period financial data
- Compliance history

### v0.2.0 - Enhanced Baskets
- Grower and builder baskets
- Cure rights mechanics
- Amendment overlay system
- Basket ledger

### v0.1.0 - Core MVP
- PEG grammar parser
- Covenant compliance checking
- Fixed baskets
- Pro forma simulation

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Parser | Peggy (PEG parser generator) |
| Runtime | TypeScript / Node.js 18+ |
| CLI | Commander.js |
| Dashboard | React + Vite + TailwindCSS |
| Charts | Recharts |
| Tests | Vitest |

---

## License

MIT

## Author

Haslun Studio
