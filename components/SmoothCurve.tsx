
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { HEALING_QUOTES, getMockData } from '../constants';
import { fetchMarketTrend } from '../services/geminiService';
import { ChartDataPoint, GroundingSource, AssetOption } from '../types';
import { Loader2, ExternalLink, RefreshCw, Compass, ArrowUpRight } from 'lucide-react';

const ASSETS: AssetOption[] = [
  { id: 'sp500', label: '標普500指數', query: 'S&P 500 Index (SPX) historical annual close values for 5 years' },
  { id: 'nasdaq', label: '納斯達克100', query: 'Nasdaq 100 Index (NDX) historical annual close values for 5 years' },
  { id: 'gold', label: '現貨黃金', query: 'Gold Spot Price (XAU/USD) historical annual close values for 5 years' },
  { id: 'bitcoin', label: '比特幣', query: 'Bitcoin (BTC/USD) historical annual close values for 5 years' }
];

const SmoothCurve: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState<AssetOption>(ASSETS[0]);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(true);

  // 根據使用者系統當前時間動態計算 5 年窗口
  const { startDate, todayStr } = useMemo(() => {
    const today = new Date();
    const start = new Date();
    start.setFullYear(today.getFullYear() - 5);
    return { 
      todayStr: today.toISOString().split('T')[0],
      startDate: start.toISOString().split('T')[0]
    };
  }, []);

  const interpolateTrend = (anchors: ChartDataPoint[]) => {
    if (anchors.length < 2) return getMockData(activeAsset.id);
    
    const fullData: ChartDataPoint[] = [];
    // 使用當前真實日期作為終點
    const finalDate = new Date();
    
    for (let i = 0; i < anchors.length - 1; i++) {
      const startPoint = anchors[i];
      const endPoint = anchors[i+1];
      const startDt = new Date(startPoint.date);
      const endDt = new Date(endPoint.date);
      
      const monthsDiff = (endDt.getFullYear() - startDt.getFullYear()) * 12 + (endDt.getMonth() - startDt.getMonth());
      
      for (let m = 0; m <= monthsDiff; m++) {
        const d = new Date(startDt.getFullYear(), startDt.getMonth() + m, 1);
        if (d > finalDate) break;

        const ratio = monthsDiff === 0 ? 1 : m / monthsDiff;
        // 使用 S 曲線或簡單插值來模擬趨勢感
        const baseValue = startPoint.value + (endPoint.value - startPoint.value) * ratio;
        const noise = (Math.random() - 0.5) * (baseValue * 0.01); 
        
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!fullData.some(p => p.date === dateStr)) {
          fullData.push({ date: dateStr, value: Number((baseValue + noise).toFixed(2)) });
        }
      }
    }
    return fullData.sort((a, b) => a.date.localeCompare(b.date));
  };

  const loadData = async (force = false) => {
    setLoading(true);
    if (force) localStorage.clear();
    try {
      const result = await fetchMarketTrend(activeAsset.query, startDate, todayStr);
      if (result.data.length >= 2) {
        setData(interpolateTrend(result.data));
        setSources(result.sources);
      } else {
        setData(getMockData(activeAsset.id));
      }
    } catch (error) {
      setData(getMockData(activeAsset.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeAsset]);

  const growthRate = useMemo(() => {
    if (data.length < 2) return 0;
    const start = data[0].value;
    const end = data[data.length - 1].value;
    return (((end - start) / start) * 100).toFixed(1);
  }, [data]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start p-4 md:p-8 min-h-0">
      <header className="mb-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-widest uppercase">五年視界</h2>
        <p className="text-slate-500 text-base md:text-xl italic font-medium tracking-wide">
          「把時間拉長，所有的回撤都只是增長的序章。」
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {ASSETS.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setActiveAsset(asset)}
            className={`px-8 py-3 rounded-full text-xs font-black tracking-widest transition-all ${
              activeAsset.id === asset.id 
                ? 'bg-indigo-900 text-white shadow-2xl scale-110' 
                : 'bg-white/80 text-indigo-800 hover:bg-indigo-50 border border-indigo-100/50'
            }`}
          >
            {asset.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主要圖表區 */}
        <div className="lg:col-span-3 h-[350px] md:h-[500px] bg-white/40 backdrop-blur-3xl rounded-[3rem] md:rounded-[5rem] p-6 md:p-14 shadow-2xl border border-white relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-[10px] tracking-[0.4em] font-black uppercase text-slate-400">對準時間座標...</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4338ca" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    hide
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px 25px' }}
                    labelStyle={{ color: '#4338ca', fontWeight: '900', fontSize: '10px' }}
                    itemStyle={{ color: '#1e1b4b', fontWeight: '800' }}
                    formatter={(v: any) => [`$${v.toLocaleString()}`, activeAsset.label]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4338ca" 
                    strokeWidth={8} 
                    fill="url(#visionGradient)" 
                    animationDuration={3000}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="flex justify-between items-end mt-8 px-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">五年前</span>
                  <span className="text-xl md:text-2xl font-black text-slate-900">${data[0]?.value.toLocaleString()}</span>
                  <span className="text-[10px] text-indigo-400 font-bold mt-1">{data[0]?.date}</span>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-px h-12 bg-slate-200 mb-2" />
                   <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.5em]">長線視角</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">今日最新</span>
                  <span className="text-xl md:text-2xl font-black text-indigo-900">${data[data.length-1]?.value.toLocaleString()}</span>
                  <span className="text-[10px] text-indigo-400 font-bold mt-1">{data[data.length-1]?.date}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 側面長線統計區 */}
        <div className="flex flex-col gap-6">
          <div className="bg-indigo-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-center flex-1">
            <Compass className="text-indigo-300 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">五年累計表現</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black">+{growthRate}%</span>
              <ArrowUpRight className="text-emerald-400" size={32} />
            </div>
            <p className="mt-6 text-sm text-indigo-100/70 leading-relaxed font-medium">
              這是時間給予{activeAsset.label}堅定持有者的回報。
            </p>
          </div>

          <button 
            onClick={() => loadData(true)}
            className="group w-full py-6 bg-white/60 hover:bg-white text-slate-400 hover:text-indigo-900 rounded-[2rem] border border-white transition-all shadow-lg flex flex-col items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            <span className="text-[10px] font-black uppercase tracking-widest">刷新歷史座標</span>
          </button>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-4 px-10">
          {sources.slice(0, 2).map((source, i) => (
            <a key={i} href={source.uri} target="_blank" className="text-[10px] text-slate-400 hover:text-indigo-900 flex items-center gap-2 transition-all font-bold uppercase tracking-widest pb-1 border-b border-transparent hover:border-indigo-100">
              來源確認: {source.title.substring(0, 30)}... <ExternalLink size={10} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmoothCurve;
