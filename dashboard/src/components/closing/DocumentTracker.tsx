/**
 * DocumentTracker Component
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
    if (doc.status === 'executed') {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (doc.status === 'uploaded') {
      return <Upload className="w-5 h-5 text-blue-400" />;
    }
    if (doc.isOverdue) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    return <Clock className="w-5 h-5 text-amber-400" />;
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.status === 'executed') {
      return <Badge variant="success" size="sm">Executed</Badge>;
    }
    if (doc.status === 'uploaded') {
      return <Badge variant="info" size="sm">Uploaded</Badge>;
    }
    if (doc.isOverdue) {
      return <Badge variant="danger" size="sm">Overdue</Badge>;
    }
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleExpand = (docId: string) => {
    setExpandedDoc(expandedDoc === docId ? null : docId);
  };

  // Group documents by type
  const groupedDocs = filteredDocs.reduce((groups, doc) => {
    const type = doc.documentType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  // Stats
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
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
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
                  ? 'bg-accent-500/20 text-accent-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-sm">
          <span className="text-emerald-400">{stats.uploaded} uploaded</span>
          <span className="text-amber-400">{stats.pending} pending</span>
          {stats.overdue > 0 && (
            <span className="text-red-400">{stats.overdue} overdue</span>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {Object.entries(groupedDocs).map(([type, docs]) => (
          <div key={type}>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              {documentTypeLabels[type] || type}
            </h4>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-800/50 rounded-lg overflow-hidden"
                >
                  {/* Document Row */}
                  <div
                    className={`p-4 border-l-4 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                      doc.status === 'executed'
                        ? 'border-l-emerald-500'
                        : doc.status === 'uploaded'
                        ? 'border-l-blue-500'
                        : doc.isOverdue
                        ? 'border-l-red-500'
                        : 'border-l-amber-500'
                    }`}
                    onClick={() => toggleExpand(doc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{getStatusIcon(doc)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <h5 className="text-white font-medium truncate">
                            {doc.title}
                          </h5>
                          {getStatusBadge(doc)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
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
                        {/* Upload button for pending documents */}
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
                          <span className="text-xs text-slate-400">
                            {doc.signatures.filter((s) => s.status === 'signed').length}/
                            {doc.signatures.length} signed
                          </span>
                        )}
                        {doc.linkedConditions.length > 0 && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            {doc.linkedConditions.length}
                          </span>
                        )}
                        {expandedDoc === doc.id ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedDoc === doc.id && (
                    <div className="px-4 pb-4 bg-slate-900/50 border-t border-slate-700">
                      {/* Signatures */}
                      {doc.signatures.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                            Signatures
                          </h6>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {doc.signatures.map((sig) => (
                              <div
                                key={sig.id}
                                className={`p-2 rounded border ${
                                  sig.status === 'signed'
                                    ? 'border-emerald-500/30 bg-emerald-500/10'
                                    : sig.status === 'requested'
                                    ? 'border-amber-500/30 bg-amber-500/10'
                                    : sig.status === 'declined'
                                    ? 'border-red-500/30 bg-red-500/10'
                                    : 'border-slate-600 bg-slate-800/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {sig.status === 'signed' ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-slate-400" />
                                  )}
                                  <span className="text-sm text-white truncate">
                                    {sig.partyName}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1 truncate">
                                  {sig.signatoryName}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Linked Conditions */}
                      {doc.linkedConditions.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                            Satisfies Conditions
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {doc.linkedConditions.map((cpId) => (
                              <span
                                key={cpId}
                                className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
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
        <div className="text-center py-8 text-slate-400">
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
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Uploading for:</p>
              <p className="text-white font-medium mt-1">{selectedDocument.title}</p>
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
                    ? 'border-accent-500 bg-accent-500/10'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                }
              `}
            >
              <Upload className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-accent-400' : 'text-slate-500'}`} />
              <p className="text-white font-medium">
                Drop file here or click to browse
              </p>
              <p className="text-sm text-slate-400 mt-1">
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

            <div className="text-sm text-slate-400">
              <p>For this demo, the file will not actually be stored. Only the filename will be recorded.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DocumentTracker;
