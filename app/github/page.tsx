"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";
import toast from "react-hot-toast";
import { GitHubCalendar } from "react-github-calendar";
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  Users,
  BookOpen,
  Code2,
  Activity,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";

interface GitHubProfile {
  name: string;
  avatar: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
}

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  pushedAt: string;
  isPrivate: boolean;
}

interface GitHubData {
  connected: boolean;
  username?: string;
  points?: number;
  profile?: GitHubProfile;
  repos?: Repo[];
  recentCommits?: number;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
};

export default function GitHubPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      toast.success("GitHub connected successfully! 🎉");
      router.replace("/github");
    }
    if (searchParams.get("error")) {
      const err = searchParams.get("error");
      toast.error(`GitHub connection failed: ${err}`);
      router.replace("/github");
    }
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/github?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {
      toast.error("Failed to load GitHub data");
    }
    setLoading(false);
  };

  const shareToForum = async (repo: Repo) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Project Showcase: ${repo.name}`,
          body: `${repo.description || "No description provided."}\n\n💻 **Language:** ${repo.language || "N/A"} | ⭐ **Stars:** ${repo.stars}\n\n🔗 **Repository URL:** ${repo.url}`,
          tags: "github,project,showcase",
        }),
      });
      if (res.ok) toast.success("Shared to community! 🎉");
      else toast.error("Failed to share");
    } catch {
      toast.error("Failed to share");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light">
        <Sidebar />
        <main className="lg:ml-72 pt-20 lg:pt-8 pb-32 lg:pb-8 min-h-screen flex items-center justify-center">
          <HeartbeatLoader message="LOADING GITHUB DATA" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-black transition-colors duration-700 bg-gradient-to-br from-slate-500/10 via-gray-500/5 to-transparent">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-800/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px] pointer-events-none" />

      <Sidebar />
      <main className="relative z-10 lg:ml-72 pt-20 lg:pt-8 pb-32 lg:pb-8 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-text-primary flex items-center gap-3 tracking-tight">
              <Github size={32} /> GitHub Hub
            </h1>
            <p className="text-text-secondary mt-1 font-medium text-sm sm:text-base">
              Your coding journey, visualized.
            </p>
          </div>

          {!data?.connected ? (
            /* Not Connected */
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-xl animate-fade-in">
              <div className="w-20 h-20 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Github className="text-white dark:text-gray-900" size={40} />
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-3">Connect Your GitHub</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
                Link your GitHub account to earn points for your contributions, showcase your projects, and share your work with the community.
              </p>
              <button
                onClick={() => window.location.href = "/api/github/auth"}
                className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl flex items-center gap-3 mx-auto"
              >
                <Github size={22} /> Connect with GitHub
              </button>
            </div>
          ) : (
            /* Connected — show stats */
            <div className="space-y-6 animate-fade-in">
              {/* Profile Card */}
              {data.profile && (
                <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                  <div className="relative z-10 flex items-center gap-5">
                    {data.profile.avatar && (
                      <img src={data.profile.avatar} alt="" className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold">{data.profile.name || data.username}</h2>
                      <p className="text-white/70 text-sm">@{data.username}</p>
                      {data.profile.bio && <p className="text-white/60 text-sm mt-1 max-w-md">{data.profile.bio}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 relative z-10">
                    <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <BookOpen size={18} className="mx-auto mb-1 text-white/70" />
                      <p className="text-lg font-bold">{data.profile.publicRepos}</p>
                      <p className="text-xs text-white/60">Repos</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <Users size={18} className="mx-auto mb-1 text-white/70" />
                      <p className="text-lg font-bold">{data.profile.followers}</p>
                      <p className="text-xs text-white/60">Followers</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <Activity size={18} className="mx-auto mb-1 text-white/70" />
                      <p className="text-lg font-bold">{data.recentCommits || 0}</p>
                      <p className="text-xs text-white/60">Recent Commits</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <Sparkles size={18} className="mx-auto mb-1 text-amber-400" />
                      <p className="text-lg font-bold text-amber-400">{data.points || 0}</p>
                      <p className="text-xs text-white/60">Points Earned</p>
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub Calendar */}
              {data.username && (
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-5 sm:p-8 overflow-x-auto custom-scrollbar shadow-lg">
                  <h3 className="font-bold text-lg text-text-primary flex items-center gap-2 mb-6">
                    <Activity size={20} className="text-primary" /> Contribution Activity
                  </h3>
                  <div className="min-w-[750px]">
                    <GitHubCalendar 
                      username={data.username} 
                      colorScheme="dark" 
                      theme={{
                        light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                        dark: ['#1e1e24', '#0e4429', '#006d32', '#26a641', '#39d353'],
                      }}
                      fontSize={12}
                    />
                  </div>
                </div>
              )}

              {/* Repos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                    <Code2 size={20} className="text-primary" /> Recent Repositories
                  </h3>
                  <button onClick={fetchGitHubData} className="text-text-secondary hover:text-primary transition p-1.5">
                    <RefreshCw size={16} />
                  </button>
                </div>

                {data.repos && data.repos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.repos.map((repo) => (
                      <div key={repo.name} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-5 hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-text-primary text-sm group-hover:text-primary transition truncate flex-1">
                            {repo.name}
                          </h4>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => shareToForum(repo)}
                              className="p-1.5 hover:bg-primary/10 rounded-lg text-text-secondary hover:text-primary transition"
                              title="Share to community"
                            >
                              <Share2 size={14} />
                            </button>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-text-secondary transition"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-xs text-text-secondary mb-3 line-clamp-2">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: LANG_COLORS[repo.language] || "#888" }}
                              />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1"><Star size={12} /> {repo.stars}</span>
                          <span className="flex items-center gap-1"><GitFork size={12} /> {repo.forks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/60 dark:bg-slate-900/60 rounded-2xl p-8 text-center border border-white/60 dark:border-white/10">
                    <Code2 className="mx-auto text-text-secondary mb-3" size={40} />
                    <p className="text-text-secondary font-medium">No public repositories found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
