
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, BarChart3, Info, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AssetOption } from '../types';

const ASSETS: AssetOption[] = [
  { id: 'sp500', label: '標普500', query: 'S&P 500', color: '#6366f1' },
  { id: 'nasdaq', label: '納斯達克', query: 'Nasdaq 100', color: '#10b981' },
  { id: 'gold', label: '黃金', query: 'Gold Spot', color: '#f59e0b' },
  { id: 'btc', label: '比特幣', query: 'Bitcoin', color: '#f43f5e' },
];

const FinancialDashboard: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['sp500', 'nasdaq']);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');

  const toggleAsset = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const fetchComparisonData = async () => {
    if (selectedIds.length === 0) return;
    
    // 檢查緩存
    const cacheKey = `comp_${selectedIds.sort().join('_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, insight, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 12 * 60 * 60 * 1000) { // 12小時緩存
        setChartData(data);
        setAiInsight(insight);
        return;
      }
    }

    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `請檢索 ${selectedIds.map(id => ASSETS.find(a => a.id === id)?.label).join(', ')} 過去12個月價格走勢並歸一化。返回 JSON：[{"date": "YYYY-MM", "assetId": value}]`,
        config: { 
            tools: [{ googleSearch: {} }],
            // Note: responseMimeType: 'application/json' is omitted here because googleSearch grounding 
            // can sometimes inject citations that break pure JSON structure.
        }
      });
      
      // Fix: Use regex to safely extract the JSON array from the response text
      const text = response.text || '';
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      const insightResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `分析這些數據：${response.text}`,
        config: { systemInstruction: "你是一個優雅的分析師。繁體中文。" }
      });
      
      const insight = insightResponse.text || "";
      setChartData(data);
      setAiInsight(insight);
      
      // 寫入緩存
      localStorage.setItem(cacheKey, JSON.stringify({ data, insight, timestamp: Date.now() }));

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [selectedIds]);

  return (
    <div className="w-full max-w-6xl flex flex-col items-center px-4 md:px-8 animate-in fade-in duration-1000">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-widest uppercase">資產對比艙</h2>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">歸一化視角下的全球趨勢。</p>
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
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-2xl relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[3rem]">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          )}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              {selectedIds.map(id => (
                <Line key={id} type="monotone" dataKey={id} name={ASSETS.find(a => a.id === id)?.label} stroke={ASSETS.find(a => a.id === id)?.color} strokeWidth={3} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-indigo-900/90 backdrop-blur-2xl text-white rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-indigo-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">定心洞察</span>
          </div>
          <p className="text-indigo-100/80 leading-relaxed italic text-sm">{aiInsight || "選擇資產以分析。"}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
