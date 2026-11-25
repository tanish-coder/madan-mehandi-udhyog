import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

type Variant = 'danger' | 'warning';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: Variant;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  loading?: boolean;
}

const variantConfig: Record<Variant, {
  iconBg: string;
  iconColor: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  btnClass: string;
}> = {
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: Trash2,
    btnClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
    btnClass: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
  },
};

/**
 * Modal confirmation dialog — used for deletions and destructive actions.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  loading = false,
}) => {
  const actualConfirmLabel = confirmLabel || confirmText || (variant === 'danger' ? 'Delete' : 'Confirm');
  const actualCancelLabel = cancelLabel || cancelText || 'Cancel';
  const cfg = variantConfig[variant];
  const confirmRef = useRef<HTMLButtonElement>(null);

  const defaultConfirmLabel = variant === 'danger' ? 'Delete' : 'Confirm';

  // Auto-focus confirm button when opened, trap focus within dialog
  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[fadeInScale_0.18s_ease-out]">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={`mx-auto mb-4 w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center`}>
          <cfg.Icon size={22} className={cfg.iconColor} />
        </div>

        {/* Content */}
        <h2
          id="confirm-dialog-title"
          className="text-center text-base font-bold text-gray-800 mb-2"
        >
          {title}
        </h2>
        <p className="text-center text-sm text-gray-500 leading-relaxed mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {actualCancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${cfg.btnClass}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              actualConfirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
