/**
 * Terminal Output Component
 *
 * Formatted, colored output for terminal commands.
 */

import type { TerminalEntry } from '../../context/DemoContext';

interface TerminalOutputProps {
  entries: TerminalEntry[];
}

export function TerminalOutput({ entries }: TerminalOutputProps) {
  if (entries.length === 0) {
    return (
      <div className="text-text-muted text-sm italic">
        Type a command or click a suggestion below...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <TerminalEntryDisplay key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function TerminalEntryDisplay({ entry }: { entry: TerminalEntry }) {
  switch (entry.type) {
    case 'command':
      return (
        <div className="flex items-start gap-2">
          <span className="text-gold-400 font-mono select-none">$</span>
          <span className="text-text-primary font-mono">{entry.content}</span>
        </div>
      );

    case 'output':
      return (
        <div className="pl-4 font-mono text-sm whitespace-pre-wrap">
          <OutputHighlighter content={entry.content} />
        </div>
      );

    case 'error':
      return (
        <div className="pl-4 font-mono text-sm text-danger whitespace-pre-wrap">
          {entry.content}
        </div>
      );

    case 'info':
      return (
        <div className="pl-4 font-mono text-sm text-info whitespace-pre-wrap">
          {entry.content}
        </div>
      );

    default:
      return null;
  }
}

/**
 * Highlight special patterns in output
 */
function OutputHighlighter({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, i) => (
        <div key={i}>
          <HighlightedLine line={line} />
        </div>
      ))}
    </>
  );
}

function HighlightedLine({ line }: { line: string }) {
  // Highlight patterns
  const patterns: Array<{ regex: RegExp; className: string }> = [
    // Pass/Fail indicators
    { regex: /\[PASS\]/g, className: 'text-success font-semibold' },
    { regex: /\[FAIL\]/g, className: 'text-danger font-semibold' },

    // Section headers (lines of = or -)
    { regex: /^[=-]{20,}$/g, className: 'text-text-muted' },

    // Section titles (all caps followed by newline)
    { regex: /^(COVENANTS|BASKETS|COVENANT COMPLIANCE CHECK|BASKET UTILIZATION|PRO FORMA SIMULATION|BASKET QUERY|PROVISO STATUS REPORT|PRO FORMA IMPACT|PROVISO DEMO COMMANDS)$/g, className: 'text-gold-400 font-semibold' },

    // Currency values
    { regex: /\$[\d,.]+[KMB]?/g, className: 'text-info' },

    // Ratios
    { regex: /[\d.]+x/g, className: 'text-info' },

    // Percentages
    { regex: /[\d.]+%/g, className: 'text-info' },

    // Status keywords
    { regex: /\b(PASSING|PERMITTED|Result:)/g, className: 'text-success' },
    { regex: /\b(BREACH|NOT PERMITTED|FAIL|WARNING:)/g, className: 'text-danger' },
    { regex: /\b(Shortfall|Would breach)/g, className: 'text-danger' },
    { regex: /\b(Headroom|Would cure|NOTE:)/g, className: 'text-success' },

    // Labels
    { regex: /\b(Actual|Required|Capacity|Used|Available|Current|Pro Forma|Requested Amount|Available Capacity):/g, className: 'text-text-tertiary' },

    // Command names in help
    { regex: /^\s{2}(status|check|baskets|simulate|query|help|clear)\s/g, className: 'text-gold-400 font-mono' },
  ];

  // Build highlighted line
  const segments: Array<{ start: number; end: number; className: string }> = [];

  for (const { regex, className } of patterns) {
    regex.lastIndex = 0; // Reset regex state
    let match;
    while ((match = regex.exec(line)) !== null) {
      segments.push({
        start: match.index,
        end: match.index + match[0].length,
        className,
      });
    }
  }

  // If no segments, return plain text
  if (segments.length === 0) {
    return <span className="text-text-secondary">{line}</span>;
  }

  // Sort segments by start position
  segments.sort((a, b) => a.start - b.start);

  // Build JSX with highlighted segments
  const elements: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const segment of segments) {
    // Add text before this segment
    if (segment.start > lastEnd) {
      elements.push(
        <span key={`text-${lastEnd}`} className="text-text-secondary">
          {line.slice(lastEnd, segment.start)}
        </span>
      );
    }

    // Skip if overlapping with previous segment
    if (segment.start < lastEnd) continue;

    // Add highlighted segment
    elements.push(
      <span key={`hl-${segment.start}`} className={segment.className}>
        {line.slice(segment.start, segment.end)}
      </span>
    );

    lastEnd = segment.end;
  }

  // Add remaining text
  if (lastEnd < line.length) {
    elements.push(
      <span key={`text-${lastEnd}`} className="text-text-secondary">
        {line.slice(lastEnd)}
      </span>
    );
  }

  return <>{elements}</>;
}

export default TerminalOutput;
