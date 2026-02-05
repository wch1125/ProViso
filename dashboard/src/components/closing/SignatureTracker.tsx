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
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'requested':
        return <Send className="w-5 h-5 text-amber-400" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
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
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.signed}</div>
          <div className="text-xs text-emerald-300">Signed</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.requested}</div>
          <div className="text-xs text-amber-300">Requested</div>
        </div>
        <div className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-slate-400">{stats.pending}</div>
          <div className="text-xs text-slate-300">Pending</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.declined}</div>
          <div className="text-xs text-red-300">Declined</div>
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
              className={`bg-slate-800/50 rounded-lg overflow-hidden border ${
                allSigned ? 'border-emerald-500/30' : 'border-slate-700'
              }`}
            >
              {/* Document Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${allSigned ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-white font-medium">{doc.documentTitle}</h4>
                    <p className="text-xs text-slate-400">
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
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : sig.status === 'requested'
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : sig.status === 'declined'
                          ? 'border-red-500/30 bg-red-500/5'
                          : 'border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getStatusIcon(sig.status)}
                        {getStatusBadge(sig.status)}
                      </div>
                      <div className="text-sm font-medium text-white">
                        {sig.partyName}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {sig.signatoryName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {sig.signatoryTitle}
                      </div>
                      {sig.signedAt && (
                        <div className="text-xs text-emerald-400 mt-2">
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
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-400 font-medium">All Signatures Obtained</p>
          <p className="text-sm text-slate-400 mt-1">
            All documents have been fully executed.
          </p>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No documents require signatures.
        </div>
      )}
    </div>
  );
}

export default SignatureTracker;
