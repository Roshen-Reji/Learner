import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const updates: any = {};

  if (body.name) updates.name = body.name;
  if (body.email) updates.email = body.email.toLowerCase();
  if (body.branch) updates.branch = body.branch;
  if (body.year) updates.year = body.year;
  if (body.role) updates.role = body.role;
  if (body.isPremium !== undefined) updates.isPremium = body.isPremium;
  if (body.roadmapCap !== undefined) updates.roadmapCap = body.roadmapCap;
  if (body.password) {
    updates.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const resolvedParams = await params;
  const user = await User.findByIdAndUpdate(resolvedParams.id, updates, { new: true }).select("-passwordHash");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
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
  await User.findByIdAndDelete(resolvedParams.id);
  return NextResponse.json({ message: "User deleted" });
}
