
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1,
  VolumeX,
  Repeat, 
  Shuffle,
  Maximize2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SongMetadata } from '../types';
import { FileRegistry } from '../db';

interface PlayerProps {
  song: SongMetadata | null;
  onStatusChange?: (msg: string) => void;
}

type PlaybackStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'ERROR';

const SAMPLE_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const Player: React.FC<PlayerProps> = ({ song, onStatusChange }) => {
  const [status, setStatus] = useState<PlaybackStatus>('READY');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [error, setError] = useState<string | null>(null);
  const [isSamplePlayback, setIsSamplePlayback] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume / 100;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setStatus('STOPPED');
      setProgress(0);
      if (onStatusChange) onStatusChange('Playback Finished.');
    };

    const handleError = () => {
      setStatus('ERROR');
      setError('MEDIA_ERR: File handle expired or inaccessible');
      if (onStatusChange) onStatusChange('Playback Error: Cannot access local file handle.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (song && audioRef.current) {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
        currentBlobUrl.current = null;
      }

      const actualFile = FileRegistry.get(song.id);
      let sourceUrl = '';
      let usingSample = false;

      if (actualFile) {
        currentBlobUrl.current = URL.createObjectURL(actualFile);
        sourceUrl = currentBlobUrl.current;
        usingSample = false;
      } else {
        // If file handle is lost (e.g. after refresh), use sample but notify user
        sourceUrl = SAMPLE_AUDIO_URL;
        usingSample = true;
      }

      setIsSamplePlayback(usingSample);
      audioRef.current.src = sourceUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setStatus('PLAYING');
          setError(null);
          onStatusChange?.(`Now Playing: ${song.title}`);
        })
        .catch(() => {
          setStatus('ERROR');
          setError('AUTOPLAY_BLOCKED');
          onStatusChange?.(`Playback Blocked: Browser requires interaction.`);
        });
    } else if (audioRef.current) {
      audioRef.current.pause();
      setStatus('READY');
      setProgress(0);
    }
  }, [song, onStatusChange]);

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (status === 'PLAYING') {
      audioRef.current.pause();
      setStatus('PAUSED');
    } else {
      audioRef.current.play().then(() => setStatus('PLAYING')).catch(() => setStatus('ERROR'));
    }
  }, [status]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus('STOPPED');
      setProgress(0);
    }
  }, []);

  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
      setProgress(newProgress);
    }
  }, []);

  if (!song && status === 'READY') return null;

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-6 left-64 right-6 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 z-50 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-500">
      {isSamplePlayback && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
            <Info className="w-3 h-3" />
            SESSION EXPIRED: RE-SCAN FOLDER TO PLAY LOCAL FILES
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-1/4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
            status === 'PLAYING' ? 'bg-indigo-600 rotate-3' : 'bg-slate-800'
          }`}>
            <MusicIcon className={`w-6 h-6 text-white ${status === 'PLAYING' ? 'animate-pulse' : ''}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold truncate text-white">{song?.title || 'Unknown'}</h4>
            <p className="text-slate-500 text-[10px] truncate uppercase font-bold tracking-tight">
              {isSamplePlayback ? 'Demo Sample Mode' : song?.artist}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 w-full max-w-xl">
          <div className="flex items-center gap-6">
            <button type="button" className="text-slate-400 hover:text-white transition-all active:scale-90">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              type="button"
              onClick={handleTogglePlay}
              className="w-12 h-12 bg-white text-slate-950 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              {status === 'PLAYING' ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button type="button" onClick={handleStop} className="w-8 h-8 text-slate-500 hover:text-rose-500 transition-colors">
              <Square className="w-4 h-4 fill-current" />
            </button>
            <button type="button" className="text-slate-400 hover:text-white transition-all active:scale-90">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono w-10 text-right">
              {audioRef.current ? `${Math.floor(audioRef.current.currentTime / 60)}:${Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0')}` : '0:00'}
            </span>
            <input 
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleProgressChange}
              className="flex-1 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] text-slate-500 font-mono w-10">
              {audioRef.current?.duration ? `${Math.floor(audioRef.current.duration / 60)}:${Math.floor(audioRef.current.duration % 60).toString().padStart(2, '0')}` : '0:00'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-full md:w-1/4">
          <VolumeIcon className="w-4 h-4 text-slate-400" />
          <input 
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-24 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

const MusicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
