
import React, { useState } from 'react';
import { X, Heart, ShieldCheck, ChevronLeft, CreditCard, ExternalLink, Sparkles, Landmark } from 'lucide-react';

/**
 * ==========================================
 * 支付帳號配置區 (在此修改您的帳號)
 * ==========================================
 */
const SUPPORT_CONFIG = {
  // 1. PayPal.me 格式 (例如 john123)
  PAYPAL_ID: 'fanhaiyang62', 
  
  // 2. Wise (TransferWise) 支付連結 ID (例如 yourname123)
  // 前往 https://wise.com/share/me 獲取您的個人支付連結 ID
  WISE_ID: 'jod6saf',
};

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
    id: 'paypal',
    name: 'PayPal',
    description: '使用 paypal.me 快速支持',
    icon: <CreditCard size={20} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    urlPattern: (a) => `https://www.paypal.me/${SUPPORT_CONFIG.PAYPAL_ID}/${a}`
  },
  {
    id: 'wise',
    name: 'Wise',
    description: '跨國匯率最優的支持方式',
    icon: <Landmark size={20} />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    urlPattern: () => `https://wise.com/pay/me/${SUPPORT_CONFIG.WISE_ID}`
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
    handleClose();
  };

  const handleClose = () => {
    setStep('amount');
    setSelectedAmount(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white animate-in zoom-in duration-500 overflow-hidden">
        <Sparkles className="absolute -top-10 -left-10 text-indigo-100/30 w-48 h-48 -rotate-12" />
        
        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-indigo-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {step === 'amount' ? (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
              <Heart size={32} fill="currentColor" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-widest uppercase">護航計劃</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
              感謝您在 2026 年與定心艙同行。您的支持將用於維持 AI 與數據傳輸的高昂成本。
            </p>

            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              {DONATION_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className="group flex flex-col items-center justify-center py-5 px-2 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <span className="text-[10px] text-slate-400 font-black mb-1">$</span>
                  <span className="text-xl font-bold text-slate-900 group-hover:text-indigo-700">{amount}</span>
                </button>
              ))}
            </div>

            <div className="w-full flex items-center gap-4 p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <p className="text-[11px] text-emerald-800 text-left font-medium leading-relaxed">
                數據安全傳輸中。所有支持款項將專款專用於 invdxc.com 的營運維護。
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-4">
            <button 
              onClick={() => setStep('amount')}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              重新選擇金額 (${selectedAmount})
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-widest uppercase">支持平台</h3>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
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
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">
            InvestHaven · 2026 護航計劃
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
