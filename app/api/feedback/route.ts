import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";

// GET — moderator only, returns all feedback
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "moderator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Feedback GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST — authenticated user submits feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    await dbConnect();
    const { text } = await req.json();
    if (!text?.trim() || text.length > 2000) {
      return NextResponse.json({ error: "Feedback must be 1-2000 characters" }, { status: 400 });
    }
    const user = session.user as any;
    const feedback = await Feedback.create({
      userId: user.id,
      userName: user.name,
      text: text.trim(),
    });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Feedback POST Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
