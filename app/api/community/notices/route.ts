import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Notice from "@/models/Notice";

// GET — returns all notices (sorted by pinned first, then newest)
export async function GET() {
  try {
    await dbConnect();
    const notices = await Notice.find()
      .sort({ pinned: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(notices);
  } catch (error) {
    console.error("Notices GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST — moderator only, creates a notice
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "moderator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const user = session.user as any;
    const { title, body, imageUrl, pinned } = await req.json();

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const notice = await Notice.create({
      title: title.trim(),
      body: body.trim(),
      imageUrl: imageUrl || "",
      authorId: user.id,
      authorName: user.name,
      pinned: pinned || false,
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    console.error("Notice POST Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// DELETE — moderator only, deletes a notice
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "moderator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Notice ID required" }, { status: 400 });

    await Notice.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notice DELETE Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
