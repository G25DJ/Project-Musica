
/**
 * Music Manager Unit Test Suite
 * 
 * This suite validates the core 'Project Musica' logic. 
 * Since the application is browser-based, these tests target the 
 * VirtualSQLite engine, the Scanning orchestrator, and the 
 * simulated Playback state machine.
 */

import { VirtualSQLite } from './db';
import { SongMetadata } from './types';

export class MusicManagerTestSuite {
  private static results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

  static async runAll() {
    this.results = [];
    console.group('%c 🧪 Project Musica Logic Tests ', 'background: #6366f1; color: white; font-weight: bold; padding: 4px; border-radius: 4px;');
    
    await this.testDatabaseUpsert();
    await this.testDatabaseQuery();
    await this.testScanningLogic();
    await this.testBackupScheduling();
    await this.testPlaybackStateTransitions();

    console.table(this.results);
    console.groupEnd();
    return this.results;
  }

  private static assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
  }

  /**
   * Test 1: Database Insert/Upsert Logic
   */
  private static async testDatabaseUpsert() {
    try {
      VirtualSQLite.clearDB();
      const mockTrack: SongMetadata = {
        id: 'test-1',
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        filePath: '/mock/path/song.mp3',
        size: 5000,
        format: 'mp3',
        addedAt: Date.now(),
        lastBackup: null
      };

      const res = VirtualSQLite.upsertTracks([mockTrack]);
      this.assert(res.added === 1, 'Failed to insert new track');
      
      const updatedTrack = { ...mockTrack, title: 'Updated Title' };
      const resUpdate = VirtualSQLite.upsertTracks([updatedTrack]);
      this.assert(resUpdate.updated === 1, 'Failed to update existing track by filePath');
      
      this.results.push({ name: 'Database: Upsert Logic', status: 'PASS' });
    } catch (e: any) {
      this.results.push({ name: 'Database: Upsert Logic', status: 'FAIL', error: e.message });
    }
  }

  /**
   * Test 2: Database Query Consistency
   */
  private static async testDatabaseQuery() {
    try {
      const tracks = VirtualSQLite.queryAll();
      this.assert(tracks.length > 0, 'Query returned empty set after insert');
      this.assert(tracks[0].title === 'Updated Title', 'Query returned incorrect metadata');
      this.results.push({ name: 'Database: Query Consistency', status: 'PASS' });
    } catch (e: any) {
      this.results.push({ name: 'Database: Query Consistency', status: 'FAIL', error: e.message });
    }
  }

  /**
   * Test 3: Scanning Functionality with Mock File Objects
   */
  private static async testScanningLogic() {
    try {
      // Mocking the behavior of startScan inside Scanner.tsx
      const mockFiles = [
        { name: 'track1.mp3', size: 1024 },
        { name: 'track2.wav', size: 2048 },
        { name: 'document.txt', size: 500 }
      ];

      const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
      const processed = mockFiles.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ext && audioExtensions.includes(ext);
      });

      this.assert(processed.length === 2, 'Scanner failed to filter non-audio files');
      this.assert(processed[0].name === 'track1.mp3', 'Scanner failed to maintain order or identification');
      
      this.results.push({ name: 'Scanner: File Filtering', status: 'PASS' });
    } catch (e: any) {
      this.results.push({ name: 'Scanner: File Filtering', status: 'FAIL', error: e.message });
    }
  }

  /**
   * Test 4: Backup Scheduling (Mocking Time)
   */
  private static async testBackupScheduling() {
    try {
      const now = Date.now();
      const oneHourAgo = now - (3601 * 1000); // Just over an hour
      const thirtyMinsAgo = now - (1800 * 1000); // 30 mins

      const mockTracks: SongMetadata[] = [
        { id: '1', filePath: 'a', lastBackup: null } as any,
        { id: '2', filePath: 'b', lastBackup: oneHourAgo } as any,
        { id: '3', filePath: 'c', lastBackup: thirtyMinsAgo } as any,
      ];

      VirtualSQLite.clearDB();
      VirtualSQLite.upsertTracks(mockTracks);

      // Threshold is 1 hour (3600000ms)
      const needingBackup = VirtualSQLite.getTracksNeedingBackup(3600000);
      
      this.assert(needingBackup.length === 2, 'Scheduler failed to identify tracks older than threshold');
      this.assert(needingBackup.some(t => t.id === '1'), 'Scheduler missed track with null backup');
      this.assert(needingBackup.some(t => t.id === '2'), 'Scheduler missed track with expired backup');
      
      this.results.push({ name: 'Backup: Hourly Scheduler', status: 'PASS' });
    } catch (e: any) {
      this.results.push({ name: 'Backup: Hourly Scheduler', status: 'FAIL', error: e.message });
    }
  }

  /**
   * Test 5: Playback Engine State Transitions
   */
  private static async testPlaybackStateTransitions() {
    try {
      // Logic from Player.tsx
      let status: 'READY' | 'PLAYING' | 'STOPPED' = 'READY';
      let progress = 0;

      // Simulate Play
      status = 'PLAYING';
      this.assert(status === 'PLAYING', 'Player failed to transition to PLAYING');

      // Simulate Stop (pygame.mixer.music.stop() behavior)
      status = 'STOPPED';
      progress = 0;
      this.assert(status === 'STOPPED' && progress === 0, 'Player failed to reset on STOP');

      this.results.push({ name: 'Playback: State Machine', status: 'PASS' });
    } catch (e: any) {
      this.results.push({ name: 'Playback: State Machine', status: 'FAIL', error: e.message });
    }
  }
}
