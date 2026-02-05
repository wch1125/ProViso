// ProViso Parser
// Wraps the Peggy-generated parser with TypeScript types

import { Program, ParseResult, ParseError, ParseErrorLocation } from './types.js';

// The generated parser will be imported after build
// For development, we use dynamic import
let parserModule: { parse: (input: string) => Program } | null = null;

async function loadParser(): Promise<{ parse: (input: string) => Program }> {
  if (parserModule) {
    return parserModule;
  }

  try {
    // Try to load the generated parser
    const module = await import('./parser.generated.js');
    parserModule = module;
    return module;
  } catch {
    throw new Error(
      'Parser not generated. Run "npm run build:grammar" first.'
    );
  }
}

/**
 * Peggy SyntaxError expected item type
 */
interface PeggyExpectedItem {
  type: 'literal' | 'class' | 'any' | 'end' | 'other';
  text?: string;
  description?: string;
  parts?: string[];
  inverted?: boolean;
}

/**
 * Peggy SyntaxError type with full error details
 */
interface PeggySyntaxError extends Error {
  location?: ParseErrorLocation;
  expected?: PeggyExpectedItem[];
  found?: string | null;
}

/**
 * Convert Peggy expected items to human-readable strings
 */
function formatExpected(items: PeggyExpectedItem[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    let desc: string;
    switch (item.type) {
      case 'literal':
        desc = item.text ?? '';
        break;
      case 'class':
        desc = item.description ?? '[character class]';
        break;
      case 'any':
        desc = 'any character';
        break;
      case 'end':
        desc = 'end of input';
        break;
      case 'other':
        desc = item.description ?? 'unknown';
        break;
      default:
        desc = item.description ?? item.text ?? 'unknown';
    }

    if (desc && !seen.has(desc)) {
      seen.add(desc);
      result.push(desc);
    }
  }

  return result;
}

/**
 * Parse a ProViso source string into an AST
 */
export async function parse(source: string): Promise<ParseResult> {
  try {
    const parser = await loadParser();
    const ast = parser.parse(source);
    return {
      success: true,
      ast,
      source,
    };
  } catch (err: unknown) {
    const error = err as PeggySyntaxError;

    const parseError: ParseError = {
      message: error.message,
    };

    if (error.location) {
      parseError.location = error.location;
    }

    if (error.expected) {
      parseError.expected = formatExpected(error.expected);
    }

    if (error.found !== undefined) {
      parseError.found = error.found;
    }

    return {
      success: false,
      error: parseError,
      source,
    };
  }
}

/**
 * Parse a ProViso source string, throwing on error
 */
export async function parseOrThrow(source: string): Promise<Program> {
  const result = await parse(source);
  if (!result.success || !result.ast) {
    const loc = result.error?.location;
    const locStr = loc ? ` at line ${loc.start.line}, column ${loc.start.column}` : '';
    throw new Error(`Parse error${locStr}: ${result.error?.message ?? 'Unknown error'}`);
  }
  return result.ast;
}

/**
 * Validate ProViso source without returning the AST
 */
export async function validate(source: string): Promise<{ valid: boolean; errors: ParseError[] }> {
  const result = await parse(source);
  return {
    valid: result.success,
    errors: result.error ? [result.error] : [],
  };
}
