import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import UserProgress from "@/models/UserProgress";
import { proposeRoadmap } from "@/lib/gemini";
import { awardPoints } from "@/lib/points";

import User from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const fetchAll = searchParams.get("all") === "true";

  let userId = null;
  let isMod = false;
  if (session?.user) {
    userId = (session.user as any).id;
    isMod = (session.user as any).role === "moderator";
  }

  await dbConnect();
  
  let filter: any = { approved: true };
  if (isMod && fetchAll) {
    filter = {}; // Admin explicitly requested all roadmaps
  } else if (userId) {
    filter = { $or: [{ approved: true }, { createdBy: userId }] };
  }

  const roadmaps = await Roadmap.find(filter).sort({ skill: 1 });
  return NextResponse.json(roadmaps);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const user = session.user as any;

  // AI propose roadmap
  if (body.aiPropose) {
    const requestedSkill = body.skill?.trim();
    if (!requestedSkill) return NextResponse.json({ error: "Skill required" }, { status: 400 });

    const dbUser = await User.findById(user.id);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const generatedCount = await Roadmap.countDocuments({ createdBy: user.id });
    if (generatedCount >= dbUser.roadmapCap) {
       return NextResponse.json(
         { error: `You have reached your limit of ${dbUser.roadmapCap} AI roadmaps. Contact an Admin to upgrade.` },
         { status: 403 }
       );
    }

    // Check if the user already generated this, or if it's already a public global roadmap
    let existing = await Roadmap.findOne({ 
      skill: { $regex: new RegExp(`^${requestedSkill}$`, "i") },
      $or: [{ approved: true }, { createdBy: user.id }]
    });
    
    if (existing) {
      return NextResponse.json(existing);
    }

    const proposed = await proposeRoadmap(requestedSkill);
    if (!proposed) {
      return NextResponse.json(
        { error: "AI failed to generate roadmap for this topic. Please try another." },
        { status: 500 }
      );
    }

    const roadmap = await Roadmap.create({
      ...proposed,
      skill: requestedSkill,
      approved: false, // Private roadmap
      proposedByAI: true,
      createdBy: user.id,
    });

    return NextResponse.json(roadmap);
  }

  // Manual create (moderator)
  if (user.role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roadmap = await Roadmap.create({
    ...body,
    approved: true,
  });

  return NextResponse.json(roadmap);
}
