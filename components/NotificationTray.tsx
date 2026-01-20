
import React from 'react';
import { 
  X, 
  Bell, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Trash2,
  Clock
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationTrayProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClear: () => void;
}

export const NotificationTray: React.FC<NotificationTrayProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onClear 
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      {/* Tray */}
      <div className={`fixed top-8 bottom-0 w-80 z-[80] custom-glass border-l border-slate-800 transition-all duration-500 ease-in-out transform shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } right-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 custom-accent" />
              <h2 className="font-bold text-white tracking-tight">System Events</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.map((n) => (
              <div key={n.id} className={`p-5 space-y-2 transition-colors hover:bg-white/[0.02] ${!n.read ? 'bg-[rgb(var(--accent-rgb))]/[0.03]' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getIcon(n.type)}
                    <span className="text-xs font-bold text-slate-200">{n.title}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {n.message}
                </p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <Bell className="w-8 h-8 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400">No events found</h3>
                  <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Logs are currently empty</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-slate-800">
              <button 
                onClick={onClear}
                className="w-full py-3 custom-rounded flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Sanitize Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
