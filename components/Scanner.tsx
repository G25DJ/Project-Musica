
import React, { useState, useRef } from 'react';
import { 
  Scan, 
  ShieldAlert, 
  FolderSearch, 
  Loader2, 
  Terminal, 
  X, 
  Plus, 
  Trash2, 
  ShieldCheck,
  Filter
} from 'lucide-react';
import { SongMetadata } from '../types';
import { FileRegistry } from '../db';

interface ScannerProps {
  isScanning: boolean;
  setIsScanning: (s: boolean) => void;
  onScanComplete: (songs: SongMetadata[]) => void;
  restrictedPaths: string[];
  onUpdateRestrictions: (paths: string[]) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ 
  isScanning, 
  setIsScanning, 
  onScanComplete, 
  restrictedPaths, 
  onUpdateRestrictions 
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanningPath, setCurrentScanningPath] = useState('');
  const [foundCount, setFoundCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [basePath, setBasePath] = useState('C:/Users/Music');
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
  const [newExclusion, setNewExclusion] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => resolve(0);
    });
  };

  const startScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanProgress(0);
    setFoundCount(0);
    setFilteredCount(0);

    const fileList = Array.from(files) as (File & { webkitRelativePath?: string })[];
    const extensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus'];
    
    const potentialAudio = fileList.filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext && extensions.includes(ext);
    });

    const processedSongs: SongMetadata[] = [];
    
    for (let i = 0; i < potentialAudio.length; i++) {
      const file = potentialAudio[i];
      const relativePath = file.webkitRelativePath || file.name;
      const fullPath = `${basePath}/${relativePath}`;
      
      const isRestricted = restrictedPaths.some(pattern => 
        fullPath.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isRestricted) {
        setFilteredCount(prev => prev + 1);
        continue;
      }

      setCurrentScanningPath(fullPath);
      const duration = await getAudioDuration(file);
      
      let title = file.name.replace(/\.[^/.]+$/, "");
      let artist = 'Unknown Artist';
      let album = 'Local Collection';

      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0];
        title = parts[1];
      }

      const songId = crypto.randomUUID();
      FileRegistry.register(songId, file);

      processedSongs.push({
        id: songId,
        title,
        artist,
        album,
        duration: duration || 180,
        filePath: fullPath,
        size: Math.floor(file.size / 1024),
        format: file.name.split('.').pop()?.toLowerCase() || 'mp3',
        addedAt: Date.now(),
        lastBackup: null
      });

      setFoundCount(prev => prev + 1);
      setScanProgress(Math.round(((i + 1) / potentialAudio.length) * 100));
    }

    setIsScanning(false);
    onScanComplete(processedSongs);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !restrictedPaths.includes(newExclusion.trim())) {
      onUpdateRestrictions([...restrictedPaths, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (pattern: string) => {
    onUpdateRestrictions(restrictedPaths.filter(p => p !== pattern));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] relative">
      {isExclusionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 custom-rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-white">Path Exclusion Rules</h3>
              </div>
              <button onClick={() => setIsExclusionModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">Add a keyword or path segment to ignore during scanning.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addExclusion()}
                    placeholder="e.g. node_modules"
                    className="flex-1 bg-slate-950 border border-slate-800 custom-rounded px-3 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button 
                    onClick={addExclusion}
                    className="bg-amber-600 hover:bg-amber-500 text-white p-2.5 custom-rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {restrictedPaths.map((path) => (
                  <div key={path} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 custom-rounded group">
                    <span className="text-xs font-mono text-slate-300">{path}</span>
                    <button 
                      onClick={() => removeExclusion(path)}
                      className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {restrictedPaths.length === 0 && (
                  <div className="text-center py-8 opacity-40">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">No active restrictions</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
              <button 
                onClick={() => setIsExclusionModalOpen(false)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {!isScanning && (
        <div className="text-center space-y-6 w-full animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-[rgb(var(--accent-rgb))]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[rgb(var(--accent-rgb))]/20">
            <Scan className="w-12 h-12 custom-accent" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Audio Metadata Indexer</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Scan your PC for .mp3, .wav, .ogg, .flac, .m4a, and .opus files.
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Starting Directory</label>
              <div className="flex items-center bg-slate-900 border border-slate-800 custom-rounded overflow-hidden focus-within:ring-2 focus-within:ring-[rgb(var(--accent-rgb))]/20 focus-within:border-[rgb(var(--accent-rgb))] transition-all">
                <div className="px-3 text-slate-600">
                  <Terminal className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={basePath}
                  onChange={(e) => setBasePath(e.target.value)}
                  className="bg-transparent border-none outline-none py-2 px-1 text-slate-200 text-sm flex-1"
                  placeholder="e.g. C:/Users/Music"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group p-5 bg-slate-900 border border-slate-800 custom-rounded hover:border-[rgb(var(--accent-rgb))]/50 hover:bg-slate-800/50 transition-all text-left"
              >
                <FolderSearch className="w-6 h-6 custom-accent mb-3" />
                <h3 className="font-semibold text-white">Scan Music</h3>
                <p className="text-sm text-slate-500 mt-1 text-balance">Extract tags and store in local DB.</p>
              </button>
              
              <button 
                onClick={() => setIsExclusionModalOpen(true)}
                className="p-5 bg-slate-900 border border-slate-800 custom-rounded hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left"
              >
                <div className="flex justify-between items-start mb-3">
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {restrictedPaths.length} ACTIVE
                  </span>
                </div>
                <h3 className="font-semibold text-white">Restricted Paths</h3>
                <p className="text-sm text-slate-500 mt-1 text-balance">Manage excluded and secure folders.</p>
              </button>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            {...({ webkitdirectory: "", directory: "" } as any)}
            onChange={startScan}
          />
        </div>
      )}

      {isScanning && (
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-12 h-12 custom-accent animate-spin" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Accessing File System...</h2>
            <div className="bg-slate-900/50 border border-slate-800 custom-rounded px-4 py-2 w-full max-w-md">
              <p className="custom-accent text-xs font-mono truncate">
                Indexing: {currentScanningPath}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span className="text-slate-500">Task Status: <span className="custom-accent">Parsing Metadata</span></span>
              <span className="custom-accent">{scanProgress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 custom-rounded overflow-hidden border border-slate-800">
              <div 
                className="h-full custom-bg-accent transition-all duration-300 ease-out shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-medium">
              <p className="text-slate-600">Scanning local directories...</p>
              {filteredCount > 0 && (
                <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-tighter">
                  <Filter className="w-3 h-3" />
                  <span>{filteredCount} Skipped via rules</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-slate-900/40 p-4 custom-rounded border border-slate-800 text-center">
              <p className="text-2xl font-bold text-white">{foundCount}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">DB Records</p>
            </div>
            <div className="bg-slate-900/40 p-4 custom-rounded border border-slate-800 text-center">
              <p className="text-2xl font-bold text-white font-mono">{filteredCount}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Filtered</p>
            </div>
            <div className="bg-slate-900/40 p-4 custom-rounded border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full custom-bg-accent animate-ping" />
                <p className="text-2xl font-bold text-white">I/O</p>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Live Sync</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
