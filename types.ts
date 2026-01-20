
export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  filePath: string;
  size: number;
  format: string;
  addedAt: number;
  lastBackup: number | null;
}

export interface BackupLog {
  id: string;
  timestamp: number;
  status: 'success' | 'failed';
  filesCount: number;
  targetFolder: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export type AccentColor = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'fuchsia' | 'violet';
export type UIGeometry = 'sharp' | 'medium' | 'organic';

export interface AppPreferences {
  theme: 'dark' | 'amoled';
  accentColor: AccentColor;
  geometry: UIGeometry;
  glassIntensity: number; // 0 - 100
  sidebarPosition: 'left' | 'right';
  autoBackupEnabled: boolean;
  backupIntervalMinutes: number;
  defaultVolume: number;
  allowedExtensions: string[];
  autoplayOnScan: boolean;
  restrictedPaths: string[]; // New: List of strings/patterns to ignore during scan
}

export interface AppState {
  songs: SongMetadata[];
  isScanning: boolean;
  activeSongId: string | null;
  backupFolder: string | null;
  backupLogs: BackupLog[];
  preferences: AppPreferences;
  notifications: AppNotification[];
}
