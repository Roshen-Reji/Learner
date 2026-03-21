import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import UserProgress from "@/models/UserProgress";
import { awardPoints } from "@/lib/points";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  await dbConnect();
  const resolvedParams = await params;
  const roadmap = await Roadmap.findById(resolvedParams.id);
  if (!roadmap) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  let progress = null;
  if (session) {
    progress = await UserProgress.findOne({
      userId: (session.user as any).id,
      roadmapId: resolvedParams.id,
    });
  }

  return NextResponse.json({ roadmap, progress });
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
  const body = await req.json();
  const user = session.user as any;

  const resolvedParams = await params;

  // Moderator approve/edit
  if (user.role === "moderator" && body.moderate) {
    const roadmap = await Roadmap.findByIdAndUpdate(resolvedParams.id, body.updates, {
      new: true,
    });
    return NextResponse.json(roadmap);
  }

  // Student complete node
  if (body.completeNode !== undefined) {
    let progress = await UserProgress.findOne({
      userId: user.id,
      roadmapId: resolvedParams.id,
    });

    if (!progress) {
      progress = await UserProgress.create({
        userId: user.id,
        roadmapId: resolvedParams.id,
        completedNodes: [body.completeNode],
      });
    } else if (!progress.completedNodes.includes(body.completeNode)) {
      progress.completedNodes.push(body.completeNode);
      await progress.save();
    }

    await awardPoints(user.id, "roadmap_node_complete", {
      roadmapId: resolvedParams.id,
      nodeIndex: body.completeNode,
    });

    return NextResponse.json(progress);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const resolvedParams = await params;
  await Roadmap.findByIdAndDelete(resolvedParams.id);
  return NextResponse.json({ message: "Roadmap deleted" });
}
