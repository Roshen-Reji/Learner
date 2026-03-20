import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";
import { generateQuestions } from "@/lib/gemini";

function formatQuestionClient(q: any, userId: string | null) {
  const qObj = q.toObject ? q.toObject() : q;
  const attempted = userId
    ? (qObj.attemptedBy || []).some((id: any) => id.toString() === userId.toString())
    : false;
  const isCorrect = userId
    ? (qObj.correctBy || []).some((id: any) => id.toString() === userId.toString())
    : false;

  if (attempted) {
    return { ...qObj, attempted, isCorrect };
  } else {
    const { correctIndex, explanation, correctBy, attemptedBy, ...rest } = qObj;
    return { ...rest, attempted: false, isCorrect: false };
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const userId = session ? (session.user as any).id : null;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "coding";
  const mode = searchParams.get("mode") || "qotd";
  const pendingApproval = searchParams.get("pending") === "true";
  const allApproved = searchParams.get("all") === "true";

  // Admin: fetch ALL approved questions (for CRUD panel)
  if (allApproved) {
    if (!session || (session.user as any).role !== "moderator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const filterCategory = searchParams.get("filterCategory");
    const filter: any = { approved: true };
    if (filterCategory && filterCategory !== "all") filter.category = filterCategory;
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(questions);
  }

  // Admin: fetch pending questions
  if (pendingApproval) {
    if (!session || (session.user as any).role !== "moderator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const questions = await Question.find({ approved: false }).sort({ createdAt: -1 });
    return NextResponse.json(questions);
  }

  // ─── QUESTION OF THE DAY ───
  if (mode === "qotd") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today's QOTD already exists for this category
    let question = await Question.findOne({
      category,
      isQOTD: true,
      qotdDate: { $gte: today },
      approved: true,
    });

    if (!question) {
      // Try to pick an unused approved question that has NEVER been QOTD
      question = await Question.findOne({
        category,
        approved: true,
        isQOTD: false,
      }).sort({ createdAt: 1 }); // oldest first to cycle through

      if (question) {
        question.isQOTD = true;
        question.qotdDate = today;
        await question.save();
      } else {
        // No unused questions left — generate a fresh one via AI
        try {
          const existingTexts = await Question.find({ category, approved: true })
            .select("text")
            .lean()
            .then(docs => docs.map((d: any) => d.text));

          const TOPICS: Record<string, string[]> = {
            coding: ["Data Structures", "Algorithms", "OOP", "System Design", "SQL", "OS Concepts", "Networks"],
            numerical: ["Percentages", "Probability", "Time Speed Distance", "Number Series", "Ratio Proportion"],
            verbal: ["Synonyms Antonyms", "Reading Comprehension", "Sentence Correction", "Analogies"],
          };
          const topicList = TOPICS[category] || TOPICS.coding;
          const topic = topicList[Math.floor(Math.random() * topicList.length)];

          const generated = await generateQuestions(
            topic,
            category as "coding" | "numerical" | "verbal",
            1,
            existingTexts
          );

          if (generated && generated.length > 0) {
            question = await Question.create({
              ...generated[0],
              category,
              approved: true,
              aiGenerated: true,
              isQOTD: true,
              qotdDate: today,
            });
          }
        } catch (err) {
          console.error("Auto-QOTD generation failure:", err);
        }
      }
    }

    if (question) {
      return NextResponse.json([formatQuestionClient(question, userId)]);
    }
    return NextResponse.json([]);
  }

  // ─── 5-MINUTE SPRINT (weekly rotation) ───
  if (mode === "sprint") {
    // Use a weekly seed so the same 5 questions appear all week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday of this week
    const weekSeed = Math.floor(weekStart.getTime() / 1000);

    // Get all eligible questions for this category (exclude today's QOTD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allQuestions = await Question.find({
      category,
      approved: true,
      $or: [
        { isQOTD: false },
        { qotdDate: { $lt: today } }, // old QOTDs are fine
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    if (allQuestions.length === 0) {
      return NextResponse.json([]);
    }

    // Deterministic weekly selection using seed
    const selected: any[] = [];
    const pool = [...allQuestions];
    let seed = weekSeed;
    for (let i = 0; i < Math.min(5, pool.length); i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const idx = seed % pool.length;
      selected.push(pool.splice(idx, 1)[0]);
    }

    const annotated = selected.map((q: any) => formatQuestionClient(q, userId));
    return NextResponse.json(annotated);
  }

  // ─── BROWSE / PRACTICE ALL ───
  const questions = await Question.find({ category, approved: true })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  const annotatedBrowse = questions.map((q: any) => formatQuestionClient(q, userId));
  return NextResponse.json(annotatedBrowse);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  // AI generate questions
  if (body.aiGenerate) {
    const { topic, category, count } = body;

    // Fetch existing question texts to avoid duplicates
    const existingTexts = await Question.find({ category })
      .select("text")
      .lean()
      .then(docs => docs.map((d: any) => d.text));

    const generated = await generateQuestions(topic, category, count || 5, existingTexts);
    if (!generated) {
      return NextResponse.json(
        { error: "AI is not configured or generation failed" },
        { status: 500 }
      );
    }

    const questions = await Question.insertMany(
      generated.map((q: any) => ({
        ...q,
        category,
        approved: false,
        aiGenerated: true,
      }))
    );

    return NextResponse.json(questions);
  }

  // Manual question creation
  const question = await Question.create({
    ...body,
    approved: (session.user as any).role === "moderator",
  });

  return NextResponse.json(question);
}
