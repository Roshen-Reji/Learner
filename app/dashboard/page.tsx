"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import {
  Brain,
  Trophy,
  Flame,
  Target,
  ArrowRight,
  FileText,
  Map,
  MessageSquare,
  Briefcase,
  Bot,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";

const quickLinks = [
  {
    href: "/aptitude",
    icon: Brain,
    title: "Aptitude Center",
    desc: "Daily challenges & sprints",
    color: "from-blue-500 to-indigo-600",
  },
  {
    href: "/roadmap",
    icon: Map,
    title: "Roadmaps",
    desc: "Guided learning paths",
    color: "from-emerald-500 to-teal-600",
  },
  {
    href: "/community",
    icon: MessageSquare,
    title: "Community",
    desc: "Discuss & collaborate",
    color: "from-purple-500 to-violet-600",
  },
  {
    href: "/notes",
    icon: FileText,
    title: "Notes Hub",
    desc: "Share & earn points",
    color: "from-amber-500 to-orange-600",
  },
  {
    href: "/placement",
    icon: Briefcase,
    title: "Placements",
    desc: "Hiring updates & skills",
    color: "from-pink-500 to-rose-600",
  },
  {
    href: "/ai-chat",
    icon: Bot,
    title: "AI Assistant",
    desc: "Get career guidance",
    color: "from-cyan-500 to-blue-600",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [liveData, setLiveData] = useState<{ points: number; streakDays: number } | null>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/users/me").then(r => r.json()).then(data => setLiveData(data)).catch(() => {});
    }
  }, [session]);

  const displayPoints = liveData?.points ?? user?.points ?? 0;
  const displayStreak = liveData?.streakDays ?? user?.streakDays ?? 0;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HeartbeatLoader message="AUTHENTICATING..." />
      </div>
    );
  }

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good Morning" : greetingHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          {/* Hero greeting */}
          <div className="gradient-bg rounded-3xl p-6 sm:p-10 text-white mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium mb-1">{greeting} 👋</p>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">{user?.name}</h1>
              <p className="text-white/80 max-w-lg text-sm sm:text-base">
                Keep pushing forward! Every question you solve, every roadmap node you complete
                brings you closer to your goals.
              </p>

              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <Star className="text-amber-300" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{displayPoints}</p>
                    <p className="text-xs text-white/70">Total Points</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <Flame className="text-red-300" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{displayStreak}</p>
                    <p className="text-xs text-white/70">Day Streak</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <Target className="text-green-300" size={24} />
                  <div>
                    <p className="text-2xl font-bold">{user?.branch}</p>
                    <p className="text-xs text-white/70">Year {user?.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational quote */}
          <div className="card mb-8 border-l-4 border-l-primary !rounded-l-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-text-primary italic">
                  "The only way to do great work is to love what you do. Don't settle."
                </p>
                <p className="text-sm text-text-secondary mt-1">— Steve Jobs</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="text-primary" size={22} />
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-0.5">{link.desc}</p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all mt-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
