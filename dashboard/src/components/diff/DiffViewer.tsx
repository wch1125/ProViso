/**
 * DiffViewer - Side-by-side code diff visualization
 *
 * Displays changes between two versions of ProViso code with:
 * - Line-by-line comparison
 * - Syntax highlighting for ProViso keywords
 * - Change navigation (jump to next/prev)
 * - Collapsible unchanged sections
 */

import { useState, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minimize2,
  Maximize2,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface DiffLine {
  lineNumber: number;
  content: string;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
}

export interface DiffViewerProps {
  /** Code from the "from" version */
  fromCode: string;
  /** Code from the "to" version */
  toCode: string;
  /** Label for the "from" version */
  fromLabel?: string;
  /** Label for the "to" version */
  toLabel?: string;
  /** Number of context lines to show around changes */
  contextLines?: number;
  /** Whether to collapse unchanged sections */
  collapseUnchanged?: boolean;
  /** Maximum height (CSS value) */
  maxHeight?: string;
}

interface DiffSection {
  type: 'changed' | 'unchanged';
  fromLines: DiffLine[];
  toLines: DiffLine[];
  collapsed?: boolean;
}

// =============================================================================
// DIFF COMPUTATION
// =============================================================================

/**
 * Compute line-by-line diff between two code strings.
 */
function computeDiff(fromCode: string, toCode: string): { fromLines: DiffLine[]; toLines: DiffLine[] } {
  const fromRaw = fromCode.split('\n');
  const toRaw = toCode.split('\n');

  const fromSet = new Set(fromRaw);
  const toSet = new Set(toRaw);

  const fromLines: DiffLine[] = fromRaw.map((content, i) => ({
    lineNumber: i + 1,
    content,
    type: toSet.has(content) ? 'unchanged' : 'removed',
  }));

  const toLines: DiffLine[] = toRaw.map((content, i) => ({
    lineNumber: i + 1,
    content,
    type: fromSet.has(content) ? 'unchanged' : 'added',
  }));

  return { fromLines, toLines };
}

/**
 * Group lines into sections for collapsible display.
 */
function groupIntoSections(
  fromLines: DiffLine[],
  toLines: DiffLine[],
  contextLines: number
): DiffSection[] {
  const sections: DiffSection[] = [];

  // Find change indices
  const fromChanges = new Set(
    fromLines.filter((l) => l.type !== 'unchanged').map((l) => l.lineNumber)
  );
  const toChanges = new Set(
    toLines.filter((l) => l.type !== 'unchanged').map((l) => l.lineNumber)
  );

  // Simple approach: split into changed and unchanged regions
  let currentSection: DiffSection | null = null;
  const maxLines = Math.max(fromLines.length, toLines.length);

  for (let i = 0; i < maxLines; i++) {
    const fromLine = fromLines[i];
    const toLine = toLines[i];
    const isChanged =
      (fromLine && fromLine.type !== 'unchanged') ||
      (toLine && toLine.type !== 'unchanged');

    // Check if we're in context range
    const nearChange = Array.from(fromChanges).some(
      (c) => Math.abs(c - i - 1) <= contextLines
    ) || Array.from(toChanges).some(
      (c) => Math.abs(c - i - 1) <= contextLines
    );

    const sectionType = isChanged || nearChange ? 'changed' : 'unchanged';

    if (!currentSection || currentSection.type !== sectionType) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: sectionType,
        fromLines: [],
        toLines: [],
        collapsed: sectionType === 'unchanged',
      };
    }

    if (fromLine) currentSection.fromLines.push(fromLine);
    if (toLine) currentSection.toLines.push(toLine);
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

// =============================================================================
// SYNTAX HIGHLIGHTING
// =============================================================================

const KEYWORDS = [
  'COVENANT',
  'BASKET',
  'DEFINE',
  'CONDITION',
  'PROHIBIT',
  'EVENT',
  'PHASE',
  'TRANSITION',
  'MILESTONE',
  'RESERVE',
  'WATERFALL',
  'CONDITIONS_PRECEDENT',
  'AMENDMENT',
  'REQUIRES',
  'TESTED',
  'CAPACITY',
  'FLOOR',
  'BUILDS_FROM',
  'STARTING',
  'MAXIMUM',
  'SUBJECT_TO',
  'CURE',
  'MAX_USES',
  'MAX_AMOUNT',
  'OVER',
  'UNTIL',
  'FROM',
  'THEN',
  'AS',
  'AND',
  'OR',
  'NOT',
  'GreaterOf',
  'LesserOf',
  'TRAILING',
  'QUARTERS',
  'MONTHS',
  'YEARS',
  'EXCLUDING',
  'CAP',
  'AT',
  'PER',
  'YEAR',
];

const OPERATORS = ['<=', '>=', '<', '>', '=', '!=', '+', '-', '*', '/', '%'];

/**
 * Highlight ProViso syntax in a line.
 */
function highlightLine(content: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  // Handle comments
  const commentMatch = remaining.match(/^(.*?)(\/\/.*)$/);
  if (commentMatch) {
    remaining = commentMatch[1];
    parts.push(
      <span key={key++} className="text-text-muted italic">
        {commentMatch[2]}
      </span>
    );
  }

  // Process keywords, numbers, operators
  const tokens = remaining.split(/(\s+)/);
  const processedTokens = tokens.map((token, i) => {
    // Whitespace
    if (/^\s+$/.test(token)) {
      return <span key={`ws-${i}`}>{token}</span>;
    }

    // Keywords
    if (KEYWORDS.includes(token.toUpperCase()) || KEYWORDS.includes(token)) {
      return (
        <span key={`kw-${i}`} className="text-gold-400 font-semibold">
          {token}
        </span>
      );
    }

    // Numbers and currency
    if (/^\$?[\d_,]+(\.\d+)?%?x?$/.test(token)) {
      return (
        <span key={`num-${i}`} className="text-info">
          {token}
        </span>
      );
    }

    // Strings
    if (/^".*"$/.test(token)) {
      return (
        <span key={`str-${i}`} className="text-warning">
          {token}
        </span>
      );
    }

    // Operators
    if (OPERATORS.includes(token)) {
      return (
        <span key={`op-${i}`} className="text-text-tertiary">
          {token}
        </span>
      );
    }

    // Identifiers (PascalCase usually)
    if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
      return (
        <span key={`id-${i}`} className="text-sky-400">
          {token}
        </span>
      );
    }

    return <span key={`txt-${i}`}>{token}</span>;
  });

  return (
    <>
      {processedTokens}
      {parts}
    </>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface LineProps {
  line: DiffLine | null;
  showLineNumbers?: boolean;
}

function Line({ line, showLineNumbers = true }: LineProps) {
  if (!line) {
    return (
      <div className="flex h-6 bg-surface-2/50">
        {showLineNumbers && (
          <span className="w-12 text-right pr-3 text-text-muted select-none text-xs leading-6">
            -
          </span>
        )}
        <span className="flex-1 px-2" />
      </div>
    );
  }

  const bgColors = {
    unchanged: '',
    added: 'bg-success/10',
    removed: 'bg-danger/10',
    modified: 'bg-warning/10',
  };

  const textColors = {
    unchanged: 'text-text-secondary',
    added: 'text-success',
    removed: 'text-danger',
    modified: 'text-warning',
  };

  const lineNumColors = {
    unchanged: 'text-text-muted',
    added: 'text-success/60',
    removed: 'text-danger/60',
    modified: 'text-warning/60',
  };

  const prefixes = {
    unchanged: ' ',
    added: '+',
    removed: '-',
    modified: '~',
  };

  return (
    <div className={`flex h-6 ${bgColors[line.type]}`}>
      {showLineNumbers && (
        <span
          className={`w-12 text-right pr-3 select-none text-xs leading-6 ${lineNumColors[line.type]}`}
        >
          {line.lineNumber}
        </span>
      )}
      <span
        className={`w-4 text-center select-none ${lineNumColors[line.type]}`}
      >
        {prefixes[line.type]}
      </span>
      <code
        className={`flex-1 px-2 text-sm leading-6 font-mono whitespace-pre ${textColors[line.type]}`}
      >
        {highlightLine(line.content)}
      </code>
    </div>
  );
}

interface CollapsedSectionProps {
  section: DiffSection;
  onExpand: () => void;
}

function CollapsedSection({ section, onExpand }: CollapsedSectionProps) {
  const lineCount = Math.max(section.fromLines.length, section.toLines.length);

  return (
    <button
      onClick={onExpand}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-surface-2/50 hover:bg-surface-2 text-text-muted hover:text-text-secondary text-sm transition-colors border-y border-border-DEFAULT/50"
    >
      <ChevronRight className="w-4 h-4" />
      <span>{lineCount} unchanged lines</span>
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DiffViewer({
  fromCode,
  toCode,
  fromLabel = 'Before',
  toLabel = 'After',
  contextLines = 3,
  collapseUnchanged = true,
  maxHeight = '600px',
}: DiffViewerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);

  // Compute diff
  const { fromLines, toLines } = useMemo(
    () => computeDiff(fromCode, toCode),
    [fromCode, toCode]
  );

  // Group into sections
  const sections = useMemo(
    () => groupIntoSections(fromLines, toLines, contextLines),
    [fromLines, toLines, contextLines]
  );

  // Initialize collapsed state
  useMemo(() => {
    if (collapseUnchanged) {
      const collapsed = new Set<number>();
      sections.forEach((s, i) => {
        if (s.type === 'unchanged' && s.fromLines.length > contextLines * 2) {
          collapsed.add(i);
        }
      });
      setCollapsedSections(collapsed);
    }
  }, [sections, collapseUnchanged, contextLines]);

  // Find change indices for navigation
  const changeIndices = useMemo(() => {
    const indices: number[] = [];
    sections.forEach((s, i) => {
      if (s.type === 'changed') {
        indices.push(i);
      }
    });
    return indices;
  }, [sections]);

  const toggleSection = useCallback((index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const goToNextChange = useCallback(() => {
    if (changeIndices.length > 0) {
      setCurrentChangeIndex((prev) => (prev + 1) % changeIndices.length);
      // Expand the section if collapsed
      const targetIdx = changeIndices[(currentChangeIndex + 1) % changeIndices.length];
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        next.delete(targetIdx);
        return next;
      });
    }
  }, [changeIndices, currentChangeIndex]);

  const goToPrevChange = useCallback(() => {
    if (changeIndices.length > 0) {
      setCurrentChangeIndex((prev) =>
        prev === 0 ? changeIndices.length - 1 : prev - 1
      );
      const targetIdx =
        changeIndices[
          currentChangeIndex === 0 ? changeIndices.length - 1 : currentChangeIndex - 1
        ];
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        next.delete(targetIdx);
        return next;
      });
    }
  }, [changeIndices, currentChangeIndex]);

  const expandAll = useCallback(() => {
    setCollapsedSections(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    const collapsed = new Set<number>();
    sections.forEach((s, i) => {
      if (s.type === 'unchanged') {
        collapsed.add(i);
      }
    });
    setCollapsedSections(collapsed);
  }, [sections]);

  // Stats
  const addedCount = toLines.filter((l) => l.type === 'added').length;
  const removedCount = fromLines.filter((l) => l.type === 'removed').length;

  return (
    <div className="rounded-lg border border-border-DEFAULT overflow-hidden bg-surface-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-3 border-b border-border-DEFAULT">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-tertiary">
            <span className="text-success">+{addedCount}</span>
            {' / '}
            <span className="text-danger">-{removedCount}</span>
            {' lines'}
          </span>
          {changeIndices.length > 0 && (
            <span className="text-sm text-text-muted">
              Change {currentChangeIndex + 1} of {changeIndices.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevChange}
            disabled={changeIndices.length === 0}
            className="p-1.5 rounded hover:bg-surface-3 disabled:opacity-50 disabled:cursor-not-allowed text-text-tertiary hover:text-text-primary transition-colors"
            title="Previous change"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextChange}
            disabled={changeIndices.length === 0}
            className="p-1.5 rounded hover:bg-surface-3 disabled:opacity-50 disabled:cursor-not-allowed text-text-tertiary hover:text-text-primary transition-colors"
            title="Next change"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border-DEFAULT mx-1" />
          <button
            onClick={expandAll}
            className="p-1.5 rounded hover:bg-surface-3 text-text-tertiary hover:text-text-primary transition-colors"
            title="Expand all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={collapseAll}
            className="p-1.5 rounded hover:bg-surface-3 text-text-tertiary hover:text-text-primary transition-colors"
            title="Collapse unchanged"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 border-b border-border-DEFAULT">
        <div className="px-4 py-2 bg-danger/5 border-r border-border-DEFAULT">
          <span className="text-sm font-medium text-danger">{fromLabel}</span>
        </div>
        <div className="px-4 py-2 bg-success/5">
          <span className="text-sm font-medium text-success">{toLabel}</span>
        </div>
      </div>

      {/* Diff Content */}
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <div className="grid grid-cols-2">
          {/* Left (From) Side */}
          <div className="border-r border-border-DEFAULT bg-surface-2">
            {sections.map((section, sectionIdx) => {
              if (collapsedSections.has(sectionIdx) && section.type === 'unchanged') {
                return (
                  <CollapsedSection
                    key={`from-collapsed-${sectionIdx}`}
                    section={section}
                    onExpand={() => toggleSection(sectionIdx)}
                  />
                );
              }
              return (
                <div key={`from-section-${sectionIdx}`}>
                  {section.fromLines.map((line, lineIdx) => (
                    <Line
                      key={`from-${sectionIdx}-${lineIdx}`}
                      line={line}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Right (To) Side */}
          <div className="bg-surface-2">
            {sections.map((section, sectionIdx) => {
              if (collapsedSections.has(sectionIdx) && section.type === 'unchanged') {
                return (
                  <CollapsedSection
                    key={`to-collapsed-${sectionIdx}`}
                    section={section}
                    onExpand={() => toggleSection(sectionIdx)}
                  />
                );
              }
              return (
                <div key={`to-section-${sectionIdx}`}>
                  {section.toLines.map((line, lineIdx) => (
                    <Line
                      key={`to-${sectionIdx}-${lineIdx}`}
                      line={line}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiffViewer;
