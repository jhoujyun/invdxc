
import { GoogleGenAI, Type } from "@google/genai";
import { DenoisedResult, ChartDataPoint, GroundingSource } from "../types";

const CACHE_EXPIRY = 6 * 60 * 60 * 1000;

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const fetchMarketTrend = async (assetQuery: string, startDate: string, endDate: string): Promise<{ data: ChartDataPoint[], sources: GroundingSource[] }> => {
  // 緩存 Key 包含版本號，強制刷新舊的錯誤數據
  const cacheKey = `trend_v8_${assetQuery.replace(/\s/g, '_')}`;
  const saved = localStorage.getItem(cacheKey);
  if (saved) {
    const { data, sources, timestamp } = JSON.parse(saved);
    if (Date.now() - timestamp < CACHE_EXPIRY) return { data, sources };
  }

  try {
    const ai = getAI();
    const today = new Date();
    // 設置一個硬性的未來截止日，防止 AI 生成 2026
    const absoluteMax = "2025-12-31";
    const todayStr = today.toISOString().split('T')[0] > absoluteMax ? absoluteMax : today.toISOString().split('T')[0];
    
    const prompt = `
      現在確切時間是 ${todayStr}。
      任務：獲取「${assetQuery}」的真實歷史每月收盤價（美元）。
      如果是黃金，請提供現貨黃金 (XAU/USD) 每盎司的價格。
      
      必須提供的時間點：
      1. ${startDate} (5年前)
      2. 3年前
      3. 1年前
      4. ${todayStr} (當前最新真實市場價格)

      規則：
      - 嚴禁提供任何 2026 年或之後的數據。
      - 只返回 JSON Array: [{"date": "YYYY-MM-DD", "value": number}]
      - 不要輸出任何額外文字。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `你是一個精準的財經數據 API。當前日期是 ${todayStr}。你提供的所有數據點日期必須小於或等於 ${todayStr}。`
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri) || [];

    const text = response.text || '';
    const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (match) {
      const rawPoints = JSON.parse(match[0]);
      const validPoints = rawPoints
        .filter((p: any) => p.date && p.date <= todayStr && p.value > 0)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
      
      if (validPoints.length >= 2) {
        localStorage.setItem(cacheKey, JSON.stringify({ data: validPoints, sources, timestamp: Date.now() }));
        return { data: validPoints, sources };
      }
    }
    
    return { data: [], sources: [] };
  } catch (e) {
    console.error("fetchMarketTrend error:", e);
    return { data: [], sources: [] };
  }
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
