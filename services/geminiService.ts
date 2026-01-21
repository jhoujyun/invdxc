
import { GoogleGenAI, Type } from "@google/genai";
import { DenoisedResult, ChartDataPoint, GroundingSource } from "../types";

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 視角數據可以緩存更久

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const fetchMarketTrend = async (assetQuery: string, startDate: string, endDate: string): Promise<{ data: ChartDataPoint[], sources: GroundingSource[] }> => {
  const cacheKey = `vision_v9_${assetQuery.replace(/\s/g, '_')}`;
  const saved = localStorage.getItem(cacheKey);
  if (saved) {
    const { data, sources, timestamp } = JSON.parse(saved);
    if (Date.now() - timestamp < CACHE_EXPIRY) return { data, sources };
  }

  try {
    const ai = getAI();
    // 使用當前動態日期，不再硬性封鎖
    const prompt = `
      任務：獲取「${assetQuery}」的五年長線價值走勢錨點。
      
      請提供以下五個時間點的真實歷史收盤價（美元）：
      1. ${startDate} (五年前的起點)
      2. 三年前的月份
      3. 一年前的月份
      4. 半年前的月份
      5. ${endDate} (當前最新的市場真實價格)

      輸出規則：
      - 只返回 JSON Array: [{"date": "YYYY-MM", "value": number}]
      - 數據必須基於歷史事實。
      - 不要輸出任何額外解釋。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一個長線投資數據助手。你負責提供資產的歷史大框架趨勢。輸出必須是純粹的 JSON 數組。"
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri) || [];

    const text = response.text || '';
    const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (match) {
      const validPoints = JSON.parse(match[0])
        .filter((p: any) => p.date && p.value > 0)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
      
      if (validPoints.length >= 2) {
        localStorage.setItem(cacheKey, JSON.stringify({ data: validPoints, sources, timestamp: Date.now() }));
        return { data: validPoints, sources };
      }
    }
    return { data: [], sources: [] };
  } catch (e) {
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
