import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import Question from "@/models/Question";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // 1. Get roadmap progress — completed nodes
    const progressDocs = await UserProgress.find({ userId }).lean();
    const completedRoadmapData: string[] = [];

    // Get roadmap details for completed nodes
    for (const prog of progressDocs) {
      if (prog.completedNodes && prog.completedNodes.length > 0) {
        try {
          const Roadmap = (await import("@/models/Roadmap")).default;
          const roadmap = await Roadmap.findById(prog.roadmapId).lean();
          if (roadmap) {
            const rm = roadmap as any;
            completedRoadmapData.push(`Roadmap: ${rm.skill}`);
            for (const nodeIdx of prog.completedNodes) {
              if (rm.nodes && rm.nodes[nodeIdx]) {
                completedRoadmapData.push(`  - Completed: ${rm.nodes[nodeIdx].title}`);
              }
            }
          }
        } catch {}
      }
    }

    // 2. Get correctly answered questions with categories
    const correctQuestions = await Question.find({
      correctBy: userId,
    }).select("category text isHighIQ targetBranch").lean();

    const categoryBreakdown: Record<string, number> = {};
    correctQuestions.forEach((q: any) => {
      const cat = q.category || "general";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // 3. Call Gemini for AI analysis
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json({
        skills: [],
        summary: "AI analysis is not configured. Please add a Gemini API key.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const userDoc = await User.findById(userId).select("branch year").lean() as any;

    const prompt = `You are an elite, highly analytical AI Career Counselor and Skills Evaluator. Your goal is to deeply analyze the student's algorithmic progress and generate a highly accurate, complex skill matrix and career projection.

CRITICAL ALGORITHM RULES:
1. 1 completed node in a roadmap = maximum 2% to 5% proficiency. Require significant volume (20+ nodes or 50+ questions) to grant any skill confidence above 40%.
2. IGNORE and OMIT any random skills or roadmaps where the user has completed fewer than 3 nodes OR answered 0 questions. Only output their most highly progressed, actual core skills. Do not clutter the analysis with 0% or initial-exposure noise.
3. Determine their absolute BEST FIT JOBS based specifically on the crossover of their highest confident skills.
4. Be brutally honest in reasoning. Explain exactly the mathematical volume of nodes/questions that led to their ranking.

Student Info:
- Branch: ${userDoc?.branch || "Unknown"}
- Year: ${userDoc?.year || "Unknown"}

Completed Roadmap Nodes (Only assessing highly active paths):
${completedRoadmapData.length > 0 ? completedRoadmapData.join("\n") : "No roadmap nodes completed yet"}

Aptitude Performance (correctly answered questions):
${Object.entries(categoryBreakdown).map(([cat, count]) => `- ${cat}: ${count} correct`).join("\n") || "No questions answered yet"}

Total correct answers: ${correctQuestions.length}
${correctQuestions.length > 0 ? `Sample topics mastered: ${correctQuestions.slice(0, 5).map((q: any) => q.text?.substring(0, 30)).join(", ")}` : ""}

Return ONLY valid JSON exactly matching this structure:
{
  "skills": [
    {
      "name": "Skill Name",
      "confidence": 45,
      "reasoning": "You have completed 12 nodes in this field, demonstrating solid intermediate exposure.",
      "icon": "⚡"
    }
  ],
  "bestFitJobs": ["Frontend Developer", "Cloud Engineer"],
  "summary": "A complex, wonderful, and highly analytical summary of their true technical trajectory and cross-disciplinary overlaps.",
  "recommendation": "Strategic, actionable advice on which exact technologies to learn next to secure their best fit jobs."
}`;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      // Strip markdown code blocks if present
      if (text.startsWith("```json")) text = text.replace(/^```json/, "");
      if (text.startsWith("```")) text = text.replace(/^```/, "");
      if (text.endsWith("```")) text = text.replace(/```$/, "");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json(analysis);
      }
    } catch (aiError: any) {
      console.error("Skills analysis AI error:", aiError?.message);
    }

    return NextResponse.json({
      skills: [],
      summary: "Unable to generate analysis at this time. Try again later.",
      recommendation: "Continue practicing aptitude questions and completing roadmap nodes to build your profile.",
    });
  } catch (error) {
    console.error("Skills Analysis Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
