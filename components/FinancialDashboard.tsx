
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, BarChart3, AlertCircle, TrendingUp, RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { getAI } from '../services/geminiService';
import { AssetOption } from '../types';
import { Type } from "@google/genai";

const ASSETS: AssetOption[] = [
  { id: 'sp500', label: '標普500', query: 'S&P 500 Index real historical monthly close price 2024-2025', color: '#6366f1' },
  { id: 'nasdaq', label: '納斯達克', query: 'Nasdaq 100 Index real historical monthly close price 2024-2025', color: '#10b981' },
  { id: 'dow', label: '道瓊斯', query: 'Dow Jones Industrial Average real historical monthly close price 2024-2025', color: '#f59e0b' },
  { id: 'btc', label: '比特幣', query: 'Bitcoin (BTC/USD) real historical monthly price 2024-2025', color: '#f43f5e' },
];

const FinancialDashboard: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['sp500', 'nasdaq']);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'real' | 'simulated'>('simulated');

  const toggleAsset = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const cleanNumber = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const processRawData = (rawData: any[]) => {
    if (!Array.isArray(rawData) || rawData.length === 0) return null;

    return rawData.map(item => {
      const newItem: any = { date: item.date || item.Date || "Unknown" };
      selectedIds.forEach(id => {
        const key = Object.keys(item).find(k => 
          k.toLowerCase() === id.toLowerCase() || 
          k.toLowerCase().includes(id.toLowerCase()) ||
          (id === 'sp500' && k.toLowerCase().includes('s&p')) ||
          (id === 'dow' && (k.toLowerCase().includes('dow') || k.toLowerCase().includes('dji')))
        );
        newItem[id] = key ? cleanNumber(item[key]) : null;
      });
      return newItem;
    }).filter(item => item.date !== "Unknown");
  };

  const fetchComparisonData = async (forceRefresh = false) => {
    if (selectedIds.length === 0) {
      setChartData([]);
      return;
    }
    
    const sortedIds = [...selectedIds].sort();
    const cacheKey = `comp_v6_${sortedIds.join('_')}`;
    
    if (forceRefresh) {
      localStorage.removeItem(cacheKey);
    } else {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, insight, timestamp, source } = JSON.parse(cached);
          if (Date.now() - timestamp < 4 * 60 * 60 * 1000) { 
            setChartData(data);
            setAiInsight(insight);
            setDataSource(source || 'real');
            setError(null);
            return;
          }
        } catch (e) {}
      }
    }

    setLoading(true);
    setError(null);
    const ai = getAI();
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const assetLabels = selectedIds.map(id => ASSETS.find(a => a.id === id)?.label).join(', ');

    try {
      let finalRawData = null;
      let usedRealSource = false;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `今天是 ${currentYearMonth}。請使用 Google Search 獲取這 ${selectedIds.length} 個資產的「真實每月收盤價」：${assetLabels}。
          時間範圍：過去 12 個月。
          鍵名要求：必須使用 [${selectedIds.join(', ')}]。
          輸出格式要求：僅返回一個 JSON Array，例如 [{"date": "2024-01", "sp500": 4800, "btc": 42000}]。`,
          config: { tools: [{ googleSearch: {} }] }
        });
        const text = response.text || '';
        const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) {
          finalRawData = JSON.parse(match[0]);
          usedRealSource = true;
        }
      } catch (e) {
        console.warn("Real-time search failed...");
      }

      if (!finalRawData) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `請估計並返回 ${assetLabels} 在過去 12 個月的每月收盤價格數據。`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  ...Object.fromEntries(selectedIds.map(id => [id, { type: Type.NUMBER }]))
                },
                required: ["date", ...selectedIds]
              }
            }
          }
        });
        finalRawData = JSON.parse(response.text || '[]');
      }

      const processed = processRawData(finalRawData);
      
      if (processed && processed.length > 0) {
        const firstValid: any = {};
        selectedIds.forEach(id => {
          const firstPoint = processed.find(p => p[id] !== null && p[id] !== 0);
          firstValid[id] = firstPoint ? firstPoint[id] : 1;
        });

        const normalized = processed.map(item => {
          const newItem: any = { date: item.date };
          selectedIds.forEach(id => {
            if (item[id] !== null) {
              newItem[id] = Number(((item[id] / firstValid[id]) * 100).toFixed(2));
            } else {
              newItem[id] = 100;
            }
          });
          return newItem;
        });

        const insightResp = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `分析這組資產最近一年的歸一化表現（100為起點）：${JSON.stringify(normalized)}。`,
          config: { systemInstruction: "你是一位優雅的財經導師，擅長從數據中看透時間的價值。請用簡短有力的話語給予投資者定力。" }
        });
        
        const insight = insightResp.text || "時間是價值最好的洗滌劑。";
        setChartData(normalized);
        setAiInsight(insight);
        setDataSource(usedRealSource ? 'real' : 'simulated');
        localStorage.setItem(cacheKey, JSON.stringify({ 
          data: normalized, 
          insight, 
          timestamp: Date.now(),
          source: usedRealSource ? 'real' : 'simulated'
        }));
      } else {
        throw new Error("數據解析失敗");
      }
    } catch (err) {
      setError("正在切換至內核備份模式...");
      setDataSource('simulated');
      const fallback = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const dp: any = { date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
        selectedIds.forEach((id, idx) => {
          const trend = 100 + i * (0.8 + idx * 0.2);
          const noise = Math.sin(i * 0.5 + idx) * 2;
          dp[id] = Number((trend + noise).toFixed(2));
        });
        return dp;
      });
      setChartData(fallback);
      setAiInsight("外界的數據傳輸偶爾會有波動，但市場的長期價值規規律是恆定的。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [selectedIds]);

  return (
    <div className="w-full max-w-6xl flex flex-col items-center px-4 md:px-8 animate-in fade-in duration-1000">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-widest uppercase">資產對比艙</h2>
        <div className="flex items-center justify-center gap-4 text-slate-500">
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest">
             {dataSource === 'real' ? (
               <><Wifi size={12} className="text-emerald-500" /> 實時數據鏈結中</>
             ) : (
               <><WifiOff size={12} className="text-amber-500" /> 內核模式運行</>
             )}
           </div>
           <div className="w-px h-3 bg-slate-200" />
           <p className="text-sm font-medium">歸一化趨勢 (最近12個月)</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {ASSETS.map(asset => (
          <button
            key={asset.id}
            onClick={() => toggleAsset(asset.id)}
            className={`px-6 py-2.5 rounded-full text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 border ${
              selectedIds.includes(asset.id)
                ? 'bg-indigo-900 border-indigo-900 text-white shadow-xl scale-105'
                : 'bg-white/40 border-indigo-100 text-slate-400 hover:bg-white hover:text-indigo-600'
            }`}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }} />
            {asset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-2xl relative min-h-[400px] flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[3rem]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-[10px] font-black tracking-widest text-indigo-900">同步全球真實心跳...</p>
              </div>
            </div>
          )}
          
          {chartData.length > 0 ? (
            <div className="w-full h-full flex flex-col">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', padding: '16px' }}
                    formatter={(val: number) => [`${val}%`, '相對基準點']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px' }} />
                  {selectedIds.map(id => (
                    <Line 
                      key={id} 
                      type="monotone" 
                      dataKey={id} 
                      name={ASSETS.find(a => a.id === id)?.label} 
                      stroke={ASSETS.find(a => a.id === id)?.color} 
                      strokeWidth={4} 
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-center text-slate-400 font-black tracking-[0.3em] mt-4 uppercase">
                基準值 100% 代表 12 個月前的起點價格
              </p>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-4 text-slate-300 italic">
               <AlertCircle size={40} />
               <span>{error || "請選擇資產以載入數據"}</span>
             </div>
          )}
        </div>

        <div className="bg-indigo-900/90 backdrop-blur-2xl text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-indigo-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">定心洞察 · Insight</span>
          </div>
          <div className="flex-1">
            <p className="text-indigo-100/90 leading-relaxed italic text-sm font-medium">
              {loading ? "正在深度掃描全球趨勢..." : (aiInsight || "選擇資產以開始分析。")}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <button 
              onClick={() => fetchComparisonData(true)}
              disabled={loading}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors disabled:opacity-30"
            >
              <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> 強制刷新鏈結
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
