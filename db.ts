
import { SongMetadata } from './types';

const DB_NAME = 'music_db';
const TABLE_NAME = 'tracks';

/**
 * FileRegistry acts as an in-memory cache for the actual browser File objects.
 * Since localStorage cannot store File handles, we keep them here during the session.
 */
export class FileRegistry {
  private static files = new Map<string, File>();

  static register(id: string, file: File) {
    this.files.set(id, file);
  }

  static get(id: string): File | undefined {
    return this.files.get(id);
  }

  static clear() {
    this.files.clear();
  }
}

export class VirtualSQLite {
  private static getDB(): Record<string, SongMetadata[]> {
    const data = localStorage.getItem(DB_NAME);
    return data ? JSON.parse(data) : { [TABLE_NAME]: [] };
  }

  private static saveDB(db: Record<string, SongMetadata[]>) {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
  }

  static queryAll(): SongMetadata[] {
    try {
      const db = this.getDB();
      return db[TABLE_NAME] || [];
    } catch (e) {
      console.error('Database read error:', e);
      throw new Error('Failed to load tracks from music.db');
    }
  }

  static getTracksNeedingBackup(thresholdMs: number = 3600000): SongMetadata[] {
    const all = this.queryAll();
    const now = Date.now();
    return all.filter(t => !t.lastBackup || (now - t.lastBackup) > thresholdMs);
  }

  static upsertTracks(newTracks: SongMetadata[]): { added: number; updated: number } {
    try {
      const db = this.getDB();
      const existing = db[TABLE_NAME] || [];
      const trackMap = new Map(existing.map(t => [t.filePath, t]));
      
      let added = 0;
      let updated = 0;

      newTracks.forEach(track => {
        if (trackMap.has(track.filePath)) {
          const old = trackMap.get(track.filePath)!;
          trackMap.set(track.filePath, { ...old, ...track, id: old.id });
          updated++;
        } else {
          trackMap.set(track.filePath, track);
          added++;
        }
      });

      db[TABLE_NAME] = Array.from(trackMap.values());
      this.saveDB(db);
      return { added, updated };
    } catch (e) {
      console.error('Database write error:', e);
      throw new Error('Failed to update music.db tracks table');
    }
  }

  static deleteTrack(id: string) {
    const db = this.getDB();
    db[TABLE_NAME] = (db[TABLE_NAME] || []).filter(t => t.id !== id);
    this.saveDB(db);
  }

  static clearDB() {
    localStorage.removeItem(DB_NAME);
    FileRegistry.clear();
  }
}
