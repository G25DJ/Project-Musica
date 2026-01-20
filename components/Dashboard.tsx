
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { SongMetadata, BackupLog } from '../types';
import { Music, FileAudio, FolderSync, Clock } from 'lucide-react';

interface DashboardProps {
  songs: SongMetadata[];
  backupLogs: BackupLog[];
  onNavigate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ songs, backupLogs, onNavigate }) => {
  const stats = [
    { label: 'Total Songs', value: songs.length, icon: Music, color: 'text-indigo-500' },
    { label: 'Library Size', value: `${(songs.reduce((acc, s) => acc + s.size, 0) / 1024).toFixed(1)} GB`, icon: FileAudio, color: 'text-emerald-500' },
    { label: 'Last Backup', value: backupLogs[0] ? new Date(backupLogs[0].timestamp).toLocaleDateString() : 'Never', icon: FolderSync, color: 'text-amber-500' },
    { label: 'Playtime', value: `${Math.round(songs.reduce((acc, s) => acc + s.duration, 0) / 3600)} hrs`, icon: Clock, color: 'text-rose-500' },
  ];

  const formatData = [
    { name: 'MP3', value: songs.filter(s => s.format === 'mp3').length },
    { name: 'WAV', value: songs.filter(s => s.format === 'wav').length },
    { name: 'OGG', value: songs.filter(s => s.format === 'ogg').length },
    { name: 'OPUS', value: songs.filter(s => s.format === 'opus').length },
    { name: 'FLAC', value: songs.filter(s => s.format === 'flac').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto overflow-y-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time insights into your music library.</p>
        </div>
        <button 
          onClick={onNavigate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm"
        >
          Quick Scan
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-5 md:p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-800/80 ${stat.color}`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-72 md:h-80 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Format Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {formatData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-72 md:h-80 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Recent Backup Volume</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backupLogs.slice(0, 7).reverse()}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                  stroke="#475569"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="filesCount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
