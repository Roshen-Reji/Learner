import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // Update streak
        const now = new Date();
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if (lastActive) {
          const diffDays = Math.floor(
            (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            user.streakDays += 1;
          } else if (diffDays > 1) {
            user.streakDays = 1;
          }
        } else {
          user.streakDays = 1;
        }
        user.lastActiveDate = now;
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          year: user.year,
          points: user.points,
          streakDays: user.streakDays,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.points = session.points ?? token.points;
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.branch = (user as any).branch;
        token.year = (user as any).year;
        token.points = (user as any).points;
        token.streakDays = (user as any).streakDays;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).branch = token.branch;
        (session.user as any).year = token.year;
        (session.user as any).points = token.points;
        (session.user as any).streakDays = token.streakDays;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
