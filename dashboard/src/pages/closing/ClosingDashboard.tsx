/**
 * Closing Dashboard - v2.0 Closing Module
 *
 * Tracks conditions precedent, documents, and signatures for deal closing.
 * Integrates ReadinessMeter, CPChecklist, DocumentTracker, and SignatureTracker components.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileCheck,
  FileText,
  PenTool,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  Download,
  Copy,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Badge } from '../../components/base/Badge';
import { Button } from '../../components/base/Button';
import { Modal } from '../../components/base/Modal';
import { Tabs, TabList, TabTrigger, TabPanel } from '../../components/base/Tabs';
import { ToastContainer } from '../../components/base/Toast';
import { DealPageLayout, DealPageContent } from '../../components/layout';
import { ConfirmationModal } from '../../components/base/ConfirmationModal';
import {
  ReadinessMeter,
  CPChecklist,
  DocumentTracker,
  SignatureTracker,
} from '../../components/closing';
import { useClosing } from '../../context';
import { generateClosingChecklist, downloadAsFile, copyToClipboard } from '../../utils/export';

export function ClosingDashboard() {
  const { dealId } = useParams<{ dealId: string }>();
  const [_activeTab, setActiveTab] = useState('overview');
  const [activeLayerFilter, setActiveLayerFilter] = useState<string | null>(null);
  const [showReadyToCloseModal, setShowReadyToCloseModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportContent, setExportContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Get all state and actions from context
  const {
    deal,
    conditions,
    documents,
    parties,
    stats,
    readinessPercentage,
    daysUntilClosing,
    layerStats,
    weightedReadinessPercentage,
    gatingCount,
    satisfyCondition,
    waiveCondition,
    uploadDocument,
    requestSignature,
    markSigned,
    toasts,
    removeToast,
    addToast,
    loadScenario,
    resetToDefaults,
  } = useClosing();

  // Load scenario data when dealId changes
  useEffect(() => {
    if (dealId) {
      loadScenario(dealId);
    }
  }, [dealId, loadScenario]);

  // Build party lookup map
  const partyMap = new Map(parties.map((p) => [p.id, p]));

  // Transform conditions for CPChecklist component
  const cpChecklistData = conditions.map((cp) => ({
    id: cp.id,
    sectionReference: cp.sectionReference,
    category: cp.category,
    title: cp.title,
    description: cp.description,
    responsiblePartyId: cp.responsiblePartyId,
    responsiblePartyName: partyMap.get(cp.responsiblePartyId)?.shortName ?? 'Unknown',
    status: cp.status,
    dueDate: cp.dueDate,
    isOverdue: cp.status === 'pending' && cp.dueDate !== null && new Date(cp.dueDate) < new Date(),
    notes: cp.notes,
  }));

  // Transform documents for DocumentTracker component
  const documentTrackerData = documents.map((doc) => ({
    id: doc.id,
    documentType: doc.documentType,
    title: doc.title,
    fileName: doc.fileName,
    status: doc.status,
    responsiblePartyName: doc.responsiblePartyId
      ? partyMap.get(doc.responsiblePartyId)?.shortName ?? null
      : null,
    dueDate: doc.dueDate,
    isOverdue: doc.status === 'pending' && doc.dueDate !== null && new Date(doc.dueDate) < new Date(),
    signatures: doc.signatures.map((sig) => ({
      id: sig.id,
      partyId: sig.partyId,
      partyName: partyMap.get(sig.partyId)?.shortName ?? 'Unknown',
      signatoryName: sig.signatoryName,
      signatoryTitle: sig.signatoryTitle,
      status: sig.status,
      signedAt: sig.signedAt,
    })),
    linkedConditions: doc.satisfiesConditionIds,
  }));

  // Transform for SignatureTracker component
  const signatureTrackerData = documents
    .filter((doc) => doc.signatures.length > 0)
    .map((doc) => ({
      documentId: doc.id,
      documentTitle: doc.title,
      signatures: doc.signatures.map((sig) => ({
        id: sig.id,
        partyId: sig.partyId,
        partyName: partyMap.get(sig.partyId)?.shortName ?? 'Unknown',
        signatoryName: sig.signatoryName,
        signatoryTitle: sig.signatoryTitle,
        status: sig.status,
        signedAt: sig.signedAt,
      })),
    }));

  const handleMarkReadyToClose = () => {
    addToast({
      type: 'success',
      title: 'Deal Marked Ready',
      message: 'All parties will be notified',
    });
    setShowReadyToCloseModal(false);
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetModal(false);
  };

  const handleRefresh = () => {
    if (dealId) {
      loadScenario(dealId);
      addToast({
        type: 'info',
        title: 'Refreshed',
        message: `${deal.name} data reloaded`,
      });
    }
  };

  const handleExport = () => {
    // Transform data for export
    const conditionsForExport = conditions.map((cp) => ({
      sectionReference: cp.sectionReference,
      title: cp.title,
      description: cp.description,
      status: cp.status,
      responsiblePartyName: partyMap.get(cp.responsiblePartyId)?.shortName ?? 'Unknown',
      category: cp.category,
      dueDate: cp.dueDate,
      notes: cp.notes,
    }));

    const documentsForExport = documents.map((doc) => ({
      title: doc.title,
      fileName: doc.fileName,
      status: doc.status,
      documentType: doc.documentType,
      responsiblePartyName: doc.responsiblePartyId
        ? partyMap.get(doc.responsiblePartyId)?.shortName ?? null
        : null,
      signatures: doc.signatures.map((sig) => ({
        partyName: partyMap.get(sig.partyId)?.shortName ?? 'Unknown',
        signatoryName: sig.signatoryName,
        status: sig.status,
        signedAt: sig.signedAt,
      })),
    }));

    const content = generateClosingChecklist(deal, conditionsForExport, documentsForExport, stats, layerStats);
    setExportContent(content);
    setShowExportModal(true);
    setCopied(false);
  };

  const handleDownload = () => {
    const filename = `${deal.name.replace(/\s+/g, '_')}_Closing_Checklist.md`;
    downloadAsFile(exportContent, filename, 'text/markdown');
    addToast({
      type: 'success',
      title: 'Download Started',
      message: filename,
    });
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(exportContent);
    if (success) {
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DealPageLayout
      dealId={dealId || 'unknown'}
      dealName={deal.name}
      dealStatus="closing"
      subtitle={`Target Close: ${new Date(deal.targetClosingDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`}
      actions={
        <>
          <Button
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4" />}
            size="sm"
            onClick={handleRefresh}
            title="Reload scenario data"
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            icon={<RotateCcw className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowResetModal(true)}
          >
            Reset Demo
          </Button>
          <Button
            variant="ghost"
            icon={<FileText className="w-4 h-4" />}
            size="sm"
            onClick={handleExport}
          >
            Export Checklist
          </Button>
          <Button
            variant="gold"
            icon={<CheckCircle2 className="w-4 h-4" />}
            size="sm"
            onClick={() => setShowReadyToCloseModal(true)}
          >
            Mark Ready to Close
          </Button>
        </>
      }
    >
      {/* Content */}
      <DealPageContent>
        {/* Readiness Meter - Always visible */}
        <ReadinessMeter
          readinessPercentage={readinessPercentage}
          conditions={stats.conditions}
          documents={{
            total: stats.documents.total,
            uploaded: stats.documents.uploaded + stats.documents.executed,
            pending: stats.documents.pending,
          }}
          signatures={stats.signatures}
          daysUntilClosing={daysUntilClosing}
          targetDate={new Date(deal.targetClosingDate)}
          layerStats={layerStats}
          weightedReadinessPercentage={weightedReadinessPercentage}
          gatingCount={gatingCount}
          activeLayerFilter={activeLayerFilter}
          onLayerClick={setActiveLayerFilter}
        />

        {/* Tabs for different views */}
        <div className="mt-6">
          <Tabs defaultTab="overview" onChange={setActiveTab}>
            <TabList>
              <TabTrigger id="overview" icon={<FileCheck className="w-4 h-4" />}>
                Conditions ({gatingCount > 0 ? `${gatingCount} gating` : `${stats.conditions.pending} pending`})
              </TabTrigger>
              <TabTrigger id="documents" icon={<FileText className="w-4 h-4" />}>
                Documents ({stats.documents.pending} pending)
              </TabTrigger>
              <TabTrigger id="signatures" icon={<PenTool className="w-4 h-4" />}>
                Signatures ({stats.signatures.pending + stats.signatures.requested} pending)
              </TabTrigger>
            </TabList>

            <TabPanel id="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Conditions Precedent
                    </h2>
                    {gatingCount > 0 ? (
                      <Badge variant="danger">
                        {gatingCount} gating
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        {stats.conditions.pending} remaining
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <CPChecklist
                    conditions={cpChecklistData}
                    onSatisfy={satisfyCondition}
                    onWaive={waiveCondition}
                    layerStats={layerStats}
                    activeLayerFilter={activeLayerFilter}
                    onLayerFilterChange={setActiveLayerFilter}
                  />
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel id="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Closing Documents
                    </h2>
                    <Badge variant="info">
                      {stats.documents.uploaded + stats.documents.executed} received
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <DocumentTracker
                    documents={documentTrackerData}
                    onUpload={uploadDocument}
                  />
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel id="signatures" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Signature Tracking
                    </h2>
                    <Badge variant="success">
                      {stats.signatures.signed} signed
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <SignatureTracker
                    documents={signatureTrackerData}
                    onRequestSignature={requestSignature}
                    onMarkSigned={markSigned}
                  />
                </CardBody>
              </Card>
            </TabPanel>
          </Tabs>
        </div>
      </DealPageContent>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Export Checklist Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Closing Checklist"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              Close
            </Button>
            <Button
              variant="ghost"
              icon={<Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">
            Preview of the closing checklist in Markdown format. You can copy or download this file.
          </p>
          <div className="bg-surface-2 border border-border-DEFAULT rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
              {exportContent}
            </pre>
          </div>
        </div>
      </Modal>

      {/* Ready to Close Confirmation Modal */}
      <ConfirmationModal
        isOpen={showReadyToCloseModal}
        onClose={() => setShowReadyToCloseModal(false)}
        onConfirm={handleMarkReadyToClose}
        variant="success"
        title="Mark Ready to Close?"
        message="This will notify all parties that the deal is ready for closing. Please ensure all conditions are satisfied."
        confirmLabel="Mark Ready"
        cancelLabel="Cancel"
        details={[
          `Ready to Close: ${weightedReadinessPercentage}% (weighted)`,
          ...(gatingCount > 0 ? [`${gatingCount} gating item${gatingCount !== 1 ? 's' : ''} still outstanding`] : []),
          `${stats.conditions.satisfied + stats.conditions.waived} of ${stats.conditions.total} conditions complete`,
          `${stats.documents.uploaded + stats.documents.executed} of ${stats.documents.total} documents received`,
          `${stats.signatures.signed} of ${stats.signatures.total} signatures collected`,
        ]}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        variant="danger"
        title={`Reset ${deal.name}?`}
        message={`This will reset all closing data for ${deal.name} to its original demo state. Any changes you've made (satisfied conditions, uploaded documents, signatures) will be lost.`}
        confirmLabel="Reset"
        cancelLabel="Cancel"
      />
    </DealPageLayout>
  );
}

export default ClosingDashboard;
