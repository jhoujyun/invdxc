
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { HEALING_QUOTES, getMockData } from '../constants';
import { fetchMarketTrend } from '../services/geminiService';
import { ChartDataPoint, GroundingSource, AssetOption } from '../types';
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';

const ASSETS: AssetOption[] = [
  { id: 'sp500', label: '標普500指數', query: 'S&P 500 index historical data' },
  { id: 'nasdaq', label: '納斯達克100', query: 'Nasdaq 100 index historical price' },
  { id: 'gold', label: '現貨黃金', query: 'Gold spot price historical data' },
  { id: 'bitcoin', label: '比特幣 (長線)', query: 'Bitcoin historical price chart' }
];

const SmoothCurve: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState<AssetOption>(ASSETS[0]);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 5);
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchMarketTrend(activeAsset.query, startDate, endDate);
      if (result.data && result.data.length > 0) {
        const sortedData = [...result.data].sort((a, b) => a.date.localeCompare(b.date));
        setData(sortedData);
        setSources(result.sources);
      } else {
        // AI 獲取數據失敗時，使用針對該資產生成的模擬數據
        setData(getMockData(activeAsset.id));
      }
    } catch (error) {
      console.error(error);
      setData(getMockData(activeAsset.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeAsset]);

  const chartStart = data.length > 0 ? data[0].date : startDate;
  const chartEnd = data.length > 0 ? data[data.length - 1].date : endDate;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start p-4 md:p-8 min-h-0">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-widest">五年視界</h2>
        <p className="text-slate-500 text-sm md:text-lg italic font-medium tracking-wide">「{HEALING_QUOTES[0]}」</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {ASSETS.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setActiveAsset(asset)}
            className={`px-6 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest transition-all ${
              activeAsset.id === asset.id 
                ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                : 'bg-white/60 text-indigo-600 hover:bg-indigo-50 border border-indigo-100/50'
            }`}
          >
            {asset.label}
          </button>
        ))}
      </div>

      <div className="w-full h-[300px] md:h-[400px] max-w-5xl bg-white/40 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 pb-12 shadow-2xl border border-white/60 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-[10px] tracking-[0.3em] font-black uppercase">同步全球市場趨勢...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  ticks={[data[0]?.date, data[data.length - 1]?.date]}
                  tick={{ fill: '#6366f1', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()}`, activeAsset.label]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#1e1b4b', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#4338ca', fontSize: '11px', marginBottom: '4px', fontWeight: '900' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4338ca" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="flex justify-between px-2 mt-4 text-[9px] uppercase tracking-[0.4em] text-slate-400 font-black border-t border-slate-200/50 pt-4">
              <div className="flex flex-col items-start">
                <span>五年之前</span>
                <span className="text-indigo-900 text-[10px] mt-1">{chartStart}</span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-indigo-500">{activeAsset.label} · 歷史走勢</span>
              </div>
              <div className="flex flex-col items-end">
                <span>最新收盤</span>
                <span className="text-indigo-900 text-[10px] mt-1">{chartEnd}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-6">
        <button onClick={loadData} className="flex items-center gap-3 px-6 py-2 bg-white/40 hover:bg-white/60 rounded-full border border-white text-indigo-600 text-[10px] font-black tracking-widest uppercase transition-all">
          <RefreshCw size={14} /> 刷新真實趨勢
        </button>

        {sources.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-3xl px-6">
            {sources.slice(0, 2).map((source, i) => (
              <a key={i} href={source.uri} target="_blank" className="text-[10px] text-slate-500 hover:text-indigo-900 flex items-center gap-2 transition-all font-bold uppercase tracking-widest underline decoration-indigo-200">
                {source.title.substring(0, 20)}... <ExternalLink size={10} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmoothCurve;
