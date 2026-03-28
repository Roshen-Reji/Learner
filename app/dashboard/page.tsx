"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";
import toast from "react-hot-toast";

interface SkillItem {
  name: string;
  confidence: number;
  reasoning: string;
  icon: string;
}

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
  const [skillsData, setSkillsData] = useState<{ skills: SkillItem[]; summary: string; recommendation: string; bestFitJobs?: string[] } | null>(null);
  const [analyzingSkills, setAnalyzingSkills] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/users/me").then(r => r.json()).then(data => setLiveData(data)).catch(() => {});
    }
    // Restore cached skills analysis
    try {
      const cached = sessionStorage.getItem("skillsAnalysis");
      if (cached) setSkillsData(JSON.parse(cached));
    } catch {}
  }, [session]);

  const analyzeSkills = async () => {
    setAnalyzingSkills(true);
    try {
      const res = await fetch("/api/users/skills-analysis");
      if (res.ok) {
        const data = await res.json();
        setSkillsData(data);
        sessionStorage.setItem("skillsAnalysis", JSON.stringify(data));
        toast.success("Skills analysis complete! 🎯");
      }
    } catch {
      toast.error("Analysis failed");
    }
    setAnalyzingSkills(false);
  };

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

          {/* AI Skills Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" size={22} />
              AI Skills Analysis
            </h2>

            {!skillsData ? (
              <div className="card text-center py-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Brain className="text-primary" size={32} />
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2">Discover Your Strengths</h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                  Our AI analyzes your completed roadmap nodes and aptitude performance to identify your top skills and career potential.
                </p>
                <button
                  onClick={analyzeSkills}
                  disabled={analyzingSkills}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {analyzingSkills ? (
                    <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles size={18} /> Analyze My Skills</>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Skills Grid */}
                {skillsData.skills && skillsData.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(skillsExpanded ? skillsData.skills : skillsData.skills.slice(0, 3)).map((skill, i) => (
                        <div key={i} className="card !p-4 group hover:scale-[1.02] transition-all relative overflow-hidden">
                          <div className="flex items-center gap-3 mb-2 relative z-10">
                            <span className="text-2xl">{skill.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-text-primary truncate">{skill.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all"
                                    style={{ width: `${skill.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-primary">{skill.confidence}%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed relative z-10">{skill.reasoning}</p>
                        </div>
                      ))}
                    </div>
                    {skillsData.skills.length > 3 && (
                      <button onClick={() => setSkillsExpanded(!skillsExpanded)} className="text-primary text-sm font-bold flex items-center justify-center gap-1 mx-auto mt-4 hover:bg-primary/5 px-4 py-2 rounded-full transition-colors border border-primary/20">
                        {skillsExpanded ? "Collapse View" : `View All ${skillsData.skills.length} Core Skills`}
                      </button>
                    )}
                  </div>
                )}

                {/* Best Fit Jobs */}
                {skillsData.bestFitJobs && skillsData.bestFitJobs.length > 0 && (
                  <div className="card !p-4 border-l-4 border-l-amber-500 !rounded-l-sm bg-amber-50/50 dark:bg-amber-900/10 mb-4">
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Briefcase size={14} /> Recommended Career Pathways
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillsData.bestFitJobs.map((job, idx) => (
                        <span key={idx} className="bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform">
                          <Target size={14} className="text-amber-500 opacity-70" /> {job}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {skillsData.summary && (
                  <div className="card border-l-4 border-l-primary !rounded-l-sm">
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-primary shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm text-text-primary leading-relaxed">{skillsData.summary}</p>
                        {skillsData.recommendation && (
                          <p className="text-sm font-semibold text-primary mt-2">
                            💡 {skillsData.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Re-analyze button */}
                <button
                  onClick={analyzeSkills}
                  disabled={analyzingSkills}
                  className="text-sm text-primary font-semibold flex items-center gap-2 hover:underline mx-auto"
                >
                  {analyzingSkills ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Re-analyze
                </button>
              </div>
            )}
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
