# Scout Reconnaissance Report

**Project:** ProViso Dashboard Analysis
**Date:** 2026-02-03
**Objective:** Review dashboard depth and identify improvements

## Initial Orientation

### What I understood coming in
- ProViso is a DSL for credit agreements with a full interpreter backend
- Dashboard is a React SPA with TailwindCSS dark theme
- v2.1 includes industry-specific constructs (solar, wind, tax equity)
- User concern: dashboard feels "surface level without depth"

### What I was looking for
- Connection between dashboard and actual interpreter
- Data depth vs. display complexity
- Interactive capabilities
- Gaps between backend functionality and frontend representation

## Executive Summary

**The user's intuition is correct.** The dashboard is essentially a static display shell with hardcoded demo data. Despite having a sophisticated interpreter backend that can:
- Execute real .proviso files
- Check covenant compliance with actual calculations
- Run pro forma simulations
- Track basket utilization over time
- Execute waterfall distributions

...the dashboard shows **none of this in action**. It renders static demo data with no connection to the interpreter. The components are well-designed visually but functionally hollow.

## Core Finding: Dashboard is Disconnected from Backend

### The Disconnect

**Backend capabilities (src/interpreter.ts):**
- 1,500+ lines of evaluation logic
- Real calculation: `checkCovenant()`, `executeWaterfall()`, `runSimulation()`
- Multi-period financial data support
- Amendment overlay system
- Phase transitions, milestone tracking
- Tax equity flip calculations

**Dashboard reality (dashboard/src/):**
```typescript
// MonitoringDashboard.tsx:30
const data = demoData;  // Hardcoded static data, no interpreter
```

Every page loads static demo data:
- `MonitoringDashboard` → `demoData` from `data/demo.ts`
- `DealList` → `demoDeal` from `data/negotiation-demo.ts`
- `ClosingDashboard` → `closingDeal` from `data/closing-demo.ts`
- `NegotiationStudio` → `demoVersions` from `data/negotiation-demo.ts`

### What Makes It Feel "Surface Level"

1. **No Live Calculations**
   - Covenant compliance numbers are hardcoded, not computed
   - Progress bars show static percentages
   - "Headroom" values are pre-written, not calculated from `threshold - actual`

2. **No User Interaction with Data**
   - Can't input actual financial data
   - Can't upload a .proviso file
   - Can't modify values and see covenant impact
   - ScenarioSimulator exists but is **never connected to anything**

3. **Components Show Data, Don't Process It**
   - `CovenantPanel` displays `CovenantData[]` passed in
   - `WaterfallChart` shows pre-computed tiers
   - `PerformanceChart` renders static P50/P90 values
   - Nothing calls the interpreter

4. **No Time Dimension**
   - Backend supports `TRAILING N QUARTERS OF expr`
   - Backend has `getComplianceHistory()`
   - Dashboard shows single-point-in-time snapshots
   - `ComplianceTrendChart` exists but isn't used on any page

5. **Forms Don't Generate Code**
   - `NegotiationStudio` says "Form-based editing coming soon"
   - The form system exists in `src/hub/forms/` but isn't wired to UI
   - Can't create/edit covenants, baskets, definitions

## Specific Gaps Identified

### Missing Interactive Features

| Feature | Backend Support | Dashboard Status |
|---------|-----------------|------------------|
| Parse .proviso file | `parse()` | Not wired |
| Check covenants | `checkAllCovenants()` | Shows static data |
| Pro forma simulation | `runSimulation()` | Component exists, not connected |
| Basket utilization | `getAllBasketStatus()` | Shows static data |
| Waterfall execution | `executeWaterfall()` | Shows static data |
| Phase transitions | `checkTransitions()` | Shows static data |
| Milestone tracking | `checkMilestone()` | Shows static data |
| Cure rights | `applyCure()` | Not in dashboard |
| Amendment overlay | `applyAmendment()` | Not in dashboard |
| Multi-period history | `getComplianceHistory()` | Not shown |

### Components Built but Unused

- `ComplianceTrendChart` - Built for history, never mounted
- `DrawRequestList` - Built for draws, never mounted
- `FinancialSubmissionForm` - Built for data entry, never mounted
- `ScenarioSimulator` - Built for what-if, never connected to interpreter

### Missing Dashboard Pages/Sections

1. **File Upload/Parser View**
   - Let users upload .proviso files
   - Show parsed AST structure
   - Validate syntax and semantics

2. **Financial Data Entry**
   - Input current period financials
   - Upload JSON data file
   - Edit values directly

3. **Covenant Detail Drilldown**
   - Click covenant → see calculation breakdown
   - Show DEFINE chain (how EBITDA was computed)
   - Show historical trend for this covenant

4. **Basket Transaction Ledger**
   - Backend tracks all basket usage
   - Dashboard doesn't show transaction history
   - Should show: date, amount, description, remaining capacity

5. **Amendment Manager**
   - Backend has full amendment overlay system
   - Dashboard shows nothing about amendments
   - Should show: active amendments, diff view, apply/remove

6. **Simulation Workbench**
   - Connect ScenarioSimulator to real interpreter
   - Let users change financials → see covenant impact
   - Pro forma acquisition/dividend analysis

7. **Compliance Calendar**
   - Backend knows testing frequency per covenant
   - No visual calendar of upcoming tests
   - Alert system for approaching deadlines

8. **Export/Reporting**
   - "Export Report" button does nothing
   - Should generate compliance certificate
   - Should export to Word (backend supports this!)

## Why This Matters

The ProViso language and interpreter are **genuinely sophisticated**. The backend can answer real compliance questions:

```typescript
// This actually works in the CLI:
proviso check facility.proviso -d financials.json
// Output: Covenant compliance with actual calculations

proviso simulate facility.proviso -d financials.json \
  --adjust "EBITDA:-10%" --adjust "TotalDebt:+5M"
// Output: Pro forma impact of transaction
```

But users accessing the dashboard see only a **static mockup** of what the system could do. It's like having a Ferrari engine and displaying it in a model car.

## Recommended Improvements

### Priority 1: Wire Dashboard to Interpreter

**Create a data layer that:**
1. Loads .proviso files (or demo file by default)
2. Parses with actual parser
3. Evaluates with actual interpreter
4. Passes results to existing components

This could be React Context:
```typescript
// Sketch of what's needed
const ProVisoContext = createContext<{
  interpreter: ProVisoInterpreter;
  financials: FinancialData;
  checkCovenants: () => CovenantResult[];
  simulate: (adjustments: Adjustment[]) => SimulationResult;
}>();
```

### Priority 2: Add Interactive Features

**In order of impact:**

1. **Financial Data Editor** - Input financials, see immediate covenant recalculation
2. **Scenario Simulator** - Connect existing component to interpreter
3. **Covenant Drilldown** - Click to see calculation chain
4. **Compliance History** - Use existing backend support for trends
5. **File Upload** - Parse user's .proviso files

### Priority 3: New Modules

**Based on backend capabilities:**

1. **Basket Ledger View** - Transaction history with running totals
2. **Amendment Overlay Manager** - Apply/view/compare amendments
3. **Cure Rights Tracker** - Uses remaining, amounts, expiry
4. **Phase Transition Dashboard** - Prerequisites, progress to next phase
5. **Waterfall Simulation** - Change revenue → see distribution cascade

### Priority 4: UX Depth

**Make existing components smarter:**

1. **Tooltips with calculation breakdown**
   - Hover over "Leverage: 4.5x" → see "TotalDebt (120M) / EBITDA (26.7M)"

2. **Comparative indicators**
   - This period vs. last period
   - Vs. covenant threshold
   - Trend arrows with delta values

3. **Drill-down navigation**
   - Covenant → Click → Definition → Click → Component values

4. **Alert System**
   - Approaching threshold (yellow zone)
   - Cure rights used
   - Milestone at risk

## Architecture Recommendation

```
User Interaction
        │
        ▼
┌─────────────────────────────────────┐
│  React Dashboard (existing)         │
│  - Components work, just need data  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  NEW: ProViso Data Layer            │
│  - Context provider                 │
│  - React Query for caching          │
│  - WebSocket for live updates       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  NEW: API Layer (REST or tRPC)      │
│  - /parse, /check, /simulate        │
│  - /baskets, /amendments            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  EXISTING: ProViso Interpreter      │
│  - All computation logic exists     │
│  - Just needs HTTP wrapper          │
└─────────────────────────────────────┘
```

## Reflections

### What surprised me
- The backend is remarkably complete. 470 tests, full DSL, project finance constructs
- The dashboard components are well-designed but fundamentally decorative
- Components like `ScenarioSimulator` and `ComplianceTrendChart` exist but aren't used
- The disconnect is stark: CLI does everything, dashboard does nothing

### What I'm uncertain about
- Was the static demo intentional for MVP, with plans to wire up later?
- Is there a WebAssembly or bundle size concern with including the interpreter?
- Does the in-memory store architecture prevent dashboard integration?

### What I'd reconsider
- Maybe the "shell" approach was deliberate for stakeholder demos
- The form system might be the intended entry point, not file upload
- Tax equity components might need domain expert input before wiring

### If I had more time
- Profile interpreter to assess browser runtime viability
- Design the API contract between dashboard and backend
- Create migration path from static demo to live data

## For Builder: Beyond the Checklist

### Tasks
- [ ] Create ProViso interpreter context provider
- [ ] Wire MonitoringDashboard to use interpreter results
- [ ] Connect ScenarioSimulator to real calculation
- [ ] Add financial data input form
- [ ] Enable compliance trend chart with historical data
- [ ] Create API layer if interpreter can't run in browser

### Genuine Questions I'm Curious About
- Is the intent to run the interpreter client-side (WASM?) or server-side?
- Should users upload .proviso files, or is form-based creation the path?
- How do we handle the parser's Peggy dependency in browser context?
- What's the persistence story - is in-memory okay or do we need a database?

### What I Think Matters Most
The dashboard needs a **single connection point** to the interpreter. Once that exists, the existing components can come alive. The visual design is good; it just needs real data flowing through it.

Start with `MonitoringDashboard` - replace `const data = demoData` with `const data = useProVisoState()` and build from there.

---

## Updates to Project Context

### Suggested Additions

**Architecture:**
- Dashboard is currently static display only, not connected to interpreter
- Data layer needed between React components and ProViso interpreter

**Open Questions:**
- Client-side vs. server-side interpreter execution strategy
- File upload vs. form-based .proviso creation
- Real-time collaboration requirements

**Technical Debt:**
- Dashboard components expect computed data but receive hardcoded values
- ScenarioSimulator, ComplianceTrendChart built but unused
- Form system exists in backend but not exposed in UI

---

## Handoff Checklist
- [x] Environment verified working
- [x] Dependencies audited
- [x] Existing tests pass
- [x] CI/CD pipeline understood
- [x] Key hazards identified (static data, no connection)
- [x] Prior art located (components exist, just need wiring)
- [x] Open questions surfaced
- [x] Reflections documented
- [x] Project context updates suggested
