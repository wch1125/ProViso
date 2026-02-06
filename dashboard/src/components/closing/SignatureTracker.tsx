/**
 * SignatureTracker Component
 *
 * Displays signature status for documents requiring execution.
 * Supports request signature and mark as signed actions.
 */

import { CheckCircle, Clock, Send, XCircle, FileText, Check } from 'lucide-react';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';

interface Signature {
  id: string;
  partyId: string;
  partyName: string;
  signatoryName: string;
  signatoryTitle: string;
  status: 'pending' | 'requested' | 'signed' | 'declined';
  signedAt: Date | null;
}

interface SignatureDocument {
  documentId: string;
  documentTitle: string;
  signatures: Signature[];
}

interface SignatureTrackerProps {
  documents: SignatureDocument[];
  onRequestSignature?: (documentId: string, signatureId: string) => void;
  onMarkSigned?: (documentId: string, signatureId: string) => void;
}

export function SignatureTracker({ documents, onRequestSignature, onMarkSigned }: SignatureTrackerProps) {
  const getStatusIcon = (status: Signature['status']) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'requested':
        return <Send className="w-5 h-5 text-warning" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-danger" />;
      default:
        return <Clock className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusBadge = (status: Signature['status']) => {
    switch (status) {
      case 'signed':
        return <Badge variant="success" size="sm">Signed</Badge>;
      case 'requested':
        return <Badge variant="warning" size="sm">Requested</Badge>;
      case 'declined':
        return <Badge variant="danger" size="sm">Declined</Badge>;
      default:
        return <Badge variant="muted" size="sm">Pending</Badge>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate overall stats
  const allSignatures = documents.flatMap((d) => d.signatures);
  const stats = {
    total: allSignatures.length,
    signed: allSignatures.filter((s) => s.status === 'signed').length,
    requested: allSignatures.filter((s) => s.status === 'requested').length,
    pending: allSignatures.filter((s) => s.status === 'pending').length,
    declined: allSignatures.filter((s) => s.status === 'declined').length,
  };

  // Filter to documents that need signatures
  const docsNeedingSignatures = documents.filter(
    (d) => d.signatures.some((s) => s.status !== 'signed')
  );

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-success">{stats.signed}</div>
          <div className="text-xs text-success">Signed</div>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-warning">{stats.requested}</div>
          <div className="text-xs text-warning">Requested</div>
        </div>
        <div className="bg-surface-1 border border-border-DEFAULT rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-text-tertiary">{stats.pending}</div>
          <div className="text-xs text-text-secondary">Pending</div>
        </div>
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-danger">{stats.declined}</div>
          <div className="text-xs text-danger">Declined</div>
        </div>
      </div>

      {/* Document Signature Blocks */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const signedCount = doc.signatures.filter((s) => s.status === 'signed').length;
          const totalCount = doc.signatures.length;
          const allSigned = signedCount === totalCount;

          return (
            <div
              key={doc.documentId}
              className={`bg-surface-1 rounded-lg overflow-hidden border ${
                allSigned ? 'border-success/30' : 'border-border-DEFAULT'
              }`}
            >
              {/* Document Header */}
              <div className="p-4 border-b border-border-DEFAULT flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${allSigned ? 'text-success' : 'text-text-muted'}`} />
                  <div>
                    <h4 className="text-text-primary font-medium">{doc.documentTitle}</h4>
                    <p className="text-xs text-text-tertiary">
                      {signedCount} of {totalCount} signatures obtained
                    </p>
                  </div>
                </div>
                {allSigned && (
                  <Badge variant="success">Fully Executed</Badge>
                )}
              </div>

              {/* Signature Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {doc.signatures.map((sig) => (
                    <div
                      key={sig.id}
                      className={`p-3 rounded-lg border ${
                        sig.status === 'signed'
                          ? 'border-success/30 bg-success/5'
                          : sig.status === 'requested'
                          ? 'border-warning/30 bg-warning/5'
                          : sig.status === 'declined'
                          ? 'border-danger/30 bg-danger/5'
                          : 'border-border-DEFAULT bg-surface-1'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getStatusIcon(sig.status)}
                        {getStatusBadge(sig.status)}
                      </div>
                      <div className="text-sm font-medium text-text-primary">
                        {sig.partyName}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {sig.signatoryName}
                      </div>
                      <div className="text-xs text-text-muted">
                        {sig.signatoryTitle}
                      </div>
                      {sig.signedAt && (
                        <div className="text-xs text-success mt-2">
                          Signed {formatDate(sig.signedAt)}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {sig.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          {onRequestSignature && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Send className="w-3 h-3" />}
                              onClick={() => onRequestSignature(doc.documentId, sig.id)}
                              className="flex-1 text-xs"
                            >
                              Request
                            </Button>
                          )}
                          {onMarkSigned && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Check className="w-3 h-3" />}
                              onClick={() => onMarkSigned(doc.documentId, sig.id)}
                              className="flex-1 text-xs"
                            >
                              Signed
                            </Button>
                          )}
                        </div>
                      )}

                      {sig.status === 'requested' && onMarkSigned && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Check className="w-3 h-3" />}
                          onClick={() => onMarkSigned(doc.documentId, sig.id)}
                          className="w-full mt-3 text-xs"
                        >
                          Mark as Signed
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {docsNeedingSignatures.length === 0 && documents.length > 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-success font-medium">All Signatures Obtained</p>
          <p className="text-sm text-text-tertiary mt-1">
            All documents have been fully executed.
          </p>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          No documents require signatures.
        </div>
      )}
    </div>
  );
}

export default SignatureTracker;
