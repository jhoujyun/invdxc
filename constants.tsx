
import React from 'react';
import { AudioTrack } from './types';

export const HEALING_QUOTES = [
  "把時間拉長，波動就會變成風景。",
  "你不需要每秒盯著市場。",
  "長期趨勢比短期噪音更誠實。",
  "堅持本身，就是一種收益。",
  "靜坐，然後看萬物生長。",
  "財富的種子需要耐心，而不是尖叫。"
];

export const AUDIO_TRACKS: AudioTrack[] = [
  { 
    id: 'rain', 
    name: '禪意雨聲', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  { 
    id: 'piano', 
    name: '空靈鋼琴', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  { 
    id: 'wind', 
    name: '寂靜吉他', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
];

export const getMockData = (assetId: string) => {
  const data = [];
  const now = new Date();
  
  // 校準 2025 年級別的真實價格數量級
  let endValue = 5000;
  let startValue = 3000;
  
  if (assetId === 'nasdaq') {
    endValue = 20000;
    startValue = 12000;
  } else if (assetId === 'gold') {
    endValue = 2700;
    startValue = 1700;
  } else if (assetId === 'bitcoin') {
    endValue = 95000;
    startValue = 45000;
  }

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = (60 - i) / 60;
    
    // 複合趨勢：基礎線性成長 + 週期性波動 + 隨機隨機噪音
    const trend = startValue + (endValue - startValue) * progress;
    const wave = Math.sin(progress * 15) * (endValue * 0.05);
    const noise = (Math.random() - 0.5) * (endValue * 0.03);
    
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: Number((trend + wave + noise).toFixed(2))
    });
  }
  return data;
};

export const MOCK_CHART_DATA = getMockData('sp500');
