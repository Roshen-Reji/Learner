import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { awardPoints } from "@/lib/points";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch");
  const subject = searchParams.get("subject");

  const filter: any = {};
  if (branch && branch !== "all") filter.branch = branch;
  if (subject) filter.subject = { $regex: subject, $options: "i" };

  const notes = await Note.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, subject, branch, year, fileUrl, fileKey } = body;

  if (!fileUrl || !title || !subject) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await dbConnect();
  const user = session.user as any;
  const note = await Note.create({
    title,
    description: description || "",
    fileUrl,
    publicId: fileKey,
    uploadedBy: user.id,
    uploaderName: user.name,
    subject,
    branch: branch || "General",
    year: year ? parseInt(year) : 0,
  });

  await awardPoints(user.id, "note_upload", { noteId: note._id });
  return NextResponse.json(note);
}
