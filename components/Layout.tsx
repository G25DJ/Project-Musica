
import React, { useMemo, useCallback, useState } from 'react';
import { 
  Music, 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  Library,
  Settings,
  Bell,
  Cpu,
  Monitor,
  Menu,
  X
} from 'lucide-react';

type ViewType = 'dashboard' | 'library' | 'scan' | 'backups' | 'preferences';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  status: string;
  sidebarPosition?: 'left' | 'right';
  notificationCount?: number;
  onBellClick?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library' as ViewType, label: 'Music Library', icon: Library },
  { id: 'scan' as ViewType, label: 'Scan Computer', icon: Search },
  { id: 'backups' as ViewType, label: 'Backups', icon: ShieldCheck },
];

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  status, 
  sidebarPosition = 'left',
  notificationCount = 0,
  onBellClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleExit = useCallback(() => {
    if (confirm('Are you sure you want to close Music Manager?')) {
      window.close();
    }
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navElements = useMemo(() => NAV_ITEMS.map((item) => (
    <button
      key={item.id}
      type="button"
      onClick={() => {
        setView(item.id);
        closeMobileMenu();
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 custom-rounded transition-all duration-200 ${
        currentView === item.id 
        ? 'bg-[rgba(var(--accent-rgb),0.1)] text-[rgb(var(--accent-rgb))] border border-[rgba(var(--accent-rgb),0.2)] shadow-sm' 
        : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
      }`}
    >
      <item.icon className="w-5 h-5" />
      <span className="font-medium text-sm">{item.label}</span>
    </button>
  )), [currentView, setView]);

  const SidebarContent = (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 custom-bg-accent custom-rounded flex items-center justify-center shadow-lg shadow-[rgba(var(--accent-rgb),0.2)]">
          <Music className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Musica
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navElements}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          type="button" 
          onClick={() => {
            setView('preferences');
            closeMobileMenu();
          }}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors custom-rounded ${
            currentView === 'preferences' ? 'bg-[rgba(var(--accent-rgb),0.1)] text-[rgb(var(--accent-rgb))]' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          Preferences
        </button>
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">v1.2.5 Stable</span>
          <div className="relative">
            <Bell 
              onClick={onBellClick}
              className={`w-4 h-4 cursor-pointer transition-colors ${notificationCount > 0 ? 'text-[rgb(var(--accent-rgb))]' : 'text-slate-600 hover:text-slate-400'}`} 
            />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[rgb(var(--accent-rgb))] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex flex-col h-screen bg-[var(--bg-color)] text-slate-200 overflow-hidden ${sidebarPosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside className={`fixed top-0 bottom-0 w-72 bg-slate-900 z-[100] md:hidden transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-800 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button 
          onClick={closeMobileMenu}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {SidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-800 bg-slate-900/50 flex-col z-50">
        {SidebarContent}
      </aside>

      {/* Top Menu Bar */}
      <div className="h-10 md:h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between md:justify-start gap-4 z-[60] fixed top-0 left-0 right-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 md:hidden text-slate-400 hover:text-white mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Music className="w-3.5 h-3.5 custom-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Project Musica</span>
        </div>
        
        <div className="hidden md:flex h-full">
          <div className="relative group flex items-center h-full px-3 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white cursor-default transition-colors">
            File
            <div className="hidden group-hover:block absolute top-full left-0 w-48 bg-slate-800 border border-slate-700 shadow-2xl py-1 rounded-b-md">
              <button type="button" onClick={() => setView('dashboard')} className="w-full text-left px-4 py-2 hover:bg-indigo-600 hover:text-white transition-colors text-xs">New Scan...</button>
              <button type="button" onClick={handleExit} className="w-full text-left px-4 py-2 hover:bg-rose-600 hover:text-white transition-colors text-xs">Exit</button>
            </div>
          </div>
          <div className="relative group flex items-center h-full px-3 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white cursor-default transition-colors">
            View
            <div className="hidden group-hover:block absolute top-full left-0 w-48 bg-slate-800 border border-slate-700 shadow-2xl py-1 rounded-b-md">
              <button type="button" onClick={() => setView('preferences')} className="w-full text-left px-4 py-2 hover:bg-indigo-600 hover:text-white transition-colors text-xs">Appearance...</button>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <Bell className="w-4 h-4 text-slate-500" onClick={onBellClick} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-10 md:mt-8 relative">
        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col bg-[var(--bg-color)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[rgba(var(--accent-rgb),0.05)] to-transparent pointer-events-none" />
          <main className="flex-1 overflow-hidden flex flex-col relative z-10">
            {children}
          </main>
          
          {/* Status Bar */}
          <footer className="h-6 bg-slate-900 border-t border-slate-800 flex items-center px-4 justify-between z-[60] hidden sm:flex">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${status.includes('Error') ? 'bg-rose-500' : status.includes('Ready') ? 'bg-emerald-500' : 'custom-bg-accent animate-pulse'}`} />
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{status}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-600 font-mono">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> ENGINE_READY</span>
              <span className="hidden lg:flex items-center gap-1"><Monitor className="w-3 h-3" /> DPI_STABLE</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
