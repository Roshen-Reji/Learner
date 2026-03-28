"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  MessageSquare,
  FileText,
  Brain,
  Map,
  Briefcase,
  Trophy,
  Bot,
  Settings,
  Flame,
  Star,
  Menu,
  X,
  Shield,
  Maximize2,
  Minimize2,
  Github,
} from "lucide-react";
import { useState, useEffect } from "react";
import SettingsModal from "@/components/layout/SettingsModal";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/aptitude", label: "Aptitude", icon: Brain },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/placement", label: "Placement", icon: Briefcase },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/ai-chat", label: "AI Assistant", icon: Bot },
  { href: "/github", label: "GitHub", icon: Github },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [liveData, setLiveData] = useState<{ points: number; streakDays: number } | null>(null);
  const user = session?.user as any;

  useEffect(() => {
    if (session) {
      fetch("/api/users/me").then(r => r.json()).then(data => setLiveData(data)).catch(() => {});
    }
  }, [session]);

  if (!session) return null;

  const displayPoints = liveData?.points ?? user?.points ?? 0;
  const displayStreak = liveData?.streakDays ?? user?.streakDays ?? 0;

  // 3D Glassy Container Styles
  const glassContainer = "bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-[inset_0_0_15px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]";
  const glassItemActive = "bg-white/80 dark:bg-white/10 shadow-sm border border-white/80 dark:border-white-5 text-primary dark:text-blue-400";
  const glassItemInactive = "text-text-secondary dark:text-text-secondary-dark hover:bg-white/40 dark:hover:bg-white/5 border border-transparent";

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-border dark:border-border-dark px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 text-text-primary dark:text-text-primary-dark">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold text-primary text-lg">IEEE Learn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-full text-sm font-semibold">
            <Star size={14} />
            {displayPoints}
          </div>
          {displayStreak > 0 && (
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-2.5 py-1 rounded-full text-sm font-bold streak-fire">
              <Flame size={14} />
              {displayStreak}
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed z-[100] transform transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        top-0 left-0 h-[100dvh] w-72 lg:w-[280px] bg-white dark:bg-slate-900 border-r border-border dark:border-white/10 lg:border-r-0 lg:bg-transparent lg:dark:bg-transparent
        lg:top-4 lg:left-4 lg:h-[calc(100vh-32px)] lg:rounded-[2.5rem] ${glassContainer}
        ${isMinimized ? "lg:w-24" : "lg:w-[280px]"} flex flex-col overflow-hidden`}
      >
        {/* Header/Logo */}
        <div className={`p-6 lg:p-6 flex items-center relative shrink-0 ${isMinimized ? "lg:justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-4 ${isMinimized ? "lg:mx-auto" : ""}`}>
            <div className={`w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shrink-0 transition-all ${isMinimized ? "scale-90" : ""}`}>
              <span className="text-white font-black text-xl">I</span>
            </div>
            <div className={`transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
              <h1 className="text-2xl font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent tracking-tight">
                IEEE<span className="text-slate-700 dark:text-slate-300 font-bold ml-1">Learn</span>
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="hidden lg:flex p-2.5 rounded-xl text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all ml-2"
          >
             {isMinimized ? <Maximize2 size={18} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Stats Card */}
        <div className={`px-4 sm:px-6 shrink-0 transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:m-0" : "mb-6"}`}>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-sm text-text-primary dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">{user?.branch} • Year {user?.year}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
                <Star size={16} /> {displayPoints} pts
              </div>
              {displayStreak > 0 && (
                <div className="flex items-center gap-1.5 text-rose-500 font-black text-sm">
                  <Flame size={16} /> {displayStreak} d
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 lg:px-4 py-2 space-y-2.5 pb-24 lg:pb-6 relative z-10 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}
                  ${isMinimized ? "lg:justify-center lg:px-0" : ""}
                `}
                title={isMinimized ? item.label : undefined}
              >
                <Icon size={22} className={`shrink-0 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform text-slate-500 dark:text-slate-400"}`} />
                <span className={`font-semibold text-[15px] whitespace-nowrap transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {user?.role === "moderator" && (
            <>
              <div className="h-px bg-slate-200 dark:bg-white/10 my-4 lg:mx-2" />
              <Link
                href="/moderator"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${pathname === "/moderator" 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold shadow-sm border border-amber-200 dark:border-amber-700" 
                    : "text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent"}
                  ${isMinimized ? "lg:justify-center lg:px-0" : ""}
                `}
                title={isMinimized ? "Moderator Panel" : undefined}
              >
                <Shield size={22} className={`shrink-0 transition-transform ${pathname === "/moderator" ? "" : "group-hover:scale-110"}`} />
                <span className={`font-semibold text-[15px] whitespace-nowrap transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
                  Moderator Panel
                </span>
              </Link>
            </>
          )}

          <div className="h-px bg-slate-200 dark:bg-white/10 my-4 lg:mx-2" />
          
          <button
            onClick={() => { setSettingsOpen(true); setMobileOpen(false); }}
            className={`flex items-center gap-4 px-4 py-3.5 w-full text-left rounded-xl transition-all duration-200 group
              text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 
              ${isMinimized ? "lg:justify-center lg:px-0" : ""}
            `}
            title={isMinimized ? "Settings" : undefined}
          >
            <Settings size={22} className="shrink-0 transition-transform group-hover:rotate-90 text-slate-500 dark:text-slate-400" />
            <span className={`font-semibold text-[15px] whitespace-nowrap transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
              Settings
            </span>
          </button>
        </nav>
      </aside>

      {/* Mobile bottom nav (3D Glassy floating pill) */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className={`rounded-full p-1.5 ${glassContainer}`}>
          <div className="flex justify-between items-center gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center transition-all duration-300 flex-1 h-[3.5rem] rounded-full ${
                    isActive
                      ? "bg-white/90 dark:bg-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-white dark:border-white/5"
                      : "border border-transparent opacity-70 hover:opacity-100 hover:bg-white/20 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon 
                    size={isActive ? 22 : 20} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? "text-primary dark:text-blue-400 drop-shadow-sm scale-110 mb-0.5" 
                        : "text-text-secondary dark:text-text-secondary-dark hover:scale-105"
                    }`} 
                  />
                  <span 
                    className={`text-[9px] font-semibold transition-all duration-300 ${
                      isActive ? "text-primary dark:text-blue-400 opacity-100" : "text-text-secondary dark:text-text-secondary-dark opacity-0 h-0 w-0 overflow-hidden"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
