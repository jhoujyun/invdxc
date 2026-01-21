
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
  // 限制模擬數據絕不超過 2025 年底，防止日期穿越
  if (now.getFullYear() > 2025) now.setFullYear(2025);

  let endValue = 5900;
  let startValue = 3300;
  
  if (assetId === 'nasdaq') {
    endValue = 21000;
    startValue = 11000;
  } else if (assetId === 'gold') {
    // 黃金 2025 年真實水位約 $2,600-$2,800
    endValue = 2750;
    startValue = 1550;
  } else if (assetId === 'bitcoin') {
    endValue = 96000;
    startValue = 35000;
  }

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = (60 - i) / 60;
    
    // 增加一點隨機但向上的趨勢
    const trend = startValue + (endValue - startValue) * Math.pow(progress, 1.2);
    const wave = Math.sin(progress * 12) * (endValue * 0.04);
    const noise = (Math.random() - 0.5) * (endValue * 0.02);
    
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: Number((trend + wave + noise).toFixed(2))
    });
  }
  return data;
};

export const MOCK_CHART_DATA = getMockData('sp500');
