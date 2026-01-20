
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FastForward, Volume2 } from 'lucide-react';

interface IntroOverlayProps {
  onComplete: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // The Project Musica Cinematic Intro
  const PRIMARY_VIDEO = "https://storage.googleapis.com/static.aistudio.google.com/content/202502/26/08b90150-f8ec-4607-926e-486134b22db7.mp4";
  const FALLBACK_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

  const handleCompletion = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const attemptPlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsBlocked(false);
        setHasStarted(true);
      } catch (err) {
        // Unmuted autoplay often blocked by browsers
        setIsBlocked(true);
      }
    }
  }, []);

  useEffect(() => {
    // Safety exit: proceed to app if video is stuck loading for more than 10 seconds
    const safetyTimer = setTimeout(() => {
      handleCompletion();
    }, 12000);

    attemptPlay();

    const handleSkip = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleCompletion();
      }
    };

    window.addEventListener('keydown', handleSkip);
    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleSkip);
    };
  }, [handleCompletion, attemptPlay]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden">
      <video 
        ref={videoRef}
        playsInline
        preload="auto"
        className={`w-full h-full object-contain transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}
        onEnded={handleCompletion}
        onError={(e) => {
          const video = e.currentTarget;
          if (video.src !== FALLBACK_VIDEO) {
            video.src = FALLBACK_VIDEO;
            video.load();
            video.play().catch(() => handleCompletion());
          } else {
            handleCompletion();
          }
        }}
      >
        <source src={PRIMARY_VIDEO} type="video/mp4" />
      </video>
      
      {/* Interaction Required Overlay (for unmuted audio) */}
      {isBlocked && (
        <div 
          onClick={attemptPlay}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer z-50 group"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
            <Volume2 className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="mt-8 text-white font-black text-xs uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">
            Initialize Experience
          </h2>
        </div>
      )}

      {/* Skip Controls */}
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-3 z-40">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleCompletion();
          }}
          className="flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 text-white/30 hover:text-white rounded-full hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.4em] group shadow-2xl"
        >
          <FastForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          Bypass Intro
        </button>
        <span className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em] mr-4 select-none">
          Escape or Space to Skip
        </span>
      </div>

      {/* Cinematic CRT/Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.04] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%]" />
    </div>
  );
};
