
import React, { useState } from 'react';
import { Mail, Loader2, ScrollText, Anchor, History } from 'lucide-react';
import { getAI } from '../services/geminiService';

const TimeCapsule: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSealed, setIsSealed] = useState(false);

  const handleSeal = async () => {
    if (!message.trim()) return;
    setLoading(true);
    
    try {
      const ai = getAI();
      const prompt = `我是一位在 2024 年感到焦慮的投資者，我現在想對十年後的自己說：\n\n"${message}"\n\n請你扮演「2034 年已經財務自由且心境平和的、未來的我」，寫一封回信給現在的我。
      要求：
      1. 語氣要充滿慈悲、平和與智慧。
      2. 告訴我，從十年的維度回頭看，現在這些波動（如 AI 泡沫、通脹、戰爭等）在時間長河中意味著什麼。
      3. 提醒我守住長線價值的初衷。
      4. 字數約 150-200 字，繁體中文。`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: "你是一位優雅的、深諳長期主義的長線投資大師，像查理·蒙格一樣睿智。" }
      });
      setResponse(result.text || "時間會給出最好的答案。");
      setIsSealed(true);
    } catch (e) {
      setResponse("親愛的，請閉上眼呼吸。十年後的我依然在這裡，而現在的這些漣漪，終將匯入平靜的大海。");
      setIsSealed(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessage('');
    setResponse(null);
    setIsSealed(false);
  };

  return (
    <div className="max-w-4xl w-full flex flex-col items-center px-4 animate-in fade-in duration-1000">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-widest uppercase">時光封印</h2>
        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          將當下的恐懼或希冀封存。與十年後的自己對話，看清時間的真相。
        </p>
      </div>

      {!isSealed ? (
        <div className="w-full bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white shadow-2xl relative overflow-hidden group">
          <ScrollText className="absolute -top-10 -right-10 text-slate-200/50 w-64 h-64 -rotate-12" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <Mail size={32} />
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="寫給十年後的自己... 例如：今天的波動讓我懷疑長線價值，我該堅持嗎？"
              className="w-full h-48 bg-white/60 border border-indigo-50 rounded-[2rem] p-8 text-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none mb-8"
            />
            
            <button
              onClick={handleSeal}
              disabled={loading || !message}
              className="group relative flex items-center gap-3 px-12 py-5 rounded-full bg-indigo-900 text-white font-black tracking-[0.3em] uppercase shadow-2xl hover:bg-indigo-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Anchor size={20} />}
              {loading ? "封印時光中" : "封印此刻心境"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#fdfbf7] rounded-[3.5rem] p-10 md:p-20 shadow-[-20px_20px_60px_#bebebe,20px_-20px_60px_#ffffff] border border-stone-200 relative animate-in zoom-in duration-700">
          <div className="absolute top-10 right-10 flex flex-col items-end opacity-20">
             <div className="w-20 h-20 border-4 border-stone-300 rounded-full flex items-center justify-center font-serif text-3xl font-bold text-stone-400">2034</div>
             <p className="mt-2 font-serif text-[10px] tracking-widest font-black uppercase text-stone-500">INVEST HAVEN POST</p>
          </div>

          <div className="font-serif text-slate-800 leading-[2.2] space-y-6 text-lg md:text-xl">
             <p className="font-bold border-b border-stone-200 pb-4 mb-8">來自未來的回信：</p>
             <div className="whitespace-pre-wrap italic">
               {response}
             </div>
             <p className="pt-8 text-right font-bold text-indigo-900/40 tracking-widest">—— 未來的你，敬上</p>
          </div>

          <div className="mt-16 flex justify-center">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all text-[11px] font-black tracking-widest uppercase"
            >
              <History size={16} /> 重新開啟對話
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeCapsule;
