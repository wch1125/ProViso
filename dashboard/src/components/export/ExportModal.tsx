/**
 * Export Modal for Monitoring Dashboard
 *
 * Provides export options:
 * 1. Compliance Certificate (PDF via browser print)
 * 2. Credit Agreement (Word/Text document)
 * 3. Raw Data (JSON export)
 * 4. ProViso Code (.proviso file)
 */

import { useState } from 'react';
import {
  FileText,
  FileJson,
  FileCode,
  Printer,
  Download,
  Check,
  Loader2,
} from 'lucide-react';
import { Modal } from '../base/Modal';
import { Button } from '../base/Button';
import type { DashboardData } from '../../types';
import {
  generateComplianceReport,
  generateFullExport,
  downloadAsFile,
} from '../../utils/complianceExport';
import { trackExportDownloaded } from '../../utils/analytics';
import {
  generateWordDocument,
  downloadDocument,
} from '../../utils/wordGenerator';

// =============================================================================
// TYPES
// =============================================================================

interface ExportOption {
  id: 'pdf' | 'word' | 'json' | 'proviso';
  title: string;
  description: string;
  icon: typeof FileText;
  format: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData | null;
  provisoCode: string;
  financials: Record<string, number>;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

const exportOptions: ExportOption[] = [
  {
    id: 'pdf',
    title: 'Compliance Certificate',
    description: 'Print-ready compliance report with covenant status and headroom',
    icon: Printer,
    format: 'PDF',
  },
  {
    id: 'word',
    title: 'Credit Agreement',
    description: 'Legal document with all definitions, covenants, and baskets',
    icon: FileText,
    format: 'TXT',
  },
  {
    id: 'json',
    title: 'Raw Data Export',
    description: 'Complete interpreter state with financials and results',
    icon: FileJson,
    format: 'JSON',
  },
  {
    id: 'proviso',
    title: 'ProViso Source Code',
    description: 'Download the ProViso agreement definition file',
    icon: FileCode,
    format: '.proviso',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function ExportModal({
  isOpen,
  onClose,
  dashboardData,
  provisoCode,
  financials,
}: ExportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());

  const handleExport = async (optionId: string) => {
    if (!dashboardData) return;

    setExporting(optionId);

    try {
      const filename = generateFilename(dashboardData.project.name, optionId);

      switch (optionId) {
        case 'pdf': {
          // Generate compliance report and open print dialog
          const reportHtml = generateComplianceReport(dashboardData);
          openPrintWindow(reportHtml, dashboardData.project.name);
          break;
        }

        case 'word': {
          // Generate Word document
          const doc = generateWordDocument(provisoCode, {
            dealName: dashboardData.project.name,
            facilityAmount: dashboardData.financials.total_project_cost,
          });
          downloadDocument(doc, filename);
          break;
        }

        case 'json': {
          // Export full data as JSON
          const jsonData = generateFullExport(dashboardData, provisoCode, financials);
          downloadAsFile(
            JSON.stringify(jsonData, null, 2),
            filename,
            'application/json'
          );
          break;
        }

        case 'proviso': {
          // Download ProViso source code
          downloadAsFile(provisoCode, filename, 'text/plain');
          break;
        }
      }

      // Track the export event
      trackExportDownloaded(optionId as 'pdf' | 'word' | 'json' | 'proviso');

      // Mark as exported
      setExported(prev => new Set(prev).add(optionId));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  // Reset exported state when modal closes
  const handleClose = () => {
    setExported(new Set());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Export Report"
      size="md"
    >
      <div className="space-y-2">
        {/* Header info */}
        <p className="text-sm text-text-tertiary mb-4">
          Export compliance data and agreement documents for{' '}
          <span className="text-text-secondary font-medium">
            {dashboardData?.project.name || 'this project'}
          </span>
        </p>

        {/* Export options */}
        <div className="space-y-3">
          {exportOptions.map(option => {
            const Icon = option.icon;
            const isExporting = exporting === option.id;
            const isExported = exported.has(option.id);

            return (
              <div
                key={option.id}
                className="
                  group flex items-center gap-4 p-4
                  bg-surface-2 border border-border-subtle rounded-xl
                  hover:border-border-DEFAULT hover:bg-surface-3
                  transition-all duration-150
                "
              >
                {/* Icon */}
                <div
                  className="
                    w-10 h-10 flex items-center justify-center
                    bg-surface-3 border border-border-subtle rounded-lg
                    group-hover:border-gold-600/30 group-hover:bg-gold-600/10
                    transition-all duration-150
                  "
                >
                  <Icon className="w-5 h-5 text-text-tertiary group-hover:text-gold-500 transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-text-primary">
                      {option.title}
                    </h4>
                    <span className="px-1.5 py-0.5 text-xs bg-surface-3 text-text-muted rounded">
                      {option.format}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5 truncate">
                    {option.description}
                  </p>
                </div>

                {/* Action button */}
                <Button
                  variant={isExported ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleExport(option.id)}
                  disabled={isExporting || !dashboardData}
                  icon={
                    isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isExported ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )
                  }
                >
                  {isExporting ? 'Exporting...' : isExported ? 'Downloaded' : 'Export'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Generated by ProViso at {new Date().toLocaleDateString()}
          </p>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function generateFilename(projectName: string, exportType: string): string {
  const sanitized = projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];

  switch (exportType) {
    case 'pdf':
      return `${sanitized}-compliance-${date}.pdf`;
    case 'word':
      return `${sanitized}-credit-agreement-${date}.txt`;
    case 'json':
      return `${sanitized}-export-${date}.json`;
    case 'proviso':
      return `${sanitized}.proviso`;
    default:
      return `${sanitized}-export-${date}`;
  }
}

function openPrintWindow(htmlContent: string, title: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.document.title = `${title} - Compliance Certificate`;

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

export default ExportModal;
