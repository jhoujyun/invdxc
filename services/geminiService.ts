
import { GoogleGenAI, Type } from "@google/genai";
import { DenoisedResult, ChartDataPoint, GroundingSource } from "../types";

// 缓存过期时间：6 小时
const CACHE_EXPIRY = 6 * 60 * 60 * 1000;

// 将实例初始化封装在函数内，确保在调用时才读取 API Key，增加部署兼容性
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getCachedData = (key: string) => {
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }
  return data;
};

const setCachedData = (key: string, data: any) => {
  localStorage.setItem(`cache_${key}`, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

export const denoiseHeadline = async (headline: string): Promise<DenoisedResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `請將以下極具煽動性或驚悚的財經新聞標題「降噪」為冷靜的事實描述：\n\n"${headline}"`,
    config: {
      systemInstruction: "你是一個專業的長線投資心理導師。你的任務是剝離財經新聞中的情緒化詞彙，將其還原為中性的、事實性的市場動態描述。請務必使用「繁體中文」輸出。",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calmDescription: { type: Type.STRING },
          emotionLevel: { type: Type.NUMBER },
          mindsetTip: { type: Type.STRING }
        },
        required: ["calmDescription", "emotionLevel", "mindsetTip"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as DenoisedResult;
  } catch (e) {
    return {
      calmDescription: "市場正在進行短期定價調整。",
      emotionLevel: 5,
      mindsetTip: "波動是市場的常態，請保持呼吸平穩。"
    };
  }
};

export const generateZenWisdom = async (): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "請為一位正在面對市場波動的長線投資者寫一段「定心籤文」。30-50字，繁體中文。",
    config: {
      systemInstruction: "你是一位精通東方禪修與長線投資哲學的大師。你的籤文應該讓人瞬間平靜。",
      temperature: 0.9,
    }
  });
  return response.text || "流水不爭先，爭的是滔滔不絕。";
};

export const fetchMarketTrend = async (assetQuery: string, startDate: string, endDate: string): Promise<{ data: ChartDataPoint[], sources: GroundingSource[] }> => {
  const cacheKey = `trend_${assetQuery}_${startDate}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `請獲取 ${assetQuery} 從 ${startDate} 到 ${endDate} 的價格數據。請在回覆中包含一個 JSON 數組段落 [{"date": "YYYY-MM", "value": 123}]。`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter((web: any) => web && web.uri) || [];

  try {
    const text = response.text || '';
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    const result = { data, sources };
    if (data.length > 0) setCachedData(cacheKey, result);
    return result;
  } catch (e) {
    return { data: [], sources: [] };
  }
};
