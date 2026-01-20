
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">System Overview</h1>
          <p className="text-slate-400 mt-1">Real-time insights into your digital music collection.</p>
        </div>
        <button 
          onClick={onNavigate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20"
        >
          Quick Scan
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-80 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-white">Format Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {formatData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-80 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-white">Library Growth</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backupLogs.slice(0, 7).reverse()}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(t) => new Date(t).toLocaleDateString()} 
                  stroke="#475569"
                  fontSize={12}
                />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
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
