import { CheckCircle2, Clock, XCircle, MinusCircle, FileCheck } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import { StatusBadge } from './StatusBadge';
import type { CPChecklistData, CPItemData } from '../types';

interface CPChecklistProps {
  checklists: CPChecklistData[];
}

export function CPChecklist({ checklists }: CPChecklistProps) {
  return (
    <Card>
      <CardHeader
        title="Conditions Precedent"
        subtitle="Draw eligibility checklists"
      />
      <CardBody className="p-0 space-y-0 divide-y divide-border-DEFAULT">
        {checklists.map((checklist) => (
          <ChecklistSection key={checklist.name} checklist={checklist} />
        ))}
      </CardBody>
    </Card>
  );
}

interface ChecklistSectionProps {
  checklist: CPChecklistData;
}

function ChecklistSection({ checklist }: ChecklistSectionProps) {
  const { name, section, conditions } = checklist;

  const satisfied = conditions.filter(c => c.status === 'satisfied').length;
  const pending = conditions.filter(c => c.status === 'pending').length;
  const waived = conditions.filter(c => c.status === 'waived').length;
  const isComplete = pending === 0;

  return (
    <div className="p-5">
      {/* Checklist Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isComplete ? 'bg-success/10' : 'bg-warning/10'
          }`}>
            <FileCheck className={`w-5 h-5 ${
              isComplete ? 'text-success' : 'text-warning'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">{name}</h3>
            {section && (
              <p className="text-xs text-text-muted">Section {section}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">
              {satisfied}/{conditions.length}
            </p>
            <p className="text-xs text-text-muted">
              {waived > 0 && `${waived} waived`}
            </p>
          </div>
          <StatusBadge
            status={isComplete ? 'compliant' : 'pending'}
            label={isComplete ? 'Ready' : `${pending} pending`}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-4">
        <div
          className={`progress-bar-fill ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-600 to-success'
              : 'bg-gradient-to-r from-gold-600 to-gold-500'
          }`}
          style={{ width: `${(satisfied / conditions.length) * 100}%` }}
        />
      </div>

      {/* Conditions List */}
      <div className="space-y-2">
        {conditions.map((condition) => (
          <CPItemRow key={condition.name} item={condition} />
        ))}
      </div>
    </div>
  );
}

interface CPItemRowProps {
  item: CPItemData;
}

function CPItemRow({ item }: CPItemRowProps) {
  const { name, description, responsible, status } = item;

  const getIcon = () => {
    switch (status) {
      case 'satisfied':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'waived':
        return <MinusCircle className="w-4 h-4 text-text-muted" />;
      case 'not_applicable':
        return <XCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'satisfied':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-2 rounded-lg ${
      status === 'pending' ? 'bg-warning/5' : ''
    }`}>
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm ${
              status === 'satisfied'
                ? 'text-text-tertiary line-through'
                : status === 'pending'
                ? 'text-text-primary'
                : 'text-text-muted'
            }`}>
              {name}
            </p>
            {description && status === 'pending' && (
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {responsible && (
            <span className={`text-xs whitespace-nowrap ${getStatusColor()}`}>
              {responsible}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
