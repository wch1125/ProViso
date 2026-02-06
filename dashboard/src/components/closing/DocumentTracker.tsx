/**
 * DocumentTracker Component — v2.4 Design System
 *
 * Displays documents with status, responsible parties, and linked conditions.
 * Supports file upload functionality.
 */

import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { Modal } from '../base/Modal';

interface DocumentSignature {
  id: string;
  partyId: string;
  partyName: string;
  signatoryName: string;
  signatoryTitle: string;
  status: 'pending' | 'requested' | 'signed' | 'declined';
  signedAt: Date | null;
}

interface Document {
  id: string;
  documentType: string;
  title: string;
  fileName: string;
  status: 'pending' | 'uploaded' | 'executed';
  responsiblePartyName: string | null;
  dueDate: Date | null;
  isOverdue: boolean;
  signatures: DocumentSignature[];
  linkedConditions: string[];
}

interface DocumentTrackerProps {
  documents: Document[];
  onUpload?: (documentId: string, fileName: string) => void;
}

const documentTypeLabels: Record<string, string> = {
  corporate: 'Corporate',
  credit_agreement: 'Credit Agreement',
  security: 'Security',
  financial: 'Financial',
  opinion: 'Legal Opinion',
  certificate: 'Certificate',
  other: 'Other',
};

export function DocumentTracker({ documents, onUpload }: DocumentTrackerProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'uploaded'>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter((doc) => {
    if (filter === 'pending' && doc.status !== 'pending') return false;
    if (filter === 'uploaded' && doc.status === 'pending') return false;
    return true;
  });

  const getStatusIcon = (doc: Document) => {
    if (doc.status === 'executed') return <CheckCircle className="w-5 h-5 text-success" />;
    if (doc.status === 'uploaded') return <Upload className="w-5 h-5 text-info" />;
    if (doc.isOverdue) return <AlertTriangle className="w-5 h-5 text-danger" />;
    return <Clock className="w-5 h-5 text-warning" />;
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.status === 'executed') return <Badge variant="success" size="sm">Executed</Badge>;
    if (doc.status === 'uploaded') return <Badge variant="info" size="sm">Uploaded</Badge>;
    if (doc.isOverdue) return <Badge variant="danger" size="sm">Overdue</Badge>;
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  const getLeftBorderColor = (doc: Document) => {
    if (doc.status === 'executed') return 'border-l-success';
    if (doc.status === 'uploaded') return 'border-l-info';
    if (doc.isOverdue) return 'border-l-danger';
    return 'border-l-warning';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleExpand = (docId: string) => {
    setExpandedDoc(expandedDoc === docId ? null : docId);
  };

  const groupedDocs = filteredDocs.reduce((groups, doc) => {
    const type = doc.documentType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  const stats = {
    total: documents.length,
    uploaded: documents.filter((d) => d.status === 'uploaded' || d.status === 'executed').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    overdue: documents.filter((d) => d.isOverdue && d.status === 'pending').length,
  };

  const handleOpenUploadModal = (doc: Document) => {
    setSelectedDocument(doc);
    setUploadModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    if (selectedDocument && onUpload) {
      onUpload(selectedDocument.id, file.name);
      setUploadModalOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1">
          {(['all', 'pending', 'uploaded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === f
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-[13px]">
          <span className="text-success">{stats.uploaded} uploaded</span>
          <span className="text-warning">{stats.pending} pending</span>
          {stats.overdue > 0 && (
            <span className="text-danger">{stats.overdue} overdue</span>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-6">
        {Object.entries(groupedDocs).map(([type, docs]) => (
          <div key={type}>
            <h4 className="text-[11px] font-semibold text-text-tertiary mb-3 uppercase tracking-[1.5px] pb-3 border-b-2 border-border-DEFAULT">
              {documentTypeLabels[type] || type}
            </h4>
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface-1 border border-border-DEFAULT rounded-lg overflow-hidden hover:border-border-strong transition-colors"
                >
                  {/* Document Row */}
                  <div
                    className={`p-5 border-l-4 cursor-pointer ${getLeftBorderColor(doc)}`}
                    onClick={() => toggleExpand(doc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{getStatusIcon(doc)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileText className="w-4 h-4 text-text-muted" />
                          <h5 className="text-text-primary font-medium truncate">
                            {doc.title}
                          </h5>
                          {getStatusBadge(doc)}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-text-tertiary">
                          <span>{doc.fileName}</span>
                          {doc.responsiblePartyName && (
                            <span>{doc.responsiblePartyName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'pending' && onUpload && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Upload className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUploadModal(doc);
                            }}
                          >
                            Upload
                          </Button>
                        )}
                        {doc.signatures.length > 0 && (
                          <span className="text-xs text-text-tertiary">
                            {doc.signatures.filter((s) => s.status === 'signed').length}/
                            {doc.signatures.length} signed
                          </span>
                        )}
                        {doc.linkedConditions.length > 0 && (
                          <span className="text-xs text-text-tertiary flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            {doc.linkedConditions.length}
                          </span>
                        )}
                        {expandedDoc === doc.id ? (
                          <ChevronDown className="w-4 h-4 text-text-tertiary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-text-tertiary" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedDoc === doc.id && (
                    <div className="px-5 pb-5 bg-surface-2/50 border-t border-border-DEFAULT">
                      {doc.signatures.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-xs text-text-tertiary uppercase tracking-wider mb-2">
                            Signatures
                          </h6>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {doc.signatures.map((sig) => (
                              <div
                                key={sig.id}
                                className={`p-2 rounded-md border ${
                                  sig.status === 'signed'
                                    ? 'border-success/30 bg-success/10'
                                    : sig.status === 'requested'
                                    ? 'border-warning/30 bg-warning/10'
                                    : sig.status === 'declined'
                                    ? 'border-danger/30 bg-danger/10'
                                    : 'border-border-DEFAULT bg-surface-1'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {sig.status === 'signed' ? (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-text-tertiary" />
                                  )}
                                  <span className="text-sm text-text-primary truncate">
                                    {sig.partyName}
                                  </span>
                                </div>
                                <div className="text-xs text-text-tertiary mt-1 truncate">
                                  {sig.signatoryName}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {doc.linkedConditions.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-xs text-text-tertiary uppercase tracking-wider mb-2">
                            Satisfies Conditions
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {doc.linkedConditions.map((cpId) => (
                              <span
                                key={cpId}
                                className="px-2 py-1 bg-surface-2 rounded text-xs text-text-secondary"
                              >
                                {cpId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          No documents match the current filter.
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Document"
        size="md"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="bg-surface-2 rounded-lg p-4 border border-border-DEFAULT">
              <p className="text-sm text-text-tertiary">Uploading for:</p>
              <p className="text-text-primary font-medium mt-1">{selectedDocument.title}</p>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${
                  dragOver
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-border-strong hover:border-gold-500/50 hover:bg-surface-2'
                }
              `}
            >
              <Upload className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-gold-500' : 'text-text-muted'}`} />
              <p className="text-text-primary font-medium">
                Drop file here or click to browse
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                PDF, DOCX, or other document formats
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xlsx,.xls,.txt"
              />
            </div>

            <div className="text-sm text-text-tertiary">
              <p>For this demo, the file will not actually be stored. Only the filename will be recorded.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DocumentTracker;
