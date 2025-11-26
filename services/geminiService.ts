import { GoogleGenAI, Type } from "@google/genai";
import { FrenchTense, ConjugationChallenge } from "../types";

// Initialize the client.
// We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const fetchConjugationChallenge = async (
  selectedTenses: FrenchTense[]
): Promise<ConjugationChallenge> => {
  const tensesString = selectedTenses.join(", ");
  
  // Concise prompt to reduce token count and improve speed
  const prompt = `
    Generate a French verb conjugation table.
    
    1. Select a random common verb.
    2. Select a random tense from: [${tensesString}].
    3. Generate 6 items for pronouns: Je (or J'), Tu, Il/Elle/On, Nous, Vous, Ils/Elles.
    
    CRITICAL RULES:
    - 'pronoun': The display label. Use "J'" if the verb starts with a vowel/h-muet in this tense.
    - 'conjugation': The verb part ONLY. DO NOT include the pronoun in this field.
      - CORRECT: "suis", "ai mangé", "me lave"
      - WRONG: "Je suis", "J'ai mangé", "Je me lave"
    - Include the auxiliary for compound tenses (e.g. "ai fini").
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verb: { type: Type.STRING, description: "Infinitive" },
            translation: { type: Type.STRING, description: "English translation" },
            tense: { type: Type.STRING },
            mood: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pronoun: { type: Type.STRING, description: "e.g. Je, Tu, J'" },
                  conjugation: { type: Type.STRING, description: "Verb only, no pronoun" }
                },
                required: ["pronoun", "conjugation"]
              }
            }
          },
          required: ["verb", "translation", "tense", "mood", "items"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(response.text) as ConjugationChallenge;
    return data;
  } catch (error) {
    console.error("Error generating challenge:", error);
    // Fallback data if API fails or quota exceeded
    return {
      verb: "Avoir",
      translation: "to have",
      tense: "Présent",
      mood: "Indicatif",
      items: [
        { pronoun: "J'", conjugation: "ai" },
        { pronoun: "Tu", conjugation: "as" },
        { pronoun: "Il/Elle/On", conjugation: "a" },
        { pronoun: "Nous", conjugation: "avons" },
        { pronoun: "Vous", conjugation: "avez" },
        { pronoun: "Ils/Elles", conjugation: "ont" }
      ]
    };
  }
};