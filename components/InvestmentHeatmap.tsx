
import React, { useState, useMemo, useEffect } from 'react';
import { Award, Calendar, Flame, CheckCircle2, Plus, Trash2, MessageCircle, ChevronRight, Info } from 'lucide-react';

interface Record {
  date: string; // YYYY-MM-DD
  level: number;
  note?: string;
}

const InvestmentHeatmap: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showNotePad, setShowNotePad] = useState(false);
  const [focusDay, setFocusDay] = useState<{date: string, level: number, note?: string} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('haven_invest_records');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('haven_invest_records', JSON.stringify(records));
  }, [records]);

  const addRecord = (dateString: string, level: number = 4) => {
    setRecords(prev => {
      const filtered = prev.filter(r => r.date !== dateString);
      return [...filtered, { date: dateString, level, note: note }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setFocusDay({ date: dateString, level, note: note });
    setNote('');
    setShowNotePad(false);
  };

  const clearRecords = () => {
    if (window.confirm("確定要清空所有心跡記錄嗎？這項操作無法撤銷。")) {
      setRecords([]);
      setFocusDay(null);
    }
  };

  const monthsData = useMemo(() => {
    const months = [];
    const now = new Date();
    const startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);

    let currentDate = new Date(startDate);
    let currentMonth: any = null;

    while (currentDate <= now) {
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
      const dateStr = currentDate.toISOString().split('T')[0];
      const record = records.find(r => r.date === dateStr);

      if (!currentMonth || currentMonth.key !== monthKey) {
        currentMonth = {
          key: monthKey,
          label: `${currentDate.getMonth() + 1}月`,
          days: []
        };
        months.push(currentMonth);
      }

      currentMonth.days.push({
        date: dateStr, // 修改這裡：從 dateStr 改為 date
        level: record ? record.level : 0,
        note: record?.note
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return months;
  }, [records]);

  const streak = useMemo(() => {
    let count = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    if (!records.some(r => r.date === todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (records.some(r => r.date === dStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [records]);

  const getColor = (level: number) => {
    const colors = ['bg-slate-100', 'bg-teal-100', 'bg-teal-300', 'bg-indigo-400', 'bg-indigo-900'];
    return colors[level] || colors[0];
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center animate-in fade-in duration-700 p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-widest uppercase">定投心跡</h2>
        <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          長線視角是投資者的鎧甲。在此記錄您對價值的每一次堅定。
        </p>
      </div>

      <div className="w-full mb-8 flex flex-col items-center gap-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl p-2 pl-6 rounded-full border border-indigo-100 shadow-sm w-full max-w-md">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-slate-900 font-bold focus:outline-none cursor-pointer flex-1"
            />
            <button 
              onClick={() => setShowNotePad(!showNotePad)}
              className={`p-2 rounded-full transition-all ${showNotePad ? 'bg-indigo-100 text-indigo-950' : 'text-indigo-300 hover:text-indigo-950'}`}
            >
              <MessageCircle size={18} />
            </button>
            <button 
              onClick={() => addRecord(selectedDate)}
              className="bg-indigo-900 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest hover:bg-indigo-800 transition-all shadow-md"
            >
              確認打卡
            </button>
          </div>
          <button onClick={clearRecords} className="text-[10px] text-slate-400 hover:text-rose-500 font-black uppercase tracking-widest transition-colors flex items-center gap-1">
            <Trash2 size={12} /> 清空心跡
          </button>
        </div>

        {showNotePad && (
          <div className="w-full max-w-md animate-in slide-in-from-top-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今日市場嘈雜，但我心如止水..."
              className="w-full p-4 bg-white/80 backdrop-blur-md border border-indigo-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none h-20"
            />
          </div>
        )}
      </div>

      <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 p-6 md:p-10 shadow-xl mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
          {monthsData.map((month) => (
            <div key={month.key} className="flex flex-col gap-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={10} className="text-indigo-300" />
                {month.label}
              </h3>
              <div className="grid grid-cols-7 gap-1.5">
                {month.days.map((day: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setFocusDay(day)}
                    className={`w-full aspect-square rounded-sm ${getColor(day.level)} transition-all hover:scale-125 hover:z-10 shadow-sm ${focusDay?.date === day.date ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white/10' : ''}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
             <span>雜訊</span>
             <div className="flex gap-1">
               {[0, 1, 2, 3, 4].map(l => (
                 <div key={l} className={`w-3 h-3 rounded-sm ${getColor(l)}`} />
               ))}
             </div>
             <span>定心</span>
           </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-indigo-900/90 backdrop-blur-2xl text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          {focusDay ? (
            <div className="relative z-10 animate-in fade-in slide-in-from-left-4">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-300 mb-2">焦點心跡</p>
              <h4 className="text-2xl font-bold mb-4">{focusDay.date}</h4>
              <p className="text-indigo-100 font-medium leading-relaxed italic">
                {focusDay.note ? `「${focusDay.note}」` : "這一天，你選擇了與時間為友。"}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-indigo-300 text-sm font-medium tracking-widest">點擊上方格格，回顧您的投資心路歷程。</p>
            </div>
          )}
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-8 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Flame size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">連續堅守</p>
                <p className="text-2xl font-bold text-slate-900">{streak} 天</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">累計次數</p>
                <p className="text-2xl font-bold text-slate-900">{records.length} 次</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentHeatmap;
