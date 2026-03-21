import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/aptitude/:path*",
    "/roadmap/:path*",
    "/community/:path*",
    "/notes/:path*",
    "/placement/:path*",
    "/moderator/:path*",
    "/leaderboard/:path*",
    "/ai-chat/:path*",
  ],
};
