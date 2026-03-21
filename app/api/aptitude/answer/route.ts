import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";
import { awardPoints } from "@/lib/points";
import { recordActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { questionId, selectedIndex, mode } = await req.json();
    const user = session.user as any;

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const correct = question.correctIndex === selectedIndex;
    const hasAttempted = (question.attemptedBy || []).some(
      (id: any) => id.toString() === user.id.toString()
    );

    if (!hasAttempted) {
      question.attemptedBy = question.attemptedBy || [];
      question.attemptedBy.push(user.id);
      await question.save();

      // Ensure even wrong attempts count towards daily streak
      await recordActivity(user.id);

      if (correct) {
        question.correctBy = question.correctBy || [];
        question.correctBy.push(user.id);
        await question.save();

        let eventType: any = "quiz_correct";
        if (mode === "qotd") eventType = "qotd_correct";
        else if (mode === "sprint") eventType = "sprint_complete";

        await awardPoints(user.id, eventType, { questionId });
      }
    }

    return NextResponse.json({
      correct,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      alreadyAttempted: hasAttempted,
    });
  } catch (err: any) {
    console.error("Aptitude answer error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
