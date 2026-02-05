const { parse } = require('./dist/parser.js');
const fs = require('fs');

const content = fs.readFileSync('./dashboard/src/data/demo-scenarios.ts', 'utf-8');

// Extract code between backticks for a given variable
function extractCode(content, varName) {
  const startMarker = `const ${varName} = \``;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;

  const codeStart = startIdx + startMarker.length;
  // Find the closing backtick (not escaped)
  let i = codeStart;
  while (i < content.length) {
    if (content[i] === '`') {
      break;
    }
    i++;
  }
  return content.substring(codeStart, i);
}

async function test() {
  const scenarios = [
    { name: 'solar', varName: 'solarCode' },
    { name: 'wind', varName: 'windCode' },
    { name: 'corporate', varName: 'corporateCode' }
  ];

  for (const s of scenarios) {
    const code = extractCode(content, s.varName);
    if (!code) {
      console.log(`Could not extract ${s.name}`);
      continue;
    }

    console.log(`\n=== Testing ${s.name} (${code.length} chars) ===`);

    try {
      const result = await parse(code);

      if (result.success) {
        console.log(`SUCCESS: ${result.ast.statements.length} statements`);
      } else {
        console.log(`FAILED: ${result.error?.message}`);
        if (result.error?.location) {
          const loc = result.error.location;
          const lines = code.split('\n');
          console.log(`Line ${loc.start.line}, col ${loc.start.column}:`);
          // Show surrounding context
          for (let i = Math.max(0, loc.start.line - 3); i < Math.min(lines.length, loc.start.line + 2); i++) {
            const marker = (i === loc.start.line - 1) ? ' >>> ' : '     ';
            console.log(`${marker}${i+1}: ${lines[i]}`);
          }
        }
      }
    } catch (e) {
      console.log(`EXCEPTION: ${e.message}`);
    }
  }
}

test();
