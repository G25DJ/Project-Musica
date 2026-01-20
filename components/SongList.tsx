
import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Trash2, 
  MoreVertical, 
  Download, 
  Search, 
  Filter, 
  Music, 
  CheckCircle2,
  Database,
  ArrowUpDown,
  FileAudio,
  Trash
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
      alert("Source file not found in current session registry. Please re-scan or import the file again to download.");
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

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white tracking-tight">music.db Explorer</h1>
          </div>
          <p className="text-slate-400 text-sm">Browsing 'tracks' table &bull; {filteredSongs.length} records</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tracks by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-200"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 transition-all shadow-sm text-sm font-medium">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            {songs.length > 0 && (
              <button 
                onClick={onClearLibrary}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 text-rose-500 transition-all shadow-sm text-sm font-bold"
                title="Wipe Library"
              >
                <Trash className="w-4 h-4" />
                Clear Library
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Listbox View */}
      <div className="flex-1 bg-slate-900/20 border border-slate-800/50 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                <th className="px-6 py-5 font-bold">
                  <button onClick={() => setSortBy('title')} className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                    Track Information
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5 font-bold">
                   <button onClick={() => setSortBy('artist')} className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                    Artist / Album
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5 font-bold">Duration</th>
                <th className="px-6 py-5 font-bold">DB Sync Status</th>
                <th className="px-6 py-5 font-bold text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredSongs.map((song) => (
                <tr 
                  key={song.id} 
                  className={`group transition-all duration-200 ${activeSongId === song.id ? 'bg-indigo-600/10' : 'hover:bg-white/[0.03]'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <button 
                          onClick={() => onPlay(song.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            activeSongId === song.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'bg-slate-800/50 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}
                        >
                          <Play className={`w-4 h-4 ${activeSongId === song.id ? 'fill-current' : ''}`} />
                        </button>
                        {activeSongId === song.id && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-slate-950 animate-pulse" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-sm truncate ${activeSongId === song.id ? 'text-indigo-400' : 'text-slate-100'}`}>{song.title}</p>
                        <p className="text-[10px] text-slate-600 truncate font-mono mt-0.5 tracking-tighter opacity-70">{song.filePath}</p>
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
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    {song.lastBackup ? (
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Archived</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-amber-500/5 border border-amber-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter">Local Only</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDownload(song)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors" 
                        title="Download to PC"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(song.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSongs.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-24 text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
              <FileAudio className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">{songs.length === 0 ? 'Your library is empty' : 'No matching tracks found'}</h3>
            <p className="text-slate-600 max-w-sm mt-3 text-sm leading-relaxed">
              {songs.length === 0 
                ? 'Head over to the Scan tab to index your music collection and populate your library.' 
                : "We couldn't find any results in 'music.db' matching your query."}
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-6 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
