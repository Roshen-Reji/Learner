import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const user = session.user as any;
    const { cardUrl } = await req.json();

    if (!cardUrl?.trim()) {
      return NextResponse.json({ error: "Card URL is required" }, { status: 400 });
    }

    // Check if already verified
    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (userDoc.ieeeStatus === "verified") {
      return NextResponse.json({ verified: true, reason: "Already verified" });
    }

    // Submit for manual moderator review without AI checks
    await User.findByIdAndUpdate(user.id, {
      ieeeCardUrl: cardUrl,
      ieeeStatus: "pending"
    });

    return NextResponse.json({
      verified: false,
      pending: true,
      reason: "Submitted successfully for manual moderator review.",
    });

  } catch (error) {
    console.error("IEEE Verify Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
