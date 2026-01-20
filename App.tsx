
import React, { useState, useEffect } from 'react';
import { AppSection } from './types';
import FluidBackground from './components/FluidBackground';
import SmoothCurve from './components/SmoothCurve';
import FinancialDashboard from './components/FinancialDashboard';
import Denoiser from './components/Denoiser';
import InvestmentHeatmap from './components/InvestmentHeatmap';
import MeditationTimer from './components/MeditationTimer';
import TimeCapsule from './components/TimeCapsule';
import AudioPlayer from './components/AudioPlayer';
import SupportModal from './components/SupportModal';
import { generateZenWisdom } from './services/geminiService';
import { LineChart, Zap, Calendar, Heart, Quote, Share2, Check, Timer, Home, Info, X, Sparkles, Loader2, BarChart3, Anchor } from 'lucide-react';
import { HEALING_QUOTES } from './constants';

const CustomLogo = () => (
  <svg 
    viewBox="0 0 10000 10000" 
    className="w-full h-full"
    // 修复：将 fillRule 和 clipRule 移出 style，作为 React Props 传入
    fillRule="evenodd"
    clipRule="evenodd"
    style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'auto' }}
  >
    <g id="圖層_x0020_1">
      <path style={{ fill: '#517671' }} d="M4141.87 981.97l-1.93 1083.89 -0.11 1619.37c0,220.21 -30.8,266.73 69.27,465.95 115.48,229.92 271.27,444.97 475.3,604.08 76.54,59.69 260.34,176 350.63,200.13l3766.39 3.47c11.72,-1151.53 -517.92,-2199.01 -1361.88,-2958.91 -724.49,-652.33 -1334.64,-876.22 -2250.27,-1002.4 -164.77,-22.71 -887.78,-32.88 -1047.4,-15.58z"/>
      <path style={{ fill: '#517671' }} d="M4146.44 9058.91c1307.14,43.32 2298.86,-124.94 3291.99,-1025.76 381.43,-345.98 710.07,-754.93 944.38,-1215.4 244.16,-479.81 445.85,-1208.94 414.89,-1745.91 -157.42,-1.39 -3688.06,-16.98 -3771.67,9.91 -332.83,107.02 -663.41,488.17 -817.48,801.41 -95.69,194.54 -65.95,265.3 -65.96,477.57l3.85 2698.18z"/>
      <path style={{ fill: '#517671' }} d="M2976.77 5013.15c38.39,-22.86 198.53,-67.37 270.88,-103.63 249.04,-124.84 432.17,-292.89 589.12,-525.34 50.36,-74.58 96.92,-157.23 137.67,-237.44 74.87,-147.39 63.9,-141.94 63.87,-308.96 -0.05,-245 -1.19,-490.31 0.07,-740.57l-2377.06 2.3 2.09 5961.14 2373.16 -5.36c21.47,-403.78 1.74,-864.63 1.74,-1274.67l0 -1607.65c0.1,-142.97 10.34,-135.82 -52.4,-262.61 -67.75,-136.89 -146.44,-270.13 -244.86,-387.61 -106.65,-127.31 -196.99,-216.41 -336.86,-308.9 -63.52,-42.01 -134.87,-81.11 -204.51,-111.86 -45,-19.87 -205.25,-63.71 -222.91,-88.84z"/>
      <polygon style={{ fill: '#BA6E54' }} points="1663.23,2995.24 4041.28,2989.43 4038.87,976.01 1660.56,978.68 "/>
    </g>
  </svg>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [dailyQuote, setDailyQuote] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const [isWisdomLoading, setIsWisdomLoading] = useState(false);
  const [customWisdom, setCustomWisdom] = useState<string | null>(null);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(HEALING_QUOTES[dayOfYear % HEALING_QUOTES.length]);
    setUserCount(Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000);
  }, []);

  const handleDrawWisdom = async () => {
    setIsWisdomLoading(true);
    try {
      const wisdom = await generateZenWisdom();
      setCustomWisdom(wisdom);
    } catch (e) {
      setCustomWisdom("心若不動，萬風奈何。");
    } finally {
      setIsWisdomLoading(false);
    }
  };

  const copyToClipboard = () => {
    const quote = customWisdom || dailyQuote;
    const text = `「${quote}」—— 來自投資定心艙 (invdxc.com)。卸下整日波動，聽見時間迴響。`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.HOME:
        return (
          <section className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-[1500ms] px-4 w-full max-w-6xl py-2 md:py-0">
            <header className="mb-8 md:mb-14 space-y-3 md:space-y-5">
              <h1 className="text-3xl md:text-6xl font-bold tracking-[0.15em] md:tracking-[0.2em] leading-tight" style={{ color: '#BA6E54' }}>
                卸下整日的波動
              </h1>
              <p className="text-base md:text-2xl font-light tracking-[0.3em] md:tracking-[0.4em] uppercase" style={{ color: '#517671' }}>
                在此安頓投研身心
              </p>
              <div className="w-10 h-px bg-slate-300 mx-auto mt-6 md:mt-10 opacity-50" />
            </header>
            
            <article className="mb-12 md:mb-20 p-8 md:p-14 bg-white/40 backdrop-blur-md rounded-[2.5rem] md:rounded-[4rem] border border-white/60 max-w-2xl mx-auto shadow-sm relative group">
               <Quote className="absolute -top-4 -left-4 text-indigo-900/10 w-20 h-20 md:w-36 md:h-36 rotate-12" />
               <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase font-black mb-6 md:mb-10 opacity-60" style={{ color: '#517671' }}>
                 {customWisdom ? "專屬定心籤 · Zen Wisdom" : "今日定見 · Daily Zen"}
               </p>
               <blockquote className="text-lg md:text-3xl text-slate-800 font-medium leading-relaxed italic mb-8 md:mb-12 px-2">
                 「{customWisdom || dailyQuote}」
               </blockquote>
               <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                 <button 
                  onClick={handleDrawWisdom}
                  disabled={isWisdomLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white hover:opacity-90 transition-all text-[11px] font-black tracking-widest uppercase shadow-xl"
                  style={{ backgroundColor: '#BA6E54' }}
                 >
                   {isWisdomLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                   {isWisdomLoading ? "求取籤文中" : "求取定心籤"}
                 </button>
                 <button 
                  onClick={copyToClipboard}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/60 hover:bg-white transition-all text-[11px] font-black tracking-widest uppercase border"
                  style={{ color: '#517671', borderColor: '#51767133' }}
                 >
                   {copied ? <Check size={16} /> : <Share2 size={16} />}
                   {copied ? "已複製金句" : "分享此刻定見"}
                 </button>
               </div>
            </article>

            <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl mb-16 md:mb-24">
              {[
                { id: AppSection.CURVE, label: '五年視界', icon: LineChart, color: 'teal', bg: 'bg-teal-50/40 hover:bg-teal-50/70 border-teal-100/50 hover:border-teal-200', text: 'text-teal-700', labelText: 'text-teal-900' },
                { id: AppSection.DASHBOARD, label: '資產對比', icon: BarChart3, color: 'violet', bg: 'bg-violet-50/40 hover:bg-violet-50/70 border-violet-100/50 hover:border-violet-200', text: 'text-violet-700', labelText: 'text-violet-900' },
                { id: AppSection.DENOISER, label: '情緒降噪', icon: Zap, color: 'indigo', bg: 'bg-indigo-50/40 hover:bg-indigo-50/70 border-indigo-100/50 hover:border-indigo-200', text: 'text-indigo-700', labelText: 'text-indigo-900' },
                { id: AppSection.CALENDAR, label: '定投心跡', icon: Calendar, color: 'emerald', bg: 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-100/50 hover:border-emerald-200', text: 'text-emerald-700', labelText: 'text-emerald-900' },
                { id: AppSection.TIME_CAPSULE, label: '時光封印', icon: Anchor, color: 'amber', bg: 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-100/50 hover:border-amber-200', text: 'text-amber-700', labelText: 'text-amber-900' },
                { id: AppSection.MEDITATION, label: '止語冥想', icon: Timer, color: 'rose', bg: 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-100/50 hover:border-rose-200', text: 'text-rose-700', labelText: 'text-rose-900' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group flex flex-col items-center gap-3 md:gap-6 p-6 md:p-10 transition-all rounded-[1.8rem] md:rounded-[3rem] backdrop-blur-md border shadow-sm hover:shadow-xl hover:-translate-y-1 ${item.bg}`}
                >
                  <div className={`p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] group-hover:scale-110 transition-transform ${item.text}`}>
                    <item.icon size={24} className="md:w-10 md:h-10" />
                  </div>
                  <span className={`font-bold tracking-widest text-xs md:text-base ${item.labelText}`}>{item.label}</span>
                </button>
              ))}
            </nav>

            <footer className="flex flex-col items-center gap-6 md:gap-8 pb-8 md:pb-16">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                在這時，有 {userCount.toLocaleString()} 位投資者在此屏蔽噪音
              </p>
              <div className="flex items-center gap-6 md:gap-10">
                <button onClick={() => setIsSupportModalOpen(true)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest" style={{ color: '#BA6E54' }}>
                  <Heart size={16} fill="currentColor" /> 護航計劃
                </button>
                <div className="w-px h-4 bg-slate-300" />
                <button onClick={() => setActiveSection(AppSection.ABOUT)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-[11px] font-black uppercase tracking-widest">
                  <Info size={16} /> 關於艙體
                </button>
              </div>
            </footer>
          </section>
        );
      case AppSection.CURVE: return <SmoothCurve />;
      case AppSection.DASHBOARD: return <FinancialDashboard />;
      case AppSection.DENOISER: return <Denoiser />;
      case AppSection.CALENDAR: return <InvestmentHeatmap />;
      case AppSection.MEDITATION: return <MeditationTimer />;
      case AppSection.TIME_CAPSULE: return <TimeCapsule />;
      case AppSection.ABOUT:
        return (
          <div className="max-w-3xl w-full px-6 py-6 md:py-12 animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-widest text-center" style={{ color: '#BA6E54' }}>關於投資定心艙</h2>
            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 border border-white shadow-2xl space-y-6 text-slate-700 leading-relaxed text-base md:text-lg">
              <p>《投資定心艙》誕生於對現代金融噪音的反思。我們為長期主義者提供一個心靈避風港，協助投資者在波動中找回內心的秩序。</p>
              <button 
                onClick={() => setActiveSection(AppSection.HOME)}
                className="w-full py-4 mt-10 text-white rounded-full font-bold uppercase tracking-widest shadow-xl"
                style={{ backgroundColor: '#BA6E54' }}
              >
                回到定心狀態
              </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full font-sans bg-slate-50 text-slate-900 relative overflow-x-hidden">
      <FluidBackground />
      <header className="fixed top-0 left-0 w-full z-[70] px-6 py-4 md:px-12 md:py-6 flex justify-between items-center">
        <div onClick={() => setActiveSection(AppSection.HOME)} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1 md:p-2">
            <CustomLogo />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-bold tracking-[0.25em] md:tracking-[0.3em]" style={{ color: '#BA6E54' }}>投資定心艙</span>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#517671' }}>invdxc.com</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setIsSupportModalOpen(true)} className="hidden md:flex items-center gap-2 px-7 py-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[11px] font-black uppercase tracking-widest" style={{ color: '#BA6E54' }}>
             護航計劃
           </button>
           <button onClick={() => setActiveSection(activeSection === AppSection.ABOUT ? AppSection.HOME : AppSection.ABOUT)} className="p-3 md:p-4 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-md">
             {activeSection === AppSection.ABOUT ? <X size={20} /> : <Info size={20} />}
           </button>
        </div>
      </header>

      {activeSection !== AppSection.HOME && activeSection !== AppSection.ABOUT && (
        <nav className="fixed top-[100px] md:top-24 left-1/2 -translate-x-1/2 z-[80] bg-white/80 backdrop-blur-3xl border border-white rounded-full shadow-2xl px-6 py-0 h-16 flex items-center gap-8">
            {[
              { id: AppSection.CURVE, label: '視界' },
              { id: AppSection.DASHBOARD, label: '對比' },
              { id: AppSection.DENOISER, label: '降噪' },
              { id: AppSection.CALENDAR, label: '心跡' },
              { id: AppSection.TIME_CAPSULE, label: '封印' },
              { id: AppSection.MEDITATION, label: '冥想' }
            ].map((navItem) => (
              <button 
                key={navItem.id}
                onClick={() => setActiveSection(navItem.id)}
                className={`text-xs font-black uppercase tracking-widest transition-all ${
                  activeSection === navItem.id ? 'scale-110' : 'text-slate-400'
                }`}
                style={{ color: activeSection === navItem.id ? '#BA6E54' : '' }}
              >
                {navItem.label}
              </button>
            ))}
        </nav>
      )}

      <main className={`relative z-10 w-full min-h-screen flex flex-col items-center transition-all duration-1000 ${
        activeSection === AppSection.HOME ? 'pt-32 md:pt-[22vh]' : 'pt-[180px]'
      }`}>
        {renderContent()}
      </main>

      <AudioPlayer />
      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
      
      <footer className="hidden lg:block fixed bottom-10 right-14 z-50 text-right">
        <p className="text-xs font-black uppercase tracking-[0.5em] mb-1.5" style={{ color: '#517671' }}>invdxc.com</p>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">屏蔽噪音，回歸長線</p>
      </footer>
    </div>
  );
};

export default App;
