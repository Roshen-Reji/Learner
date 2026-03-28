import { NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";

export async function GET() {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: "GitHub integration not configured" }, { status: 500 });
  }

  const scope = "read:user,repo";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}`;

  return NextResponse.redirect(githubAuthUrl);
}
