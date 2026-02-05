# Implementation Plan: v2.1 Project Finance Industries

**Created:** 2026-02-03
**Status:** Planning
**Scope:** Large
**Market:** US-only (international deferred to v2.2+)

---

## Objective

Extend ProViso's project finance capabilities to support industry-specific requirements for **Solar**, **Wind**, **Gas/Thermal**, **Data Center**, and **Water/Infrastructure** projects. The current v1.0/v2.0 implementation provides generic project finance mechanics (phases, milestones, reserves, waterfalls). This phase adds:

1. **Industry-specific constructs** for technical milestones, regulatory requirements, performance guarantees
2. **Tax equity mechanics** for partnership flip structures (ITC/PTC, MACRS depreciation)
3. **Comprehensive examples** for each industry vertical

### What "Done" Looks Like

1. **5 industry-specific example files** demonstrating real-world credit agreements
2. **New language constructs** for technical milestones, regulatory requirements, performance guarantees
3. **Tax equity constructs** for ITC/PTC structures, flip mechanics, allocation waterfalls
4. **Industry-specific covenant libraries** (templates) for common covenant patterns
5. **Dashboard enhancements** showing industry-specific visualizations
6. **100+ new tests** covering industry-specific and tax equity functionality

---

## Acceptance Criteria

### Language Constructs - Industry
- [ ] TECHNICAL_MILESTONE - Physics-based/engineering milestones with measurements
- [ ] REGULATORY_REQUIREMENT - Permit and regulatory tracking
- [ ] PERFORMANCE_GUARANTEE - P50/P75/P99 energy production thresholds
- [ ] DEGRADATION_SCHEDULE - Asset degradation curves (solar panels, batteries)
- [ ] DECOMMISSIONING phase type with end-of-life reserve requirements
- [ ] SEASONAL_ADJUSTMENT - Modify metrics by season/period

### Language Constructs - Tax Equity (US)
- [ ] TAX_EQUITY_STRUCTURE - Define partnership flip structure
- [ ] TAX_CREDIT - ITC (30%) or PTC allocation and tracking
- [ ] DEPRECIATION_SCHEDULE - MACRS 5-year accelerated depreciation
- [ ] FLIP_EVENT - Conditions triggering investor flip (target IRR, date, or both)
- [ ] ALLOCATION_WATERFALL - Cash vs. tax benefit distribution by partner

### Industry Examples
- [ ] `examples/solar_utility.proviso` - 200MW utility-scale solar with tax equity
- [ ] `examples/wind_onshore.proviso` - 150MW wind farm with FAA/tribal milestones
- [ ] `examples/gas_peaker.proviso` - Gas peaker plant with heat rate guarantees
- [ ] `examples/data_center.proviso` - Data center with uptime SLAs and power constraints
- [ ] `examples/water_treatment.proviso` - Water treatment with EPA compliance

### Covenant Libraries
- [ ] `libraries/solar-covenants.proviso` - Reusable solar covenant patterns
- [ ] `libraries/wind-covenants.proviso` - Reusable wind covenant patterns
- [ ] `libraries/infrastructure-covenants.proviso` - Common infrastructure patterns

### Dashboard
- [ ] Industry selector on deal creation
- [ ] Industry-specific milestone templates
- [ ] Energy production visualization (for solar/wind)
- [ ] Degradation curve visualization
- [ ] Regulatory compliance tracker

### Tests
- [ ] 75+ new tests across all industry constructs

---

## Approach

### Design Philosophy

**Extend, Don't Fork:** All new constructs follow the same patterns as existing ones:
- Grammar additions in `proviso.pegjs`
- Type definitions in `types.ts`
- Interpreter logic in `interpreter.ts`
- CLI commands where appropriate

**Industry-Specific = Different .proviso Files:** The engine remains generic. Industry specificity comes from the credit agreement definition files. We provide:
1. New constructs that express industry concepts
2. Example files showing how to use them
3. Reusable libraries for common patterns

**Market-Driven Prioritization:**
1. **Solar** (largest market, most standardized)
2. **Wind** (second largest, similar to solar)
3. **Data Center** (growing rapidly, unique requirements)
4. **Gas/Thermal** (traditional, well-understood)
5. **Water/Infrastructure** (municipal, regulatory-heavy)

---

## Implementation Phases

### Phase 1: Technical & Regulatory Constructs (Core)
**Goal:** Enable expression of industry-specific technical and regulatory requirements

#### 1.1 TECHNICAL_MILESTONE
Extends MILESTONE with measurement tracking for engineering progress.

```proviso
TECHNICAL_MILESTONE ModuleInstallation
  TARGET 2026-06-30
  LONGSTOP 2026-09-30
  MEASUREMENT "MW Installed"
  TARGET_VALUE 200
  CURRENT_VALUE 145.5
  PROGRESS_METRIC MW_installed / total_MW
  TRIGGERS ArrayCompletion
  REQUIRES StructuralComplete
```

**Interpreter Logic:**
- Track `currentValue` against `targetValue`
- Calculate completion percentage
- Status: pending → in_progress → achieved (when currentValue >= targetValue)
- Still respects target/longstop dates

#### 1.2 REGULATORY_REQUIREMENT
Track permits, approvals, and regulatory milestones.

```proviso
REGULATORY_REQUIREMENT GridInterconnect
  AGENCY "Regional ISO"
  TYPE interconnection_agreement
  DESCRIPTION "LGIA executed with ISO"
  REQUIRED_FOR Construction
  STATUS pending | submitted | approved | denied
  APPROVAL_DATE 2026-03-15
  SATISFIES InterconnectionComplete
```

**Categories:**
- `environmental` - EPA, state environmental
- `interconnection` - Grid connection
- `land_use` - Zoning, permits
- `aviation` - FAA (wind specific)
- `tribal` - Tribal consultation (wind/solar)
- `water_rights` - Water projects

#### 1.3 PERFORMANCE_GUARANTEE
Express energy production or performance thresholds.

```proviso
PERFORMANCE_GUARANTEE MinEnergyProduction
  METRIC annual_generation_MWh
  P50 450_000
  P75 420_000
  P99 380_000
  GUARANTEE_PERIOD year_1_through_5
  SHORTFALL_RATE 0.85  // $/MWh for underperformance
  INSURANCE_COVERAGE 100_000_000
```

**Evaluation:**
- Compare actual production to P50/P75/P99 thresholds
- Calculate shortfall amount if below guarantee
- Track guarantee period

### Phase 2: Lifecycle & Degradation (Asset Management)

#### 2.1 DEGRADATION_SCHEDULE
Model asset degradation over time.

```proviso
DEGRADATION_SCHEDULE PanelDegradation
  ASSET_TYPE solar_panels
  INITIAL_CAPACITY 200 MW
  YEAR_1_DEGRADATION 2%
  ANNUAL_DEGRADATION 0.5%
  MINIMUM_CAPACITY 160 MW
  AFFECTS EBITDA, generation_capacity
```

**Evaluation:**
- Calculate effective capacity for any given year
- Adjust EBITDA projections based on degradation
- Feed into covenant calculations

#### 2.2 DECOMMISSIONING Phase
End-of-life phase with specific reserve requirements.

```proviso
PHASE Decommissioning
  FROM MaturityDate
  UNTIL DecommissioningComplete
  COVENANTS SUSPENDED all_financial_covenants
  REQUIRED DecommissioningReserve >= decommissioning_cost_estimate

RESERVE DecommissioningReserve
  TARGET decommissioning_cost_estimate
  MINIMUM 0.25 * decommissioning_cost_estimate
  FUNDED_BY OperatingCashFlow
  FUNDING_START year_15
  RELEASED_FOR "Site Restoration, Equipment Removal"
```

#### 2.3 SEASONAL_ADJUSTMENT
Modify metrics based on seasonal patterns.

```proviso
SEASONAL_ADJUSTMENT WinterCapacity
  METRIC generation_capacity
  SEASON Q4, Q1  // Winter months
  ADJUSTMENT_FACTOR 0.75
  REASON "Reduced solar irradiance"

SEASONAL_ADJUSTMENT SummerDemand
  METRIC revenue
  SEASON Q2, Q3
  ADJUSTMENT_FACTOR 1.20
  REASON "Peak demand pricing"
```

### Phase 2.5: Tax Equity Mechanics (US Transactions)
**Goal:** Enable expression of partnership flip structures for ITC/PTC monetization

#### 2.5.1 TAX_EQUITY_STRUCTURE
Define the overall partnership structure.

```proviso
TAX_EQUITY_STRUCTURE SunriseSolarPartnership
  STRUCTURE_TYPE partnership_flip  // or sale_leaseback, inverted_lease
  TAX_EQUITY_INVESTOR "Tax Equity Partners LLC"
  SPONSOR "Sunrise Energy LLC"

  // Pre-flip allocations
  PRE_FLIP_ALLOCATIONS
    TAX_EQUITY_INVESTOR: 99% tax, 10% cash
    SPONSOR: 1% tax, 90% cash

  // Post-flip allocations
  POST_FLIP_ALLOCATIONS
    TAX_EQUITY_INVESTOR: 5% tax, 5% cash
    SPONSOR: 95% tax, 95% cash

  FLIP_TRIGGER FlipConditions
```

**Structure Types (US):**
- `partnership_flip` - Standard ITC structure (most common for solar)
- `sale_leaseback` - Alternative structure
- `inverted_lease` - Pass-through lease structure
- `ptc_partnership` - PTC-optimized for wind

#### 2.5.2 TAX_CREDIT
Track ITC or PTC allocation and utilization.

```proviso
// Investment Tax Credit (Solar - 30% ITC)
TAX_CREDIT SolarITC
  TYPE ITC
  RATE 30%
  ELIGIBLE_BASIS 180_000_000  // Total project cost eligible
  CREDIT_AMOUNT 54_000_000    // 30% of eligible basis
  PLACED_IN_SERVICE 2026-06-30
  ALLOCATED_TO TAX_EQUITY_INVESTOR: 99%, SPONSOR: 1%
  RECAPTURE_PERIOD 5 years
  RECAPTURE_SCHEDULE
    YEAR_1: 100%
    YEAR_2: 80%
    YEAR_3: 60%
    YEAR_4: 40%
    YEAR_5: 20%

// Production Tax Credit (Wind - $/MWh)
TAX_CREDIT WindPTC
  TYPE PTC
  RATE 27.50 PER MWh  // 2026 rate with inflation adjustment
  DURATION 10 years
  START_DATE 2026-09-01
  ALLOCATED_TO TAX_EQUITY_INVESTOR: 99%, SPONSOR: 1%
  ANNUAL_GENERATION_ESTIMATE 350_000 MWh
```

#### 2.5.3 DEPRECIATION_SCHEDULE
Model MACRS accelerated depreciation.

```proviso
DEPRECIATION_SCHEDULE SolarMACRS
  METHOD MACRS_5_YEAR
  DEPRECIABLE_BASIS 180_000_000
  BONUS_DEPRECIATION 60%  // 2026 bonus depreciation rate

  // MACRS 5-year schedule (after bonus)
  SCHEDULE
    YEAR_1: 20.00%
    YEAR_2: 32.00%
    YEAR_3: 19.20%
    YEAR_4: 11.52%
    YEAR_5: 11.52%
    YEAR_6: 5.76%

  ALLOCATED_TO TAX_EQUITY_INVESTOR: 99%, SPONSOR: 1%
```

**Evaluation:**
- Calculate annual depreciation deduction
- Apply bonus depreciation in year 1
- Track remaining basis
- Feed into investor IRR calculations

#### 2.5.4 FLIP_EVENT
Define conditions triggering the partnership flip.

```proviso
FLIP_EVENT FlipConditions
  // Flip occurs when EITHER condition is met
  ANY_OF
    TAX_EQUITY_IRR >= 8.5%,           // Target yield achieved
    DATE >= 2031-12-31                 // Time-based backstop (Year 6)

  // Minimum hold period (regulatory)
  REQUIRES DATE >= 2031-06-30          // 5 years from PIS

  // Optional: DRO (Deficit Restoration Obligation) tracking
  DRO_BALANCE must_be_zero

  TRIGGERS PhaseFlip                   // Transition to post-flip allocations
```

**IRR Calculation Inputs:**
- Tax equity capital contribution
- Cash distributions received
- Tax benefits (ITC + depreciation deductions × tax rate)
- Present value at flip date

#### 2.5.5 ALLOCATION_WATERFALL
Detailed cash and tax benefit distribution.

```proviso
ALLOCATION_WATERFALL TaxEquityDistributions
  FREQUENCY quarterly

  // Pre-flip cash waterfall
  PRE_FLIP_CASH
    TIER 1: PAY OperatingReserve FROM AvailableCash
    TIER 2: PAY TaxEquityPreferredReturn TO TAX_EQUITY_INVESTOR
            UNTIL cumulative_preferred = capital_contribution * 0.02
    TIER 3: PAY TO SPONSOR REMAINDER

  // Post-flip cash waterfall (after flip)
  POST_FLIP_CASH
    TIER 1: PAY OperatingReserve FROM AvailableCash
    TIER 2: PAY 5% TO TAX_EQUITY_INVESTOR
    TIER 3: PAY 95% TO SPONSOR

// Tax benefit allocation (annual)
TAX_ALLOCATION_WATERFALL TaxBenefits
  PRE_FLIP
    ITC: TAX_EQUITY_INVESTOR 99%, SPONSOR 1%
    DEPRECIATION: TAX_EQUITY_INVESTOR 99%, SPONSOR 1%
    TAXABLE_INCOME: TAX_EQUITY_INVESTOR 99%, SPONSOR 1%

  POST_FLIP
    DEPRECIATION: TAX_EQUITY_INVESTOR 5%, SPONSOR 95%
    TAXABLE_INCOME: TAX_EQUITY_INVESTOR 5%, SPONSOR 95%
```

#### 2.5.6 Tax Equity Evaluation Functions

```typescript
// New interpreter functions for tax equity
interface TaxEquityStatus {
  structure: string;
  currentPhase: 'pre_flip' | 'post_flip';
  taxEquityIRR: number;
  projectedFlipDate: Date;

  itcStatus: {
    creditAmount: number;
    utilized: number;
    remaining: number;
    recaptureRisk: boolean;
  };

  depreciationStatus: {
    totalBasis: number;
    deductionsTaken: number;
    remainingBasis: number;
    currentYearDeduction: number;
  };

  distributionsToDate: {
    taxEquityCash: number;
    sponsorCash: number;
    taxEquityTaxBenefits: number;
    sponsorTaxBenefits: number;
  };
}

// CLI: proviso tax-equity project.proviso -d financials.json
// Shows: IRR tracking, flip projection, ITC status, depreciation schedule
```

### Phase 3: Industry Examples & Libraries

#### 3.1 Solar Utility Example
Full 200MW utility-scale solar project:
- ITC tax equity structure
- Panel degradation modeling
- P50/P75/P99 production guarantees
- Interconnection milestones
- Environmental permits
- Decommissioning reserve

#### 3.2 Wind Onshore Example
150MW wind farm:
- FAA obstruction marking
- Tribal consultation requirements
- Blade installation milestones
- Curtailment tracking
- Noise compliance
- Bird strike mitigation

#### 3.3 Gas Peaker Example
500MW gas peaker plant:
- Heat rate guarantees
- Emissions permits
- Capacity factor covenants
- Fuel supply agreements
- Spark spread hedging

#### 3.4 Data Center Example
50MW data center:
- Uptime SLAs (99.99%)
- Power usage effectiveness (PUE)
- Cooling system milestones
- Redundancy requirements
- Tenant concentration limits

#### 3.5 Water Treatment Example
Municipal water treatment:
- EPA discharge permits
- Flow rate guarantees
- Water quality covenants
- Intake/outfall milestones
- Rate covenant with municipality

### Phase 4: Dashboard Enhancements

#### 4.1 Industry Selector
- Deal creation form with industry type selection
- Pre-populates relevant templates

#### 4.2 Energy Production Visualization
- Generation vs. P50/P75/P99 chart
- Monthly/quarterly production tracking
- Degradation curve overlay

#### 4.3 Regulatory Tracker
- Permit status dashboard
- Agency relationship view
- Approval timeline

#### 4.4 Technical Progress
- MW installed vs. target
- Engineering completion percentage
- Critical path visualization

---

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `grammar/proviso.pegjs` | Modify | Add all new statement types (industry + tax equity) |
| `src/types.ts` | Modify | Add TypeScript interfaces for new constructs |
| `src/interpreter.ts` | Modify | Add evaluation logic for new constructs |
| `src/tax-equity.ts` | Create | Tax equity IRR calculations, flip logic, allocation tracking |
| `src/cli.ts` | Modify | Add commands: `regulatory`, `performance`, `degradation`, `tax-equity` |
| `examples/solar_utility.proviso` | Create | Full solar project example |
| `examples/wind_onshore.proviso` | Create | Wind project example |
| `examples/gas_peaker.proviso` | Create | Gas peaker example |
| `examples/data_center.proviso` | Create | Data center example |
| `examples/water_treatment.proviso` | Create | Water treatment example |
| `examples/solar_financial_data.json` | Create | Solar project financial data |
| `examples/wind_financial_data.json` | Create | Wind project financial data |
| `libraries/solar-covenants.proviso` | Create | Reusable solar patterns |
| `libraries/wind-covenants.proviso` | Create | Reusable wind patterns |
| `libraries/infrastructure-covenants.proviso` | Create | Common infrastructure patterns |
| `dashboard/src/components/industry/` | Create | Industry-specific components |
| `dashboard/src/components/tax-equity/` | Create | Tax equity visualization components |
| `dashboard/src/components/tax-equity/IRRTracker.tsx` | Create | IRR progress toward flip |
| `dashboard/src/components/tax-equity/AllocationChart.tsx` | Create | Cash/tax allocation visualization |
| `dashboard/src/components/tax-equity/FlipTimeline.tsx` | Create | Flip event timeline |
| `dashboard/src/pages/monitoring/IndustryMonitor.tsx` | Create | Industry-aware monitoring |
| `tests/industries.test.ts` | Create | Industry construct tests |
| `tests/tax-equity.test.ts` | Create | Tax equity calculation tests |
| `tests/solar.test.ts` | Create | Solar-specific tests |
| `tests/wind.test.ts` | Create | Wind-specific tests |
| `docs/INDUSTRIES.md` | Create | Industry guide documentation |
| `docs/TAX_EQUITY.md` | Create | Tax equity guide for US transactions |

---

## Implementation Order

### Week 1-2: Core Industry Constructs
1. [ ] Add TECHNICAL_MILESTONE to grammar
2. [ ] Add TECHNICAL_MILESTONE types
3. [ ] Implement TECHNICAL_MILESTONE interpreter
4. [ ] Add REGULATORY_REQUIREMENT to grammar
5. [ ] Add REGULATORY_REQUIREMENT types
6. [ ] Implement REGULATORY_REQUIREMENT interpreter
7. [ ] Write 20 tests for core constructs

### Week 3-4: Performance & Degradation
8. [ ] Add PERFORMANCE_GUARANTEE to grammar
9. [ ] Add PERFORMANCE_GUARANTEE types
10. [ ] Implement PERFORMANCE_GUARANTEE interpreter
11. [ ] Add DEGRADATION_SCHEDULE to grammar
12. [ ] Add DEGRADATION_SCHEDULE types
13. [ ] Implement DEGRADATION_SCHEDULE interpreter
14. [ ] Add SEASONAL_ADJUSTMENT to grammar
15. [ ] Implement SEASONAL_ADJUSTMENT interpreter
16. [ ] Write 25 tests for performance constructs

### Week 5-6: Tax Equity Mechanics
17. [ ] Add TAX_EQUITY_STRUCTURE to grammar
18. [ ] Add TAX_CREDIT (ITC/PTC) to grammar
19. [ ] Add DEPRECIATION_SCHEDULE to grammar
20. [ ] Add FLIP_EVENT to grammar
21. [ ] Add ALLOCATION_WATERFALL extensions to grammar
22. [ ] Create `src/tax-equity.ts` module
23. [ ] Implement IRR calculation logic
24. [ ] Implement flip condition evaluation
25. [ ] Implement allocation tracking
26. [ ] Write 30 tests for tax equity

### Week 7-8: Industry Examples
27. [ ] Create solar_utility.proviso with tax equity
28. [ ] Create solar_financial_data.json
29. [ ] Create wind_onshore.proviso with PTC
30. [ ] Create wind_financial_data.json
31. [ ] Create gas_peaker.proviso
32. [ ] Create data_center.proviso
33. [ ] Create water_treatment.proviso
34. [ ] Write 15 integration tests

### Week 9-10: Libraries & CLI
35. [ ] Create solar-covenants.proviso library
36. [ ] Create wind-covenants.proviso library
37. [ ] Create infrastructure-covenants.proviso library
38. [ ] Add `regulatory` CLI command
39. [ ] Add `performance` CLI command
40. [ ] Add `degradation` CLI command
41. [ ] Add `tax-equity` CLI command
42. [ ] Write 15 CLI tests

### Week 11-12: Dashboard
43. [ ] Add industry selector to deal creation
44. [ ] Create EnergyProductionChart component
45. [ ] Create DegradationCurve component
46. [ ] Create RegulatoryTracker component
47. [ ] Create TechnicalProgressPanel component
48. [ ] Create TaxEquityTracker component (IRR, flip status)
49. [ ] Integrate into monitoring dashboard
50. [ ] Update demo data with industry examples

### Week 13-14: Polish
51. [ ] End-to-end testing across all industries
52. [ ] Documentation (INDUSTRIES.md, TAX_EQUITY.md)
53. [ ] Update CLAUDE.md
54. [ ] Update README.md
55. [ ] Performance optimization
56. [ ] Final test coverage review (target: 100+ new tests)

---

## Risks & Unknowns

### Technical Risks
1. **Grammar Complexity:** Adding 10+ new statement types increases parser complexity. Mitigate with careful grammar design and extensive tests.

2. **IRR Calculation Accuracy:** Tax equity IRR calculations involve present value computations and iterative solving. Need to verify against industry-standard models.

3. **Depreciation/Tax Timing:** MACRS schedules and bonus depreciation rules change. Need to make rates configurable, not hardcoded.

4. **Dashboard Bundle Size:** More components will increase bundle size. Continue code splitting strategy from v2.0.

### Domain Risks
1. **Industry Accuracy:** Need domain expert review of industry examples. Covenants and structures must reflect real-world practice.

2. **Tax Law Changes:** IRA provisions, bonus depreciation phase-downs, and ITC rates are subject to change. Design for configurability.

3. **Flip Structure Variations:** Partnership flip structures have many variations (yield-based, time-based, hybrid). May not capture all edge cases.

### Unknowns
1. **User Feedback:** No production users yet. Industry examples may need iteration based on real feedback.

2. **Performance at Scale:** Large project files with tax equity calculations may be computationally intensive.

3. **Accounting Treatment:** ProViso tracks cash and tax flows but does not produce GAAP/IFRS financials. Users need to understand this limitation.

---

## Dependencies

### Existing (No Changes)
- Peggy parser generator
- TypeScript/Node.js 18+
- Vitest for testing
- React/Vite/TailwindCSS for dashboard

### New Dependencies
None anticipated. All new features use existing stack.

---

## Estimate

| Phase | Scope | Estimated Work |
|-------|-------|----------------|
| Core Industry Constructs | Medium | 2 weeks |
| Performance & Degradation | Medium | 2 weeks |
| Tax Equity Mechanics | Large | 2 weeks |
| Industry Examples | Medium | 2 weeks |
| Libraries & CLI | Medium | 2 weeks |
| Dashboard | Medium | 2 weeks |
| Polish | Small | 2 weeks |
| **Total** | **Large** | **14 weeks** |

---

## Ready to Proceed?

**Yes** — awaiting user approval.

### Decisions Made
- **Tax Equity:** YES - Include partnership flip structures, ITC/PTC, MACRS depreciation
- **Market Scope:** US-only for v2.1 (international deferred)
- **Industry Priority:** Solar → Wind → Data Center → Gas → Water

### Remaining Question
- **Library Format:** Should covenant libraries be `.proviso` files that can be included via an INCLUDE statement, or a template format that generates code?

---

## Version Numbering

This plan is for **v2.1.0** (Project Finance Industries + Tax Equity).

Future versions:
- **v2.2.0** - International Support (EU taxonomy, UK CfD, etc.)
- **v2.3.0** - Advanced Tax Structures (sale-leaseback, inverted lease)
- **v3.0.0** - Multi-tenancy / SaaS platform
