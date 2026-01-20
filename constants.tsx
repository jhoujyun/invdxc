
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

/**
 * 根據資產 ID 生成具備辨識度的模擬數據
 * @param assetId 資產標識符
 */
export const getMockData = (assetId: string) => {
  const data = [];
  const now = new Date();
  
  // 為不同資產設置不同的基礎參數
  let baseValue = 100;
  let growthRate = 1.008; // 預設月成長率
  let volatility = 5;    // 預設波動率
  
  if (assetId === 'nasdaq') {
    growthRate = 1.015;
    volatility = 12;
  } else if (assetId === 'gold') {
    growthRate = 1.005;
    volatility = 4;
  } else if (assetId === 'bitcoin') {
    growthRate = 1.03;
    volatility = 35;
  }

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // 使用正弦函數模擬循環波動，並疊加隨機性
    const timeIndex = 60 - i;
    const trend = baseValue * Math.pow(growthRate, timeIndex);
    const wave = Math.sin(timeIndex / 5) * volatility;
    const noise = (Math.random() - 0.5) * (volatility / 2);
    
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: Number((trend + wave + noise).toFixed(2))
    });
  }
  return data;
};

// 為了相容性保留一個預設導出
export const MOCK_CHART_DATA = getMockData('sp500');
