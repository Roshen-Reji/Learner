import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

export async function GET() {
  await dbConnect();
  const notes = await Note.find().sort({ createdAt: -1 }).limit(5);
  return NextResponse.json({
    urls: notes.map((n) => n.fileUrl),
    rawNotes: notes
  });
}
