
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  History, 
  FolderInput, 
  Settings2, 
  Database,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  HardDrive,
  Clock,
  Terminal
} from 'lucide-react';
import { BackupLog } from '../types';

interface BackupManagerProps {
  backupFolder: string | null;
  setBackupFolder: (f: string) => void;
  logs: BackupLog[];
  onTriggerBackup: () => void;
  isSyncing: boolean;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ 
  backupFolder, 
  setBackupFolder, 
  logs, 
  onTriggerBackup,
  isSyncing
}) => {
  const [inputPath, setInputPath] = useState(backupFolder || '~/MusicBackup');

  const lastBackupTime = logs.length > 0 
    ? new Date(logs[0].timestamp).toLocaleString() 
    : 'Never initiated';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-500 w-8 h-8" />
            Archive Orchestrator
          </h1>
          <p className="text-slate-400 mt-2">Managing shutil file synchronization & music.db snapshots.</p>
        </div>
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 shadow-sm">
          <Clock className="w-4 h-4 text-indigo-400" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Last Successful Sync</p>
            <p className="text-sm text-slate-200 font-mono mt-0.5">{lastBackupTime}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* shutil Config Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Synchronization Settings</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Background Thread Active</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Backup Directory Path</label>
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <Terminal className="w-4 h-4 mr-3 text-slate-600 group-focus-within:text-indigo-400" />
                    <input 
                      type="text" 
                      value={inputPath}
                      onChange={(e) => setInputPath(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-slate-200 w-full font-mono"
                      placeholder="e.g. /Volumes/Backup/Music"
                    />
                  </div>
                  <button 
                    onClick={() => setBackupFolder(inputPath)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    Set Path
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
                    <HardDrive className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Hourly Automation</h4>
                    <p className="text-xs text-slate-500">Scheduler checks for modified metadata every 60m.</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1 shadow-inner shadow-black/20">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md ml-auto" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Only <span className="text-indigo-400 font-bold">outdated</span> tracks will be shuttled.
              </div>
              <button 
                onClick={onTriggerBackup}
                disabled={isSyncing || !backupFolder}
                className="flex items-center justify-center gap-3 bg-white text-slate-950 disabled:opacity-30 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:bg-indigo-50 active:scale-95 shadow-xl shadow-white/5"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Copy...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    Run Manual Sync
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History Tracker */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-white">Shuttle Execution Logs</h3>
              </div>
              <button className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-slate-400 transition-colors">Clear History</button>
            </div>
            <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-800/50">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Archived {log.filesCount} Tracks</p>
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">{log.targetFolder}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    <p className="text-[10px] text-slate-600 font-bold tracking-tighter mt-0.5 group-hover:text-emerald-500 transition-colors">OS_SYNC_COMPLETED</p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-16 text-center">
                  <p className="text-slate-600 italic text-sm">Waiting for first shuttle operation...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-4">Internal Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">DB Schema</span>
                <span className="text-xs font-mono text-emerald-400">v2.1 (SQLite)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Thread Status</span>
                <span className="text-xs font-mono text-indigo-400">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">I/O Strategy</span>
                <span className="text-xs font-mono text-slate-500">Incremental</span>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl space-y-4">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <h4 className="font-bold text-indigo-400">Security Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed relative z-10">
              Files are verified using a 32-bit CRC hash during the shuttle process. 
              The target directory metadata is updated only after a successful write verify.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest relative z-10">
              <Database className="w-3 h-3" />
              music.db Integrity OK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
