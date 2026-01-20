
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, BarChart3, AlertCircle } from 'lucide-react';
import { getAI } from '../services/geminiService';
import { AssetOption } from '../types';

const ASSETS: AssetOption[] = [
  { id: 'sp500', label: '標普500', query: 'S&P 500 Index monthly closing price', color: '#6366f1' },
  { id: 'nasdaq', label: '納斯達克', query: 'Nasdaq 100 Index monthly closing price', color: '#10b981' },
  { id: 'gold', label: '黃金', query: 'Gold spot monthly price USD', color: '#f59e0b' },
  { id: 'btc', label: '比特幣', query: 'Bitcoin monthly closing price USD', color: '#f43f5e' },
];

const FinancialDashboard: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['sp500', 'nasdaq']);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const toggleAsset = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const fetchComparisonData = async () => {
    if (selectedIds.length === 0) {
      setChartData([]);
      return;
    }
    
    const cacheKey = `comp_v2_${selectedIds.sort().join('_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, insight, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
          setChartData(data);
          setAiInsight(insight);
          setError(null);
          return;
        }
      } catch (e) {}
    }

    setLoading(true);
    setError(null);
    try {
      const ai = getAI();
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // 構建精確的 Prompt
      const assetDescriptions = selectedIds.map(id => {
        const asset = ASSETS.find(a => a.id === id);
        return `${asset?.label} (使用鍵值: "${id}")`;
      }).join(', ');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `今天是 ${currentYearMonth}。請獲取以下資產過去 12 個月的每月收盤價原始數據：${assetDescriptions}。
        請務必返回純 JSON 數組，格式如下：
        [
          { "date": "YYYY-MM", "${selectedIds.join('": 價格數字, "')}": 價格數字 }
        ]
        注意事項：
        1. 必須嚴格使用我提供的英文鍵值（${selectedIds.join(', ')}）。
        2. 不要進行歸一化，返回原始價格數字。
        3. 只輸出 JSON，不要解釋。`,
        config: { 
          tools: [{ googleSearch: {} }],
          systemInstruction: "你是一個專業的財經數據採集員，負責從 Google Search 提取最新且準確的收盤價。必須確保 JSON 格式正確且鍵值完全匹配。" 
        }
      });
      
      const text = response.text || '';
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1) {
        const rawData = JSON.parse(text.substring(startIdx, endIdx + 1));
        
        if (Array.isArray(rawData) && rawData.length > 0) {
          // 在前端進行歸一化處理 (將第一個月設為 100)
          const firstMonth = rawData[0];
          const normalized = rawData.map(item => {
            const newItem: any = { date: item.date };
            selectedIds.forEach(id => {
              if (item[id] && firstMonth[id]) {
                newItem[id] = Number(((item[id] / firstMonth[id]) * 100).toFixed(2));
              }
            });
            return newItem;
          });

          // 獲取 AI 分析洞察
          const insightResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `根據這組資產對比數據（已歸一化，100為基準）：${JSON.stringify(normalized)}，請給出一段針對長線投資者的優雅洞察。`,
            config: { systemInstruction: "你是一個優雅的分析師。分析最近一年的趨勢，給予平靜的建議。繁體中文。" }
          });
          
          const insight = insightResponse.text || "";
          setChartData(normalized);
          setAiInsight(insight);
          localStorage.setItem(cacheKey, JSON.stringify({ data: normalized, insight, timestamp: Date.now() }));
        } else {
          throw new Error("數據格式無效");
        }
      } else {
        throw new Error("無法解析 AI 返回的 JSON");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("數據讀取超時或格式錯誤，請稍後再試。");
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
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">歸一化視角下的全球趨勢（12個月）。</p>
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
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-[10px] font-black tracking-widest text-indigo-900">同步 2025-2026 最新市場數據...</p>
              </div>
            </div>
          )}
          
          {error && !loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-rose-500 gap-4">
              <AlertCircle size={32} />
              <p className="text-sm font-bold tracking-widest">{error}</p>
              <button onClick={fetchComparisonData} className="text-xs underline text-indigo-600 font-black">點擊重試</button>
            </div>
          )}

          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [`${val}%`, '相對表現']}
                />
                <Legend iconType="circle" />
                {selectedIds.map(id => (
                  <Line 
                    key={id} 
                    type="monotone" 
                    dataKey={id} 
                    name={ASSETS.find(a => a.id === id)?.label} 
                    stroke={ASSETS.find(a => a.id === id)?.color} 
                    strokeWidth={3} 
                    dot={false} 
                    animationDuration={1500} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-300 italic">
               {!loading && !error && "選擇資產以開始即時對比"}
             </div>
          )}
        </div>

        <div className="bg-indigo-900/90 backdrop-blur-2xl text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-indigo-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">最新定心洞察</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className="text-indigo-100/80 leading-relaxed italic text-sm">
              {loading ? "正在深度掃描 2024-2025 市場..." : (aiInsight || "選擇資產以開始分析。")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
