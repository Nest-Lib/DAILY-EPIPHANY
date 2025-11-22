
import { GoogleGenAI, Type } from "@google/genai";
import { EpiphanyContent, EpiphanyStyle, Category } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const EPIPHANY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A poetic or profound title for the insight.",
    },
    concept: {
      type: Type.STRING,
      description: "The broad field of study or concept connected to the observation (e.g., 'Quantum Mechanics', 'The French Revolution').",
    },
    explanation: {
      type: Type.STRING,
      description: "A profound paragraph connecting the mundane observation to the concept. Use evocative, elegant language.",
    },
    fact: {
      type: Type.STRING,
      description: "A specific, verifiable 'Did you know?' fact related to the concept.",
    },
    visualPrompt: {
      type: Type.STRING,
      description: "A detailed description for an AI image generator to visualize this abstract connection artistically. 1-2 sentences.",
    },
  },
  required: ["title", "concept", "explanation", "fact", "visualPrompt"],
};

const getSystemInstruction = (style: EpiphanyStyle): string => {
  switch (style) {
    case 'scientific':
      return "You are a brilliant physicist and biologist. Connect ordinary observations to deep scientific principles (entropy, evolution, quantum mechanics) with precision and awe.";
    case 'philosophical':
      return "You are a wise existential philosopher. Connect ordinary observations to the human condition, ethics, and metaphysics (Stoicism, Nihilism, Phenomenology).";
    case 'spiritual':
      return "You are a mystic sage. Connect ordinary observations to the spiritual interconnectedness of all things, consciousness, and the divine.";
    case 'humorous':
      return "You are a stand-up comedian and satirist. Connect ordinary observations to the absurdity of the universe with wit and a slightly cynical but profound edge.";
    case 'poetic':
    default:
      return "You are a poet-philosopher. Transform ordinary observations into moments of awe by connecting them to vast topics in cosmology, history, and literature with lyrical beauty.";
  }
};

export const generateEpiphanyText = async (input: string, category: Category, style: EpiphanyStyle = 'poetic'): Promise<EpiphanyContent> => {
  try {
    const categoryContext = category !== 'Other' ? `Context: This observation relates to ${category}. ` : '';
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Connect this mundane observation to something profound about the universe: "${input}". ${categoryContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: EPIPHANY_SCHEMA,
        systemInstruction: getSystemInstruction(style),
        temperature: 0.8,
      },
    });

    let text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    return JSON.parse(text) as EpiphanyContent;
  } catch (error) {
    console.error("Text Generation Error:", error);
    throw error;
  }
};

export const generateEpiphanyImage = async (prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt + ". Cinematic lighting, high resolution, artistic style, ethereal, photorealistic, 8k.",
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return undefined;
  }
};
