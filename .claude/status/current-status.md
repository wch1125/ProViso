# Current Project Status

**Last Updated:** 2026-02-05
**Version:** 2.3.0-alpha
**Phase:** v2.3 Public Demo - Phase 1 & 2 In Progress

## Overall Status: Green - All Tests Passing (530 tests)

TypeScript build passes. Lint has 9 warnings (acceptable, related to dynamic template handling).

ProViso v1.0 is complete with the Project Finance Module backend and the Premium React Dashboard.

## What's Done

### Infrastructure
- [x] Package.json with all dependencies
- [x] TypeScript configuration
- [x] Vitest test setup
- [x] ESLint 9 flat config
- [x] Prettier config
- [x] ES Module support (`"type": "module"`)

### Core Components (v0.1)
- [x] PEG grammar (`grammar/proviso.pegjs`)
- [x] Type definitions (`src/types.ts`)
- [x] Parser wrapper (`src/parser.ts`)
- [x] Interpreter (`src/interpreter.ts`)
- [x] CLI (`src/cli.ts`)
- [x] Main exports (`src/index.ts`)

### v0.2 Features
- [x] **Grower Baskets** - Capacity that scales with financial metrics
- [x] **Builder Baskets** - Capacity that accumulates over time
- [x] **Semantic Validation** - Pre-runtime validation
- [x] **Enhanced Error Messages** - Rich parser error information
- [x] **Cure Rights Mechanics** - Handle covenant breaches
- [x] **Amendment Overlay System** - Modify agreements over time
- [x] **Basket Ledger CLI** - View transaction history

### v0.3 - Multi-Period & Trailing (COMPLETE)
- [x] Trailing period calculations (TRAILING N QUARTERS/MONTHS/YEARS OF expr)
- [x] Multi-period financial data support (PeriodData, MultiPeriodFinancialData)
- [x] Period-based covenant testing (--as-of flag)
- [x] Historical compliance tracking (history command)
- [x] Backward compatible with simple data format

### v1.0 - Project Finance Module (COMPLETE)
- [x] **Phase State Machine**
  - PHASE statements with UNTIL, FROM, COVENANTS SUSPENDED/ACTIVE, REQUIRED
  - TRANSITION statements with ALL_OF, ANY_OF conditions
  - Phase-aware covenant checking (checkActiveCovenants)
  - Transition condition evaluation
  - Phase history tracking
  - CLI `phase` command
- [x] **Milestone Tracking**
  - MILESTONE statements with TARGET, LONGSTOP, TRIGGERS, REQUIRES
  - Status tracking: pending, achieved, at_risk, breached
  - Prerequisite checking (ALL_OF, ANY_OF)
  - CLI `milestones` command
- [x] **Conditions Precedent**
  - CONDITIONS_PRECEDENT statements with SECTION, CP items
  - CP items with DESCRIPTION, RESPONSIBLE, STATUS, SATISFIES
  - Draw eligibility checking
  - CLI `draw` command
- [x] **Reserve Accounts**
  - RESERVE statements with TARGET, MINIMUM, FUNDED_BY, RELEASED_TO/FOR
  - Balance tracking, funding, and draws
  - CLI `reserves` command
- [x] **Waterfall Execution**
  - WATERFALL statements with FREQUENCY, TIER structure
  - Tier clauses: PAY, PAY TO, FROM, UNTIL, SHORTFALL, IF
  - Tiered distribution with shortfall handling
  - CLI `waterfall` command

### v1.0 - Premium React Dashboard (COMPLETE)
- [x] **Dashboard Infrastructure**
  - Vite + React + TypeScript setup
  - TailwindCSS with premium dark theme
  - Lucide icons, Recharts charting library
- [x] **Dashboard Shell**
  - Header with project info, phase indicator
  - Responsive grid layout
- [x] **Executive Summary**
  - Key metrics overview (compliance, milestones, reserves, cash flow)
  - Alert banner for issues
- [x] **Phase Timeline**
  - Visual timeline from Financial Close to Maturity
  - Current phase indicator with progress
- [x] **Covenant Panel**
  - Active vs suspended covenant display
  - Headroom visualization with progress bars
- [x] **Waterfall Visualization**
  - Stacked bar chart with tier breakdown
  - Blocked distribution highlighting
- [x] **Reserve Status**
  - Progress bars for balance/target/minimum
  - Available for release calculation
- [x] **Milestone Tracker**
  - Status indicators (achieved, in_progress, at_risk, pending)
  - Target and longstop dates with days remaining
- [x] **Conditions Precedent Checklist**
  - Checklist progress tracking
  - Status badges by responsible party

### CLI Commands (16 total)
- [x] `parse` - Parse .proviso file and output AST
- [x] `validate` - Syntax and semantic validation
- [x] `check` - Covenant compliance check
- [x] `baskets` - Basket utilization
- [x] `simulate` - Pro forma simulation
- [x] `status` - Full compliance report
- [x] `query` - Prohibition checking
- [x] `accumulate` - Builder basket accumulation
- [x] `ledger` - Basket transaction history
- [x] `cure` - Apply cure to breached covenant
- [x] `amendments` - List applied amendments
- [x] `history` - Compliance history across periods
- [x] `phase` - Current phase and transition status
- [x] `milestones` - Construction milestone tracking
- [x] `reserves` - Reserve account status
- [x] `waterfall` - Execute waterfall distribution
- [x] `draw` - Check conditions precedent

### Examples & Tests
- [x] Sample credit agreement (`examples/corporate_revolver.proviso`)
- [x] Sample amendment file (`examples/amendment_001.proviso`)
- [x] Sample financial data (`examples/q3_2024_financials.json`)
- [x] Multi-period financial data (`examples/multi_period_financials.json`)
- [x] Trailing definitions example (`examples/trailing_definitions.proviso`)
- [x] Project finance example (`examples/project_finance.proviso`)
- [x] Project finance demo data (`examples/project_finance_demo.json`)
- [x] Test suite (`tests/proviso.test.ts`) - **239 passing tests**
- [x] Hub test suite (`tests/hub.test.ts`) - **45 passing tests**
- [x] Versioning test suite (`tests/versioning.test.ts`) - **42 passing tests**
- [x] Forms test suite (`tests/forms.test.ts`) - **36 passing tests**
- [x] Word test suite (`tests/word.test.ts`) - **53 passing tests**
- [x] Closing test suite (`tests/closing.test.ts`) - **38 passing tests**
- [x] Post-closing test suite (`tests/postclosing.test.ts`) - **27 passing tests**

### Dashboard (NEW)
- [x] Dashboard package (`dashboard/`)
- [x] React components for all v1.0 features
- [x] Demo data with Sunrise Solar Project
- [x] Build scripts in root package.json

### v2.0 Phase 1 - Core Infrastructure (COMPLETE)
- [x] **Hub Data Models** (`src/hub/types.ts`)
  - Deal, DealVersion, DealParty, Contact interfaces
  - ChangeSummary, Change for version diff tracking
  - ConditionPrecedent, Document, Signature for closing
  - FinancialSubmission, DrawRequest for post-closing
  - Input types (CreateDealInput, etc.) and filters
- [x] **Persistence Layer** (`src/hub/store.ts`)
  - StoreInterface abstraction for future PostgreSQL swap
  - InMemoryStore implementation with full CRUD
  - generateId() UUID generation utility
  - Deal, Version, Party management
- [x] **API Layer** (`src/hub/api.ts`)
  - createDeal, getDeal, listDeals, updateDeal, deleteDeal
  - transitionDealStatus with validation
  - createVersion, sendVersion, receiveVersion, createMarkup
  - getVersionHistory, getCurrentVersion, getDealWithCurrentVersion
  - addParty, removeParty, listParties
  - compareVersions for basic change tracking
- [x] **Premium Base Components** (`dashboard/src/components/base/`)
  - Button (primary, secondary, ghost, danger, gold variants)
  - Input with label, helpText, error states
  - Select with options, placeholder
  - TextArea with character count
  - Modal with overlay, escape key, close button
  - DataTable with sorting, pagination
  - Tabs with variants (default, pills, underline)
  - Badge (success, warning, danger, info, gold, muted)
- [x] **Theme Extension** (`dashboard/tailwind.config.js`)
  - Gold accent palette (#D4AF37 primary)
  - Hub-specific background colors
  - display font family (Playfair Display)
  - gold glow shadows
- [x] **Negotiation Demo Data** (`dashboard/src/data/negotiation-demo.ts`)
  - ABC Acquisition Facility deal
  - 3 versions: Lender's Draft → Borrower's Markup → Lender's Counter
  - 6 parties: Borrower, Agent, 2 Lenders, 2 Law Firms
  - Rich change summaries with impact classification
- [x] **Hub Tests** (`tests/hub.test.ts`) - 45 tests
  - ID generation, store isolation
  - Deal CRUD, status transitions
  - Version CRUD, lineage tracking
  - Party management
  - Change tracking

### v2.0 Phase 2 - Form System (COMPLETE)
- [x] **Form Types** (`src/hub/forms/types.ts`)
  - FormDefinition, FormField, ValidationRule interfaces
  - FieldType, FormCategory, FormElementType enums
  - FormState, FormOutput types
- [x] **Template Engine** (`src/hub/forms/templates.ts`)
  - Handlebars-like syntax: {{variable}}, {{#if}}, {{#each}}
  - Format helpers (currency, percentage, ratio, date)
  - Step-down schedule rendering
- [x] **Form Definitions** (`src/hub/forms/definitions/`)
  - covenant-simple: Basic covenant with threshold
  - basket-fixed: Fixed capacity basket
  - basket-grower: GreaterOf capacity with floor
- [x] **Form Generator** (`src/hub/forms/generator.ts`)
  - generateFormOutput: Code + Word prose generation
  - validateFormValues: Field and cross-field validation
  - getDefaultValues: Extract defaults from form definition
- [x] **React Router Integration** (`dashboard/src/App.tsx`)
  - `/deals` - Deal list page
  - `/deals/:id/negotiate` - Negotiation Studio
  - `/deals/:id/closing` - Closing Dashboard
  - `/deals/:id/monitor` - Post-Closing Dashboard (v1.0)
- [x] **Form Tests** (`tests/forms.test.ts`) - 36 tests
  - Template rendering tests
  - Form definition tests
  - Code generation tests
  - Validation tests

### v2.0 Phase 3 - Versioning & Diff (COMPLETE)
- [x] **State Differ** (`src/hub/versioning/differ.ts`)
  - CompiledState interface for parsed agreement state
  - compileToState(code) - Parse and extract all elements
  - diffStates(from, to) - Compare two compiled states
  - Support for all element types (covenant, basket, definition, etc.)
- [x] **Change Classifier** (`src/hub/versioning/classifier.ts`)
  - classifyChange(diff) - Generate fully-formed Change objects
  - classifyImpact(diff) - Determine borrower/lender favorable
  - Impact heuristics for thresholds, capacities, cure rights
  - generateTitleAndDescription for human-readable output
- [x] **Change Log Generator** (`src/hub/versioning/changelog.ts`)
  - generateChangeSummary(fromVersion, toVersion) - Full ChangeSummary
  - generateChangeLog(options) - Text output in detailed/summary/executive format
  - Validation of code changes
- [x] **Diff Viewer Component** (`dashboard/src/components/diff/DiffViewer.tsx`)
  - Side-by-side code diff visualization
  - ProViso syntax highlighting
  - Change navigation (prev/next)
  - Collapsible unchanged sections
- [x] **NegotiationStudio Integration**
  - Compare modal with version selectors
  - View Code modal
  - Change summary display
- [x] **Versioning Tests** (`tests/versioning.test.ts`) - 42 tests
  - State compilation tests
  - Diff detection tests
  - Change classification tests
  - Impact classification tests
  - Change log generation tests

### v2.0 Phase 4 - Word Integration (COMPLETE)
- [x] **Word Templates** (`src/hub/word/templates.ts`)
  - Templates for covenants, baskets, definitions, conditions
  - Templates for phases, milestones, reserves, waterfalls, CP
  - Format helpers: currency, ratio, percentage, operator, frequency
  - Metric display name mapping
  - Template registry with render functions
- [x] **Word Generator** (`src/hub/word/generator.ts`)
  - WordGenerator class with generateDocument, generateSection, generateRedline
  - Article organization (Definitions, Covenants, CP, etc.)
  - Full document text generation with header
  - Redline generation comparing two versions
- [x] **Drift Detector** (`src/hub/word/drift.ts`)
  - DriftDetector class with detectDrift, classifyDrift, suggestCode
  - Section-by-section comparison
  - Classification by element type and change category
  - Severity assessment (high/medium/low)
  - Suggested ProViso code generation
  - Form matching for drift resolution
- [x] **Round-Trip Validator** (`src/hub/word/round-trip.ts`)
  - RoundTripValidator class with validate, validateCodeRepresentation
  - Acceptable stylistic variations detection
  - Punctuation and whitespace normalization
  - Key phrase and number preservation checking
- [x] **Word Tests** (`tests/word.test.ts`) - 53 tests
  - Format helper tests
  - Template rendering tests
  - Document generation tests
  - Redline generation tests
  - Drift detection and classification tests
  - Round-trip validation tests
  - Integration tests

### v2.0 Phase 5 - Closing Dashboard (COMPLETE)
- [x] **Closing Types** (`src/hub/closing/types.ts`)
  - ClosingReadiness with percentage and stats
  - OutstandingItem with priority levels
  - CreateCPInput, UpdateCPInput for CRUD operations
  - CreateDocumentInput, UpdateDocumentInput
  - CreateSignatureInput, UpdateSignatureInput
  - ClosingChecklistItem unified view
  - SignatureBlock and SignatureStatus
- [x] **Closing API** (`src/hub/closing/api.ts`)
  - Conditions precedent CRUD (create, get, list, update, delete)
  - satisfyCondition, waiveCondition status management
  - Documents CRUD with markDocumentUploaded, markDocumentExecuted
  - Signature management (add, update, request, sign)
  - getSignatureBlocks for document signature tracking
  - calculateClosingReadiness for overall deal status
  - getClosingChecklist for unified item list
  - clearClosingData, loadClosingData for testing
- [x] **Closing Demo Data** (`dashboard/src/data/closing-demo.ts`)
  - ABC Acquisition Facility $150M closing scenario
  - 15 conditions precedent across 10 categories
  - 10 documents with signature requirements
  - 6 parties (Borrower, Agent, 2 Lenders, 2 Law Firms)
  - Helper functions for stats calculation
- [x] **ReadinessMeter Component** (`dashboard/src/components/closing/ReadinessMeter.tsx`)
  - Progress bar with color coding (green/amber/red)
  - 4 KPI cards: Conditions, Documents, Signatures, Days Left
  - Overdue and pending indicators
- [x] **CPChecklist Component** (`dashboard/src/components/closing/CPChecklist.tsx`)
  - Status and category filters
  - Grouped display by category
  - Status badges (Satisfied, Waived, Pending, Overdue)
  - Due date and responsible party display
- [x] **DocumentTracker Component** (`dashboard/src/components/closing/DocumentTracker.tsx`)
  - Filter by status (all, pending, uploaded)
  - Expandable rows with signature details
  - Grouped by document type
  - Status indicators with color-coded borders
- [x] **SignatureTracker Component** (`dashboard/src/components/closing/SignatureTracker.tsx`)
  - Signature status grid per document
  - Stats summary (signed, requested, pending, declined)
  - Request signature action button
  - "Fully Executed" document indicator
- [x] **ClosingDashboard Page** (`dashboard/src/pages/closing/ClosingDashboard.tsx`)
  - ReadinessMeter at top with overall stats
  - Tabbed interface (Conditions, Documents, Signatures)
  - Export Checklist and Mark Ready to Close buttons
- [x] **Closing Tests** (`tests/closing.test.ts`) - 38 tests
  - Conditions precedent CRUD tests
  - Document CRUD tests
  - Signature management tests
  - Readiness calculation tests
  - Closing checklist tests

### v2.0 Phase 6 - Post-Closing Dashboard (COMPLETE)
- [x] **Post-Closing Types** (`src/hub/postclosing/types.ts`)
  - CreateFinancialSubmissionInput, UpdateFinancialSubmissionInput
  - CreateDrawRequestInput, UpdateDrawRequestInput
  - ComplianceHistory, CompliancePeriod
  - ScenarioInput, ScenarioAdjustment, ScenarioResult, ScenarioComparison
- [x] **Post-Closing API** (`src/hub/postclosing/api.ts`)
  - Financial submission CRUD (create, get, list, update, verify, dispute)
  - Draw request CRUD (create, get, list, submit, approve, fund)
  - getComplianceHistory - compliance data across periods
  - runScenario - "what if" simulation
- [x] **FinancialSubmissionForm Component** (`dashboard/src/components/postclosing/FinancialSubmissionForm.tsx`)
  - Period type selection (monthly/quarterly/annual)
  - Dynamic financial field inputs
  - Validation and error handling
- [x] **ComplianceTrendChart Component** (`dashboard/src/components/postclosing/ComplianceTrendChart.tsx`)
  - Line chart with Recharts
  - Reference lines for thresholds
  - Compliance status indicators per period
- [x] **DrawRequestList Component** (`dashboard/src/components/postclosing/DrawRequestList.tsx`)
  - Status badges and workflow actions
  - Pipeline summary statistics
  - Filtering and action buttons
- [x] **ScenarioSimulator Component** (`dashboard/src/components/postclosing/ScenarioSimulator.tsx`)
  - Adjustable inputs (absolute or percentage)
  - Real-time covenant impact comparison
  - Baseline vs scenario visualization
- [x] **Post-Closing Tests** (`tests/postclosing.test.ts`) - 27 tests
  - Financial submission CRUD tests
  - Draw request CRUD tests
  - Compliance history tests
  - Scenario simulation tests

### v2.0 Phase 7 - Polish (COMPLETE)
- [x] **Demo Data Cleanup**
  - Updated Sunrise Solar Project dates from 2024-2025 to 2025-2026
  - Aligned timeline with current date (2026-01-31)
  - Updated both dashboard demo and CLI example JSON
- [x] **Performance Tuning**
  - Added Vite manual chunks configuration (vendor-react, vendor-charts, vendor-icons)
  - Implemented React.lazy() for route-level code splitting
  - Main bundle reduced from 659KB to 105KB (4.7KB entry point)
- [x] **End-to-End Integration Tests** (`tests/e2e.test.ts`) - 9 tests
  - Deal negotiation workflow tests
  - Closing workflow tests
  - Post-closing workflow tests
  - Versioning & diff workflow tests
  - Full deal lifecycle test
- [x] **User Documentation** (`docs/GETTING_STARTED.md`)
  - Installation instructions
  - Quick start guide
  - ProViso syntax reference
  - CLI command reference
  - Dashboard guide
  - Common workflow examples

### v0.2.4 - Closing Room Patterns
- [x] **Closing Enums** (`src/closing-enums.ts`)
- [x] **Ontology System** (`src/ontology.ts`)
- [x] **Built-in Ontology** (`ontology/credit-agreement-v1.json`)
- [x] **Defined Terms System** (`src/defined-terms.ts`)

### Documentation
- [x] README.md - Updated with v0.2 features
- [x] CLAUDE.md - Updated to v1.0

## Quick Start

```bash
# Install dependencies
npm install
cd dashboard && npm install && cd ..

# Build backend
npm run build

# Build dashboard
npm run dashboard:build

# Run dashboard dev server
npm run dashboard

# Run CLI
npm run dev -- status examples/project_finance.proviso -d examples/project_finance_demo.json
```

## Known Issues

### RESOLVED: TypeScript Build Failure ✓
- Fixed `SignatureStatus` collision by renaming interface to `SignatureStatusDetail`
- Added 'uploaded' to DocumentStatus enum
- Fixed re-export collision in `src/hub/index.ts`

### RESOLVED: Lint Errors ✓
- Fixed 44 lint errors (removed unused imports, prefixed unused params with underscore)
- 9 warnings remain (acceptable, related to dynamic template handling)
- Removed `as any` cast from closing API (fixed type mismatch)

### MEDIUM: Bundle Size
- Dashboard build is 659KB (exceeds 500KB recommendation)
- Consider code splitting in Phase 7

## v2.1 Project Finance Industries (In Progress)

### Phase 1: Core Industry Constructs (COMPLETE)
- [x] **TECHNICAL_MILESTONE Statement** - Physics-based milestones with quantitative tracking
  - `MEASUREMENT`, `TARGET_VALUE`, `CURRENT_VALUE`, `PROGRESS_METRIC` clauses
  - Auto-achievement when current >= target
  - Completion percentage calculation
  - Integration with phase transitions
- [x] **REGULATORY_REQUIREMENT Statement** - Permit and regulatory tracking
  - `AGENCY`, `TYPE`, `REQUIRED_FOR`, `STATUS`, `APPROVAL_DATE`, `SATISFIES` clauses
  - Flexible type system (any string identifier)
  - Phase regulatory readiness checking
  - Blocking requirement detection
- [x] 19 new tests for industry constructs

### Phase 2: Performance & Degradation (COMPLETE)
- [x] **PERFORMANCE_GUARANTEE Statement** - Production warranties with P50/P75/P90/P99 thresholds
  - `METRIC`, `P50`, `P75`, `P90`, `P99`, `ACTUAL` clauses
  - `GUARANTEE_PERIOD`, `SHORTFALL_RATE`, `INSURANCE_COVERAGE` clauses
  - Performance level determination and shortfall calculation
  - `getPerformanceGuaranteeStatus()`, `getPerformanceGuaranteeNames()` methods
- [x] **DEGRADATION_SCHEDULE Statement** - Asset capacity degradation over time
  - `ASSET_TYPE`, `INITIAL_CAPACITY`, `YEAR_1_DEGRADATION`, `ANNUAL_DEGRADATION` clauses
  - `MINIMUM_CAPACITY`, `SCHEDULE`, `AFFECTS` clauses
  - Explicit schedule or formula-based degradation
  - `getDegradedCapacity()`, `getDegradationScheduleNames()` methods
- [x] **SEASONAL_ADJUSTMENT Statement** - Seasonal production factor adjustments
  - `METRIC`, `SEASON`, `ADJUSTMENT_FACTOR`, `REASON` clauses
  - Multi-season support (e.g., Q1, Q2)
  - `getSeasonalAdjustmentStatus()`, `getSeasonalAdjustmentNames()` methods
- [x] 18 new tests for performance constructs (507 total)

### Phase 2.5: Tax Equity Mechanics (COMPLETE)
- [x] **TAX_EQUITY_STRUCTURE Statement** - Partnership flip and tax equity modeling
  - `STRUCTURE_TYPE`, `TAX_INVESTOR`, `SPONSOR` clauses
  - `TAX_CREDIT_ALLOCATION`, `DEPRECIATION_ALLOCATION`, `CASH_ALLOCATION` (investor/sponsor %)
  - `FLIP_DATE`, `TARGET_RETURN`, `BUYOUT_PRICE` clauses
  - `getTaxEquityStructureStatus()`, `getTaxEquityStructureNames()` methods
- [x] **TAX_CREDIT Statement** - ITC/PTC/45X credit modeling
  - `CREDIT_TYPE`, `RATE`, `ELIGIBLE_BASIS`, `CREDIT_AMOUNT` clauses
  - `ADDER` clause for bonus credits (domestic content, energy community)
  - `VESTING_PERIOD`, `RECAPTURE_RISK`, `SATISFIES` clauses
  - Automatic credit amount calculation with adders
  - `getTaxCreditStatus()`, `getTaxCreditNames()` methods
- [x] **DEPRECIATION_SCHEDULE Statement** - MACRS accelerated depreciation
  - `METHOD` clause (macrs_5yr, macrs_7yr, macrs_15yr, macrs_20yr, straight_line)
  - `DEPRECIABLE_BASIS`, `BONUS_DEPRECIATION` clauses
  - `SCHEDULE` clause for explicit year-by-year depreciation
  - Built-in MACRS percentage tables
  - `getDepreciationForYear()`, `getDepreciationScheduleNames()` methods
- [x] **FLIP_EVENT Statement** - Partnership flip triggers
  - `TRIGGER` clause (target_return, date_certain, pf_event)
  - `PRE_FLIP_ALLOCATION`, `POST_FLIP_ALLOCATION` clauses
  - `BUYOUT_OPTION` (fair_market_value, fixed, formula)
  - `SATISFIES` clause for condition triggering
  - `getFlipEventStatus()`, `triggerFlip()`, `isFlipTriggered()` methods
- [x] 23 new tests for tax equity constructs (530 total)

### v2.1 Phase 3 - Industry Examples (COMPLETE)
- [x] **Solar Utility Example** (`examples/solar_utility.proviso`)
  - 200MW utility-scale solar with ITC tax equity partnership
  - TECHNICAL_MILESTONE: site prep, pile installation, tracker, modules, inverters, substation, grid sync
  - REGULATORY_REQUIREMENT: NEPA, CUP, LGIA, NPDES, building, FAA, BLM ROW, certifications
  - PERFORMANCE_GUARANTEE: P50/P75/P90/P99 for energy production, capacity factor, performance ratio, availability
  - DEGRADATION_SCHEDULE: panel, inverter, tracker degradation over 25 years
  - SEASONAL_ADJUSTMENT: Q1 winter, Q2 spring, Q3 summer peak, Q4 fall
  - TAX_EQUITY_STRUCTURE: partnership flip with 99/1 tax credit allocation
  - TAX_CREDIT: ITC with domestic content + energy community adders (50% effective rate)
  - DEPRECIATION_SCHEDULE: MACRS 5yr with 60% bonus depreciation
  - FLIP_EVENT: target return and date certain triggers
- [x] **Solar Financial Data** (`examples/solar_utility_financials.json`)
  - Comprehensive JSON demonstrating all v2.1 data structures
  - Technical milestones with progress tracking
  - Regulatory requirements with approval dates
  - Performance guarantee actuals and levels
  - Tax equity structure with credits and depreciation
- [x] **Wind Onshore Example** (`examples/wind_onshore.proviso`)
  - 150MW wind farm with PTC tax equity
  - Wind-specific milestones: foundations, towers, nacelles, blades, collector system
  - FAA determinations, tribal consultation, avian protection
  - Wind-specific performance: net capacity factor, curtailment limits
  - Gearbox replacement reserve
- [x] **Data Center Example** (`examples/data_center.proviso`)
  - 50MW critical infrastructure facility
  - Data center milestones: shell, power, cooling, generators, UPS, network, security
  - SOC 2, PCI DSS, ISO 27001 compliance requirements
  - SLA-based performance: 99.999% uptime, PUE, latency
  - Tenant concentration covenants, anchor tenant requirements

### v2.1 Phase 4 - Dashboard Enhancements (COMPLETE)
- [x] **Dashboard Wiring Complete**
  - Build Plan: `.claude/prompts/dashboard-wiring-build-plan.md`
  - [x] **Phase 1: ProViso Context Provider** - COMPLETE
    - Created `dashboard/src/context/ProVisoContext.tsx`
    - Created `dashboard/src/context/index.ts` exports
    - Created `dashboard/src/data/default-code.ts`
    - Created `dashboard/src/data/default-financials.ts`
    - Added Vite alias and TypeScript paths for @proviso import
    - Implemented transformer functions for all interpreter result types
    - Hooks: useProViso, useCovenants, useProVisoStatus
  - [x] **Phase 2: Wire MonitoringDashboard** - COMPLETE
    - Updated `App.tsx` to wrap with ProVisoProvider
    - Rewrote `MonitoringDashboard.tsx` to use useProViso hook
    - Added loading skeleton state using Skeleton components
    - Added error state with retry functionality
    - Auto-loads default code and financials on mount
    - Added Refresh button to header for manual refresh
    - Fixed browser build by using selective imports (avoiding Node.js-only modules)
  - [x] **Phase 3: Financial Data Input** - COMPLETE
    - Created `FinancialDataEditor.tsx` with collapsible field groups
    - Field groups: Income Statement, Debt Structure, Project Metrics, Cash Flow, Balance Sheet
    - Slide-out panel triggered by "Edit Financials" button
    - Live currency formatting with $ prefix
    - Apply & Recalculate workflow with unsaved changes indicator
    - Reset to defaults functionality
    - Also created `FinancialDataQuickEdit` component for inline editing
  - [x] **Phase 4: Connect ScenarioSimulator** - COMPLETE
    - Created `ConnectedScenarioSimulator.tsx` that wraps ScenarioSimulator with ProViso context
    - Auto-populates financial fields from interpreter state
    - Calculates covenant impact using real interpreter (saves/restores financials)
    - Added "Scenario Analysis" section to MonitoringDashboard
    - Field labels formatted from snake_case to Title Case with real calculations
  - [x] **Phase 5: Compliance History** - COMPLETE
    - Created `ConnectedComplianceTrendChart.tsx` with simulated historical data
    - Generates realistic trend data based on current covenant values
    - Period labels default to quarterly format (Q1 2025, Q2 2025, etc.)
    - `ComplianceTrendPanel` shows multiple covenants side-by-side
    - Added "Compliance History" section to MonitoringDashboard
    - Chart shows trend direction (improving/worsening/stable)
  - [x] **Phase 6: File Upload** - COMPLETE
    - Created `FileUploader.tsx` with drag-and-drop support
    - Supports .proviso files (ProViso code) and .json files (financial data)
    - File type detection and validation
    - Loading, success, and error states with visual feedback
    - "Upload" button in dashboard header opens modal
    - Compact mode available for inline use

## Remaining Work for v2.0

### All Phases Complete ✓

v2.0 is complete! All 7 phases have been implemented and tested.

## v2.2 "Living Deal" Build Plan

**Goal:** Transform ProViso from functional tool to compelling demo

### Sprint 1: Show the Work (Monitoring) - COMPLETE
- [x] 1C: Natural Language Summaries - Human-readable explanations with status highlighting
- [x] 1D: Early Warning System - Green/yellow/orange/red threshold zones with pulsing animations
- [x] 1B: Source Code Viewer - Click element → see ProViso definition with syntax highlighting
- [x] 1A: Calculation Drilldown - Click value → see formula tree with recursive expansion

#### Sprint 1 Implementation Details:
- **narratives.ts** - Narrative generators for covenants, baskets, milestones, reserves
- **thresholds.ts** - Zone detection (safe/caution/danger/breach) with trend analysis
- **codeGenerators.ts** - ProViso code regeneration from AST data
- **NaturalLanguageSummary.tsx** - Status highlighting, collapsible narratives
- **SourceCodeViewer.tsx** - Syntax highlighting, copy to clipboard, modal display
- **CalculationDrilldown.tsx** - Recursive tree view, clickable values, code button
- **CovenantPanel.tsx** - Enhanced with zones, narratives, code buttons
- **ExecutiveSummary.tsx** - Enhanced alert banner with early warnings
- **ProVisoContext.tsx** - Added getCalculationTree(), getDefinitionNames()
- **interpreter.ts** - Added CalculationNode type and getCalculationTree() method

### Sprint 2: Make Negotiation Real - COMPLETE
- [x] 2A: Covenant Editor Form - Visual form → generates code + prose
- [x] 2B: Basket Editor Form - Fixed/grower/builder configuration
- [x] 2D: Wire Generate Word - Connect button to existing generator

#### Sprint 2 Implementation Details:
- **CovenantEditor.tsx** - Full form with metric selection, operator, threshold, cure rights, step-downs
- **BasketEditor.tsx** - Tabs for fixed/grower/builder types, capacity configuration, subject-to conditions
- **editors/index.ts** - Export barrel for editor components
- **wordGenerator.ts** - Browser-compatible Word document generator (regex-based parsing)
- **NegotiationStudio.tsx** - Integrated editors, Generate Word modal, added elements display

### Sprint 3: Make Closing Work - COMPLETE
- [x] 3A: Condition Actions - Satisfy/waive with persistence
- [x] 3B: Document Upload Flow - Simulated upload workflow
- [x] 3C: Signature Workflow - Request/track/mark signed
- [x] 3D: Export Checklist - Generate downloadable checklist

#### Sprint 3 Implementation Details:
- **ClosingContext.tsx** - Central state management for conditions, documents, signatures with localStorage persistence
- **Toast.tsx** - Toast notification component with auto-dismiss
- **export.ts** - Export utility generating Markdown checklists with download and copy functions
- **CPChecklist.tsx** - Enhanced with Satisfy/Waive action buttons and confirmation modal
- **DocumentTracker.tsx** - Enhanced with Upload button, drag-drop modal, file selection
- **SignatureTracker.tsx** - Enhanced with Request Signature and Mark as Signed buttons
- **ClosingDashboard.tsx** - Integrated ClosingContext, toast notifications, export modal
- **App.tsx** - Wrapped closing route with ClosingProvider

### Sprint 4: Connect the Dots - COMPLETE
- [x] 4B: Deal Context Provider - Shared state across modules
- [x] 4A: Create Deal Flow - New Deal button works
- [x] 4C: Unified Demo Experience - Same deal flows through all modules
- [x] 1E: Activity Feed - Recent actions log

#### Sprint 4 Implementation Details:
- **DealContext.tsx** - Central state management for deals, versions, parties across all modules with localStorage persistence
- **CreateDealModal.tsx** - Form for creating new deals with name, type, amount, borrower, target closing date
- **ActivityFeed.tsx** - Activity feed component with relative timestamps, icons, collapsible and panel variants
- **DealList.tsx** - Updated to use DealContext, added New Deal modal and Activity panel
- **NegotiationStudio.tsx** - Updated to use DealContext for versions and deals
- **MonitoringDashboard.tsx** - Added activity feed integration
- **App.tsx** - Wrapped with DealProvider
- **context/index.ts** - Exported new context and types

**Full plan:** `.claude/prompts/v22-living-deal-build-plan.md`

## v2.3 Public Demo Build Plan

**Target URL:** `proviso-demo.haslun.online`
**Build Plan:** `.claude/prompts/v23-public-demo-build-plan.md`
**Precedent:** `.claude/precedent/closing-room-demo/` (extracted)

### Phase 1: Deployment Infrastructure (CRITICAL) - IN PROGRESS
- [x] Create `dashboard/vercel.json` with SPA rewrites
- [ ] Deploy to Vercel
- [ ] Configure custom domain DNS
- [ ] Verify HTTPS and routing

### Phase 2: Landing Experience (HIGH) - COMPLETE
- [x] Create `Landing.tsx` with hero, features, industry selector
- [x] Add `LoadingScreen.tsx` with animated brand reveal
- [x] Add EB Garamond + DM Sans fonts (index.html + tailwind.config.js)
- [x] Update routes (`/` → Landing, `/deals` → Dashboard)
- [x] Create `Hero.tsx`, `Features.tsx`, `FeatureCard.tsx`
- [x] Create `IndustrySelector.tsx` (Solar/Wind/Corporate)
- [x] Create `Footer.tsx`, `ThemeToggle.tsx`
- [x] Extended `tailwind.config.js` with full premium design system
- [x] Updated `index.css` with premium component classes

### Phase 3: Demo Data Polish (MEDIUM) - COMPLETE
- [x] Create narrative scenarios with "tension points"
- [x] Add near-breach covenant (97% of threshold)
- [x] Add at-risk milestone (5 days to longstop)
- [x] Add 6 quarters historical data
- [x] Wire demo scenarios to landing page navigation

### Phase 4: Export Functionality (MEDIUM) - COMPLETE
- [x] Wire "Export Report" button to modal
- [x] PDF export (compliance certificate via print window)
- [x] Word export (credit agreement text document)
- [x] JSON export (raw data with code and financials)
- [x] ProViso code export (.proviso file)
- [x] Enhanced print styles for PDF

### Phase 5: Analytics & Feedback (LOW) - COMPLETE
- [x] Add Plausible analytics (index.html script tag)
- [x] Add feedback email link (Footer.tsx mailto with subject)
- [x] Create analytics utility (analytics.ts with type-safe event tracking)
- [x] Wire tracking to IndustrySelector (Demo Started)
- [x] Wire tracking to ExportModal (Export Downloaded)
- [x] Wire tracking to ScenarioSimulator (Scenario Simulated)
- [x] Wire tracking to FileUploader (File Uploaded)

## Recent Activity

| Date | Activity |
|------|----------|
| 2026-02-05 | v2.3 Phase 5 COMPLETE: Analytics & Feedback - Plausible analytics, feedback email, event tracking for demo starts, exports, scenarios, uploads |
| 2026-02-05 | v2.3 Phase 4 COMPLETE: Export Functionality - ExportModal component, compliance report generator, PDF/Word/JSON/ProViso exports |
| 2026-02-05 | v2.3 Phase 3 COMPLETE: Demo Data Polish - 3 narrative scenarios (solar, wind, corporate) with tension points, historical data, and auto-loading |
| 2026-02-05 | v2.3 Phase 2 COMPLETE: Landing Experience - Hero, Features, IndustrySelector, LoadingScreen, ThemeToggle, Footer components |
| 2026-02-05 | v2.3 Phase 1 partial: Created vercel.json with SPA rewrites, asset caching, security headers |
| 2026-02-05 | v2.3 Design System: Extended tailwind.config.js with EB Garamond + DM Sans fonts, gold/navy/surface colors, animations |
| 2026-02-05 | v2.3 Public Demo Build Plan created - 5 phases for proviso-demo.haslun.online deployment |
| 2026-02-05 | Precedent code extracted from closing-room-demo.zip (landing page, design system, components) |
| 2026-02-03 | v2.2 Sprint 4 COMPLETE: "Connect the Dots" - DealContext, CreateDealModal, ActivityFeed, unified deal state |
| 2026-02-03 | v2.2 Sprint 3 COMPLETE: "Make Closing Work" - ClosingContext, condition actions, document upload, signature workflow, export checklist |
| 2026-02-03 | v2.2 Sprint 2 COMPLETE: "Make Negotiation Real" - CovenantEditor, BasketEditor, Generate Word integration |
| 2026-02-03 | v2.2 Sprint 1 COMPLETE: "Show the Work" - Natural language summaries, early warning system, source code viewer, calculation drilldown |
| 2026-02-03 | Build Plan: v2.2 "Living Deal" - 4 sprints covering monitoring, negotiation, closing, lifecycle |
| 2026-02-03 | Scout Report: Public demo readiness assessment - no deployment infra, landing page needed |
| 2026-02-03 | v2.1 Dashboard Wiring ALL PHASES COMPLETE: Dashboard now fully connected to interpreter |
| 2026-02-03 | v2.1 Dashboard Phase 6 COMPLETE: FileUploader with drag-and-drop, .proviso and .json support |
| 2026-02-03 | v2.1 Dashboard Phase 5 COMPLETE: ConnectedComplianceTrendChart with simulated historical data |
| 2026-02-03 | v2.1 Dashboard Phase 4 COMPLETE: ConnectedScenarioSimulator with real interpreter calculations |
| 2026-02-03 | v2.1 Dashboard Phase 3 COMPLETE: FinancialDataEditor with collapsible field groups, slide-out panel, Apply workflow |
| 2026-02-03 | v2.1 Dashboard Phase 2 COMPLETE: MonitoringDashboard wired to live interpreter data, loading states, error handling, and refresh button |
| 2026-02-03 | v2.1 Dashboard Phase 1 COMPLETE: ProViso Context Provider created with full interpreter integration, transformer functions, and React hooks |
| 2026-02-03 | Scout Report: Dashboard functionality analysis - identified static demo data disconnect from interpreter |
| 2026-02-03 | v2.1.0-alpha.5: Dashboard UI improvements - DealPageLayout, search/filter, skeletons, empty states, confirmation modals |
| 2026-02-03 | Dashboard UI Review complete - 2 high, 8 medium, 6 low priority improvements identified |
| 2026-02-03 | v2.1.0-alpha.4: Phase 3 Industry Examples complete (solar_utility.proviso, wind_onshore.proviso, data_center.proviso, solar_utility_financials.json) |
| 2026-02-03 | v2.1.0-alpha.3: Phase 2.5 Tax Equity Mechanics complete (TAX_EQUITY_STRUCTURE, TAX_CREDIT, DEPRECIATION_SCHEDULE, FLIP_EVENT, 23 tests) |
| 2026-02-03 | v2.1.0-alpha.2: Phase 2 Performance & Degradation complete (PERFORMANCE_GUARANTEE, DEGRADATION_SCHEDULE, SEASONAL_ADJUSTMENT, 18 tests) |
| 2026-02-03 | v2.1.0-alpha.1: Phase 1 Industry Constructs complete (TECHNICAL_MILESTONE, REGULATORY_REQUIREMENT, 19 tests) |
| 2026-01-31 | Refactor: Closing API type safety - removed `as any`, replaced magic strings with enum constants |
| 2026-01-31 | v2.0.0: Phase 7 Polish complete - demo data cleanup, code splitting, E2E tests, documentation |
| 2026-01-31 | v2.0.0-alpha.6: Phase 6 Post-Closing Dashboard complete (API, 4 components, 27 tests) |
| 2026-01-31 | Fixed TypeScript build errors (SignatureStatus collision, DocumentStatus enum) |
| 2026-01-31 | Fixed 44 lint errors (11 warnings remain, acceptable) |
| 2026-01-31 | Scout report: v2.0 at 71% completion (5/7 phases), TypeScript build failure identified |
| 2026-01-31 | v2.0.0-alpha.5: Phase 5 Closing Dashboard complete (API, 4 components, ClosingDashboard page, 38 tests) |
| 2026-01-31 | v2.0.0-alpha.4: Phase 4 Word Integration complete (generator, templates, drift, round-trip, 53 tests) |
| 2026-01-31 | v2.0.0-alpha.3: Phase 3 Versioning & Diff complete (differ, classifier, changelog, DiffViewer) |
| 2026-01-31 | v2.0.0-alpha.2: Phase 2 Form System complete (3 forms, templates, validation, routing) |
| 2026-01-31 | v2.0.0-alpha.1: Phase 1 Core Infrastructure complete (Hub data models, store, API, 8 base components) |
| 2026-01-31 | v1.0.0: Premium React Dashboard complete - all 8 components |
| 2026-01-31 | v1.0-alpha.2: Project Finance Backend complete |
| 2026-01-31 | v1.0-alpha.1: Phase System complete |
| 2026-01-31 | v0.3.0: Multi-period data, trailing calculations |
| 2026-01-31 | v0.2.4: Closing room patterns (enums, ontology) |
| 2026-01-31 | v0.2.3: Amendment overlays, cure rights |
