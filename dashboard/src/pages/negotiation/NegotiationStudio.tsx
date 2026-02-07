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
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Loader2,
  AlertCircle,
  RotateCcw,
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
import { computeChangeSummary } from '../../utils/versionDiff';
import { parse } from '@proviso/parser.js';
import { validate } from '@proviso/validator.js';
import { useDeal, type DealVersion, type ChangeSummary } from '../../context';
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
  const navigate = useNavigate();
  const { getDeal, getVersionsForDeal, getCurrentVersion: getDealCurrentVersion, logActivity, loadScenario, getCachedChangeSummary, cacheChangeSummary } = useDeal();

  // Load scenario data when dealId changes
  useEffect(() => {
    if (dealId) {
      loadScenario(dealId);
    }
  }, [dealId, loadScenario]);

  // Get deal from context
  const deal = getDeal(dealId ?? '');
  const versions = getVersionsForDeal(dealId ?? '');
  const currentVersion = deal ? getDealCurrentVersion(deal.id) : undefined;

  // Modal states - MUST be before any conditional returns
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DealVersion | null>(null);
  const [compareFromVersion, setCompareFromVersion] = useState<string>('');
  const [compareToVersion, setCompareToVersion] = useState<string>('');

  // Editor states
  const [showCovenantEditor, setShowCovenantEditor] = useState(false);
  const [showBasketEditor, setShowBasketEditor] = useState(false);
  const [addedElements, setAddedElements] = useState<AddedElement[]>([]);

  // Copy state
  const [copiedWord, setCopiedWord] = useState(false);

  // Diff state
  const [compareSummary, setCompareSummary] = useState<ChangeSummary | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);

  // "Changes in This Version" summary (current vs parent)
  const [currentVersionSummary, setCurrentVersionSummary] = useState<ChangeSummary | null>(null);

  const handleResetDemo = () => {
    localStorage.clear();
    setShowResetModal(false);
    navigate('/');
  };

  // Initialize version state when deal becomes available
  const effectiveSelectedVersion = selectedVersion || currentVersion || null;
  const effectiveCompareFromVersion = compareFromVersion || versions[0]?.id || '';
  const effectiveCompareToVersion = compareToVersion || versions[versions.length - 1]?.id || '';

  // Compute change summary between two versions (async, with caching)
  const loadChangeSummary = useCallback(async (fromId: string, toId: string): Promise<ChangeSummary | null> => {
    if (fromId === toId) return null;

    // Check cache first
    const cached = getCachedChangeSummary(fromId, toId);
    if (cached) return cached;

    const fromVersion = versions.find(v => v.id === fromId);
    const toVersion = versions.find(v => v.id === toId);
    if (!fromVersion || !toVersion) return null;

    // Use the version's embedded changeSummary if available (demo data)
    if (toVersion.changeSummary && toVersion.parentVersionId === fromId) {
      cacheChangeSummary(fromId, toId, toVersion.changeSummary);
      return toVersion.changeSummary;
    }

    // Compute live diff
    try {
      const summary = await computeChangeSummary(
        fromVersion.creditLangCode,
        toVersion.creditLangCode,
        fromVersion.versionNumber,
        toVersion.versionNumber,
        toVersion.authorParty,
      );
      cacheChangeSummary(fromId, toId, summary);
      return summary;
    } catch (e) {
      console.error('Failed to compute change summary:', e);
      return null;
    }
  }, [versions, getCachedChangeSummary, cacheChangeSummary]);

  // Compute "Changes in This Version" when selected version changes
  useEffect(() => {
    if (!effectiveSelectedVersion?.parentVersionId) {
      setCurrentVersionSummary(effectiveSelectedVersion?.changeSummary ?? null);
      return;
    }
    let cancelled = false;
    loadChangeSummary(effectiveSelectedVersion.parentVersionId, effectiveSelectedVersion.id)
      .then(summary => {
        if (!cancelled) setCurrentVersionSummary(summary);
      });
    return () => { cancelled = true; };
  }, [effectiveSelectedVersion?.id, effectiveSelectedVersion?.parentVersionId, effectiveSelectedVersion?.changeSummary, loadChangeSummary]);

  // Get the current code including any added elements
  const currentCode = useMemo(() => {
    let code = effectiveSelectedVersion?.creditLangCode || '';
    for (const element of addedElements) {
      code += '\n\n' + element.code;
    }
    return code;
  }, [effectiveSelectedVersion?.creditLangCode, addedElements]);

  // Compile-check: parse + validate the combined code on every change
  const [compileStatus, setCompileStatus] = useState<{
    ok: boolean;
    errors: string[];
  }>({ ok: true, errors: [] });

  useEffect(() => {
    if (!currentCode.trim()) {
      setCompileStatus({ ok: true, errors: [] });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await parse(currentCode);
        if (cancelled) return;
        if (!result.success || !result.ast) {
          setCompileStatus({ ok: false, errors: [result.error?.message ?? 'Parse failed'] });
          return;
        }
        const validation = validate(result.ast);
        if (cancelled) return;
        const errs = validation.errors.map(e => e.message);
        setCompileStatus({ ok: errs.length === 0, errors: errs });
      } catch (e) {
        if (cancelled) return;
        setCompileStatus({ ok: false, errors: [(e as Error).message] });
      }
    })();
    return () => { cancelled = true; };
  }, [currentCode]);

  // Generate Word document from current code
  const generatedDocument = useMemo(() => {
    if (!currentCode || !deal) return null;
    try {
      return generateWordDocument(currentCode, {
        dealName: deal.name,
        facilityAmount: 150000000,
        version: `v${effectiveSelectedVersion?.versionNumber || '1'}`,
      });
    } catch {
      return null;
    }
  }, [currentCode, deal, effectiveSelectedVersion?.versionNumber]);

  // Trigger diff computation when compare versions change while modal is open
  // (must be before any conditional returns — Rules of Hooks)
  useEffect(() => {
    if (!showCompareModal || !effectiveCompareFromVersion || !effectiveCompareToVersion) return;
    if (effectiveCompareFromVersion === effectiveCompareToVersion) {
      setCompareSummary(null);
      return;
    }

    let cancelled = false;
    setDiffLoading(true);
    setDiffError(null);

    loadChangeSummary(effectiveCompareFromVersion, effectiveCompareToVersion)
      .then(summary => {
        if (!cancelled) {
          setCompareSummary(summary);
          setDiffLoading(false);
        }
      })
      .catch(e => {
        if (!cancelled) {
          setDiffError((e as Error).message);
          setDiffLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [showCompareModal, effectiveCompareFromVersion, effectiveCompareToVersion, loadChangeSummary]);

  // Handle deal not found - AFTER all hooks
  if (!deal) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Deal Not Found</h2>
          <p className="text-text-tertiary mb-4">The deal you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleVersionSelect = (version: DealVersion) => {
    setSelectedVersion(version);
  };

  const openCompareModal = () => {
    const currentIdx = versions.findIndex((v) => v.id === currentVersion?.id);
    if (currentIdx > 0) {
      setCompareFromVersion(versions[currentIdx - 1].id);
      setCompareToVersion(versions[currentIdx].id);
    }
    setCompareSummary(null);
    setDiffError(null);
    setShowCompareModal(true);
  };

  const handleSendToCounterparty = () => {
    setShowSendConfirmation(false);
    if (deal) {
      logActivity({
        type: 'version_sent',
        dealId: deal.id,
        title: 'Version sent to counterparty',
        description: `v${effectiveSelectedVersion?.versionNumber} - ${effectiveSelectedVersion?.versionLabel}`,
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
      const success = await copyDocumentToClipboard(generatedDocument);
      if (success) {
        setCopiedWord(true);
        setTimeout(() => setCopiedWord(false), 2000);
      }
    }
  };

  const handleDownloadWord = () => {
    if (generatedDocument) {
      downloadDocument(generatedDocument, `${deal.name.replace(/\s+/g, '_')}_v${effectiveSelectedVersion?.versionNumber || '1'}.txt`);
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
      subtitle={`${effectiveSelectedVersion?.versionLabel} (v${effectiveSelectedVersion?.versionNumber})`}
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
          {addedElements.length > 0 && (
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              compileStatus.ok
                ? 'text-success bg-success/10'
                : 'text-danger bg-danger/10'
            }`} title={compileStatus.ok ? 'Code compiles' : compileStatus.errors.join('; ')}>
              {compileStatus.ok
                ? <><Check className="w-4 h-4" /> Valid</>
                : <><AlertCircle className="w-4 h-4" /> {compileStatus.errors.length} error{compileStatus.errors.length !== 1 ? 's' : ''}</>
              }
            </span>
          )}
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
          <Button
            variant="ghost"
            icon={<RotateCcw className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowResetModal(true)}
          >
            Reset Demo
          </Button>
        </>
      }
    >
      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar - Versions */}
        <DealPageSidebar>
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Versions
            </h3>
            <div className="space-y-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionSelect(version)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    version.id === effectiveSelectedVersion?.id
                      ? 'bg-gold-500/10 border border-gold-500/30'
                      : 'hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        version.id === effectiveSelectedVersion?.id
                          ? 'text-gold-500'
                          : 'text-text-primary'
                      }`}
                    >
                      v{version.versionNumber}
                    </span>
                    <VersionStatusBadge status={version.status} />
                  </div>
                  <p className="text-xs text-text-tertiary truncate">
                    {version.versionLabel}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {version.authorParty}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border-DEFAULT pt-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
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
                    <History className="w-5 h-5 text-text-tertiary" />
                    <h2 className="text-lg font-semibold text-text-primary">
                      Changes in This Version
                    </h2>
                  </div>
                  {currentVersionSummary && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-success">
                        {currentVersionSummary.borrowerFavorable} Borrower
                      </span>
                      <span className="text-danger">
                        {currentVersionSummary.lenderFavorable} Lender
                      </span>
                      <span className="text-text-tertiary">
                        {currentVersionSummary.neutral} Neutral
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {currentVersionSummary ? (
                  <div className="space-y-4">
                    {currentVersionSummary.changes.map((change: Change) => (
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
                  <h2 className="text-lg font-semibold text-text-primary">
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
                  <div className="text-center py-12 text-text-tertiary">
                    <Plus className="w-12 h-12 mx-auto mb-4 text-text-muted" />
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
              <label className="block text-sm font-medium text-text-secondary mb-1">
                From Version
              </label>
              <Select
                value={effectiveCompareFromVersion}
                onChange={(e) => setCompareFromVersion(e.target.value)}
                options={versions.map((v) => ({
                  value: v.id,
                  label: `v${v.versionNumber} - ${v.versionLabel}`,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                To Version
              </label>
              <Select
                value={effectiveCompareToVersion}
                onChange={(e) => setCompareToVersion(e.target.value)}
                options={versions.map((v) => ({
                  value: v.id,
                  label: `v${v.versionNumber} - ${v.versionLabel}`,
                }))}
              />
            </div>
          </div>

          {diffLoading && (
            <div className="bg-surface-1 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
              <span className="text-sm text-text-tertiary">Computing diff...</span>
            </div>
          )}

          {diffError && (
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-danger" />
              <span className="text-sm text-danger">{diffError}</span>
            </div>
          )}

          {!diffLoading && !diffError && compareSummary && (
            <div className="bg-surface-1 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-tertiary">
                  {compareSummary.totalChanges} change{compareSummary.totalChanges !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-4">
                  <span className="text-success">
                    {compareSummary.borrowerFavorable} Borrower Favorable
                  </span>
                  <span className="text-danger">
                    {compareSummary.lenderFavorable} Lender Favorable
                  </span>
                  <span className="text-text-tertiary">
                    {compareSummary.neutral} Neutral
                  </span>
                </div>
              </div>
            </div>
          )}

          {(() => {
            const fromVersion = versions.find((v) => v.id === effectiveCompareFromVersion);
            const toVersion = versions.find((v) => v.id === effectiveCompareToVersion);
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
        title={`ProViso Code - ${effectiveSelectedVersion?.versionLabel}`}
        size="lg"
      >
        <div className="rounded-lg border border-border-DEFAULT bg-surface-2 overflow-hidden">
          <div className="px-4 py-2 bg-surface-3 border-b border-border-DEFAULT flex items-center justify-between">
            <span className="text-sm text-text-tertiary">
              {effectiveSelectedVersion?.authorParty} &middot; v{effectiveSelectedVersion?.versionNumber}
              {addedElements.length > 0 && (
                <span className="ml-2 text-gold-400">
                  + {addedElements.length} new element{addedElements.length > 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-text-secondary overflow-auto max-h-[500px]">
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
            <div className="text-sm text-text-tertiary">
              {generatedDocument?.sections.length || 0} sections generated
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={copiedWord ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
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
                <div className="rounded-lg border border-border-DEFAULT bg-surface-2 overflow-hidden">
                  <pre className="p-4 text-sm text-text-secondary overflow-auto max-h-[500px] whitespace-pre-wrap font-serif leading-relaxed">
                    {generatedDocument.fullText}
                  </pre>
                </div>
              </TabPanel>

              <TabPanel id="sections">
                <div className="space-y-4 max-h-[500px] overflow-auto">
                  {generatedDocument.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border-DEFAULT bg-surface-1 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="muted" size="sm">
                          {section.sectionRef}
                        </Badge>
                        <span className="text-sm font-medium text-text-primary">
                          {section.title}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary font-serif leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </TabPanel>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <FileText className="w-12 h-12 mx-auto mb-4 text-text-muted" />
              <p>No content to generate</p>
            </div>
          )}

          <div className="pt-4 border-t border-border-DEFAULT">
            <p className="text-xs text-text-muted">
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
          `Version: v${effectiveSelectedVersion?.versionNumber} - ${effectiveSelectedVersion?.versionLabel}`,
          `Changes: ${(currentVersionSummary?.totalChanges || 0) + addedElements.length} modifications`,
        ]}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetDemo}
        variant="danger"
        title="Reset Demo?"
        message="This will reset all demo data and return to the home page. Any changes you've made will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
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
          ? 'bg-gold-500/10 text-gold-500'
          : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
      } ${indent ? 'pl-6' : ''}`}
    >
      <span className="text-text-muted mr-2">{section}</span>
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
      border: 'border-l-success',
      bg: 'bg-success/5',
      icon: '\u2191',
    },
    lender_favorable: {
      border: 'border-l-danger',
      bg: 'bg-danger/5',
      icon: '\u2193',
    },
    neutral: {
      border: 'border-l-text-muted',
      bg: 'bg-surface-2/50',
      icon: '\u2022',
    },
    unclear: {
      border: 'border-l-border-strong',
      bg: '',
      icon: '?',
    },
  };

  const config = impactConfig[change.impact] || impactConfig.unclear;

  return (
    <div className={`border-l-4 rounded-r-lg p-4 ${config.border} ${config.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">
            {change.sectionReference}
          </span>
          <Badge variant="muted" size="sm">
            {change.elementType}
          </Badge>
        </div>
        <span className="text-xs text-text-muted" title={change.impact.replace('_', ' ')}>
          {config.icon}
        </span>
      </div>
      <h4 className="text-sm font-medium text-text-primary mb-1">{change.title}</h4>
      <p className="text-sm text-text-tertiary">{change.description}</p>
      {change.beforeValue && change.afterValue && (
        <div className="flex items-center gap-3 mt-2 text-sm">
          <span className="text-text-muted line-through">{change.beforeValue}</span>
          <span className="text-text-muted">&rarr;</span>
          <span className="text-text-primary font-medium">{change.afterValue}</span>
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
    <div className="border border-success/30 bg-success/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {element.type === 'covenant' ? (
            <Scale className="w-4 h-4 text-success" />
          ) : (
            <Wallet className="w-4 h-4 text-success" />
          )}
          <span className="text-sm font-medium text-text-primary">{element.name}</span>
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
            className="text-danger hover:text-danger/80"
          >
            Remove
          </Button>
        </div>
      </div>

      <p className="text-sm text-text-secondary font-serif leading-relaxed mb-2">
        {element.prose}
      </p>

      {showCode && (
        <div className="mt-3 rounded border border-border-DEFAULT bg-surface-2 p-3">
          <pre className="text-xs font-mono text-text-tertiary whitespace-pre-wrap">
            {element.code}
          </pre>
        </div>
      )}
    </div>
  );
}

export default NegotiationStudio;
