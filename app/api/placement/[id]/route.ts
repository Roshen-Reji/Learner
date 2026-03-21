import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Placement from "@/models/Placement";

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
  const resolvedParams = await params;
  const placement = await Placement.findByIdAndUpdate(resolvedParams.id, body, { new: true });
  if (!placement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(placement);
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
  await Placement.findByIdAndDelete(resolvedParams.id);
  return NextResponse.json({ message: "Placement deleted" });
}
