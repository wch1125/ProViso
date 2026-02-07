/**
 * Waiver Request Portal
 *
 * When a cure isn't available or appropriate, borrowers can request a waiver.
 * This modal:
 * - Shows the breach context (covenant, shortfall, timeline)
 * - Auto-generates a waiver request narrative
 * - Allows customization of the request text
 * - Tracks waiver status in the activity feed
 *
 * In a real system this would integrate with document management
 * and lender approval workflows.
 */
import { useState, useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  Send,
  Copy,
  Check,
  Info,
  MessageSquare,
} from 'lucide-react';
import { Modal } from '../base/Modal';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import { TextArea } from '../base/TextArea';
import { Input } from '../base/Input';
import { Select } from '../base/Select';
import {
  formatCurrency,
  formatRatio,
  formatDisplayName,
} from '../../utils/narratives';
import { getThresholdZone, getZoneStyle } from '../../utils/thresholds';
import type { CovenantData } from '../../types';

// =============================================================================
// TYPES
// =============================================================================

export type WaiverType = 'temporary' | 'permanent' | 'amendment_pending';
export type WaiverUrgency = 'standard' | 'expedited' | 'emergency';

export interface WaiverRequestData {
  covenantName: string;
  waiverType: WaiverType;
  urgency: WaiverUrgency;
  requestedDuration: string;
  justification: string;
  proposedRemediation: string;
  contactName: string;
  contactEmail: string;
}

export interface WaiverRequestPortalProps {
  isOpen: boolean;
  onClose: () => void;
  covenant: CovenantData | null;
  /** Additional breached covenants that could be included */
  allBreachedCovenants?: CovenantData[];
  /** Callback when waiver request is submitted */
  onSubmit?: (request: WaiverRequestData) => void;
  /** Deal name for the request letter */
  dealName?: string;
  /** Borrower name for the request letter */
  borrowerName?: string;
}

// =============================================================================
// NARRATIVE GENERATOR
// =============================================================================

function generateWaiverNarrative(
  covenant: CovenantData,
  waiverType: WaiverType,
  _urgency: WaiverUrgency,
  requestedDuration: string,
  dealName?: string,
  borrowerName?: string,
): string {
  const isMaxCovenant = covenant.operator === '<=' || covenant.operator === '<';
  const formatVal = covenant.actual > 10
    ? (v: number) => formatCurrency(v)
    : (v: number) => formatRatio(v);

  const shortfall = Math.abs(covenant.actual - covenant.required);
  const covenantName = formatDisplayName(covenant.name);
  const borrower = borrowerName || '[Borrower]';
  const deal = dealName || '[Facility]';

  const typeLabel = waiverType === 'temporary' ? 'temporary waiver'
    : waiverType === 'amendment_pending' ? 'waiver pending amendment'
    : 'permanent waiver';

  const lines = [
    `Re: Request for ${typeLabel} — ${covenantName}`,
    ``,
    `Dear Administrative Agent,`,
    ``,
    `${borrower} ("Borrower") hereby requests a ${typeLabel} of the ${covenantName} covenant under the ${deal} (the "Credit Agreement").`,
    ``,
    `As of the most recent testing date, the Borrower's ${covenantName} stood at ${formatVal(covenant.actual)}, which ${isMaxCovenant ? 'exceeds' : 'falls below'} the required threshold of ${covenant.operator} ${formatVal(covenant.required)} by ${formatVal(shortfall)}.`,
    ``,
  ];

  if (waiverType === 'temporary') {
    lines.push(
      `The Borrower requests a temporary waiver for a period of ${requestedDuration || '[duration]'}, during which the ${covenantName} covenant testing shall be suspended.`,
      ``,
    );
  } else if (waiverType === 'amendment_pending') {
    lines.push(
      `The Borrower requests a waiver of the ${covenantName} covenant pending execution of an amendment to the Credit Agreement that would ${isMaxCovenant ? 'increase' : 'decrease'} the threshold to an appropriate level.`,
      ``,
    );
  }

  lines.push(
    `The Borrower believes this breach is [temporary/due to specific circumstances] and expects to return to compliance within [timeframe]. The following remediation steps are being taken:`,
    ``,
    `1. [Describe remediation step 1]`,
    `2. [Describe remediation step 2]`,
    ``,
    `We respectfully request the Required Lenders' consent to this waiver at their earliest convenience.`,
    ``,
    `Respectfully,`,
    `${borrower}`,
  );

  return lines.join('\n');
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WaiverRequestPortal({
  isOpen,
  onClose,
  covenant,
  allBreachedCovenants = [],
  onSubmit,
  dealName,
  borrowerName,
}: WaiverRequestPortalProps) {
  const [waiverType, setWaiverType] = useState<WaiverType>('temporary');
  const [urgency, setUrgency] = useState<WaiverUrgency>('standard');
  const [requestedDuration, setRequestedDuration] = useState('90 days');
  const [justification, setJustification] = useState('');
  const [proposedRemediation, setProposedRemediation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-generated narrative
  const narrative = useMemo(() => {
    if (!covenant) return '';
    return generateWaiverNarrative(
      covenant,
      waiverType,
      urgency,
      requestedDuration,
      dealName,
      borrowerName,
    );
  }, [covenant, waiverType, urgency, requestedDuration, dealName, borrowerName]);

  // Breach context
  const shortfall = useMemo(() => {
    if (!covenant || covenant.compliant) return 0;
    const isMaxCovenant = covenant.operator === '<=' || covenant.operator === '<';
    return isMaxCovenant
      ? covenant.actual - covenant.required
      : covenant.required - covenant.actual;
  }, [covenant]);

  const formatValue = useMemo(() => {
    if (!covenant) return (v: number) => v.toFixed(2);
    return covenant.actual > 10
      ? (v: number) => formatCurrency(v)
      : (v: number) => formatRatio(v);
  }, [covenant]);

  const zone = useMemo(() => {
    if (!covenant) return 'safe' as const;
    if (!covenant.compliant) return 'breach' as const;
    return getThresholdZone(covenant.actual, covenant.required, covenant.operator);
  }, [covenant]);

  const zoneStyle = getZoneStyle(zone);

  // Copy narrative to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(narrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Submit waiver request
  const handleSubmit = () => {
    if (!covenant) return;

    const request: WaiverRequestData = {
      covenantName: covenant.name,
      waiverType,
      urgency,
      requestedDuration,
      justification,
      proposedRemediation,
      contactName,
      contactEmail,
    };

    onSubmit?.(request);
    setSubmitted(true);
  };

  // Reset state
  const handleClose = () => {
    setWaiverType('temporary');
    setUrgency('standard');
    setRequestedDuration('90 days');
    setJustification('');
    setProposedRemediation('');
    setContactName('');
    setContactEmail('');
    setCopied(false);
    setSubmitted(false);
    onClose();
  };

  if (!covenant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Waiver Request Portal"
      size="xl"
    >
      <div className="space-y-6">
        {/* Breach Context Header */}
        <div className={`rounded-lg border p-4 ${zoneStyle.bgColor} ${zoneStyle.borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${zoneStyle.textColor}`} />
              <h3 className={`font-semibold ${zoneStyle.textColor}`}>
                {formatDisplayName(covenant.name)} — Breach
              </h3>
            </div>
            {allBreachedCovenants.length > 1 && (
              <Badge variant="danger" size="sm">
                {allBreachedCovenants.length} covenants in breach
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Actual</p>
              <p className="text-lg font-mono font-semibold text-text-primary">
                {formatValue(covenant.actual)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Threshold</p>
              <p className="text-lg font-mono font-semibold text-text-primary">
                {covenant.operator} {formatValue(covenant.required)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Shortfall</p>
              <p className="text-lg font-mono font-semibold text-danger">
                {formatValue(shortfall)}
              </p>
            </div>
          </div>
        </div>

        {/* Submitted Success State */}
        {submitted && (
          <div className="rounded-lg border border-success/30 bg-success/10 p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-success" />
              <div>
                <p className="font-semibold text-success">Waiver Request Submitted</p>
                <p className="text-sm text-text-tertiary mt-1">
                  Your waiver request has been logged. In a production system, this would be
                  routed to the Administrative Agent and Required Lenders for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {!submitted && (
          <>
            {/* Waiver Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Waiver Type
                </label>
                <Select
                  value={waiverType}
                  onChange={(e) => setWaiverType(e.target.value as WaiverType)}
                  options={[
                    { value: 'temporary', label: 'Temporary Waiver' },
                    { value: 'permanent', label: 'Permanent Waiver' },
                    { value: 'amendment_pending', label: 'Waiver Pending Amendment' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Urgency
                </label>
                <Select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as WaiverUrgency)}
                  options={[
                    { value: 'standard', label: 'Standard (30 days)' },
                    { value: 'expedited', label: 'Expedited (10 days)' },
                    { value: 'emergency', label: 'Emergency (48 hours)' },
                  ]}
                />
              </div>
            </div>

            {waiverType === 'temporary' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Requested Duration
                </label>
                <Select
                  value={requestedDuration}
                  onChange={(e) => setRequestedDuration(e.target.value)}
                  options={[
                    { value: '30 days', label: '30 days' },
                    { value: '60 days', label: '60 days' },
                    { value: '90 days', label: '90 days' },
                    { value: 'one fiscal quarter', label: 'One fiscal quarter' },
                    { value: 'two fiscal quarters', label: 'Two fiscal quarters' },
                  ]}
                />
              </div>
            )}

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Justification / Business Context
              </label>
              <TextArea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Describe the circumstances that led to the breach and why a waiver is appropriate..."
                rows={3}
              />
            </div>

            {/* Remediation Plan */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Proposed Remediation
              </label>
              <TextArea
                value={proposedRemediation}
                onChange={(e) => setProposedRemediation(e.target.value)}
                placeholder="Describe the steps being taken to return to compliance..."
                rows={3}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Contact Name
                </label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g., Jennifer Chen, CFO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Contact Email
                </label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g., jchen@company.com"
                />
              </div>
            </div>

            {/* Generated Narrative Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <label className="text-sm font-medium text-text-secondary">
                    Generated Waiver Request Letter
                  </label>
                </div>
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
              <div className="rounded-lg border border-border-DEFAULT bg-surface-2 overflow-hidden">
                <pre className="p-4 text-sm text-text-secondary overflow-auto max-h-[200px] whitespace-pre-wrap font-serif leading-relaxed">
                  {narrative}
                </pre>
              </div>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Auto-generated from covenant data. Edit the fields above to customize.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border-DEFAULT">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <MessageSquare className="w-3 h-3" />
                <span>
                  {urgency === 'emergency' ? 'Emergency: Notify agent within 48 hours'
                    : urgency === 'expedited' ? 'Expedited: Target 10-day turnaround'
                    : 'Standard: Target 30-day turnaround'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  onClick={handleSubmit}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default WaiverRequestPortal;
