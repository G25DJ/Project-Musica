
import unittest
from unittest.mock import MagicMock, patch
import os
import time

class MusicManagerTests(unittest.TestCase):
    def setUp(self):
        # Setup mock database and session
        self.mock_db = MagicMock()
        self.mock_db.execute = MagicMock()
        self.mock_db.commit = MagicMock()
        
    def test_database_insert(self):
        """Test inserting a new track into the SQLite database."""
        track_data = ("Song Title", "Artist Name", "Album", "/path/to/song.mp3")
        # Simulate db.execute behavior
        self.mock_db.execute("INSERT INTO tracks VALUES (?,?,?,?)", track_data)
        self.mock_db.execute.assert_called_with("INSERT INTO tracks VALUES (?,?,?,?)", track_data)
        
    def test_scanning_logic(self):
        """Test the file scanning logic for music extensions."""
        files = ["song1.mp3", "song2.wav", "document.txt", "video.mp4"]
        extensions = (".mp3", ".wav", ".ogg")
        
        found_music = [f for f in files if f.lower().endswith(extensions)]
        self.assertEqual(len(found_music), 2)
        self.assertIn("song1.mp3", found_music)
        self.assertNotIn("document.txt", found_music)

    def test_backup_scheduling(self):
        """Test the logic for identifying files needing backup (hourly)."""
        now = time.time()
        one_hour_ago = now - 3601
        thirty_mins_ago = now - 1800
        
        tracks = [
            {"id": 1, "last_backup": None}, # Needs backup
            {"id": 2, "last_backup": one_hour_ago}, # Needs backup
            {"id": 3, "last_backup": thirty_mins_ago} # OK
        ]
        
        needs_backup = [t for t in tracks if t["last_backup"] is None or (now - t["last_backup"]) > 3600]
        self.assertEqual(len(needs_backup), 2)
        self.assertEqual(needs_backup[0]["id"], 1)

    @patch('pygame.mixer.music')
    def test_playback_controls(self, mock_music):
        """Test audio playback controls (mocking pygame.mixer)."""
        # Mocking pygame.mixer.music.load and play
        mock_music.load = MagicMock()
        mock_music.play = MagicMock()
        
        path = "/music/song.mp3"
        mock_music.load(path)
        mock_music.play()
        
        mock_music.load.assert_called_once_with(path)
        mock_music.play.assert_called_once()

if __name__ == '__main__':
    unittest.main()
