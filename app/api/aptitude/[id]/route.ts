import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";

export async function PATCH(
  req: NextRequest,
  // 1. Update params type to Promise
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Await the params object before using the ID
  const resolvedParams = await params;
  const id = resolvedParams.id;

  await dbConnect();
  const body = await req.json();

  // Allow full question editing: text, options, correctIndex, explanation, category, difficulty, approved, branch targets
  const allowedFields = ["text", "options", "correctIndex", "explanation", "category", "difficulty", "approved", "isHighIQ", "targetBranch"];
  const update: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) update[field] = body[field];
  }

  const question = await Question.findByIdAndUpdate(
    id, // Use the awaited id here
    update,
    { new: true }
  );

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question);
}

export async function DELETE(
  req: NextRequest,
  // 1. Update params type to Promise
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Await the params object before using the ID
  const resolvedParams = await params;
  const id = resolvedParams.id;

  await dbConnect();
  await Question.findByIdAndDelete(id); // Use the awaited id here
  return NextResponse.json({ message: "Question deleted" });
}