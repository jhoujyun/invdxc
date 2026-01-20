
import { GoogleGenAI, Type } from "@google/genai";
import { DenoisedResult, ChartDataPoint, GroundingSource } from "../types";

const CACHE_EXPIRY = 6 * 60 * 60 * 1000;

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const fetchMarketTrend = async (assetQuery: string, startDate: string, endDate: string): Promise<{ data: ChartDataPoint[], sources: GroundingSource[] }> => {
  const cacheKey = `trend_v6_${assetQuery}_${startDate}`;
  const saved = localStorage.getItem(cacheKey);
  if (saved) {
    const { data, sources, timestamp } = JSON.parse(saved);
    if (Date.now() - timestamp < CACHE_EXPIRY) return { data, sources };
  }

  try {
    const ai = getAI();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // 策略：要求 AI 提供關鍵時間點的真實價格，由前端進行平滑處理，避免 AI 隨機生成 60 個錯誤點
    const prompt = `
      現在時間是 ${todayStr}。
      任務：獲取「${assetQuery}」在以下 6 個時間點的真實歷史收盤價（USD）：
      1. ${startDate} (5年前)
      2. 3年前
      3. 1年前
      4. 6個月前
      5. 3個月前
      6. ${todayStr} (今天/最新)

      要求：
      - 必須使用 Google Search 獲取最新的「真實市場數據」。
      - 嚴禁預測未來，嚴禁產生 ${todayStr} 之後的日期。
      - 只返回 JSON Array: [{"date": "YYYY-MM-DD", "value": number}]
      - 不要包含任何解釋文字。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一個嚴謹的財經數據庫接口，只負責抓取並回傳真實的歷史收盤價格，不進行任何預測。"
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri) || [];

    const text = response.text || '';
    const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (match) {
      const rawPoints = JSON.parse(match[0]);
      // 排序並過濾掉未來的日期（安全檢查）
      const validPoints = rawPoints
        .filter((p: any) => p.date <= todayStr)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
      
      localStorage.setItem(cacheKey, JSON.stringify({ data: validPoints, sources, timestamp: Date.now() }));
      return { data: validPoints, sources };
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
