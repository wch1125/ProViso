# ProViso v2.1 Industry Constructs Reference

This document covers the industry-specific constructs added in v2.1 for solar, wind, data center, and other project finance applications.

## Table of Contents

1. [Technical Milestones](#technical-milestones)
2. [Regulatory Requirements](#regulatory-requirements)
3. [Performance Guarantees](#performance-guarantees)
4. [Degradation Schedules](#degradation-schedules)
5. [Seasonal Adjustments](#seasonal-adjustments)
6. [Tax Equity Structures](#tax-equity-structures)
7. [Tax Credits](#tax-credits)
8. [Depreciation Schedules](#depreciation-schedules)
9. [Flip Events](#flip-events)
10. [Dashboard Components](#dashboard-components)
11. [Example Files](#example-files)

---

## Technical Milestones

Technical milestones track quantitative construction progress with measurable targets.

### Syntax

```proviso
TECHNICAL_MILESTONE <name>
  TARGET <date>
  [LONGSTOP <date>]
  MEASUREMENT "<unit description>"
  TARGET_VALUE <number>
  CURRENT_VALUE <number>
  [PROGRESS_METRIC <expression>]
  [TRIGGERS <condition1>, <condition2>, ...]
  [REQUIRES <prerequisite> | ALL_OF(...) | ANY_OF(...)]
```

### Example

```proviso
TECHNICAL_MILESTONE ModuleInstallation
  TARGET 2026-06-30
  LONGSTOP 2026-09-30
  MEASUREMENT "MW Installed"
  TARGET_VALUE 200
  CURRENT_VALUE 145.5
  TRIGGERS ArrayCompletion
  REQUIRES StructuralComplete
```

### Interpreter Methods

```typescript
// Get status for a specific milestone
interpreter.getTechnicalMilestoneStatus('ModuleInstallation');
// Returns: { name, targetValue, currentValue, completionPercent, status, prerequisites, ... }

// Check if milestone is achieved
interpreter.isTechnicalMilestoneAchieved('ModuleInstallation');

// Manually achieve milestone
interpreter.achieveTechnicalMilestone('ModuleInstallation');

// Get all technical milestone statuses
interpreter.getAllTechnicalMilestoneStatuses();

// List all names
interpreter.getTechnicalMilestoneNames();
```

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Before target date, not yet achieved |
| `in_progress` | Work underway (optional explicit state) |
| `achieved` | currentValue >= targetValue |
| `at_risk` | Past target date, before longstop |
| `breached` | Past longstop date |

---

## Regulatory Requirements

Track permits and approvals by agency, type, and required phase.

### Syntax

```proviso
REGULATORY_REQUIREMENT <name>
  AGENCY "<agency name>"
  TYPE <permit_type>
  [DESCRIPTION "<description>"]
  [REQUIRED_FOR <phase>]
  STATUS <pending|submitted|approved|denied>
  [APPROVAL_DATE <date>]
  [SATISFIES <condition1>, <condition2>, ...]
```

### Example

```proviso
REGULATORY_REQUIREMENT GridInterconnect
  AGENCY "CAISO"
  TYPE interconnection
  DESCRIPTION "Large Generator Interconnection Agreement"
  REQUIRED_FOR Construction
  STATUS submitted
  SATISFIES InterconnectionComplete
```

### Permit Types

Common types include:
- `interconnection` - Grid interconnection agreements
- `environmental` - EPA, NEPA, state environmental
- `land_use` - Zoning, conditional use permits
- `aviation` - FAA determinations
- `water_rights` - State water board permits

### Interpreter Methods

```typescript
// Get regulatory checklist summary
interpreter.getRegulatoryChecklist();
// Returns: { totalRequirements, pending, submitted, approved, denied, phaseReady }

// Check if phase is regulatory ready
interpreter.isPhaseRegulatoryReady('Construction');

// Update permit status
interpreter.updateRegulatoryStatus('GridInterconnect', 'approved', '2026-03-15');

// Get individual requirement status
interpreter.getRegulatoryRequirementStatus('GridInterconnect');
```

---

## Performance Guarantees

Model production guarantees at probability exceedance levels (P50, P75, P90, P99).

### Syntax

```proviso
PERFORMANCE_GUARANTEE <name>
  METRIC <metric_name>
  [P50 <value>]
  [P75 <value>]
  [P90 <value>]
  P99 <value>
  [ACTUAL <value>]
  [GUARANTEE_PERIOD "<description>"]
  [SHORTFALL_RATE <$/unit>]
  [INSURANCE_COVERAGE $<amount>]
```

### Example

```proviso
PERFORMANCE_GUARANTEE AnnualEnergy
  METRIC annual_generation_MWh
  P50 450000
  P75 420000
  P90 400000
  P99 380000
  GUARANTEE_PERIOD "year_1_through_5"
  SHORTFALL_RATE 85
  INSURANCE_COVERAGE $100_000_000
```

### Performance Levels

| Level | Meaning |
|-------|---------|
| P50 | 50% probability of exceedance (median expected) |
| P75 | 75% probability of exceedance |
| P90 | 90% probability of exceedance (conservative) |
| P99 | 99% probability of exceedance (guaranteed minimum) |

### Interpreter Methods

```typescript
// Get performance guarantee status
interpreter.getPerformanceGuaranteeStatus('AnnualEnergy');
// Returns: { p50, p75, p90, p99, actual, performanceLevel, meetsGuarantee, shortfall, shortfallPayment }

// List all performance guarantees
interpreter.getPerformanceGuaranteeNames();
interpreter.hasPerformanceGuarantees();
```

---

## Degradation Schedules

Model asset capacity decline over time.

### Syntax

```proviso
DEGRADATION_SCHEDULE <name>
  [ASSET_TYPE <type>]
  INITIAL_CAPACITY <value>
  [YEAR_1_DEGRADATION <percent>]
  [ANNUAL_DEGRADATION <percent>]
  [MINIMUM_CAPACITY <value>]
  [AFFECTS <metric1>, <metric2>, ...]
  [SCHEDULE
    YEAR_1: <percent>
    YEAR_2: <percent>
    ...]
```

### Example

```proviso
DEGRADATION_SCHEDULE PanelDegradation
  ASSET_TYPE solar_panels
  INITIAL_CAPACITY 200
  YEAR_1_DEGRADATION 2
  ANNUAL_DEGRADATION 0.5
  MINIMUM_CAPACITY 160
  AFFECTS generation_capacity
```

### Interpreter Methods

```typescript
// Get degraded capacity for a specific year
interpreter.getDegradedCapacity('PanelDegradation', 5);
// Returns: { initialCapacity, cumulativeDegradation, effectiveCapacity, capacityPercent, atMinimum }

// Get degradation projection over multiple years
interpreter.getDegradationProjection('PanelDegradation', 10);
// Returns: Array of yearly degradation data

// List all schedules
interpreter.getDegradationScheduleNames();
```

---

## Seasonal Adjustments

Apply seasonal factors to metrics for production variability.

### Syntax

```proviso
SEASONAL_ADJUSTMENT <name>
  METRIC <metric_name>
  SEASON <Q1|Q2|Q3|Q4|Jan|Feb|...>, [...]
  ADJUSTMENT_FACTOR <decimal>
  [REASON "<explanation>"]
```

### Example

```proviso
SEASONAL_ADJUSTMENT WinterProduction
  METRIC generation_MWh
  SEASON Q4, Q1
  ADJUSTMENT_FACTOR 0.65
  REASON "Lower solar irradiance in winter months"

SEASONAL_ADJUSTMENT SummerPeak
  METRIC generation_MWh
  SEASON Q2, Q3
  ADJUSTMENT_FACTOR 1.35
  REASON "Peak solar production in summer"
```

### Interpreter Methods

```typescript
// Get adjustment status for a season
interpreter.getSeasonalAdjustmentStatus('WinterProduction', 'Q1');
// Returns: { name, metric, active, baseValue, adjustedValue, adjustmentFactor }

// Apply adjustments to a metric value
interpreter.applySeasonalAdjustments('generation_MWh', 100000, 'Q1');
// Returns: { adjustedValue, appliedAdjustments }

// Get all adjustment statuses for a season
interpreter.getAllSeasonalAdjustmentStatuses('Q3');
```

---

## Tax Equity Structures

Model partnership flip and other tax equity arrangements.

### Syntax

```proviso
TAX_EQUITY_STRUCTURE <name>
  STRUCTURE_TYPE <partnership_flip|sale_leaseback|inverted_lease>
  [TAX_INVESTOR "<name>"]
  [SPONSOR "<name>"]
  [TAX_CREDIT_ALLOCATION <investor>/<sponsor>]
  [DEPRECIATION_ALLOCATION <investor>/<sponsor>]
  [CASH_ALLOCATION <investor>/<sponsor>]
  [TARGET_RETURN <percent>]
  [BUYOUT_PRICE $<amount>]
```

### Example

```proviso
TAX_EQUITY_STRUCTURE SolarPartnership
  STRUCTURE_TYPE partnership_flip
  TAX_INVESTOR "JP Morgan Tax Equity Fund"
  SPONSOR "SunPower Development LLC"
  TAX_CREDIT_ALLOCATION 99/1
  DEPRECIATION_ALLOCATION 99/1
  CASH_ALLOCATION 90/10
  TARGET_RETURN 8.5
```

### Structure Types

| Type | Description |
|------|-------------|
| `partnership_flip` | Standard partnership with allocation flip at target return |
| `sale_leaseback` | Sale and leaseback arrangement |
| `inverted_lease` | Inverted lease pass-through structure |

### Interpreter Methods

```typescript
interpreter.getTaxEquityStructureStatus('SolarPartnership');
// Returns: { structureType, taxInvestor, sponsor, targetReturn, hasFlipped, ... }

interpreter.getTaxEquityStructureNames();
interpreter.hasTaxEquityStructures();
```

---

## Tax Credits

Model Investment Tax Credit (ITC), Production Tax Credit (PTC), and other credits.

### Syntax

```proviso
TAX_CREDIT <name>
  CREDIT_TYPE <itc|ptc|45X>
  [RATE <percent>]
  [ELIGIBLE_BASIS $<amount>]
  [CREDIT_AMOUNT $<amount>]
  [ADDER <adder_name> + <bonus_percent>]
  [VESTING_PERIOD "<description>"]
  [RECAPTURE_RISK "<description>"]
  [SATISFIES <condition>]
```

### Example

```proviso
TAX_CREDIT SolarITC
  CREDIT_TYPE itc
  RATE 30
  ELIGIBLE_BASIS $145_000_000
  ADDER domestic_content + 10
  ADDER energy_community + 10
  VESTING_PERIOD "5 years"
  RECAPTURE_RISK "20% per year for first 5 years"
  SATISFIES ITC_Earned
```

### Credit Types

| Type | Description |
|------|-------------|
| `itc` | Investment Tax Credit (percentage of eligible basis) |
| `ptc` | Production Tax Credit ($/MWh produced) |
| `45X` | Advanced Manufacturing Credit |

### Adders (IRA Bonus Credits)

| Adder | Bonus |
|-------|-------|
| `domestic_content` | +10% |
| `energy_community` | +10% |
| `low_income_community` | +10-20% |
| `prevailing_wage` | Required for base rate |

### Interpreter Methods

```typescript
interpreter.getTaxCreditStatus('SolarITC');
// Returns: { creditType, baseRate, effectiveRate, eligibleBasis, creditAmount, adders, ... }
```

---

## Depreciation Schedules

Model MACRS depreciation with bonus depreciation.

### Syntax

```proviso
DEPRECIATION_SCHEDULE <name>
  METHOD <macrs_5yr|macrs_7yr|macrs_15yr|straight_line>
  DEPRECIABLE_BASIS $<amount>
  [BONUS_DEPRECIATION <percent>]
  [SCHEDULE
    YEAR_1 <percent>
    YEAR_2 <percent>
    ...]
```

### Example

```proviso
DEPRECIATION_SCHEDULE SolarMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $145_000_000
  BONUS_DEPRECIATION 60
```

### MACRS Rates

**5-Year MACRS:**
| Year | Rate |
|------|------|
| 1 | 20.00% |
| 2 | 32.00% |
| 3 | 19.20% |
| 4 | 11.52% |
| 5 | 11.52% |
| 6 | 5.76% |

**7-Year MACRS:**
| Year | Rate |
|------|------|
| 1 | 14.29% |
| 2 | 24.49% |
| 3 | 17.49% |
| 4-7 | varying |
| 8 | 4.46% |

### Interpreter Methods

```typescript
interpreter.getDepreciationForYear('SolarMACRS', 1);
// Returns: {
//   depreciableBasis, bonusDepreciation, bonusAmount, remainingBasis,
//   regularPercentage, regularAmount, totalDepreciation,
//   cumulativeDepreciation, remainingBookValue
// }
```

---

## Flip Events

Model partnership allocation changes triggered by target returns or dates.

### Syntax

```proviso
FLIP_EVENT <name>
  TRIGGER <target_return|date_certain|pf_event> [<value>]
  PRE_FLIP_ALLOCATION <investor>/<sponsor>
  POST_FLIP_ALLOCATION <investor>/<sponsor>
  [BUYOUT_OPTION <fair_market_value|fixed <amount>>]
  [SATISFIES <condition>]
```

### Example

```proviso
FLIP_EVENT TargetReturnFlip
  TRIGGER target_return 8.0
  PRE_FLIP_ALLOCATION 99/1
  POST_FLIP_ALLOCATION 5/95
  BUYOUT_OPTION fair_market_value
  SATISFIES Partnership_Flipped
```

### Trigger Types

| Trigger | Description |
|---------|-------------|
| `target_return <percent>` | Flip when investor achieves target IRR |
| `date_certain <date>` | Flip on specified date |
| `pf_event` | Flip on project finance event |

### Interpreter Methods

```typescript
// Check flip status
interpreter.getFlipEventStatus('TargetReturnFlip');
// Returns: { trigger, hasTriggered, currentAllocation, preFlipAllocation, postFlipAllocation, ... }

// Trigger the flip
interpreter.triggerFlip('TargetReturnFlip', new Date('2031-06-15'), 8.2);

// Check if triggered
interpreter.isFlipTriggered('TargetReturnFlip');

// Get all triggered flips
interpreter.getTriggeredFlips();
```

---

## Dashboard Components

v2.1 adds four new dashboard components for industry analytics.

### PerformanceChart

Visualizes P50/P75/P90/P99 thresholds with actual performance.

```tsx
<PerformanceChart
  guarantees={data.industry.performanceGuarantees}
  degradation={data.industry.degradation}
/>
```

**Features:**
- Area chart showing P-value thresholds
- Reference line for actual performance
- Performance level indicator (P50/P75/P90/P99/below_p99)
- Degradation impact overlay

### RegulatoryTracker

Shows permit status grouped by agency with expandable sections.

```tsx
<RegulatoryTracker requirements={data.industry.regulatoryRequirements} />
```

**Features:**
- Grouped by agency with collapse/expand
- Phase breakdown (Development/Construction/Operations)
- Status indicators (pending, submitted, approved, denied)
- Completion percentage per agency

### TechnicalProgress

Displays MW installed vs target with bar chart.

```tsx
<TechnicalProgress milestones={data.industry.technicalMilestones} />
```

**Features:**
- Overall progress bar
- Status breakdown grid (Done/Active/Pending/At Risk/Breached)
- Bar chart by milestone
- Critical path indicator
- Days remaining/overdue display

### TaxEquityPanel

Shows tax equity structure with partnership allocations and flip tracking.

```tsx
<TaxEquityPanel
  structure={data.industry.taxEquity.structure}
  credits={data.industry.taxEquity.credits}
  depreciation={data.industry.taxEquity.depreciation}
  flipEvents={data.industry.taxEquity.flipEvents}
/>
```

**Features:**
- Partnership allocation bars (Tax Credits, Cash Distribution)
- Target IRR vs Current IRR
- Tax credit list with adders and vesting progress
- Depreciation schedule display
- Flip event tracking with progress indicators

---

## Example Files

### Solar Utility (200MW)

`examples/solar_utility.proviso` - Flagship example with ITC tax equity:
- All v2.1 constructs
- Partnership flip structure
- Domestic content adder
- Panel degradation schedule
- Seasonal production adjustments

### Wind Farm (150MW)

`examples/wind_onshore.proviso` - Wind-specific example:
- PTC credit structure
- Wind-specific regulatory (FAA, avian)
- Turbine degradation schedule
- Curtailment tracking

### Data Center (50MW)

`examples/data_center.proviso` - Non-energy infrastructure:
- SOC 2/PCI DSS compliance
- 99.999% uptime SLAs
- Power availability guarantees
- No tax equity (different financing)

---

## Integration Example

Complete solar tax equity deal integration:

```proviso
// Tax equity structure
TAX_EQUITY_STRUCTURE SolarPartnership
  STRUCTURE_TYPE partnership_flip
  TAX_INVESTOR "Tax Equity Fund I"
  SPONSOR "Solar Developer LLC"
  TAX_CREDIT_ALLOCATION 99/1
  DEPRECIATION_ALLOCATION 99/1
  CASH_ALLOCATION 95/5
  TARGET_RETURN 7.5

// Investment tax credit
TAX_CREDIT ProjectITC
  CREDIT_TYPE itc
  RATE 30
  ELIGIBLE_BASIS $80_000_000
  ADDER domestic_content + 10
  VESTING_PERIOD "5 years"

// MACRS depreciation
DEPRECIATION_SCHEDULE ProjectMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $80_000_000
  BONUS_DEPRECIATION 60

// Partnership flip
FLIP_EVENT TargetReturnFlip
  TRIGGER target_return 7.5
  PRE_FLIP_ALLOCATION 99/1
  POST_FLIP_ALLOCATION 5/95
  BUYOUT_OPTION fair_market_value
  SATISFIES Partnership_Flipped

// Phase integration
PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE MinDSCR
  REQUIRED Partnership_Flipped  // Flip required for operations

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    InterconnectionComplete,
    ITC_Earned
  )
```

---

## Testing

v2.1 constructs are covered by 70+ tests in `tests/proviso.test.ts`:

- Technical Milestones: 17 tests
- Regulatory Requirements: 11 tests
- Performance Guarantees: 5 tests
- Degradation Schedules: 8 tests
- Seasonal Adjustments: 5 tests
- Tax Equity Structures: 4 tests
- Tax Credits: 5 tests
- Depreciation Schedules: 6 tests
- Flip Events: 8 tests
- Integration tests: 2 tests

Run tests with:

```bash
npm test
```

---

## Version History

| Version | Features |
|---------|----------|
| v2.1.0 | Industry constructs, dashboard analytics |
| v2.0.0 | Post-closing module, forms, versioning |
| v1.0.0 | Project finance (phases, waterfalls, reserves) |
| v0.3.0 | Multi-period data, trailing calculations |
| v0.2.0 | Baskets, amendments, cure rights |
| v0.1.0 | Core parser, covenants, definitions |
