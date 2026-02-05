# Build Plan: Wire Dashboard to ProViso Interpreter

**Date:** 2026-02-03
**Priority:** High
**Estimated Scope:** Medium (existing components, new data layer)

## Problem Statement

The dashboard displays hardcoded demo data with no connection to the ProViso interpreter. Components are visually complete but functionally hollow. Users cannot:
- Load actual .proviso files
- Input real financial data
- See computed covenant compliance
- Run simulations with real calculations

## Goal

Connect the React dashboard to the ProViso interpreter so that:
1. Components display computed results, not static values
2. Users can input financial data and see live covenant impact
3. Scenario simulation works with actual calculations
4. Drill-down shows calculation chains

## Architecture Decision Required

**Before building, decide the execution model:**

### Option A: Client-Side Interpreter (Recommended for MVP)
- Bundle interpreter into dashboard
- Pros: No backend needed, instant feedback, works offline
- Cons: Parser (Peggy) may need browser build, larger bundle
- Implementation: Create context provider that instantiates interpreter

### Option B: API Layer
- Express/Fastify server wrapping interpreter
- Pros: Clean separation, smaller client bundle
- Cons: Requires server, network latency, more infrastructure
- Implementation: REST endpoints + React Query on client

**Recommendation:** Start with Option A. The interpreter is pure TypeScript with no I/O dependencies. If bundle size or Peggy issues arise, pivot to Option B.

---

## Phase 1: ProViso Context Provider

**Goal:** Create a React context that provides interpreter access to all components.

### Files to Create

#### `dashboard/src/context/ProVisoContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { parse } from '../../../src/parser';
import { ProVisoInterpreter } from '../../../src/interpreter';
import type {
  CovenantResult,
  BasketStatus,
  MilestoneResult,
  ReserveStatus,
  WaterfallResult,
  SimulationResult
} from '../../../src/types';

interface ProVisoState {
  // Core state
  interpreter: ProVisoInterpreter | null;
  isLoaded: boolean;
  error: string | null;

  // Computed results (cached)
  covenants: CovenantResult[];
  baskets: BasketStatus[];
  milestones: MilestoneResult[];
  reserves: ReserveStatus[];
  waterfall: WaterfallResult | null;

  // Actions
  loadFromCode: (code: string) => Promise<void>;
  loadFinancials: (data: Record<string, number>) => void;
  checkCovenants: () => CovenantResult[];
  simulate: (adjustments: Array<{ field: string; value: number; type: 'absolute' | 'percentage' }>) => SimulationResult;
  refresh: () => void;
}

const ProVisoContext = createContext<ProVisoState | null>(null);

export function ProVisoProvider({ children }: { children: ReactNode }) {
  const [interpreter, setInterpreter] = useState<ProVisoInterpreter | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cached results
  const [covenants, setCovenants] = useState<CovenantResult[]>([]);
  const [baskets, setBaskets] = useState<BasketStatus[]>([]);
  const [milestones, setMilestones] = useState<MilestoneResult[]>([]);
  const [reserves, setReserves] = useState<ReserveStatus[]>([]);
  const [waterfall, setWaterfall] = useState<WaterfallResult | null>(null);

  const loadFromCode = useCallback(async (code: string) => {
    try {
      setError(null);
      const result = await parse(code);

      if (!result.success || !result.ast) {
        setError(result.error?.message || 'Parse failed');
        return;
      }

      const interp = new ProVisoInterpreter(result.ast);
      setInterpreter(interp);
      setIsLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const loadFinancials = useCallback((data: Record<string, number>) => {
    if (!interpreter) return;
    interpreter.loadFinancialData(data);
    refresh();
  }, [interpreter]);

  const refresh = useCallback(() => {
    if (!interpreter) return;

    setCovenants(interpreter.checkAllCovenants());
    setBaskets(interpreter.getAllBasketStatus());
    setMilestones(interpreter.checkAllMilestones());
    setReserves(interpreter.getAllReserveStatus());

    // Waterfall needs revenue input
    // setWaterfall(interpreter.executeWaterfall('MainWaterfall', revenue));
  }, [interpreter]);

  const checkCovenants = useCallback(() => {
    if (!interpreter) return [];
    return interpreter.checkAllCovenants();
  }, [interpreter]);

  const simulate = useCallback((adjustments: Array<{ field: string; value: number; type: 'absolute' | 'percentage' }>) => {
    if (!interpreter) throw new Error('Interpreter not loaded');
    return interpreter.runSimulation(adjustments);
  }, [interpreter]);

  return (
    <ProVisoContext.Provider value={{
      interpreter,
      isLoaded,
      error,
      covenants,
      baskets,
      milestones,
      reserves,
      waterfall,
      loadFromCode,
      loadFinancials,
      checkCovenants,
      simulate,
      refresh,
    }}>
      {children}
    </ProVisoContext.Provider>
  );
}

export function useProViso() {
  const context = useContext(ProVisoContext);
  if (!context) {
    throw new Error('useProViso must be used within ProVisoProvider');
  }
  return context;
}
```

### Files to Modify

#### `dashboard/src/App.tsx`

Wrap routes with provider:

```typescript
import { ProVisoProvider } from './context/ProVisoContext';

function App() {
  return (
    <ProVisoProvider>
      <BrowserRouter>
        {/* existing routes */}
      </BrowserRouter>
    </ProVisoProvider>
  );
}
```

### Build Configuration

#### `dashboard/vite.config.ts`

May need to configure for importing from parent `src/`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@proviso': path.resolve(__dirname, '../src'),
    },
  },
  // If Peggy causes issues, may need:
  optimizeDeps: {
    include: ['@proviso/parser'],
  },
});
```

### Testing Checkpoint

After Phase 1:
- [ ] `useProViso()` hook available in components
- [ ] Can call `loadFromCode()` with .proviso string
- [ ] Can call `loadFinancials()` with JSON data
- [ ] `covenants`, `baskets` state updates after load

---

## Phase 2: Wire MonitoringDashboard

**Goal:** Replace static `demoData` with live interpreter output.

### Files to Modify

#### `dashboard/src/pages/monitoring/MonitoringDashboard.tsx`

Replace:
```typescript
import { demoData } from '../../data/demo';
// ...
const data = demoData;
```

With:
```typescript
import { useProViso } from '../../context/ProVisoContext';
import { useEffect } from 'react';

// Default .proviso code (or load from file)
import { DEFAULT_PROVISO_CODE } from '../../data/default-code';
import { DEFAULT_FINANCIALS } from '../../data/default-financials';

export function MonitoringDashboard() {
  const {
    isLoaded,
    error,
    covenants,
    milestones,
    reserves,
    loadFromCode,
    loadFinancials,
  } = useProViso();

  // Initialize on mount
  useEffect(() => {
    if (!isLoaded) {
      loadFromCode(DEFAULT_PROVISO_CODE).then(() => {
        loadFinancials(DEFAULT_FINANCIALS);
      });
    }
  }, [isLoaded, loadFromCode, loadFinancials]);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!isLoaded) {
    return <LoadingState />;
  }

  // Transform interpreter output to component format
  const dashboardData = transformToDisplayFormat({
    covenants,
    milestones,
    reserves,
    // ... other data
  });

  return (
    <DealPageLayout ...>
      <ExecutiveSummary data={dashboardData} />
      <CovenantPanel covenants={dashboardData.covenants} />
      {/* ... rest of components */}
    </DealPageLayout>
  );
}
```

### Data Transformation

Create transformer to map interpreter output to existing component props:

#### `dashboard/src/utils/transformers.ts`

```typescript
import type { CovenantResult } from '@proviso/types';
import type { CovenantData } from '../types';

export function transformCovenant(result: CovenantResult): CovenantData {
  return {
    name: result.name,
    actual: result.actual,
    required: result.threshold,
    operator: result.operator,
    compliant: result.compliant,
    headroom: result.headroom,
    suspended: false, // Get from phase state
  };
}

export function transformToDisplayFormat(interpreterState: {
  covenants: CovenantResult[];
  // ... other types
}): DashboardData {
  return {
    covenants: interpreterState.covenants.map(transformCovenant),
    // ... other transformations
  };
}
```

### Testing Checkpoint

After Phase 2:
- [ ] MonitoringDashboard loads without error
- [ ] Covenant values are computed, not hardcoded
- [ ] Changing financials updates display
- [ ] Headroom calculated as `threshold - actual`

---

## Phase 3: Financial Data Input

**Goal:** Let users input/modify financial data and see live covenant impact.

### Files to Create

#### `dashboard/src/components/FinancialDataEditor.tsx`

```typescript
import { useState } from 'react';
import { useProViso } from '../context/ProVisoContext';
import { Input, Button } from './base';

interface FinancialField {
  key: string;
  label: string;
  value: number;
}

const DEFAULT_FIELDS: FinancialField[] = [
  { key: 'EBITDA', label: 'EBITDA', value: 0 },
  { key: 'TotalDebt', label: 'Total Debt', value: 0 },
  { key: 'InterestExpense', label: 'Interest Expense', value: 0 },
  { key: 'Revenue', label: 'Revenue', value: 0 },
  // ... expand based on common metrics
];

export function FinancialDataEditor() {
  const { loadFinancials, refresh } = useProViso();
  const [fields, setFields] = useState<FinancialField[]>(DEFAULT_FIELDS);

  const handleChange = (key: string, value: string) => {
    setFields(prev => prev.map(f =>
      f.key === key ? { ...f, value: parseFloat(value) || 0 } : f
    ));
  };

  const handleApply = () => {
    const data: Record<string, number> = {};
    for (const field of fields) {
      data[field.key] = field.value;
    }
    loadFinancials(data);
    refresh();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Financial Data</h3>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(field => (
          <Input
            key={field.key}
            label={field.label}
            type="number"
            value={field.value.toString()}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        ))}
      </div>
      <Button onClick={handleApply}>Apply & Recalculate</Button>
    </div>
  );
}
```

### Integration

Add to MonitoringDashboard as collapsible sidebar or modal.

### Testing Checkpoint

After Phase 3:
- [ ] User can edit financial values
- [ ] Clicking "Apply" recalculates covenants
- [ ] Covenant compliance updates in real-time
- [ ] Headroom changes reflect new values

---

## Phase 4: Connect ScenarioSimulator

**Goal:** Wire existing ScenarioSimulator component to real interpreter simulation.

### Files to Modify

#### `dashboard/src/components/postclosing/ScenarioSimulator.tsx`

The component already has the UI. Just need to:

1. Replace the internal `calculateCovenants` prop with `useProViso().simulate()`
2. Pass interpreter's financial fields as `fields` prop

```typescript
// In parent component that renders ScenarioSimulator:
const { simulate, interpreter } = useProViso();

// Get available financial fields from interpreter
const fields = interpreter ?
  Object.entries(interpreter.getFinancialData()).map(([key, value]) => ({
    key,
    label: formatFieldName(key),
    currentValue: value,
  })) : [];

// Wrap simulate to match expected signature
const calculateCovenants = (financials: Record<string, number>) => {
  // Temporarily load financials, check covenants, restore
  const original = interpreter.getFinancialData();
  interpreter.loadFinancialData(financials);
  const results = interpreter.checkAllCovenants();
  interpreter.loadFinancialData(original);
  return results.map(r => ({
    name: r.name,
    actual: r.actual,
    threshold: r.threshold,
    compliant: r.compliant,
    headroom: r.headroom ?? 0,
  }));
};

<ScenarioSimulator
  fields={fields}
  calculateCovenants={calculateCovenants}
/>
```

### Testing Checkpoint

After Phase 4:
- [ ] ScenarioSimulator shows real financial fields
- [ ] Adjusting values shows real covenant impact
- [ ] "Improved/Worsened" indicators are accurate
- [ ] Results match CLI `simulate` command output

---

## Phase 5: Compliance History Chart

**Goal:** Show covenant trends over time using ComplianceTrendChart.

### Prerequisites

This requires multi-period financial data. Either:
- User uploads multi-period JSON
- Simulate by storing snapshots over time

### Files to Modify

#### Add to MonitoringDashboard

```typescript
import { ComplianceTrendChart } from '../components/postclosing/ComplianceTrendChart';

// If multi-period data available:
const { getComplianceHistory } = useProViso();
const history = getComplianceHistory('MaxLeverage'); // or iterate all covenants

// Transform to chart format
const trendData = history.map(period => ({
  period: period.label,
  actual: period.actual,
  threshold: period.threshold,
  compliant: period.compliant,
}));

<ComplianceTrendChart
  covenantName="Max Leverage"
  data={trendData}
  operator="<="
/>
```

### Testing Checkpoint

After Phase 5:
- [ ] Trend chart renders with historical data
- [ ] Threshold line shown correctly
- [ ] Compliant/breach periods color-coded
- [ ] Trend direction indicator accurate

---

## Phase 6: File Upload

**Goal:** Let users upload their own .proviso files.

### Files to Create

#### `dashboard/src/components/FileUploader.tsx`

```typescript
import { useCallback } from 'react';
import { useProViso } from '../context/ProVisoContext';
import { Upload } from 'lucide-react';

export function FileUploader() {
  const { loadFromCode, error } = useProViso();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    if (file.name.endsWith('.proviso')) {
      await loadFromCode(text);
    } else if (file.name.endsWith('.json')) {
      // Handle financial data JSON
      try {
        const data = JSON.parse(text);
        // loadFinancials(data);
      } catch {
        // Show error
      }
    }
  }, [loadFromCode]);

  return (
    <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
      <Upload className="w-8 h-8 text-slate-500 mx-auto mb-4" />
      <label className="cursor-pointer">
        <span className="text-accent-400 hover:text-accent-300">
          Upload .proviso or .json file
        </span>
        <input
          type="file"
          accept=".proviso,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
```

### Testing Checkpoint

After Phase 6:
- [ ] Can upload .proviso file
- [ ] Can upload .json financial data
- [ ] Parse errors displayed clearly
- [ ] Dashboard updates after successful upload

---

## Potential Issues & Solutions

### Issue: Peggy Parser in Browser

The parser uses Peggy which generates CommonJS by default.

**Solution:**
1. Pre-build parser to ES module format
2. Or use dynamic import with Vite's ESM handling
3. Or move parser to API layer (Option B)

### Issue: Bundle Size

Adding interpreter may increase bundle significantly.

**Solution:**
1. Tree-shake unused interpreter methods
2. Lazy-load interpreter on first use
3. Consider WASM compilation for performance

### Issue: TypeScript Path Resolution

Importing from `../../../src/` may cause issues.

**Solution:**
1. Use tsconfig paths alias
2. Or publish interpreter as internal package
3. Or copy type definitions to dashboard

---

## Acceptance Criteria

The dashboard wiring is complete when:

1. [ ] MonitoringDashboard shows computed covenant values
2. [ ] Changing financial inputs updates all displays
3. [ ] ScenarioSimulator runs real simulations
4. [ ] Users can upload .proviso files
5. [ ] Users can upload/edit financial data JSON
6. [ ] Error states handle parse failures gracefully
7. [ ] Loading states show during computation
8. [ ] CLI `check` output matches dashboard display for same inputs

---

## Files Summary

### New Files
- `dashboard/src/context/ProVisoContext.tsx`
- `dashboard/src/utils/transformers.ts`
- `dashboard/src/components/FinancialDataEditor.tsx`
- `dashboard/src/components/FileUploader.tsx`
- `dashboard/src/data/default-code.ts` (copy of example .proviso)
- `dashboard/src/data/default-financials.ts` (copy of example JSON)

### Modified Files
- `dashboard/src/App.tsx` (add provider)
- `dashboard/src/pages/monitoring/MonitoringDashboard.tsx` (use context)
- `dashboard/vite.config.ts` (path aliases if needed)

### No Changes Needed
- All existing components (they already accept the right props)
- Interpreter code (already has all methods needed)
- Type definitions (already comprehensive)

---

## Handoff Notes

The visual design is solid. The components are well-built. This is a wiring task, not a redesign. The interpreter has every method needed - it just needs to be called.

Start with Phase 1 (context provider) and Phase 2 (MonitoringDashboard). Once those work, the remaining phases are incremental improvements.

If Peggy/browser issues block progress, pivot to Option B (API layer) - it's more work but guaranteed to work since the CLI already proves the interpreter functions correctly.
