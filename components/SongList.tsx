
import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Trash2, 
  MoreVertical, 
  Download, 
  Search, 
  Filter, 
  FileAudio,
  Trash,
  Database,
  ArrowUpDown,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { SongMetadata } from '../types';
import { FileRegistry } from '../db';

interface SongListProps {
  songs: SongMetadata[];
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  onClearLibrary: () => void;
  activeSongId: string | null;
}

export const SongList: React.FC<SongListProps> = ({ songs, onPlay, onDelete, onClearLibrary, activeSongId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'addedAt'>('addedAt');

  const filteredSongs = useMemo(() => {
    return songs
      .filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'addedAt') return b.addedAt - a.addedAt;
        return a[sortBy].localeCompare(b[sortBy]);
      });
  }, [songs, searchTerm, sortBy]);

  const handleDownload = (song: SongMetadata) => {
    const file = FileRegistry.get(song.id);
    if (!file) {
      alert("Source file not found in current session registry. Please re-scan folders.");
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.artist} - ${song.title}.${song.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (d: number) => {
    return `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col gap-4 md:gap-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
              <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">music.db</h1>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm">{filteredSongs.length} records</p>
          </div>
          {songs.length > 0 && (
            <button 
              onClick={onClearLibrary}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-all text-[10px] md:text-sm font-bold"
            >
              <Trash className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-200"
            />
          </div>
          <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-slate-900/20 border border-slate-800/50 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
        
        {/* Mobile Card View (Visible only on < md) */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSongs.map((song) => (
            <div 
              key={song.id}
              className={`p-4 rounded-xl border transition-all ${
                activeSongId === song.id 
                ? 'bg-indigo-600/10 border-indigo-500/30' 
                : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button 
                    onClick={() => onPlay(song.id)}
                    className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      activeSongId === song.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Play className={`w-4 h-4 ${activeSongId === song.id ? 'fill-current' : ''}`} />
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${activeSongId === song.id ? 'text-indigo-400' : 'text-slate-100'}`}>
                      {song.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{song.artist} • {song.album}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-[10px] text-slate-500 font-mono mb-1">{formatDuration(song.duration)}</p>
                   <button onClick={() => onDelete(song.id)} className="p-1.5 text-slate-600 hover:text-rose-500">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (Visible only on >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                <th className="px-6 py-5 font-bold">
                  <button onClick={() => setSortBy('title')} className="flex items-center gap-2">
                    Track Information
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5 font-bold">Artist / Album</th>
                <th className="px-6 py-5 font-bold">Duration</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredSongs.map((song) => (
                <tr key={song.id} className={`group transition-all ${activeSongId === song.id ? 'bg-indigo-600/10' : 'hover:bg-white/[0.03]'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => onPlay(song.id)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${activeSongId === song.id ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        <Play className={`w-3.5 h-3.5 ${activeSongId === song.id ? 'fill-current' : ''}`} />
                      </button>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${activeSongId === song.id ? 'text-indigo-400' : 'text-slate-100'}`}>{song.title}</p>
                        <p className="text-[10px] text-slate-600 truncate font-mono mt-0.5 opacity-70">{song.filePath}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-slate-300 font-medium">{song.artist}</p>
                      <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-0.5">{song.album}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {formatDuration(song.duration)}
                  </td>
                  <td className="px-6 py-4">
                    {song.lastBackup ? (
                      <span className="text-[9px] text-emerald-500 font-bold uppercase border border-emerald-500/20 px-1.5 py-0.5 rounded">Archived</span>
                    ) : (
                      <span className="text-[9px] text-amber-500 font-bold uppercase border border-amber-500/20 px-1.5 py-0.5 rounded">Local</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(song)} className="p-2 text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(song.id)} className="p-2 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSongs.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 md:p-24 text-center">
            <FileAudio className="w-10 h-10 md:w-16 md:h-16 text-slate-700 mb-4 md:mb-6" />
            <h3 className="text-lg md:text-xl font-bold text-slate-300">No tracks found</h3>
            <p className="text-slate-600 max-w-xs mt-2 text-xs md:text-sm leading-relaxed">
              Scan your collection to populate the library database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
