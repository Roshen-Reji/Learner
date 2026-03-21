import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function POST(
  req: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { body } = await req.json();
  const user = session.user as any;
  const resolvedParams = await params;

  const post = await Post.findByIdAndUpdate(
    resolvedParams.id,
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
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = session.user as any;
  const resolvedParams = await params;

  const post = await Post.findById(resolvedParams.id);
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
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  await dbConnect();
  
  const resolvedParams = await params;
  const post = await Post.findById(resolvedParams.id);
  
  if (!post) {
     return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role !== "moderator" && post.author.toString() !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Post.findByIdAndDelete(resolvedParams.id);
  return NextResponse.json({ message: "Post deleted" });
}
