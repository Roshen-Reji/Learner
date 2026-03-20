import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const blockedWordsSetting = await Setting.findOne({ key: "blockedWords" });
  return NextResponse.json(blockedWordsSetting?.value || []);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  try {
    const { words } = await req.json();
    if (!Array.isArray(words)) return NextResponse.json({ error: "Invalid array" }, { status: 400 });

    await Setting.findOneAndUpdate(
      { key: "blockedWords" },
      { value: words },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
