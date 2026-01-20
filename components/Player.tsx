
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
  Music,
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
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
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
      } else {
        sourceUrl = SAMPLE_AUDIO_URL;
        usingSample = true;
      }

      setIsSamplePlayback(usingSample);
      audioRef.current.src = sourceUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setStatus('PLAYING');
          onStatusChange?.(`Now Playing: ${song.title}`);
        })
        .catch(() => {
          setStatus('ERROR');
        });
    }
  }, [song]);

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (status === 'PLAYING') {
      audioRef.current.pause();
      setStatus('PAUSED');
    } else {
      audioRef.current.play().then(() => setStatus('PLAYING')).catch(() => setStatus('ERROR'));
    }
  }, [status]);

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
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-64 md:right-6 bg-slate-950 md:bg-slate-900/95 backdrop-blur-2xl border-t md:border border-slate-800 p-3 md:p-4 z-50 md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        
        {/* Progress bar on top for mobile accessibility */}
        <div className="w-full flex items-center gap-2 md:hidden">
          <input 
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between md:justify-start gap-4 md:w-1/4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${
              status === 'PLAYING' ? 'bg-indigo-600 rotate-2' : 'bg-slate-800'
            }`}>
              <Music className={`w-5 h-5 md:w-6 md:h-6 text-white ${status === 'PLAYING' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs md:text-sm font-bold truncate text-white">{song?.title || 'Unknown'}</h4>
              <p className="text-slate-500 text-[9px] md:text-[10px] truncate uppercase font-bold tracking-tight">
                {song?.artist}
              </p>
            </div>
          </div>
          <button 
            onClick={handleTogglePlay}
            className="md:hidden w-10 h-10 bg-white text-slate-950 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg"
          >
            {status === 'PLAYING' ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 flex-1 max-w-xl">
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-white transition-colors"><SkipBack className="w-5 h-5 fill-current" /></button>
            <button 
              onClick={handleTogglePlay}
              className="w-11 h-11 bg-white text-slate-950 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl"
            >
              {status === 'PLAYING' ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button className="text-slate-500 hover:text-white transition-colors"><SkipForward className="w-5 h-5 fill-current" /></button>
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

        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <VolumeIcon className="w-4 h-4 text-slate-500" />
          <input 
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-20 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
