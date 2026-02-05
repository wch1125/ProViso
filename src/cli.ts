#!/usr/bin/env node
// ProViso CLI
// Command-line interface for parsing and evaluating credit agreements

import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { parse } from './parser.js';
import { validate } from './validator.js';
import { ProVisoInterpreter } from './interpreter.js';
import { SimpleFinancialData, CovenantResult, BasketStatus, BasketLedgerEntry, ParseError, ValidationResult, CureUsage, Statement, MilestoneResult, ReserveStatus, WaterfallTierResult, CPItemResult } from './types.js';

const program = new Command();

program
  .name('proviso')
  .description('Domain-Specific Language for Credit Agreements')
  .version('0.1.0');

// ==================== PARSE COMMAND ====================

program
  .command('parse <file>')
  .description('Parse a .proviso file and output AST')
  .option('-p, --pretty', 'Pretty print the AST')
  .action(async (file: string, options: { pretty?: boolean }) => {
    try {
      const source = await readFile(file, 'utf-8');
      const result = await parse(source);

      if (!result.success || !result.ast) {
        if (result.error) {
          formatParseError(result.error, source, file);
        } else {
          console.error('Error: Unknown parse error');
        }
        process.exit(1);
      }

      if (options.pretty) {
        console.log(JSON.stringify(result.ast, null, 2));
      } else {
        console.log(JSON.stringify(result.ast));
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// ==================== VALIDATE COMMAND ====================

program
  .command('validate <file>')
  .description('Validate a .proviso file for syntax and semantic errors')
  .option('-q, --quiet', 'Only output errors, not warnings')
  .action(async (file: string, options: { quiet?: boolean }) => {
    try {
      const source = await readFile(file, 'utf-8');

      // First check syntax (parse)
      const parseResult = await parse(source);

      if (!parseResult.success || !parseResult.ast) {
        if (parseResult.error) {
          formatParseError(parseResult.error, source, file);
        } else {
          console.error('Error: Unknown parse error');
        }
        process.exit(1);
      }

      // Then check semantics
      const validationResult = validate(parseResult.ast);
      formatValidationResult(validationResult, file, options.quiet ?? false);

      // Exit with appropriate code
      if (validationResult.errors.length > 0) {
        process.exit(1);
      } else if (validationResult.warnings.length > 0) {
        process.exit(0); // Warnings don't fail the validation
      } else {
        process.exit(0);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// ==================== CHECK COMMAND ====================

program
  .command('check <file>')
  .description('Check covenant compliance')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--as-of <period>', 'Evaluate as of a specific period (requires multi-period data)')
  .action(async (file: string, options: { data?: string; amendments?: string[]; asOf?: string }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      // Set evaluation period if specified
      if (options.asOf) {
        if (!interpreter.hasMultiPeriodData()) {
          console.error('Error: --as-of requires multi-period financial data');
          process.exit(1);
        }
        interpreter.setEvaluationPeriod(options.asOf);
      }

      const results = interpreter.checkAllCovenants();

      console.log('\nCOVENANT COMPLIANCE');
      if (options.asOf) {
        console.log(`As of period: ${options.asOf}`);
      }
      console.log('─'.repeat(50));

      for (const result of results) {
        printCovenantResult(result);
      }

      const allCompliant = results.every((r) => r.compliant);
      console.log('\n' + '─'.repeat(50));
      console.log(`Overall: ${allCompliant ? '✓ COMPLIANT' : '✗ BREACH'}`);

      process.exit(allCompliant ? 0 : 1);
    } catch (err) {
      const msg = (err as Error).message;
      // Don't re-display if parse error was already shown
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== BASKETS COMMAND ====================

program
  .command('baskets <file>')
  .description('Show basket utilization')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-v, --verbose', 'Show detailed basket information')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--as-of <period>', 'Evaluate as of a specific period (requires multi-period data)')
  .action(async (file: string, options: { data?: string; verbose?: boolean; amendments?: string[]; asOf?: string }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      // Set evaluation period if specified
      if (options.asOf) {
        if (!interpreter.hasMultiPeriodData()) {
          console.error('Error: --as-of requires multi-period financial data');
          process.exit(1);
        }
        interpreter.setEvaluationPeriod(options.asOf);
      }

      const baskets = interpreter.getAllBasketStatuses();

      console.log('\nBASKET AVAILABILITY');
      if (options.asOf) {
        console.log(`As of period: ${options.asOf}`);
      }
      console.log('─'.repeat(60));

      for (const basket of baskets) {
        printBasketStatus(basket, options.verbose);
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== SIMULATE COMMAND ====================

program
  .command('simulate <file>')
  .description('Simulate pro forma changes')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-c, --changes <json>', 'JSON object with changes to simulate')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--as-of <period>', 'Evaluate as of a specific period (requires multi-period data)')
  .action(async (file: string, options: { data?: string; changes?: string; amendments?: string[]; asOf?: string }) => {
    try {
      if (!options.changes) {
        console.error('Error: --changes is required for simulation');
        process.exit(1);
      }

      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      // Set evaluation period if specified
      if (options.asOf) {
        if (!interpreter.hasMultiPeriodData()) {
          console.error('Error: --as-of requires multi-period financial data');
          process.exit(1);
        }
        interpreter.setEvaluationPeriod(options.asOf);
      }

      const changes = JSON.parse(options.changes) as Partial<SimpleFinancialData>;

      console.log('\nPRO FORMA SIMULATION');
      if (options.asOf) {
        console.log(`As of period: ${options.asOf}`);
      }
      console.log('─'.repeat(50));
      console.log('Changes:', JSON.stringify(changes));
      console.log('');

      const current = interpreter.getStatus();
      const proforma = interpreter.simulate(changes);
      
      console.log('COVENANT IMPACT');
      console.log('─'.repeat(50));
      
      for (let i = 0; i < proforma.covenants.length; i++) {
        const curr = current.covenants[i];
        const pf = proforma.covenants[i];
        if (curr && pf) {
          printCovenantComparison(curr, pf);
        }
      }
      
      const willBeCompliant = proforma.covenants.every(c => c.compliant);
      console.log('\n' + '─'.repeat(50));
      console.log(`Pro Forma Status: ${willBeCompliant ? '✓ WOULD BE COMPLIANT' : '✗ WOULD BREACH'}`);
      
      process.exit(willBeCompliant ? 0 : 1);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== STATUS COMMAND ====================

program
  .command('status <file>')
  .description('Full compliance status report')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-v, --verbose', 'Show detailed basket information')
  .option('-c, --show-cure', 'Show cure rights information')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--as-of <period>', 'Evaluate as of a specific period (requires multi-period data)')
  .action(async (file: string, options: { data?: string; verbose?: boolean; showCure?: boolean; amendments?: string[]; asOf?: string }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      // Set evaluation period if specified
      if (options.asOf) {
        if (!interpreter.hasMultiPeriodData()) {
          console.error('Error: --as-of requires multi-period financial data');
          process.exit(1);
        }
        interpreter.setEvaluationPeriod(options.asOf);
      }

      const status = interpreter.getStatus();

      console.log('');
      console.log('╔' + '═'.repeat(58) + '╗');
      console.log('║' + '  PROVISO STATUS REPORT  '.padStart(40).padEnd(58) + '║');
      console.log('╚' + '═'.repeat(58) + '╝');
      if (options.asOf) {
        console.log(`As of period: ${options.asOf}`);
      }
      console.log('');

      console.log('FINANCIAL COVENANTS');
      console.log('─'.repeat(60));

      // Use cure-enhanced results if requested or if any covenant is breached
      const covenantsWithCure = interpreter.getCovenantsWithCure();
      const showCureInfo = options.showCure || !status.overallCompliant;

      if (showCureInfo && covenantsWithCure.length > 0) {
        const cureResults = interpreter.checkAllCovenantsWithCure();
        for (const cov of cureResults) {
          printCovenantResult(cov);
          if (!cov.compliant && cov.cureAvailable !== undefined) {
            if (cov.cureAvailable) {
              console.log(`      ↳ Cure available: ${cov.cureMechanism?.type} (shortfall: ${formatNumber(cov.shortfall ?? 0)})`);
            } else {
              console.log(`      ↳ Cure not available (uses exhausted)`);
            }
          }
        }
      } else {
        for (const cov of status.covenants) {
          printCovenantResult(cov);
        }
      }

      console.log('\nBASKET AVAILABILITY');
      console.log('─'.repeat(60));
      for (const basket of status.baskets) {
        printBasketStatus(basket, options.verbose);
      }

      // Show cure usage summary if applicable
      if (showCureInfo && covenantsWithCure.length > 0) {
        const cureUsage = interpreter.getCureUsage();
        if (cureUsage.length > 0) {
          console.log('\nCURE RIGHTS');
          console.log('─'.repeat(60));
          for (const usage of cureUsage) {
            printCureUsage(usage);
          }
        }
      }

      console.log('\n' + '═'.repeat(60));
      console.log(`OVERALL STATUS: ${status.overallCompliant ? '✓ COMPLIANT' : '✗ BREACH'}`);
      console.log('═'.repeat(60));

      process.exit(status.overallCompliant ? 0 : 1);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== HISTORY COMMAND ====================

program
  .command('history <file>')
  .description('Show compliance history across all periods')
  .option('-d, --data <file>', 'Multi-period financial data JSON file (required)')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--covenants-only', 'Show only covenant compliance')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: { data?: string; amendments?: string[]; covenantsOnly?: boolean; json?: boolean }) => {
    try {
      if (!options.data) {
        console.error('Error: --data is required for history command');
        process.exit(1);
      }

      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      if (!interpreter.hasMultiPeriodData()) {
        console.error('Error: history command requires multi-period financial data');
        console.error('       Your data file should have a "periods" array with period data.');
        process.exit(1);
      }

      const history = interpreter.getComplianceHistory();

      if (options.json) {
        console.log(JSON.stringify(history, null, 2));
        return;
      }

      console.log('\nCOMPLIANCE HISTORY');
      console.log('─'.repeat(80));

      // Build header row based on covenants
      const covenantNames = interpreter.getCovenantNames();
      const headerParts = ['Period'.padEnd(12)];
      for (const name of covenantNames) {
        headerParts.push(name.slice(0, 15).padEnd(16));
      }
      headerParts.push('Status'.padEnd(12));
      console.log(headerParts.join(''));
      console.log('─'.repeat(80));

      let totalCompliant = 0;
      let totalBreach = 0;

      for (const entry of history) {
        const rowParts = [entry.period.padEnd(12)];

        for (const covenantName of covenantNames) {
          const result = entry.covenants.find((c) => c.name === covenantName);
          if (result) {
            const symbol = result.compliant ? '✓' : '✗';
            const valueStr = formatNumber(result.actual);
            rowParts.push(`${symbol} ${valueStr}`.padEnd(16));
          } else {
            rowParts.push('N/A'.padEnd(16));
          }
        }

        const statusStr = entry.overallCompliant ? 'COMPLIANT' : 'BREACH';
        rowParts.push(entry.overallCompliant ? statusStr : `✗ ${statusStr}`);

        if (entry.overallCompliant) {
          totalCompliant++;
        } else {
          totalBreach++;
        }

        console.log(rowParts.join(''));
      }

      console.log('─'.repeat(80));
      console.log(`Summary: ${totalCompliant} compliant, ${totalBreach} breach across ${history.length} periods`);

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== QUERY COMMAND ====================

program
  .command('query <file> <action>')
  .description('Check if an action is permitted')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amount <number>', 'Amount for the action')
  .action(async (file: string, action: string, options: { data?: string; amount?: string }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data);
      const amount = options.amount ? parseFloat(options.amount) : undefined;
      const result = interpreter.checkProhibition(action, amount);
      
      console.log('\nQUERY RESULT');
      console.log('─'.repeat(50));
      console.log(`Action: ${action}${amount !== undefined ? ` ($${amount.toLocaleString()})` : ''}`);
      console.log(`Result: ${result.permitted ? '✓ PERMITTED' : '✗ PROHIBITED'}`);
      console.log('');
      console.log('Reasoning:');
      for (const step of result.reasoning) {
        console.log(`  ${step.passed ? '✓' : '✗'} ${step.rule}: ${step.evaluation}`);
      }
      
      if (result.warnings.length > 0) {
        console.log('\nWarnings:');
        for (const warning of result.warnings) {
          console.log(`  ⚠ ${warning}`);
        }
      }
      
      process.exit(result.permitted ? 0 : 1);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== AMENDMENTS COMMAND ====================

program
  .command('amendments <file>')
  .description('List applied amendments and their effects')
  .option('-a, --amendments <files...>', 'Amendment files to apply')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: { amendments?: string[]; json?: boolean }) => {
    try {
      if (!options.amendments || options.amendments.length === 0) {
        console.log('\nNo amendments specified. Use -a to provide amendment files.');
        process.exit(0);
      }

      const interpreter = await loadInterpreter(file, undefined, options.amendments);
      const amendments = interpreter.getAppliedAmendments();

      if (options.json) {
        console.log(JSON.stringify(amendments, null, 2));
        return;
      }

      console.log('\nAPPLIED AMENDMENTS');
      console.log('─'.repeat(60));

      if (amendments.length === 0) {
        console.log('  No amendments applied');
      } else {
        for (const amendment of amendments) {
          console.log(`\n  Amendment ${amendment.number}`);
          if (amendment.effective) {
            console.log(`    Effective: ${amendment.effective.value}`);
          }
          if (amendment.description) {
            console.log(`    Description: ${amendment.description}`);
          }
          console.log(`    Directives: ${amendment.directives.length}`);

          for (const directive of amendment.directives) {
            switch (directive.directive) {
              case 'add': {
                const stmt = directive.statement as Statement & { name?: string; target?: string };
                console.log(`      + ADDS ${directive.statement.type} ${stmt.name ?? stmt.target ?? ''}`);
                break;
              }
              case 'delete':
                console.log(`      - DELETES ${directive.targetType} ${directive.targetName}`);
                break;
              case 'replace':
                console.log(`      ~ REPLACES ${directive.targetType} ${directive.targetName}`);
                break;
              case 'modify':
                console.log(`      ~ MODIFIES ${directive.targetType} ${directive.targetName}`);
                break;
            }
          }
        }
      }

      console.log('\n' + '─'.repeat(60));
      console.log(`Total: ${amendments.length} amendment(s) applied`);

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== CURE COMMAND ====================

program
  .command('cure <file> <covenant> <amount>')
  .description('Apply cure to a breached covenant')
  .option('-d, --data <file>', 'Financial data JSON file (required)')
  .action(async (file: string, covenant: string, amountStr: string, options: { data?: string }) => {
    try {
      if (!options.data) {
        console.error('Error: --data is required for cure command');
        process.exit(1);
      }

      const amount = parseFloat(amountStr.replace(/[$,_]/g, ''));
      if (isNaN(amount)) {
        console.error(`Error: Invalid amount: ${amountStr}`);
        process.exit(1);
      }

      const interpreter = await loadInterpreter(file, options.data);

      // Check if covenant exists and has cure
      const covenantsWithCure = interpreter.getCovenantsWithCure();
      if (!covenantsWithCure.includes(covenant)) {
        const allCovenants = interpreter.getCovenantNames();
        if (!allCovenants.includes(covenant)) {
          console.error(`Error: Unknown covenant: ${covenant}`);
        } else {
          console.error(`Error: Covenant ${covenant} has no cure mechanism`);
        }
        process.exit(1);
      }

      console.log('\nCURE APPLICATION');
      console.log('─'.repeat(50));
      console.log(`Covenant: ${covenant}`);
      console.log(`Amount:   $${formatMoney(amount)}`);
      console.log('');

      // Show before state
      const beforeResult = interpreter.checkCovenantWithCure(covenant);
      console.log('Before Cure:');
      printCovenantResult(beforeResult);
      if (!beforeResult.compliant && beforeResult.shortfall !== undefined) {
        console.log(`  Shortfall: ${formatNumber(beforeResult.shortfall)}`);
      }
      console.log('');

      // Apply cure
      const cureResult = interpreter.applyCure(covenant, amount);

      if (cureResult.success) {
        console.log('─'.repeat(50));
        console.log('✓ CURE APPLIED SUCCESSFULLY');
        console.log(`  Cured amount: $${formatMoney(amount)}`);

        // Show cure usage
        const usage = interpreter.getCureUsage();
        const relevantUsage = usage.find(u => u.mechanism === beforeResult.cureMechanism?.type);
        if (relevantUsage && relevantUsage.maxUses !== Infinity) {
          console.log(`  ${relevantUsage.mechanism}: ${relevantUsage.usesRemaining} uses remaining (${relevantUsage.totalUses}/${relevantUsage.maxUses} used)`);
        }
      } else {
        console.log('─'.repeat(50));
        console.log('✗ CURE FAILED');
        console.log(`  Reason: ${cureResult.reason}`);
        process.exit(1);
      }

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== LEDGER COMMAND ====================

program
  .command('ledger <file>')
  .description('View basket transaction ledger')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-b, --basket <name>', 'Filter to specific basket')
  .option('--since <date>', 'Show entries since date (YYYY-MM-DD)')
  .option('--json', 'Output as JSON')
  .option('-e, --export <file>', 'Export ledger to JSON file')
  .action(async (file: string, options: { data?: string; basket?: string; since?: string; json?: boolean; export?: string }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data);
      let ledger = interpreter.getBasketLedger();

      // Apply filters
      if (options.basket) {
        ledger = ledger.filter(e => e.basket === options.basket);
      }
      if (options.since) {
        const since = new Date(options.since);
        ledger = ledger.filter(e => e.timestamp >= since);
      }

      // Export to file if requested
      if (options.export) {
        const { writeFile } = await import('fs/promises');
        await writeFile(options.export, JSON.stringify(ledger, null, 2));
        console.log(`Ledger exported to ${options.export}`);
        return;
      }

      // Output as JSON or formatted
      if (options.json) {
        console.log(JSON.stringify(ledger, null, 2));
      } else {
        printLedger(ledger);
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== ACCUMULATE COMMAND ====================

program
  .command('accumulate <file> [basket]')
  .description('Accumulate capacity in builder baskets')
  .option('-d, --data <file>', 'Financial data JSON file (required)')
  .option('-m, --description <text>', 'Description for ledger entry', 'CLI accumulation')
  .option('--dry-run', 'Show what would be accumulated without committing')
  .action(async (file: string, basket: string | undefined, options: { data?: string; description: string; dryRun?: boolean }) => {
    try {
      if (!options.data) {
        console.error('Error: --data is required for accumulate command');
        process.exit(1);
      }

      const interpreter = await loadInterpreter(file, options.data);
      const builderBaskets = interpreter.getBuilderBasketNames();

      if (builderBaskets.length === 0) {
        console.log('\nNo builder baskets found in this agreement.');
        process.exit(0);
      }

      // Determine which baskets to accumulate
      const basketsToAccumulate = basket ? [basket] : builderBaskets;

      // Validate specified basket
      if (basket && !builderBaskets.includes(basket)) {
        const basketType = interpreter.getAllBasketStatuses().find(b => b.name === basket)?.basketType;
        if (basketType) {
          console.error(`Error: '${basket}' is not a builder basket (type: ${basketType})`);
          console.error('       Only builder baskets can accumulate capacity.');
        } else {
          console.error(`Error: Unknown basket: ${basket}`);
        }
        process.exit(1);
      }

      if (options.dryRun) {
        console.log('\nDRY RUN - No changes will be made');
      } else {
        console.log('\nBUILDER BASKET ACCUMULATION');
      }
      console.log('─'.repeat(50));
      console.log('');

      let totalAccumulated = 0;
      const results: Array<{ name: string; before: number; amount: number; after: number; maximum?: number }> = [];

      for (const name of basketsToAccumulate) {
        const statusBefore = interpreter.getBasketStatus(name);
        const before = statusBefore.capacity;

        if (options.dryRun) {
          // For dry-run, we need to calculate what would be accumulated
          // We can't call accumulateBuilderBasket without modifying state
          // So we'll just show the current status and note it would accumulate
          console.log(`  ${name}`);
          console.log(`    Current:      $${formatMoney(before)}`);
          console.log(`    Would accumulate based on BUILDS_FROM expression`);
          if (statusBefore.maximum !== undefined) {
            const remaining = statusBefore.maximum - before;
            console.log(`    Maximum:      $${formatMoney(statusBefore.maximum)} ($${formatMoney(remaining)} remaining)`);
          }
          console.log('');
        } else {
          const amount = interpreter.accumulateBuilderBasket(name, options.description);
          const statusAfter = interpreter.getBasketStatus(name);
          const after = statusAfter.capacity;

          results.push({ name, before, amount, after, maximum: statusAfter.maximum });
          totalAccumulated += amount;

          console.log(`  ${name}`);
          console.log(`    Before:       $${formatMoney(before)}`);
          console.log(`    Accumulating: +$${formatMoney(amount)}`);
          console.log(`    After:        $${formatMoney(after)}`);
          if (statusAfter.maximum !== undefined) {
            const remaining = statusAfter.maximum - after;
            if (remaining > 0) {
              console.log(`    Maximum:      $${formatMoney(statusAfter.maximum)} ($${formatMoney(remaining)} remaining)`);
            } else {
              console.log(`    Maximum:      $${formatMoney(statusAfter.maximum)} (AT MAXIMUM)`);
            }
          }
          console.log('');
        }
      }

      console.log('─'.repeat(50));
      if (options.dryRun) {
        console.log(`${basketsToAccumulate.length} basket(s) would be accumulated.`);
      } else {
        console.log(`${results.length} basket(s) accumulated. Total: +$${formatMoney(totalAccumulated)}`);
        console.log(`Ledger entry recorded: "${options.description}"`);
      }

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== MILESTONES COMMAND ====================

program
  .command('milestones <file>')
  .description('Show milestone status for project finance deals')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--as-of <date>', 'Check status as of date (YYYY-MM-DD)')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: { data?: string; amendments?: string[]; asOf?: string; json?: boolean }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      if (!interpreter.hasMilestones()) {
        console.log('\nNo milestones defined in this agreement.');
        process.exit(0);
      }

      const asOfDate = options.asOf ? new Date(options.asOf) : new Date();
      const milestones = interpreter.getAllMilestoneStatuses(asOfDate);

      if (options.json) {
        console.log(JSON.stringify(milestones, null, 2));
        return;
      }

      console.log('\nCONSTRUCTION MILESTONES');
      if (options.asOf) {
        console.log(`As of: ${options.asOf}`);
      }
      console.log('─'.repeat(75));
      console.log(
        'Status'.padEnd(12) +
        'Milestone'.padEnd(25) +
        'Target'.padEnd(14) +
        'Longstop'.padEnd(14) +
        'Days'
      );
      console.log('─'.repeat(75));

      for (const milestone of milestones) {
        printMilestoneStatus(milestone);
      }

      console.log('─'.repeat(75));

      const achieved = milestones.filter(m => m.status === 'achieved').length;
      const atRisk = milestones.filter(m => m.status === 'at_risk').length;
      const breached = milestones.filter(m => m.status === 'breached').length;

      console.log(`Summary: ${achieved} achieved, ${milestones.length - achieved - atRisk - breached} pending, ${atRisk} at risk, ${breached} breached`);

      process.exit(breached > 0 ? 1 : 0);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== RESERVES COMMAND ====================

program
  .command('reserves <file>')
  .description('Show reserve account status')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: { data?: string; amendments?: string[]; json?: boolean }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      if (!interpreter.hasReserves()) {
        console.log('\nNo reserve accounts defined in this agreement.');
        process.exit(0);
      }

      const reserves = interpreter.getAllReserveStatuses();

      if (options.json) {
        console.log(JSON.stringify(reserves, null, 2));
        return;
      }

      console.log('\nRESERVE ACCOUNTS');
      console.log('─'.repeat(70));

      for (const reserve of reserves) {
        printReserveStatus(reserve);
      }

      const belowMinimum = reserves.filter(r => r.belowMinimum);
      if (belowMinimum.length > 0) {
        console.log('\n⚠ WARNING: The following reserves are below minimum:');
        for (const r of belowMinimum) {
          console.log(`  - ${r.name}: $${formatMoney(r.balance)} < $${formatMoney(r.minimum)} minimum`);
        }
      }

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== WATERFALL COMMAND ====================

program
  .command('waterfall <file>')
  .description('Execute waterfall distribution')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('-r, --revenue <amount>', 'Revenue amount to distribute')
  .option('-w, --waterfall <name>', 'Specific waterfall to execute')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: { data?: string; amendments?: string[]; revenue?: string; waterfall?: string; json?: boolean }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      if (!interpreter.hasWaterfalls()) {
        console.log('\nNo waterfalls defined in this agreement.');
        process.exit(0);
      }

      const waterfallNames = interpreter.getWaterfallNames();
      const waterfallName = options.waterfall ?? waterfallNames[0]!;

      if (!waterfallNames.includes(waterfallName)) {
        console.error(`Error: Unknown waterfall '${waterfallName}'`);
        console.error(`Available waterfalls: ${waterfallNames.join(', ')}`);
        process.exit(1);
      }

      // Get revenue from option or try to resolve from financial data
      let revenue = 0;
      if (options.revenue) {
        revenue = parseFloat(options.revenue.replace(/[$,_]/g, ''));
      } else {
        // Try to get revenue from financial data
        try {
          revenue = interpreter.evaluate('Revenue') ?? interpreter.evaluate('revenue') ?? 0;
        } catch {
          console.error('Error: --revenue is required (could not resolve from financial data)');
          process.exit(1);
        }
      }

      const result = interpreter.executeWaterfall(waterfallName, revenue);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`\nWATERFALL: ${result.name}`);
      console.log('─'.repeat(70));
      console.log(`Total Revenue: $${formatMoney(result.totalRevenue)}`);
      console.log('');

      for (const tier of result.tiers) {
        printWaterfallTier(tier);
      }

      console.log('─'.repeat(70));
      console.log(`Distributed: $${formatMoney(result.totalDistributed)}`);
      console.log(`Remainder:   $${formatMoney(result.remainder)}`);

      const blocked = result.tiers.filter(t => t.blocked);
      if (blocked.length > 0) {
        console.log('\n⚠ BLOCKED TIERS:');
        for (const t of blocked) {
          console.log(`  - Tier ${t.priority} "${t.name}": ${t.blockReason}`);
        }
      }

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== DRAW COMMAND ====================

program
  .command('draw <file> <checklist>')
  .description('Check conditions precedent for a draw')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--json', 'Output as JSON')
  .action(async (file: string, checklist: string, options: { data?: string; amendments?: string[]; json?: boolean }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      if (!interpreter.hasConditionsPrecedent()) {
        console.log('\nNo conditions precedent defined in this agreement.');
        process.exit(0);
      }

      const checklistNames = interpreter.getCPChecklistNames();
      if (!checklistNames.includes(checklist)) {
        console.error(`Error: Unknown CP checklist '${checklist}'`);
        console.error(`Available checklists: ${checklistNames.join(', ')}`);
        process.exit(1);
      }

      const result = interpreter.getCPChecklist(checklist);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`\nCONDITIONS PRECEDENT - ${result.name}`);
      if (result.section) {
        console.log(`Section ${result.section}`);
      }
      console.log(`${result.satisfied + result.waived} of ${result.totalConditions} Complete`);
      console.log('─'.repeat(70));

      for (const cp of result.conditions) {
        printCPItem(cp);
      }

      console.log('─'.repeat(70));

      if (result.complete) {
        console.log('✓ DRAW ALLOWED - All conditions precedent satisfied or waived');
        process.exit(0);
      } else {
        console.log(`✗ DRAW NOT ALLOWED - ${result.pending} condition(s) still pending`);
        process.exit(1);
      }

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== PHASE COMMAND ====================

program
  .command('phase <file>')
  .description('Show current phase and transition status')
  .option('-d, --data <file>', 'Financial data JSON file')
  .option('-a, --amendments <files...>', 'Amendment files to apply in order')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: { data?: string; amendments?: string[]; json?: boolean }) => {
    try {
      const interpreter = await loadInterpreter(file, options.data, options.amendments);

      if (!interpreter.hasPhases()) {
        console.log('\nNo phases defined in this agreement.');
        process.exit(0);
      }

      const currentPhase = interpreter.getCurrentPhase();
      const phaseStatement = interpreter.getCurrentPhaseStatement();
      const transitions = interpreter.checkPhaseTransitions();
      const history = interpreter.getPhaseHistory();

      if (options.json) {
        console.log(JSON.stringify({
          currentPhase,
          phaseStatement,
          transitions,
          history,
        }, null, 2));
        return;
      }

      console.log('\nPHASE STATUS');
      console.log('─'.repeat(60));
      console.log(`Current Phase: ${currentPhase ?? 'None'}`);

      if (phaseStatement) {
        const suspended = interpreter.getSuspendedCovenants();
        const required = interpreter.getRequiredCovenants();
        if (suspended.length > 0) {
          console.log(`Suspended Covenants: ${suspended.join(', ')}`);
        }
        if (required.length > 0) {
          console.log(`Required Covenants: ${required.join(', ')}`);
        }
      }

      console.log('\nTRANSITIONS');
      console.log('─'.repeat(60));

      for (const transition of transitions) {
        const status = transition.triggered ? '✓ READY' : '○ Pending';
        console.log(`  ${status} ${transition.name}`);
        if (transition.targetPhase) {
          console.log(`         → ${transition.targetPhase}`);
        }
        for (const cond of transition.conditions) {
          const condStatus = cond.met ? '✓' : '○';
          console.log(`         ${condStatus} ${cond.name}`);
        }
      }

      if (history.length > 1) {
        console.log('\nHISTORY');
        console.log('─'.repeat(60));
        for (const entry of history) {
          const date = entry.enteredAt.toISOString().split('T')[0];
          console.log(`  ${date} → ${entry.phase}${entry.triggeredBy ? ` (via ${entry.triggeredBy})` : ''}`);
        }
      }

    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== 'Parse failed') {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });

// ==================== HELPER FUNCTIONS ====================

/**
 * Format and display a validation result
 */
function formatValidationResult(result: ValidationResult, filename: string, quiet: boolean): void {
  // In quiet mode, only show errors
  const issueCount = quiet
    ? result.errors.length
    : result.errors.length + result.warnings.length;

  if (issueCount === 0) {
    console.log(`\n✓ ${filename} is valid`);
    return;
  }

  console.log('');
  console.log(`Validation Results for ${filename}`);
  console.log('─'.repeat(60));

  // Display errors
  if (result.errors.length > 0) {
    console.log('');
    console.log('ERRORS:');
    for (const error of result.errors) {
      console.log(`  ✗ ${error.message}`);
      if (error.context) {
        console.log(`    in ${error.context}`);
      }
    }
  }

  // Display warnings (unless quiet mode)
  if (!quiet && result.warnings.length > 0) {
    console.log('');
    console.log('WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`  ⚠ ${warning.message}`);
      if (warning.context) {
        console.log(`    in ${warning.context}`);
      }
    }
  }

  console.log('');
  console.log('─'.repeat(60));

  if (result.errors.length > 0) {
    console.log(`✗ ${result.errors.length} error(s)${!quiet && result.warnings.length > 0 ? `, ${result.warnings.length} warning(s)` : ''}`);
  } else if (result.warnings.length > 0 && !quiet) {
    console.log(`⚠ ${result.warnings.length} warning(s) - file is valid but may have issues at runtime`);
  }
}

/**
 * Format and display a parse error with source context
 */
function formatParseError(error: ParseError, source: string, filename: string): void {
  // Header
  console.error('');
  console.error('Parse Error');
  console.error('─'.repeat(60));

  // Show location if available
  if (error.location) {
    const lines = source.split('\n');
    const lineNum = error.location.start.line;
    const col = error.location.start.column;
    const endCol = error.location.end.line === lineNum
      ? error.location.end.column
      : (lines[lineNum - 1]?.length ?? col) + 1;
    const line = lines[lineNum - 1] ?? '';

    // Location indicator
    console.error(`  --> ${filename}:${lineNum}:${col}`);
    console.error('   |');

    // Source line with line number
    const lineNumStr = lineNum.toString().padStart(3);
    console.error(`${lineNumStr} | ${line}`);

    // Caret indicator (show range if multi-character)
    const caretLength = Math.max(1, endCol - col);
    const caret = caretLength > 1 ? '^'.repeat(caretLength) : '^';
    console.error(`   | ${' '.repeat(col - 1)}${caret}`);
    console.error('   |');
  }

  // Error message
  console.error(`Error: ${error.message}`);

  // Show what was expected if available
  if (error.expected && error.expected.length > 0) {
    const expectedList = error.expected.slice(0, 5); // Limit to 5 items
    const more = error.expected.length > 5 ? ` (and ${error.expected.length - 5} more)` : '';

    if (expectedList.length === 1) {
      console.error(`Expected: ${expectedList[0]}`);
    } else {
      console.error(`Expected one of: ${expectedList.join(', ')}${more}`);
    }
  }

  // Show what was found if available
  if (error.found !== undefined) {
    const foundStr = error.found === null ? 'end of input' : `"${error.found}"`;
    console.error(`Found: ${foundStr}`);
  }

  console.error('');
}

async function loadInterpreter(crlFile: string, dataFile?: string, amendmentFiles?: string[]): Promise<ProVisoInterpreter> {
  const source = await readFile(crlFile, 'utf-8');
  const result = await parse(source);

  if (!result.success || !result.ast) {
    if (result.error) {
      formatParseError(result.error, source, crlFile);
    }
    // Throw to trigger the error handling in the calling command
    throw new Error('Parse failed');
  }

  const interpreter = new ProVisoInterpreter(result.ast);

  if (dataFile) {
    const dataSource = await readFile(dataFile, 'utf-8');
    const data = JSON.parse(dataSource) as Record<string, unknown>;
    interpreter.loadFinancialsFromFile(data);
  }

  // Apply amendments in order
  if (amendmentFiles && amendmentFiles.length > 0) {
    for (const amendmentFile of amendmentFiles) {
      const amendmentSource = await readFile(amendmentFile, 'utf-8');
      const amendmentResult = await parse(amendmentSource);

      if (!amendmentResult.success || !amendmentResult.ast) {
        if (amendmentResult.error) {
          formatParseError(amendmentResult.error, amendmentSource, amendmentFile);
        }
        throw new Error('Parse failed');
      }

      // Find all amendment statements and apply them
      for (const stmt of amendmentResult.ast.statements) {
        if (stmt.type === 'Amendment') {
          interpreter.applyAmendment(stmt);
        }
      }
    }
  }

  return interpreter;
}

function printCovenantResult(result: CovenantResult): void {
  const symbol = result.compliant ? '✓' : '✗';
  const actualStr = formatNumber(result.actual);
  const thresholdStr = formatNumber(result.threshold);
  const headroomStr = result.headroom !== undefined 
    ? ` (headroom: ${formatNumber(result.headroom)})` 
    : '';
  
  console.log(`  ${symbol} ${result.name.padEnd(20)} ${actualStr} ${result.operator} ${thresholdStr}${headroomStr}`);
}

function printCovenantComparison(current: CovenantResult, proforma: CovenantResult): void {
  const currSymbol = current.compliant ? '✓' : '✗';
  const pfSymbol = proforma.compliant ? '✓' : '✗';
  const change = proforma.actual - current.actual;
  const changeStr = change >= 0 ? `+${formatNumber(change)}` : formatNumber(change);
  
  console.log(`  ${proforma.name.padEnd(20)} ${currSymbol}→${pfSymbol} ${formatNumber(current.actual)} → ${formatNumber(proforma.actual)} (${changeStr})`);
}

function printBasketStatus(basket: BasketStatus, verbose: boolean = false): void {
  const pct = basket.capacity > 0 ? (basket.used / basket.capacity) * 100 : 0;
  const barLength = 20;
  const filledLength = Math.round((pct / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  console.log(`  ${basket.name.padEnd(22)} [${bar}] $${formatMoney(basket.available)} available`);
  printBasketDetails(basket, verbose);
}

function printBasketDetails(basket: BasketStatus, verbose: boolean): void {
  const type = basket.basketType ?? 'fixed';

  if (type === 'fixed') {
    console.log(`    Type: Fixed | Capacity: $${formatMoney(basket.capacity)}`);
  } else if (type === 'grower') {
    const baseCapacity = basket.baseCapacity ?? basket.capacity;
    const floor = basket.floor;
    const floorActive = floor !== undefined && baseCapacity < floor;

    let details = `    Type: Grower | Base: $${formatMoney(baseCapacity)}`;
    if (floor !== undefined) {
      details += ` | Floor: $${formatMoney(floor)}`;
      if (floorActive) {
        details += ' (ACTIVE)';
      }
    }
    console.log(details);

    if (verbose && floorActive) {
      console.log(`    Floor is providing $${formatMoney(floor - baseCapacity)} additional capacity`);
    }
  } else if (type === 'builder') {
    const accumulated = basket.accumulated ?? 0;
    const starting = basket.starting ?? 0;
    const maximum = basket.maximum;

    let details = `    Type: Builder | Starting: $${formatMoney(starting)} | Accumulated: +$${formatMoney(accumulated)}`;
    if (maximum !== undefined) {
      const remaining = maximum - basket.capacity;
      details += ` | Max: $${formatMoney(maximum)}`;
      if (remaining > 0) {
        details += ` ($${formatMoney(remaining)} remaining)`;
      } else {
        details += ' (AT MAXIMUM)';
      }
    }
    console.log(details);

    if (verbose && maximum !== undefined) {
      const totalAccumulated = accumulated;
      const maxAccumulation = maximum - starting;
      const pctOfMax = maxAccumulation > 0 ? (totalAccumulated / maxAccumulation) * 100 : 100;
      console.log(`    Accumulation: ${pctOfMax.toFixed(1)}% of maximum growth capacity used`);
    }
  }
}

function printCureUsage(usage: CureUsage): void {
  const remaining = usage.maxUses === Infinity
    ? 'unlimited'
    : `${usage.usesRemaining} remaining`;
  const used = usage.totalUses > 0 ? `(${usage.totalUses} used)` : '';

  console.log(`  ${usage.mechanism.padEnd(20)} ${remaining} ${used}`);
  if (usage.period !== 'unlimited') {
    console.log(`    Period: ${usage.period}`);
  }
}

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
      date!.padEnd(12) +
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

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(1)}K`;
  }
  if (n % 1 !== 0 && Math.abs(n) < 100) {
    return `${n.toFixed(2)}x`;
  }
  return n.toLocaleString();
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return n.toLocaleString();
}

function printMilestoneStatus(milestone: MilestoneResult): void {
  const symbols: Record<string, string> = {
    achieved: '●',
    pending: '○',
    at_risk: '◐',
    breached: '✗',
  };

  const symbol = symbols[milestone.status] ?? '?';
  const statusStr = milestone.status.toUpperCase().padEnd(10);
  const nameStr = milestone.name.padEnd(23);
  const targetStr = (milestone.targetDate ?? 'N/A').padEnd(12);
  const longstopStr = (milestone.longstopDate ?? 'N/A').padEnd(12);

  let daysStr = '';
  if (milestone.status === 'achieved') {
    daysStr = milestone.achievedDate ?? '';
  } else if (milestone.status === 'pending') {
    daysStr = `${milestone.daysToTarget}d to target`;
  } else if (milestone.status === 'at_risk') {
    daysStr = `${milestone.daysToLongstop}d to longstop`;
  } else if (milestone.status === 'breached') {
    daysStr = `${-milestone.daysToLongstop}d past longstop`;
  }

  console.log(`${symbol} ${statusStr} ${nameStr} ${targetStr} ${longstopStr} ${daysStr}`);
}

function printReserveStatus(reserve: ReserveStatus): void {
  const pct = reserve.fundedPercent;
  const barLength = 20;
  const filledLength = Math.round(Math.min(pct, 100) / 100 * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  const status = reserve.belowMinimum ? '⚠' : '✓';
  const pctStr = `${pct.toFixed(0)}%`.padStart(5);

  console.log(`${status} ${reserve.name.padEnd(25)} [${bar}] ${pctStr}`);
  console.log(`    Balance: $${formatMoney(reserve.balance)} | Target: $${formatMoney(reserve.target)} | Min: $${formatMoney(reserve.minimum)}`);
  console.log(`    Available for release: $${formatMoney(reserve.availableForRelease)}`);
  console.log('');
}

function printWaterfallTier(tier: WaterfallTierResult): void {
  const status = tier.blocked ? '✗' : '│';

  console.log(`${status}  Tier ${tier.priority}: ${tier.name}`);

  if (tier.blocked) {
    console.log(`     [BLOCKED: ${tier.blockReason}]`);
  } else {
    console.log(`     Requested: $${formatMoney(tier.requested)}`);
    console.log(`     Paid:      $${formatMoney(tier.paid)}`);
    if (tier.shortfall > 0) {
      console.log(`     Shortfall: $${formatMoney(tier.shortfall)}`);
    }
    if (tier.reserveDrawn > 0) {
      console.log(`     Reserve:   $${formatMoney(tier.reserveDrawn)} drawn`);
    }
  }
  console.log('');
}

function printCPItem(cp: CPItemResult): void {
  const symbols: Record<string, string> = {
    satisfied: '✓',
    pending: '○',
    waived: '~',
    not_applicable: '-',
  };

  const symbol = symbols[cp.status] ?? '?';
  const statusStr = cp.status.padEnd(12);
  const descStr = cp.description ? ` - ${cp.description}` : '';
  const respStr = cp.responsible ? ` (${cp.responsible})` : '';

  console.log(`${symbol} ${cp.name.padEnd(25)} ${statusStr}${respStr}`);
  if (cp.description) {
    console.log(`  ${descStr}`);
  }
}

// ==================== RUN ====================

program.parse();
