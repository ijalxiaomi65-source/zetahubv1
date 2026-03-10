import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIRecommendations = async (userWatchlist: string[]) => {
  if (userWatchlist.length === 0) return [];

  const prompt = `Based on these anime titles: ${userWatchlist.join(", ")}, suggest 5 similar anime. Return only a JSON array of strings (titles).`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const text = response.text;
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
