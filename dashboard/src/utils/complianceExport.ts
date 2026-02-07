/**
 * Compliance Export Utilities
 *
 * Generate compliance reports and export data for the Monitoring Dashboard.
 * Includes PDF-ready HTML and JSON export formats.
 */

import type { DashboardData, CovenantData, MilestoneData, ReserveData } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface FullExportData {
  exportedAt: string;
  version: string;
  project: {
    name: string;
    facility: string;
    sponsor: string;
    borrower: string;
  };
  currentPhase: string;
  financials: Record<string, number>;
  covenants: CovenantData[];
  milestones: MilestoneData[];
  reserves: ReserveData[];
  code: string;
}

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCovenantStatusClass(covenant: CovenantData): string {
  if (!covenant.compliant) return 'breach';
  if (covenant.suspended) return 'suspended';
  const headroom = covenant.headroom ?? 100;
  if (headroom < 10) return 'danger';
  if (headroom < 25) return 'warning';
  return 'safe';
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'safe':
      return 'Compliant';
    case 'warning':
      return 'Caution';
    case 'danger':
      return 'At Risk';
    case 'breach':
      return 'Breach';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
}

function getMilestoneStatusLabel(status: string): string {
  switch (status) {
    case 'achieved':
      return 'Achieved';
    case 'in_progress':
      return 'In Progress';
    case 'at_risk':
      return 'At Risk';
    case 'pending':
      return 'Pending';
    case 'breached':
      return 'Breached';
    default:
      return status;
  }
}

// =============================================================================
// COMPLIANCE REPORT GENERATOR
// =============================================================================

export function generateComplianceReport(data: DashboardData): string {
  const now = new Date();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.project.name} - Compliance Certificate</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
      padding: 0.75in;
    }

    /* Header */
    .header {
      text-align: center;
      border-bottom: 2px solid #B8860B;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 18pt;
      font-weight: normal;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 12pt;
      color: #666;
    }

    .header .project-name {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 12px;
      color: #1a2744;
    }

    /* Metadata */
    .metadata {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      font-size: 10pt;
      color: #666;
    }

    .metadata-item {
      text-align: left;
    }

    .metadata-item strong {
      color: #1a1a1a;
    }

    /* Summary Box */
    .summary-box {
      background: #f8f8f6;
      border: 1px solid #e0e0dc;
      border-left: 4px solid #B8860B;
      padding: 16px 20px;
      margin-bottom: 24px;
    }

    .summary-box h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a2744;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .summary-stat {
      text-align: center;
    }

    .summary-stat .value {
      font-size: 18pt;
      font-weight: bold;
      color: #1a2744;
    }

    .summary-stat .label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Section */
    .section {
      margin-bottom: 24px;
    }

    .section h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #1a2744;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }

    th {
      background: #f5f5f3;
      padding: 8px 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #ddd;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    td {
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    /* Status badges */
    .status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .status.safe { background: #dcfce7; color: #166534; }
    .status.warning { background: #fef3c7; color: #92400e; }
    .status.danger { background: #fee2e2; color: #991b1b; }
    .status.breach { background: #991b1b; color: white; }
    .status.suspended { background: #e5e7eb; color: #374151; }
    .status.achieved { background: #dcfce7; color: #166534; }
    .status.in_progress { background: #dbeafe; color: #1e40af; }
    .status.at_risk { background: #fee2e2; color: #991b1b; }
    .status.pending { background: #f3f4f6; color: #6b7280; }

    /* Headroom bar */
    .headroom-bar {
      width: 100px;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }

    .headroom-fill {
      height: 100%;
      border-radius: 4px;
    }

    .headroom-fill.safe { background: #22c55e; }
    .headroom-fill.warning { background: #eab308; }
    .headroom-fill.danger { background: #ef4444; }
    .headroom-fill.breach { background: #dc2626; }

    /* Footer */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
      display: flex;
      justify-content: space-between;
    }

    .footer .branding {
      font-weight: bold;
      color: #B8860B;
    }

    /* Print styles */
    @media print {
      body {
        padding: 0;
      }

      .section {
        page-break-inside: avoid;
      }

      @page {
        margin: 0.75in;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>Compliance Certificate</h1>
    <div class="subtitle">Quarterly Financial Covenant Certification</div>
    <div class="project-name">${data.project.name}</div>
  </div>

  <!-- Metadata -->
  <div class="metadata">
    <div class="metadata-item">
      <strong>Facility:</strong> ${data.project.facility}
    </div>
    <div class="metadata-item">
      <strong>Borrower:</strong> ${data.project.borrower || data.project.sponsor}
    </div>
    <div class="metadata-item">
      <strong>Date:</strong> ${formatDate(now)}
    </div>
    <div class="metadata-item">
      <strong>Phase:</strong> ${data.phase.current}
    </div>
  </div>

  <!-- Summary -->
  <div class="summary-box">
    <h2>Executive Summary</h2>
    <div class="summary-grid">
      <div class="summary-stat">
        <div class="value">${data.covenants.filter(c => c.compliant && !c.suspended).length}/${data.covenants.filter(c => !c.suspended).length}</div>
        <div class="label">Covenants Passing</div>
      </div>
      <div class="summary-stat">
        <div class="value">${data.milestones.filter(m => m.status === 'achieved').length}/${data.milestones.length}</div>
        <div class="label">Milestones Achieved</div>
      </div>
      <div class="summary-stat">
        <div class="value">${data.reserves.length > 0 ? formatPercent((data.reserves.reduce((sum, r) => sum + r.balance, 0) / data.reserves.reduce((sum, r) => sum + r.target, 0)) * 100) : 'N/A'}</div>
        <div class="label">Reserve Funding</div>
      </div>
      <div class="summary-stat">
        <div class="value">${data.conditionsPrecedent.reduce((sum, cp) => sum + cp.conditions.filter(c => c.status === 'satisfied' || c.status === 'waived').length, 0)}/${data.conditionsPrecedent.reduce((sum, cp) => sum + cp.conditions.length, 0)}</div>
        <div class="label">CPs Satisfied</div>
      </div>
    </div>
  </div>

  <!-- Covenants -->
  <div class="section">
    <h2>Financial Covenants</h2>
    <table>
      <thead>
        <tr>
          <th>Covenant</th>
          <th>Actual</th>
          <th>Required</th>
          <th>Headroom</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.covenants.map(covenant => {
          const status = getCovenantStatusClass(covenant);
          const headroomPercent = Math.min(100, Math.max(0, covenant.headroom ?? 0));
          return `
            <tr>
              <td><strong>${covenant.name}</strong></td>
              <td>${formatRatio(covenant.actual)}</td>
              <td>${covenant.operator} ${formatRatio(covenant.required)}</td>
              <td>
                <div class="headroom-bar">
                  <div class="headroom-fill ${status}" style="width: ${headroomPercent}%"></div>
                </div>
                ${formatPercent(covenant.headroom ?? 0)}
              </td>
              <td><span class="status ${status}">${getStatusLabel(status)}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  ${data.milestones.length > 0 ? `
  <!-- Milestones -->
  <div class="section">
    <h2>Construction Milestones</h2>
    <table>
      <thead>
        <tr>
          <th>Milestone</th>
          <th>Target Date</th>
          <th>Longstop Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.milestones.map(milestone => `
          <tr>
            <td><strong>${milestone.name}</strong></td>
            <td>${milestone.target || 'TBD'}</td>
            <td>${milestone.longstop || 'TBD'}</td>
            <td><span class="status ${milestone.status}">${getMilestoneStatusLabel(milestone.status)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${data.reserves.length > 0 ? `
  <!-- Reserves -->
  <div class="section">
    <h2>Reserve Accounts</h2>
    <table>
      <thead>
        <tr>
          <th>Reserve</th>
          <th>Balance</th>
          <th>Target</th>
          <th>Minimum</th>
          <th>Funding %</th>
        </tr>
      </thead>
      <tbody>
        ${data.reserves.map(reserve => {
          const fundingPct = (reserve.balance / reserve.target) * 100;
          return `
            <tr>
              <td><strong>${reserve.name}</strong></td>
              <td>${formatCurrency(reserve.balance)}</td>
              <td>${formatCurrency(reserve.target)}</td>
              <td>${formatCurrency(reserve.minimum)}</td>
              <td>${formatPercent(fundingPct)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <div>
      This certificate was automatically generated from ProViso compliance data.
    </div>
    <div class="branding">
      ProViso | proviso-demo.haslun.online
    </div>
  </div>
</body>
</html>
`;
}

// =============================================================================
// JSON EXPORT
// =============================================================================

export function generateFullExport(
  data: DashboardData,
  code: string,
  financials: Record<string, number>
): FullExportData {
  return {
    exportedAt: new Date().toISOString(),
    version: '2.3.0',
    project: {
      name: data.project.name,
      facility: data.project.facility,
      sponsor: data.project.sponsor,
      borrower: data.project.borrower,
    },
    currentPhase: data.phase.current,
    financials,
    covenants: data.covenants,
    milestones: data.milestones,
    reserves: data.reserves,
    code,
  };
}

// =============================================================================
// FILE DOWNLOAD
// =============================================================================

export function downloadAsFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): boolean {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to download file:', err);
    return false;
  }
}
