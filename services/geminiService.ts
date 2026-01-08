
import { GoogleGenAI, Type } from "@google/genai";
import { Note, Todo } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIProductivityInsights = async (notes: Note[], todos: Todo[]) => {
  const notesContext = notes.map(n => `Note: ${n.title} - ${n.content}`).join('\n');
  const todosContext = todos.map(t => `Task: ${t.text}, Completed: ${t.completed}, Quality: ${t.quality}`).join('\n');

  const prompt = `
    As an Executive Productivity Auditor, analyze the following work patterns:
    
    NOTES (Ideation & Context):
    ${notesContext}
    
    TASKS & QUALITY LOG (Execution):
    ${todosContext}
    
    Objective: Evaluate work fidelity. Is the user focused on high-leverage tasks or busy work?
    
    Return exactly:
    1. A Fidelity Score (0-100).
    2. A 10-word punchy verdict.
    3. Three specific insights categorized as 'momentum', 'quality', or 'focus'.
  `;

  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "description", "category"]
              }
            },
            overallScore: { type: Type.NUMBER },
            verdict: { type: Type.STRING }
          },
          required: ["insights", "overallScore", "verdict"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return null;
  }
};

export const summarizeNote = async (content: string): Promise<string | null> => {
  if (!content || content.trim().length < 30) return null;
  const ai = getAIClient();
  const prompt = `Summarize this note into 3 extremely concise bullet points: ${content}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || null;
  } catch (error) {
    return null;
  }
};
