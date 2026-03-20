import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const users = await User.find({ role: "student" })
    .select("name email branch year points streakDays badges")
    .sort({ points: -1 })
    .limit(50);

  return NextResponse.json(users);
}
