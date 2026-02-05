const { parse } = require('./dist/parser.js');
const fs = require('fs');

// Read the demo scenarios file
const content = fs.readFileSync('./dashboard/src/data/demo-scenarios.ts', 'utf8');

// Test all code variables
const codeVars = ['solarCode', 'windCode', 'corporateCode'];

codeVars.forEach(varName => {
  const regex = new RegExp(`const ${varName} = \`([\\s\\S]*?)\`;`);
  const match = content.match(regex);

  if (match) {
    const code = match[1];
    console.log(`\n=== Testing ${varName} (${code.length} chars) ===`);

    try {
      const result = parse(code);
      console.log('SUCCESS!');
    } catch (e) {
      console.log('PARSE ERROR:');
      console.log('Message:', e.message);
      if (e.location) {
        console.log('Line:', e.location.start.line, 'Column:', e.location.start.column);

        // Show the problematic line
        const lines = code.split('\n');
        const lineNum = e.location.start.line;
        console.log('\nContext around error:');
        for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 2); i++) {
          const marker = (i + 1 === lineNum) ? '>>> ' : '    ';
          console.log(marker + (i + 1) + ': ' + lines[i]);
        }
      }
    }
  } else {
    console.log(`Could not find ${varName}`);
  }
});
