import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";
import { generateQuestions, isAIConfigured } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const TOPICS = {
  coding: [
    "Data Structures - Arrays and Strings",
    "Sorting Algorithms",
    "Linked Lists",
    "Binary Trees and BST",
    "Graph Algorithms",
    "Dynamic Programming basics",
    "Object Oriented Programming",
    "SQL and Database concepts",
    "Operating System concepts",
    "Computer Networks basics",
    "Time and Space Complexity",
    "Stack and Queue operations",
    "Hashing and Hash Maps",
    "Recursion and Backtracking",
    "Java Programming concepts",
    "Python Programming concepts",
    "C++ STL and Algorithms",
  ],
  numerical: [
    "Percentage and Profit Loss",
    "Time Speed and Distance",
    "Probability and Statistics",
    "Number Series and Patterns",
    "Ratio and Proportion",
    "Simple and Compound Interest",
    "Permutation and Combination",
    "Averages and Mixtures",
    "Work and Time problems",
    "Ages and Clock problems",
    "Boats and Streams",
    "Pipes and Cisterns",
    "Data Interpretation",
  ],
  verbal: [
    "Synonyms and Antonyms",
    "Reading Comprehension",
    "Sentence Correction",
    "Para Jumbles",
    "Fill in the Blanks",
    "Analogy and Classification",
    "Idioms and Phrases",
    "One Word Substitution",
    "Active and Passive Voice",
    "Direct and Indirect Speech",
  ],
};

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "Gemini AI is not configured. Add GEMINI_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  await dbConnect();

  const results: any = { coding: 0, numerical: 0, verbal: 0, errors: [] };

  for (const category of ["coding", "numerical", "verbal"] as const) {
    const topicList = TOPICS[category];
    const topic = topicList[Math.floor(Math.random() * topicList.length)];

    try {
      // Fetch existing question texts to avoid duplicates
      const existingTexts = await Question.find({ category })
        .select("text")
        .lean()
        .then(docs => docs.map((d: any) => d.text));

      const questions = await generateQuestions(topic, category, 3, existingTexts);
      if (questions && questions.length > 0) {
        const docs = questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || "",
          category,
          difficulty: "medium",
          approved: true, // Auto-approve AI daily questions
          aiGenerated: true,
          createdAt: new Date(),
        }));

        await Question.insertMany(docs);
        results[category] = docs.length;
      }
    } catch (err: any) {
      results.errors.push(`${category}: ${err.message}`);
    }
  }

  // Set today's QotD
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingQotd = await Question.findOne({
    isQOTD: true,
    qotdDate: { $gte: today },
  });

  if (!existingQotd) {
    const randomQ = await Question.aggregate([
      { $match: { approved: true, isQOTD: false } },
      { $sample: { size: 1 } },
    ]);
    if (randomQ.length > 0) {
      await Question.findByIdAndUpdate(randomQ[0]._id, {
        isQOTD: true,
        qotdDate: today,
      });
    }
  }

  return NextResponse.json({
    message: "Daily questions generated",
    generated: results,
  });
}
