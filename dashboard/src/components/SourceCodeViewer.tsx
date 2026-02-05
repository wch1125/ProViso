/**
 * Source Code Viewer Component
 *
 * Displays ProViso source code with syntax highlighting.
 * Shows the underlying code for covenants, baskets, definitions, etc.
 */

import { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { Modal } from './base/Modal';
import { PROVISO_KEYWORDS, PROVISO_OPERATORS } from '../utils/codeGenerators';

// =============================================================================
// SYNTAX HIGHLIGHTING
// =============================================================================

interface HighlightedCodeProps {
  code: string;
  showLineNumbers?: boolean;
}

export function HighlightedCode({ code, showLineNumbers = true }: HighlightedCodeProps) {
  const lines = code.split('\n');

  return (
    <pre className="font-mono text-sm overflow-x-auto">
      <code>
        {lines.map((line, i) => (
          <div key={i} className="flex">
            {showLineNumbers && (
              <span className="text-gray-600 select-none w-8 flex-shrink-0 text-right pr-3">
                {i + 1}
              </span>
            )}
            <span className="flex-1">
              <HighlightedLine text={line} />
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
}

function HighlightedLine({ text }: { text: string }) {
  // Tokenize the line
  const tokens = tokenize(text);

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={getTokenClass(token.type)}>
          {token.value}
        </span>
      ))}
    </>
  );
}

interface Token {
  type: 'keyword' | 'number' | 'currency' | 'string' | 'operator' | 'comment' | 'identifier' | 'whitespace' | 'punctuation';
  value: string;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Whitespace
    const wsMatch = remaining.match(/^(\s+)/);
    if (wsMatch) {
      tokens.push({ type: 'whitespace', value: wsMatch[1] });
      remaining = remaining.slice(wsMatch[1].length);
      continue;
    }

    // Comment
    if (remaining.startsWith('//')) {
      tokens.push({ type: 'comment', value: remaining });
      break;
    }

    // String
    const strMatch = remaining.match(/^"([^"]*)"/);
    if (strMatch) {
      tokens.push({ type: 'string', value: strMatch[0] });
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Currency (e.g., $10_000_000)
    const currMatch = remaining.match(/^\$[\d_]+/);
    if (currMatch) {
      tokens.push({ type: 'currency', value: currMatch[0] });
      remaining = remaining.slice(currMatch[0].length);
      continue;
    }

    // Percentage/basis points
    const pctMatch = remaining.match(/^[\d.]+(%|bps)/);
    if (pctMatch) {
      tokens.push({ type: 'number', value: pctMatch[0] });
      remaining = remaining.slice(pctMatch[0].length);
      continue;
    }

    // Number (including decimals and ratios like 4.50)
    const numMatch = remaining.match(/^[\d_.]+/);
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Operator
    const opMatch = PROVISO_OPERATORS.find(op => remaining.startsWith(op));
    if (opMatch) {
      tokens.push({ type: 'operator', value: opMatch });
      remaining = remaining.slice(opMatch.length);
      continue;
    }

    // Identifier or keyword
    const idMatch = remaining.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (idMatch) {
      const value = idMatch[0];
      const isKeyword = PROVISO_KEYWORDS.includes(value) || PROVISO_KEYWORDS.includes(value.toUpperCase());
      tokens.push({
        type: isKeyword ? 'keyword' : 'identifier',
        value,
      });
      remaining = remaining.slice(value.length);
      continue;
    }

    // Punctuation
    const punctMatch = remaining.match(/^[(){}[\],;:]/);
    if (punctMatch) {
      tokens.push({ type: 'punctuation', value: punctMatch[0] });
      remaining = remaining.slice(1);
      continue;
    }

    // Fallback: single character
    tokens.push({ type: 'identifier', value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

function getTokenClass(type: Token['type']): string {
  switch (type) {
    case 'keyword':
      return 'text-purple-400 font-semibold';
    case 'number':
    case 'currency':
      return 'text-amber-400';
    case 'string':
      return 'text-emerald-400';
    case 'operator':
      return 'text-cyan-400';
    case 'comment':
      return 'text-gray-500 italic';
    case 'identifier':
      return 'text-blue-300';
    case 'punctuation':
      return 'text-gray-400';
    default:
      return 'text-gray-200';
  }
}

// =============================================================================
// SOURCE CODE VIEWER MODAL
// =============================================================================

export type ElementType = 'covenant' | 'basket' | 'definition' | 'condition' | 'phase' | 'milestone' | 'reserve' | 'waterfall' | 'cp';

interface SourceCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  elementType: ElementType;
  elementName: string;
  code: string;
}

const elementTypeLabels: Record<ElementType, string> = {
  covenant: 'Covenant',
  basket: 'Basket',
  definition: 'Definition',
  condition: 'Condition',
  phase: 'Phase',
  milestone: 'Milestone',
  reserve: 'Reserve',
  waterfall: 'Waterfall',
  cp: 'Conditions Precedent',
};

export function SourceCodeViewer({
  isOpen,
  onClose,
  elementType,
  elementName,
  code,
}: SourceCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Code className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {elementName}
              </h3>
              <p className="text-sm text-gray-400">
                {elementTypeLabels[elementType]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Code Block */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/50">
            <span className="text-xs text-gray-400 font-mono">.proviso</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
            <HighlightedCode code={code} />
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-3 text-xs text-gray-500 text-center">
          This is the ProViso code that defines this {elementTypeLabels[elementType].toLowerCase()}.
        </p>
      </div>
    </Modal>
  );
}

// =============================================================================
// CODE VIEW BUTTON
// =============================================================================

interface CodeViewButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function CodeViewButton({ onClick, className = '', size = 'sm' }: CodeViewButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'w-4 h-4'
    : 'w-5 h-5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`p-1 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors ${className}`}
      title="View ProViso code"
    >
      <Code className={sizeClasses} />
    </button>
  );
}

// =============================================================================
// INLINE CODE PREVIEW
// =============================================================================

interface InlineCodePreviewProps {
  code: string;
  maxLines?: number;
  className?: string;
}

export function InlineCodePreview({ code, maxLines = 3, className = '' }: InlineCodePreviewProps) {
  const lines = code.split('\n');
  const displayLines = lines.slice(0, maxLines);
  const hasMore = lines.length > maxLines;

  return (
    <div className={`bg-slate-900/50 rounded border border-slate-700/50 p-2 ${className}`}>
      <pre className="font-mono text-xs overflow-x-auto">
        <code>
          {displayLines.map((line, i) => (
            <div key={i}>
              <HighlightedLine text={line} />
            </div>
          ))}
          {hasMore && (
            <div className="text-gray-500">
              ... {lines.length - maxLines} more lines
            </div>
          )}
        </code>
      </pre>
    </div>
  );
}
