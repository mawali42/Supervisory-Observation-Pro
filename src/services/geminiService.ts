import { GoogleGenAI, Type } from "@google/genai";
import { Indicator } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY 
});

export interface GeneratedReport {
  excellence: string;
  improvement: string;
  recommendations: string;
  support: string;
}

export async function generateProfessionalReport(
  excellenceItems: Array<{ indicator: Indicator, rating: number }>,
  improvementItems: Array<{ indicator: Indicator, rating: number }>
): Promise<GeneratedReport> {
  const prompt = `
    You are a high-level educational supervisor in Oman.
    Generate a professional, distinctive, and cohesive summary for a teacher's evaluation report based on the following data.
    
    STRENGTHS (Excellence):
    ${excellenceItems.map(item => `- Standard: ${item.indicator.standard}. Rating: ${item.rating}/5. Evidence: ${item.indicator.goodEvidence}`).join('\n')}
    
    AREAS FOR DEVELOPMENT (Improvement):
    ${improvementItems.map(item => `- Standard: ${item.indicator.standard}. Rating: ${item.rating}/5. Evidence: ${item.indicator.improvementEvidence}`).join('\n')}
    
    GUIDELINES:
    1. Language: Formal Arabic (Omani Educational Context).
    2. Context: The "Strengths" section should synthesize the evidence into a professional narrative.
    3. Context: The "Areas for Development" section should be constructive and clear.
    4. Recommendations: Should be actionable, time-bound (e.g. within 2 weeks), and specific to the improvement areas.
    5. Support: Should be realistic and professional support provided by the school/supervisor.
    6. CRITICAL: Do NOT repeat the same sentences. Use varied phrasing and professional educational terminology.
    7. Format: Return a single JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            excellence: { type: Type.STRING, description: "Synthesized professional summary of strengths with evidence" },
            improvement: { type: Type.STRING, description: "Synthesized professional summary of areas for development with evidence" },
            recommendations: { type: Type.STRING, description: "Cohesive actionable and time-bound recommendations" },
            support: { type: Type.STRING, description: "Distinctive and realistic support provided to the teacher" }
          },
          required: ["excellence", "improvement", "recommendations", "support"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating report with AI:", error);
    // Fallback logic if AI fails
    return {
      excellence: excellenceItems.map(i => `في معيار (${i.indicator.standard}): ${i.indicator.goodEvidence}`).join('\n\n'),
      improvement: improvementItems.map(i => `في معيار (${i.indicator.standard}): ${i.indicator.improvementEvidence}`).join('\n\n'),
      recommendations: [...excellenceItems, ...improvementItems].map(i => i.indicator.recommendation).filter((v, i, a) => a.indexOf(v) === i).join("، و"),
      support: [...excellenceItems, ...improvementItems].map(i => i.indicator.support).filter((v, i, a) => a.indexOf(v) === i).join("، و")
    };
  }
}
