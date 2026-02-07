/**
 * Amendment Overlay Diff
 *
 * Shows the impact of a proposed amendment on the credit agreement.
 * When a waiver is granted, lenders often require a compensating amendment
 * (e.g., tighter covenants, additional baskets, fees).
 *
 * This component:
 * - Shows the current agreement state (pre-amendment)
 * - Shows the proposed amendment syntax
 * - Generates a diff with impact classification
 * - Generates the ProViso amendment code
 *
 * Uses the real version diff engine to classify changes.
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileCode,
  ArrowRight,
  Copy,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { Modal } from '../base/Modal';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import { Input } from '../base/Input';
import { Select } from '../base/Select';
import { Tabs, TabList, TabTrigger, TabPanel } from '../base/Tabs';
import { DiffViewer } from '../diff';
import { computeChangeSummary } from '../../utils/versionDiff';
import { formatDisplayName, formatRatio, formatCurrency } from '../../utils/narratives';
import type { CovenantData } from '../../types';
import type { ChangeSummary, Change } from '../../data/negotiation-demo';

// =============================================================================
// TYPES
// =============================================================================

export type AmendmentDirectiveType = 'MODIFIES' | 'REPLACES' | 'ADDS' | 'DELETES';

export interface AmendmentDirective {
  id: string;
  type: AmendmentDirectiveType;
  targetType: 'COVENANT' | 'BASKET' | 'DEFINE';
  targetName: string;
  description: string;
  /** For MODIFIES: the field to change */
  modifyField?: 'REQUIRES' | 'CAPACITY' | 'FLOOR' | 'MAXIMUM' | 'TESTED';
  /** New value expression */
  newValue?: string;
  /** Full replacement code (for REPLACES/ADDS) */
  replacementCode?: string;
}

export interface AmendmentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** The current ProViso code (before amendment) */
  currentCode: string;
  /** Covenant that triggered the amendment (optional) */
  triggerCovenant?: CovenantData | null;
  /** Amendment number */
  amendmentNumber?: number;
  /** Callback with generated amendment code */
  onGenerate?: (amendmentCode: string) => void;
}

// =============================================================================
// AMENDMENT CODE GENERATOR
// =============================================================================

function generateAmendmentCode(
  amendmentNumber: number,
  description: string,
  directives: AmendmentDirective[],
): string {
  const today = new Date().toISOString().split('T')[0];
  const lines: string[] = [
    `AMENDMENT ${amendmentNumber}`,
    `  EFFECTIVE ${today}`,
    `  DESCRIPTION "${description}"`,
    '',
  ];

  for (const dir of directives) {
    switch (dir.type) {
      case 'MODIFIES':
        lines.push(`  MODIFIES ${dir.targetType} ${dir.targetName}`);
        if (dir.modifyField && dir.newValue) {
          lines.push(`    ${dir.modifyField} ${dir.newValue}`);
        }
        lines.push('');
        break;

      case 'REPLACES':
        lines.push(`  REPLACES ${dir.targetType} ${dir.targetName} WITH`);
        if (dir.replacementCode) {
          // Indent replacement code
          const codeLines = dir.replacementCode.split('\n');
          for (const cl of codeLines) {
            lines.push(`    ${cl}`);
          }
        }
        lines.push('');
        break;

      case 'ADDS':
        lines.push(`  ADDS`);
        if (dir.replacementCode) {
          const codeLines = dir.replacementCode.split('\n');
          for (const cl of codeLines) {
            lines.push(`    ${cl}`);
          }
        }
        lines.push('');
        break;

      case 'DELETES':
        lines.push(`  DELETES ${dir.targetType} ${dir.targetName}`);
        lines.push('');
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Apply directives to code to generate the "after" version for diffing.
 * This is a simplified text-level application for diff preview purposes.
 */
function applyDirectivesToCode(
  code: string,
  directives: AmendmentDirective[],
): string {
  let result = code;

  for (const dir of directives) {
    switch (dir.type) {
      case 'MODIFIES': {
        if (!dir.modifyField || !dir.newValue) break;

        // Find the target block and modify the specified field
        const targetPattern = new RegExp(
          `(${dir.targetType}\\s+${dir.targetName}[\\s\\S]*?)${dir.modifyField}\\s+[^\\n]+`,
          'i'
        );
        const match = result.match(targetPattern);
        if (match) {
          result = result.replace(
            targetPattern,
            `$1${dir.modifyField} ${dir.newValue}`
          );
        }
        break;
      }

      case 'DELETES': {
        // Remove the entire block for the target
        const deletePattern = new RegExp(
          `${dir.targetType}\\s+${dir.targetName}[\\s\\S]*?(?=\\n(?:COVENANT|BASKET|DEFINE|CONDITION|PROHIBIT|EVENT|PHASE|AMENDMENT|$))`,
          'i'
        );
        result = result.replace(deletePattern, '');
        break;
      }

      case 'ADDS': {
        if (dir.replacementCode) {
          result = result.trimEnd() + '\n\n' + dir.replacementCode + '\n';
        }
        break;
      }

      case 'REPLACES': {
        if (!dir.replacementCode) break;
        // Delete then add
        const replacePattern = new RegExp(
          `${dir.targetType}\\s+${dir.targetName}[\\s\\S]*?(?=\\n(?:COVENANT|BASKET|DEFINE|CONDITION|PROHIBIT|EVENT|PHASE|AMENDMENT|$))`,
          'i'
        );
        result = result.replace(replacePattern, dir.replacementCode);
        break;
      }
    }
  }

  return result;
}

// =============================================================================
// COMPONENT
// =============================================================================

let directiveCounter = 0;

export function AmendmentOverlay({
  isOpen,
  onClose,
  currentCode,
  triggerCovenant,
  amendmentNumber = 1,
  onGenerate,
}: AmendmentOverlayProps) {
  const [description, setDescription] = useState('');
  const [directives, setDirectives] = useState<AmendmentDirective[]>([]);
  const [changeSummary, setChangeSummary] = useState<ChangeSummary | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New directive form
  const [newType, setNewType] = useState<AmendmentDirectiveType>('MODIFIES');
  const [newTargetType, setNewTargetType] = useState<'COVENANT' | 'BASKET' | 'DEFINE'>('COVENANT');
  const [newTargetName, setNewTargetName] = useState('');
  const [newModifyField, setNewModifyField] = useState<string>('REQUIRES');
  const [newValue, setNewValue] = useState('');

  // Pre-populate if triggered from a covenant breach
  useEffect(() => {
    if (triggerCovenant && isOpen && directives.length === 0) {
      const isMaxCovenant = triggerCovenant.operator === '<=' || triggerCovenant.operator === '<';
      const adjustedThreshold = isMaxCovenant
        ? triggerCovenant.required * 1.10 // Increase max threshold by 10%
        : triggerCovenant.required * 0.90; // Decrease min threshold by 10%

      const formattedThreshold = triggerCovenant.required > 10
        ? `$${Math.round(adjustedThreshold).toLocaleString().replace(/,/g, '_')}`
        : adjustedThreshold.toFixed(2);

      setDirectives([{
        id: `dir-${++directiveCounter}`,
        type: 'MODIFIES',
        targetType: 'COVENANT',
        targetName: triggerCovenant.name,
        description: `Adjust threshold from ${triggerCovenant.operator} ${triggerCovenant.required > 10 ? formatCurrency(triggerCovenant.required) : formatRatio(triggerCovenant.required)} to ${triggerCovenant.operator} ${triggerCovenant.required > 10 ? formatCurrency(adjustedThreshold) : formatRatio(adjustedThreshold)}`,
        modifyField: 'REQUIRES',
        newValue: `${triggerCovenant.name.replace(/^(Max|Min)/, '')} ${triggerCovenant.operator} ${formattedThreshold}`,
      }]);

      setDescription(
        `Adjust ${formatDisplayName(triggerCovenant.name)} threshold following waiver`
      );

      setNewTargetName(triggerCovenant.name);
    }
  }, [triggerCovenant, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generated amendment code
  const amendmentCode = useMemo(() => {
    return generateAmendmentCode(amendmentNumber, description, directives);
  }, [amendmentNumber, description, directives]);

  // Modified code (for diff preview)
  const modifiedCode = useMemo(() => {
    return applyDirectivesToCode(currentCode, directives);
  }, [currentCode, directives]);

  // Compute diff when directives change
  const computeDiff = useCallback(async () => {
    if (directives.length === 0 || !currentCode) {
      setChangeSummary(null);
      return;
    }

    setDiffLoading(true);
    setDiffError(null);

    try {
      const summary = await computeChangeSummary(
        currentCode,
        modifiedCode,
        0, // from version
        amendmentNumber,
        'Amendment',
      );
      setChangeSummary(summary);
    } catch (e) {
      setDiffError((e as Error).message);
    } finally {
      setDiffLoading(false);
    }
  }, [currentCode, modifiedCode, directives.length, amendmentNumber]);

  // Re-compute diff when directives change
  useEffect(() => {
    if (isOpen && directives.length > 0) {
      const timeout = setTimeout(computeDiff, 500);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, computeDiff, directives.length]);

  // Add directive
  const addDirective = () => {
    if (!newTargetName.trim()) return;

    const directive: AmendmentDirective = {
      id: `dir-${++directiveCounter}`,
      type: newType,
      targetType: newTargetType,
      targetName: newTargetName.trim(),
      description: '',
    };

    if (newType === 'MODIFIES') {
      directive.modifyField = newModifyField as AmendmentDirective['modifyField'];
      directive.newValue = newValue;
    } else if (newType === 'REPLACES' || newType === 'ADDS') {
      directive.replacementCode = newValue;
    }

    setDirectives(prev => [...prev, directive]);
    setNewTargetName('');
    setNewValue('');
  };

  // Remove directive
  const removeDirective = (id: string) => {
    setDirectives(prev => prev.filter(d => d.id !== id));
  };

  // Copy amendment code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(amendmentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate and close
  const handleGenerate = () => {
    onGenerate?.(amendmentCode);
    handleClose();
  };

  // Reset state
  const handleClose = () => {
    setDescription('');
    setDirectives([]);
    setChangeSummary(null);
    setDiffError(null);
    setCopied(false);
    setNewTargetName('');
    setNewValue('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Amendment ${amendmentNumber} Builder`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Amendment Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Amendment Description
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Increase leverage covenant threshold following Q3 waiver"
          />
        </div>

        {/* Current Directives */}
        {directives.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Amendment Directives ({directives.length})
            </h4>
            <div className="space-y-2">
              {directives.map((dir) => (
                <div
                  key={dir.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border-DEFAULT bg-surface-1"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        dir.type === 'DELETES' ? 'danger'
                          : dir.type === 'ADDS' ? 'success'
                          : dir.type === 'REPLACES' ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {dir.type}
                    </Badge>
                    <span className="text-sm text-text-primary">
                      {dir.targetType} <span className="font-mono text-gold-400">{dir.targetName}</span>
                    </span>
                    {dir.modifyField && (
                      <span className="text-xs text-text-muted">
                        → {dir.modifyField} {dir.newValue}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDirective(dir.id)}
                    className="text-danger hover:text-danger/80"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Directive Form */}
        <div className="rounded-lg border border-border-DEFAULT bg-surface-1 p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-text-muted" />
            Add Directive
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Select
              value={newType}
              onChange={(e) => setNewType(e.target.value as AmendmentDirectiveType)}
              options={[
                { value: 'MODIFIES', label: 'MODIFIES' },
                { value: 'REPLACES', label: 'REPLACES' },
                { value: 'ADDS', label: 'ADDS' },
                { value: 'DELETES', label: 'DELETES' },
              ]}
            />
            <Select
              value={newTargetType}
              onChange={(e) => setNewTargetType(e.target.value as 'COVENANT' | 'BASKET' | 'DEFINE')}
              options={[
                { value: 'COVENANT', label: 'Covenant' },
                { value: 'BASKET', label: 'Basket' },
                { value: 'DEFINE', label: 'Definition' },
              ]}
            />
            <Input
              value={newTargetName}
              onChange={(e) => setNewTargetName(e.target.value)}
              placeholder="Element name"
            />
            {newType === 'MODIFIES' && (
              <Select
                value={newModifyField}
                onChange={(e) => setNewModifyField(e.target.value)}
                options={[
                  { value: 'REQUIRES', label: 'REQUIRES' },
                  { value: 'CAPACITY', label: 'CAPACITY' },
                  { value: 'FLOOR', label: 'FLOOR' },
                  { value: 'MAXIMUM', label: 'MAXIMUM' },
                  { value: 'TESTED', label: 'TESTED' },
                ]}
              />
            )}
          </div>

          {newType !== 'DELETES' && (
            <div className="mb-3">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={
                  newType === 'MODIFIES'
                    ? 'e.g., Leverage <= 5.25'
                    : 'Full ProViso code for the new element'
                }
              />
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={addDirective}
            icon={<Plus className="w-3 h-3" />}
            disabled={!newTargetName.trim()}
          >
            Add
          </Button>
        </div>

        {/* Preview Tabs: Code / Diff / Impact */}
        {directives.length > 0 && (
          <Tabs defaultTab="diff">
            <TabList>
              <TabTrigger id="diff">Visual Diff</TabTrigger>
              <TabTrigger id="code">Amendment Code</TabTrigger>
              <TabTrigger id="impact">Impact Analysis</TabTrigger>
            </TabList>

            <TabPanel id="diff">
              <DiffViewer
                fromCode={currentCode}
                toCode={modifiedCode}
                fromLabel="Current Agreement"
                toLabel="After Amendment"
                maxHeight="300px"
              />
            </TabPanel>

            <TabPanel id="code">
              <div className="rounded-lg border border-border-DEFAULT bg-surface-2 overflow-hidden">
                <div className="px-4 py-2 bg-surface-3 border-b border-border-DEFAULT flex items-center justify-between">
                  <span className="text-sm text-text-tertiary">
                    Amendment {amendmentNumber} — ProViso syntax
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={copied
                      ? <Check className="w-3 h-3 text-success" />
                      : <Copy className="w-3 h-3" />
                    }
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <pre className="p-4 text-sm font-mono text-text-secondary overflow-auto max-h-[300px]">
                  <code>{amendmentCode}</code>
                </pre>
              </div>
            </TabPanel>

            <TabPanel id="impact">
              {diffLoading && (
                <div className="flex items-center gap-3 p-4">
                  <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                  <span className="text-sm text-text-tertiary">Computing impact...</span>
                </div>
              )}

              {diffError && (
                <div className="flex items-center gap-3 p-4 text-sm text-danger">
                  <AlertCircle className="w-4 h-4" />
                  <span>{diffError}</span>
                </div>
              )}

              {!diffLoading && !diffError && changeSummary && (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="rounded-lg bg-surface-1 border border-border-DEFAULT p-3 text-center">
                      <p className="text-2xl font-bold text-text-primary">{changeSummary.totalChanges}</p>
                      <p className="text-xs text-text-muted">Total Changes</p>
                    </div>
                    <div className="rounded-lg bg-success/5 border border-success/20 p-3 text-center">
                      <p className="text-2xl font-bold text-success">{changeSummary.borrowerFavorable}</p>
                      <p className="text-xs text-text-muted">Borrower Fav.</p>
                    </div>
                    <div className="rounded-lg bg-danger/5 border border-danger/20 p-3 text-center">
                      <p className="text-2xl font-bold text-danger">{changeSummary.lenderFavorable}</p>
                      <p className="text-xs text-text-muted">Lender Fav.</p>
                    </div>
                    <div className="rounded-lg bg-surface-1 border border-border-DEFAULT p-3 text-center">
                      <p className="text-2xl font-bold text-text-tertiary">{changeSummary.neutral}</p>
                      <p className="text-xs text-text-muted">Neutral</p>
                    </div>
                  </div>

                  {/* Change Details */}
                  <div className="space-y-2">
                    {changeSummary.changes.map((change: Change) => {
                      const impactConfig: Record<string, { border: string; bg: string; label: string }> = {
                        borrower_favorable: { border: 'border-l-success', bg: 'bg-success/5', label: 'Borrower' },
                        lender_favorable: { border: 'border-l-danger', bg: 'bg-danger/5', label: 'Lender' },
                        neutral: { border: 'border-l-text-muted', bg: 'bg-surface-2/50', label: 'Neutral' },
                        unclear: { border: 'border-l-border-strong', bg: '', label: 'Unclear' },
                      };
                      const config = impactConfig[change.impact] || impactConfig.unclear!;

                      return (
                        <div key={change.id} className={`border-l-4 rounded-r-lg p-3 ${config.border} ${config.bg}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="muted" size="sm">{change.elementType}</Badge>
                              <span className="text-sm font-medium text-text-primary">{change.title}</span>
                            </div>
                            <Badge
                              variant={change.impact === 'borrower_favorable' ? 'success'
                                : change.impact === 'lender_favorable' ? 'danger'
                                : 'muted'}
                              size="sm"
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-tertiary mt-1">{change.description}</p>
                          {change.beforeValue && change.afterValue && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span className="text-text-muted line-through">{change.beforeValue}</span>
                              <ArrowRight className="w-3 h-3 text-text-muted" />
                              <span className="text-text-primary font-medium">{change.afterValue}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!diffLoading && !diffError && !changeSummary && (
                <div className="text-center py-8 text-text-muted">
                  <Info className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Add directives above to see impact analysis</p>
                </div>
              )}
            </TabPanel>
          </Tabs>
        )}

        {/* Actions */}
        {directives.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border-DEFAULT">
            <p className="text-xs text-text-muted">
              {directives.length} directive{directives.length !== 1 ? 's' : ''} in this amendment
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={handleGenerate}
                icon={<FileCode className="w-4 h-4" />}
              >
                Generate Amendment
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AmendmentOverlay;
