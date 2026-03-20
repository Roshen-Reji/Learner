import { GoogleGenerativeAI } from "@google/generative-ai";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "your-gemini-api-key") {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export async function generateQuestions(
  topic: string,
  category: "coding" | "numerical" | "verbal",
  count: number = 5,
  existingTexts: string[] = []
): Promise<any[] | null> {
  const model = getModel();
  if (!model) return null;

  const avoidSection = existingTexts.length > 0
    ? `\n\nIMPORTANT: Do NOT generate questions similar to these existing ones:\n${existingTexts.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nGenerate completely NEW and UNIQUE questions that are different from the above.`
    : "";

  const prompt = `Generate ${count} multiple choice questions about "${topic}" for the category "${category}". 
Each question should have 4 options and be suitable for college students preparing for job interviews.
Make each question UNIQUE, creative, and test different concepts within the topic.
Vary the difficulty — include easy, medium, and hard questions.${avoidSection}

Return ONLY valid JSON array with this format:
[
  {
    "text": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of the correct answer",
    "difficulty": "easy" | "medium" | "hard"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Gemini question generation error:", error);
    return null;
  }
}

export async function proposeRoadmap(skill: string): Promise<any | null> {
  const model = getModel();
  if (!model) return null;

  const prompt = `Create a learning roadmap for "${skill}" from beginner to advanced level for college students.
The roadmap should have 8-12 nodes/stages, each building on the previous one.

Return ONLY valid JSON with this format:
{
  "skill": "${skill}",
  "description": "Brief description of this learning path",
  "nodes": [
    {
      "title": "Node title (e.g., Variables & Data Types)",
      "description": "What the student will learn",
      "resources": ["Resource name or URL"],
      "order": 0,
      "questions": [
        {
          "text": "Quiz question for this node",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0
        }
      ]
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Gemini roadmap generation error:", error);
    return null;
  }
}

export async function chatWithAI(
  messages: { role: string; content: string }[],
  userContext?: { branch?: string; year?: number }
): Promise<string> {
  const model = getModel();
  if (!model) {
    return "AI Assistant is not configured yet. Please add your Gemini API key in the environment variables.";
  }

  const systemContext = userContext
    ? `You are an AI learning assistant for IEEE student members. The student is from ${userContext.branch} branch, Year ${userContext.year}. Help them with career guidance, learning paths, and technical questions. Be motivating and concise.`
    : "You are an AI learning assistant for IEEE student members. Help them with career guidance, learning paths, and technical questions. Be motivating and concise.";

  const chatHistory = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemContext }] },
        { role: "model", parts: [{ text: "I'm ready to help! What would you like to learn today?" }] },
        ...chatHistory.slice(0, -1),
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini chat error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    return `Connection Error: ${error.message || "Unknown API Error"}. If you see 404, please double check your API key is from Google AI Studio (aistudio.google.com) and the Generative Language API is enabled.`;
  }
}

export function isAIConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return !!(apiKey && apiKey !== "your-gemini-api-key");
}
