
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

/**
 * 音樂配置說明：
 * 1. 將你的免版權 MP3 文件上傳到項目根目錄。
 * 2. 將下方的 'url' 修改為你的文件名，例如：'./my-music.mp3'。
 * 3. 建議使用 128kbps 的 MP3 以保證加載速度。
 */
export const AUDIO_TRACKS: AudioTrack[] = [
  { 
    id: 'rain', 
    name: '禪意雨聲', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // 替換為你的本地路徑，如 './rain.mp3'
  },
  { 
    id: 'piano', 
    name: '空靈鋼琴', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' // 替換為你的本地路徑
  },
  { 
    id: 'wind', 
    name: '寂靜吉他', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' // 替換為你的本地路徑
  }
];

export const MOCK_CHART_DATA = Array.from({ length: 60 }, (_, i) => ({
  date: `20${19 + Math.floor(i/12)}-${(i % 12) + 1}`,
  value: 100 * Math.pow(1.015, i) + (Math.sin(i / 5) * 5)
}));
