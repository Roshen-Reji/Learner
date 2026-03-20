import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function GET() {
  await dbConnect();
  const posts = await Post.find({}).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { title, body, tags } = await req.json();
  const user = session.user as any;

  const post = await Post.create({
    title,
    body,
    author: user.id,
    authorName: user.name,
    tags: tags || [],
  });

  return NextResponse.json(post);
}
