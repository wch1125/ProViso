# CreditLang v1.0 Build Instructions

## Project Finance Module + Premium Dashboard

**Version:** 1.0.0  
**Target:** Full project finance support with premium React dashboard for bank/law firm demos  
**Prerequisite:** v0.3.0 (170 tests passing)

---

## Vision

CreditLang v1.0 is the **demo-ready** version. Target audience: banks, law firms, and institutional lenders evaluating the platform.

**Two deliverables:**
1. **Project Finance Engine** — Backend support for construction loans, milestone tracking, waterfalls
2. **Premium Dashboard** — React artifact showcasing capabilities with a high-end aesthetic

---

## Part 1: Project Finance Backend

### 1.1 Phase State Machine

Project finance deals have distinct phases with different rules:

```
Construction → Commercial Operation Date (COD) → Operations → [Maturity]
```

**Grammar additions:**
```
PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED MaxLeverage
  REQUIRED MinDSCR_Construction

PHASE Operations  
  FROM COD_Achieved
  COVENANTS ACTIVE MaxLeverage, MinDSCR

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    LenderCertification,
    InsuranceInPlace
  )
```

**Types:**
```typescript
export interface PhaseStatement {
  type: 'Phase';
  name: string;
  until?: string;        // Condition/event that ends this phase
  from?: string;         // Condition/event that starts this phase
  covenantsSuspended?: string[];
  covenantsActive?: string[];
  requiredCovenants?: string[];
}

export interface TransitionStatement {
  type: 'Transition';
  name: string;
  when: Expression;      // Condition that triggers transition
}

export type PhaseState = 'construction' | 'cod' | 'operations' | 'maturity' | 'default';
```

**Interpreter additions:**
```typescript
class CreditLangInterpreter {
  private currentPhase: PhaseState = 'construction';
  private phaseHistory: { phase: PhaseState; enteredAt: string; }[] = [];
  
  getCurrentPhase(): PhaseState
  transitionTo(phase: PhaseState): void
  checkPhaseTransitions(): TransitionResult[]
  getActiveCovenants(): string[]  // Phase-aware
  getSuspendedCovenants(): string[]
}
```

### 1.2 Milestone Tracking with Longstops

Construction loans have milestones with deadline dates (longstops):

```
MILESTONE FoundationComplete
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  TRIGGERS FoundationDraw

MILESTONE SubstantialCompletion
  TARGET 2026-03-15
  LONGSTOP 2026-06-15
  TRIGGERS COD_Achieved
  REQUIRES ALL_OF(
    FoundationComplete,
    RoofComplete,
    MEPComplete
  )
```

**Types:**
```typescript
export interface MilestoneStatement {
  type: 'Milestone';
  name: string;
  targetDate: string;
  longstopDate: string;
  triggers?: string[];       // Events triggered on achievement
  requires?: Expression;     // Prerequisites
}

export type MilestoneStatus = 
  | 'pending'
  | 'achieved'
  | 'at_risk'      // Past target, before longstop
  | 'breached';    // Past longstop

export interface MilestoneResult {
  name: string;
  status: MilestoneStatus;
  targetDate: string;
  longstopDate: string;
  achievedDate?: string;
  daysToTarget: number;
  daysToLongstop: number;
  prerequisites: { name: string; met: boolean; }[];
}
```

### 1.3 Conditions Precedent Checklists

Reuse patterns from closing-demo for CP tracking:

```
CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"
  
  CP CreditAgreement
    DESCRIPTION "Executed Credit Agreement"
    RESPONSIBLE Agent
    STATUS pending
  
  CP LegalOpinion
    DESCRIPTION "Opinion of Borrower's Counsel"
    RESPONSIBLE BorrowerCounsel
    STATUS pending
    
  CP InsuranceCertificate
    DESCRIPTION "Evidence of Required Insurance"
    RESPONSIBLE Borrower
    SATISFIES InsuranceInPlace
```

**Types (reuse from closing-enums.ts):**
```typescript
import { ConditionStatus, DocumentStatus, PartyRole } from './closing-enums.js';

export interface ConditionPrecedentStatement {
  type: 'ConditionsPrecedent';
  name: string;
  section?: string;
  conditions: CPItem[];
}

export interface CPItem {
  name: string;
  description: string;
  responsible?: string;
  status: ConditionStatus;
  satisfies?: string[];      // Events/conditions satisfied when complete
  documents?: string[];      // Required document types
}
```

### 1.4 Waterfall Execution

The heart of project finance — payment watfall:

```
WATERFALL OperatingWaterfall
  FREQUENCY monthly
  
  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue
  
  TIER 2 "Senior Debt Service"  
    PAY senior_interest + senior_principal_scheduled
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve
  
  TIER 3 "Debt Service Reserve Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER
  
  TIER 4 "Maintenance Reserve"
    PAY TO MaintenanceReserve
    UNTIL MaintenanceReserve >= annual_capex_budget
    FROM REMAINDER
    
  TIER 5 "Distributions"
    IF COMPLIANT(MinDSCR) AND DebtServiceReserve >= required_dsra
    PAY distributions
    FROM REMAINDER
```

**Types:**
```typescript
export interface WaterfallStatement {
  type: 'Waterfall';
  name: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  tiers: WaterfallTier[];
}

export interface WaterfallTier {
  priority: number;
  name: string;
  payTo?: string;           // Reserve account
  payAmount?: Expression;   // Fixed amount or expression
  from: 'Revenue' | 'REMAINDER';
  until?: Expression;       // Cap condition
  shortfall?: string;       // Reserve to draw from if short
  condition?: Expression;   // Gate condition (e.g., IF COMPLIANT)
}

export interface WaterfallResult {
  tiers: WaterfallTierResult[];
  totalRevenue: number;
  totalDistributed: number;
  remainder: number;
}

export interface WaterfallTierResult {
  priority: number;
  name: string;
  requested: number;
  paid: number;
  shortfall: number;
  reserveDrawn: number;
  blocked: boolean;         // If condition not met
  blockReason?: string;
}
```

### 1.5 Reserve Accounts

```
RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall
  
RESERVE MaintenanceReserve
  TARGET annual_capex_budget
  MINIMUM 0.5 * annual_capex_budget
  FUNDED_BY Waterfall
  RELEASED_FOR PermittedCapEx
```

**Types:**
```typescript
export interface ReserveStatement {
  type: 'Reserve';
  name: string;
  target: Expression;
  minimum: Expression;
  fundedBy: string[];
  releasedTo?: string;
  releasedFor?: string;
}

export interface ReserveStatus {
  name: string;
  balance: number;
  target: number;
  minimum: number;
  fundedPercent: number;
  belowMinimum: boolean;
  availableForRelease: number;
}
```

---

## Part 2: Premium React Dashboard

### 2.1 Design Direction

**Aesthetic:** Refined luxury meets institutional finance

Think: Bloomberg Terminal sophistication + private bank elegance

**NOT:** Generic SaaS dashboards, startup purple gradients, rounded corners everywhere

**Mood board concepts:**
- Deep navy (#0A1628) and charcoal (#1C2433) backgrounds
- Gold/amber accents (#D4AF37, #F5C842) for highlights
- Crisp white (#FFFFFF) and silver (#E8E8E8) for data
- Subtle texture/grain for depth
- Sharp typography hierarchy

**Typography:**
```css
/* Display/Headers - distinctive serif */
--font-display: 'Playfair Display', Georgia, serif;

/* Data/Numbers - premium monospace */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;

/* Body/UI - refined sans-serif */
--font-body: 'Source Sans Pro', 'Helvetica Neue', sans-serif;
```

**Key UI Elements:**
- Muted color palette with strategic gold accents
- Subtle shadows and depth (not flat)
- Dense but organized data presentation
- Micro-animations on state changes (not bouncy — smooth, confident)
- Status indicators: filled circles, not emoji

### 2.2 Dashboard Sections

The dashboard should have these sections:

#### A. Executive Summary (Hero)
```
┌─────────────────────────────────────────────────────────────────┐
│  ABC SOLAR PROJECT                                              │
│  $150M Construction + Term Loan                                 │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ PHASE    │  │ LEVERAGE │  │ DSCR     │  │ NEXT     │        │
│  │ ──────── │  │ ──────── │  │ ──────── │  │ MILESTONE│        │
│  │ CONSTR.  │  │ 3.2x     │  │ 1.45x    │  │ 45 days  │        │
│  │ Month 8  │  │ ≤4.5x ✓  │  │ ≥1.25x ✓ │  │ Roof Cmp │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### B. Phase Timeline
Horizontal timeline showing:
- Construction start → Current position → COD target → Maturity
- Milestone markers with status colors
- Longstop indicators

#### C. Covenant Compliance Panel
```
FINANCIAL COVENANTS                           As of: Q4 2024
────────────────────────────────────────────────────────────
                        Actual    Required    Headroom
Total Leverage          3.24x     ≤ 4.50x     1.26x    ✓
Senior Leverage         2.18x     ≤ 3.00x     0.82x    ✓
Interest Coverage       4.52x     ≥ 2.50x     2.02x    ✓
DSCR (Projected)        1.45x     ≥ 1.25x     0.20x    ⚠
────────────────────────────────────────────────────────────
```

#### D. Waterfall Visualization
Sankey-style or stacked bar showing money flow:
```
Revenue [$12.5M]
    │
    ├─► OpEx [$3.2M]
    │
    ├─► Senior Debt Service [$4.1M]
    │
    ├─► DSRA Top-Up [$0.8M]
    │
    ├─► Maintenance Reserve [$0.5M]
    │
    └─► Available for Distribution [$3.9M]
        └─► [BLOCKED: DSCR < 1.50x]
```

#### E. Reserve Accounts Status
```
┌─────────────────────────────────────────────────┐
│ RESERVE ACCOUNTS                                │
├─────────────────────────────────────────────────┤
│ Debt Service Reserve                            │
│ ████████████████░░░░  $24.6M / $30.0M (82%)    │
│ Min: $15.0M ✓                                   │
├─────────────────────────────────────────────────┤
│ Maintenance Reserve                             │
│ ██████████░░░░░░░░░░  $8.2M / $16.0M (51%)     │
│ Min: $8.0M ✓                                    │
└─────────────────────────────────────────────────┘
```

#### F. Milestone Tracker
```
CONSTRUCTION MILESTONES
────────────────────────────────────────────────────────────
                        Target      Longstop    Status
● Foundation Complete   2024-06-30  2024-09-30  ✓ Achieved
● Steel Erection        2024-09-30  2024-12-31  ✓ Achieved  
● Roof Complete         2025-01-15  2025-03-15  ◐ In Progress
○ MEP Rough-In          2025-03-01  2025-05-01  ○ Pending
○ Substantial Comp.     2025-06-15  2025-08-15  ○ Pending
────────────────────────────────────────────────────────────
```

#### G. Conditions Precedent (for closing/draws)
```
CONDITIONS PRECEDENT - Draw #3                    4 of 7 Complete
────────────────────────────────────────────────────────────
✓ Lien Search Results                    Agent    Received
✓ Title Endorsement                      Borrower Received
✓ Inspection Report                      Agent    Received  
✓ Contractor Lien Waiver                 Borrower Received
○ Updated Insurance Certificate          Borrower Pending
○ Borrower's Certificate                 Borrower Pending
○ Budget Reconciliation                  Borrower Pending
────────────────────────────────────────────────────────────
```

### 2.3 Technical Implementation

**Stack:**
- React 18 with TypeScript
- Tailwind CSS (custom config for premium colors)
- Recharts for data visualization
- Framer Motion for animations
- Lucide React for icons

**File Structure:**
```
src/
├── dashboard/
│   ├── CreditLangDashboard.tsx      # Main dashboard component
│   ├── components/
│   │   ├── ExecutiveSummary.tsx
│   │   ├── PhaseTimeline.tsx
│   │   ├── CovenantPanel.tsx
│   │   ├── WaterfallChart.tsx
│   │   ├── ReserveStatus.tsx
│   │   ├── MilestoneTracker.tsx
│   │   └── ConditionsPrecedent.tsx
│   ├── hooks/
│   │   └── useCreditLangData.ts     # Hook to interface with interpreter
│   └── theme/
│       └── premium-theme.ts          # Design tokens
```

**Color Tokens:**
```typescript
export const premiumTheme = {
  colors: {
    // Backgrounds
    bgPrimary: '#0A1628',      // Deep navy
    bgSecondary: '#1C2433',    // Charcoal
    bgTertiary: '#2A3544',     // Lighter charcoal
    bgCard: '#152238',         // Card background
    
    // Accents
    gold: '#D4AF37',           // Primary accent
    goldLight: '#F5C842',      // Hover state
    goldMuted: '#8B7355',      // Subtle gold
    
    // Status
    success: '#22C55E',        // Green
    warning: '#F59E0B',        // Amber
    danger: '#EF4444',         // Red
    info: '#3B82F6',           // Blue
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0AEC0',
    textMuted: '#718096',
    
    // Borders
    border: '#2D3748',
    borderLight: '#4A5568',
  },
  
  fonts: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Source Sans Pro', 'Helvetica Neue', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', monospace",
  },
  
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
};
```

### 2.4 Sample Data for Demo

Create `examples/project_finance_demo.json`:
```json
{
  "project": {
    "name": "Sunrise Solar Project",
    "facility": "$150M Construction + Term",
    "sponsor": "Renewable Energy Partners",
    "borrower": "Sunrise Solar Holdings LLC"
  },
  "phase": {
    "current": "construction",
    "constructionStart": "2024-03-01",
    "codTarget": "2025-06-15",
    "maturity": "2040-06-15"
  },
  "milestones": [
    {
      "name": "Foundation Complete",
      "target": "2024-06-30",
      "longstop": "2024-09-30",
      "status": "achieved",
      "achievedDate": "2024-06-22"
    },
    {
      "name": "Steel Erection",
      "target": "2024-09-30", 
      "longstop": "2024-12-31",
      "status": "achieved",
      "achievedDate": "2024-10-15"
    },
    {
      "name": "Roof Complete",
      "target": "2025-01-15",
      "longstop": "2025-03-15",
      "status": "in_progress",
      "percentComplete": 65
    }
  ],
  "covenants": {
    "totalLeverage": { "actual": 3.24, "required": 4.50, "operator": "<=" },
    "seniorLeverage": { "actual": 2.18, "required": 3.00, "operator": "<=" },
    "interestCoverage": { "actual": 4.52, "required": 2.50, "operator": ">=" },
    "dscr": { "actual": 1.45, "required": 1.25, "operator": ">=" }
  },
  "reserves": {
    "debtService": { "balance": 24600000, "target": 30000000, "minimum": 15000000 },
    "maintenance": { "balance": 8200000, "target": 16000000, "minimum": 8000000 }
  },
  "waterfall": {
    "revenue": 12500000,
    "tiers": [
      { "name": "Operating Expenses", "amount": 3200000 },
      { "name": "Senior Debt Service", "amount": 4100000 },
      { "name": "DSRA Top-Up", "amount": 800000 },
      { "name": "Maintenance Reserve", "amount": 500000 },
      { "name": "Available for Distribution", "amount": 3900000, "blocked": true, "reason": "DSCR < 1.50x" }
    ]
  }
}
```

---

## Part 3: Implementation Tasks

### Backend Tasks (in order)

1. **Phase System** (Grammar + Types + Interpreter)
   - PHASE statement parsing
   - TRANSITION statement parsing
   - Phase state machine in interpreter
   - Phase-aware covenant checking
   - Tests: 15+

2. **Milestone System**
   - MILESTONE statement parsing
   - MilestoneStatus tracking
   - Longstop breach detection
   - Prerequisite checking
   - Tests: 12+

3. **Conditions Precedent**
   - CONDITIONS_PRECEDENT statement parsing
   - CP status tracking
   - Integration with closing-enums
   - Tests: 10+

4. **Reserve Accounts**
   - RESERVE statement parsing
   - Balance tracking
   - Min/target calculations
   - Tests: 10+

5. **Waterfall Execution**
   - WATERFALL statement parsing
   - Tier execution logic
   - Shortfall handling
   - Distribution gates
   - Tests: 15+

6. **CLI Commands**
   - `phase` - Show current phase, transitions
   - `milestones` - Show milestone status
   - `waterfall` - Execute and display waterfall
   - `reserves` - Show reserve status
   - `draw` - Check conditions for next draw

### Frontend Tasks

7. **Dashboard Shell**
   - Premium theme setup
   - Layout grid
   - Font loading
   - Base components (Card, Badge, Progress)

8. **Executive Summary**
   - KPI cards
   - Phase indicator
   - Key metrics display

9. **Phase Timeline**
   - Horizontal timeline
   - Milestone markers
   - Current position indicator
   - Animation on load

10. **Covenant Panel**
    - Table layout
    - Status indicators
    - Headroom calculation
    - Compliance history chart

11. **Waterfall Visualization**
    - Sankey or stacked bar
    - Flow animation
    - Blocked tier indication
    - Tooltips with details

12. **Reserve & Milestone Components**
    - Progress bars
    - Status badges
    - Date formatting

13. **Data Integration**
    - useCreditLangData hook
    - JSON loading
    - Real-time updates (future)

---

## Acceptance Criteria

### Backend
- [ ] PHASE, TRANSITION statements parse and execute
- [ ] MILESTONE statements with longstop tracking
- [ ] CONDITIONS_PRECEDENT with status tracking  
- [ ] RESERVE accounts with balance management
- [ ] WATERFALL execution with gates and shortfalls
- [ ] CLI commands for all new features
- [ ] 60+ new tests (~230 total)

### Frontend
- [ ] Dashboard renders with premium aesthetic
- [ ] All 7 sections implemented
- [ ] Loads demo JSON data
- [ ] Animations on state changes
- [ ] Responsive (works on 1280px+ screens)
- [ ] No generic AI aesthetic (Inter, purple gradients, etc.)

### Documentation
- [ ] README updated with v1.0 features
- [ ] Example project finance .crl file
- [ ] Example demo JSON data
- [ ] Screenshot in README

---

## Example Project Finance Agreement

Create `examples/project_finance.crl`:

```
// Sunrise Solar Project
// $150M Construction + Term Loan
// CreditLang v1.0

// ==================== PHASES ====================

PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED TotalLeverage, InterestCoverage
  REQUIRED MinEquityContribution

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE TotalLeverage, SeniorLeverage, InterestCoverage, MinDSCR

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    LenderCertification,
    FinalInspection,
    InsuranceTransition
  )

// ==================== MILESTONES ====================

MILESTONE FoundationComplete
  TARGET 2024-06-30
  LONGSTOP 2024-09-30
  TRIGGERS Draw2Available

MILESTONE SteelErection
  TARGET 2024-09-30
  LONGSTOP 2024-12-31
  REQUIRES FoundationComplete
  TRIGGERS Draw3Available

MILESTONE RoofComplete
  TARGET 2025-01-15
  LONGSTOP 2025-03-15
  REQUIRES SteelErection
  TRIGGERS Draw4Available

MILESTONE SubstantialCompletion
  TARGET 2025-06-15
  LONGSTOP 2025-08-15
  REQUIRES ALL_OF(RoofComplete, MEPComplete, FinalInspection)
  TRIGGERS COD_Achieved

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

DEFINE TotalDebt AS
  senior_debt + subordinated_debt

DEFINE SeniorDebt AS
  senior_debt

DEFINE DebtService AS
  senior_interest + senior_principal

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE SeniorLeverage AS
  SeniorDebt / EBITDA

// ==================== COVENANTS ====================

COVENANT TotalLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

COVENANT SeniorLeverage
  REQUIRES SeniorLeverage <= 3.00
  TESTED QUARTERLY

COVENANT InterestCoverage
  REQUIRES EBITDA / interest_expense >= 2.50
  TESTED QUARTERLY

COVENANT MinDSCR
  REQUIRES DSCR >= 1.25
  TESTED QUARTERLY

COVENANT MinEquityContribution
  REQUIRES equity_contributed >= 0.35 * total_project_cost
  TESTED MONTHLY

// ==================== RESERVES ====================

RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall

RESERVE MaintenanceReserve
  TARGET annual_capex_budget
  MINIMUM 0.5 * annual_capex_budget
  FUNDED_BY Waterfall
  RELEASED_FOR PermittedCapEx

// ==================== WATERFALL ====================

WATERFALL OperatingWaterfall
  FREQUENCY monthly
  
  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue
  
  TIER 2 "Senior Debt Service"
    PAY senior_interest + senior_principal
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve
  
  TIER 3 "DSRA Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER
  
  TIER 4 "Maintenance Reserve"
    PAY TO MaintenanceReserve
    UNTIL MaintenanceReserve >= annual_capex_budget
    FROM REMAINDER
  
  TIER 5 "Distributions"
    IF COMPLIANT(MinDSCR) AND DSCR >= 1.50 AND DebtServiceReserve >= required_dsra
    PAY distributions
    FROM REMAINDER

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"
  
  CP ExecutedCreditAgreement
    DESCRIPTION "Executed Credit Agreement and all Loan Documents"
    RESPONSIBLE Agent
    
  CP LegalOpinions
    DESCRIPTION "Opinions of Borrower's Counsel and Local Counsel"
    RESPONSIBLE BorrowerCounsel
    
  CP EquityContribution
    DESCRIPTION "Evidence of Initial Equity Contribution"
    RESPONSIBLE Sponsor
    SATISFIES MinEquityContribution
    
  CP InsuranceCertificates
    DESCRIPTION "Evidence of Required Insurance Coverage"
    RESPONSIBLE Borrower
    
  CP EnvironmentalReport
    DESCRIPTION "Phase I Environmental Site Assessment"
    RESPONSIBLE Borrower

CONDITIONS_PRECEDENT Draw3
  SECTION "4.02(c)"
  
  CP Draw3LienSearch
    DESCRIPTION "Updated Lien Search Results"
    RESPONSIBLE Agent
    
  CP Draw3TitleEndorsement
    DESCRIPTION "Date-Down Title Endorsement"  
    RESPONSIBLE Borrower
    
  CP Draw3Inspection
    DESCRIPTION "Construction Inspection Report"
    RESPONSIBLE EngineeringConsultant
    
  CP Draw3ContractorWaiver
    DESCRIPTION "Contractor Partial Lien Waiver"
    RESPONSIBLE GeneralContractor
    
  CP Draw3BudgetReconciliation
    DESCRIPTION "Updated Budget and Schedule"
    RESPONSIBLE Borrower
```

---

## Session Logging

Create build logs at:
- `.claude/logs/2026-XX-XX-builder-project-finance-backend.md`
- `.claude/logs/2026-XX-XX-builder-premium-dashboard.md`

Update:
- `.claude/status/current-status.md` → version 1.0.0
- `.claude/status/changelog.md` → add v1.0.0 section

---

## Notes

1. **Backend first** — Get the project finance grammar and interpreter working before the dashboard
2. **Dashboard can use mock data initially** — Don't block on full integration
3. **Premium aesthetic is non-negotiable** — This is for bank demos, not hackathon MVPs
4. **Reuse closing-enums.ts** — ConditionStatus, DocumentStatus already defined
5. **Keep backward compatibility** — Corporate credit agreements should still work

## Reference Materials

From `reference/closing-demo/`:
- `engine.py` lines 613-673: Status summary structure
- `models.py`: Entity patterns (Party, Document, Condition)
- `data/conditions.json`: CP structure examples

The ontology system (`src/ontology.ts`) can be extended for project finance templates.
