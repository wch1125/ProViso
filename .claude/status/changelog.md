# CreditLang Changelog

All notable changes to this project are documented here.

## [2.1.0-alpha.3] - 2026-02-03

### Added
- **TAX_EQUITY_STRUCTURE Statement** - Tax equity deal modeling
  - `STRUCTURE_TYPE` clause for partnership_flip, sale_leaseback, inverted_lease
  - `TAX_INVESTOR`, `SPONSOR` clauses for party identification
  - `TAX_CREDIT_ALLOCATION`, `DEPRECIATION_ALLOCATION`, `CASH_ALLOCATION` with investor/sponsor percentages
  - `FLIP_DATE`, `TARGET_RETURN`, `BUYOUT_PRICE` clauses
  - `getTaxEquityStructureStatus()`, `getTaxEquityStructureNames()`, `hasTaxEquityStructures()` methods
- **TAX_CREDIT Statement** - Investment and production tax credit modeling
  - `CREDIT_TYPE` clause for itc, ptc, 45X, 45V, 45Q
  - `RATE`, `ELIGIBLE_BASIS`, `CREDIT_AMOUNT` clauses
  - `ADDER` clause for bonus credits (domestic_content, energy_community, low_income)
  - `VESTING_PERIOD`, `RECAPTURE_RISK`, `SATISFIES` clauses
  - Automatic credit calculation: basis × (rate + adders)
  - `getTaxCreditStatus()`, `getTaxCreditNames()`, `hasTaxCredits()` methods
- **DEPRECIATION_SCHEDULE Statement** - MACRS accelerated depreciation
  - `METHOD` clause for macrs_5yr, macrs_7yr, macrs_15yr, macrs_20yr, straight_line
  - `DEPRECIABLE_BASIS`, `BONUS_DEPRECIATION` clauses
  - `SCHEDULE` clause with explicit `YEAR_N` entries
  - `AFFECTS` clause to link depreciation to metrics
  - Built-in MACRS percentage tables
  - `getDepreciationForYear()`, `getDepreciationScheduleNames()`, `hasDepreciationSchedules()` methods
- **FLIP_EVENT Statement** - Partnership flip trigger modeling
  - `TRIGGER` clause with target_return, date_certain, pf_event types
  - `PRE_FLIP_ALLOCATION`, `POST_FLIP_ALLOCATION` clauses
  - `BUYOUT_OPTION` with fair_market_value, fixed, formula types
  - `SATISFIES` clause for condition integration
  - `getFlipEventStatus()`, `triggerFlip()`, `isFlipTriggered()`, `getTriggeredFlips()` methods
- 23 new tests (530 total)

### Changed
- Grammar updated with 4 new statement types for tax equity mechanics
- Reserved words list expanded for tax equity constructs

---

## [2.1.0-alpha.2] - 2026-02-03

### Added
- **PERFORMANCE_GUARANTEE Statement** - Production warranties with probabilistic thresholds
  - `METRIC` clause for the measured variable
  - `P50`, `P75`, `P90`, `P99` clauses for probability exceedance thresholds
  - `ACTUAL` clause or financial data lookup for actual production
  - `GUARANTEE_PERIOD` for warranty coverage period
  - `SHORTFALL_RATE` for calculating shortfall payments ($/unit)
  - `INSURANCE_COVERAGE` for warranty insurance percentage
  - Performance level determination (p50, p75, p90, p99, below_p99)
  - Shortfall and payment calculation
  - `getPerformanceGuaranteeStatus()`, `getPerformanceGuaranteeNames()` methods
- **DEGRADATION_SCHEDULE Statement** - Asset capacity degradation modeling
  - `ASSET_TYPE` clause for the degrading asset category
  - `INITIAL_CAPACITY` for starting capacity
  - `YEAR_1_DEGRADATION` for first-year degradation percentage
  - `ANNUAL_DEGRADATION` for ongoing yearly degradation
  - `MINIMUM_CAPACITY` floor for degradation
  - `SCHEDULE` for explicit year-by-year degradation entries
  - `AFFECTS` clause to link degradation to other metrics
  - Formula-based or explicit schedule calculation
  - `getDegradedCapacity()`, `getDegradationScheduleNames()` methods
- **SEASONAL_ADJUSTMENT Statement** - Seasonal production factor adjustments
  - `METRIC` clause for the adjusted variable
  - `SEASON` clause with multi-season support (e.g., Q1, Q2, Q3, Q4)
  - `ADJUSTMENT_FACTOR` for seasonal multiplier
  - `REASON` clause for documentation
  - `getSeasonalAdjustmentStatus()`, `getSeasonalAdjustmentNames()` methods
- 18 new tests (507 total)

### Changed
- Grammar updated with 3 new statement types for performance modeling
- Reserved words list expanded for performance constructs

---

## [2.1.0-alpha.1] - 2026-02-03

### Added
- **TECHNICAL_MILESTONE Statement** - Quantitative milestone tracking for construction progress
  - `MEASUREMENT` clause for human-readable unit description
  - `TARGET_VALUE` and `CURRENT_VALUE` for numeric progress tracking
  - `PROGRESS_METRIC` for custom progress calculation expression
  - Automatic achievement detection when current >= target
  - Completion percentage calculation
  - Integration with phase transition system
  - `getTechnicalMilestoneStatus()`, `achieveTechnicalMilestone()`, `isTechnicalMilestoneAchieved()` methods
- **REGULATORY_REQUIREMENT Statement** - Permit and regulatory compliance tracking
  - `AGENCY` clause for regulatory authority name
  - `TYPE` clause with flexible type system (any string - environmental, interconnection, land_use, aviation, tribal, water_rights, etc.)
  - `REQUIRED_FOR` clause to specify blocking phases
  - `STATUS` tracking (pending, submitted, approved, denied)
  - `APPROVAL_DATE` and `SATISFIES` clauses
  - `getRegulatoryRequirementStatus()`, `updateRegulatoryStatus()`, `getRegulatoryChecklist()` methods
  - Phase regulatory readiness checking
- **Industry Constructs Integration** - Technical milestones and regulatory requirements integrate with phase transitions
- 19 new tests (489 total)

### Changed
- Grammar updated to v2.1 with new statement types
- Reserved words list expanded for new constructs

---

## [1.0.0] - 2026-01-31

### Added
- **Premium React Dashboard** - Interactive visualization for project finance deals
  - **Dashboard Infrastructure**: Vite + React + TypeScript + TailwindCSS
  - **Dashboard Shell**: Header with project info, phase indicator, responsive grid layout
  - **Executive Summary**: Key metrics (compliance, milestones, reserves, cash flow), alert banner
  - **Phase Timeline**: Visual timeline from Financial Close to Maturity with current phase indicator
  - **Covenant Panel**: Active vs suspended covenant display, headroom visualization with progress bars
  - **Waterfall Visualization**: Stacked bar chart with tier breakdown, blocked distribution highlighting
  - **Reserve Status**: Progress bars for balance/target/minimum, available for release calculation
  - **Milestone Tracker**: Status indicators (achieved, in_progress, at_risk, pending), dates with countdown
  - **Conditions Precedent Checklist**: Progress tracking, status badges by responsible party
- Demo data for Sunrise Solar Project in `dashboard/src/data/demo.ts`
- Dashboard scripts in root package.json: `dashboard`, `dashboard:build`, `dashboard:preview`

### Changed
- Version bump to 1.0.0 (production release)

---

## [1.0.0-alpha.2] - 2026-01-31

### Added
- **Milestone Tracking** - Construction milestone system
  - `MILESTONE` statement with `TARGET`, `LONGSTOP`, `TRIGGERS`, `REQUIRES` clauses
  - Status tracking: pending, achieved, at_risk, breached
  - Prerequisite checking with `ALL_OF()`, `ANY_OF()`
  - `getMilestoneStatus()`, `achieveMilestone()`, `getAllMilestoneStatuses()` methods
  - CLI `milestones` command with `--as-of` flag
- **Reserve Accounts** - Reserve account management
  - `RESERVE` statement with `TARGET`, `MINIMUM`, `FUNDED_BY`, `RELEASED_TO`, `RELEASED_FOR` clauses
  - Balance tracking, `fundReserve()`, `drawFromReserve()`, `setReserveBalance()` methods
  - CLI `reserves` command
- **Waterfall Execution** - Cash flow distribution
  - `WATERFALL` statement with `FREQUENCY` and `TIER` structure
  - Tier clauses: `PAY`, `PAY TO`, `FROM`, `UNTIL`, `SHORTFALL`, `IF`
  - Reserve integration for shortfall handling
  - Conditional distribution gates (e.g., `IF DSCR >= 1.50`)
  - CLI `waterfall` command
- **Conditions Precedent** - Draw checklist system
  - `CONDITIONS_PRECEDENT` statement with `SECTION` and `CP` items
  - CP items with `DESCRIPTION`, `RESPONSIBLE`, `STATUS`, `SATISFIES` clauses
  - Status: pending, satisfied, waived, not_applicable
  - `getCPChecklist()`, `updateCPStatus()`, `isDrawAllowed()` methods
  - CLI `draw` command
- Project finance example files: `examples/project_finance.crl`, `examples/project_finance_demo.json`
- 29 new tests (220 total)

---

## [1.0.0-alpha.1] - 2026-01-31

### Added
- **Phase State Machine** - Project finance phase management
  - `PHASE` statement with `UNTIL`, `FROM`, `COVENANTS SUSPENDED`, `COVENANTS ACTIVE`, `REQUIRED` clauses
  - `TRANSITION` statement with `WHEN` condition supporting `ALL_OF()` and `ANY_OF()` compound conditions
  - `PhaseStatement`, `TransitionStatement`, `PhaseHistoryEntry`, `TransitionResult` types
  - `isAllOfCondition()`, `isAnyOfCondition()` type guards
  - Phase state machine in interpreter with transition tracking
- **Phase-Aware Covenant Checking**
  - `getCurrentPhase()` / `setCurrentPhase()` - Get/set current phase
  - `transitionTo()` - Execute phase transition on event trigger
  - `checkPhaseTransitions()` - Evaluate all transition conditions
  - `getActiveCovenants()` - Get covenants not suspended in current phase
  - `getSuspendedCovenants()` - Get covenants suspended in current phase
  - `getRequiredCovenants()` - Get phase-specific required covenants
  - `isCovenantActive()` - Check if specific covenant is active
  - `checkActiveCovenants()` - Check only non-suspended covenants
- **Condition/Milestone Tracking**
  - `satisfyCondition()` / `isConditionSatisfied()` / `clearCondition()` - Track satisfied conditions
  - Transition conditions check against satisfied conditions set
- **Status Report Enhancement**
  - `StatusReport` now includes `currentPhase` and `suspendedCovenants` when phases are defined
  - `getStatus()` uses phase-aware checking when phases exist
- 21 new tests (191 total) covering Phase System

### Changed
- `Statement` type now includes `PhaseStatement` and `TransitionStatement`
- `StatementTypeName` includes `'Phase'` and `'Transition'` for amendments
- Grammar includes new reserved words: `PHASE`, `TRANSITION`, `UNTIL`, `FROM`, `COVENANTS`, `SUSPENDED`, `ACTIVE`, `REQUIRED`, `ALL_OF`, `ANY_OF`
- Amendment system can delete Phase and Transition statements

---

## [0.3.0] - 2026-01-31

### Added
- **Multi-Period Financial Data Support**: Load quarterly, monthly, or annual data
  - `PeriodData` interface with period identifier, type, end date, and data
  - `MultiPeriodFinancialData` interface with periods array
  - Type guards: `isMultiPeriodData()`, `isPeriodData()`, `isSimpleFinancialData()`
  - Automatic period sorting (2024-Q1, 2024-Q2, etc.)
- **Trailing Period Calculations**: New grammar syntax
  - `TRAILING N QUARTERS OF expr` - Sum across last N quarters
  - `TRAILING N MONTHS OF expr` - Sum across last N months
  - `TRAILING N YEARS OF expr` - Sum across last N years
  - `TrailingExpression` AST type
- **Period-Scoped Evaluation**: Evaluate "as of" specific periods
  - `setEvaluationPeriod()` / `getEvaluationPeriod()` methods
  - `getAvailablePeriods()` returns sorted period list
  - `hasMultiPeriodData()` mode detection
  - `--as-of <period>` CLI flag for status, check, baskets, simulate commands
- **Compliance History**: Track compliance across all periods
  - `getComplianceHistory()` interpreter method
  - `history` CLI command with tabular and JSON output
  - `--covenants-only` flag for covenant-focused history
- **Example Files**:
  - `examples/multi_period_financials.json` - 4 quarters of sample data
  - `examples/trailing_definitions.crl` - Trailing calculation examples
- 20 new tests (170 total)

### Changed
- `FinancialData` type is now union of `SimpleFinancialData | MultiPeriodFinancialData`
- `simulate()` method accepts `Partial<SimpleFinancialData>` for changes
- Interpreter auto-detects data format and defaults to latest period
- Updated README with v0.3 features and examples
- Updated CLAUDE.md to version 0.3.0

---

## [0.2.4] - 2026-01-31

### Added
- **Closing Room Enums** (`src/closing-enums.ts`): TypeScript vocabulary for v1.0 UI
  - `TransactionType` - 7 facility types (revolving, term loans, ABL, etc.)
  - `DocumentType` - 33 document types across all categories
  - `DocumentStatus` - 9 lifecycle states (not_started → executed)
  - `PartyRole` - 11 roles (borrower, agents, lenders)
  - `ConditionStatus` - 5 states (pending, satisfied, waived, etc.)
  - `DefinedTermCategory` - 7 categories for grouping terms
  - `DocumentCategory` - 11 categories for checklist grouping
  - Validator functions: `isTransactionType()`, `isDocumentType()`, etc.
  - Label functions: `getTransactionTypeLabel()`, `getDocumentStatusLabel()`, etc.
- **Ontology System** (`src/ontology.ts`): Declarative configuration pattern
  - `loadOntology()` - Load from JSON file
  - `loadBuiltinOntology()` - Load built-in ontologies by name
  - `validateOntology()` - Validate cross-references
  - Query helpers: `getDocumentsByCategory()`, `getConditionBySection()`, `getDocumentByKey()`
- **Built-in Ontology** (`ontology/credit-agreement-v1.json`):
  - 16 document templates (credit agreement, certificates, opinions, filings)
  - 12 condition precedent templates (Article 4.01 items)
  - 4 covenant templates with common thresholds by transaction type
  - 3 basket templates with common capacities
- **Defined Terms System** (`src/defined-terms.ts`): Term tracking and analysis
  - `DefinedTerm`, `DefinedTermsRegistry`, `TermCrossReference` types
  - Parsing: `parseDefinedTerm()`, `loadDefinedTermsFromJson()`
  - Registry: `createTermsRegistry()`, `findTerm()`, `findTermsByCategory()`
  - Analysis: `buildCrossReferenceGraph()`, `findCircularReferences()`
  - Validation: `validateCrossReferences()`, `findDuplicateTerms()`
  - CreditLang integration: `isCalculableTerm()`, `extractPotentialIdentifiers()`
- 53 new tests (150 total)

### Changed
- Updated `src/index.ts` to export new modules
- Updated status to v0.2.4

---

## [0.2.3] - 2026-01-31

### Added
- **Amendment Overlay System**: Modify base agreements with overlay files
  - `AMENDMENT` statement type with number, `EFFECTIVE` date, `DESCRIPTION`
  - `REPLACES` directive for full statement replacement
  - `ADDS` directive for adding new statements
  - `DELETES` directive for removing statements
  - `MODIFIES` directive for partial updates (CAPACITY, FLOOR, MAXIMUM, REQUIRES, TESTED)
  - `applyAmendment()` interpreter method
  - `getAppliedAmendments()` utility method
  - CLI `amendments` command to show applied amendments
  - `-a, --amendments` flag on status, check, baskets, simulate commands
  - 14 new amendment tests
- **Cure Rights Mechanics**: Handle covenant breaches with cure mechanisms
  - Enhanced CURE clause parsing: `EquityCure`, `PaymentCure`
  - `MAX_USES`, `MAX_AMOUNT`, `CURE_PERIOD` cure details
  - `checkCovenantWithCure()` for cure-enhanced results
  - `applyCure()` to apply cure to a breached covenant
  - `getCureUsage()` to track cure uses
  - CLI `cure` command to apply cures
  - `--show-cure` flag on status command
  - 15 new cure rights tests
- **Basket Ledger CLI**: View basket transaction history
  - CLI `ledger` command with filtering by basket and date
  - `--json` and `--export` options for output
  - 5 new ledger tests
- Example amendment file (`examples/amendment_001.crl`)
- Updated example file with cure rights

### Changed
- Updated README.md with v0.2 features, new CLI commands, and examples
- Updated CLAUDE.md to version 0.2.0 with current features
- Grammar: Added `AMENDMENT`, `REPLACES`, `ADDS`, `DELETES`, `MODIFIES` keywords
- Grammar: Added `PaymentCure`, `CURE_PERIOD`, `CurePeriod` rules
- Types: Added `AmendmentStatement`, `AmendmentDirective`, `CureState`, `CureUsage`, `CureResult`, etc.
- Interpreter: Added events map, amendment tracking, cure state tracking

---

## [0.2.2] - 2026-01-31

### Added
- **Semantic Validation**: Pre-runtime validation of CRL files
  - New `validator.ts` module with `validate()` function
  - Validates undefined basket references in `AVAILABLE()` - errors
  - Validates undefined covenant references in `COMPLIANT()` - errors
  - Validates undefined condition references in `SUBJECT TO` - errors
  - Validates undefined identifiers (potential financial data) - warnings
  - Validates undefined event references in `EXISTS()` - warnings
  - Context-aware: `amount` is valid in PROHIBIT EXCEPT WHEN clauses
- New validation types: `ValidationIssue`, `ValidationResult`, `ValidationSeverity`
- New CLI `validate` command with `--quiet` option
- 14 new semantic validation tests (63 total tests)
- Exports `validateSemantics` from main index

### Changed
- Updated `index.ts` to export validator alongside parser
- Renamed parser's `validate` export to `validateSyntax` for clarity

---

## [0.2.1] - 2026-01-31

### Added
- **Enhanced Parser Error Messages**: Rich error information from Peggy parser
  - `ParseError` type now includes `expected`, `found`, and offset fields
  - `ParseResult` includes source string for error context display
  - `formatParseError()` CLI helper displays source line, caret indicator, and expected tokens
  - 7 new tests for parse error handling (49 total tests)

### Changed
- `parse()` function now returns source in result for error context
- CLI commands use enhanced error display instead of generic error messages
- CLI no longer imports unused `parseOrThrow` in main module

---

## [0.2.0] - 2026-01-30

### Added
- **Grower Baskets**: Capacity that scales with financial metrics
  - `FLOOR` clause for minimum capacity
  - Basket type detection (`getBasketType()`)
  - Status reporting with base capacity and floor details
  - `getGrowerBasketNames()` utility method
- **Builder Baskets**: Capacity that accumulates over time
  - `BUILDS_FROM` clause for accumulation source expression
  - `STARTING` clause for initial capacity
  - `MAXIMUM` clause for capacity cap
  - `accumulateBuilderBasket()` method for periodic accumulation
  - Ledger tracking differentiates accumulation vs usage entries
  - `getBuilderBasketNames()` utility method
- ESLint 9 flat config (`eslint.config.js`)
- ES Module support in package.json
- 15 new tests for grower/builder basket functionality

### Changed
- Migrated from `.eslintrc.cjs` to `eslint.config.js` (ESLint 9)
- Updated `BasketStatement` type with new optional fields
- Updated `BasketStatus` type with detailed reporting fields
- Updated `BasketLedgerEntry` type with `entryType` field
- Updated example file (`corporate_revolver.crl`) to v0.2 with grower/builder examples

### Fixed
- ESLint fallthrough error in `evaluateBoolean()` switch statement
- Removed unused imports in interpreter.ts

---

## [0.1.0] - 2025-01-31

### Added
- Project scaffolding
- PEG grammar for credit agreement syntax
- Parser wrapper with TypeScript types
- Interpreter with expression evaluation
- DEFINE statements with EXCLUDING and CAPPED AT modifiers
- COVENANT statements with REQUIRES, TESTED, CURE, BREACH clauses
- BASKET statements with CAPACITY, PLUS, SUBJECT TO clauses
- CONDITION statements for reusable boolean expressions
- PROHIBIT statements with EXCEPT WHEN clauses
- EVENT statements with TRIGGERS WHEN, GRACE_PERIOD, CONSEQUENCE
- Pro forma simulation
- CLI with status command
- 27 tests

### Notes
- Initial MVP release

---

<!--
CHANGELOG GUIDELINES:

Update this file at the end of every Claude session.

Categories:
- Added: New features
- Changed: Changes to existing functionality
- Deprecated: Features to be removed
- Removed: Features removed
- Fixed: Bug fixes
- Security: Security-related changes

Format:
## [Version] - YYYY-MM-DD
or
## YYYY-MM-DD - [Role] (for session-based updates)
-->
