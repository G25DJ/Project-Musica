
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SongList } from './components/SongList';
import { Scanner } from './components/Scanner';
import { BackupManager } from './components/BackupManager';
import { Preferences } from './components/Preferences';
import { Player } from './components/Player';
import { Toaster, ToastType } from './components/Toaster';
import { NotificationTray } from './components/NotificationTray';
import { SongMetadata, BackupLog, AppPreferences, AccentColor, AppNotification } from './types';
import { VirtualSQLite } from './db';

const ACCENT_MAP: Record<AccentColor, string> = {
  indigo: '79, 70, 229',
  rose: '225, 29, 72',
  emerald: '16, 185, 129',
  amber: '245, 158, 11',
  cyan: '6, 182, 212',
  fuchsia: '192, 38, 211',
  violet: '124, 58, 237'
};

const DEFAULT_PREFS: AppPreferences = {
  theme: 'dark',
  accentColor: 'indigo',
  geometry: 'medium',
  glassIntensity: 40,
  sidebarPosition: 'left',
  autoBackupEnabled: true,
  backupIntervalMinutes: 60,
  defaultVolume: 70,
  allowedExtensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
  autoplayOnScan: false,
  restrictedPaths: ['node_modules', 'System32', 'temp', '.git', 'AppData']
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'library' | 'scan' | 'backups' | 'preferences'>('dashboard');
  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [backupFolder, setBackupFolder] = useState<string | null>(null);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('System Idle');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('hs_notifications', JSON.stringify(next));
      return next;
    });
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const runSafe = useCallback(async (fn: () => Promise<void> | void, errorMessage: string) => {
    try {
      await fn();
    } catch (e: any) {
      console.error(e);
      showToast(`${errorMessage}: ${e.message}`, 'error');
      addNotification({
        type: 'error',
        title: 'System Error',
        message: e.message || errorMessage
      });
      setStatusMessage('Error encountered.');
    }
  }, [showToast, addNotification]);

  const handleBackup = useCallback(async (isAuto = false) => {
    if (!backupFolder) {
      if (!isAuto) showToast('Please set a backup directory first.', 'error');
      return;
    }

    const targets = VirtualSQLite.getTracksNeedingBackup(preferences.backupIntervalMinutes * 60000);
    if (targets.length === 0) {
      if (!isAuto) showToast('All tracks are already secured.', 'success');
      setStatusMessage('Backup skip: No new files.');
      return;
    }

    setIsBackingUp(true);
    setStatusMessage(`Backing up ${targets.length} files...`);
    const now = Date.now();
    
    try {
      for (let i = 0; i < targets.length; i++) {
        await new Promise(r => setTimeout(r, 50)); 
      }

      const updated = targets.map(s => ({ ...s, lastBackup: now }));
      VirtualSQLite.upsertTracks(updated);
      setSongs(VirtualSQLite.queryAll());
      
      const newLog: BackupLog = {
        id: crypto.randomUUID(),
        timestamp: now,
        status: 'success',
        filesCount: targets.length,
        targetFolder: backupFolder
      };
      
      setBackupLogs(prev => {
        const next = [newLog, ...prev];
        localStorage.setItem('hs_backup_logs', JSON.stringify(next));
        return next;
      });
      
      addNotification({
        type: 'success',
        title: isAuto ? 'Auto Backup Success' : 'Manual Backup Complete',
        message: `Successfully synchronized ${targets.length} tracks to ${backupFolder}.`
      });

      showToast(`${isAuto ? 'Auto' : 'Manual'} backup complete.`, 'success');
      setStatusMessage('Backup complete.');
    } catch (e: any) {
      showToast('Backup process interrupted.', 'error');
      addNotification({
        type: 'error',
        title: 'Backup Failed',
        message: `Synchronization interrupted: ${e.message}`
      });
      setStatusMessage('Backup failed.');
    } finally {
      setIsBackingUp(false);
    }
  }, [backupFolder, showToast, preferences.backupIntervalMinutes, addNotification]);

  useEffect(() => {
    const root = document.documentElement;
    const accentRgb = ACCENT_MAP[preferences.accentColor];
    root.style.setProperty('--accent-rgb', accentRgb);
    
    const radius = preferences.geometry === 'sharp' ? '0px' : preferences.geometry === 'organic' ? '24px' : '12px';
    root.style.setProperty('--ui-radius', radius);
    
    const blur = `${(preferences.glassIntensity / 5).toFixed(0)}px`;
    root.style.setProperty('--glass-blur', blur);
    
    const opacity = (preferences.glassIntensity / 200 + 0.05).toFixed(2);
    root.style.setProperty('--glass-opacity', opacity);

    if (preferences.theme === 'amoled') {
      root.style.setProperty('--bg-color', '#000000');
    } else {
      root.style.setProperty('--bg-color', '#0f172a');
    }
  }, [preferences]);

  useEffect(() => {
    const storedSongs = VirtualSQLite.queryAll();
    const storedBackup = localStorage.getItem('hs_backup_folder');
    const storedLogs = localStorage.getItem('hs_backup_logs');
    const storedPrefs = localStorage.getItem('hs_preferences');
    const storedNotifs = localStorage.getItem('hs_notifications');
    
    setSongs(storedSongs);
    if (storedBackup) setBackupFolder(storedBackup);
    if (storedLogs) {
      try { setBackupLogs(JSON.parse(storedLogs)); } catch (e) {}
    }
    if (storedPrefs) {
      try { setPreferences(prev => ({...DEFAULT_PREFS, ...prev, ...JSON.parse(storedPrefs)})); } catch (e) {}
    }
    if (storedNotifs) {
      try { setNotifications(JSON.parse(storedNotifs)); } catch (e) {}
    }
    setStatusMessage(`Ready. Indexed ${storedSongs.length} tracks.`);
  }, []);

  const handleScan = useCallback((newSongs: SongMetadata[]) => {
    runSafe(() => {
      setStatusMessage('Syncing with music.db...');
      const result = VirtualSQLite.upsertTracks(newSongs);
      setSongs(VirtualSQLite.queryAll());
      
      addNotification({
        type: 'info',
        title: 'Library Updated',
        message: `Indexed ${result.added} new files. Total tracks: ${VirtualSQLite.queryAll().length}`
      });

      showToast(`Scan complete. ${result.added} new tracks indexed.`, 'success');
      setStatusMessage(`Scan successful.`);
      setView('library');
      if (preferences.autoplayOnScan && newSongs.length > 0) {
        setActiveSongId(newSongs[0].id);
      }
    }, 'Scan Sync Failed');
  }, [runSafe, showToast, preferences.autoplayOnScan, addNotification]);

  const handleDeleteSong = useCallback((id: string) => {
    runSafe(() => {
      VirtualSQLite.deleteTrack(id);
      setSongs(VirtualSQLite.queryAll());
      setActiveSongId(prev => prev === id ? null : prev);
      showToast('Track removed.', 'success');
    }, 'Delete Failed');
  }, [runSafe, showToast]);

  const handleUpdatePrefs = useCallback((newPrefs: AppPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('hs_preferences', JSON.stringify(newPrefs));
    showToast('Preferences updated.', 'success');
    addNotification({
      type: 'info',
      title: 'Configuration Updated',
      message: 'System preferences have been saved and applied.'
    });
  }, [showToast, addNotification]);

  const handleClearDB = useCallback(() => {
    if (confirm('Are you sure? This will delete all music metadata records from your local library.')) {
      VirtualSQLite.clearDB();
      setSongs([]);
      setActiveSongId(null);
      addNotification({
        type: 'warning',
        title: 'Library Wiped',
        message: 'The local music database has been sanitized.'
      });
      showToast('Library cleared.', 'info');
      setStatusMessage('Library cleared.');
    }
  }, [showToast, addNotification]);

  const handleMarkAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('hs_notifications', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleClearNotifs = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('hs_notifications');
    showToast('Logs sanitized.', 'info');
  }, [showToast]);

  const activeSong = useMemo(() => songs.find(s => s.id === activeSongId) || null, [songs, activeSongId]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return (
    <div style={{ 
      '--accent': `rgb(${ACCENT_MAP[preferences.accentColor]})`,
      '--accent-muted': `rgba(${ACCENT_MAP[preferences.accentColor]}, 0.1)`,
      '--accent-glow': `rgba(${ACCENT_MAP[preferences.accentColor]}, 0.4)`
    } as any}>
      <Layout 
        currentView={view} 
        setView={setView} 
        status={statusMessage} 
        sidebarPosition={preferences.sidebarPosition}
        notificationCount={unreadCount}
        onBellClick={() => {
          setIsNotificationTrayOpen(!isNotificationTrayOpen);
          if (!isNotificationTrayOpen) handleMarkAsRead();
        }}
      >
        {toast && <Toaster message={toast.message} type={toast.type} onClose={handleCloseToast} />}
        
        <NotificationTray 
          isOpen={isNotificationTrayOpen} 
          onClose={() => setIsNotificationTrayOpen(false)} 
          notifications={notifications}
          onClear={handleClearNotifs}
        />

        <div className="flex-1 overflow-y-auto pb-48">
          {view === 'dashboard' && <Dashboard songs={songs} backupLogs={backupLogs} onNavigate={() => setView('scan')} />}
          {view === 'library' && (
            <SongList 
              songs={songs} 
              onPlay={setActiveSongId} 
              onDelete={handleDeleteSong} 
              onClearLibrary={handleClearDB}
              activeSongId={activeSongId} 
            />
          )}
          {view === 'scan' && (
            <Scanner 
              isScanning={isScanning} 
              setIsScanning={setIsScanning} 
              onScanComplete={handleScan}
              restrictedPaths={preferences.restrictedPaths}
              onUpdateRestrictions={(paths) => handleUpdatePrefs({ ...preferences, restrictedPaths: paths })}
            />
          )}
          {view === 'backups' && (
            <BackupManager 
              backupFolder={backupFolder} 
              setBackupFolder={(f) => { setBackupFolder(f); localStorage.setItem('hs_backup_folder', f); }} 
              logs={backupLogs} 
              onTriggerBackup={() => handleBackup(false)} 
              isSyncing={isBackingUp} 
            />
          )}
          {view === 'preferences' && (
            <Preferences 
              preferences={preferences} 
              onUpdate={handleUpdatePrefs} 
              onClearDB={handleClearDB}
            />
          )}
        </div>
        
        <Player song={activeSong} onStatusChange={setStatusMessage} />
      </Layout>
    </div>
  );
};

export default App;
