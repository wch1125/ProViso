# ProViso Dashboard

A React-based monitoring dashboard for ProViso credit agreements, connected to a live interpreter that evaluates covenant compliance, tracks milestones, manages reserves, and executes waterfall distributions.

## Quick Start

```bash
# From the project root
cd dashboard
npm install
npm run dev

# Dashboard runs at http://localhost:3000
```

## Architecture Overview

The dashboard follows a React Context pattern to connect the ProViso interpreter to UI components:

```
.proviso file (or default code)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ProVisoProvider (Context)                     │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────┐  │
│  │  Peggy Parser   │ → │  ProVisoInterpreter │ → │ Transformers│ │
│  │  (parse code)   │    │  (evaluate logic)   │    │ (to display)│ │
│  └─────────────────┘    └──────────────────┘    └────────────┘  │
│                              ↑                                   │
│                         Financial Data                           │
│                         (JSON object)                            │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
    Dashboard Components (via useProViso hook)
         │
    ┌────┴────────────────────────────────────────┐
    │             MonitoringDashboard              │
    │  ┌──────────────┐  ┌──────────────────────┐ │
    │  │ ExecutiveSummary│  │ CovenantPanel      │ │
    │  │ PhaseTimeline   │  │ WaterfallChart     │ │
    │  │ MilestoneTracker│  │ ReserveStatus      │ │
    │  │ CPChecklist     │  │ ComplianceTrend    │ │
    │  └──────────────┘  │ ScenarioSimulator   │ │
    │                      │ Industry Analytics  │ │
    │                      └──────────────────────┘ │
    └─────────────────────────────────────────────┘
```

## How Data Flows

### 1. Code Loading

When the dashboard loads, it initializes with default ProViso code (`Sunrise Solar Project`) and default financial data:

1. **ProVisoProvider** wraps the entire app in `App.tsx`
2. **MonitoringDashboard** calls `loadFromCode()` and `loadFinancials()` on mount
3. The **Peggy parser** converts `.proviso` code into an AST
4. The **ProVisoInterpreter** evaluates the AST against financial data
5. **Transformer functions** convert interpreter results to dashboard display types

### 2. User Actions

Users can interact with the dashboard in several ways:

| Action | What Happens |
|--------|--------------|
| **Edit Financials** | Opens slide-out panel, user changes values, clicks "Apply & Recalculate" |
| **Upload File** | Modal accepts `.proviso` (code) or `.json` (financial data) files |
| **Refresh** | Re-evaluates all covenants with current financial data |
| **Scenario Analysis** | Temporarily adjusts financials to see "what if" impact on covenants |

### 3. Computed Results

The interpreter computes and the context provides:

- **Covenants**: Compliance status, headroom, operator, suspended state
- **Baskets**: Capacity, utilization, available amounts
- **Milestones**: Status (pending, achieved, at_risk, breached), dates
- **Reserves**: Balance, target, minimum amounts
- **Waterfall**: Tier distributions, blocked amounts, shortfalls
- **Conditions Precedent**: Checklist items with status
- **Industry Data**: Technical milestones, regulatory tracking, performance guarantees, tax equity (when available)

## Key Files

### Context & State

| File | Purpose |
|------|---------|
| `src/context/ProVisoContext.tsx` | Main context provider with interpreter integration |
| `src/context/index.ts` | Exports `ProVisoProvider`, `useProViso`, `useCovenants` |
| `src/data/default-code.ts` | Default `.proviso` code (Sunrise Solar Project) |
| `src/data/default-financials.ts` | Default JSON financial data |

### Pages

| File | Purpose |
|------|---------|
| `src/pages/monitoring/MonitoringDashboard.tsx` | Main monitoring dashboard |
| `src/pages/deals/DealsPage.tsx` | Deal list with search/filter |
| `src/pages/negotiate/NegotiationStudio.tsx` | Version comparison & markup |
| `src/pages/closing/ClosingDashboard.tsx` | Closing readiness tracking |

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| `ExecutiveSummary` | `src/components/ExecutiveSummary.tsx` | Key metrics overview |
| `PhaseTimeline` | `src/components/PhaseTimeline.tsx` | Construction → Operations timeline |
| `CovenantPanel` | `src/components/CovenantPanel.tsx` | Covenant compliance with headroom bars |
| `WaterfallChart` | `src/components/WaterfallChart.tsx` | Cash distribution visualization |
| `ReserveStatus` | `src/components/ReserveStatus.tsx` | Reserve account balances |
| `MilestoneTracker` | `src/components/MilestoneTracker.tsx` | Milestone status & dates |
| `CPChecklist` | `src/components/CPChecklist.tsx` | Conditions precedent checklist |
| `FinancialDataEditor` | `src/components/FinancialDataEditor.tsx` | Edit financial values |
| `FileUploader` | `src/components/FileUploader.tsx` | Upload .proviso/.json files |

### Connected Components (Interpreter-Aware)

| Component | File | Description |
|-----------|------|-------------|
| `ConnectedScenarioSimulator` | `src/components/postclosing/ConnectedScenarioSimulator.tsx` | "What if" analysis with real calculations |
| `ConnectedComplianceTrendChart` | `src/components/postclosing/ConnectedComplianceTrendChart.tsx` | Historical compliance trends |
| `ComplianceTrendPanel` | (same file) | Multi-covenant trend display |

### Industry Components (v2.1)

| Component | File | Description |
|-----------|------|-------------|
| `PerformanceChart` | `src/components/industry/PerformanceChart.tsx` | P50/P75/P90/P99 performance |
| `RegulatoryTracker` | `src/components/industry/RegulatoryTracker.tsx` | Permit & approval tracking |
| `TechnicalProgress` | `src/components/industry/TechnicalProgress.tsx` | MW installed, etc. |
| `TaxEquityPanel` | `src/components/industry/TaxEquityPanel.tsx` | ITC/PTC, depreciation, flip events |

### Base Components

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `src/components/base/Button.tsx` | Primary/secondary/ghost/danger variants |
| `Modal` | `src/components/base/Modal.tsx` | Dialog overlay |
| `Skeleton` | `src/components/base/Skeleton.tsx` | Loading placeholders |
| `EmptyState` | `src/components/base/EmptyState.tsx` | No data/results states |
| `SearchFilter` | `src/components/base/SearchFilter.tsx` | Search with quick filters |
| `ConfirmationModal` | `src/components/base/ConfirmationModal.tsx` | Delete/submit confirmations |
| `DataTable` | `src/components/base/DataTable.tsx` | Sortable, paginated tables |
| `Tabs` | `src/components/base/Tabs.tsx` | Tab navigation |

## Using the Dashboard

### Editing Financial Data

1. Click **"Edit Financials"** button in the header
2. Expand field groups (Income Statement, Debt Structure, etc.)
3. Modify values using the number inputs
4. Click **"Apply & Recalculate"** to see updated compliance

Field groups:
- **Income Statement**: net_income, interest_expense, tax_expense, depreciation, amortization
- **Debt Structure**: senior_debt, subordinated_debt, senior_interest, senior_principal
- **Project Metrics**: equity_contributed, total_project_cost
- **Cash Flow**: operating_expenses, distributions, monthly_debt_service
- **Balance Sheet**: cash, accounts_receivable, current_assets, current_liabilities

### Uploading Files

1. Click **"Upload"** button in the header
2. Drag-and-drop or click to browse
3. Select a `.proviso` file (replaces agreement code) or `.json` file (replaces financial data)

### Scenario Analysis

The **Scenario Analysis** section lets you test "what if" scenarios:

1. Adjust financial values using sliders or inputs
2. View baseline vs. scenario covenant comparison
3. See which covenants would breach under the scenario

### Compliance History

The **Compliance History** section shows covenant trends over time (simulated data based on current values). When multi-period financial data is available, this will show actual historical compliance.

## Routes

| Route | Page |
|-------|------|
| `/` | Redirects to `/deals` |
| `/deals` | Deal list with search/filter |
| `/deals/:id/negotiate` | Negotiation Studio |
| `/deals/:id/closing` | Closing Dashboard |
| `/deals/:id/monitor` | Monitoring Dashboard (main view) |

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom dark theme
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6

## What Works Today

### Fully Functional

- **Live covenant compliance**: Values calculated from interpreter
- **Headroom visualization**: Progress bars showing margin to thresholds
- **Phase tracking**: Current phase with suspended/active covenants
- **Milestone status**: Pending, achieved, at-risk, breached states
- **Reserve balances**: Current balance vs. target and minimum
- **Waterfall tiers**: Distribution amounts and blocked flows
- **Conditions precedent**: Checklist with status badges
- **Financial editing**: Modify values and see real-time recalculation
- **File upload**: Load custom `.proviso` or `.json` files
- **Scenario simulation**: Test hypothetical financial changes
- **Compliance trends**: Visualize covenant history (simulated)
- **Industry analytics**: Solar/wind/data center metrics (when available)
- **Loading states**: Skeleton placeholders during data fetch
- **Error handling**: Retry functionality for failed loads

### Dashboard UI Components

- DealPageLayout for consistent headers
- Search and filter for deal lists
- Loading skeletons for all major sections
- Empty states for no data scenarios
- Confirmation modals for destructive actions

## What Remains to Be Built

### High Priority

1. **Real Multi-Period Data Support**
   - The compliance history currently shows simulated data based on current covenant values
   - When the backend receives actual multi-period financial submissions, the `ComplianceTrendPanel` should display real historical data
   - Need to wire `getComplianceHistory()` API to actual period data

2. **Waterfall Execution UI**
   - The `WaterfallChart` displays distribution tiers but doesn't have an "Execute Waterfall" button
   - Need to add revenue input and execution trigger
   - Show actual distribution results after execution

3. **Real-Time Data Persistence**
   - Currently all data is in-memory only
   - No database connection (PostgreSQL planned)
   - Financial edits are lost on page refresh

4. **Amendment Application**
   - Dashboard shows current agreement state
   - Need UI to select and apply amendments
   - Show before/after comparison when amendment is applied

### Medium Priority

5. **CP Checklist Management**
   - View-only currently
   - Need ability to mark items as satisfied/waived
   - Date picker for satisfaction dates
   - Upload supporting documents

6. **Draw Request Workflow**
   - `DrawRequestList` component exists but isn't wired to real data
   - Need integration with CP satisfaction checks
   - Approval workflow UI

7. **Milestone Achievement**
   - View-only currently
   - Need "Mark Achieved" button with date picker
   - Trigger phase transitions when conditions met

8. **Reserve Account Operations**
   - Show balances but no fund/draw actions
   - Need "Fund Reserve" and "Draw from Reserve" UI
   - Transaction history view

### Lower Priority

9. **Export/Print**
   - "Export Report" button exists but doesn't do anything
   - Generate PDF compliance report
   - Export to Excel for financial data

10. **Settings Panel**
    - "Settings" button exists but not implemented
    - Configure notification thresholds
    - Set covenant cure periods
    - Customize display preferences

11. **Notification System**
    - Alert when covenant approaches breach threshold
    - Milestone longstop date warnings
    - Reserve minimum triggers

12. **Audit Trail**
    - Log all financial data changes
    - Track who made what changes when
    - Required for regulatory compliance

13. **User Authentication**
    - Currently no auth
    - Need role-based access (Lender, Borrower, Agent)
    - SSO integration

14. **Multi-Deal Comparison**
    - Compare covenant performance across portfolio
    - Aggregate risk view

## Development Notes

### Adding a New Component

1. Create component in `src/components/`
2. Export from `src/components/index.ts`
3. Use `useProViso()` hook to access interpreter state

```tsx
import { useProViso } from '../context';

export function MyComponent() {
  const { covenants, isLoading, error } = useProViso();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {covenants.map(c => (
        <div key={c.name}>{c.name}: {c.compliant ? 'Pass' : 'Fail'}</div>
      ))}
    </div>
  );
}
```

### Adding New Financial Fields

1. Update `src/data/default-financials.ts` with default values
2. Add field to appropriate group in `FinancialDataEditor.tsx`
3. Ensure the field is used in `.proviso` DEFINE statements

### Browser Compatibility Note

The dashboard uses selective imports to avoid Node.js-only modules:

```tsx
// Good - browser compatible
import { parse } from '@proviso/parser.js';
import { ProVisoInterpreter } from '@proviso/interpreter.js';
import type { Program } from '@proviso/types.js';

// Bad - includes Node.js modules (fs, path)
import { parse, ProVisoInterpreter } from '@proviso';
```

The ontology system (`src/ontology.ts`) uses Node.js file APIs and cannot be imported in the browser bundle.

## Versioning

This dashboard is part of ProViso v2.1.0. The dashboard wiring was completed across 6 phases:

1. **Phase 1**: ProViso Context Provider
2. **Phase 2**: MonitoringDashboard live data wiring
3. **Phase 3**: FinancialDataEditor component
4. **Phase 4**: ConnectedScenarioSimulator
5. **Phase 5**: ConnectedComplianceTrendChart
6. **Phase 6**: FileUploader

See `.claude/status/current-status.md` for full development history.
