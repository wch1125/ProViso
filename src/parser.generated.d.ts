/**
 * Type declarations for the Peggy-generated parser.
 * Generated from grammar/proviso.pegjs
 */

import { Program } from './types.js';

/**
 * Parse a ProViso source string into an AST.
 * @param input - The ProViso source code to parse
 * @returns The parsed Program AST
 * @throws SyntaxError if the input is invalid
 */
export function parse(input: string): Program;

/**
 * List of valid start rules for the parser.
 */
export const StartRules: readonly string[];

/**
 * Syntax error class thrown by the parser.
 */
export class SyntaxError extends Error {
  location: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}
