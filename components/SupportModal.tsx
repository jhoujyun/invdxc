
import React, { useState } from 'react';
import { X, Heart, ShieldCheck, ChevronLeft, Coffee, CreditCard, ExternalLink, Sparkles } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DONATION_AMOUNTS = [3, 5, 10, 30, 50, 100];

interface PaymentPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  urlPattern: (amount: number) => string;
}

const PLATFORMS: PaymentPlatform[] = [
  {
    id: 'bmc',
    name: 'Buy Me a Coffee',
    description: '全球創作者首選支持平台',
    icon: <Coffee size={20} />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    urlPattern: (a) => `https://www.buymeacoffee.com/yourprofile?amount=${a}`
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    description: '支持一次性贊助，無手續費',
    icon: <Heart size={20} />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    urlPattern: (a) => `https://ko-fi.com/yourprofile?amount=${a}`
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: '全球通用的安全支付方式',
    icon: <CreditCard size={20} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    urlPattern: (a) => `https://www.paypal.me/yourprofile/${a}`
  }
];

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'amount' | 'platform'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setStep('platform');
  };

  const handlePlatformClick = (platform: PaymentPlatform) => {
    const url = platform.urlPattern(selectedAmount || 0);
    window.open(url, '_blank');
    alert(`感謝支持！正在為您開啟 ${platform.name} 的支付頁面。您的支持是我們維持定心的動力。`);
    handleClose();
  };

  const handleClose = () => {
    setStep('amount');
    setSelectedAmount(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* 模態框容器 */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white animate-in zoom-in slide-in-from-bottom-4 duration-500 overflow-hidden">
        <Sparkles className="absolute -top-10 -left-10 text-indigo-100/30 w-48 h-48 -rotate-12" />
        
        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-indigo-600 transition-colors z-10"
          aria-label="關閉"
        >
          <X size={24} />
        </button>

        {step === 'amount' ? (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
              <Heart size={32} fill="currentColor" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-widest uppercase">護航計劃</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              《定心艙》的運作依賴伺服器與 AI 算力。如果您認可這份寧靜，請考慮支持我們的持續維護。
            </p>

            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              {DONATION_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className="group flex flex-col items-center justify-center py-5 px-2 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span className="text-[10px] text-slate-400 font-black mb-1">$</span>
                  <span className="text-xl font-bold text-slate-900 group-hover:text-indigo-700">{amount}</span>
                </button>
              ))}
            </div>

            <div className="w-full flex items-center gap-4 p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <p className="text-[11px] text-emerald-800 text-left font-medium leading-relaxed">
                所有支持款項將優先用於 API 調用與伺服器成本，讓這片長線避難所始終存在。
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
            <button 
              onClick={() => setStep('amount')}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              返回修改金額 (${selectedAmount})
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-widest">選擇支持平台</h3>
            
            <div className="space-y-4">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className="w-full flex items-center justify-between p-5 rounded-[1.8rem] bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${platform.bgColor} ${platform.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                      {platform.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">{platform.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">{platform.description}</p>
                    </div>
                  </div>
                  <ExternalLink size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>

            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center italic">
              將為您開啟加密支付連結，確保交易安全
            </p>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">
            InvestHaven · 投資定心艙
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
