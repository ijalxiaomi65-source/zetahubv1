import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIRecommendations = async (history: any[]) => {
  try {
    if (!process.env.GEMINI_API_KEY) return [];
    if (history.length === 0) return [];

    const titles = history.map(h => h.title).join(", ");
    const prompt = `Based on these anime/dramas I've watched: ${titles}. Recommend 5 similar anime or Korean dramas. Return only a JSON array of objects with "title" and "reason" properties.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["title", "reason"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Recommendations error:", error);
    return [];
  }
};
