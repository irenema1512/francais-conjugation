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
  
  const prompt = `
    Generate a French verb conjugation practice challenge.
    
    Task:
    1. Pick a random common French verb.
    2. Pick a random tense from: [${tensesString}].
    3. Provide the full conjugation for the standard pronouns: Je (or J'), Tu, Il/Elle/On, Nous, Vous, Ils/Elles.
    
    Constraints:
    - Handle elision for the first person singular (e.g., if verb is 'Aimer', pronoun is "J'", conjugation is "aime").
    - For 'Il/Elle/On', use that string as the pronoun label, and the correct 3rd person singular form as the conjugation.
    - For 'Ils/Elles', use that string as the pronoun label.
    - If the tense involves an auxiliary (like Passé Composé), the conjugation field must include the auxiliary + participle (e.g., "ai mangé" or "suis allé(e)"). Do not include the subject pronoun in the conjugation field.

    Return the result strictly as a JSON object matching the schema.
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
            verb: { type: Type.STRING, description: "The infinitive form (e.g. Manger)" },
            translation: { type: Type.STRING, description: "English translation (e.g. to eat)" },
            tense: { type: Type.STRING },
            mood: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pronoun: { type: Type.STRING, description: "Display pronoun (e.g. Je, Tu, J')" },
                  conjugation: { type: Type.STRING, description: "The verb part only (e.g. mange, ai mangé)" }
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
    // Fallback data
    return {
      verb: "Être",
      translation: "to be",
      tense: "Présent",
      mood: "Indicatif",
      items: [
        { pronoun: "Je", conjugation: "suis" },
        { pronoun: "Tu", conjugation: "es" },
        { pronoun: "Il/Elle/On", conjugation: "est" },
        { pronoun: "Nous", conjugation: "sommes" },
        { pronoun: "Vous", conjugation: "êtes" },
        { pronoun: "Ils/Elles", conjugation: "sont" }
      ]
    };
  }
};
