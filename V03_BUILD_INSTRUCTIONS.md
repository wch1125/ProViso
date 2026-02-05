# CreditLang v0.3 Build Instructions

## Multi-Period & Trailing Calculations

**Version:** 0.3.0  
**Target:** Enable period-based covenant testing with trailing calculations  
**Prerequisite:** v0.2.4 (150 tests passing)

---

## Overview

Credit agreement covenants are typically tested on a **trailing** basis:

> "Leverage Ratio" means, as of any date of determination, the ratio of (a) Total Debt as of such date to (b) **Consolidated EBITDA for the four fiscal quarter period ending on such date**.

This means:
- Financial data comes in periods (quarters, months)
- Definitions can reference trailing periods ("last 4 quarters")
- Covenants are tested "as of" a specific date
- Historical compliance queries are common ("were we compliant in Q3?")

v0.3 adds the infrastructure to support this.

---

## Current State

**Financial Data Model:**
```typescript
// src/types.ts - current
export type FinancialData = Record<string, number>;
```

**Example current usage:**
```json
{
  "net_income": 12500000,
  "interest_expense": 4500000,
  "funded_debt": 156000000,
  "EBITDA": 43500000
}
```

This is a **snapshot** — it represents a single point in time with no period context.

---

## Target State

### 1. Multi-Period Financial Data

Support financial data organized by period:

```typescript
// New types
export interface PeriodData {
  period: string;        // "2024-Q1", "2024-Q2", "2024-12", etc.
  periodType: 'quarterly' | 'monthly' | 'annual';
  periodEnd: string;     // ISO date: "2024-03-31"
  data: Record<string, number>;
}

export interface MultiPeriodFinancialData {
  periods: PeriodData[];
  // Optional: pre-calculated trailing values
  trailing?: Record<string, Record<string, number>>; // e.g., trailing["LTM"]["EBITDA"]
}

// Backward compatible: still support flat data
export type FinancialData = Record<string, number> | MultiPeriodFinancialData;
```

**Example multi-period data:**
```json
{
  "periods": [
    {
      "period": "2024-Q1",
      "periodType": "quarterly",
      "periodEnd": "2024-03-31",
      "data": {
        "net_income": 3100000,
        "interest_expense": 1100000,
        "EBITDA": 10500000
      }
    },
    {
      "period": "2024-Q2",
      "periodType": "quarterly", 
      "periodEnd": "2024-06-30",
      "data": {
        "net_income": 3200000,
        "interest_expense": 1150000,
        "EBITDA": 11000000
      }
    },
    {
      "period": "2024-Q3",
      "periodType": "quarterly",
      "periodEnd": "2024-09-30",
      "data": {
        "net_income": 3000000,
        "interest_expense": 1100000,
        "EBITDA": 10800000
      }
    },
    {
      "period": "2024-Q4",
      "periodType": "quarterly",
      "periodEnd": "2024-12-31",
      "data": {
        "net_income": 3200000,
        "interest_expense": 1150000,
        "EBITDA": 11200000
      }
    }
  ]
}
```

### 2. Trailing Period Expressions

New grammar for trailing calculations:

```
DEFINE TrailingEBITDA AS
  TRAILING 4 QUARTERS OF EBITDA

DEFINE LTM_EBITDA AS
  TRAILING 12 MONTHS OF EBITDA

DEFINE TTM_Revenue AS
  TRAILING 12 MONTHS OF revenue
```

**Grammar additions:**
```pegjs
TrailingExpression
  = "TRAILING" _ count:Integer _ period:TrailingPeriod _ "OF" _ expr:Expression
    { return { type: 'Trailing', count, period, expression: expr }; }

TrailingPeriod
  = "QUARTERS"i { return 'quarters'; }
  / "MONTHS"i { return 'months'; }
  / "YEARS"i { return 'years'; }
```

**AST Type:**
```typescript
export interface TrailingExpression {
  type: 'Trailing';
  count: number;
  period: 'quarters' | 'months' | 'years';
  expression: Expression;
}
```

### 3. Period-Scoped Evaluation

The interpreter needs to evaluate "as of" a specific period:

```typescript
class CreditLangInterpreter {
  // New: current evaluation period
  private evaluationPeriod: string | null = null;
  
  // Set the evaluation context to a specific period
  setEvaluationPeriod(period: string): void {
    this.evaluationPeriod = period;
  }
  
  // Clear period context (use latest/snapshot data)
  clearEvaluationPeriod(): void {
    this.evaluationPeriod = null;
  }
  
  // Enhanced: resolve identifier considering period context
  private resolveIdentifier(name: string): number {
    // If we have multi-period data and an evaluation period set
    if (this.isMultiPeriodData() && this.evaluationPeriod) {
      return this.getValueForPeriod(name, this.evaluationPeriod);
    }
    // Fall back to current behavior for snapshot data
    return this.getSnapshotValue(name);
  }
  
  // New: evaluate trailing expression
  private evaluateTrailing(expr: TrailingExpression): number {
    const periods = this.getTrailingPeriods(expr.count, expr.period);
    let sum = 0;
    for (const period of periods) {
      const savedPeriod = this.evaluationPeriod;
      this.evaluationPeriod = period;
      sum += this.evaluate(expr.expression);
      this.evaluationPeriod = savedPeriod;
    }
    return sum;
  }
}
```

### 4. CLI Enhancements

Add `--as-of` flag to relevant commands:

```bash
# Check compliance as of Q3 2024
creditlang status agreement.crl -d financials.json --as-of 2024-Q3

# Check covenant as of a specific period
creditlang check agreement.crl -d financials.json --as-of 2024-Q3

# Simulate changes as of a period
creditlang simulate agreement.crl -d financials.json --as-of 2024-Q3 -c '{"funded_debt": 180000000}'
```

New command for historical compliance report:

```bash
# Show compliance across all periods
creditlang history agreement.crl -d financials.json

# Output:
# Period     MaxLeverage  MinCoverage  MinLiquidity  Status
# 2024-Q1    3.2x ✓       2.8x ✓       $25M ✓        COMPLIANT
# 2024-Q2    3.4x ✓       2.7x ✓       $22M ✓        COMPLIANT  
# 2024-Q3    3.8x ✓       2.5x ✓       $18M ✓        COMPLIANT
# 2024-Q4    4.2x ✓       2.4x ⚠       $15M ✓        BREACH (MinCoverage)
```

---

## Implementation Tasks

### Task 1: Multi-Period Data Types

**File:** `src/types.ts`

Add:
```typescript
export interface PeriodData {
  period: string;
  periodType: 'quarterly' | 'monthly' | 'annual';
  periodEnd: string;
  data: Record<string, number>;
}

export interface MultiPeriodFinancialData {
  periods: PeriodData[];
  trailing?: Record<string, Record<string, number>>;
}

export function isMultiPeriodData(data: unknown): data is MultiPeriodFinancialData {
  return typeof data === 'object' && data !== null && 'periods' in data;
}

export function isPeriodData(data: unknown): data is PeriodData {
  return typeof data === 'object' && data !== null && 
         'period' in data && 'data' in data;
}
```

**Tests:** 5+ tests for type guards

### Task 2: Grammar Extensions

**File:** `grammar/creditlang.pegjs`

Add `TrailingExpression` to the expression hierarchy (should be at same level as function calls):

```pegjs
// Add to Expression alternatives
TrailingExpression
  = "TRAILING"i _ count:Integer _ period:TrailingPeriod _ "OF"i _ expr:PrimaryExpression
    { return { type: 'Trailing', count: count, period: period, expression: expr }; }

TrailingPeriod
  = "QUARTERS"i { return 'quarters'; }
  / "QUARTER"i { return 'quarters'; }
  / "MONTHS"i { return 'months'; }
  / "MONTH"i { return 'months'; }
  / "YEARS"i { return 'years'; }
  / "YEAR"i { return 'years'; }
```

**Tests:** 8+ tests for parsing trailing expressions

### Task 3: Interpreter Multi-Period Support

**File:** `src/interpreter.ts`

Add:
```typescript
// New private fields
private multiPeriodData: MultiPeriodFinancialData | null = null;
private evaluationPeriod: string | null = null;

// New public methods
setEvaluationPeriod(period: string): void
clearEvaluationPeriod(): void
getAvailablePeriods(): string[]
getEvaluationPeriod(): string | null

// Enhanced loadFinancials to detect multi-period data
loadFinancials(data: FinancialData | MultiPeriodFinancialData): void

// New private methods
private isMultiPeriodMode(): boolean
private getValueForPeriod(name: string, period: string): number
private getTrailingPeriods(count: number, periodType: 'quarters' | 'months' | 'years'): string[]
private evaluateTrailing(expr: TrailingExpression): number
private sortPeriods(periods: string[]): string[]
```

**Key logic for `getTrailingPeriods`:**
```typescript
private getTrailingPeriods(count: number, periodType: string): string[] {
  if (!this.multiPeriodData) return [];
  
  // Sort periods chronologically
  const sorted = this.sortPeriods(this.multiPeriodData.periods.map(p => p.period));
  
  // Find the current period index
  const currentIdx = this.evaluationPeriod 
    ? sorted.indexOf(this.evaluationPeriod)
    : sorted.length - 1;
  
  if (currentIdx < 0) return [];
  
  // Get the last N periods ending at current
  const startIdx = Math.max(0, currentIdx - count + 1);
  return sorted.slice(startIdx, currentIdx + 1);
}
```

**Tests:** 15+ tests for multi-period evaluation

### Task 4: CLI Enhancements

**File:** `src/cli.ts`

Add `--as-of <period>` option to:
- `status` command
- `check` command  
- `baskets` command
- `simulate` command

Add new `history` command:
```typescript
program
  .command('history <file>')
  .description('Show compliance history across all periods')
  .option('-d, --data <file>', 'Multi-period financial data JSON')
  .option('--covenants-only', 'Show only covenant compliance')
  .option('--json', 'Output as JSON')
  .action(async (file, options) => {
    // Implementation
  });
```

**Tests:** 8+ tests for CLI period support

### Task 5: Example Files

**File:** `examples/multi_period_financials.json`
```json
{
  "periods": [
    {
      "period": "2024-Q1",
      "periodType": "quarterly",
      "periodEnd": "2024-03-31",
      "data": {
        "net_income": 3100000,
        "interest_expense": 1100000,
        "tax_expense": 800000,
        "depreciation": 1200000,
        "amortization": 400000,
        "funded_debt": 150000000,
        "cash": 28000000,
        "total_assets": 340000000
      }
    },
    {
      "period": "2024-Q2",
      "periodType": "quarterly",
      "periodEnd": "2024-06-30",
      "data": {
        "net_income": 3200000,
        "interest_expense": 1150000,
        "tax_expense": 850000,
        "depreciation": 1200000,
        "amortization": 400000,
        "funded_debt": 152000000,
        "cash": 26000000,
        "total_assets": 345000000
      }
    },
    {
      "period": "2024-Q3",
      "periodType": "quarterly",
      "periodEnd": "2024-09-30",
      "data": {
        "net_income": 3000000,
        "interest_expense": 1100000,
        "tax_expense": 780000,
        "depreciation": 1250000,
        "amortization": 420000,
        "funded_debt": 156000000,
        "cash": 24000000,
        "total_assets": 350000000
      }
    },
    {
      "period": "2024-Q4",
      "periodType": "quarterly",
      "periodEnd": "2024-12-31",
      "data": {
        "net_income": 3200000,
        "interest_expense": 1150000,
        "tax_expense": 820000,
        "depreciation": 1250000,
        "amortization": 420000,
        "funded_debt": 160000000,
        "cash": 22000000,
        "total_assets": 355000000
      }
    }
  ]
}
```

**File:** `examples/trailing_definitions.crl`
```
// Trailing Calculation Example
// CreditLang v0.3

// Quarterly values
DEFINE QuarterlyEBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

// Trailing calculations
DEFINE LTM_EBITDA AS
  TRAILING 4 QUARTERS OF QuarterlyEBITDA

DEFINE LTM_InterestExpense AS
  TRAILING 4 QUARTERS OF interest_expense

// Ratios using trailing values
DEFINE Leverage AS
  funded_debt / LTM_EBITDA

DEFINE InterestCoverage AS
  LTM_EBITDA / LTM_InterestExpense

// Covenants tested quarterly
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

COVENANT MinInterestCoverage
  REQUIRES InterestCoverage >= 2.50
  TESTED QUARTERLY
```

---

## Acceptance Criteria

v0.3 is complete when:

1. **Multi-Period Data:**
   - [ ] `PeriodData` and `MultiPeriodFinancialData` types defined
   - [ ] Type guards (`isMultiPeriodData`, `isPeriodData`) work
   - [ ] Interpreter detects and handles both data formats
   - [ ] Backward compatible with flat `FinancialData`

2. **Trailing Expressions:**
   - [ ] Grammar parses `TRAILING N QUARTERS/MONTHS/YEARS OF expr`
   - [ ] AST includes `TrailingExpression` type
   - [ ] Interpreter evaluates trailing by summing across periods
   - [ ] Nested trailing expressions work

3. **Period-Scoped Evaluation:**
   - [ ] `setEvaluationPeriod()` / `clearEvaluationPeriod()` methods
   - [ ] `getAvailablePeriods()` returns sorted period list
   - [ ] Identifiers resolve to period-specific values
   - [ ] Covenants can be checked "as of" a period

4. **CLI:**
   - [ ] `--as-of <period>` flag on status/check/baskets/simulate
   - [ ] `history` command shows compliance across periods
   - [ ] JSON output includes period information

5. **Examples:**
   - [ ] `multi_period_financials.json` with 4 quarters of data
   - [ ] `trailing_definitions.crl` demonstrating trailing syntax

6. **Tests:**
   - [ ] 40+ new tests
   - [ ] Target: ~190 total tests

---

## Implementation Order

Recommended sequence:

1. **Types first** — Add `PeriodData`, `MultiPeriodFinancialData`, type guards
2. **Grammar** — Add `TrailingExpression` parsing
3. **Interpreter core** — Multi-period detection, period-scoped evaluation
4. **Trailing evaluation** — Implement `evaluateTrailing()`
5. **CLI** — Add `--as-of` flag, then `history` command
6. **Examples** — Create sample files
7. **Documentation** — Update README, CLAUDE.md

---

## Edge Cases to Handle

1. **Insufficient periods for trailing:**
   - If asking for "TRAILING 4 QUARTERS" but only 2 periods exist
   - Option A: Error
   - Option B: Return sum of available periods with warning
   - **Recommendation:** Option B with warning

2. **Period type mismatch:**
   - `TRAILING 4 QUARTERS` with monthly data
   - **Recommendation:** Convert (4 quarters = 12 months) or error with helpful message

3. **No evaluation period set:**
   - When multi-period data loaded but no `--as-of` specified
   - **Recommendation:** Default to latest period

4. **Mixed data (some metrics only in some periods):**
   - **Recommendation:** Return 0 for missing metrics with warning

5. **Date parsing:**
   - Period strings like "2024-Q1", "2024-03", "Q1 2024"
   - **Recommendation:** Support common formats, document expected format

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types.ts` | Add `PeriodData`, `MultiPeriodFinancialData`, type guards |
| `grammar/creditlang.pegjs` | Add `TrailingExpression`, `TrailingPeriod` |
| `src/interpreter.ts` | Multi-period support, trailing evaluation |
| `src/cli.ts` | `--as-of` flag, `history` command |
| `src/validator.ts` | Validate trailing references |
| `tests/creditlang.test.ts` | 40+ new tests |
| `examples/` | New example files |
| `README.md` | Document new features |
| `CLAUDE.md` | Update to v0.3 |
| `.claude/status/` | Update status and changelog |

---

## Session Logging

Create build log at:
`.claude/logs/2026-XX-XX-builder-multi-period.md`

Update:
- `.claude/status/current-status.md` → version 0.3.0
- `.claude/status/changelog.md` → add v0.3.0 section

---

## Notes

- The flat `FinancialData` format must continue to work (many tests use it)
- Period strings should be sortable chronologically ("2024-Q1" < "2024-Q2")
- Consider using a period utilities module if the logic gets complex
- The `TESTED QUARTERLY` clause on covenants could eventually trigger automatic period selection, but that's a v0.3.1 enhancement
