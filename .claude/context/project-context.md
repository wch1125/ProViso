# ProViso Project Context

## What This Project Is

ProViso is a domain-specific language that makes credit agreements executable. Instead of PDFs that require expensive legal memos to interpret, ProViso files are programs that can answer compliance questions instantly.

**Current Version:** 2.0.0 (Production Ready)
**Test Coverage:** 470 tests passing

### The Problem We're Solving

1. **"Can we do X?" questions** cost $50K and 2 weeks for a legal memo
2. **Basket tracking** is manual Excel work, error-prone
3. **Covenant compliance** requires quarterly scrambles
4. **Pro forma analysis** for M&A/financing is slow and uncertain

### The Solution

A DSL where credit agreements are code:
- Source reads like the legal document
- But executes like a program
- Answers questions with citations
- Tracks basket utilization automatically
- Simulates transactions instantly

## Domain Terminology

| Term | Meaning |
|------|---------|
| **Covenant** | A financial test the borrower must pass (e.g., leverage ratio ≤ 4.5x) |
| **Basket** | Permitted capacity for a restricted action (e.g., $25M for investments) |
| **EBITDA** | Earnings Before Interest, Taxes, Depreciation, Amortization |
| **Leverage** | Total Debt / EBITDA - measures how indebted the company is |
| **Pro Forma** | "As if" - calculations assuming a proposed transaction happened |
| **Event of Default** | A trigger that lets lenders accelerate the loan |
| **Grower Basket** | Capacity that grows with company size (% of EBITDA or assets) |
| **Builder Basket** | Capacity that accumulates over time (retained earnings, asset sale proceeds) |
| **Milestone** | Construction progress checkpoint with target and longstop dates |
| **Reserve** | Escrow account for debt service, maintenance, etc. |
| **Waterfall** | Priority-ordered distribution of project cash flows |
| **Conditions Precedent** | Requirements that must be met before a draw |

## Technical Decisions

### Parser: Peggy (PEG)
- Chose PEG over alternatives (ANTLR, nearley) for:
  - Simple JavaScript integration
  - Readable grammar syntax
  - Good error messages
  - Single-file output

### Runtime: TypeScript
- Type safety for complex AST
- Good IDE support
- Easy async/await for future API work

### Dashboard: React + Vite
- TailwindCSS for premium dark theme
- Recharts for data visualization
- Lucide icons
- Code splitting with React.lazy()

### Persistence: In-Memory Store (MVP)
- StoreInterface abstraction for future PostgreSQL swap
- State lives in interpreter instance
- Financial data loaded from JSON

## Architecture Overview

```
.proviso file → [Peggy Parser] → AST → [Interpreter] → Results
                                         ↑
                              Financial Data (JSON)

Dashboard:
React SPA → [Hub API] → [Store] → InMemory / (Future: PostgreSQL)
                ↓
        [Versioning] → [Word Generator] → [Closing/PostClosing]
```

### Core Components
1. **Grammar** (`grammar/proviso.pegjs`) - PEG grammar producing AST
2. **Parser** (`src/parser.ts`) - Wrapper with TypeScript types
3. **Interpreter** (`src/interpreter.ts`) - Evaluates AST against financial data
4. **Types** (`src/types.ts`) - All TypeScript interfaces
5. **CLI** (`src/cli.ts`) - Command-line interface

### Hub Components (v2.0)
1. **Store** (`src/hub/store.ts`) - Persistence layer with CRUD operations
2. **API** (`src/hub/api.ts`) - Deal, version, party management
3. **Forms** (`src/hub/forms/`) - Form definitions and code generation
4. **Versioning** (`src/hub/versioning/`) - Diff, classify, changelog
5. **Word** (`src/hub/word/`) - Document generation, drift detection
6. **Closing** (`src/hub/closing/`) - CP, documents, signatures
7. **Post-Closing** (`src/hub/postclosing/`) - Submissions, draws, scenarios

## What's Complete

### v0.1-v0.2 Core
- DEFINE with arithmetic and modifiers (EXCLUDING, CAPPED AT)
- COVENANT with comparison operators and cure rights
- BASKET (fixed, grower with FLOOR, builder with BUILDS_FROM)
- CONDITION with boolean logic
- PROHIBIT/EXCEPT with condition checking
- EVENT with triggers
- Amendment overlay system

### v0.3 Multi-Period
- TRAILING N QUARTERS/MONTHS/YEARS OF expr
- Multi-period financial data support
- Period-scoped evaluation (--as-of flag)
- Compliance history command

### v1.0 Project Finance
- Phase state machine with transitions
- Milestone tracking with longstops
- Reserve account management
- Waterfall execution with shortfall handling
- Conditions precedent checklists

### v2.0 Deal Hub
- Hub data models (Deal, Version, Party)
- In-memory store with full CRUD
- Form system with templates
- Versioning with diff and changelog
- Word document generation
- Closing dashboard (CP, docs, signatures)
- Post-closing dashboard (submissions, draws, scenarios)
- Premium React dashboard with all visualizations

## Files to Know

| File | Purpose |
|------|---------|
| `grammar/proviso.pegjs` | The grammar - start here for syntax |
| `src/types.ts` | All TypeScript interfaces |
| `src/interpreter.ts` | The runtime - evaluation logic |
| `src/hub/api.ts` | Hub API - deal management |
| `src/hub/store.ts` | Persistence layer |
| `dashboard/src/App.tsx` | Dashboard routes and layout |
| `examples/corporate_revolver.proviso` | Sample agreement to test against |
| `docs/GETTING_STARTED.md` | User documentation |

## Test Suites

| Suite | Tests | Purpose |
|-------|-------|---------|
| `proviso.test.ts` | 220 | Core language features |
| `hub.test.ts` | 45 | Deal, version, party management |
| `versioning.test.ts` | 42 | Diff and changelog |
| `forms.test.ts` | 36 | Form validation and generation |
| `word.test.ts` | 53 | Document generation |
| `closing.test.ts` | 38 | CP, documents, signatures |
| `postclosing.test.ts` | 27 | Submissions, draws, scenarios |
| `e2e.test.ts` | 9 | Full workflow integration |

## Development Patterns

### Adding a New Language Feature
1. Update `grammar/proviso.pegjs` with new syntax
2. Add types to `src/types.ts`
3. Implement evaluation in `src/interpreter.ts`
4. Add CLI support if needed in `src/cli.ts`
5. Write tests in `tests/proviso.test.ts`
6. Run `npm run build` to regenerate parser

### Adding a Hub Feature
1. Add types to `src/hub/types.ts` or module-specific types file
2. Implement API functions in relevant module
3. Add React components in `dashboard/src/components/`
4. Write tests in relevant test file
5. Update demo data if needed

### Code Splitting Strategy
- Vendor bundles: react, charts, icons separated
- Route-level lazy loading with React.lazy()
- Suspense fallback with loading spinner

## Open Questions (Resolved in v2.0)

### Language Design
- [x] How to handle "including but not limited to"? → Non-exhaustive lists in forms
- [x] How to flag "material" and other judgment terms? → Form system with human review
- [x] What should compile errors look like for lawyers? → Enhanced error messages

### Product
- [x] Who authors the ProViso file? → Form-based generation
- [x] Liability model if tool says "permitted" incorrectly? → Audit trail with versioning
- [x] Integration with existing legal tech? → Word document generation

## Future Considerations

### Potential v2.1 Features
- PostgreSQL persistence
- Multi-tenant authentication
- Real-time collaboration
- Integration with iManage/NetDocs
- API for external systems

### Performance Notes
- Main bundle reduced from 659KB to 105KB via code splitting
- Route-level lazy loading for on-demand page loads
- In-memory store sufficient for current scale
