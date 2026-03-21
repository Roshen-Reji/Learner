import { GoogleGenerativeAI } from "@google/generative-ai";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "your-gemini-api-key") {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

export async function generateQuestions(
  topic: string,
  category: "coding" | "numerical" | "verbal",
  count: number = 5,
  existingTexts: string[] = [],
  context?: { isHighIQ?: boolean; branch?: string }
): Promise<any[] | null> {
  const model = getModel();
  if (!model) return null;

  const avoidSection = existingTexts.length > 0
    ? `\n\nIMPORTANT: Do NOT generate questions similar to these existing ones:\n${existingTexts.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nGenerate completely NEW and UNIQUE questions that are different from the above.`
    : "";

  let contextInstruction = "";
  if (context?.isHighIQ) {
    contextInstruction = "\nThese questions should be HIGH IQ, designed to test deep logical reasoning and lateral thinking. They should be highly advanced, resembling top-tier tech company puzzles and competitive logic challenges.";
  } else if (context?.branch) {
    contextInstruction = `\nCRITICAL: These questions MUST be strictly tailored to the latest KTU (Kerala Technological University) B.Tech syllabus for the ${context.branch} branch. Make them highly relevant for Indian engineering campus placements.`;
  }

  const prompt = `Generate ${count} multiple choice questions about "${topic}" for the category "${category}". 
Each question should have 4 options and be suitable for college students preparing for job interviews.${contextInstruction}
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
    if (!result || !result.response) return null;
    
    let text = "";
    try {
      text = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini safety block or empty text output.");
      return null;
    }

    // Strip markdown code blocks if present
    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.startsWith("```")) text = text.replace(/^```/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");
    
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // Fallback attempt to parse raw string if regex fails
    return JSON.parse(text);
  } catch (error: any) {
    console.warn("Gemini question generation error (Quota/Network):", error?.message || "Unknown error");
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
    if (!result || !result.response) return null;
    
    let text = "";
    try {
      text = result.response.text();
    } catch (e) {
      console.warn("Gemini safety block or empty text output on Roadmap.");
      return null;
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error: any) {
    console.warn("Gemini roadmap generation error (Quota/Network):", error?.message || "Unknown error");
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
    if (!result || !result.response) return "Sorry, I received an empty response.";
    
    return result.response.text();
  } catch (error: any) {
    console.warn("Gemini chat error Details:", error?.message || "Unknown error");
    return `Connection Error: ${error?.message || "Unknown API Error"}. You may have exceeded your daily quota or encountered a safety blocker.`;
  }
}

export function isAIConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return !!(apiKey && apiKey !== "your-gemini-api-key");
}
