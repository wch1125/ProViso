# CLAUDE.md - ProViso Project

## Project Overview

ProViso is a domain-specific language (DSL) for expressing credit agreements as executable logic. Source files read like legal documents but run like programs—answering compliance questions, tracking basket utilization, and simulating proposed transactions.

## Quick Reference

### Build & Run
```bash
npm install              # Install dependencies
npm run build            # Build grammar + TypeScript
npm run build:grammar    # Build Peggy grammar only
npm test                 # Run test suite
npm run dev -- status examples/corporate_revolver.proviso -d examples/q3_2024_financials.json
```

### Key Directories
- `grammar/` - PEG grammar definition (proviso.pegjs)
- `src/` - TypeScript source code
- `examples/` - Sample .proviso files and financial data
- `tests/` - Vitest test suite
- `.claude/` - Workflow system (prompts, logs, status)

### Tech Stack
- **Parser:** Peggy (PEG parser generator)
- **Runtime:** TypeScript / Node.js 18+
- **CLI:** Commander.js
- **Tests:** Vitest
- **Linting:** ESLint + Prettier

## Architecture

```
.proviso file → [Peggy Parser] → AST → [Interpreter] → Results
                                         ↑
                              Financial Data (JSON)
```

### Core Components
1. **Grammar** (`grammar/proviso.pegjs`) - PEG grammar producing AST
2. **Parser** (`src/parser.ts`) - Wrapper with TypeScript types
3. **Interpreter** (`src/interpreter.ts`) - Evaluates AST against financial data
4. **Types** (`src/types.ts`) - All TypeScript interfaces
5. **CLI** (`src/cli.ts`) - Command-line interface

### Language Constructs

#### Core (v0.1-v0.2)
- `DEFINE` - Computed values (EBITDA, TotalDebt, ratios)
- `TRAILING N QUARTERS/MONTHS/YEARS OF expr` - Period-based calculations (v0.3)
- `COVENANT` - Financial tests with thresholds and optional CURE clause
- `BASKET` - Capacity limits (fixed, grower with FLOOR, builder with BUILDS_FROM)
- `CONDITION` - Reusable boolean expressions
- `PROHIBIT/EXCEPT` - Negative covenants with exceptions
- `EVENT` - Default triggers and consequences
- `AMENDMENT` - Overlay changes (REPLACES, ADDS, DELETES, MODIFIES)

#### Project Finance (v1.0)
- `PHASE` - Project phases with UNTIL, FROM, COVENANTS SUSPENDED/ACTIVE, REQUIRED
- `TRANSITION` - Phase transition conditions with ALL_OF, ANY_OF
- `MILESTONE` - Construction milestones with TARGET, LONGSTOP, TRIGGERS, REQUIRES
- `RESERVE` - Reserve accounts with TARGET, MINIMUM, FUNDED_BY, RELEASED_TO/FOR
- `WATERFALL` - Cash distribution with TIER, PAY, FROM, UNTIL, SHORTFALL, IF
- `CONDITIONS_PRECEDENT` - Draw checklists with CP items

#### Industry Constructs (v2.1)
- `TECHNICAL_MILESTONE` - Quantitative progress tracking (MW installed, panels tested)
- `REGULATORY_REQUIREMENT` - Permit and approval tracking by agency/phase
- `PERFORMANCE_GUARANTEE` - P50/P75/P90/P99 probability exceedance thresholds
- `DEGRADATION_SCHEDULE` - Asset degradation curves (solar panels, batteries)
- `SEASONAL_ADJUSTMENT` - Seasonal factors for metrics (winter/summer production)
- `TAX_EQUITY_STRUCTURE` - Partnership flip, sale-leaseback structures
- `TAX_CREDIT` - ITC/PTC with adders (domestic content, energy community)
- `DEPRECIATION_SCHEDULE` - MACRS 5yr/7yr with bonus depreciation
- `FLIP_EVENT` - Target return triggers with allocation changes

## Development Patterns

### Adding a New Language Feature
1. Update `grammar/proviso.pegjs` with new syntax
2. Add types to `src/types.ts`
3. Implement evaluation in `src/interpreter.ts`
4. Add CLI support if needed in `src/cli.ts`
5. Write tests in `tests/proviso.test.ts`
6. Run `npm run build` to regenerate parser

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### Code Quality
```bash
npm run typecheck        # TypeScript checking
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier formatting
```

## Current Status

**Version:** 2.1.0

**Working:**
- Core parser for all MVP constructs
- Expression evaluation with arithmetic
- Covenant compliance checking
- Basket capacity and utilization (fixed, grower, builder)
- Prohibition checking with exceptions
- Pro forma simulation
- Semantic validation
- Grower baskets (CAPACITY with FLOOR)
- Builder baskets (BUILDS_FROM, STARTING, MAXIMUM)
- Basket ledger with transaction history
- Cure rights mechanics (EquityCure, PaymentCure, MAX_USES, MAX_AMOUNT, CURE_PERIOD)
- Amendment overlay system (REPLACES, ADDS, DELETES, MODIFIES)
- CLI with status reports and amendment support
- **v0.3: Multi-period financial data support**
- **v0.3: Trailing period calculations (TRAILING N QUARTERS/MONTHS/YEARS OF expr)**
- **v0.3: Period-scoped evaluation (--as-of flag)**
- **v0.3: Compliance history command**
- **v1.0: Phase state machine with phase-aware covenant checking**
- **v1.0: Milestone tracking with longstops and prerequisites**
- **v1.0: Reserve account management (funding, draws, minimums)**
- **v1.0: Waterfall execution with shortfall handling and distribution gates**
- **v1.0: Conditions precedent checklists with draw eligibility**
- **v1.0: Premium React Dashboard with all project finance visualizations**
- **v2.1: Industry-specific constructs for solar, wind, data centers**
- **v2.1: Technical milestone tracking with quantitative progress**
- **v2.1: Regulatory requirement tracking by agency and phase**
- **v2.1: Performance guarantees with P50/P75/P90/P99 thresholds**
- **v2.1: Degradation schedules for asset performance modeling**
- **v2.1: Seasonal adjustments for production variability**
- **v2.1: Tax equity structures (partnership flip, ITC, PTC)**
- **v2.1: MACRS depreciation with bonus depreciation**
- **v2.1: Flip event tracking with allocation changes**
- **v2.1: Dashboard industry analytics (4 new components)**

### Dashboard
```bash
npm run dashboard        # Start dev server on http://localhost:3000
npm run dashboard:build  # Production build to dashboard/dist/
npm run dashboard:preview # Preview production build
```

## CLI Commands (16 total)

| Command | Description |
|---------|-------------|
| `parse` | Parse .proviso file and output AST |
| `validate` | Syntax and semantic validation |
| `check` | Covenant compliance check |
| `baskets` | Basket utilization |
| `simulate` | Pro forma simulation |
| `status` | Full compliance report |
| `query` | Prohibition checking |
| `accumulate` | Builder basket accumulation |
| `ledger` | Basket transaction history |
| `cure` | Apply cure to breached covenant |
| `amendments` | List applied amendments |
| `history` | Compliance history across periods |
| `phase` | Current phase and transition status |
| `milestones` | Construction milestone tracking |
| `reserves` | Reserve account status |
| `waterfall` | Execute waterfall distribution |
| `draw` | Check conditions precedent |

## Workflow System

This project uses a multi-role Claude workflow. See `.claude/prompts/` for role definitions:
- **Scout** - Reconnaissance before building
- **Builder** - Implementation
- **Tester** - Test coverage
- **Reviewer** - Code review
- **PM** - Planning and coordination
- **Refactorer** - Code improvement
- **Documentarian** - Documentation

Session logs go in `.claude/logs/`, current status in `.claude/status/`.

## Domain Context

This is a legal tech tool for credit agreement compliance. Key concepts:
- **Covenants** - Financial tests borrowers must pass (leverage ratios, coverage ratios)
- **Baskets** - Permitted capacity for restricted actions (investments, dividends)
- **Events of Default** - Triggers that can accelerate loan obligations
- **Pro Forma** - "As if" calculations showing impact of proposed transactions
- **Milestones** - Construction progress checkpoints with target and longstop dates
- **Reserves** - Escrow accounts for debt service, maintenance, etc.
- **Waterfall** - Priority-ordered distribution of project cash flows
- **Conditions Precedent** - Requirements that must be met before a draw

### Industry-Specific (v2.1)
- **Technical Milestones** - Quantitative construction progress (MW installed, panels tested)
- **Regulatory Requirements** - Permits tracked by agency, type, and required phase
- **Performance Guarantees** - Production commitments at probability exceedance levels (P50-P99)
- **Degradation** - Scheduled capacity decline (Year 1 vs. ongoing degradation rates)
- **Seasonal Adjustments** - Production factors by season (Q1-Q4 or monthly)
- **Tax Equity** - Partnership flip structures with investor/sponsor allocations
- **Tax Credits** - ITC (investment), PTC (production), 45X with bonus adders
- **Depreciation** - MACRS 5yr/7yr schedules with bonus depreciation
- **Flip Events** - Target IRR or date-certain triggers changing allocations

The syntax mirrors credit agreement language intentionally—lawyers should be able to read .proviso files.
