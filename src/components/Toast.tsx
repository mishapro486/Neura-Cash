import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, Loader2, X, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import { NEURA_TESTNET, TOAST_DURATION } from '../config/constants';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'pending';
    title: string;
    message: string;
    txHash?: string;
  };
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    if (toast.type !== 'pending') {
      const timer = setTimeout(onClose, TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [toast.type, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-error" />,
    info: <Info className="w-5 h-5 text-primary-light" />,
    pending: <Loader2 className="w-5 h-5 text-warning animate-spin" />,
  };

  const bgColors = {
    success: 'border-success/30 bg-success/10',
    error: 'border-error/30 bg-error/10',
    info: 'border-primary/30 bg-primary/10',
    pending: 'border-warning/30 bg-warning/10',
  };

  return (
    <div
      className={`glass-strong rounded-xl p-4 border ${bgColors[toast.type]} toast-enter shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{toast.title}</p>
          <p className="text-slate-400 text-sm mt-0.5">{toast.message}</p>
          {toast.txHash && (
            <a
              href={`${NEURA_TESTNET.blockExplorer}/tx/${toast.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-primary-light hover:text-primary transition-colors"
            >
              View on Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
