
import { GoogleGenAI, Type } from "@google/genai";
import { Note, Todo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIProductivityInsights = async (notes: Note[], todos: Todo[]) => {
  const notesContext = notes.map(n => `Note: ${n.title} - ${n.content}`).join('\n');
  const todosContext = todos.map(t => `Task: ${t.text}, Completed: ${t.completed}, Quality: ${t.quality}`).join('\n');

  const prompt = `
    As an Executive Productivity Auditor, analyze this user's work fidelity:
    
    NOTES (Context/Ideas):
    ${notesContext}
    
    TASKS & QUALITY LOG (Results):
    ${todosContext}
    
    Your core objective is to determine if the user is completing work "Perfectly" or just "getting by".
    
    Provide exactly 3 actionable insights:
    1. Quality Audit: Analyze the "Perfect" vs "Needs Work" ratio.
    2. Pattern Recognition: Link notes/ideas to task success.
    3. Sustainability: Is the current pace sustainable?

    Be direct, professional, and data-driven.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
                  category: { type: Type.STRING, description: "One word: focus, momentum, or quality" }
                },
                required: ["title", "description", "category"]
              }
            },
            overallScore: { type: Type.NUMBER, description: "Productivity fidelity score out of 100" },
            verdict: { type: Type.STRING, description: "A short 10-word summary of current performance" }
          },
          required: ["insights", "overallScore", "verdict"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};

export const summarizeNote = async (content: string): Promise<string | null> => {
  if (!content || content.trim().length < 20) return null;

  const prompt = `
    Summarize the following note content into a structured list of 3-6 concise bullet points.
    Focus on:
    1. Main topic
    2. Key ideas/subtopics
    3. Important takeaways or conclusions
    
    Use simple, professional language. Do not add information not present in the text.
    
    CONTENT:
    ${content}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || null;
  } catch (error) {
    console.error("Summarization error:", error);
    return null;
  }
};
