# Build Plan: v2.2 "Living Deal"

**Version:** 2.2.0
**Objective:** Transform ProViso from a functional tool into a compelling demo that shows its value over BigLaw practices
**Target Audience:** Lenders, borrowers, lawyers, agents evaluating the platform

## Executive Summary

The dashboard works technically but doesn't **demonstrate** its value. This build plan addresses three gaps:

1. **Monitoring doesn't show the work** - Numbers appear but users can't see how they're calculated
2. **Negotiation is a mockup** - "Form-based editing coming soon" placeholder
3. **Closing is display-only** - All action buttons are stubs

The goal is a coherent demo where users can:
- See exactly how covenant calculations work (transparency BigLaw can't match)
- Actually edit credit agreement terms and see generated code
- Track closing progress with real interactions
- Experience a deal flowing through its full lifecycle

---

## Phase 1: Monitoring - Show the Work

**Priority:** HIGHEST - This is the core differentiator

### 1A: Calculation Drilldown Component

**Goal:** Click any computed value → see exactly how it was derived

**New Component:** `dashboard/src/components/CalculationDrilldown.tsx`

```typescript
interface CalculationNode {
  name: string;           // "Leverage" or "TotalDebt"
  value: number;          // 3.33 or 90000000
  formula?: string;       // "TotalDebt / EBITDA"
  children?: CalculationNode[];
  source?: 'definition' | 'financial_data' | 'literal';
  rawDataKey?: string;    // "funded_debt" if from financial data
}

interface CalculationDrilldownProps {
  rootNode: CalculationNode;
  onClose: () => void;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│ Leverage Ratio                              [×] │
├─────────────────────────────────────────────────┤
│                                                 │
│   Leverage = TotalDebt / EBITDA                 │
│            = $90,000,000 / $27,000,000          │
│            = 3.33x                              │
│                                                 │
│   ┌─ TotalDebt: $90,000,000                     │
│   │   ├─ funded_debt: $80,000,000      [data]   │
│   │   └─ capital_leases: $10,000,000   [data]   │
│   │                                             │
│   └─ EBITDA: $27,000,000                        │
│       ├─ net_income: $15,000,000       [data]   │
│       ├─ interest_expense: $5,000,000  [data]   │
│       ├─ tax_expense: $4,000,000       [data]   │
│       └─ depreciation: $3,000,000      [data]   │
│                                                 │
│   [View ProViso Code]                           │
└─────────────────────────────────────────────────┘
```

**Implementation Steps:**

1. **Create interpreter helper function** in `src/interpreter.ts`:
   ```typescript
   // Add to ProVisoInterpreter class
   getCalculationTree(definitionName: string): CalculationNode {
     // Recursively build tree from DEFINE statements
     // Return leaf nodes with rawDataKey for financial data
   }
   ```

2. **Expose in ProViso context** (`dashboard/src/context/ProVisoContext.tsx`):
   ```typescript
   interface ProVisoContextValue {
     // ... existing
     getCalculationTree: (name: string) => CalculationNode | null;
   }
   ```

3. **Build the component** with:
   - Recursive tree rendering
   - Expand/collapse for deep trees
   - Color coding: blue for definitions, green for financial data
   - Currency/ratio/percentage formatting based on type
   - "View ProViso Code" button linking to source

4. **Integrate into CovenantPanel**:
   - Add click handler to covenant values
   - Show drilldown in modal or slide-out panel
   - Also add to ExecutiveSummary metrics

**Files to Modify:**
- `src/interpreter.ts` - Add `getCalculationTree()` method
- `dashboard/src/context/ProVisoContext.tsx` - Expose new method
- `dashboard/src/components/CalculationDrilldown.tsx` - NEW
- `dashboard/src/components/CovenantPanel.tsx` - Add click handlers
- `dashboard/src/components/ExecutiveSummary.tsx` - Add click handlers
- `dashboard/src/components/index.ts` - Export new component

**Acceptance Criteria:**
- [ ] Click "Leverage: 3.33x" → see full calculation tree
- [ ] Tree shows formula at each level
- [ ] Leaf nodes show source (financial data field name)
- [ ] Values formatted appropriately (currency, ratio, percentage)
- [ ] Works for all DEFINE-based values
- [ ] "View ProViso Code" shows the relevant DEFINE statement

---

### 1B: Source Code Viewer

**Goal:** Click any covenant/basket/definition → see its ProViso source code

**New Component:** `dashboard/src/components/SourceCodeViewer.tsx`

```typescript
interface SourceCodeViewerProps {
  elementType: 'covenant' | 'basket' | 'definition' | 'condition' | 'phase' | 'milestone';
  elementName: string;
  code: string;
  onClose: () => void;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│ MaxLeverage (Covenant)                      [×] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ COVENANT MaxLeverage                        │ │
│ │   REQUIRES Leverage <= 4.50                 │ │
│ │   TESTED QUARTERLY                          │ │
│ │   CURE EquityCure MAX_USES 2                │ │
│ │        MAX_AMOUNT $10_000_000               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Copy Code]  [View in Full Agreement]           │
└─────────────────────────────────────────────────┘
```

**Implementation Steps:**

1. **Add code extraction to interpreter** in `src/interpreter.ts`:
   ```typescript
   // Store original source locations during parsing
   getElementSource(type: string, name: string): string | null {
     // Return the original ProViso code for this element
   }
   ```

2. **Alternative: Regenerate from AST** in `src/hub/word/templates.ts`:
   - Already has templates for generating prose
   - Add `toProVisoCode()` functions that regenerate clean code from AST

3. **Build component** with:
   - ProViso syntax highlighting (keywords, numbers, strings)
   - Copy to clipboard button
   - Line numbers
   - Monospace font

4. **Integrate throughout dashboard**:
   - CovenantPanel: click covenant name → see code
   - Basket displays: click basket name → see code
   - MilestoneTracker: click milestone → see code
   - Add subtle code icon (</>) next to clickable elements

**Files to Modify:**
- `src/interpreter.ts` - Add source extraction or regeneration
- `dashboard/src/components/SourceCodeViewer.tsx` - NEW
- `dashboard/src/components/CovenantPanel.tsx` - Add code view trigger
- `dashboard/src/components/ReserveStatus.tsx` - Add code view trigger
- `dashboard/src/components/MilestoneTracker.tsx` - Add code view trigger
- `dashboard/src/components/index.ts` - Export

**Acceptance Criteria:**
- [ ] Click covenant name → see ProViso definition
- [ ] Click basket name → see ProViso definition
- [ ] Syntax highlighting for ProViso keywords
- [ ] Copy button works
- [ ] Code is accurate to what's being evaluated

---

### 1C: Natural Language Summaries

**Goal:** Human-readable explanations alongside every metric

**New Component:** `dashboard/src/components/NaturalLanguageSummary.tsx`

```typescript
interface CovenantSummary {
  status: 'compliant' | 'breach' | 'cured';
  headroom: number;
  headroomUnit: string;  // "x" for ratios, "$" for amounts, "%" for percentages
  nextTest: Date | null;
  daysUntilTest: number | null;
  maxCapacity?: number;  // For "you can do X before breach"
}

function generateCovenantNarrative(
  covenant: CovenantData,
  summary: CovenantSummary
): string {
  // Returns: "MaxLeverage is COMPLIANT with 0.17x headroom before breach.
  //          Next test: March 31, 2026 (57 days)."
}
```

**Narrative Templates:**

```typescript
const narratives = {
  covenant_compliant: (name, actual, threshold, headroom, unit) =>
    `${name} is COMPLIANT at ${actual}${unit} (threshold: ${threshold}${unit}). ` +
    `Headroom: ${headroom}${unit} before breach.`,

  covenant_breach: (name, actual, threshold, overage, unit) =>
    `${name} is in BREACH at ${actual}${unit} (threshold: ${threshold}${unit}). ` +
    `Exceeds limit by ${overage}${unit}.`,

  covenant_cured: (name, cureType, curesRemaining) =>
    `${name} breach was cured via ${cureType}. ${curesRemaining} cure rights remaining.`,

  basket_capacity: (name, used, capacity, available) =>
    `${name}: ${formatCurrency(available)} available of ${formatCurrency(capacity)} capacity. ` +
    `${Math.round((used/capacity)*100)}% utilized.`,

  basket_exhausted: (name) =>
    `${name} is fully utilized. No remaining capacity.`,

  milestone_on_track: (name, daysRemaining) =>
    `${name} is on track. ${daysRemaining} days until target date.`,

  milestone_at_risk: (name, daysToLongstop) =>
    `${name} is AT RISK. Only ${daysToLongstop} days until longstop date.`,
};
```

**Implementation Steps:**

1. **Create narrative generator** in `dashboard/src/utils/narratives.ts`:
   - Functions for each element type
   - Smart unit detection (ratio vs currency vs percentage)
   - Date formatting with relative time

2. **Build display component**:
   - Subtle text below metrics
   - Key terms highlighted (COMPLIANT in green, BREACH in red)
   - Collapsible for space efficiency

3. **Integrate into existing components**:
   - Add to CovenantPanel below each covenant row
   - Add to ExecutiveSummary as subtitle text
   - Add to basket displays

**Files to Create/Modify:**
- `dashboard/src/utils/narratives.ts` - NEW - Narrative generation logic
- `dashboard/src/components/NaturalLanguageSummary.tsx` - NEW
- `dashboard/src/components/CovenantPanel.tsx` - Add narratives
- `dashboard/src/components/ExecutiveSummary.tsx` - Add narratives

**Acceptance Criteria:**
- [ ] Each covenant shows human-readable status
- [ ] Headroom expressed in appropriate units
- [ ] Next test date shown with countdown
- [ ] COMPLIANT/BREACH/CURED highlighted with color
- [ ] Baskets show available capacity in plain English

---

### 1D: Early Warning System

**Goal:** Visual indicators for approaching thresholds

**Implementation:**

1. **Add threshold zones to CovenantPanel**:
   ```typescript
   type ThresholdZone = 'safe' | 'caution' | 'danger' | 'breach';

   function getThresholdZone(actual: number, threshold: number, operator: string): ThresholdZone {
     const utilization = operator.includes('<')
       ? actual / threshold
       : threshold / actual;

     if (utilization > 1) return 'breach';      // Over threshold
     if (utilization > 0.9) return 'danger';    // >90% of threshold
     if (utilization > 0.8) return 'caution';   // >80% of threshold
     return 'safe';
   }
   ```

2. **Visual indicators**:
   - Progress bar color: green → yellow → orange → red
   - Pulsing animation for danger/breach zones
   - Icon: checkmark (safe), warning triangle (caution/danger), X (breach)

3. **Alert banner** at top of dashboard:
   ```
   ⚠️ 2 covenants approaching threshold: MaxLeverage (93%), MinCoverage (85%)
   ```

4. **Trend-based warnings** (if historical data available):
   ```
   📉 At current trend, MaxLeverage will breach in Q3 2026
   ```

**Files to Modify:**
- `dashboard/src/components/CovenantPanel.tsx` - Add zone indicators
- `dashboard/src/components/ExecutiveSummary.tsx` - Add alert banner
- `dashboard/src/utils/thresholds.ts` - NEW - Zone calculation logic

**Acceptance Criteria:**
- [ ] Covenants show color-coded zones
- [ ] >80% utilization shows yellow warning
- [ ] >90% utilization shows orange/pulsing
- [ ] Breach shows red with X icon
- [ ] Alert banner summarizes items needing attention

---

### 1E: Activity Feed

**Goal:** Show recent system activity to make it feel alive

**New Component:** `dashboard/src/components/ActivityFeed.tsx`

```typescript
interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'data_update' | 'simulation' | 'file_upload' | 'calculation' | 'alert';
  title: string;
  description?: string;
  icon: LucideIcon;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│ Recent Activity                                 │
├─────────────────────────────────────────────────┤
│ 📊 Financial data updated              2 min ago│
│    Revenue: $45M → $48M                         │
│                                                 │
│ 🧮 Scenario simulation run             5 min ago│
│    Tested: $10M acquisition impact              │
│                                                 │
│ 📁 File uploaded                      12 min ago│
│    solar_utility.proviso                        │
│                                                 │
│ ⚠️ Alert triggered                    15 min ago│
│    MaxLeverage entered caution zone (82%)       │
└─────────────────────────────────────────────────┘
```

**Implementation Steps:**

1. **Create activity store** in context:
   ```typescript
   const [activities, setActivities] = useState<ActivityItem[]>([]);

   const logActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
     setActivities(prev => [{
       ...activity,
       id: generateId(),
       timestamp: new Date(),
     }, ...prev].slice(0, 50));  // Keep last 50
   };
   ```

2. **Hook into existing actions**:
   - `loadFinancials()` → log "Financial data updated"
   - `loadFromCode()` → log "File loaded"
   - Scenario simulator → log "Simulation run"
   - Threshold zone changes → log alerts

3. **Build feed component**:
   - Collapsible sidebar or bottom panel
   - Relative timestamps ("2 min ago")
   - Icon + color coding by type

**Files to Create/Modify:**
- `dashboard/src/components/ActivityFeed.tsx` - NEW
- `dashboard/src/context/ProVisoContext.tsx` - Add activity logging
- `dashboard/src/pages/monitoring/MonitoringDashboard.tsx` - Add feed display

**Acceptance Criteria:**
- [ ] Activity feed shows in dashboard
- [ ] Financial data updates logged
- [ ] File uploads logged
- [ ] Scenario simulations logged
- [ ] Timestamps show relative time
- [ ] Persists during session (clears on refresh is OK)

---

## Phase 2: Negotiation - Make It Real

**Priority:** HIGH - Currently just a placeholder

### 2A: Covenant Editor Form

**Goal:** Create/edit covenants with visual form, see generated code

**New Component:** `dashboard/src/components/editors/CovenantEditor.tsx`

```typescript
interface CovenantEditorProps {
  initialValues?: Partial<CovenantFormValues>;
  onSave: (code: string, prose: string) => void;
  onCancel: () => void;
}

interface CovenantFormValues {
  name: string;
  covenantType: 'leverage' | 'coverage' | 'liquidity' | 'custom';
  metric: string;           // "Leverage" or custom expression
  operator: '<=' | '>=' | '<' | '>' | '=';
  threshold: number;
  testFrequency: 'quarterly' | 'monthly' | 'annually' | 'semi-annually';
  hasCure: boolean;
  cureType?: 'EquityCure' | 'PaymentCure';
  cureMaxUses?: number;
  cureMaxAmount?: number;
  curePeriod?: string;
  hasStepDown: boolean;
  stepDowns?: Array<{ date: string; threshold: number }>;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Add Financial Covenant                                      [×] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Covenant Name: [MaxLeverage_____________]                      │
│                                                                 │
│  ┌─ Covenant Type ─────────────────────────────────────────┐    │
│  │ ○ Leverage Ratio    ○ Interest Coverage                 │    │
│  │ ○ Fixed Charge      ○ Liquidity         ○ Custom        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Test: [Leverage     ▼]  [<=]  [4.50______]                     │
│                                                                 │
│  Testing Frequency: [Quarterly ▼]                               │
│                                                                 │
│  ☑ Include Cure Rights                                          │
│    ├─ Type: [EquityCure ▼]                                      │
│    ├─ Max Uses: [2__] over [rolling 4 quarters]                 │
│    └─ Max Amount: [$10,000,000____]                             │
│                                                                 │
│  ☐ Include Step-Downs                                           │
│                                                                 │
│  ┌─ Preview ───────────────────────────────────────────────┐    │
│  │ ProViso Code:                               [Copy]       │    │
│  │ ┌─────────────────────────────────────────────────────┐ │    │
│  │ │ COVENANT MaxLeverage                                │ │    │
│  │ │   REQUIRES Leverage <= 4.50                         │ │    │
│  │ │   TESTED QUARTERLY                                  │ │    │
│  │ │   CURE EquityCure MAX_USES 2                        │ │    │
│  │ │        OVER "rolling 4 quarters"                    │ │    │
│  │ │        MAX_AMOUNT $10_000_000                       │ │    │
│  │ └─────────────────────────────────────────────────────┘ │    │
│  │                                                         │    │
│  │ Word Prose:                                 [Copy]       │    │
│  │ ┌─────────────────────────────────────────────────────┐ │    │
│  │ │ Section 7.11(a) Maximum Leverage Ratio. The         │ │    │
│  │ │ Borrower shall not permit the Leverage Ratio as     │ │    │
│  │ │ of the last day of any fiscal quarter to exceed     │ │    │
│  │ │ 4.50 to 1.00. [Cure Rights: see Section 8.05]       │ │    │
│  │ └─────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                              [Cancel]  [Add to Agreement]       │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation Steps:**

1. **Create form component** with:
   - Controlled inputs for all fields
   - Conditional rendering for cure rights, step-downs
   - Real-time validation

2. **Code generation** (use existing `src/hub/forms/`):
   - Hook into existing form templates
   - Or create simpler inline generator
   - Format numbers with underscores ($10_000_000)

3. **Prose generation** (use existing `src/hub/word/templates.ts`):
   - Already has covenant templates
   - Call `renderCovenant()` or similar

4. **Validation**:
   - Parse generated code through interpreter
   - Show errors inline if invalid
   - Warn on unusual values (leverage > 10x, etc.)

5. **Integration with NegotiationStudio**:
   - Replace "Form-based editing coming soon" placeholder
   - Add "Add Covenant" button
   - Show editor in modal or inline panel
   - On save, add to version's code

**Files to Create/Modify:**
- `dashboard/src/components/editors/CovenantEditor.tsx` - NEW
- `dashboard/src/components/editors/index.ts` - NEW
- `dashboard/src/pages/negotiation/NegotiationStudio.tsx` - Integrate editor
- `dashboard/src/utils/codeGenerators.ts` - NEW - Code generation helpers

**Acceptance Criteria:**
- [ ] Form captures all covenant parameters
- [ ] ProViso code generates in real-time as user types
- [ ] Word prose generates alongside code
- [ ] Validation catches invalid configurations
- [ ] Save adds covenant to agreement version
- [ ] Edit existing covenant populates form

---

### 2B: Basket Editor Form

**Goal:** Create/edit baskets (fixed, grower, builder)

**New Component:** `dashboard/src/components/editors/BasketEditor.tsx`

```typescript
interface BasketFormValues {
  name: string;
  basketType: 'fixed' | 'grower' | 'builder';

  // Fixed
  fixedCapacity?: number;

  // Grower
  growerBase?: number;
  growerPercentage?: number;
  growerMetric?: string;  // "EBITDA", "TotalAssets"
  growerFloor?: number;

  // Builder
  builderSource?: string;  // "RetainedExcessCashFlow"
  builderStarting?: number;
  builderMaximum?: number;
}
```

**Similar structure to CovenantEditor:**
- Type selector changes visible fields
- Real-time code preview
- Word prose preview
- Validation through parser

**Files to Create:**
- `dashboard/src/components/editors/BasketEditor.tsx` - NEW

**Acceptance Criteria:**
- [ ] Can create fixed capacity basket
- [ ] Can create grower basket with floor
- [ ] Can create builder basket
- [ ] Code and prose generate correctly
- [ ] Integrates with NegotiationStudio

---

### 2C: Definition Editor

**Goal:** Build DEFINE statements visually

**New Component:** `dashboard/src/components/editors/DefinitionEditor.tsx`

```typescript
interface DefinitionFormValues {
  name: string;
  components: Array<{
    type: 'add' | 'subtract';
    value: string;  // metric name or number
  }>;
  exclusions?: string[];
  cappedAt?: number;
  isTrailing?: boolean;
  trailingPeriods?: number;
  trailingUnit?: 'QUARTERS' | 'MONTHS' | 'YEARS';
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Define: EBITDA                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Components:                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [+] net_income                                  [×] │    │
│  │ [+] interest_expense                            [×] │    │
│  │ [+] tax_expense                                 [×] │    │
│  │ [+] depreciation                                [×] │    │
│  │ [+] amortization                                [×] │    │
│  └─────────────────────────────────────────────────────┘    │
│  [+ Add Component]                                          │
│                                                             │
│  ☐ EXCLUDING [____________________]                         │
│  ☐ CAPPED AT [$___________________]                         │
│  ☐ TRAILING [__] [QUARTERS ▼] OF this definition            │
│                                                             │
│  Preview: EBITDA = net_income + interest_expense +          │
│           tax_expense + depreciation + amortization         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Files to Create:**
- `dashboard/src/components/editors/DefinitionEditor.tsx` - NEW

**Acceptance Criteria:**
- [ ] Add/remove components with +/-
- [ ] Support EXCLUDING modifier
- [ ] Support CAPPED AT modifier
- [ ] Support TRAILING for LTM calculations
- [ ] Preview shows formula

---

### 2D: Wire Generate Word Button

**Goal:** Make "Generate Word" button actually work

**Implementation:**

1. **Use existing `src/hub/word/generator.ts`**:
   - `WordGenerator.generateDocument()` already works
   - Returns text that can be displayed or downloaded

2. **Create download utility**:
   ```typescript
   function downloadAsWord(content: string, filename: string) {
     // Option A: Plain text .txt download
     // Option B: Use docx library for real .docx
     // Option C: Show in modal for copy/paste
   }
   ```

3. **For demo purposes**, showing in modal is acceptable:
   - Display generated prose
   - Copy to clipboard button
   - Note: "Full .docx export in production"

**Files to Modify:**
- `dashboard/src/pages/negotiation/NegotiationStudio.tsx` - Wire button
- `dashboard/src/utils/download.ts` - NEW - Download helpers

**Acceptance Criteria:**
- [ ] Generate Word button opens modal with prose
- [ ] Prose is properly formatted
- [ ] Copy to clipboard works
- [ ] Shows all covenants, baskets, definitions

---

## Phase 3: Closing - Make It Work

**Priority:** MEDIUM - Functional workflow needed

### 3A: Condition Actions

**Goal:** Actually satisfy/waive conditions, persist state

**Implementation:**

1. **Add state management** to ClosingDashboard or context:
   ```typescript
   const [conditions, setConditions] = useState(closingConditions);

   const satisfyCondition = (id: string, notes?: string) => {
     setConditions(prev => prev.map(c =>
       c.id === id
         ? { ...c, status: 'satisfied', satisfiedAt: new Date(), notes }
         : c
     ));
   };

   const waiveCondition = (id: string, notes: string) => {
     setConditions(prev => prev.map(c =>
       c.id === id
         ? { ...c, status: 'waived', waivedAt: new Date(), notes }
         : c
     ));
   };
   ```

2. **Update CPChecklist component**:
   - Add "Satisfy" and "Waive" action buttons
   - Show confirmation modal for waive (requires notes)
   - Update progress counts in real-time

3. **Persist to localStorage** for demo:
   ```typescript
   useEffect(() => {
     localStorage.setItem('proviso_closing_conditions', JSON.stringify(conditions));
   }, [conditions]);
   ```

**Files to Modify:**
- `dashboard/src/pages/closing/ClosingDashboard.tsx` - Add state management
- `dashboard/src/components/closing/CPChecklist.tsx` - Add action buttons

**Acceptance Criteria:**
- [ ] Click "Satisfy" → condition marked satisfied
- [ ] Click "Waive" → prompt for notes, then mark waived
- [ ] ReadinessMeter updates in real-time
- [ ] State persists on page refresh (localStorage)

---

### 3B: Document Upload Flow

**Goal:** Simulated document upload workflow

**Implementation:**

1. **Add upload state**:
   ```typescript
   const uploadDocument = (docId: string, file: File) => {
     setDocuments(prev => prev.map(d =>
       d.id === docId
         ? { ...d, status: 'uploaded', fileName: file.name, uploadedAt: new Date() }
         : d
     ));
   };
   ```

2. **Create upload modal**:
   - Drag-drop zone (can use same FileUploader pattern)
   - Select which document to upload for
   - Preview file name

3. **For demo**, actual file content doesn't matter:
   - Just record that upload happened
   - Store file name for display

**Files to Modify:**
- `dashboard/src/pages/closing/ClosingDashboard.tsx` - Add upload logic
- `dashboard/src/components/closing/DocumentTracker.tsx` - Add upload button

**Acceptance Criteria:**
- [ ] Click "Upload" → file picker opens
- [ ] After upload, document shows "Uploaded" status
- [ ] File name displayed
- [ ] ReadinessMeter updates

---

### 3C: Signature Workflow

**Goal:** Request and track signatures

**Implementation:**

1. **Add signature actions**:
   ```typescript
   const requestSignature = (docId: string, sigId: string) => {
     // Update status to 'requested'
     // In production, would send email
   };

   const markSigned = (docId: string, sigId: string) => {
     // Update status to 'signed' with timestamp
   };
   ```

2. **Update SignatureTracker**:
   - "Request Signature" sends (simulated) email
   - Show toast: "Signature request sent to John Smith"
   - Add "Mark as Signed" for demo purposes

3. **Add signature completion celebration**:
   - When all signatures collected → show "Fully Executed" badge
   - Confetti animation? (optional but fun)

**Files to Modify:**
- `dashboard/src/pages/closing/ClosingDashboard.tsx` - Add signature logic
- `dashboard/src/components/closing/SignatureTracker.tsx` - Add actions

**Acceptance Criteria:**
- [ ] Request Signature button works
- [ ] Shows confirmation toast
- [ ] Mark as Signed updates status
- [ ] "Fully Executed" shows when complete

---

### 3D: Export Checklist

**Goal:** Generate downloadable closing checklist

**Implementation:**

1. **Generate checklist content**:
   ```typescript
   function generateClosingChecklist(
     conditions: Condition[],
     documents: Document[],
     signatures: Signature[]
   ): string {
     // Return formatted text/markdown
   }
   ```

2. **Download as PDF or text**:
   - For demo, text/markdown is fine
   - Show in modal with copy button

**Files to Modify:**
- `dashboard/src/pages/closing/ClosingDashboard.tsx` - Wire export
- `dashboard/src/utils/export.ts` - NEW - Export generators

**Acceptance Criteria:**
- [ ] Export button generates checklist
- [ ] Shows all conditions with status
- [ ] Shows all documents with status
- [ ] Shows signature status per document

---

## Phase 4: Deal Lifecycle

**Priority:** MEDIUM - Connects the experience

### 4A: Create Deal Flow

**Goal:** "New Deal" button actually works

**New Component:** `dashboard/src/components/CreateDealModal.tsx`

```typescript
interface CreateDealFormValues {
  name: string;
  facilityAmount: number;
  facilityType: 'revolver' | 'term_loan' | 'project_finance';
  targetClosingDate: Date;
  borrowerName: string;
  agentName: string;
}
```

**Implementation:**
1. Modal with basic deal info form
2. On create, add to deals list
3. Navigate to negotiation studio
4. Pre-populate with template based on facility type

**Files to Create:**
- `dashboard/src/components/CreateDealModal.tsx` - NEW
- `dashboard/src/pages/deals/DealList.tsx` - Wire button

---

### 4B: Deal Context Provider

**Goal:** Shared state across all modules

**New Context:** `dashboard/src/context/DealContext.tsx`

```typescript
interface DealContextValue {
  deals: Deal[];
  currentDeal: Deal | null;
  versions: DealVersion[];
  conditions: Condition[];
  documents: Document[];

  // Actions
  createDeal: (input: CreateDealInput) => Deal;
  selectDeal: (dealId: string) => void;
  createVersion: (code: string, label: string) => DealVersion;
  // ... closing actions
}
```

**Implementation:**
1. Create context provider
2. Wrap app in provider
3. Migrate page-level state to context
4. Persist to localStorage

**Files to Create:**
- `dashboard/src/context/DealContext.tsx` - NEW

---

### 4C: Unified Demo Experience

**Goal:** Same deal flows through all three modules

**Implementation:**
1. Create "Sunrise Solar Project" deal that exists in:
   - Deal list
   - Negotiation (with versions)
   - Closing (with conditions/docs)
   - Monitoring (with financials)

2. Navigation shows deal progression:
   - Breadcrumb: Deals > Sunrise Solar > Negotiation
   - Status indicator shows current stage

3. Module-to-module handoff:
   - "Send to Closing" in Negotiation → creates closing checklist
   - "Complete Closing" → transitions to Active
   - "Monitor" available once Active

**Files to Modify:**
- All page components
- Demo data files
- Navigation components

---

## Testing Checklist

### Phase 1 Tests
- [ ] Calculation drilldown shows correct tree for all definitions
- [ ] Source code viewer displays accurate ProViso for all element types
- [ ] Natural language summaries are grammatically correct
- [ ] Early warning thresholds trigger at correct utilization levels
- [ ] Activity feed logs all user actions

### Phase 2 Tests
- [ ] Covenant editor generates valid ProViso code
- [ ] Basket editor handles all three types correctly
- [ ] Definition editor supports all modifiers
- [ ] Generate Word produces readable output
- [ ] Editors integrate into negotiation workflow

### Phase 3 Tests
- [ ] Condition satisfy/waive updates all displays
- [ ] Document upload updates status
- [ ] Signature workflow completes correctly
- [ ] Export generates complete checklist
- [ ] State persists across page refresh

### Phase 4 Tests
- [ ] New deal creation works
- [ ] Deal context shares state correctly
- [ ] Navigation between modules preserves context
- [ ] Demo deal is consistent across all modules

---

## Build Order Recommendation

**Sprint 1: Show the Work (High Impact, Quick Wins)**
1. 1C: Natural Language Summaries
2. 1D: Early Warning System
3. 1B: Source Code Viewer
4. 1A: Calculation Drilldown

**Sprint 2: Make Negotiation Real**
1. 2A: Covenant Editor
2. 2B: Basket Editor
3. 2D: Wire Generate Word

**Sprint 3: Make Closing Work**
1. 3A: Condition Actions
2. 3B: Document Upload
3. 3C: Signature Workflow
4. 3D: Export Checklist

**Sprint 4: Connect the Dots**
1. 4B: Deal Context Provider
2. 4A: Create Deal Flow
3. 4C: Unified Demo Experience
4. 1E: Activity Feed

---

## Success Metrics

After this build, a user should be able to:

1. **Understand calculations** - Click any number and see exactly how it was computed
2. **See the source** - View the ProViso code behind any element
3. **Read plain English** - Understand compliance status without decoding numbers
4. **Get early warnings** - Know when they're approaching covenant breach
5. **Create covenants** - Use forms to build credit agreement terms
6. **Generate documents** - See both code and legal prose output
7. **Track closing** - Satisfy conditions, upload documents, collect signatures
8. **Follow the deal** - Experience the full lifecycle from negotiation to monitoring

This is what BigLaw can't do.
