import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { awardPoints } from "@/lib/points";
import cloudinary from "@/lib/cloudinary";
import { UTApi } from "uploadthing/server";

export async function PATCH(
  req: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = session.user as any;
  const resolvedParams = await params;
  const note = await Note.findById(resolvedParams.id);

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Handle Moderator Edits
  let body: any = {};
  if (req.headers.get("content-type")?.includes("application/json")) {
    try {
      body = await req.json();
    } catch (e) {}
  }

  if (Object.keys(body).length > 0) {
    if (user.role !== "moderator") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (body.title) note.title = body.title;
    if (body.description) note.description = body.description;
    if (body.subject) note.subject = body.subject;
    if (body.branch) note.branch = body.branch;
    if (body.year) note.year = body.year;
    await note.save();
    return NextResponse.json(note);
  }

  // Handle Reader Count Increment
  if (!note.readers.includes(user.id)) {
    note.readers.push(user.id);
    note.readerCount = note.readers.length;
    await note.save();

    // Award points to uploader every 10 readers
    if (note.readerCount % 10 === 0) {
      await awardPoints(note.uploadedBy.toString(), "note_read_milestone", {
        noteId: note._id,
        readerCount: note.readerCount,
      });
    }
  }

  return NextResponse.json(note);
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const resolvedParams = await params;
  const note = await Note.findById(resolvedParams.id);
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  if (note.publicId) {
    try {
      if (note.fileUrl.includes("res.cloudinary.com")) {
        if (note.fileUrl.includes("/raw/upload/")) {
          await cloudinary.uploader.destroy(note.publicId, { resource_type: "raw" });
        } else {
          await cloudinary.uploader.destroy(note.publicId, { resource_type: "image" });
        }
      } else if (note.fileUrl.includes("uploadthing.com") || note.fileUrl.includes("utfs.io")) {
        const utapi = new UTApi();
        await utapi.deleteFiles(note.publicId);
      }
    } catch (err) {
      console.error("Asset delete failed:", err);
    }
  }

  await Note.findByIdAndDelete(resolvedParams.id);
  return NextResponse.json({ success: true });
}
