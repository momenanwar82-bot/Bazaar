
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter for apiKey and use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Image analysis to ensure no NSFW, violent, or prohibited content.
 */
export const analyzeImageSafety = async (base64Image: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const data = base64Image.split(',')[1] || base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { 
              text: `STRICT MODERATION TASK: Analyze this image for a premium global marketplace. 
              You MUST reject images that contain ANY of the following:
              1. WEAPONS: Firearms, ammunition, explosives, tactical knives.
              2. ILLEGAL SUBSTANCES: Drugs, paraphernalia.
              3. VIOLENCE: Graphic injuries, blood, gore.
              4. ADULT CONTENT: Nudity, suggestive imagery.
              5. HATE SPEECH: Hate symbols.

              Respond ONLY in JSON format:
              { 
                "isSafe": boolean, 
                "reason": "explanation if rejected" 
              }` 
            },
            { inlineData: { mimeType: "image/jpeg", data } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["isSafe", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"isSafe": true, "reason": ""}');
    return result;
  } catch (error) {
    console.error("AI Image Analysis Error:", error);
    return { isSafe: false, reason: "Verification service error." };
  }
};

/**
 * Recognizes product details from an image to auto-fill the listing form.
 */
export const identifyProductFromImage = async (base64Image: string): Promise<{ title: string; category: string; description: string } | null> => {
  try {
    const data = base64Image.split(',')[1] || base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { 
              text: `MARKETPLACE AUTO-FILL TASK: 
              Identify the product in this image.
              Return a concise 'title', a 'category' from the allowed list, and a short 'description'.
              
              ALLOWED CATEGORIES: ['Cars', 'Phones', 'Clothing', 'Games', 'Electronics', 'Real Estate', 'Furniture', 'Others']
              
              Respond ONLY in JSON format:
              { 
                "title": "Clear product name",
                "category": "Exact match from allowed categories",
                "description": "Short catchy description"
              }` 
            },
            { inlineData: { mimeType: "image/jpeg", data } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "category", "description"]
        }
      }
    });

    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("AI Identification Error:", error);
    return null;
  }
};

export const generateProductDescription = async (title: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional detailed marketplace description for "${title}" in "${category}". Focus on quality and key features. Minimum 100 words.`,
      config: { temperature: 0.8 }
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
};

export const negotiatePrice = async (productTitle: string, originalPrice: number, offeredPrice: number): Promise<{ status: 'accepted' | 'rejected' | 'counter', message: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Global seller for "${productTitle}" priced at $${originalPrice}. Buyer offered $${offeredPrice}. Respond as a smart professional seller.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['accepted', 'rejected', 'counter'] },
            message: { type: Type.STRING }
          },
          required: ['status', 'message']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { status: 'rejected', message: "Thanks for your offer." };
  }
};

export const getSellerStats = async (sellerName: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate realistic global seller stats for "${sellerName}" in JSON format.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { rating: 4.8, reviewsCount: 45, activeAds: 12, joinedDate: '2023' };
  }
};

export const getLiveChatResponse = async (productTitle: string, userMessage: string, chatHistory: any[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Chat about "${productTitle}". Buyer message: "${userMessage}". Respond as a polite global seller.`,
      config: { temperature: 0.8 }
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "Hello, how can I help you today?";
  }
};
