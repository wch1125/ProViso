# ProViso Getting Started Guide

ProViso is a domain-specific language (DSL) for expressing credit agreements as executable logic. Source files read like legal documents but run like programs—answering compliance questions, tracking basket utilization, and simulating proposed transactions.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [ProViso Syntax](#proviso-syntax)
4. [CLI Commands](#cli-commands)
5. [Dashboard](#dashboard)
6. [Common Workflows](#common-workflows)

---

## Installation

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd proviso

# Install dependencies
npm install

# Build the project
npm run build

# Verify installation
npm test
```

### Dashboard Setup (Optional)

```bash
# Install dashboard dependencies
cd dashboard
npm install
cd ..

# Build dashboard for production
npm run dashboard:build

# Or run dashboard in development mode
npm run dashboard
```

---

## Quick Start

### 1. Your First Credit Agreement

Create a file called `my_facility.proviso`:

```proviso
// Define key financial metrics
DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation

DEFINE TotalDebt AS
  funded_debt + capital_leases

DEFINE Leverage AS
  TotalDebt / EBITDA

// Financial covenant
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

// Investment basket with $25M capacity
BASKET GeneralInvestments
  CAPACITY $25_000_000
```

### 2. Create Financial Data

Create a file called `financials.json`:

```json
{
  "net_income": 15000000,
  "interest_expense": 5000000,
  "tax_expense": 4000000,
  "depreciation": 3000000,
  "funded_debt": 80000000,
  "capital_leases": 10000000
}
```

### 3. Check Compliance

```bash
# Check covenant compliance
npm run dev -- check my_facility.proviso -d financials.json

# Get full status report
npm run dev -- status my_facility.proviso -d financials.json
```

Expected output:

```
Covenant Status:
  MaxLeverage: COMPLIANT (actual: 3.33 vs required: <= 4.50)
    Headroom: 1.17
```

---

## ProViso Syntax

### DEFINE - Computed Values

Definitions create named calculations that can reference financial data or other definitions.

```proviso
// Simple definition
DEFINE EBITDA AS net_income + interest_expense + tax_expense + depreciation

// With exclusions
DEFINE AdjustedEBITDA AS EBITDA EXCLUDING extraordinary_items

// With caps
DEFINE CappedAddback AS stock_comp CAPPED AT $5_000_000

// Trailing calculations (v0.3+)
DEFINE LTM_EBITDA AS TRAILING 4 QUARTERS OF EBITDA
```

### COVENANT - Financial Tests

Covenants specify financial tests the borrower must pass.

```proviso
// Basic covenant
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

// With cure rights
COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $10_000_000

// With step-downs (threshold changes over time)
COVENANT MaxSeniorLeverage
  REQUIRES SeniorLeverage <= 3.50 UNTIL 2025-12-31, THEN <= 3.00
  TESTED QUARTERLY
```

### BASKET - Capacity Limits

Baskets define permitted capacity for restricted actions.

```proviso
// Fixed capacity
BASKET GeneralInvestments
  CAPACITY $25_000_000

// Grower basket (scales with company size)
BASKET PermittedAcquisitions
  CAPACITY GreaterOf($50_000_000, 15% * EBITDA)
  FLOOR $30_000_000

// Builder basket (accumulates over time)
BASKET AvailableAmount
  BUILDS_FROM RetainedExcessCashFlow
  STARTING $0
  MAXIMUM $100_000_000
```

### CONDITION - Reusable Boolean Expressions

```proviso
CONDITION ProFormaCompliant AS
  ProFormaLeverage <= 4.00 AND ProFormaCoverage >= 2.50

CONDITION MaterialAcquisition AS
  AcquisitionValue > $25_000_000
```

### PROHIBIT/EXCEPT - Negative Covenants

```proviso
PROHIBIT Dividends
  EXCEPT IF ProFormaCompliant AND Leverage <= 3.50
```

### EVENT - Default Triggers

```proviso
EVENT CrossDefault
  TRIGGERS WHEN other_debt_default > $10_000_000
  CONSEQUENCE -> EventOfDefault
```

---

## CLI Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `parse` | Parse .proviso file and output AST |
| `validate` | Syntax and semantic validation |
| `check` | Covenant compliance check |
| `status` | Full compliance report |

### Basket Commands

| Command | Description |
|---------|-------------|
| `baskets` | Show basket utilization |
| `ledger` | Basket transaction history |
| `accumulate` | Builder basket accumulation |
| `simulate` | Pro forma simulation |

### Project Finance Commands (v1.0)

| Command | Description |
|---------|-------------|
| `phase` | Current phase and transition status |
| `milestones` | Construction milestone tracking |
| `reserves` | Reserve account status |
| `waterfall` | Execute waterfall distribution |
| `draw` | Check conditions precedent |

### Other Commands

| Command | Description |
|---------|-------------|
| `query` | Prohibition checking |
| `cure` | Apply cure to breached covenant |
| `amendments` | List applied amendments |
| `history` | Compliance history across periods |

### Examples

```bash
# Parse and validate
npm run dev -- validate my_facility.proviso

# Check covenant compliance
npm run dev -- check my_facility.proviso -d financials.json

# Full status report
npm run dev -- status my_facility.proviso -d financials.json

# Simulate a transaction
npm run dev -- simulate my_facility.proviso -d financials.json \
  --basket GeneralInvestments --amount 5000000

# Check basket capacity
npm run dev -- baskets my_facility.proviso -d financials.json

# With amendments
npm run dev -- status my_facility.proviso -d financials.json \
  --amendments amendment_001.proviso

# For a specific period (multi-period data)
npm run dev -- check my_facility.proviso -d multi_period.json --as-of 2026-Q1

# Compliance history
npm run dev -- history my_facility.proviso -d multi_period.json
```

---

## Dashboard

The ProViso Dashboard provides a visual interface for monitoring compliance.

### Starting the Dashboard

```bash
# Development mode (with hot reload)
npm run dashboard

# Production build
npm run dashboard:build
npm run dashboard:preview
```

### Dashboard Routes

| Route | Description |
|-------|-------------|
| `/deals` | Deal list - entry point |
| `/deals/:id/negotiate` | Negotiation Studio |
| `/deals/:id/closing` | Closing Dashboard |
| `/deals/:id/monitor` | Post-Closing Monitoring |

### Features

- **Executive Summary**: Key metrics overview
- **Phase Timeline**: Visual construction/operations phases
- **Covenant Panel**: Active vs suspended covenant display
- **Waterfall Visualization**: Cash distribution breakdown
- **Reserve Status**: Balance tracking
- **Milestone Tracker**: Construction progress
- **CP Checklist**: Conditions precedent tracking
- **Performance Chart**: P50/P75/P90/P99 guarantees (v2.1)
- **Regulatory Tracker**: Permit status by agency (v2.1)
- **Technical Progress**: MW installed tracking (v2.1)
- **Tax Equity Panel**: Partnership flip visualization (v2.1)

---

## Common Workflows

### Workflow 1: Checking Covenant Compliance

```bash
# 1. Write your credit agreement in ProViso
# 2. Prepare financial data JSON
# 3. Check compliance
npm run dev -- check facility.proviso -d financials.json
```

### Workflow 2: Simulating a Transaction

Test the impact of a proposed investment before execution:

```bash
# Check current capacity
npm run dev -- baskets facility.proviso -d financials.json

# Simulate the investment
npm run dev -- simulate facility.proviso -d financials.json \
  --basket GeneralInvestments --amount 10000000

# Review pro forma compliance
```

### Workflow 3: Tracking Builder Basket Accumulation

```bash
# Record retained cash flow accumulation
npm run dev -- accumulate facility.proviso -d financials.json \
  --basket AvailableAmount --amount 2500000 --description "Q4 excess cash flow"

# View basket ledger
npm run dev -- ledger facility.proviso -d financials.json --basket AvailableAmount
```

### Workflow 4: Applying Amendments

Create an amendment file (`amendment_001.proviso`):

```proviso
AMENDMENT LeverageRelief
  EFFECTIVE_DATE 2026-03-15

  MODIFIES MaxLeverage
    REPLACES REQUIRES Leverage <= 4.50
    WITH REQUIRES Leverage <= 5.00
```

Apply it:

```bash
npm run dev -- status facility.proviso -d financials.json \
  --amendments amendment_001.proviso
```

### Workflow 5: Multi-Period Compliance History

Prepare multi-period data (`multi_period.json`):

```json
{
  "periods": [
    {
      "period": "2025-Q4",
      "endDate": "2025-12-31",
      "data": { "net_income": 14000000, ... }
    },
    {
      "period": "2026-Q1",
      "endDate": "2026-03-31",
      "data": { "net_income": 15000000, ... }
    }
  ]
}
```

Check compliance history:

```bash
npm run dev -- history facility.proviso -d multi_period.json
```

---

## Example Files

The `examples/` directory contains sample files:

| File | Description |
|------|-------------|
| `corporate_revolver.proviso` | Sample corporate credit agreement |
| `project_finance.proviso` | Project finance facility example |
| `solar_utility.proviso` | Solar with ITC tax equity (v2.1) |
| `wind_onshore.proviso` | Wind farm with PTC (v2.1) |
| `data_center.proviso` | Data center infrastructure (v2.1) |
| `amendment_001.proviso` | Amendment overlay example |
| `q3_2024_financials.json` | Simple financial data |
| `multi_period_financials.json` | Multi-period data format |
| `project_finance_demo.json` | Project finance demo data |

---

## Next Steps

- Explore the [examples/](../examples/) directory for more complex scenarios
- Review [CLAUDE.md](../CLAUDE.md) for technical architecture
- Read [V2_1_INDUSTRY_CONSTRUCTS.md](./V2_1_INDUSTRY_CONSTRUCTS.md) for solar/wind/data center specifics
- Check test files in [tests/](../tests/) for API usage patterns
- Run the Dashboard to visualize compliance data

---

## Troubleshooting

### "Parse error" when running commands

Ensure your .proviso file follows ProViso syntax. Common issues:
- Use `TESTED QUARTERLY` (uppercase), not `TESTED quarterly`
- Numbers can use underscores: `$25_000_000`
- Comments start with `//`

### "Financial data not found"

Check your JSON file path is correct and the file contains valid JSON.

### Dashboard won't start

```bash
# Ensure dashboard dependencies are installed
cd dashboard && npm install && cd ..

# Check for port conflicts (default: 3000)
npm run dashboard -- --port 3001
```

### Tests failing

```bash
# Rebuild the project
npm run build

# Run tests with verbose output
npm test -- --reporter=verbose
```

---

## Support

- File issues at the project repository
- Check existing tests for API usage examples
- Review CLAUDE.md for architecture documentation
