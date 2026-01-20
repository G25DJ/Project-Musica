
import React, { useEffect } from 'react';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastType = 'info' | 'error' | 'success';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toaster: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    info: 'bg-slate-900 border-indigo-500/50 text-indigo-400',
    error: 'bg-slate-900 border-rose-500/50 text-rose-400',
    success: 'bg-slate-900 border-emerald-500/50 text-emerald-400',
  };

  const Icons = {
    info: Info,
    error: AlertCircle,
    success: CheckCircle2,
  };

  const Icon = Icons[type];

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300 ${styles[type]}`}>
      <Icon className="w-6 h-6" />
      <div className="flex-1 pr-4">
        <p className="font-bold text-sm uppercase tracking-wider">{type === 'error' ? 'Database Error' : 'System Message'}</p>
        <p className="text-slate-300 text-sm mt-0.5">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
