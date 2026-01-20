
import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Volume2, 
  Library, 
  ShieldCheck, 
  Trash2, 
  RefreshCw,
  Zap,
  HardDrive,
  Palette,
  Layout as LayoutIcon,
  Layers,
  Check,
  Shapes,
  Maximize2
} from 'lucide-react';
import { AppPreferences, AccentColor, UIGeometry } from '../types';

interface PreferencesProps {
  preferences: AppPreferences;
  onUpdate: (prefs: AppPreferences) => void;
  onClearDB: () => void;
}

const ACCENT_OPTIONS: { name: string; id: AccentColor; class: string }[] = [
  { name: 'Indigo', id: 'indigo', class: 'bg-indigo-500' },
  { name: 'Rose', id: 'rose', class: 'bg-rose-500' },
  { name: 'Emerald', id: 'emerald', class: 'bg-emerald-500' },
  { name: 'Amber', id: 'amber', class: 'bg-amber-500' },
  { name: 'Cyan', id: 'cyan', class: 'bg-cyan-500' },
  { name: 'Fuchsia', id: 'fuchsia', class: 'bg-fuchsia-500' },
  { name: 'Violet', id: 'violet', class: 'bg-violet-500' },
];

export const Preferences: React.FC<PreferencesProps> = ({ preferences, onUpdate, onClearDB }) => {
  const [localPrefs, setLocalPrefs] = useState<AppPreferences>(preferences);

  const updateField = (field: keyof AppPreferences, value: any) => {
    const next = { ...localPrefs, [field]: value };
    setLocalPrefs(next);
    onUpdate(next);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white flex items-center gap-4">
          <Settings className="w-10 h-10 custom-accent" />
          System Preferences
        </h1>
        <p className="text-slate-500 text-lg">Orchestrate your environment, from engine logic to visual geometry.</p>
      </header>

      {/* Visual Customizer - The core request */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Visual Studio</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Accent Color Selection */}
          <div className="custom-glass p-8 custom-rounded space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Accent Identity</h3>
              <p className="text-xs text-slate-500 font-medium">Select the primary functional color for the system.</p>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateField('accentColor', opt.id)}
                  className={`group relative w-full aspect-square custom-rounded flex items-center justify-center transition-all ${opt.class} ${localPrefs.accentColor === opt.id ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-950 scale-110 shadow-2xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                >
                  {localPrefs.accentColor === opt.id && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Interface Geometry */}
          <div className="custom-glass p-8 custom-rounded space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">System Geometry</h3>
              <p className="text-xs text-slate-500 font-medium">Define the curvature of panels, buttons, and inputs.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['sharp', 'medium', 'organic'] as UIGeometry[]).map((geo) => (
                <button
                  key={geo}
                  onClick={() => updateField('geometry', geo)}
                  className={`py-4 custom-rounded text-xs font-black uppercase tracking-widest border transition-all ${localPrefs.geometry === geo ? 'bg-[rgb(var(--accent-rgb))] text-white border-transparent' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                >
                  {geo}
                </button>
              ))}
            </div>
          </div>

          {/* Glassmorphism Intensity */}
          <div className="custom-glass p-8 custom-rounded space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-lg">Atmospheric Blur</h3>
                <p className="text-xs text-slate-500 font-medium">Adjust background refraction and glass opacity.</p>
              </div>
              <span className="text-sm font-mono custom-accent font-bold">{localPrefs.glassIntensity}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={localPrefs.glassIntensity}
              onChange={(e) => updateField('glassIntensity', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[rgb(var(--accent-rgb))]"
            />
          </div>

          {/* Layout Positioning */}
          <div className="custom-glass p-8 custom-rounded space-y-6">
             <div className="space-y-1">
                <h3 className="font-bold text-white text-lg">Sidebar Orientation</h3>
                <p className="text-xs text-slate-500 font-medium">Choose left or right alignment for navigation.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => updateField('sidebarPosition', 'left')}
                  className={`flex-1 py-3 custom-rounded flex items-center justify-center gap-3 text-xs font-bold transition-all ${localPrefs.sidebarPosition === 'left' ? 'bg-slate-800 text-white border-transparent' : 'bg-transparent border border-slate-800 text-slate-500'}`}
                >
                  <LayoutIcon className="w-4 h-4 rotate-180" /> Left Side
                </button>
                <button
                  onClick={() => updateField('sidebarPosition', 'right')}
                  className={`flex-1 py-3 custom-rounded flex items-center justify-center gap-3 text-xs font-bold transition-all ${localPrefs.sidebarPosition === 'right' ? 'bg-slate-800 text-white border-transparent' : 'bg-transparent border border-slate-800 text-slate-500'}`}
                >
                  <LayoutIcon className="w-4 h-4" /> Right Side
                </button>
              </div>
          </div>
        </div>
      </section>

      {/* Engine & Logic Settings */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Core Orchestration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="custom-glass p-6 custom-rounded flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 custom-rounded">
                <Moon className="w-5 h-5 custom-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Amoled Mode</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">True black rendering</p>
              </div>
            </div>
            <button 
              onClick={() => updateField('theme', localPrefs.theme === 'dark' ? 'amoled' : 'dark')}
              className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${localPrefs.theme === 'amoled' ? 'custom-bg-accent' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${localPrefs.theme === 'amoled' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="custom-glass p-6 custom-rounded flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 custom-rounded">
                <RefreshCw className="w-5 h-5 custom-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Immediate Playback</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Auto-play first track after scan</p>
              </div>
            </div>
            <button 
              onClick={() => updateField('autoplayOnScan', !localPrefs.autoplayOnScan)}
              className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${localPrefs.autoplayOnScan ? 'custom-bg-accent' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${localPrefs.autoplayOnScan ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Destructive Actions */}
      <section className="pt-12 border-t border-slate-900">
        <div className="bg-rose-500/5 border border-rose-500/10 p-8 custom-rounded flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-rose-500/10 text-rose-500 custom-rounded">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-black text-rose-500 uppercase tracking-tight">Library Sanitization</h3>
              <p className="text-sm text-slate-500 mt-1">Purge all metadata records and session file handles from <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-400">music.db</code>. This action is irreversible.</p>
            </div>
          </div>
          <button 
            onClick={onClearDB}
            className="w-full md:w-auto px-10 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-[0.2em] custom-rounded transition-all shadow-xl shadow-rose-900/20 active:scale-95"
          >
            Clear music.db
          </button>
        </div>
      </section>
    </div>
  );
};
