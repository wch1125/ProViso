# CreditLang v2.0 Build Instructions

## CreditLang Hub — Full Platform Build

**Version:** 2.0.0  
**Target:** Complete deal lifecycle platform for credit agreement negotiation, closing, and monitoring  
**Prerequisite:** v1.0.0 (Project Finance Engine + Dashboard complete)

**Required Archives:**
- `archive-v1_0.zip` — The complete v1.0 dashboard (DO NOT OVERWRITE)
- CreditLang engine from v0.3/v1.0

---

## ⚠️ CRITICAL: Preserve Existing v1.0 Dashboard

**The v1.0 Post-Closing Dashboard already exists and is production-quality.**

Location: `archive-v1_0.zip` contains the complete working dashboard.

**DO NOT OVERWRITE OR REWRITE:**
- The existing premium dark theme
- The Project Timeline component
- The Covenant Compliance panel (with suspended covenant handling)
- The Cash Flow Waterfall visualization
- The Reserve Accounts component (with min/target threshold markers)
- The Construction Milestones tracker
- The Conditions Precedent / Draw eligibility checklists

**v2.0 Strategy:**
1. **Extract** v1.0 dashboard components into a shared component library
2. **Extend** by adding Negotiation Studio and Closing Dashboard as new routes/modules
3. **Integrate** — the existing dashboard becomes the "Post-Closing" module in the full platform
4. **Reuse** — the theme, KPI cards, progress bars, status badges should be extracted and reused across all modules

**File Structure Evolution:**
```
v1.0 (current):                    v2.0 (target):
src/                               src/
├── components/                    ├── shared/
│   └── dashboard/                 │   ├── theme/
│       └── [all v1.0 work]        │   ├── components/     ← Extract common components
│                                  │   └── hooks/
└── ...                            ├── modules/
                                   │   ├── negotiation/    ← NEW
                                   │   ├── closing/        ← NEW
                                   │   └── monitoring/     ← EXISTING v1.0 dashboard
                                   └── ...
```

**Before starting v2.0 work:**
1. Unzip `archive-v1_0.zip`
2. Run the existing dashboard to verify it works
3. Identify components to extract into shared library
4. Only then begin adding new modules

---

## Executive Summary

CreditLang Hub is a **three-phase platform** covering the entire credit facility lifecycle:

| Phase | Users | Core Function |
|-------|-------|---------------|
| **Negotiation** | Lawyers, paralegals | Form-based editing, Word ↔ Code sync, version control |
| **Closing** | All parties | CP tracking, signature management, document vault |
| **Post-Closing** | Borrower, Agent, Lenders | Compliance dashboard, draws, milestones, waterfalls |

The CreditLang DSL engine (v0.1–v1.0) becomes the **executable truth** underneath a premium React application.

---

## The Negotiation Workflow

### Standard Deal Loop

```
Party A (Lender) sends:               Party B (Borrower) sends back:
• Draft X (Word)                      • Draft Y (Word)  
• Code X (CreditLang)                 • Code Y (CreditLang)
                                      • Redline X→Y (Word)
         ↓                            • Change Log X→Y (Human-readable)
Party B reviews, creates                       ↓
issues list, parties discuss          Party A reviews, creates
on call, Party B updates              issues list... repeat until
                                      agreement
```

### The 95%/5% Split

**95% of changes** use pre-built forms:
- Covenant threshold form
- Basket capacity form
- Definition add-back form
- Cure rights form
- Step-down schedule form

Forms generate both CreditLang code AND Word prose. No manual coding needed.

**5% of changes** require drift detection:
- Lawyer edits Word directly with something our forms don't cover
- System detects the drift between Word and Code
- AI classifies the change and suggests code
- Lawyer reviews, confirms, or edits
- Round-trip validation ensures sync

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CREDITLANG HUB                                    │
│                        (React + TypeScript)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ NEGOTIATION │  │      CLOSING        │  │      POST-CLOSING          │  │
│  │   STUDIO    │  │     DASHBOARD       │  │       DASHBOARD            │  │
│  ├─────────────┤  ├─────────────────────┤  ├─────────────────────────────┤  │
│  │ • Forms     │  │ • CP Checklist      │  │ • Covenant Monitor         │  │
│  │ • Versioning│  │ • Signatures        │  │ • Draw Management          │  │
│  │ • Diff View │  │ • Doc Vault         │  │ • Milestone Tracker        │  │
│  │ • Word Sync │  │ • Readiness Meter   │  │ • Waterfall Execution      │  │
│  └─────────────┘  └─────────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              API LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                          CREDITLANG ENGINE                                  │
│         (Parser, Interpreter, Validator — from v0.1–v1.0)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                          DOCUMENT SERVICES                                  │
│        (Word Generation, Diff Engine, Drift Detection, AI Classifier)      │
├─────────────────────────────────────────────────────────────────────────────┤
│                          PERSISTENCE LAYER                                  │
│              (Deals, Versions, Parties, Documents, Activity)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Data Models

### 1.1 Deal & Version

```typescript
interface Deal {
  id: string;
  name: string;                          // "ABC Acquisition Facility"
  dealType: 'corporate' | 'project_finance';
  facilityAmount: number;
  currency: string;
  status: 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';
  
  currentVersionId: string;
  parties: DealParty[];
  
  targetClosingDate: Date | null;
  actualClosingDate: Date | null;
  maturityDate: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface DealVersion {
  id: string;
  dealId: string;
  versionNumber: number;
  versionLabel: string;                  // "Lender's Draft", "Borrower's Markup v2"
  
  creditLangCode: string;                // The .crl source code
  
  // Authorship
  createdBy: string;
  authorParty: string;                   // "Lender's Counsel", "Borrower's Counsel"
  createdAt: Date;
  
  // Lineage
  parentVersionId: string | null;
  
  // Status
  status: 'draft' | 'sent' | 'received' | 'superseded' | 'executed';
  
  // Generated outputs
  generatedWordDoc: string | null;       // Path or base64
  
  // Change tracking (vs parent)
  changeSummary: ChangeSummary | null;
}

interface DealParty {
  id: string;
  dealId: string;
  name: string;
  shortName: string;
  role: PartyRole;                       // From closing-enums.ts
  partyType: 'borrower' | 'lender' | 'agent' | 'law_firm' | 'consultant';
  primaryContact: Contact;
  additionalContacts: Contact[];
  counselPartyId: string | null;
}

interface Contact {
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
}
```

### 1.2 Change Tracking

```typescript
interface ChangeSummary {
  versionFrom: number;
  versionTo: number;
  authorParty: string;
  createdAt: Date;
  
  // Stats
  totalChanges: number;
  covenantChanges: number;
  definitionChanges: number;
  basketChanges: number;
  otherChanges: number;
  
  // Impact
  borrowerFavorable: number;
  lenderFavorable: number;
  neutral: number;
  
  // Detailed list
  changes: Change[];
}

interface Change {
  id: string;
  changeType: 'added' | 'removed' | 'modified';
  elementType: 'covenant' | 'basket' | 'definition' | 'condition' | 'phase' | 'milestone' | 'reserve' | 'waterfall' | 'cp' | 'other';
  
  sectionReference: string;              // "7.11(a)"
  elementName: string;                   // "MaxLeverage"
  
  title: string;                         // "Leverage threshold increased"
  description: string;                   // Human-readable explanation
  rationale: string | null;              // Optional: why this change
  
  beforeCode: string | null;
  afterCode: string | null;
  beforeValue: string | null;            // "5.00x"
  afterValue: string | null;             // "5.25x"
  
  impact: 'borrower_favorable' | 'lender_favorable' | 'neutral' | 'unclear';
  impactDescription: string | null;      // "+0.25x headroom at closing"
  
  // Resolution tracking
  sourceForm: string | null;             // Which form was used
  isManualEdit: boolean;                 // True if edited code directly
}
```

### 1.3 Conditions Precedent (Closing)

```typescript
interface ConditionPrecedent {
  id: string;
  dealId: string;
  versionId: string;
  
  sectionReference: string;              // "4.01(a)(iii)"
  category: CPCategory;
  
  title: string;
  description: string;
  
  responsiblePartyId: string;
  status: ConditionStatus;               // From closing-enums.ts
  
  dueDate: Date | null;
  satisfiedAt: Date | null;
  satisfiedByDocumentIds: string[];
  
  waivedAt: Date | null;
  waiverApprovedBy: string | null;
  
  notes: string;
}

type CPCategory = 
  | 'corporate_documents'
  | 'credit_agreement'
  | 'security_documents'
  | 'ucc_filings'
  | 'legal_opinions'
  | 'certificates'
  | 'financial'
  | 'insurance'
  | 'kyc_aml'
  | 'other';

interface Document {
  id: string;
  dealId: string;
  
  documentType: DocumentType;            // From closing-enums.ts
  title: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  
  status: DocumentStatus;                // From closing-enums.ts
  responsiblePartyId: string | null;
  
  uploadedAt: Date;
  uploadedBy: string;
  dueDate: Date | null;
  
  signatures: Signature[];
  satisfiesConditionIds: string[];
}

interface Signature {
  id: string;
  documentId: string;
  partyId: string;
  signatoryName: string;
  signatoryTitle: string;
  status: 'pending' | 'requested' | 'signed' | 'declined';
  signedAt: Date | null;
}
```

### 1.4 Financial Submissions (Post-Closing)

```typescript
interface FinancialSubmission {
  id: string;
  dealId: string;
  
  period: string;                        // "2024-Q4"
  periodType: 'monthly' | 'quarterly' | 'annual';
  periodEndDate: Date;
  
  financialData: Record<string, number>;
  
  submittedBy: string;
  submittedAt: Date;
  
  verifiedBy: string | null;
  verifiedAt: Date | null;
  verificationStatus: 'pending' | 'verified' | 'disputed';
  
  // Computed results
  covenantResults: CovenantResult[];
  basketCapacities: BasketCapacity[];
  
  complianceCertificateId: string | null;
}

interface DrawRequest {
  id: string;
  dealId: string;
  drawNumber: number;
  
  requestedAmount: number;
  approvedAmount: number | null;
  fundedAmount: number | null;
  
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'funded' | 'rejected';
  
  requestedAt: Date;
  approvedAt: Date | null;
  fundedAt: Date | null;
  
  conditions: DrawCondition[];
  supportingDocumentIds: string[];
}

interface DrawCondition {
  conditionId: string;
  title: string;
  status: 'pending' | 'satisfied' | 'waived';
  satisfiedAt: Date | null;
}
```

---

## Part 2: Form System

### 2.1 Form Definitions

Each agreement element gets a form that generates both code and Word prose:

```typescript
interface FormDefinition {
  id: string;
  name: string;                          // "covenant-threshold"
  displayName: string;                   // "Covenant Threshold Editor"
  elementType: ElementType;
  
  fields: FormField[];
  validationRules: ValidationRule[];
  
  // Templates
  codeTemplate: string;                  // Generates CreditLang
  wordTemplate: string;                  // Generates Word prose
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue: unknown;
  options: FieldOption[] | null;
  helpText: string | null;
  showWhen: ConditionalRule | null;
}

type FieldType = 
  | 'text' | 'number' | 'currency' | 'percentage' | 'ratio'
  | 'date' | 'select' | 'multi-select' | 'checkbox'
  | 'expression'                         // CreditLang expression builder
  | 'step-down-table'                    // Covenant step-down schedule
  | 'party-select'
  | 'section-reference';
```

### 2.2 Required Forms

| Form | Element Type | Key Fields |
|------|--------------|------------|
| `covenant-simple` | Covenant | metric, operator, threshold, frequency |
| `covenant-stepdown` | Covenant | metric, operator, stepDownSchedule[], frequency |
| `covenant-cure` | Cure Rights | cureType, maxUses, period, maxAmount |
| `basket-fixed` | Basket | capacity |
| `basket-grower` | Basket | fixedAmount, percentage, metric, floor |
| `basket-builder` | Basket | buildsFrom, starting, maximum |
| `definition-ebitda` | Definition | baseComponents[], addBacks[], exclusions[] |
| `definition-simple` | Definition | expression |
| `milestone` | Milestone | targetDate, longstopDate, triggers[] |
| `reserve` | Reserve | target, minimum, fundedBy[], releasedTo |
| `waterfall-tier` | Waterfall Tier | payTo, payAmount, from, condition |
| `cp-item` | Condition Precedent | description, responsible, documents[] |

### 2.3 Code Generation Example

```typescript
// Covenant step-down form → CreditLang code

const covenantStepDownForm: FormDefinition = {
  id: 'covenant-stepdown',
  name: 'covenant-stepdown',
  displayName: 'Covenant with Step-Down Schedule',
  elementType: 'covenant',
  
  fields: [
    { id: 'name', name: 'name', label: 'Covenant Name', type: 'text', required: true },
    { id: 'metric', name: 'metric', label: 'Metric', type: 'select', required: true,
      options: [
        { value: 'Leverage', label: 'Leverage Ratio' },
        { value: 'InterestCoverage', label: 'Interest Coverage' },
        { value: 'DSCR', label: 'Debt Service Coverage' },
      ]
    },
    { id: 'operator', name: 'operator', label: 'Test', type: 'select', required: true,
      options: [
        { value: '<=', label: 'shall not exceed' },
        { value: '>=', label: 'shall not be less than' },
      ]
    },
    { id: 'stepDownSchedule', name: 'stepDownSchedule', label: 'Schedule', 
      type: 'step-down-table', required: true },
    { id: 'frequency', name: 'frequency', label: 'Testing Frequency', type: 'select',
      required: true, defaultValue: 'quarterly',
      options: [
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'annually', label: 'Annually' },
      ]
    },
    { id: 'hasCure', name: 'hasCure', label: 'Enable Cure Rights', type: 'checkbox' },
    { id: 'cureType', name: 'cureType', label: 'Cure Type', type: 'select',
      showWhen: { field: 'hasCure', operator: 'equals', value: true },
      options: [
        { value: 'EquityCure', label: 'Equity Cure' },
        { value: 'PaymentCure', label: 'Payment Cure' },
      ]
    },
    // ... more cure fields
    { id: 'sectionRef', name: 'sectionRef', label: 'Section Reference', 
      type: 'section-reference', required: true },
  ],
  
  codeTemplate: `
COVENANT {{name}}
  REQUIRES {{metric}} {{operator}} {{#stepDownSchedule}}{{threshold}}{{#unless @last}} UNTIL {{endDate}}, THEN {{operator}} {{/unless}}{{/stepDownSchedule}}
  TESTED {{frequency}}
{{#if hasCure}}
  CURE {{cureType}} MAX_USES {{cureMaxUses}} OVER {{curePeriod}} MAX_AMOUNT ${{cureMaxAmount}}
{{/if}}
`,
  
  wordTemplate: `
({{subsection}}) {{title}}. The Borrower shall not permit the {{metricDisplay}} as of the last day of any {{frequencyDisplay}} to {{operatorDisplay}} {{#stepDownSchedule}}({{roman @index}}) {{threshold}} to 1.00{{#if endDate}}, for any {{frequencyDisplay}} ending on or prior to {{endDate}}{{/if}}{{#unless @last}}, {{/unless}}{{/stepDownSchedule}}.
{{#if hasCure}}

Notwithstanding the foregoing, the Borrower may exercise an Equity Cure Right with respect to any failure to comply with this Section {{sectionRef}} in accordance with Section {{cureSection}}.
{{/if}}
`,
};

// Usage
function generateFromForm(formDef: FormDefinition, values: Record<string, unknown>): {
  code: string;
  word: string;
} {
  return {
    code: renderTemplate(formDef.codeTemplate, values),
    word: renderTemplate(formDef.wordTemplate, enrichForWord(values)),
  };
}
```

---

## Part 3: Word ↔ Code Services

### 3.1 Code → Word Generator (95% Path)

```typescript
class WordGenerator {
  private templates: Map<string, WordTemplate>;
  
  /**
   * Generate complete Word document from CreditLang code
   */
  generateDocument(code: string, metadata: DocumentMetadata): Buffer {
    const ast = parse(code);
    const state = compile(ast);
    
    // Generate each article
    const sections = [
      this.generateArticle1_Definitions(state.definitions),
      this.generateArticle7_Covenants(state.covenants, state.baskets),
      this.generateArticle4_ConditionsPrecedent(state.conditionsPrecedent),
      // ... more articles
    ];
    
    return this.buildDocx(sections, metadata);
  }
  
  /**
   * Generate just one section (for form preview)
   */
  generateSection(element: ASTNode): string {
    const template = this.getTemplateFor(element);
    return renderTemplate(template, extractValues(element));
  }
  
  /**
   * Generate redline between two versions
   */
  generateRedline(oldCode: string, newCode: string): Buffer {
    const oldDoc = this.generateDocument(oldCode);
    const newDoc = this.generateDocument(newCode);
    return createWordRedline(oldDoc, newDoc);
  }
}
```

### 3.2 Drift Detection (5% Path)

```typescript
interface DriftReport {
  hasDrift: boolean;
  drifts: Drift[];
}

interface Drift {
  id: string;
  section: string;
  driftType: 'addition' | 'modification' | 'deletion';
  severity: 'high' | 'medium' | 'low';
  
  expectedText: string;                  // What code would generate
  actualText: string;                    // What's in the Word doc
  
  // AI analysis
  classification: DriftClassification | null;
  suggestedCode: string | null;
  suggestedForm: string | null;
  confidence: number;
  
  resolved: boolean;
}

interface DriftClassification {
  elementType: ElementType;
  changeCategory: 'threshold' | 'capacity' | 'definition' | 'timing' | 'structure';
  explanation: string;
}

class DriftDetector {
  constructor(private aiClient: AIClient) {}
  
  async detectDrift(wordDoc: Buffer, currentCode: string): Promise<DriftReport> {
    // 1. Generate expected Word from current code
    const expectedDoc = await generateWord(currentCode);
    
    // 2. Parse both documents to text
    const expectedText = await extractText(expectedDoc);
    const actualText = await extractText(wordDoc);
    
    // 3. Section-by-section diff
    const diffs = diffBySections(expectedText, actualText);
    
    // 4. Classify each diff with AI
    const drifts: Drift[] = [];
    for (const diff of diffs) {
      const classification = await this.classifyDrift(diff);
      const suggestedCode = classification ? await this.suggestCode(diff, classification) : null;
      const suggestedForm = classification ? this.findMatchingForm(classification) : null;
      
      drifts.push({
        id: generateId(),
        section: diff.section,
        driftType: diff.type,
        severity: this.assessSeverity(classification),
        expectedText: diff.expected,
        actualText: diff.actual,
        classification,
        suggestedCode,
        suggestedForm,
        confidence: classification?.confidence ?? 0,
        resolved: false,
      });
    }
    
    return { hasDrift: drifts.length > 0, drifts };
  }
  
  private async classifyDrift(diff: TextDiff): Promise<DriftClassification | null> {
    const prompt = `
      Analyze this change in a credit agreement:
      
      Section: ${diff.section}
      
      Original text:
      ${diff.expected}
      
      New text:
      ${diff.actual}
      
      Classify:
      1. Element type (covenant, basket, definition, condition, etc.)
      2. Change category (threshold, capacity, definition, timing, structure)
      3. Brief explanation
      4. Confidence (0-1)
      
      Respond with JSON.
    `;
    
    return await this.aiClient.complete(prompt);
  }
  
  private async suggestCode(diff: TextDiff, classification: DriftClassification): Promise<string> {
    const prompt = `
      Generate CreditLang code for this credit agreement text:
      
      Text:
      ${diff.actual}
      
      Element type: ${classification.elementType}
      
      Generate valid CreditLang syntax only.
    `;
    
    const code = await this.aiClient.complete(prompt);
    
    // Validate syntax
    if (!validateSyntax(code)) {
      return await this.fixCode(code);
    }
    
    return code;
  }
  
  private findMatchingForm(classification: DriftClassification): string | null {
    const formMap: Record<string, string[]> = {
      'covenant': ['covenant-simple', 'covenant-stepdown'],
      'basket': ['basket-fixed', 'basket-grower', 'basket-builder'],
      'definition': ['definition-simple', 'definition-ebitda'],
    };
    
    const forms = formMap[classification.elementType];
    return forms?.[0] ?? null;
  }
}
```

### 3.3 Round-Trip Validator

```typescript
class RoundTripValidator {
  /**
   * Verify Word → Code → Word produces acceptable results
   */
  async validate(originalWord: Buffer, generatedCode: string): Promise<RoundTripResult> {
    // Generate Word from code
    const regeneratedWord = await generateWord(generatedCode);
    
    // Compare
    const originalText = await extractText(originalWord);
    const regeneratedText = await extractText(regeneratedWord);
    
    const diffs = diffTexts(originalText, regeneratedText);
    
    // Classify each diff as acceptable or not
    const differences: RoundTripDifference[] = [];
    const acceptableVariations: string[] = [];
    
    for (const diff of diffs) {
      if (this.isAcceptableVariation(diff)) {
        acceptableVariations.push(diff.explanation);
      } else {
        differences.push({
          section: diff.section,
          original: diff.expected,
          regenerated: diff.actual,
          isMaterial: this.isMaterialDifference(diff),
        });
      }
    }
    
    return {
      isValid: differences.filter(d => d.isMaterial).length === 0,
      differences,
      acceptableVariations,
    };
  }
  
  private isAcceptableVariation(diff: TextDiff): boolean {
    // Known stylistic variations that are OK:
    // - "in accordance with" ↔ "pursuant to"
    // - "shall not" ↔ "may not"
    // - Minor punctuation differences
    
    const stylisticPatterns = [
      { from: /in accordance with/gi, to: /pursuant to/gi },
      { from: /shall not/gi, to: /may not/gi },
    ];
    
    for (const pattern of stylisticPatterns) {
      const normalizedExpected = diff.expected.replace(pattern.from, '###');
      const normalizedActual = diff.actual.replace(pattern.to, '###');
      if (normalizedExpected === normalizedActual) {
        return true;
      }
    }
    
    return false;
  }
}
```

---

## Part 4: Change Log System

### 4.1 Change Log Generator

```typescript
interface ChangeLogOptions {
  fromVersion: DealVersion;
  toVersion: DealVersion;
  includeCodeDiffs: boolean;
  includeImpactAnalysis: boolean;
  format: 'detailed' | 'summary' | 'executive';
}

function generateChangeLog(options: ChangeLogOptions): GeneratedChangeLog {
  // 1. Parse both versions
  const fromState = parseAndCompile(options.fromVersion.creditLangCode);
  const toState = parseAndCompile(options.toVersion.creditLangCode);
  
  // 2. Diff the compiled states
  const diffs = diffCompiledStates(fromState, toState);
  
  // 3. Classify and enrich each diff
  const changes = diffs.map(diff => ({
    ...diff,
    title: generateChangeTitle(diff),
    description: generateChangeDescription(diff),
    impact: classifyImpact(diff),
    impactDescription: options.includeImpactAnalysis ? analyzeImpact(diff) : null,
  }));
  
  // 4. Compute summary
  const summary = {
    totalChanges: changes.length,
    borrowerFavorable: changes.filter(c => c.impact === 'borrower_favorable').length,
    lenderFavorable: changes.filter(c => c.impact === 'lender_favorable').length,
    neutral: changes.filter(c => c.impact === 'neutral').length,
    byCategory: groupBy(changes, 'elementType'),
  };
  
  return {
    header: {
      dealName: options.toVersion.dealId,
      fromVersion: options.fromVersion.versionNumber,
      toVersion: options.toVersion.versionNumber,
      authorParty: options.toVersion.authorParty,
      date: options.toVersion.createdAt,
    },
    summary,
    changes,
    validation: validateChanges(toState),
  };
}
```

### 4.2 Human-Readable Output

```
═══════════════════════════════════════════════════════════════════════════════
                              CHANGE LOG
                         v3 → v4 (Borrower's Markup)
                              February 20, 2026
                         Author: Davis Polk (Borrower)
═══════════════════════════════════════════════════════════════════════════════

SUMMARY
───────
• 3 changes total
• 3 borrower-favorable | 0 lender-favorable | 0 neutral

───────────────────────────────────────────────────────────────────────────────
1. SECTION 7.11(a) — Maximum Leverage Ratio
───────────────────────────────────────────────────────────────────────────────
   Change: THRESHOLD INCREASED                            Borrower Favorable
   
   Before: Opening ratio 5.00x, stepping to 4.50x
   After:  Opening ratio 5.25x, stepping to 4.50x
   
   Code diff:
   - REQUIRES Leverage <= 5.00 UNTIL 2025-12-31, THEN <= 4.50
   + REQUIRES Leverage <= 5.25 UNTIL 2025-12-31, THEN <= 4.50
   
   Impact: +0.25x headroom at closing (~$11M additional debt capacity)

───────────────────────────────────────────────────────────────────────────────
2. SECTION 7.02(f) — General Investment Basket
───────────────────────────────────────────────────────────────────────────────
   Change: CAPACITY INCREASED                             Borrower Favorable
   
   Before: Greater of $25M / 10% EBITDA
   After:  Greater of $35M / 15% EBITDA
   
   Code diff:
   - CAPACITY GreaterOf($25_000_000, 10% * LTM_EBITDA)
   + CAPACITY GreaterOf($35_000_000, 15% * LTM_EBITDA)
   
   Impact: +$10M fixed capacity, +5% grower component

───────────────────────────────────────────────────────────────────────────────
3. SECTION 1.01 — "Consolidated EBITDA" Definition
───────────────────────────────────────────────────────────────────────────────
   Change: ADD-BACK ADDED                                 Borrower Favorable
   
   Added to definition:
   "+ (xiii) integration costs and expenses related to Permitted Acquisitions
   in an aggregate amount not to exceed $10,000,000 in any fiscal year"
   
   Code diff:
   + EXCLUDING extraordinary_items
   + CAP integration_costs AT $10_000_000 PER YEAR
   
   Impact: Potential +$10M EBITDA annually; ~0.2x leverage improvement

═══════════════════════════════════════════════════════════════════════════════
VALIDATION
───────────────────────────────────────────────────────────────────────────────
✓ All code changes validated
✓ All references resolve
✓ Round-trip Word generation verified

REGENERATED SECTIONS
• Section 1.01 (Definitions) — EBITDA
• Section 7.02 (Investments) — subsection (f)
• Section 7.11 (Financial Covenants) — subsection (a)
═══════════════════════════════════════════════════════════════════════════════
```

---

## Part 5: UI Screens

### 5.1 Negotiation Studio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CREDITLANG STUDIO                    ABC Acquisition Facility    [v4 Draft] │
├───────────────┬─────────────────────────────────────────────────────────────┤
│               │                                                             │
│  VERSIONS     │  ARTICLE 7 — FINANCIAL COVENANTS                           │
│  ───────────  │                                                             │
│  ● v4 Draft   │  ┌─────────────────────────────────────────────────────┐   │
│  ○ v3 Sent    │  │ 7.11(a) Maximum Leverage                    [Edit]  │   │
│  ○ v2 Recd    │  │                                                     │   │
│  ○ v1 Sent    │  │ Ratio: ≤5.25x → 4.75x → 4.50x                      │   │
│               │  │ Testing: Quarterly                                  │   │
│  ───────────  │  │ Cure: Equity, 2 uses / 4 quarters, $25M max        │   │
│               │  │                                                     │   │
│  SECTIONS     │  │ Status: ✓ Synced                                   │   │
│  ───────────  │  └─────────────────────────────────────────────────────┘   │
│  □ Art. 1     │                                                             │
│  □ Art. 7 ◄   │  ┌─────────────────────────────────────────────────────┐   │
│    ├ 7.01     │  │ 7.11(b) Minimum Interest Coverage           [Edit]  │   │
│    ├ 7.02     │  │ Ratio: ≥2.50x | Testing: Quarterly                 │   │
│    └ 7.11     │  └─────────────────────────────────────────────────────┘   │
│  □ Art. 8     │                                                             │
│               │                                                             │
├───────────────┴─────────────────────────────────────────────────────────────┤
│ [Compare v3↔v4]  [View Code]  [Generate Word]  [Send to Counterparty →]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Closing Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CLOSING DASHBOARD                 ABC Solar Project         Target: Mar 15 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLOSING READINESS                                                         │
│  ████████████████████████████░░░░░░░  78%                                  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ CONDITIONS   │  │ DOCUMENTS    │  │ SIGNATURES   │  │ DAYS LEFT    │   │
│  │    9/12      │  │   14/16      │  │    4/8       │  │     12       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ OUTSTANDING ITEMS                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔴 Insurance Certificate           Borrower           OVERDUE (Mar 1)      │
│ ⚠️  Legal Opinion                  Davis Polk         Due: Mar 13          │
│ ⚠️  Solvency Certificate           Borrower CFO       Due: Mar 14          │
│ ○  UCC Filing Confirmation         Agent Counsel      Due: Mar 15          │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIGNATURES                                                                  │
│ Credit Agreement:  ✓Borrower  ✓Agent  ○First National  ○Regional Bank     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Post-Closing Dashboard (Project Finance)

**THIS ALREADY EXISTS IN v1.0 — PRESERVE AND EXTEND**

The v1.0 dashboard includes:
- Header with KPI cards (Status, Milestones, Reserve Funding, Revenue, COD Target)
- Alert banner for blocked distributions
- Project Timeline with phase markers
- Covenant Compliance panel with suspended covenant handling
- Cash Flow Waterfall with distribution gate visualization
- Reserve Accounts with min/target threshold markers
- Construction Milestones with progress tracking
- Conditions Precedent / Draw eligibility checklists

**v2.0 Additions to this module:**
- Financial submission form
- Historical compliance trend charts
- Draw request workflow (submit → review → approve → fund)
- Certificate generator
- Scenario simulator ("What if we increase EBITDA by 10%?")

**Do not redesign the existing layout.** Only add new features.

---

## Part 6: Premium Design System

**The v1.0 dashboard establishes the design language. Extract and reuse.**

The existing theme uses:

```typescript
// Extract from v1.0 into shared/theme/tokens.ts

const theme = {
  colors: {
    bgPrimary: '#0A1628',         // Deep navy (main background)
    bgSecondary: '#1C2433',       // Charcoal (cards)
    bgTertiary: '#2A3544',        // Lighter (hover states)
    bgElevated: '#152238',        // Elevated surfaces
    
    gold: '#D4AF37',              // Primary accent
    goldLight: '#F5C842',         // Hover
    goldMuted: '#8B7355',         // Subtle
    
    teal: '#14B8A6',              // Secondary accent (used in v1.0)
    tealLight: '#2DD4BF',         // Teal hover
    
    success: '#22C55E',           // Green - compliant, achieved
    warning: '#F59E0B',           // Amber - in progress, at risk
    danger: '#EF4444',            // Red - breach, overdue, blocked
    info: '#3B82F6',              // Blue - informational
    
    textPrimary: '#FFFFFF',
    textSecondary: '#A0AEC0',
    textMuted: '#718096',
    
    border: '#2D3748',
    borderFocus: '#D4AF37',
  },
  
  fonts: {
    display: "'Playfair Display', Georgia, serif",  // Headers (if used)
    body: "'Source Sans Pro', sans-serif",          // UI text
    mono: "'JetBrains Mono', monospace",            // Numbers, code
  },
};
```

**v1.0 Components to Extract:**
- KPI stat cards (Overall Status, Milestones, Reserve Funding, etc.)
- Progress bars with threshold markers
- Status badges (Achieved, In Progress, Pending, Suspended)
- Timeline with phase markers
- Covenant row with actual/required/headroom display
- Waterfall stacked bar visualization
- Reserve account cards
- Milestone cards with progress bars
- Conditions Precedent checklist items

**New Components Needed for v2.0:**
- Form inputs (text, number, currency, select, date)
- Step-down table editor
- Expression builder
- Code editor with syntax highlighting
- Diff viewer (side-by-side)
- Version timeline (vertical)
- Change log entry cards
- Document upload dropzone
- Signature status row
```

---

## Part 7: Implementation Phases

### Phase 0: Extract v1.0 Components (Week 1)
- [ ] Unzip and verify v1.0 dashboard runs
- [ ] Extract theme tokens to `shared/theme/`
- [ ] Extract common components (Card, Badge, Progress, KPICard, StatusIndicator) to `shared/components/`
- [ ] Move v1.0 dashboard to `modules/monitoring/`
- [ ] Set up routing structure
- [ ] Verify dashboard still works after refactor
- Tests: Existing tests pass

### Phase 1: Core Infrastructure (Week 2-3)
- [ ] Data models (TypeScript)
- [ ] Persistence layer (in-memory → PostgreSQL)
- [ ] API structure
- [ ] Additional base components needed for forms
- Tests: 25+

### Phase 2: Form System (Week 3-4)
- [ ] Form definition schema
- [ ] Form renderer component
- [ ] 6 core forms (covenant, basket, definition)
- [ ] Code generation from forms
- Tests: 30+

### Phase 3: Versioning & Diff (Week 5-6)
- [ ] Version management
- [ ] State differ
- [ ] Change classifier
- [ ] Diff viewer
- [ ] Change log generator
- Tests: 25+

### Phase 4: Word Integration (Week 7-8)
- [ ] Code → Word generator
- [ ] Word templates
- [ ] Drift detector
- [ ] AI classification
- [ ] Round-trip validator
- Tests: 30+

### Phase 5: Closing Dashboard (Week 9-10)
- [ ] CP checklist
- [ ] Document tracker
- [ ] Signature tracker
- [ ] Readiness meter
- Tests: 25+

### Phase 6: Post-Closing Dashboard (Week 11-12)
- [ ] Covenant monitor
- [ ] Draw manager
- [ ] Milestone tracker
- [ ] Waterfall visualization
- [ ] Scenario simulator
- Tests: 30+

### Phase 7: Polish (Week 13-14)
- [ ] End-to-end testing
- [ ] Demo data
- [ ] Documentation
- [ ] Performance tuning

---

## Acceptance Criteria

v2.0 is complete when:

**Negotiation Studio:** (NEW — build from scratch)
- [ ] 10+ form types
- [ ] Version comparison with diff
- [ ] Change log generation
- [ ] Word generation from code
- [ ] Drift detection from Word
- [ ] Round-trip validation

**Closing Dashboard:** (NEW — build from scratch)
- [ ] CP tracking with status
- [ ] Document upload + linking
- [ ] Signature tracking
- [ ] Readiness calculation

**Post-Closing Dashboard:** (EXISTING v1.0 — extend only)
- [x] Phase timeline ✓ (v1.0)
- [x] Covenant compliance panel ✓ (v1.0)
- [x] Waterfall visualization ✓ (v1.0)
- [x] Reserve accounts ✓ (v1.0)
- [x] Milestone tracker ✓ (v1.0)
- [x] Draw conditions checklist ✓ (v1.0)
- [ ] Financial submission form (NEW)
- [ ] Historical trend charts (NEW)
- [ ] Draw request workflow (NEW)
- [ ] Scenario simulator (NEW)

**Infrastructure:**
- [ ] Shared component library extracted from v1.0
- [ ] Multi-module routing
- [ ] Consistent theme across all modules

**Quality:**
- [ ] 150+ tests
- [ ] Premium aesthetic consistent with v1.0
- [ ] Demo-ready with sample data

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "docx": "^8.0.0",
    "mammoth": "^1.6.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.263.1",
    "@anthropic-ai/sdk": "^0.10.0",
    "zustand": "^4.4.0"
  }
}
```

---

## Notes for Builder

1. **DO NOT OVERWRITE v1.0 DASHBOARD** — The Post-Closing Dashboard is complete and looks great. Extract its components into a shared library and build the new modules alongside it.

2. **The engine exists** — v0.1–v1.0 has parser, interpreter, validator. Don't rewrite.

3. **Extract before extending** — Before building Negotiation Studio, refactor v1.0 into:
   - `shared/theme/` — colors, fonts, tokens
   - `shared/components/` — Card, Badge, Progress, KPICard, Timeline, etc.
   - `modules/monitoring/` — the existing dashboard

4. **Forms are the foundation** — Get 3 forms working end-to-end before building the rest.

5. **Code → Word is deterministic** — Start here. Word → Code (drift) is AI-assisted and harder.

6. **Premium aesthetic already established** — Match the v1.0 dashboard's look. The dark theme, teal/gold accents, and information density are correct. New modules must be visually consistent.

7. **The negotiation loop must be smooth** — Party A sends → Party B marks up → generates redline → sends back.

8. **Demo data matters** — Create realistic deals. Note: Current v1.0 demo data has some date inconsistencies (COD dates, milestone "days past" counts) — clean these up.

9. **Module routing** — The full platform needs navigation between:
   - `/deals` — Deal list
   - `/deals/:id/negotiate` — Negotiation Studio
   - `/deals/:id/closing` — Closing Dashboard
   - `/deals/:id/monitor` — Post-Closing Dashboard (existing v1.0)
