/**
 * Create Deal Modal
 *
 * Form for creating a new deal with basic information:
 * - Deal name
 * - Facility type and amount
 * - Borrower name
 * - Target closing date
 */

import { useState } from 'react';
import { Briefcase, Building2, DollarSign, Calendar } from 'lucide-react';
import { Modal } from './base/Modal';
import { Button } from './base/Button';
import { Input } from './base/Input';
import { Select } from './base/Select';
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

export function CreateDealModal({ isOpen, onClose, onSubmit }: CreateDealModalProps) {
  const [name, setName] = useState('');
  const [dealType, setDealType] = useState<'corporate' | 'project_finance'>('corporate');
  const [facilityAmount, setFacilityAmount] = useState('100000000');
  const [borrowerName, setBorrowerName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [targetClosingDate, setTargetClosingDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
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

  const handleClose = () => {
    // Reset form
    setName('');
    setDealType('corporate');
    setFacilityAmount('100000000');
    setBorrowerName('');
    setAgentName('');
    setTargetClosingDate('');
    setErrors({});
    onClose();
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={handleClose}>
        Cancel
      </Button>
      <Button type="submit" form="create-deal-form">
        Create Deal
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Deal"
      size="lg"
      footer={footer}
    >
      <form id="create-deal-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Name */}
        <div>
          <Input
            label="Deal Name"
            placeholder="ABC Acquisition Facility"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
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
              onChange={(e) => setDealType(e.target.value as 'corporate' | 'project_finance')}
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
                if (errors.facilityAmount) setErrors(prev => ({ ...prev, facilityAmount: '' }));
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
                if (errors.borrowerName) setErrors(prev => ({ ...prev, borrowerName: '' }));
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
                {dealType === 'corporate' ? 'Corporate Facility' : 'Project Finance'} Template
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
    </Modal>
  );
}

export default CreateDealModal;
