
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
import { LineChart, Zap, Calendar, Heart, Quote, Share2, Check, Timer, Home, Compass, Info, X, Sparkles, Loader2, BarChart3, Anchor } from 'lucide-react';
import { HEALING_QUOTES } from './constants';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [dailyQuote, setDailyQuote] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  // AI Wisdom States
  const [isWisdomLoading, setIsWisdomLoading] = useState(false);
  const [customWisdom, setCustomWisdom] = useState<string | null>(null);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(HEALING_QUOTES[dayOfYear % HEALING_QUOTES.length]);

    const randomCount = Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000;
    setUserCount(randomCount);
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
    const text = `「${quote}」—— 來自投資定心艙 (invdxc.com)。卸下整日波動，聽見時間迴響。目前已有 ${userCount.toLocaleString()} 位投資者在此屏蔽噪音。`;
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
              <h1 className="text-3xl md:text-6xl font-bold text-slate-900 tracking-[0.15em] md:tracking-[0.2em] leading-tight drop-shadow-sm">
                卸下整日的波動
              </h1>
              <p className="text-base md:text-2xl text-slate-500 font-light tracking-[0.3em] md:tracking-[0.4em] uppercase">
                在此安頓投研身心
              </p>
              <div className="w-10 h-px bg-slate-300 mx-auto mt-6 md:mt-10 opacity-50" aria-hidden="true" />
            </header>
            
            <article className="mb-12 md:mb-20 p-8 md:p-14 bg-white/40 backdrop-blur-md rounded-[2.5rem] md:rounded-[4rem] border border-white/60 max-w-2xl mx-auto shadow-sm relative group overflow-hidden">
               <Quote className="absolute -top-4 -left-4 text-indigo-900/10 w-20 h-20 md:w-36 md:h-36 rotate-12 group-hover:rotate-0 transition-transform duration-1000" aria-hidden="true" />
               <p className="text-indigo-600/60 text-[10px] md:text-[11px] tracking-[0.5em] uppercase font-black mb-6 md:mb-10">
                 {customWisdom ? "專屬定心籤 · Zen Wisdom" : "今日定見 · Daily Zen"}
               </p>
               
               <blockquote className="text-lg md:text-3xl text-slate-800 font-medium leading-relaxed italic mb-8 md:mb-12 px-2 animate-in fade-in duration-1000">
                 「{customWisdom || dailyQuote}」
               </blockquote>
               
               <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                 <button 
                  onClick={handleDrawWisdom}
                  disabled={isWisdomLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 transition-all text-[11px] font-black tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                 >
                   {isWisdomLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                   {isWisdomLoading ? "求取籤文中" : "求取定心籤"}
                 </button>

                 <button 
                  onClick={copyToClipboard}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/60 hover:bg-white text-indigo-600 transition-all text-[11px] font-black tracking-widest uppercase border border-indigo-100"
                 >
                   {copied ? <Check size={16} /> : <Share2 size={16} />}
                   {copied ? "已複製金句" : "分享此刻定見"}
                 </button>
               </div>
            </article>

            <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl mb-16 md:mb-24" aria-label="主要功能選單">
              {[
                { id: AppSection.CURVE, label: '五年視界', icon: LineChart, color: 'teal' },
                { id: AppSection.DASHBOARD, label: '資產對比', icon: BarChart3, color: 'violet' },
                { id: AppSection.DENOISER, label: '情緒降噪', icon: Zap, color: 'indigo' },
                { id: AppSection.CALENDAR, label: '定投心跡', icon: Calendar, color: 'emerald' },
                { id: AppSection.TIME_CAPSULE, label: '時光封印', icon: Anchor, color: 'amber' },
                { id: AppSection.MEDITATION, label: '止語冥想', icon: Timer, color: 'rose' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group flex flex-col items-center gap-3 md:gap-6 p-6 md:p-10 bg-${item.color}-50/40 hover:bg-${item.color}-50/70 transition-all rounded-[1.8rem] md:rounded-[3rem] backdrop-blur-md border border-${item.color}-100/50 hover:border-${item.color}-200 shadow-sm hover:shadow-xl hover:-translate-y-1`}
                >
                  <div className={`p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] group-hover:scale-110 transition-transform shadow-sm text-${item.color}-700`}>
                    <item.icon size={24} className="md:w-10 md:h-10" />
                  </div>
                  <span className={`text-${item.color}-900 font-bold tracking-widest text-xs md:text-base`}>{item.label}</span>
                </button>
              ))}
            </nav>

            <footer className="flex flex-col items-center gap-6 md:gap-8 pb-8 md:pb-16">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                在這時，有 {userCount.toLocaleString()} 位投資者在此屏蔽噪音
              </p>
              <div className="flex items-center gap-6 md:gap-10">
                <button 
                  onClick={() => setIsSupportModalOpen(true)}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors text-[11px] font-black uppercase tracking-widest"
                >
                  <Heart size={16} fill="currentColor" /> 支持維護
                </button>
                <div className="w-px h-4 bg-slate-300" />
                <button 
                  onClick={() => setActiveSection(AppSection.ABOUT)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-[11px] font-black uppercase tracking-widest"
                >
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
          <div className="max-w-3xl w-full px-6 py-6 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 tracking-widest text-center">關於投資定心艙</h2>
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 border border-white shadow-2xl space-y-6 text-slate-700 leading-relaxed text-base md:text-lg text-left">
              <p>《投資定心艙》(InvestHaven Focus Capsule) 誕生於對現代金融噪音的反思。在資訊爆炸與高頻交易的時代，長線投資者的心智正經受前所未有的考驗。</p>
              <p>我們結合了水墨美學、人工智慧降噪技術與冥想心理學，旨在為長期主義者創造一個暫時逃離波動的避風港。在這裡，數據不再是焦慮的來源，而是時間的刻度。</p>
              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-900 mb-5 text-center md:text-left">設計理念</h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4"><div className="w-2.5 h-2.5 bg-indigo-400 rounded-full mt-2 shrink-0" /> <div><strong>金融降噪：</strong> 利用 AI 剝離情緒，還原市場事實，冷靜面對頭條訊息。</div></li>
                  <li className="flex items-start gap-4"><div className="w-2.5 h-2.5 bg-indigo-400 rounded-full mt-2 shrink-0" /> <div><strong>長線視界：</strong> 將視野從秒針撥向年針，緩解短視焦慮，洞察大趨勢。</div></li>
                  <li className="flex items-start gap-4"><div className="w-2.5 h-2.5 bg-indigo-400 rounded-full mt-2 shrink-0" /> <div><strong>心智紀律：</strong> 通過定投心跡打卡與止語冥想，內化堅守價值的習慣。</div></li>
                </ul>
              </div>
              <button 
                onClick={() => setActiveSection(AppSection.HOME)}
                className="w-full py-4 md:py-6 mt-10 bg-indigo-900 text-white rounded-full font-bold uppercase tracking-widest hover:bg-indigo-800 transition-all shadow-xl"
              >
                回到定心狀態
              </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const navItems = [
    { id: AppSection.CURVE, label: '五年視界' },
    { id: AppSection.DASHBOARD, label: '資產對比' },
    { id: AppSection.DENOISER, label: '情緒降噪' },
    { id: AppSection.CALENDAR, label: '定投心跡' },
    { id: AppSection.TIME_CAPSULE, label: '時光封印' },
    { id: AppSection.MEDITATION, label: '止語冥想' }
  ];

  return (
    <div className="min-h-screen w-full font-sans bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      <FluidBackground />
      
      <header className="fixed top-0 left-0 w-full z-[70] px-6 py-4 md:px-12 md:py-6 flex justify-between items-center pointer-events-none">
        <div 
          onClick={() => setActiveSection(AppSection.HOME)}
          className="flex items-center gap-3 cursor-pointer pointer-events-auto group"
          aria-label="投資定心艙首頁"
        >
          <div className="w-10 h-10 md:w-14 md:h-14 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Compass className="text-indigo-900 w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-bold tracking-[0.25em] md:tracking-[0.3em] text-slate-900">投資定心艙</span>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">invdxc.com</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
           <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-7 py-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:bg-white/60 transition-all shadow-md"
           >
             護航計劃
           </button>
           <button 
              onClick={() => setActiveSection(activeSection === AppSection.ABOUT ? AppSection.HOME : AppSection.ABOUT)}
              className={`p-3 md:p-4 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-md hover:bg-white/60 transition-all ${activeSection === AppSection.ABOUT ? 'text-indigo-600' : 'text-slate-400'}`}
              aria-label="關於定心艙"
           >
             {activeSection === AppSection.ABOUT ? <X size={20} className="md:w-6 md:h-6" /> : <Info size={20} className="md:w-6 md:h-6" />}
           </button>
        </div>
      </header>
      
      {activeSection !== AppSection.HOME && activeSection !== AppSection.ABOUT && (
        <nav className="fixed top-[100px] md:top-[110px] lg:top-20 left-1/2 -translate-x-1/2 z-[80] bg-white/80 backdrop-blur-3xl border border-white/90 rounded-[2rem] lg:rounded-full shadow-2xl p-3 lg:px-12 lg:py-0 lg:h-20 flex flex-col lg:flex-row items-center gap-1 lg:gap-10 animate-in slide-in-from-top-10 duration-700 w-[92vw] lg:w-fit">
          
          <div className="flex items-center w-full lg:w-auto px-2 lg:px-0">
            <button 
              onClick={() => setActiveSection(AppSection.HOME)}
              className="text-slate-500 hover:text-indigo-600 transition-all p-2 lg:p-4 shrink-0"
              aria-label="回到首頁"
            >
              <Home size={22} />
            </button>
            <div className="w-px h-5 bg-slate-300 mx-4 opacity-40 lg:hidden" aria-hidden="true" />
            <span className="text-[9px] font-black text-indigo-900/40 uppercase tracking-[0.4em] lg:hidden">定心導航</span>
          </div>
          
          <div className="hidden lg:block w-px h-8 bg-slate-300 shrink-0 opacity-40" aria-hidden="true" />
          
          <div className="grid grid-cols-3 lg:flex items-center gap-x-6 gap-y-1 lg:gap-14 px-1 lg:px-2 py-1 lg:py-0 w-full lg:w-auto">
             {navItems.map((navItem) => (
               <button 
                  key={navItem.id}
                  onClick={() => setActiveSection(navItem.id)}
                  className={`text-[9.5px] lg:text-sm font-black uppercase tracking-wider lg:tracking-widest transition-all py-2 px-1 border-b-2 text-center whitespace-nowrap overflow-hidden text-ellipsis ${
                    activeSection === navItem.id 
                      ? 'text-indigo-600 border-indigo-600 scale-105' 
                      : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
               >
                 {navItem.label}
               </button>
             ))}
          </div>
        </nav>
      )}

      <main className={`relative z-10 w-full min-h-screen flex flex-col items-center transition-all duration-1000 ${
        activeSection === AppSection.HOME 
          ? 'justify-start pt-32 md:pt-[22vh] pb-8 md:pb-16' 
          : 'justify-start pt-[290px] md:pt-[330px] lg:pt-[200px] pb-20'
      }`}>
        {renderContent()}
      </main>

      <AudioPlayer />
      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
      
      <footer className="hidden lg:block fixed bottom-10 right-14 z-50 text-right pointer-events-none md:pointer-events-auto">
        <p className="text-xs text-slate-400 font-black uppercase tracking-[0.5em] mb-1.5">invdxc.com</p>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">屏蔽噪音，回歸長線</p>
      </footer>
    </div>
  );
};

export default App;
