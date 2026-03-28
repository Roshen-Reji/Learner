import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetUserId, action } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing Target User ID" }, { status: 400 });
  }

  await dbConnect();
  
  if (action === "reject") {
    await User.findByIdAndUpdate(targetUserId, {
      ieeeStatus: "failed"
    });
    return NextResponse.json({ success: true, rejected: true });
  }

  const updatedUser = await User.findByIdAndUpdate(targetUserId, {
    ieeeStatus: "verified",
    isPremium: true,
    $addToSet: { badges: "IEEE Member" } // Automatically grant the Member badge
  }, { new: true });

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: updatedUser });
}
