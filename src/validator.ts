// ProViso Semantic Validator
// Checks for undefined references before runtime evaluation

import {
  Program,
  Statement,
  Expression,
  ValidationResult,
  ValidationIssue,
  isObjectExpression,
  DefineStatement,
  CovenantStatement,
  BasketStatement,
  ConditionStatement,
  ProhibitStatement,
  EventStatement,
} from './types.js';

/**
 * Symbol table containing all named definitions from the program
 */
interface SymbolTable {
  defines: Set<string>;
  covenants: Set<string>;
  baskets: Set<string>;
  conditions: Set<string>;
  events: Set<string>;
}

/**
 * Validates a parsed ProViso program for semantic correctness.
 *
 * Checks performed:
 * - Undefined identifier references (warnings for potential financial data fields)
 * - Invalid function arguments (AVAILABLE must reference a basket, COMPLIANT must reference a covenant, etc.)
 * - Circular reference detection (future)
 *
 * @param ast The parsed program AST
 * @returns ValidationResult with errors and warnings
 */
export function validate(ast: Program): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Build symbol table from all statements
  const symbols = buildSymbolTable(ast);

  // Validate each statement
  for (const stmt of ast.statements) {
    validateStatement(stmt, symbols, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Build a symbol table from the program's statements
 */
function buildSymbolTable(ast: Program): SymbolTable {
  const symbols: SymbolTable = {
    defines: new Set(),
    covenants: new Set(),
    baskets: new Set(),
    conditions: new Set(),
    events: new Set(),
  };

  for (const stmt of ast.statements) {
    switch (stmt.type) {
      case 'Define':
        symbols.defines.add(stmt.name);
        break;
      case 'Covenant':
        symbols.covenants.add(stmt.name);
        break;
      case 'Basket':
        symbols.baskets.add(stmt.name);
        break;
      case 'Condition':
        symbols.conditions.add(stmt.name);
        break;
      case 'Event':
        symbols.events.add(stmt.name);
        break;
    }
  }

  return symbols;
}

/**
 * Check if an identifier is a known symbol or likely a financial data field
 */
function isKnownSymbol(name: string, symbols: SymbolTable): boolean {
  return (
    symbols.defines.has(name) ||
    symbols.covenants.has(name) ||
    symbols.baskets.has(name) ||
    symbols.conditions.has(name) ||
    symbols.events.has(name)
  );
}

/**
 * Validate a single statement
 */
function validateStatement(
  stmt: Statement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  switch (stmt.type) {
    case 'Define':
      validateDefine(stmt, symbols, errors, warnings);
      break;
    case 'Covenant':
      validateCovenant(stmt, symbols, errors, warnings);
      break;
    case 'Basket':
      validateBasket(stmt, symbols, errors, warnings);
      break;
    case 'Condition':
      validateCondition(stmt, symbols, errors, warnings);
      break;
    case 'Prohibit':
      validateProhibit(stmt, symbols, errors, warnings);
      break;
    case 'Event':
      validateEvent(stmt, symbols, errors, warnings);
      break;
  }
}

/**
 * Validate a DEFINE statement
 */
function validateDefine(
  stmt: DefineStatement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const context = `DEFINE ${stmt.name}`;
  validateExpression(stmt.expression, symbols, errors, warnings, context);

  // Validate modifiers
  if (stmt.modifiers.excluding) {
    for (const item of stmt.modifiers.excluding) {
      // EXCLUDING items are typically raw financial data fields
      // We can't validate these statically, but we note them
      if (!isKnownSymbol(item, symbols)) {
        warnings.push({
          severity: 'warning',
          message: `EXCLUDING references '${item}' which is not a defined term - ensure it exists in financial data`,
          reference: item,
          context,
          expectedType: 'identifier',
        });
      }
    }
  }

  if (stmt.modifiers.cap) {
    validateExpression(stmt.modifiers.cap, symbols, errors, warnings, `${context} CAPPED AT`);
  }
}

/**
 * Validate a COVENANT statement
 */
function validateCovenant(
  stmt: CovenantStatement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const context = `COVENANT ${stmt.name}`;

  if (stmt.requires) {
    validateExpression(stmt.requires, symbols, errors, warnings, `${context} REQUIRES`);
  }

  if (stmt.cure?.details?.maxAmount) {
    validateExpression(stmt.cure.details.maxAmount, symbols, errors, warnings, `${context} CURE`);
  }
}

/**
 * Validate a BASKET statement
 */
function validateBasket(
  stmt: BasketStatement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const context = `BASKET ${stmt.name}`;

  if (stmt.capacity) {
    validateExpression(stmt.capacity, symbols, errors, warnings, `${context} CAPACITY`);
  }

  for (const plus of stmt.plus) {
    validateExpression(plus, symbols, errors, warnings, `${context} PLUS`);
  }

  if (stmt.floor) {
    validateExpression(stmt.floor, symbols, errors, warnings, `${context} FLOOR`);
  }

  if (stmt.buildsFrom) {
    validateExpression(stmt.buildsFrom, symbols, errors, warnings, `${context} BUILDS_FROM`);
  }

  if (stmt.starting) {
    validateExpression(stmt.starting, symbols, errors, warnings, `${context} STARTING`);
  }

  if (stmt.maximum) {
    validateExpression(stmt.maximum, symbols, errors, warnings, `${context} MAXIMUM`);
  }

  // SUBJECT TO references conditions
  if (stmt.subjectTo) {
    for (const condName of stmt.subjectTo) {
      if (!symbols.conditions.has(condName)) {
        errors.push({
          severity: 'error',
          message: `SUBJECT TO references undefined condition '${condName}'`,
          reference: condName,
          context,
          expectedType: 'condition',
        });
      }
    }
  }
}

/**
 * Validate a CONDITION statement
 */
function validateCondition(
  stmt: ConditionStatement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const context = `CONDITION ${stmt.name}`;
  validateExpression(stmt.expression, symbols, errors, warnings, context);
}

/**
 * Validate a PROHIBIT statement
 */
function validateProhibit(
  stmt: ProhibitStatement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const context = `PROHIBIT ${stmt.target}`;

  for (const exception of stmt.exceptions) {
    if (exception.type === 'ExceptWhen' && exception.conditions) {
      for (const cond of exception.conditions) {
        validateExpression(cond, symbols, errors, warnings, `${context} EXCEPT WHEN`);
      }
    }
  }
}

/**
 * Validate an EVENT statement
 */
function validateEvent(
  stmt: EventStatement,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const context = `EVENT ${stmt.name}`;

  if (stmt.triggers) {
    validateExpression(stmt.triggers, symbols, errors, warnings, `${context} TRIGGERS WHEN`);
  }
}

/**
 * Validate an expression, recursively checking all identifiers and function calls
 */
function validateExpression(
  expr: Expression,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  context: string
): void {
  if (typeof expr === 'string') {
    // It's an identifier - check if it's known
    validateIdentifier(expr, symbols, errors, warnings, context);
    return;
  }

  if (typeof expr === 'number') {
    // Numeric literal - always valid
    return;
  }

  if (!isObjectExpression(expr)) {
    return;
  }

  switch (expr.type) {
    case 'Number':
    case 'Currency':
    case 'Percentage':
    case 'Ratio':
      // Literals are always valid
      break;

    case 'BinaryExpression':
      validateExpression(expr.left, symbols, errors, warnings, context);
      validateExpression(expr.right, symbols, errors, warnings, context);
      break;

    case 'UnaryExpression':
      validateExpression(expr.argument, symbols, errors, warnings, context);
      break;

    case 'Comparison':
      validateExpression(expr.left, symbols, errors, warnings, context);
      validateExpression(expr.right, symbols, errors, warnings, context);
      break;

    case 'FunctionCall':
      validateFunctionCall(expr.name, expr.arguments, symbols, errors, warnings, context);
      break;

    case 'Trailing':
      // Validate the inner expression of trailing calculations
      validateExpression(expr.expression, symbols, errors, warnings, context);
      break;
  }
}

/**
 * Validate an identifier reference
 */
function validateIdentifier(
  name: string,
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  context: string
): void {
  // Skip 'amount' - it's a special binding in PROHIBIT EXCEPT WHEN contexts
  if (name === 'amount') {
    return;
  }

  // Check if it's a known symbol
  if (isKnownSymbol(name, symbols)) {
    return;
  }

  // Not a known symbol - it might be a financial data field
  // We treat this as a warning rather than an error since we can't validate
  // financial data fields statically
  warnings.push({
    severity: 'warning',
    message: `'${name}' is not a defined term - ensure it exists in financial data`,
    reference: name,
    context,
    expectedType: 'identifier',
  });
}

/**
 * Validate a function call and its arguments
 */
function validateFunctionCall(
  funcName: string,
  args: Expression[],
  symbols: SymbolTable,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  context: string
): void {
  switch (funcName) {
    case 'AVAILABLE':
      // AVAILABLE must reference a basket
      if (args.length !== 1 || typeof args[0] !== 'string') {
        errors.push({
          severity: 'error',
          message: `AVAILABLE() requires a basket name as argument`,
          context,
        });
      } else if (!symbols.baskets.has(args[0])) {
        errors.push({
          severity: 'error',
          message: `AVAILABLE() references undefined basket '${args[0]}'`,
          reference: args[0],
          context,
          expectedType: 'basket',
        });
      }
      break;

    case 'COMPLIANT':
      // COMPLIANT must reference a covenant
      if (args.length !== 1 || typeof args[0] !== 'string') {
        errors.push({
          severity: 'error',
          message: `COMPLIANT() requires a covenant name as argument`,
          context,
        });
      } else if (!symbols.covenants.has(args[0])) {
        errors.push({
          severity: 'error',
          message: `COMPLIANT() references undefined covenant '${args[0]}'`,
          reference: args[0],
          context,
          expectedType: 'covenant',
        });
      }
      break;

    case 'EXISTS':
      // EXISTS typically references an event or special state
      if (args.length !== 1 || typeof args[0] !== 'string') {
        errors.push({
          severity: 'error',
          message: `EXISTS() requires an identifier as argument`,
          context,
        });
      } else {
        // EXISTS can reference events or runtime states like EventOfDefault, UnmaturedDefault
        // We warn if it's not a known event
        if (!symbols.events.has(args[0])) {
          warnings.push({
            severity: 'warning',
            message: `EXISTS() references '${args[0]}' which is not a defined event - ensure it's a valid runtime state`,
            reference: args[0],
            context,
            expectedType: 'event',
          });
        }
      }
      break;

    case 'GreaterOf':
    case 'LesserOf':
      // These take two numeric expressions
      if (args.length !== 2) {
        errors.push({
          severity: 'error',
          message: `${funcName}() requires exactly two arguments`,
          context,
        });
      } else {
        validateExpression(args[0]!, symbols, errors, warnings, context);
        validateExpression(args[1]!, symbols, errors, warnings, context);
      }
      break;

    case 'NOT':
      // NOT takes a boolean expression
      if (args.length !== 1) {
        errors.push({
          severity: 'error',
          message: `NOT() requires exactly one argument`,
          context,
        });
      } else {
        validateExpression(args[0]!, symbols, errors, warnings, context);
      }
      break;

    case 'TRAILING':
    case 'PROFORMA':
    case 'SUM':
      // These functions take expression arguments - validate them
      for (const arg of args) {
        validateExpression(arg, symbols, errors, warnings, context);
      }
      break;

    default:
      // Note: The grammar restricts function names at parse time, so this
      // default case should be unreachable. Kept for defensive programming.
      errors.push({
        severity: 'error',
        message: `Unknown function '${funcName}'`,
        context,
      });
  }
}
