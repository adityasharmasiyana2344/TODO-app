import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/todo';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200/90 bg-white text-slate-800 shadow-emerald-500/10',
    error: 'border-rose-200/90 bg-white text-slate-800 shadow-rose-500/10',
    info: 'border-indigo-200/90 bg-white text-slate-800 shadow-indigo-500/10',
  };

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-start space-x-3 animate-in slide-in-from-bottom-3 duration-200 ${
        borders[toast.type]
      }`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-bold text-slate-900 leading-snug">{toast.title}</h5>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
