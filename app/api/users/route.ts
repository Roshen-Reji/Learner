import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const users = await User.aggregate([
    {
      $lookup: {
        from: "notes",
        localField: "_id",
        foreignField: "uploadedBy",
        as: "notesData"
      }
    },
    {
      $lookup: {
        from: "roadmaps",
        localField: "_id",
        foreignField: "createdBy",
        as: "roadmapsData"
      }
    },
    {
      $addFields: {
        noteCount: { $size: "$notesData" },
        roadmapCount: { $size: "$roadmapsData" }
      }
    },
    {
      $project: {
        passwordHash: 0,
        notesData: 0,
        roadmapsData: 0
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
  
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { name, email, password, branch, year, role } = await req.json();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    branch: branch || "CSE",
    year: year || 1,
    role: role || "student",
  });

  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
