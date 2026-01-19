
import React, { useState } from 'react';
import { Search, Wind, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { denoiseHeadline } from '../services/geminiService';
import { DenoisedResult } from '../types';

const Denoiser: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DenoisedResult | null>(null);

  const handleDenoise = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await denoiseHeadline(input);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full flex flex-col items-center px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 tracking-widest">情緒降噪器</h2>
      
      <div className="w-full relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="貼上讓你焦慮的財經頭條訊息..."
          className="w-full h-40 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-xl"
        />
        <button
          onClick={handleDenoise}
          disabled={loading || !input}
          className="absolute bottom-6 right-6 p-5 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 transition-all disabled:opacity-50 shadow-lg hover:scale-105 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
        </button>
      </div>

      {result && (
        <div className="w-full mt-12 bg-white/60 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-8">
            <div className={`px-5 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase ${
              result.emotionLevel > 7 ? 'bg-rose-100 text-rose-700' : 
              result.emotionLevel > 4 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              原始焦慮等級: {result.emotionLevel}/10
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-4 font-black">事實還原 · Fact Base</p>
            <p className="text-2xl text-slate-900 leading-relaxed font-bold">{result.calmDescription}</p>
          </div>

          <div className="bg-indigo-50/50 rounded-[2.5rem] p-8 flex gap-6 items-start border border-indigo-100/30">
            <Wind className="text-indigo-400 mt-1 shrink-0" size={24} />
            <div>
              <p className="text-lg text-indigo-900 italic leading-relaxed font-medium">「{result.mindsetTip}」</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Denoiser;
