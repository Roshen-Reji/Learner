import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Placement from "@/models/Placement";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch");

  const filter: any = {};
  if (branch && branch !== "all") {
    filter.branches = { $in: [branch] };
  }

  const placements = await Placement.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(placements);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const placement = await Placement.create(body);
  return NextResponse.json(placement);
}
