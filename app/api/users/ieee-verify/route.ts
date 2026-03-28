import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    if (userDoc.ieeeVerified) {
      return NextResponse.json({ verified: true, reason: "Already verified" });
    }

    // Use Gemini to validate the card
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are an IEEE membership card validator. The user has provided an image URL that they claim is their IEEE membership card.

Analyze the following URL: ${cardUrl}

Based on the URL and common IEEE membership card patterns, determine if this is likely a legitimate IEEE membership card.

Consider:
- IEEE cards typically have the IEEE logo, member name, membership number, and expiry date
- The URL should point to an actual image
- Common legitimate sources include IEEE.org, uploaded images of physical cards

Respond with ONLY valid JSON:
{
  "verified": true or false,
  "confidence": 0-100,
  "reason": "Brief explanation"
}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0]);

        if (aiResult.verified && aiResult.confidence > 60) {
          // Mark user as verified and award points
          await User.findByIdAndUpdate(user.id, {
            ieeeMembershipCard: cardUrl,
            ieeeVerified: true,
            ieeeVerifiedAt: new Date(),
            $inc: { points: 50 },
          });

          return NextResponse.json({
            verified: true,
            confidence: aiResult.confidence,
            reason: aiResult.reason,
            pointsAwarded: 50,
          });
        } else {
          // Save the card URL but don't verify
          await User.findByIdAndUpdate(user.id, {
            ieeeMembershipCard: cardUrl,
          });

          return NextResponse.json({
            verified: false,
            confidence: aiResult.confidence,
            reason: aiResult.reason || "Could not verify the card. Please try with a clearer image.",
          });
        }
      }
    } catch (aiError: any) {
      console.error("AI verification error:", aiError?.message);
    }

    // Fallback: save card but don't verify
    await User.findByIdAndUpdate(user.id, { ieeeMembershipCard: cardUrl });
    return NextResponse.json({
      verified: false,
      reason: "Could not process the image. The card has been saved for manual review.",
    });

  } catch (error) {
    console.error("IEEE Verify Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
