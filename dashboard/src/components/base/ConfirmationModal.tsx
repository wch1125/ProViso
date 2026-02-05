/**
 * ConfirmationModal - Dialog for confirming important actions
 *
 * Presents a modal dialog asking the user to confirm or cancel an action.
 * Supports different variants for destructive vs standard confirmations.
 */
import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  loading?: boolean;
  /** Additional details shown below the main message */
  details?: string[];
}

const variantConfig = {
  default: {
    icon: Info,
    iconBg: 'bg-accent-500/20',
    iconColor: 'text-accent-400',
    buttonVariant: 'primary' as const,
  },
  danger: {
    icon: XCircle,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    buttonVariant: 'gold' as const,
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  details,
}: ConfirmationModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <div className="text-sm text-slate-400 mb-4">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* Details list */}
        {details && details.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-3 mb-4 text-left">
            <ul className="text-sm text-slate-400 space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-slate-600 mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * DeleteConfirmation - Pre-configured for delete actions
 */
export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="danger"
      title={`Delete ${itemType}?`}
      message={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      }
      confirmLabel="Delete"
      cancelLabel="Keep"
      loading={loading}
    />
  );
}

/**
 * SubmitConfirmation - Pre-configured for submission actions
 */
export function SubmitConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="warning"
      title={title}
      message={message}
      confirmLabel="Submit"
      cancelLabel="Go Back"
      loading={loading}
    />
  );
}
