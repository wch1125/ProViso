/**
 * Browser-compatible Word Document Generator
 *
 * Generates Word-style prose from ProViso code for display in the dashboard.
 * This is a simplified version that doesn't require Node.js-only modules.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface DocumentMetadata {
  dealName: string;
  facilityAmount?: number;
  closingDate?: string;
  version?: string;
}

export interface GeneratedDocument {
  metadata: DocumentMetadata;
  fullText: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  articleNumber: number;
  articleTitle: string;
  sectionRef: string;
  title: string;
  content: string;
}

// =============================================================================
// PARSING HELPERS (Simplified regex-based parsing for browser)
// =============================================================================

interface ParsedElement {
  type: 'covenant' | 'basket' | 'definition' | 'condition' | 'phase' | 'milestone' | 'reserve' | 'waterfall';
  name: string;
  raw: string;
}

function parseProVisoCode(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // Match COVENANT statements
  const covenantRegex = /COVENANT\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  let match;
  while ((match = covenantRegex.exec(code)) !== null) {
    elements.push({
      type: 'covenant',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match BASKET statements
  const basketRegex = /BASKET\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = basketRegex.exec(code)) !== null) {
    elements.push({
      type: 'basket',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match DEFINE statements
  const defineRegex = /DEFINE\s+(\w+)\s*=[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = defineRegex.exec(code)) !== null) {
    elements.push({
      type: 'definition',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match CONDITION statements
  const conditionRegex = /CONDITION\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = conditionRegex.exec(code)) !== null) {
    elements.push({
      type: 'condition',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match PHASE statements
  const phaseRegex = /PHASE\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = phaseRegex.exec(code)) !== null) {
    elements.push({
      type: 'phase',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match MILESTONE statements
  const milestoneRegex = /MILESTONE\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = milestoneRegex.exec(code)) !== null) {
    elements.push({
      type: 'milestone',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match RESERVE statements
  const reserveRegex = /RESERVE\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = reserveRegex.exec(code)) !== null) {
    elements.push({
      type: 'reserve',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  // Match WATERFALL statements
  const waterfallRegex = /WATERFALL\s+(\w+)[\s\S]*?(?=(?:COVENANT|BASKET|DEFINE|CONDITION|PHASE|MILESTONE|RESERVE|WATERFALL)\s|\s*$)/gi;
  while ((match = waterfallRegex.exec(code)) !== null) {
    elements.push({
      type: 'waterfall',
      name: match[1] || '',
      raw: match[0].trim(),
    });
  }

  return elements;
}

// =============================================================================
// PROSE GENERATION
// =============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)} billion`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)} million`;
  }
  return `$${value.toLocaleString('en-US')}`;
}

function covenantToProse(name: string, raw: string): string {
  // Extract key parts from raw covenant
  const requiresMatch = raw.match(/REQUIRES\s+(.+?)\s*(<=|>=|<|>)\s*([\d.]+)/i);
  const testedMatch = raw.match(/TESTED\s+(\w+)/i);
  const cureMatch = raw.match(/CURE\s+(\w+)/i);

  let prose = `Section 7.11 ${name}. `;
  prose += `The Borrower shall not permit the `;

  if (requiresMatch) {
    const metric = requiresMatch[1]?.trim() || '';
    const operator = requiresMatch[2] || '';
    const threshold = requiresMatch[3] || '';

    const metricDisplay = getMetricDisplay(metric);
    const operatorDisplay = operator === '<=' || operator === '<' ? 'exceed' : 'be less than';

    prose += `${metricDisplay} `;
    prose += `as of the last day of any ${testedMatch ? testedMatch[1]?.toLowerCase() : 'fiscal quarter'} `;
    prose += `to ${operatorDisplay} ${threshold} to 1.00`;
  } else {
    prose += `covenant test `;
  }

  if (cureMatch) {
    prose += `; provided that the Borrower may exercise a ${cureMatch[1]} `;
    prose += `with respect to any failure to comply with this Section in accordance with Section 8.05`;
  }

  prose += '.';

  return prose;
}

function basketToProse(name: string, raw: string): string {
  const capacityMatch = raw.match(/CAPACITY\s+\$?([\d_,]+)/i);
  const greaterOfMatch = raw.match(/GREATER_OF\s*\(/i);
  const buildsFromMatch = raw.match(/BUILDS_FROM\s+(\w+)/i);

  let prose = `Section 7.02 ${name}; `;
  prose += `investments made pursuant to this clause `;

  if (greaterOfMatch) {
    // Grower basket
    const baseMatch = raw.match(/GREATER_OF\s*\(\s*\$?([\d_,]+)/i);
    const pctMatch = raw.match(/(\d+)%\s+OF\s+(\w+)/i);
    const floorMatch = raw.match(/FLOOR\s+\$?([\d_,]+)/i);

    prose += `not to exceed the greater of (x) ${formatCurrency(parseAmount(baseMatch?.[1]))} `;
    if (pctMatch) {
      prose += `and (y) ${pctMatch[1]}% of ${getMetricDisplay(pctMatch[2] || '')}`;
    }
    if (floorMatch) {
      prose += ` (but in no event less than ${formatCurrency(parseAmount(floorMatch[1]))})`;
    }
  } else if (buildsFromMatch) {
    // Builder basket
    const startingMatch = raw.match(/STARTING\s+\$?([\d_,]+)/i);
    const maxMatch = raw.match(/MAXIMUM\s+\$?([\d_,]+)/i);

    prose += `not to exceed an amount equal to `;
    if (startingMatch) {
      prose += `${formatCurrency(parseAmount(startingMatch[1]))} plus `;
    }
    prose += `the cumulative amount of ${buildsFromMatch[1].replace(/([A-Z])/g, ' $1').trim()} `;
    prose += `received by the Borrower since the Closing Date`;
    if (maxMatch) {
      prose += ` (but not to exceed ${formatCurrency(parseAmount(maxMatch[1]))} in the aggregate)`;
    }
  } else if (capacityMatch) {
    // Fixed basket
    prose += `not to exceed ${formatCurrency(parseAmount(capacityMatch[1]))}`;
  }

  prose += ' in the aggregate outstanding at any time.';

  return prose;
}

function definitionToProse(name: string, raw: string): string {
  const exprMatch = raw.match(/DEFINE\s+\w+\s*=\s*(.+)/i);

  let prose = `"${name}" means `;
  if (exprMatch) {
    prose += exprMatch[1]?.trim().replace(/\n/g, ' ') || '';
  }
  prose += '.';

  return prose;
}

function phaseToProse(name: string, raw: string): string {
  const fromMatch = raw.match(/FROM\s+(.+?)(?:\s+UNTIL|\s+COVENANTS|\s*$)/i);
  const untilMatch = raw.match(/UNTIL\s+(.+?)(?:\s+FROM|\s+COVENANTS|\s*$)/i);
  const suspendedMatch = raw.match(/SUSPENDED\s*\(([^)]+)\)/i);
  const activeMatch = raw.match(/ACTIVE\s*\(([^)]+)\)/i);

  let prose = `The "${name}" shall commence `;

  if (fromMatch) {
    prose += `on ${fromMatch[1]?.trim()} `;
  } else {
    prose += `on the Closing Date `;
  }

  if (untilMatch) {
    prose += `and continue until ${untilMatch[1]?.trim()}`;
  }

  prose += '. ';

  if (suspendedMatch) {
    prose += `During the ${name}, the following covenants shall be suspended: ${suspendedMatch[1]?.trim()}. `;
  }

  if (activeMatch) {
    prose += `During the ${name}, the following covenants shall apply: ${activeMatch[1]?.trim()}. `;
  }

  return prose.trim();
}

function milestoneToProse(name: string, raw: string): string {
  const targetMatch = raw.match(/TARGET\s+(.+?)(?:\s+LONGSTOP|\s+TRIGGERS|\s+REQUIRES|\s*$)/i);
  const longstopMatch = raw.match(/LONGSTOP\s+(.+?)(?:\s+TARGET|\s+TRIGGERS|\s+REQUIRES|\s*$)/i);
  const triggersMatch = raw.match(/TRIGGERS\s+(.+?)(?:\s+TARGET|\s+LONGSTOP|\s+REQUIRES|\s*$)/i);

  let prose = `${name}. The Borrower shall achieve ${name} `;

  if (targetMatch) {
    prose += `on or before ${targetMatch[1]?.trim()} (the "Target Date")`;
  }

  if (longstopMatch) {
    prose += `, with a longstop date of ${longstopMatch[1]?.trim()}`;
  }

  prose += '. ';

  if (triggersMatch) {
    prose += `Upon achievement of ${name}, the following shall be triggered: ${triggersMatch[1]?.trim()}. `;
  }

  return prose.trim();
}

function reserveToProse(name: string, raw: string): string {
  const targetMatch = raw.match(/TARGET\s+\$?([\d_,]+)/i);
  const minimumMatch = raw.match(/MINIMUM\s+\$?([\d_,]+)/i);
  const fundedByMatch = raw.match(/FUNDED_BY\s+(.+?)(?:\s+RELEASED|\s+TARGET|\s+MINIMUM|\s*$)/i);
  const releasedMatch = raw.match(/RELEASED_(?:TO|FOR)\s+(.+?)(?:\s+FUNDED|\s+TARGET|\s+MINIMUM|\s*$)/i);

  let prose = `${name}. The Borrower shall maintain a ${name} in an amount `;

  if (targetMatch) {
    prose += `equal to ${formatCurrency(parseAmount(targetMatch[1]))}`;
  }

  if (minimumMatch) {
    prose += ` (with a minimum balance of ${formatCurrency(parseAmount(minimumMatch[1]))})`;
  }

  prose += '. ';

  if (fundedByMatch) {
    prose += `The ${name} shall be funded by ${fundedByMatch[1]?.trim()}. `;
  }

  if (releasedMatch) {
    prose += `Amounts in the ${name} may be released for ${releasedMatch[1]?.trim()}. `;
  }

  return prose.trim();
}

function waterfallToProse(name: string, raw: string): string {
  const frequencyMatch = raw.match(/FREQUENCY\s+(\w+)/i);
  const tierMatches = raw.match(/TIER\s+\d+[\s\S]*?(?=TIER\s+\d+|$)/gi);

  let prose = `${name}. On each ${frequencyMatch ? frequencyMatch[1]?.toLowerCase() : 'quarterly'} Payment Date, `;
  prose += `Available Cash shall be applied in the following order of priority:\n\n`;

  if (tierMatches) {
    tierMatches.forEach((tier, i) => {
      const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
      const payMatch = tier.match(/PAY\s+(.+?)(?:\s+FROM|\s+UNTIL|\s+IF|\s*$)/i);
      prose += `(${romanNumerals[i]}) pay ${payMatch ? payMatch[1]?.trim() : 'as specified'};\n`;
    });
  }

  return prose.trim();
}

// Helper functions
function getMetricDisplay(metric: string): string {
  const map: Record<string, string> = {
    Leverage: 'Leverage Ratio (Total Debt to Consolidated EBITDA)',
    InterestCoverage: 'Interest Coverage Ratio (Consolidated EBITDA to Interest Expense)',
    DSCR: 'Debt Service Coverage Ratio',
    FixedChargeCoverage: 'Fixed Charge Coverage Ratio',
    MinEBITDA: 'Consolidated EBITDA',
    MaxCapEx: 'Capital Expenditures',
    MinLiquidity: 'Liquidity',
    EBITDA: 'Consolidated EBITDA',
    TotalDebt: 'Total Debt',
    TotalAssets: 'Total Assets',
  };
  return map[metric] || metric;
}

function parseAmount(str?: string): number {
  if (!str) return 0;
  return parseInt(str.replace(/[_,]/g, ''), 10) || 0;
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export function generateWordDocument(
  code: string,
  metadata: DocumentMetadata
): GeneratedDocument {
  const elements = parseProVisoCode(code);
  const sections: DocumentSection[] = [];

  // Group elements by type
  const definitions = elements.filter(e => e.type === 'definition');
  const covenants = elements.filter(e => e.type === 'covenant');
  const baskets = elements.filter(e => e.type === 'basket');
  const phases = elements.filter(e => e.type === 'phase');
  const milestones = elements.filter(e => e.type === 'milestone');
  const reserves = elements.filter(e => e.type === 'reserve');
  const waterfalls = elements.filter(e => e.type === 'waterfall');

  // Article 1: Definitions
  definitions.forEach((el, i) => {
    sections.push({
      articleNumber: 1,
      articleTitle: 'Definitions',
      sectionRef: `1.01${i > 0 ? String.fromCharCode(97 + i) : ''}`,
      title: el.name,
      content: definitionToProse(el.name, el.raw),
    });
  });

  // Article 5: Phases (if any)
  phases.forEach((el, i) => {
    sections.push({
      articleNumber: 5,
      articleTitle: 'Project Phases',
      sectionRef: `5.01(${String.fromCharCode(97 + i)})`,
      title: el.name,
      content: phaseToProse(el.name, el.raw),
    });
  });

  // Article 6: Milestones (if any)
  milestones.forEach((el, i) => {
    sections.push({
      articleNumber: 6,
      articleTitle: 'Construction Milestones',
      sectionRef: `6.01(${String.fromCharCode(97 + i)})`,
      title: el.name,
      content: milestoneToProse(el.name, el.raw),
    });
  });

  // Article 7: Covenants
  covenants.forEach((el, i) => {
    sections.push({
      articleNumber: 7,
      articleTitle: 'Covenants',
      sectionRef: `7.11(${String.fromCharCode(97 + i)})`,
      title: el.name,
      content: covenantToProse(el.name, el.raw),
    });
  });

  // Article 7: Baskets
  baskets.forEach((el, i) => {
    sections.push({
      articleNumber: 7,
      articleTitle: 'Covenants',
      sectionRef: `7.02(${String.fromCharCode(97 + i)})`,
      title: el.name,
      content: basketToProse(el.name, el.raw),
    });
  });

  // Article 9: Reserves
  reserves.forEach((el, i) => {
    sections.push({
      articleNumber: 9,
      articleTitle: 'Reserve Accounts',
      sectionRef: `9.01(${String.fromCharCode(97 + i)})`,
      title: el.name,
      content: reserveToProse(el.name, el.raw),
    });
  });

  // Article 10: Waterfalls
  waterfalls.forEach((el, i) => {
    sections.push({
      articleNumber: 10,
      articleTitle: 'Cash Waterfalls',
      sectionRef: `10.01${i > 0 ? `(${String.fromCharCode(97 + i)})` : ''}`,
      title: el.name,
      content: waterfallToProse(el.name, el.raw),
    });
  });

  // Build full text
  const fullText = buildFullText(sections, metadata);

  return {
    metadata,
    fullText,
    sections,
  };
}

function buildFullText(sections: DocumentSection[], metadata: DocumentMetadata): string {
  const lines: string[] = [];

  // Header
  lines.push('═'.repeat(80));
  lines.push('                          CREDIT AGREEMENT');
  lines.push(`                            ${metadata.dealName}`);
  if (metadata.facilityAmount) {
    lines.push(`                     ${formatCurrency(metadata.facilityAmount)}`);
  }
  lines.push('═'.repeat(80));
  lines.push('');

  // Group sections by article
  const byArticle = new Map<number, DocumentSection[]>();
  for (const section of sections) {
    const existing = byArticle.get(section.articleNumber) || [];
    existing.push(section);
    byArticle.set(section.articleNumber, existing);
  }

  // Render each article
  const sortedArticles = Array.from(byArticle.entries()).sort((a, b) => a[0] - b[0]);
  for (const [articleNum, articleSections] of sortedArticles) {
    const firstSection = articleSections[0];
    if (!firstSection) continue;

    lines.push(`ARTICLE ${articleNum}`);
    lines.push(firstSection.articleTitle.toUpperCase());
    lines.push('─'.repeat(40));
    lines.push('');

    for (const section of articleSections) {
      lines.push(`${section.sectionRef} ${section.content}`);
      lines.push('');
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Copy document text to clipboard with formatting
 */
export async function copyDocumentToClipboard(doc: GeneratedDocument): Promise<void> {
  await navigator.clipboard.writeText(doc.fullText);
}

/**
 * Download document as a text file
 */
export function downloadDocument(doc: GeneratedDocument, filename: string = 'credit-agreement.txt'): void {
  const blob = new Blob([doc.fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
