
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
  
  let endValue = 6100; // S&P 500 @ 2026
  let startValue = 3700; // S&P 500 @ 2021
  
  if (assetId === 'nasdaq') {
    endValue = 22000;
    startValue = 12500;
  } else if (assetId === 'dow') {
    // 道瓊斯指數 2026 年初預期
    endValue = 45000;
    startValue = 30000;
  } else if (assetId === 'bitcoin') {
    endValue = 108000;
    startValue = 32000;
  }

  for (let i = 60; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = (60 - i) / 60;
    
    // 使用非線性曲線呈現長線增長感
    const trend = startValue + (endValue - startValue) * Math.pow(progress, 1.4);
    // 輕微的隨機波動，讓曲線更有「生命感」而非直線
    const noise = (Math.random() - 0.5) * (endValue * 0.02);
    
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: Number((trend + noise).toFixed(2))
    });
  }
  return data;
};

export const MOCK_CHART_DATA = getMockData('sp500');
