# CreditLang v0.2 Completion Instructions

## Overview

This document provides instructions for completing the v0.2 milestone. The goal is to implement the remaining features from the v0.2 roadmap so the project can model a real-world corporate credit agreement end-to-end.

**Current state:** v0.2.2 with 63 passing tests. Grower baskets, builder baskets, semantic validation, and enhanced error handling are complete.

**Remaining for v0.2:**
1. Amendment overlay system
2. Cure rights mechanics
3. Basket ledger CLI commands
4. Documentation updates

---

## 1. Amendment Overlay System

### Concept

Amendments modify the base credit agreement over time. Rather than editing the original `.crl` file, amendments are separate overlay files applied in order. This preserves history and allows querying "as of" any point in time.

### Syntax Design

Create a new statement type `AMENDMENT` that can contain modification directives:

```
// File: amendments/001_2024-06-15.crl
AMENDMENT 1
  EFFECTIVE 2024-06-15
  DESCRIPTION "First Amendment - Covenant Relief"

  // Replace an existing statement
  REPLACES COVENANT MaxLeverage WITH
    REQUIRES Leverage <= 5.00
    TESTED QUARTERLY

  // Add a new statement  
  ADDS BASKET AdditionalInvestments
    CAPACITY $15_000_000

  // Delete an existing statement
  DELETES CONDITION OldCondition

  // Modify a basket's capacity (shorthand for replace)
  MODIFIES BASKET GeneralInvestments
    CAPACITY $35_000_000
```

### Implementation Tasks

#### 1.1 Grammar Updates (`grammar/creditlang.pegjs`)

Add new top-level statement type:

```pegjs
AmendmentStatement
  = "AMENDMENT" __ num:Integer _ header:AmendmentHeader? _ directives:AmendmentDirective+ {
      return {
        type: 'Amendment',
        number: num,
        effective: header?.effective || null,
        description: header?.description || null,
        directives: directives
      };
    }

AmendmentHeader
  = effective:EffectiveClause? _ desc:DescriptionClause? {
      return { effective, description: desc };
    }

EffectiveClause
  = "EFFECTIVE" __ date:DateLiteral _ { return date; }

DescriptionClause  
  = "DESCRIPTION" __ str:StringLiteral _ { return str; }

AmendmentDirective
  = ReplacesDirective
  / AddsDirective
  / DeletesDirective
  / ModifiesDirective

ReplacesDirective
  = "REPLACES" __ type:StatementType __ name:Identifier __ "WITH" _ stmt:Statement {
      return { directive: 'replace', targetType: type, targetName: name, replacement: stmt };
    }

AddsDirective
  = "ADDS" __ stmt:Statement {
      return { directive: 'add', statement: stmt };
    }

DeletesDirective
  = "DELETES" __ type:StatementType __ name:Identifier _ {
      return { directive: 'delete', targetType: type, targetName: name };
    }

ModifiesDirective
  = "MODIFIES" __ type:StatementType __ name:Identifier _ clauses:ModificationClause+ {
      return { directive: 'modify', targetType: type, targetName: name, modifications: clauses };
    }

StatementType
  = "COVENANT" { return 'Covenant'; }
  / "BASKET" { return 'Basket'; }
  / "CONDITION" { return 'Condition'; }
  / "DEFINE" { return 'Define'; }
  / "PROHIBIT" { return 'Prohibit'; }
  / "EVENT" { return 'Event'; }

DateLiteral
  = year:$([0-9][0-9][0-9][0-9]) "-" month:$([0-9][0-9]) "-" day:$([0-9][0-9]) {
      return { type: 'Date', value: `${year}-${month}-${day}` };
    }

StringLiteral
  = '"' chars:[^"]* '"' { return chars.join(''); }
```

#### 1.2 Type Definitions (`src/types.ts`)

```typescript
export interface AmendmentStatement {
  type: 'Amendment';
  number: number;
  effective: DateLiteral | null;
  description: string | null;
  directives: AmendmentDirective[];
}

export interface DateLiteral {
  type: 'Date';
  value: string; // ISO format: YYYY-MM-DD
}

export type AmendmentDirective =
  | ReplaceDirective
  | AddDirective
  | DeleteDirective
  | ModifyDirective;

export interface ReplaceDirective {
  directive: 'replace';
  targetType: string;
  targetName: string;
  replacement: Statement;
}

export interface AddDirective {
  directive: 'add';
  statement: Statement;
}

export interface DeleteDirective {
  directive: 'delete';
  targetType: string;
  targetName: string;
}

export interface ModifyDirective {
  directive: 'modify';
  targetType: string;
  targetName: string;
  modifications: unknown[]; // Clause-specific modifications
}
```

Update `Statement` union to include `AmendmentStatement`.

#### 1.3 Interpreter Changes (`src/interpreter.ts`)

Add amendment application logic:

```typescript
// New method to apply amendments
applyAmendment(amendment: AmendmentStatement): void {
  for (const directive of amendment.directives) {
    switch (directive.directive) {
      case 'replace':
        this.replaceStatement(directive.targetType, directive.targetName, directive.replacement);
        break;
      case 'add':
        this.addStatement(directive.statement);
        break;
      case 'delete':
        this.deleteStatement(directive.targetType, directive.targetName);
        break;
      case 'modify':
        this.modifyStatement(directive.targetType, directive.targetName, directive.modifications);
        break;
    }
  }
}

// Helper to replace a statement in the appropriate map
private replaceStatement(type: string, name: string, stmt: Statement): void {
  // Remove old, add new based on type
}

// Track applied amendments for audit
private appliedAmendments: AmendmentStatement[] = [];
```

#### 1.4 CLI Updates (`src/cli.ts`)

Add `--amendments` flag to relevant commands:

```typescript
program
  .command('status <file>')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  // ... existing options
```

Add `amend` command to show amendment history:

```typescript
program
  .command('amendments <file>')
  .description('List applied amendments and their effects')
  .option('-a, --amendments <files...>', 'Amendment files')
```

#### 1.5 Tests

Create `tests/amendments.test.ts` with:
- Parse amendment syntax
- Apply REPLACES directive
- Apply ADDS directive  
- Apply DELETES directive
- Apply multiple amendments in order
- Query state after amendments
- Error on replacing non-existent statement
- Error on deleting non-existent statement

---

## 2. Cure Rights Mechanics

### Concept

When a covenant is breached, it doesn't immediately become an Event of Default. There's typically:
1. A cure period (e.g., 30 days to fix the issue)
2. Cure mechanisms (e.g., equity cure - inject capital to improve ratios)
3. Limits on cure usage (e.g., max 3 equity cures over facility life)

The state machine is: `Compliant → Breach → UnmaturedDefault → (Cured | EventOfDefault)`

### Current State

The grammar already parses CURE clauses but the interpreter ignores them. The `CureMechanism` and `CureDetails` types exist but aren't used.

### Implementation Tasks

#### 2.1 Type Updates (`src/types.ts`)

Add cure tracking types:

```typescript
export interface CureState {
  covenantName: string;
  breachDate: Date;
  cureDeadline: Date;
  status: 'breach' | 'unmatured_default' | 'cured' | 'event_of_default';
  cureAttempts: CureAttempt[];
}

export interface CureAttempt {
  date: Date;
  mechanism: string;
  amount: number;
  successful: boolean;
}

export interface CureUsage {
  mechanism: string;
  usesRemaining: number;
  totalUses: number;
  period: string;
}

// Extend CovenantResult
export interface CovenantResult {
  // ... existing fields
  cureAvailable?: boolean;
  cureState?: CureState;
  shortfall?: number; // How much to cure
}
```

#### 2.2 Grammar Updates (`grammar/creditlang.pegjs`)

Enhance CURE clause parsing:

```pegjs
CureMechanism
  = "EquityCure" _ details:CureDetails? {
      return { type: 'EquityCure', details: details || {} };
    }
  / "PaymentCure" _ details:CureDetails? {
      return { type: 'PaymentCure', details: details || {} };
    }

CureDetails
  = "MAX_USES" __ n:Integer __ "OVER" __ period:CurePeriod _ more:CureDetails? {
      return { maxUses: n, overPeriod: period, ...(more || {}) };
    }
  / "MAX_AMOUNT" __ amt:Expression _ more:CureDetails? {
      return { maxAmount: amt, ...(more || {}) };
    }
  / "CURE_PERIOD" __ dur:Duration _ more:CureDetails? {
      return { curePeriod: dur, ...(more || {}) };
    }

CurePeriod
  = "life_of_facility" { return 'life_of_facility'; }
  / "trailing_" n:Integer "_quarters" { return `trailing_${n}_quarters`; }
  / dur:Duration { return dur; }
```

Add BREACH clause to covenants:

```pegjs
CovenantClause
  // ... existing
  / "BREACH" __ "->" __ cons:Identifier _ {
      return { type: 'breach', consequence: cons };
    }
```

#### 2.3 Interpreter Changes (`src/interpreter.ts`)

Add cure state tracking and methods:

```typescript
// New private state
private cureStates: Map<string, CureState> = new Map();
private cureUsage: Map<string, number> = new Map(); // mechanism -> uses

// Enhanced covenant check
checkCovenantWithCure(name: string): CovenantResult {
  const result = this.checkCovenant(name);
  const covenant = this.covenants.get(name);
  
  if (!result.compliant && covenant?.cure) {
    result.cureAvailable = this.canApplyCure(name, covenant.cure);
    result.shortfall = this.calculateShortfall(covenant, result);
    result.cureState = this.cureStates.get(name);
  }
  
  return result;
}

// Check if cure mechanism is available
canApplyCure(covenantName: string, cure: CureMechanism): boolean {
  if (!cure.details?.maxUses) return true;
  
  const used = this.cureUsage.get(cure.type) ?? 0;
  return used < cure.details.maxUses;
}

// Apply an equity cure
applyCure(covenantName: string, amount: number): CureResult {
  const covenant = this.covenants.get(covenantName);
  if (!covenant?.cure) {
    throw new Error(`Covenant ${covenantName} has no cure mechanism`);
  }
  
  // Check cure is available
  if (!this.canApplyCure(covenantName, covenant.cure)) {
    return { success: false, reason: 'No cure uses remaining' };
  }
  
  // Check amount is within limits
  if (covenant.cure.details?.maxAmount) {
    const maxAmount = this.evaluate(covenant.cure.details.maxAmount);
    if (amount > maxAmount) {
      return { success: false, reason: `Amount exceeds maximum cure of ${maxAmount}` };
    }
  }
  
  // Apply the cure (for equity cure, increase EBITDA or decrease debt)
  // This is deal-specific - may need configuration
  
  // Track usage
  const used = this.cureUsage.get(covenant.cure.type) ?? 0;
  this.cureUsage.set(covenant.cure.type, used + 1);
  
  // Update cure state
  const state = this.cureStates.get(covenantName);
  if (state) {
    state.status = 'cured';
    state.cureAttempts.push({
      date: new Date(),
      mechanism: covenant.cure.type,
      amount,
      successful: true,
    });
  }
  
  return { success: true };
}

// Calculate how much is needed to cure
calculateShortfall(covenant: CovenantStatement, result: CovenantResult): number {
  if (result.compliant) return 0;
  
  // For leverage covenant (actual <= threshold), shortfall is actual - threshold
  // This represents how much EBITDA increase (or debt decrease) is needed
  if (result.operator === '<=') {
    return result.actual - result.threshold;
  }
  // For coverage covenant (actual >= threshold), shortfall is threshold - actual
  if (result.operator === '>=') {
    return result.threshold - result.actual;
  }
  
  return Math.abs(result.actual - result.threshold);
}

// Get cure usage summary
getCureUsage(): CureUsage[] {
  const usage: CureUsage[] = [];
  for (const [name, covenant] of this.covenants) {
    if (covenant.cure) {
      const maxUses = covenant.cure.details?.maxUses ?? Infinity;
      const used = this.cureUsage.get(covenant.cure.type) ?? 0;
      usage.push({
        mechanism: covenant.cure.type,
        usesRemaining: maxUses - used,
        totalUses: used,
        period: covenant.cure.details?.overPeriod ?? 'unlimited',
      });
    }
  }
  return usage;
}
```

#### 2.4 CLI Updates (`src/cli.ts`)

Enhance status command to show cure information:

```typescript
// In printCovenantResult, add cure info
if (!result.compliant && result.cureAvailable) {
  console.log(`      Cure available: ${result.shortfall} shortfall`);
}
```

Add `cure` command:

```typescript
program
  .command('cure <file> <covenant> <amount>')
  .description('Apply cure to a breached covenant')
  .option('-d, --data <file>', 'Financial data JSON file')
  .action(async (file, covenant, amount, options) => {
    // Apply cure and show result
  });
```

#### 2.5 Tests

Add to `tests/creditlang.test.ts` or create `tests/cure.test.ts`:
- Parse CURE clause with MAX_USES
- Parse CURE clause with MAX_AMOUNT
- Parse CURE clause with CURE_PERIOD
- Check cure availability when compliant (should be N/A)
- Check cure availability when breached
- Apply equity cure successfully
- Reject cure when uses exhausted
- Reject cure when amount exceeds max
- Calculate shortfall for leverage covenant
- Calculate shortfall for coverage covenant
- Track cure usage across multiple cures

---

## 3. Basket Ledger CLI

### Current State

The interpreter maintains `basketLedger: BasketLedgerEntry[]` but there's no CLI command to view it.

### Implementation Tasks

#### 3.1 CLI Commands (`src/cli.ts`)

Add `ledger` command:

```typescript
program
  .command('ledger <file>')
  .description('View basket transaction ledger')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-b, --basket <name>', 'Filter to specific basket')
  .option('--since <date>', 'Show entries since date (YYYY-MM-DD)')
  .option('--json', 'Output as JSON')
  .action(async (file, options) => {
    const interpreter = await loadInterpreter(file, options.data);
    const ledger = interpreter.getBasketLedger();
    
    let filtered = ledger;
    if (options.basket) {
      filtered = filtered.filter(e => e.basket === options.basket);
    }
    if (options.since) {
      const since = new Date(options.since);
      filtered = filtered.filter(e => e.timestamp >= since);
    }
    
    if (options.json) {
      console.log(JSON.stringify(filtered, null, 2));
    } else {
      printLedger(filtered);
    }
  });

function printLedger(entries: BasketLedgerEntry[]): void {
  console.log('\nBASKET LEDGER');
  console.log('─'.repeat(70));
  console.log('Date'.padEnd(12) + 'Basket'.padEnd(25) + 'Type'.padEnd(15) + 'Amount');
  console.log('─'.repeat(70));
  
  for (const entry of entries) {
    const date = entry.timestamp.toISOString().split('T')[0];
    const type = entry.entryType ?? 'usage';
    const sign = type === 'accumulation' ? '+' : '-';
    console.log(
      date.padEnd(12) +
      entry.basket.padEnd(25) +
      type.padEnd(15) +
      `${sign}$${formatMoney(entry.amount)}`
    );
  }
  
  if (entries.length === 0) {
    console.log('  No ledger entries');
  }
  
  console.log('─'.repeat(70));
  console.log(`Total entries: ${entries.length}`);
}
```

#### 3.2 Export Ledger to JSON

Add `--export` option to save ledger:

```typescript
.option('-e, --export <file>', 'Export ledger to JSON file')
```

#### 3.3 Tests

- View empty ledger
- View ledger after basket usage
- View ledger after accumulation
- Filter by basket name
- Filter by date
- JSON output format

---

## 4. Documentation Updates

### 4.1 Update CLAUDE.md

Change version to 0.2, update "Working" and "Not Yet Implemented" sections to reflect current state.

### 4.2 Update README.md

- Add amendment syntax examples
- Add cure rights examples
- Add ledger command documentation
- Update CLI command table

### 4.3 Update examples/corporate_revolver.crl

Add example cure clause:

```
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility MAX_AMOUNT $20_000_000
  BREACH -> UnmaturedDefault
```

### 4.4 Create examples/amendment_001.crl

Example amendment file for testing.

---

## 5. Acceptance Criteria

v0.2 is complete when:

1. **Amendments:**
   - [ ] Grammar parses AMENDMENT statements
   - [ ] REPLACES, ADDS, DELETES, MODIFIES directives work
   - [ ] CLI can load base + amendments
   - [ ] At least 8 amendment tests pass

2. **Cure Rights:**
   - [ ] Grammar parses enhanced CURE clauses
   - [ ] Interpreter tracks cure availability
   - [ ] Interpreter tracks cure usage
   - [ ] `applyCure()` method works
   - [ ] CLI shows cure info in status
   - [ ] At least 10 cure tests pass

3. **Ledger CLI:**
   - [ ] `ledger` command shows transaction history
   - [ ] Filter by basket and date works
   - [ ] JSON export works
   - [ ] At least 5 ledger tests pass

4. **Documentation:**
   - [ ] CLAUDE.md reflects v0.2 features
   - [ ] README.md has amendment and cure examples
   - [ ] Example files updated

5. **All tests pass:** Target ~85+ tests

---

## 6. Implementation Order

Recommended sequence:

1. **Basket Ledger CLI** (simplest, builds confidence)
2. **Cure Rights** (uses existing grammar hooks)
3. **Amendments** (most complex, new paradigm)
4. **Documentation** (after features stabilize)

Each feature should follow the pattern:
1. Update types
2. Update grammar
3. Update interpreter
4. Update CLI
5. Write tests
6. Update log file

---

## 7. Session Logging

Create session logs in `.claude/logs/` following the existing pattern:
- `2026-0X-XX-builder-ledger-cli.md`
- `2026-0X-XX-builder-cure-rights.md`
- `2026-0X-XX-builder-amendments.md`

Update `.claude/status/current-status.md` and `.claude/status/changelog.md` after each session.

---

## Notes

- The planning doc (docs/creditlang_planning.md) has additional context on design decisions
- Keep the existing patterns: type guards, evaluationContext for scoped bindings, try/finally cleanup
- Validator should be updated to validate amendment references
- Consider adding `--as-of <date>` flag for point-in-time queries with amendments
