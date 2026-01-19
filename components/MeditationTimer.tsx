
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, Timer, Wind } from 'lucide-react';

const PRESET_TIMES = [
  { label: '3 分鐘', seconds: 180 },
  { label: '5 分鐘', seconds: 300 },
  { label: '10 分鐘', seconds: 600 },
  { label: '20 分鐘', seconds: 1200 },
];

const MeditationTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [totalTime, setTotalTime] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<any>(null);
  const bellAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleFinish();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
    if (bellAudio.current) {
      bellAudio.current.currentTime = 0;
      bellAudio.current.play();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleTimer = () => {
    if (isFinished) {
      resetTimer();
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
    setIsFinished(false);
  };

  const selectPreset = (seconds: number) => {
    setIsActive(false);
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 基於 viewBox (0,0,100,100) 的半徑 45 的周長為 2 * PI * 45 = 282.7
  const CIRCLE_CIRCUMFERENCE = 282.7;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * progress) / 100;

  return (
    <div className="max-w-4xl w-full flex flex-col items-center px-4 animate-in fade-in duration-1000">
      <audio ref={bellAudio} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" />
      
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-widest uppercase">止語冥想</h2>
        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          萬籟俱寂，唯有呼吸。將注意力收回到當下的圓心。
        </p>
      </div>

      {/* 核心圓環組件 */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-16">
        {/* 背景柔光裝飾 */}
        <div className={`absolute inset-0 rounded-full bg-indigo-50/30 blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

        {/* SVG 圓環：使用 viewBox 確保幾何完美 */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.05)]"
        >
          {/* 基礎軌道 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-100"
          />
          {/* 動態進度條 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            style={{ 
              strokeDashoffset,
              transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.5s ease-out'
            }}
            className="text-indigo-600"
          />
        </svg>

        {/* 物理居中文字區塊 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full select-none">
          <p className="text-7xl md:text-8xl font-extralight text-slate-900 tabular-nums leading-none tracking-tighter mb-4">
            {formatTime(timeLeft)}
          </p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400">
              {isActive ? '定心中 · ZEN' : isFinished ? '圓滿結束' : '準備就緒'}
            </span>
            {isActive && <Wind size={14} className="text-indigo-200 animate-pulse mt-1" />}
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex items-center gap-10 mb-16">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-white/40 text-slate-300 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-white active:scale-90"
          title="重置"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={toggleTimer}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95 border-8 border-white/50 ${
            isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900 text-white'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        <button
          onClick={handleFinish}
          disabled={!isActive}
          className="p-4 rounded-full bg-white/40 text-slate-300 hover:text-rose-500 hover:bg-white transition-all shadow-sm border border-white disabled:opacity-20 active:scale-90"
          title="提前結束"
        >
          <Bell size={20} />
        </button>
      </div>

      {/* 預設時間切換 */}
      <div className="flex flex-wrap justify-center gap-3">
        {PRESET_TIMES.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => selectPreset(preset.seconds)}
            disabled={isActive}
            className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all uppercase border ${
              totalTime === preset.seconds
                ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg scale-105'
                : 'bg-white/40 border-transparent text-slate-400 hover:bg-white hover:text-indigo-600'
            } disabled:opacity-50`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {isFinished && (
        <div className="mt-16 p-8 bg-indigo-900/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 text-white flex items-center gap-8 animate-in zoom-in duration-500 max-w-lg shadow-2xl">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-200 shrink-0">
            <Timer size={32} />
          </div>
          <div>
            <p className="text-xl font-bold mb-1">功德圓滿</p>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              您已完成了 {Math.floor(totalTime / 60)} 分鐘的安靜時光。內心的定力，是應對市場波動唯一的解藥。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationTimer;
