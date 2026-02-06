/**
 * Toast Component
 *
 * Displays notification toasts with auto-dismiss functionality.
 */

import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import type { Toast as ToastType } from '../../context/ClosingContext';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertCircle,
  error: XCircle,
};

const colorMap = {
  success: 'border-success bg-success/10 text-success',
  info: 'border-info bg-info/10 text-info',
  warning: 'border-warning bg-warning/10 text-warning',
  error: 'border-danger bg-danger/10 text-danger',
};

const iconColorMap = {
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-danger',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = iconMap[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${colorMap[toast.type]}
        animate-slide-in-right
        shadow-lg
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColorMap[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-text-secondary mt-1 truncate">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-text-tertiary" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
