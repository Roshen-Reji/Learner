import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import GlobalChat from "@/models/GlobalChat";
import Setting from "@/models/Setting";

export async function GET() {
  await dbConnect();
  const chats = await GlobalChat.find().sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(chats.reverse()); // Oldest first for chat UI
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text || text.trim().length === 0) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  await dbConnect();
  
  // Moderate against Word Blocker
  const setting = await Setting.findOne({ key: "blockedWords" });
  const blockedWords: string[] = setting?.value || [];
  
  if (blockedWords.length > 0) {
    const lowerText = text.toLowerCase();
    const matchedWords = blockedWords.filter(bw => lowerText.includes(bw.toLowerCase()));
    if (matchedWords.length > 0) {
      return NextResponse.json({ 
        error: "Message contains blocked words", 
        blockedWords: matchedWords 
      }, { status: 406 });
    }
  }

  const chat = await GlobalChat.create({
    senderId: (session.user as any).id,
    senderName: (session.user as any).name,
    text: text.trim(),
  });

  return NextResponse.json(chat);
}
