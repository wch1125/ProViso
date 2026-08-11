/**
 * Dashboard demo-code parse gate.
 *
 * Every .proviso snippet the dashboard ships is embedded as a template literal
 * in `dashboard/src/data/`, not as a file the parser tests otherwise reach. When
 * one of those snippets stops parsing, the failure is silent in the worst way:
 * the context provider leaves the interpreter null and the UI renders
 * "Interpreter not loaded" with no indication of which line broke. That is a
 * demo-killer discovered by a viewer rather than by CI.
 *
 * This replaces two abandoned root-level scratch scripts (`test-parse.cjs` and
 * `test-scenarios.js`) that did the same check by hand. The latter had been
 * dead for months — a `require()` in an ESM package — which is precisely why
 * the check belongs in the suite instead of in a script someone remembers to run.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from '../src/parser.js';

const DATA_DIR = join(__dirname, '..', 'dashboard', 'src', 'data');

/** Data modules holding embedded ProViso source. */
const SOURCE_FILES = ['demo-scenarios.ts', 'default-code.ts', 'negotiation-demo.ts'];

/**
 * Minimum number of snippets we expect to find in total. Without this floor a
 * regex that silently stops matching would turn this suite green while checking
 * nothing at all.
 */
const MIN_EXPECTED_SNIPPETS = 5;

interface Snippet {
  file: string;
  name: string;
  line: number;
  code: string;
}

/**
 * Pull out every template literal bound to an identifier ending in `Code`/`CODE`,
 * covering both `const solarCode = \`...\`` and `creditLangCode: \`...\``.
 *
 * Deliberately naive: it scans to the next unescaped backtick. That is safe here
 * because none of these snippets contain `${}` interpolation or escaped
 * backticks — a fact asserted below so this stays true.
 */
function extractSnippets(file: string): Snippet[] {
  const contents = readFileSync(join(DATA_DIR, file), 'utf8');
  const opener = /(\w*(?:Code|CODE))\s*[:=]\s*`/g;
  const found: Snippet[] = [];

  let match: RegExpExecArray | null;
  while ((match = opener.exec(contents)) !== null) {
    const start = match.index + match[0].length;
    let end = start;
    while (end < contents.length) {
      if (contents[end] === '`' && contents[end - 1] !== '\\') break;
      end++;
    }

    found.push({
      file,
      name: match[1],
      line: contents.slice(0, match.index).split('\n').length,
      code: contents.slice(start, end),
    });

    opener.lastIndex = end;
  }

  return found;
}

const snippets = SOURCE_FILES.flatMap(extractSnippets);

describe('Dashboard demo code', () => {
  it('finds the embedded ProViso snippets', () => {
    expect(snippets.length).toBeGreaterThanOrEqual(MIN_EXPECTED_SNIPPETS);
  });

  it('extracts snippets free of interpolation, which the scanner cannot handle', () => {
    const interpolated = snippets.filter((s) => s.code.includes('${'));
    expect(interpolated.map((s) => `${s.file}:${s.name}`)).toEqual([]);
  });

  describe.each(SOURCE_FILES)('%s', (file) => {
    const forFile = snippets.filter((s) => s.file === file);

    it('contains at least one snippet', () => {
      expect(forFile.length).toBeGreaterThan(0);
    });

    it.each(forFile.map((s) => [s.name, s] as const))('%s parses', async (_name, snippet) => {
      const result = await parse(snippet.code);

      if (!result.success) {
        const loc = result.error?.location;
        const where = loc ? ` at line ${loc.start.line}, column ${loc.start.column}` : '';
        throw new Error(
          `${snippet.file}:${snippet.line} (${snippet.name}) failed to parse${where}: ` +
            `${result.error?.message ?? 'unknown error'}`
        );
      }

      expect(result.ast?.statements.length).toBeGreaterThan(0);
    });
  });
});
