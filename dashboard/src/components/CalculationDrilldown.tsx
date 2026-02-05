/**
 * Calculation Drilldown Component
 *
 * Shows how a value is calculated step-by-step.
 * Users can click on any computed value to see its derivation tree.
 */

import { useState } from 'react';
import { X, ChevronRight, ChevronDown, Calculator, Database, Code, Hash } from 'lucide-react';
import { Modal } from './base/Modal';
import { CodeViewButton, SourceCodeViewer } from './SourceCodeViewer';
import { generateDefinitionCode } from '../utils/codeGenerators';

// =============================================================================
// TYPES
// =============================================================================

export interface CalculationNode {
  name: string;
  value: number;
  formula?: string;
  children?: CalculationNode[];
  source: 'definition' | 'financial_data' | 'literal' | 'computed';
  rawDataKey?: string;
  valueType?: 'currency' | 'ratio' | 'percentage' | 'number';
}

// =============================================================================
// VALUE FORMATTING
// =============================================================================

function formatValue(value: number, type?: CalculationNode['valueType']): string {
  switch (type) {
    case 'currency':
      if (Math.abs(value) >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
      }
      if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    case 'ratio':
      return `${value.toFixed(2)}x`;
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    default:
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toFixed(2);
  }
}

// =============================================================================
// CALCULATION TREE NODE
// =============================================================================

interface TreeNodeProps {
  node: CalculationNode;
  depth: number;
  onShowCode?: (name: string, code: string) => void;
}

function TreeNode({ node, depth, onShowCode }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  // Source icon and color
  const sourceConfig: Record<string, { icon: typeof Calculator; color: string; label: string }> = {
    definition: { icon: Calculator, color: 'text-purple-400', label: 'Calculated' },
    financial_data: { icon: Database, color: 'text-emerald-400', label: 'Financial Data' },
    literal: { icon: Hash, color: 'text-amber-400', label: 'Constant' },
    computed: { icon: Calculator, color: 'text-blue-400', label: 'Computed' },
  };

  const config = sourceConfig[node.source] ?? sourceConfig.computed;
  const Icon = config.icon;

  return (
    <div className="font-mono text-sm">
      <div
        className={`flex items-start gap-2 py-1.5 px-2 rounded hover:bg-slate-800/50 ${
          hasChildren ? 'cursor-pointer' : ''
        }`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand/collapse icon */}
        <div className="w-4 flex-shrink-0">
          {hasChildren && (
            expanded
              ? <ChevronDown className="w-4 h-4 text-gray-500" />
              : <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>

        {/* Source type icon */}
        <Icon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />

        {/* Name and value */}
        <div className="flex-1 min-w-0">
          <span className="text-gray-200">{node.name}</span>
          {node.formula && (
            <span className="text-gray-500 ml-2">= {node.formula}</span>
          )}
        </div>

        {/* Value */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`font-semibold ${config.color}`}>
            {formatValue(node.value, node.valueType)}
          </span>
          {node.source === 'financial_data' && node.rawDataKey && (
            <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-slate-800 rounded">
              data
            </span>
          )}
          {node.source === 'definition' && onShowCode && (
            <CodeViewButton
              onClick={() => {
                const code = generateDefinitionCode({
                  name: node.name,
                  expression: node.formula ?? node.name,
                });
                onShowCode(node.name, code);
              }}
            />
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-6 border-l border-slate-700 pl-2">
          {node.children!.map((child, i) => (
            <TreeNode
              key={`${child.name}-${i}`}
              node={child}
              depth={depth + 1}
              onShowCode={onShowCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CALCULATION DRILLDOWN MODAL
// =============================================================================

interface CalculationDrilldownProps {
  isOpen: boolean;
  onClose: () => void;
  rootNode: CalculationNode;
  title?: string;
}

export function CalculationDrilldown({
  isOpen,
  onClose,
  rootNode,
  title,
}: CalculationDrilldownProps) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeModalData, setCodeModalData] = useState({ name: '', code: '' });

  const handleShowCode = (name: string, code: string) => {
    setCodeModalData({ name, code });
    setShowCodeModal(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calculator className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {title ?? 'Calculation Details'}
                </h3>
                <p className="text-sm text-gray-400">
                  {rootNode.name}: {formatValue(rootNode.value, rootNode.valueType)}
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

          {/* Formula display */}
          {rootNode.formula && (
            <div className="mb-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Formula</div>
              <div className="font-mono text-white">
                {rootNode.name} = {rootNode.formula}
              </div>
              <div className="font-mono text-gray-400 mt-1">
                = {formatValue(rootNode.value, rootNode.valueType)}
              </div>
            </div>
          )}

          {/* Calculation tree */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 max-h-96 overflow-y-auto">
            <div className="text-xs text-gray-500 mb-2">Breakdown</div>
            <TreeNode node={rootNode} depth={0} onShowCode={handleShowCode} />
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-gray-400">Definition</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-gray-400">Financial Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-gray-400">Constant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-400">View Code</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Code viewer modal */}
      <SourceCodeViewer
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        elementType="definition"
        elementName={codeModalData.name}
        code={codeModalData.code}
      />
    </>
  );
}

// =============================================================================
// CLICKABLE VALUE COMPONENT
// =============================================================================

interface ClickableValueProps {
  value: number;
  valueType?: CalculationNode['valueType'];
  calculationNode: CalculationNode | null;
  className?: string;
  children?: React.ReactNode;
}

export function ClickableValue({
  value,
  valueType,
  calculationNode,
  className = '',
  children,
}: ClickableValueProps) {
  const [showDrilldown, setShowDrilldown] = useState(false);

  if (!calculationNode) {
    return (
      <span className={className}>
        {children ?? formatValue(value, valueType)}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowDrilldown(true)}
        className={`cursor-pointer hover:underline hover:text-blue-400 transition-colors ${className}`}
        title="Click to see calculation"
      >
        {children ?? formatValue(value, valueType)}
      </button>
      <CalculationDrilldown
        isOpen={showDrilldown}
        onClose={() => setShowDrilldown(false)}
        rootNode={calculationNode}
        title={`How ${calculationNode.name} is calculated`}
      />
    </>
  );
}

// =============================================================================
// SIMPLE VALUE WITH DRILLDOWN ICON
// =============================================================================

interface ValueWithDrilldownProps {
  label: string;
  value: number;
  valueType?: CalculationNode['valueType'];
  calculationNode: CalculationNode | null;
  className?: string;
}

export function ValueWithDrilldown({
  label,
  value,
  valueType,
  calculationNode,
  className = '',
}: ValueWithDrilldownProps) {
  const [showDrilldown, setShowDrilldown] = useState(false);

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <span>{label}:</span>
        <span className="font-semibold">{formatValue(value, valueType)}</span>
        {calculationNode && (
          <button
            onClick={() => setShowDrilldown(true)}
            className="p-0.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
            title="See calculation breakdown"
          >
            <Calculator className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {calculationNode && (
        <CalculationDrilldown
          isOpen={showDrilldown}
          onClose={() => setShowDrilldown(false)}
          rootNode={calculationNode}
          title={`How ${label} is calculated`}
        />
      )}
    </>
  );
}
