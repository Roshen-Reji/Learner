import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/github?error=no_code", req.url));
    }

    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/github/callback`;

    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error("GitHub access token error:", tokenData);
      const errorMsg = tokenData.error_description || tokenData.error || "token_failed";
      return NextResponse.redirect(new URL(`/github?error=${encodeURIComponent(errorMsg)}`, req.url));
    }

    // Get GitHub user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const githubUser = await userRes.json();

    // Get repos and calculate points
    const reposRes = await fetch(`https://api.github.com/user/repos?per_page=100&sort=pushed`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const repos = await reposRes.json();

    // Calculate points: 2 per repo, bonus for recent activity
    let githubPoints = 0;
    if (Array.isArray(repos)) {
      githubPoints = repos.length * 2; // 2 points per repo
      // Bonus for recently pushed repos (within last month)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const recentRepos = repos.filter((r: any) => new Date(r.pushed_at) > oneMonthAgo);
      githubPoints += recentRepos.length * 3; // 3 bonus per active repo
    }

    // Save to user
    await dbConnect();
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.redirect(new URL("/github?error=no_email", req.url));
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail.toLowerCase() },
      {
        githubUsername: githubUser.login || "",
        githubConnected: true,
        githubAccessToken: tokenData.access_token,
        githubPoints,
        $inc: { points: githubPoints },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.error("No user found for email:", userEmail);
      return NextResponse.redirect(new URL("/github?error=user_not_found", req.url));
    }

    return NextResponse.redirect(new URL("/github?connected=true", req.url));
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.redirect(new URL("/github?error=server_error", req.url));
  }
}
