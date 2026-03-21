import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";
import User from "@/models/User";
import { generateQuestions } from "@/lib/gemini";

// Formats a question for the frontend to strip out sensitive answer data if not yet attempted
function formatQuestionClient(q: any, userId: string | null) {
  const qObj = q.toObject ? q.toObject() : q;
  const attempted = userId
    ? (qObj.attemptedBy || []).some((id: any) => id.toString() === userId.toString())
    : false;
  const isCorrect = userId
    ? (qObj.correctBy || []).some((id: any) => id.toString() === userId.toString())
    : false;

  if (attempted) {
    return { ...qObj, attempted, isCorrect }; // Return rich metadata (answers/explanations) if already attempted
  } else {
    // Strip correctIndex and explanation
    const { correctIndex, explanation, correctBy, attemptedBy, ...rest } = qObj;
    return { ...rest, attempted: false, isCorrect: false };
  }
}

// ════════ GET ALL ELIGIBLE QUESTIONS (USER / ADMIN) ════════
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    let userId = null;
    let userBranch = "General";
    
    // Attempt to enrich context to target questions specifically to the user's KTU Branch
    if (session) {
      userId = (session.user as any).id;
      const userDoc = await User.findById(userId).select("branch");
      if (userDoc) userBranch = userDoc.branch;
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "coding";
    const mode = searchParams.get("mode") || "qotd";
    const isHighIQ = searchParams.get("highIq") === "true";
    const pendingApproval = searchParams.get("pending") === "true";
    const allApproved = searchParams.get("all") === "true";

    // ─── ADMIN OVERRIDE VIEWS (Moderator Panel Fetching) ───
    if (allApproved) {
      if (!session || (session.user as any).role !== "moderator") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const filterCategory = searchParams.get("filterCategory");
      const filter: any = { approved: true };
      if (filterCategory && filterCategory !== "all") filter.category = filterCategory;
      const adminQuestions = await Question.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json(adminQuestions);
    }

    if (pendingApproval) {
      if (!session || (session.user as any).role !== "moderator") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const adminQuestions = await Question.find({ approved: false }).sort({ createdAt: -1 }).lean();
      return NextResponse.json(adminQuestions);
    }

    // ─── STANDARD USER FETCHING ───
    
    // Construct the strictest query: must be approved, match the category, and match the target branch constraints
    const matchQuery: any = { category, approved: true };
    if (isHighIQ) {
      matchQuery.isHighIQ = true;
    } else {
      matchQuery.isHighIQ = false;
      // Fetch both explicitly general questions and branch-specific ones
      matchQuery.targetBranch = { $in: [userBranch, "General"] };
    }

    // mode: QOTD (Daily Challenge) - Picks specifically assigned daily questions
    if (mode === "qotd") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Try to get what is stamped for today
      let question = await Question.findOne({
        ...matchQuery,
        isQOTD: true,
        qotdDate: { $gte: today },
      }).lean();

      // If no question is stamped for today, recycle the very oldest un-checked question, or oldest prior QOTD
      if (!question) {
        question = await Question.findOne(matchQuery).sort({ qotdDate: 1, createdAt: 1 }).lean() as any;
        if (question) {
          await Question.findByIdAndUpdate((question as any)._id, {
            isQOTD: true,
            qotdDate: today,
          });
        }
      }

      return NextResponse.json(question ? [formatQuestionClient(question, userId)] : []);
    }

    // mode: SPRINT (5 Random Problems)
    if (mode === "sprint") {
      // Safely aggregate exactly 5 random matching questions seamlessly
      const randomFive = await Question.aggregate([
        { $match: matchQuery },
        { $sample: { size: 5 } }
      ]);
      return NextResponse.json(randomFive.map((q) => formatQuestionClient(q, userId)));
    }

    // mode: BROWSE (All valid questions for full practice)
    if (mode === "browse") {
      const allQuestions = await Question.find(matchQuery).sort({ createdAt: -1 }).lean();
      return NextResponse.json(allQuestions.map((q) => formatQuestionClient(q, userId)));
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error("Aptitude Fetch Error:", error);
    return NextResponse.json({ error: "Server Error Fetching Questions" }, { status: 500 });
  }
}

// ════════ CREATE QUESTIONS (MODERATORS / AI GENERATOR CONTROLLER) ════════
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "moderator") {
      return NextResponse.json({ error: "Unauthorized. Mod privileges required." }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // ─── AI ASSISTED GENERATION (Triggered explicitly from Mod Panel only) ───
    if (body.aiGenerate) {
      const { topic, category, count, isHighIQ, targetBranch } = body;

      const aiContextQuery: any = { category };
      if (isHighIQ) {
        aiContextQuery.isHighIQ = true;
      } else if (targetBranch) {
        aiContextQuery.isHighIQ = false;
        aiContextQuery.targetBranch = targetBranch;
      }

      // We pull existing options to prevent the AI from generating duplicates
      const existingTexts = await Question.find(aiContextQuery)
        .select("text")
        .lean()
        .then(docs => docs.map((d: any) => d.text));

      // Call Gemini!
      const generated = await generateQuestions(
          topic, 
          category, 
          count || 5, 
          existingTexts,
          { isHighIQ, branch: isHighIQ ? undefined : targetBranch }
      );
      
      if (!generated || generated.length === 0) {
        return NextResponse.json(
          { error: "AI Exhausted/Misconfigured. Please check quotas or prompts." },
          { status: 500 }
        );
      }

      // Dump all generated queries into the DB as Pending
      const insertedQuestions = await Question.insertMany(
        generated.map((q: any) => ({
          ...q,
          ...aiContextQuery,
          approved: false,     // MUST be specifically pushed to live by mods
          aiGenerated: true,
        }))
      );

      return NextResponse.json(insertedQuestions);
    }

    // ─── MANUAL CREATION ───
    const manualQuestion = await Question.create({
      text: body.text,
      options: body.options,
      correctIndex: body.correctIndex,
      explanation: body.explanation || "",
      category: body.category,
      difficulty: body.difficulty || "medium",
      approved: true, // Moderators directly publish manual pushes
      aiGenerated: false,
      isHighIQ: body.isHighIQ || false,
      targetBranch: body.targetBranch || "General"
    });

    return NextResponse.json(manualQuestion);

  } catch (error) {
    console.error("Aptitude Creation Error:", error);
    return NextResponse.json({ error: "Server Error Posting Question" }, { status: 500 });
  }
}
