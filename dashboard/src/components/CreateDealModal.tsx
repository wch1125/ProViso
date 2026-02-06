/**
 * Create Deal Modal
 *
 * Two-track deal creation:
 * 1. "Blank" — Fill in basic deal info and start from scratch
 * 2. "From Template" — Pick a deal template and customize parameters
 */

import { useState } from 'react';
import {
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  FileCode,
  FileText,
} from 'lucide-react';
import { Modal } from './base/Modal';
import { Button } from './base/Button';
import { Input } from './base/Input';
import { Select } from './base/Select';
import { TemplatePicker } from './templates';
import type { CreateDealInput } from '../context/DealContext';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateDealInput) => void;
}

const dealTypeOptions = [
  { value: 'corporate', label: 'Corporate Facility' },
  { value: 'project_finance', label: 'Project Finance' },
];

const facilityAmountOptions = [
  { value: '25000000', label: '$25,000,000' },
  { value: '50000000', label: '$50,000,000' },
  { value: '75000000', label: '$75,000,000' },
  { value: '100000000', label: '$100,000,000' },
  { value: '150000000', label: '$150,000,000' },
  { value: '200000000', label: '$200,000,000' },
  { value: '250000000', label: '$250,000,000' },
  { value: '500000000', label: '$500,000,000' },
];

type CreateMode = 'choose' | 'blank' | 'template';

export function CreateDealModal({ isOpen, onClose, onSubmit }: CreateDealModalProps) {
  const [mode, setMode] = useState<CreateMode>('choose');

  // Blank form state
  const [name, setName] = useState('');
  const [dealType, setDealType] = useState<'corporate' | 'project_finance'>('corporate');
  const [facilityAmount, setFacilityAmount] = useState('100000000');
  const [borrowerName, setBorrowerName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [targetClosingDate, setTargetClosingDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmitBlank = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Deal name is required';
    }
    if (!borrowerName.trim()) {
      newErrors.borrowerName = 'Borrower name is required';
    }
    if (!facilityAmount) {
      newErrors.facilityAmount = 'Facility amount is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const input: CreateDealInput = {
      name: name.trim(),
      dealType,
      facilityAmount: parseInt(facilityAmount, 10),
      borrowerName: borrowerName.trim(),
      agentName: agentName.trim() || undefined,
      targetClosingDate: targetClosingDate ? new Date(targetClosingDate) : null,
    };

    onSubmit(input);
    handleClose();
  };

  const handleTemplateSelect = (templateId: string, values: Record<string, unknown>) => {
    // Map template values to CreateDealInput
    const templateNameMap: Record<string, string> = {
      'corporate-revolver': 'Corporate Revolving Credit Facility',
      'term-loan-b': 'Term Loan B',
      'project-finance': 'Project Finance Facility',
      'real-estate': 'Commercial Real Estate Loan',
    };

    const templateDealTypeMap: Record<string, 'corporate' | 'project_finance'> = {
      'corporate-revolver': 'corporate',
      'term-loan-b': 'corporate',
      'project-finance': 'project_finance',
      'real-estate': 'corporate',
    };

    const borrower =
      (values.borrowerName as string) ||
      (values.projectName as string) ||
      (values.propertyName as string) ||
      'New Deal';

    const amount =
      (values.facilityAmount as number) ||
      (values.loanAmount as number) ||
      100_000_000;

    const input: CreateDealInput = {
      name: `${borrower} — ${templateNameMap[templateId] || 'Deal'}`,
      dealType: templateDealTypeMap[templateId] || 'corporate',
      facilityAmount: amount,
      borrowerName: borrower,
      targetClosingDate: null,
    };

    onSubmit(input);
    handleClose();
  };

  const handleClose = () => {
    setMode('choose');
    setName('');
    setDealType('corporate');
    setFacilityAmount('100000000');
    setBorrowerName('');
    setAgentName('');
    setTargetClosingDate('');
    setErrors({});
    onClose();
  };

  const modalSize = mode === 'template' ? 'xl' : 'lg';

  const footer =
    mode === 'blank' ? (
      <>
        <Button variant="ghost" onClick={() => setMode('choose')}>
          Back
        </Button>
        <Button type="submit" form="create-deal-form">
          Create Deal
        </Button>
      </>
    ) : mode === 'choose' ? (
      <Button variant="ghost" onClick={handleClose}>
        Cancel
      </Button>
    ) : null; // Template mode handles its own actions

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === 'choose'
          ? 'Create New Deal'
          : mode === 'blank'
          ? 'Create Blank Deal'
          : 'Choose a Template'
      }
      size={modalSize}
      footer={footer}
    >
      {/* Mode: Choose */}
      {mode === 'choose' && (
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">
            How would you like to start your new deal?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Blank deal */}
            <button
              onClick={() => setMode('blank')}
              className="group text-left"
            >
              <div className="p-6 rounded-xl border border-border-default hover:border-gold-500/50 bg-surface-1 hover:bg-surface-2 transition-all duration-200 h-full">
                <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center mb-4 group-hover:bg-gold-500/10 transition-colors">
                  <FileText className="w-5 h-5 text-text-tertiary group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Blank Deal
                </h3>
                <p className="text-sm text-text-tertiary">
                  Start from scratch with basic deal information. Build your agreement manually.
                </p>
              </div>
            </button>

            {/* From template */}
            <button
              onClick={() => setMode('template')}
              className="group text-left"
            >
              <div className="p-6 rounded-xl border border-gold-500/30 hover:border-gold-500/60 bg-surface-1 hover:bg-surface-2 transition-all duration-200 h-full relative overflow-hidden">
                {/* Gold accent gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center mb-4">
                    <FileCode className="w-5 h-5 text-gold-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary">
                      From Template
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-500 bg-gold-500/10 px-1.5 py-0.5 rounded">
                      New
                    </span>
                  </div>
                  <p className="text-sm text-text-tertiary">
                    Pick a proven deal structure. Get a complete .proviso file with covenants, baskets,
                    and events.
                  </p>
                  <div className="mt-3 text-xs text-gold-500">
                    4 templates available →
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mode: Blank */}
      {mode === 'blank' && (
        <form id="create-deal-form" onSubmit={handleSubmitBlank} className="space-y-6">
          {/* Deal Name */}
          <div>
            <Input
              label="Deal Name"
              placeholder="ABC Acquisition Facility"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              icon={<Briefcase className="w-4 h-4" />}
            />
          </div>

          {/* Deal Type and Amount Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Facility Type
              </label>
              <Select
                value={dealType}
                onChange={(e) =>
                  setDealType(e.target.value as 'corporate' | 'project_finance')
                }
                options={dealTypeOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Facility Amount
              </label>
              <Select
                value={facilityAmount}
                onChange={(e) => {
                  setFacilityAmount(e.target.value);
                  if (errors.facilityAmount)
                    setErrors((prev) => ({ ...prev, facilityAmount: '' }));
                }}
                options={facilityAmountOptions}
                error={errors.facilityAmount}
              />
            </div>
          </div>

          {/* Borrower and Agent Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Borrower Name"
                placeholder="ABC Holdings, Inc."
                value={borrowerName}
                onChange={(e) => {
                  setBorrowerName(e.target.value);
                  if (errors.borrowerName)
                    setErrors((prev) => ({ ...prev, borrowerName: '' }));
                }}
                error={errors.borrowerName}
                icon={<Building2 className="w-4 h-4" />}
              />
            </div>
            <div>
              <Input
                label="Administrative Agent"
                placeholder="First National Bank"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                helpText="Optional"
                icon={<DollarSign className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Target Closing Date */}
          <div className="w-1/2">
            <Input
              type="date"
              label="Target Closing Date"
              value={targetClosingDate}
              onChange={(e) => setTargetClosingDate(e.target.value)}
              helpText="Optional"
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Template Suggestion */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-gold-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">
                  {dealType === 'corporate'
                    ? 'Corporate Facility'
                    : 'Project Finance'}{' '}
                  Template
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  {dealType === 'corporate'
                    ? 'Starts with standard corporate covenants: leverage ratio, interest coverage, and investment baskets.'
                    : 'Starts with project finance structure: phases, milestones, reserves, and waterfall distribution.'}
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Mode: Template */}
      {mode === 'template' && (
        <TemplatePicker
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setMode('choose')}
        />
      )}
    </Modal>
  );
}

export default CreateDealModal;
