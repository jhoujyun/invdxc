
import React, { useState, useRef } from 'react';
import { Pause, Play, Music, ChevronRight, ChevronLeft } from 'lucide-react';
import { AUDIO_TRACKS } from '../constants';

const AudioPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const switchTrack = (e: React.MouseEvent, track: typeof AUDIO_TRACKS[0]) => {
    e.stopPropagation();
    setCurrentTrack(track);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      // 自動播放新切換的曲目
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 100);
    }
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`fixed bottom-6 left-6 z-50 flex items-center h-14 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full shadow-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden ${
        isExpanded ? 'pr-6' : 'w-14 md:w-auto md:pr-6'
      }`}
    >
      <audio ref={audioRef} src={currentTrack.url} loop />
      
      {/* 播放/暫停按鈕 - 核心控制器 */}
      <button 
        onClick={togglePlay}
        className="w-14 h-14 rounded-full flex items-center justify-center text-indigo-900 transition-all hover:scale-110 active:scale-95 shrink-0"
        title={isPlaying ? "暫停" : "播放"}
      >
        {isPlaying ? (
          <div className="relative">
            <Pause size={20} fill="currentColor" />
            <span className="absolute -inset-2 border border-indigo-500/30 rounded-full animate-ping"></span>
          </div>
        ) : (
          <Play size={20} fill="currentColor" className="ml-1" />
        )}
      </button>

      {/* 電腦端始終顯示，手機端展開後顯示 */}
      <div className={`flex items-center gap-4 transition-all duration-500 ${
        isExpanded ? 'opacity-100 translate-x-0 ml-2' : 'opacity-0 -translate-x-10 pointer-events-none md:opacity-100 md:translate-x-0 md:ml-4 md:pointer-events-auto'
      }`}>
        <div className="h-6 w-px bg-slate-300/50" />
        
        <div className="flex gap-2">
          {AUDIO_TRACKS.map(track => (
            <button
              key={track.id}
              onClick={(e) => switchTrack(e, track)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] tracking-[0.1em] transition-all font-black border ${
                currentTrack.id === track.id 
                  ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg' 
                  : 'bg-white/40 text-slate-500 border-transparent hover:border-indigo-200'
              }`}
            >
              {track.name}
            </button>
          ))}
        </div>
      </div>

      {/* 手機端提示圖標 */}
      <div className="absolute right-3 md:hidden pointer-events-none text-slate-400">
        {isExpanded ? <ChevronLeft size={12} /> : <Music size={14} className="animate-pulse" />}
      </div>
    </div>
  );
};

export default AudioPlayer;
