/**
 * Draw Request List
 *
 * Displays a list of draw requests with status tracking.
 * Shows the full pipeline from draft to funded.
 */
import { Banknote, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '../base';

interface DrawCondition {
  conditionId: string;
  title: string;
  status: 'pending' | 'satisfied' | 'waived';
}

interface DrawRequest {
  id: string;
  drawNumber: number;
  requestedAmount: number;
  approvedAmount: number | null;
  fundedAmount: number | null;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'funded' | 'rejected';
  requestedAt: Date | string;
  approvedAt: Date | string | null;
  fundedAt: Date | string | null;
  conditions: DrawCondition[];
}

interface DrawRequestListProps {
  requests: DrawRequest[];
  onViewDetails?: (id: string) => void;
  onAction?: (id: string, action: 'submit' | 'approve' | 'reject' | 'fund') => void;
  className?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date | string | null): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusBadge = (status: DrawRequest['status']) => {
  const config: Record<DrawRequest['status'], { variant: 'success' | 'warning' | 'danger' | 'info' | 'muted'; label: string }> = {
    draft: { variant: 'muted', label: 'Draft' },
    submitted: { variant: 'info', label: 'Submitted' },
    under_review: { variant: 'warning', label: 'Under Review' },
    approved: { variant: 'success', label: 'Approved' },
    funded: { variant: 'success', label: 'Funded' },
    rejected: { variant: 'danger', label: 'Rejected' },
  };
  return config[status];
};

const getStatusIcon = (status: DrawRequest['status']) => {
  switch (status) {
    case 'draft':
      return <FileText className="h-4 w-4 text-text-tertiary" />;
    case 'submitted':
    case 'under_review':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'approved':
    case 'funded':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-danger" />;
    default:
      return <AlertCircle className="h-4 w-4 text-text-tertiary" />;
  }
};

export function DrawRequestList({
  requests,
  onViewDetails,
  onAction,
  className = '',
}: DrawRequestListProps) {
  const totalRequested = requests.reduce((sum, r) => sum + r.requestedAmount, 0);
  const totalFunded = requests.reduce((sum, r) => sum + (r.fundedAmount ?? 0), 0);
  const pendingCount = requests.filter(
    (r) => r.status === 'draft' || r.status === 'submitted' || r.status === 'under_review'
  ).length;

  return (
    <div className={`bg-surface-1 rounded-lg border border-border-DEFAULT ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border-DEFAULT">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/10 rounded-lg">
              <Banknote className="h-5 w-5 text-gold-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Draw Requests</h3>
              <p className="text-sm text-text-tertiary">
                {requests.length} request{requests.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-text-tertiary">Requested</div>
              <div className="text-lg font-semibold text-white">{formatCurrency(totalRequested)}</div>
            </div>
            <div>
              <div className="text-sm text-text-tertiary">Funded</div>
              <div className="text-lg font-semibold text-success">{formatCurrency(totalFunded)}</div>
            </div>
            <div>
              <div className="text-sm text-text-tertiary">Pending</div>
              <div className="text-lg font-semibold text-warning">{pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="divide-y divide-border-DEFAULT">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary">
            No draw requests yet
          </div>
        ) : (
          requests.map((request) => {
            const statusConfig = getStatusBadge(request.status);
            const conditionsSatisfied = request.conditions.filter(
              (c) => c.status === 'satisfied' || c.status === 'waived'
            ).length;

            return (
              <div
                key={request.id}
                className="p-4 hover:bg-surface-2/50 transition-colors cursor-pointer"
                onClick={() => onViewDetails?.(request.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          Draw #{request.drawNumber}
                        </span>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-text-tertiary mt-1">
                        Requested: {formatDate(request.requestedAt)}
                        {request.approvedAt && ` • Approved: ${formatDate(request.approvedAt)}`}
                        {request.fundedAt && ` • Funded: ${formatDate(request.fundedAt)}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatCurrency(request.requestedAmount)}
                    </div>
                    {request.fundedAmount && request.fundedAmount !== request.requestedAmount && (
                      <div className="text-sm text-success">
                        Funded: {formatCurrency(request.fundedAmount)}
                      </div>
                    )}
                    {request.conditions.length > 0 && (
                      <div className="text-sm text-text-tertiary mt-1">
                        {conditionsSatisfied}/{request.conditions.length} conditions met
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {onAction && (
                  <div className="mt-3 flex items-center gap-2">
                    {request.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(request.id, 'submit');
                        }}
                        className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"
                      >
                        Submit
                      </button>
                    )}
                    {request.status === 'under_review' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction(request.id, 'approve');
                          }}
                          className="px-3 py-1 text-sm bg-success/10 text-success rounded hover:bg-success/20 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction(request.id, 'reject');
                          }}
                          className="px-3 py-1 text-sm bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(request.id, 'fund');
                        }}
                        className="px-3 py-1 text-sm bg-gold-500/10 text-gold-400 rounded hover:bg-gold-500/20 transition-colors"
                      >
                        Mark Funded
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DrawRequestList;
