import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET — returns user's GitHub data and stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Invalid session user" }, { status: 400 });
    }

    const user = await User.findOne({ email: userEmail.toLowerCase() })
      .select("githubUsername githubConnected githubPoints githubAccessToken")
      .lean() as any;

    if (!user?.githubConnected || !user?.githubAccessToken) {
      return NextResponse.json({ connected: false });
    }

    // Fetch fresh data from GitHub
    try {
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${user.githubAccessToken}` },
        }),
        fetch(`https://api.github.com/user/repos?per_page=100&sort=pushed`, {
          headers: { Authorization: `Bearer ${user.githubAccessToken}` },
        }),
        fetch(`https://api.github.com/users/${user.githubUsername}/events?per_page=30`, {
          headers: { Authorization: `Bearer ${user.githubAccessToken}` },
        }),
      ]);

      const profile = await profileRes.json();
      const repos = await reposRes.json();
      const events = await eventsRes.json();

      // Count recent commits
      const pushEvents = Array.isArray(events) 
        ? events.filter((e: any) => e.type === "PushEvent")
        : [];
      const recentCommits = pushEvents.reduce((total: number, e: any) => {
        return total + (e.payload?.commits?.length || 0);
      }, 0);

      return NextResponse.json({
        connected: true,
        username: user.githubUsername,
        points: user.githubPoints,
        profile: {
          name: profile.name,
          avatar: profile.avatar_url,
          bio: profile.bio,
          publicRepos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
        },
        repos: Array.isArray(repos) 
          ? repos.slice(0, 12).map((r: any) => ({
              name: r.name,
              description: r.description,
              language: r.language,
              stars: r.stargazers_count,
              forks: r.forks_count,
              url: r.html_url,
              pushedAt: r.pushed_at,
              isPrivate: r.private,
            }))
          : [],
        recentCommits,
      });
    } catch {
      return NextResponse.json({
        connected: true,
        username: user.githubUsername,
        points: user.githubPoints,
        error: "Could not fetch latest GitHub data",
      });
    }
  } catch (error) {
    console.error("GitHub GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
