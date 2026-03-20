import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { body } = await req.json();
  const user = session.user as any;

  const post = await Post.findByIdAndUpdate(
    params.id,
    {
      $push: {
        replies: {
          body,
          author: user.id,
          authorName: user.name,
        },
      },
    },
    { new: true }
  );

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = session.user as any;

  const post = await Post.findById(params.id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const hasUpvoted = post.upvotes.includes(user.id);
  if (hasUpvoted) {
    post.upvotes = post.upvotes.filter(
      (id: any) => id.toString() !== user.id
    );
  } else {
    post.upvotes.push(user.id);
  }

  await post.save();
  return NextResponse.json(post);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (user.role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  await Post.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Post deleted" });
}
