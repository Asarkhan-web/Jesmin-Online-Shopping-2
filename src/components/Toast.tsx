import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types.ts';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none no-print">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700/60 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-rose-900/90 text-white border-rose-700/60 shadow-rose-950/20'
              : toast.type === 'warning'
              ? 'bg-amber-900/90 text-white border-amber-700/60 shadow-amber-950/20'
              : 'bg-slate-900/90 text-white border-slate-700/60 shadow-slate-950/20'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-300" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-300" />}
          </div>
          <div className="flex-1 text-sm font-medium leading-snug">{toast.text}</div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 text-white/70 hover:text-white p-0.5 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
