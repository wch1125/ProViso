/**
 * Negotiation Studio - v2.2 Negotiation Module
 *
 * Form-based editing of credit agreement terms with version control.
 * This is the main editing interface for lawyers.
 *
 * v2.2 Updates:
 * - Integrated CovenantEditor and BasketEditor for form-based editing
 * - Wired Generate Word button to document generator
 * - Real-time code and prose generation
 */
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Send,
  FileText,
  GitCompare,
  Code,
  History,
  Plus,
  Scale,
  Wallet,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Badge } from '../../components/base/Badge';
import { Button } from '../../components/base/Button';
import { Modal } from '../../components/base/Modal';
import { Select } from '../../components/base/Select';
import { Tabs, TabList, TabTrigger, TabPanel } from '../../components/base/Tabs';
import { DealPageLayout, DealPageSidebar, DealPageContent } from '../../components/layout';
import { NoChanges } from '../../components/base/EmptyState';
import { ConfirmationModal } from '../../components/base/ConfirmationModal';
import { DiffViewer } from '../../components/diff';
import { CovenantEditor } from '../../components/editors/CovenantEditor';
import { BasketEditor } from '../../components/editors/BasketEditor';
import type { CovenantFormValues } from '../../components/editors/CovenantEditor';
import type { BasketFormValues } from '../../components/editors/BasketEditor';
import { generateWordDocument, copyDocumentToClipboard, downloadDocument } from '../../utils/wordGenerator';
import { useDeal, type DealVersion, type ChangeSummary } from '../../context';
import { demoChangeSummaryV1toV2, demoChangeSummaryV2toV3 } from '../../data/negotiation-demo';
import type { Change } from '../../data/negotiation-demo';

// =============================================================================
// TYPES
// =============================================================================

interface AddedElement {
  type: 'covenant' | 'basket';
  name: string;
  code: string;
  prose: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function NegotiationStudio() {
  const { dealId } = useParams<{ dealId: string }>();
  const { getDeal, getVersionsForDeal, getCurrentVersion: getDealCurrentVersion, logActivity } = useDeal();

  // Get deal from context
  const deal = getDeal(dealId ?? '');
  const versions = getVersionsForDeal(dealId ?? '');
  const currentVersion = deal ? getDealCurrentVersion(deal.id) : undefined;

  // Handle deal not found
  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Deal Not Found</h2>
          <p className="text-slate-400 mb-4">The deal you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Modal states
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DealVersion | null>(currentVersion || null);
  const [compareFromVersion, setCompareFromVersion] = useState<string>(versions[0]?.id || '');
  const [compareToVersion, setCompareToVersion] = useState<string>(versions[versions.length - 1]?.id || '');

  // Editor states
  const [showCovenantEditor, setShowCovenantEditor] = useState(false);
  const [showBasketEditor, setShowBasketEditor] = useState(false);
  const [addedElements, setAddedElements] = useState<AddedElement[]>([]);

  // Copy state
  const [copiedWord, setCopiedWord] = useState(false);

  // Get change summary for display
  const getChangeSummary = (fromId: string, toId: string): ChangeSummary | null => {
    if (fromId === 'version-1' && toId === 'version-2') {
      return demoChangeSummaryV1toV2;
    }
    if (fromId === 'version-2' && toId === 'version-3') {
      return demoChangeSummaryV2toV3;
    }
    return null;
  };

  // Get the current code including any added elements
  const currentCode = useMemo(() => {
    let code = selectedVersion?.creditLangCode || '';
    for (const element of addedElements) {
      code += '\n\n' + element.code;
    }
    return code;
  }, [selectedVersion?.creditLangCode, addedElements]);

  // Generate Word document from current code
  const generatedDocument = useMemo(() => {
    if (!currentCode) return null;
    try {
      return generateWordDocument(currentCode, {
        dealName: deal.name,
        facilityAmount: 150000000,
        version: `v${selectedVersion?.versionNumber || '1'}`,
      });
    } catch {
      return null;
    }
  }, [currentCode, deal.name, selectedVersion?.versionNumber]);

  const handleVersionSelect = (version: DealVersion) => {
    setSelectedVersion(version);
  };

  const openCompareModal = () => {
    const currentIdx = versions.findIndex((v) => v.id === currentVersion?.id);
    if (currentIdx > 0) {
      setCompareFromVersion(versions[currentIdx - 1].id);
      setCompareToVersion(versions[currentIdx].id);
    }
    setShowCompareModal(true);
  };

  const handleSendToCounterparty = () => {
    setShowSendConfirmation(false);
    if (deal) {
      logActivity({
        type: 'version_sent',
        dealId: deal.id,
        title: 'Version sent to counterparty',
        description: `v${selectedVersion?.versionNumber} - ${selectedVersion?.versionLabel}`,
      });
    }
  };

  const handleCovenantSave = (code: string, prose: string, values: CovenantFormValues) => {
    setAddedElements(prev => [...prev, {
      type: 'covenant',
      name: values.name,
      code,
      prose,
    }]);
  };

  const handleBasketSave = (code: string, prose: string, values: BasketFormValues) => {
    setAddedElements(prev => [...prev, {
      type: 'basket',
      name: values.name,
      code,
      prose,
    }]);
  };

  const handleCopyWord = async () => {
    if (generatedDocument) {
      await copyDocumentToClipboard(generatedDocument);
      setCopiedWord(true);
      setTimeout(() => setCopiedWord(false), 2000);
    }
  };

  const handleDownloadWord = () => {
    if (generatedDocument) {
      downloadDocument(generatedDocument, `${deal.name.replace(/\s+/g, '_')}_v${selectedVersion?.versionNumber || '1'}.txt`);
    }
  };

  const removeElement = (index: number) => {
    setAddedElements(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DealPageLayout
      dealId={dealId || 'unknown'}
      dealName={deal.name}
      dealStatus={deal.status as 'draft' | 'negotiation' | 'closing' | 'active' | 'matured'}
      subtitle={`${selectedVersion?.versionLabel} (v${selectedVersion?.versionNumber})`}
      actions={
        <>
          <Button
            variant="ghost"
            icon={<GitCompare className="w-4 h-4" />}
            size="sm"
            onClick={openCompareModal}
          >
            Compare
          </Button>
          <Button
            variant="ghost"
            icon={<Code className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowCodeModal(true)}
          >
            View Code
          </Button>
          <Button
            variant="ghost"
            icon={<FileText className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowWordModal(true)}
          >
            Generate Word
          </Button>
          <Button
            variant="gold"
            icon={<Send className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowSendConfirmation(true)}
          >
            Send to Counterparty
          </Button>
        </>
      }
    >
      {/* Main Layout: Sidebar + Content */}
      <div className="flex">
        {/* Left Sidebar - Versions */}
        <DealPageSidebar>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Versions
            </h3>
            <div className="space-y-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionSelect(version)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    version.id === selectedVersion?.id
                      ? 'bg-accent-500/10 border border-accent-500/30'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        version.id === selectedVersion?.id
                          ? 'text-accent-400'
                          : 'text-white'
                      }`}
                    >
                      v{version.versionNumber}
                    </span>
                    <VersionStatusBadge status={version.status} />
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {version.versionLabel}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {version.authorParty}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Sections
            </h3>
            <nav className="space-y-1">
              <SectionLink section="Art. 1" name="Definitions" active />
              <SectionLink section="Art. 7" name="Covenants" indent />
              <SectionLink section="7.02" name="Investments" indent />
              <SectionLink section="7.11" name="Financial Covenants" indent />
              <SectionLink section="Art. 8" name="Events of Default" />
            </nav>
          </div>
        </DealPageSidebar>

        {/* Main Content */}
        <DealPageContent className="flex-1">
          <div className="max-w-4xl">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Changes in This Version
                    </h2>
                  </div>
                  {selectedVersion?.changeSummary && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-emerald-400">
                        {selectedVersion.changeSummary.borrowerFavorable} Borrower
                      </span>
                      <span className="text-red-400">
                        {selectedVersion.changeSummary.lenderFavorable} Lender
                      </span>
                      <span className="text-slate-400">
                        {selectedVersion.changeSummary.neutral} Neutral
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {selectedVersion?.changeSummary ? (
                  <div className="space-y-4">
                    {selectedVersion.changeSummary.changes.map((change: Change) => (
                      <ChangeCard key={change.id} change={change} />
                    ))}
                  </div>
                ) : (
                  <NoChanges />
                )}
              </CardBody>
            </Card>

            {/* Form-based editing section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Article 7 - Financial Covenants
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Scale className="w-4 h-4" />}
                      onClick={() => setShowCovenantEditor(true)}
                    >
                      Add Covenant
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Wallet className="w-4 h-4" />}
                      onClick={() => setShowBasketEditor(true)}
                    >
                      Add Basket
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {addedElements.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Plus className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-lg mb-2">Add terms to this agreement</p>
                    <p className="text-sm mb-4">
                      Use the buttons above to add covenants, baskets, and other terms.
                      <br />
                      ProViso code and Word prose will be generated automatically.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Scale className="w-4 h-4" />}
                        onClick={() => setShowCovenantEditor(true)}
                      >
                        Add Covenant
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Wallet className="w-4 h-4" />}
                        onClick={() => setShowBasketEditor(true)}
                      >
                        Add Basket
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addedElements.map((element, index) => (
                      <AddedElementCard
                        key={`${element.type}-${element.name}-${index}`}
                        element={element}
                        onRemove={() => removeElement(index)}
                      />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </DealPageContent>
      </div>

      {/* Compare Modal */}
      <Modal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        title="Compare Versions"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                From Version
              </label>
              <Select
                value={compareFromVersion}
                onChange={(e) => setCompareFromVersion(e.target.value)}
                options={versions.map((v) => ({
                  value: v.id,
                  label: `v${v.versionNumber} - ${v.versionLabel}`,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                To Version
              </label>
              <Select
                value={compareToVersion}
                onChange={(e) => setCompareToVersion(e.target.value)}
                options={versions.map((v) => ({
                  value: v.id,
                  label: `v${v.versionNumber} - ${v.versionLabel}`,
                }))}
              />
            </div>
          </div>

          {(() => {
            const summary = getChangeSummary(compareFromVersion, compareToVersion);
            if (summary) {
              return (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      {summary.totalChanges} change{summary.totalChanges !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-emerald-400">
                        {summary.borrowerFavorable} Borrower Favorable
                      </span>
                      <span className="text-red-400">
                        {summary.lenderFavorable} Lender Favorable
                      </span>
                      <span className="text-slate-400">
                        {summary.neutral} Neutral
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {(() => {
            const fromVersion = versions.find((v) => v.id === compareFromVersion);
            const toVersion = versions.find((v) => v.id === compareToVersion);
            if (fromVersion && toVersion) {
              return (
                <DiffViewer
                  fromCode={fromVersion.creditLangCode}
                  toCode={toVersion.creditLangCode}
                  fromLabel={`v${fromVersion.versionNumber} - ${fromVersion.authorParty}`}
                  toLabel={`v${toVersion.versionNumber} - ${toVersion.authorParty}`}
                  maxHeight="500px"
                />
              );
            }
            return null;
          })()}
        </div>
      </Modal>

      {/* View Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        title={`ProViso Code - ${selectedVersion?.versionLabel}`}
        size="lg"
      >
        <div className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {selectedVersion?.authorParty} &middot; v{selectedVersion?.versionNumber}
              {addedElements.length > 0 && (
                <span className="ml-2 text-accent-400">
                  + {addedElements.length} new element{addedElements.length > 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-slate-300 overflow-auto max-h-[500px]">
            <code>{currentCode}</code>
          </pre>
        </div>
      </Modal>

      {/* Generate Word Modal */}
      <Modal
        isOpen={showWordModal}
        onClose={() => setShowWordModal(false)}
        title="Generated Word Document"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {generatedDocument?.sections.length || 0} sections generated
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={copiedWord ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopyWord}
              >
                {copiedWord ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadWord}
              >
                Download
              </Button>
            </div>
          </div>

          {generatedDocument ? (
            <Tabs defaultTab="full">
              <TabList>
                <TabTrigger id="full">Full Document</TabTrigger>
                <TabTrigger id="sections">By Section</TabTrigger>
              </TabList>

              <TabPanel id="full">
                <div className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
                  <pre className="p-4 text-sm text-slate-300 overflow-auto max-h-[500px] whitespace-pre-wrap font-serif leading-relaxed">
                    {generatedDocument.fullText}
                  </pre>
                </div>
              </TabPanel>

              <TabPanel id="sections">
                <div className="space-y-4 max-h-[500px] overflow-auto">
                  {generatedDocument.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="muted" size="sm">
                          {section.sectionRef}
                        </Badge>
                        <span className="text-sm font-medium text-white">
                          {section.title}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-serif leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </TabPanel>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>No content to generate</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              This is a text-based preview. Full .docx export with formatting will be available in a future release.
            </p>
          </div>
        </div>
      </Modal>

      {/* Send Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSendConfirmation}
        onClose={() => setShowSendConfirmation(false)}
        onConfirm={handleSendToCounterparty}
        variant="warning"
        title="Send to Counterparty?"
        message="This will send the current version to the counterparty for review. They will be notified by email."
        confirmLabel="Send"
        cancelLabel="Cancel"
        details={[
          `Version: v${selectedVersion?.versionNumber} - ${selectedVersion?.versionLabel}`,
          `Changes: ${(selectedVersion?.changeSummary?.totalChanges || 0) + addedElements.length} modifications`,
        ]}
      />

      {/* Covenant Editor */}
      <CovenantEditor
        isOpen={showCovenantEditor}
        onClose={() => setShowCovenantEditor(false)}
        onSave={handleCovenantSave}
        mode="create"
      />

      {/* Basket Editor */}
      <BasketEditor
        isOpen={showBasketEditor}
        onClose={() => setShowBasketEditor(false)}
        onSave={handleBasketSave}
        mode="create"
      />
    </DealPageLayout>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function VersionStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; variant: 'success' | 'warning' | 'info' | 'muted' }
  > = {
    draft: { label: 'Draft', variant: 'muted' },
    sent: { label: 'Sent', variant: 'info' },
    received: { label: 'Received', variant: 'info' },
    superseded: { label: 'Superseded', variant: 'muted' },
    executed: { label: 'Executed', variant: 'success' },
  };

  const c = config[status] || config.draft;
  return (
    <Badge variant={c.variant} size="sm">
      {c.label}
    </Badge>
  );
}

function SectionLink({
  section,
  name,
  active,
  indent,
}: {
  section: string;
  name: string;
  active?: boolean;
  indent?: boolean;
}) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-accent-500/10 text-accent-400'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      } ${indent ? 'pl-6' : ''}`}
    >
      <span className="text-slate-500 mr-2">{section}</span>
      {name}
    </button>
  );
}

interface ChangeCardProps {
  change: {
    id: string;
    title: string;
    description: string;
    sectionReference: string;
    elementType: string;
    impact: string;
    beforeValue: string | null;
    afterValue: string | null;
  };
}

function ChangeCard({ change }: ChangeCardProps) {
  const impactConfig: Record<string, { border: string; bg: string; icon: string }> = {
    borrower_favorable: {
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-500/5',
      icon: '\u2191',
    },
    lender_favorable: {
      border: 'border-l-red-500',
      bg: 'bg-red-500/5',
      icon: '\u2193',
    },
    neutral: {
      border: 'border-l-slate-500',
      bg: 'bg-slate-500/5',
      icon: '\u2022',
    },
    unclear: {
      border: 'border-l-slate-600',
      bg: '',
      icon: '?',
    },
  };

  const config = impactConfig[change.impact] || impactConfig.unclear;

  return (
    <div className={`border-l-4 rounded-r-lg p-4 ${config.border} ${config.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {change.sectionReference}
          </span>
          <Badge variant="muted" size="sm">
            {change.elementType}
          </Badge>
        </div>
        <span className="text-xs text-slate-500" title={change.impact.replace('_', ' ')}>
          {config.icon}
        </span>
      </div>
      <h4 className="text-sm font-medium text-white mb-1">{change.title}</h4>
      <p className="text-sm text-slate-400">{change.description}</p>
      {change.beforeValue && change.afterValue && (
        <div className="flex items-center gap-3 mt-2 text-sm">
          <span className="text-slate-500 line-through">{change.beforeValue}</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="text-white font-medium">{change.afterValue}</span>
        </div>
      )}
    </div>
  );
}

function AddedElementCard({
  element,
  onRemove,
}: {
  element: AddedElement;
  onRemove: () => void;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {element.type === 'covenant' ? (
            <Scale className="w-4 h-4 text-emerald-400" />
          ) : (
            <Wallet className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-sm font-medium text-white">{element.name}</span>
          <Badge variant="success" size="sm">
            {element.type === 'covenant' ? 'Covenant' : 'Basket'}
          </Badge>
          <Badge variant="info" size="sm">
            New
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300"
          >
            Remove
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate-300 font-serif leading-relaxed mb-2">
        {element.prose}
      </p>

      {showCode && (
        <div className="mt-3 rounded border border-slate-700 bg-slate-900 p-3">
          <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap">
            {element.code}
          </pre>
        </div>
      )}
    </div>
  );
}

export default NegotiationStudio;
