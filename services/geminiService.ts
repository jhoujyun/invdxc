
import { GoogleGenAI, Type } from "@google/genai";
import { DenoisedResult, ChartDataPoint, GroundingSource } from "../types";

const CACHE_EXPIRY = 6 * 60 * 60 * 1000;

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. AI features may not work.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {}
};

export const denoiseHeadline = async (headline: string): Promise<DenoisedResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請將以下標題「降噪」為事實描述：\n\n"${headline}"`,
      config: {
        systemInstruction: "你是一個專業的長線投資心理導師。繁體中文輸出。",
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
    return JSON.parse(response.text || '{}') as DenoisedResult;
  } catch (e) {
    return { calmDescription: "市場正在進行短期調整。", emotionLevel: 5, mindsetTip: "請保持平穩。" };
  }
};

export const generateZenWisdom = async (): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "請提供一段投資定心籤文。30字，繁體中文。",
      config: { systemInstruction: "你是一位禪修與投資大師。", temperature: 0.9 }
    });
    return response.text || "心若不動，萬風奈何。";
  } catch (e) {
    return "心若不動，萬風奈何。";
  }
};

export const fetchMarketTrend = async (assetQuery: string, startDate: string, endDate: string): Promise<{ data: ChartDataPoint[], sources: GroundingSource[] }> => {
  const cacheKey = `trend_${assetQuery}_${startDate}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    const now = new Date();
    const currentContext = `今天是 ${now.getFullYear()} 年 ${now.getMonth() + 1} 月。`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${currentContext} 請獲取 ${assetQuery} 從 ${startDate} 到 ${endDate} 的每月真實價格數據。返回 JSON 數組：[{"date": "YYYY-MM", "value": number}]。請務必使用 Google Search 獲取最新的數據，不要使用過時的訓練數據。`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一個精準的財經數據分析師，擅長從 Google Search 中提取最新的市場價格。只返回純 JSON。"
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri) || [];

    const text = response.text || '';
    // 修正：使用更穩健的方式提取 JSON 數組（尋找第一個 [ 和最後一個 ] 之間的內容）
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = text.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonStr);
      const result = { data, sources };
      if (data.length > 5) setCachedData(cacheKey, result);
      return result;
    }
    
    return { data: [], sources: [] };
  } catch (e) {
    console.error("fetchMarketTrend error:", e);
    return { data: [], sources: [] };
  }
};
