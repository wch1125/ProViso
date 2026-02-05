# Builder Session Log

**Project:** ProViso v2.1.0-alpha.4
**Date:** 2026-02-03
**Feature:** Phase 3 - Industry Examples
**Branch:** main

## Initial Orientation

### What I understood coming in
- v2.1 Phase 1 and Phase 2 (including 2.5) are complete with all new grammar constructs
- 530 tests passing, build working
- Available constructs: TECHNICAL_MILESTONE, REGULATORY_REQUIREMENT, PERFORMANCE_GUARANTEE, DEGRADATION_SCHEDULE, SEASONAL_ADJUSTMENT, TAX_EQUITY_STRUCTURE, TAX_CREDIT, DEPRECIATION_SCHEDULE, FLIP_EVENT

### What I set out to build
- Comprehensive industry examples showcasing all v2.1 constructs
- solar_utility.proviso - flagship 200MW solar with ITC tax equity
- wind_onshore.proviso - 150MW wind with PTC
- data_center.proviso - 50MW data center showing non-energy application

### Questions I brought to this work
- How do I best demonstrate the interplay between tax equity constructs and project phases?
- What's the right level of complexity for educational examples?
- What syntax patterns work vs don't work with the current grammar?

## Environment Verification
- [x] Dependencies installed successfully
- [x] Existing tests pass (530/530)
- [x] Linter passes (9 warnings, acceptable)
- [x] Build succeeds

## Objective
Create three comprehensive industry example files that demonstrate all v2.1 constructs in realistic project finance scenarios.

## What Was Built

### 1. Solar Utility Example (`examples/solar_utility.proviso`)
- **Lines:** ~600 lines
- **How it works:** Complete 200MW utility-scale solar project with:
  - 3 phases: Development → Construction → Operations
  - 2 transitions: NTP_Achieved, COD_Achieved
  - 8 TECHNICAL_MILESTONE statements tracking construction progress
  - 9 REGULATORY_REQUIREMENT statements covering permits
  - 4 PERFORMANCE_GUARANTEE statements (P50/P75/P90/P99)
  - 3 DEGRADATION_SCHEDULE statements for panels, inverters, trackers
  - 4 SEASONAL_ADJUSTMENT statements for Q1-Q4
  - 1 TAX_EQUITY_STRUCTURE with partnership flip
  - 2 TAX_CREDIT statements (solar ITC + battery ITC with adders)
  - 3 DEPRECIATION_SCHEDULE statements (5yr, 15yr MACRS)
  - 2 FLIP_EVENT statements (target return + date certain)
  - 7 covenants, 3 baskets, 3 reserves, 8-tier waterfall
  - 3 CONDITIONS_PRECEDENT sections with detailed CP items
  - 4 prohibitions, 5 events of default
- **Why this approach:** Showcases ALL v2.1 constructs in one coherent example

### 2. Solar Financial Data (`examples/solar_utility_financials.json`)
- **Size:** ~500 lines JSON
- **How it works:** Comprehensive financial data file demonstrating:
  - Project metadata and phase status
  - Technical milestone tracking with progress percentages
  - Regulatory requirements with approval statuses
  - Performance guarantee actuals vs P-values
  - Tax equity structure with allocations and IRR tracking
  - Tax credit calculations with adders
  - Depreciation schedule details
  - Flip event projections
  - Covenant compliance status
  - Reserve balances
  - Waterfall distribution breakdown
- **Why this approach:** Provides template for dashboard integration

### 3. Wind Onshore Example (`examples/wind_onshore.proviso`)
- **Lines:** ~550 lines
- **How it works:** 150MW onshore wind farm with:
  - Wind-specific milestones: foundations, towers, nacelles, blades, collector system
  - FAA determinations, tribal consultation, avian protection permits
  - PTC-based tax equity (production-based credits)
  - Net capacity factor and curtailment performance guarantees
  - Gearbox replacement reserve (wind-specific)
  - Environmental violation event of default
- **Why this approach:** Shows PTC structure vs ITC, wind-specific regulatory

### 4. Data Center Example (`examples/data_center.proviso`)
- **Lines:** ~500 lines
- **How it works:** 50MW critical infrastructure facility with:
  - Data center milestones: power, cooling, network, security
  - SOC 2, PCI DSS, ISO 27001 compliance requirements
  - Uptime SLA performance guarantees (99.999%)
  - PUE (Power Usage Effectiveness) metrics
  - Tenant concentration covenants
  - Anchor tenant default event
  - No tax equity (corporate project finance)
- **Why this approach:** Demonstrates non-energy application of framework

## My Thinking Process

### Key decisions and reasoning
| Decision | Why I made it | What I considered |
|----------|---------------|-------------------|
| Start with solar as flagship | Most complete tax equity example | Could have started simpler |
| Include all constructs in solar | Educational completeness | Might be overwhelming |
| Use realistic numbers | Practitioners can validate | Made-up numbers less useful |
| Skip wind financial JSON | Solar provides the template | Time vs completeness tradeoff |
| Add data center | Shows framework flexibility | Energy-only would be limiting |

### Where I struggled
- **PROGRESS_METRIC syntax**: Initially used string literals, needed numbers
- **FLIP_EVENT triggers**: Forgot the trigger value parameter
- **BASKET TRACKS**: Doesn't exist in grammar, removed it
- **PROHIBIT DESCRIPTION**: Not part of grammar, restructured

### What I learned
- The grammar is flexible but requires precise syntax
- AllocationSpec uses Number/Number format (99/1)
- TRIGGER requires a value (target_return 8.0, date_certain 2031-12-31)
- String literals use double quotes in specific places (MEASUREMENT, AGENCY, etc.)

## Dependencies Added
None - these are example files only.

## Error Handling
- Parse errors detected immediately via CLI validation
- Fixed syntax issues iteratively

## What I Tested
- [x] solar_utility.proviso parses correctly
- [x] wind_onshore.proviso parses correctly
- [x] data_center.proviso parses correctly
- [x] All 530 existing tests still pass
- [x] Build succeeds

## What I Did NOT Test
- Dashboard rendering of new examples (Phase 4)
- Interpreter evaluation with financial data (would need interpreter updates)
- Word document generation for new constructs

## Known Limitations
- Examples don't have corresponding CLI commands for new constructs yet
- Dashboard doesn't visualize v2.1 constructs yet (Phase 4)
- Wind and data center don't have financial data JSON files

## Files Changed
```
added:    examples/solar_utility.proviso
added:    examples/solar_utility_financials.json
added:    examples/wind_onshore.proviso
added:    examples/data_center.proviso
modified: .claude/status/current-status.md
```

## Commits Made
Work completed in session, ready for commit:
```
feat: add v2.1 Phase 3 industry examples

- solar_utility.proviso: 200MW solar with ITC tax equity
- solar_utility_financials.json: comprehensive demo data
- wind_onshore.proviso: 150MW wind with PTC
- data_center.proviso: 50MW data center (non-energy)
```

## Rollback Instructions
If this needs to be reverted:
```bash
git checkout -- examples/solar_utility.proviso
git checkout -- examples/solar_utility_financials.json
git checkout -- examples/wind_onshore.proviso
git checkout -- examples/data_center.proviso
```

---

## Reflections

### What surprised me
- The grammar is quite strict about syntax - string vs identifier matters
- The existing project_finance.proviso is actually v1.0 only - doesn't use new v2.1 constructs
- Creating realistic examples requires domain knowledge of actual deal structures

### What I'm uncertain about
- Whether the numbers in the examples are realistic enough for practitioners
- Whether the data center example should have more infrastructure-specific covenants
- How the dashboard will need to adapt to show these new constructs

### What I'd reconsider
- Could have added integration tests that parse the example files
- Might want to add a "simple" example for learning before the comprehensive ones

### What feels right
- Each example serves a distinct educational purpose
- The constructs interlock naturally (phases → transitions → milestones → CP → covenants)
- Solar example is comprehensive enough to be a reference implementation

### What I'm curious about
- How will the dashboard visualize degradation schedules?
- Can we auto-generate P-value charts from PERFORMANCE_GUARANTEE statements?
- Should there be CLI commands for each new construct type?

---

## For Tester: Beyond the Checklist

### Tasks
- [ ] Verify all examples parse with `npm run dev -- parse examples/[name].proviso`
- [ ] Check that examples demonstrate intended constructs
- [ ] Validate financial data JSON structure

### Genuine Questions I'm Curious About
- Are the P-values realistic for solar/wind performance guarantees?
- Do the tax equity allocation structures match real deals?
- Is the data center example missing any critical infrastructure covenants?

### What I Think Deserves Extra Attention
- The FLIP_EVENT trigger syntax - I had to iterate to get it right
- The PROHIBIT exceptions - the grammar is more limited than I initially thought

### What I'm Proud Of
- Solar example is genuinely comprehensive
- The seasonal adjustment factors are industry-accurate
- Data center example shows the framework works beyond energy

---

## Updates to Project Context

### Suggested Additions
- **Patterns:** Industry examples follow consistent structure (phases → transitions → milestones → regulatory → performance → definitions → covenants → baskets → reserves → waterfall → CP → prohibitions → events)
- **Decisions:** PTC examples use production-based credits, ITC uses basis-based
- **Terminology:** "P50/P75/P90/P99" refers to probability exceedance levels for energy production

---

## Next Steps
- [ ] Phase 4: Dashboard Enhancements
  - Industry selector for deal creation
  - Energy production visualization
  - Regulatory tracker component
  - Technical progress visualization
