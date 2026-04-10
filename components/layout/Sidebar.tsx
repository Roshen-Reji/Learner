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

  const glassContainer = "bg-white dark:bg-[#121212] border-r border-border dark:border-[#2A2A2A] shadow-sm";

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#121212] border-b border-border dark:border-[#2A2A2A] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 text-text-primary dark:text-text-primary-dark">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold text-primary dark:text-accent-cyan text-lg">LearnUp</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-full text-sm font-semibold">
            <Star size={14} />
            {displayPoints}
          </div>
          {displayStreak > 0 && (
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-2.5 py-1 rounded-full text-sm font-bold">
              <Flame size={14} />
              {displayStreak}
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed z-[100] transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        top-0 left-0 h-[100dvh] w-72 lg:w-[280px] bg-white dark:bg-[#121212] border-r border-border dark:border-[#2A2A2A]
        lg:top-0 lg:left-0 lg:h-[100vh] lg:rounded-none
        ${isMinimized ? "lg:w-20" : "lg:w-[260px]"} flex flex-col overflow-hidden`}
      >
        {/* Header/Logo */}
        <div className={`p-6 lg:p-6 flex items-center relative shrink-0 ${isMinimized ? "lg:justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-3 ${isMinimized ? "lg:mx-auto" : ""}`}>
            <div className={`w-10 h-10 bg-gradient-to-br from-primary to-secondary dark:from-accent-cyan dark:to-accent-emerald rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-all ${isMinimized ? "scale-90" : ""}`}>
              <span className="text-white font-black text-lg">I</span>
            </div>
            <div className={`transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
              <h1 className="text-xl font-black text-text-primary dark:text-text-primary-dark tracking-tight">
                Learn<span className="text-primary dark:text-accent-cyan font-bold">Up</span>
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="hidden lg:flex p-2 rounded-lg text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-accent-cyan hover:bg-slate-50 dark:hover:bg-[#1A1A1A] transition-colors ml-2"
          >
             {isMinimized ? <Maximize2 size={18} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Stats Card */}
        <div className={`px-4 sm:px-5 shrink-0 transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:m-0" : "mb-6"}`}>
          <div className="bg-surface-light dark:bg-[#1A1A1A] border border-border dark:border-[#2A2A2A] rounded-2xl p-4">
            <p className="font-bold text-sm text-text-primary dark:text-text-primary-dark truncate">{user?.name}</p>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">{user?.branch} • Year {user?.year}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                <Star size={16} /> {displayPoints} pts
              </div>
              {displayStreak > 0 && (
                <div className="flex items-center gap-1.5 text-rose-500 font-bold text-sm">
                  <Flame size={16} /> {displayStreak} d
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 lg:px-4 py-2 space-y-1.5 pb-24 lg:pb-6 relative z-10 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary/10 text-primary dark:bg-accent-cyan/10 dark:text-accent-cyan font-bold" 
                    : "text-text-secondary dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-[#1A1A1A] hover:text-text-primary dark:hover:text-text-primary-dark"}
                  ${isMinimized ? "lg:justify-center lg:px-0" : ""}
                `}
                title={isMinimized ? item.label : undefined}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? "text-primary dark:text-accent-cyan" : "group-hover:scale-110 transition-transform"}`} />
                <span className={`text-[15px] whitespace-nowrap transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {user?.role === "moderator" && (
            <>
              <div className="h-px bg-border dark:bg-[#2A2A2A] my-4 mx-2" />
              <Link
                href="/moderator"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${pathname === "/moderator" 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold shadow-sm" 
                    : "text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"}
                  ${isMinimized ? "lg:justify-center lg:px-0" : ""}
                `}
                title={isMinimized ? "Moderator Panel" : undefined}
              >
                <Shield size={20} className={`shrink-0 transition-transform ${pathname === "/moderator" ? "" : "group-hover:scale-110"}`} />
                <span className={`text-[15px] whitespace-nowrap transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
                  Moderator Panel
                </span>
              </Link>
            </>
          )}

          <div className="h-px bg-border dark:bg-[#2A2A2A] my-4 mx-2" />
          
          <button
            onClick={() => { setSettingsOpen(true); setMobileOpen(false); }}
            className={`flex items-center gap-4 px-4 py-3 w-full text-left rounded-xl transition-all duration-200 group
              text-text-secondary dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-[#1A1A1A] hover:text-text-primary dark:hover:text-text-primary-dark
              ${isMinimized ? "lg:justify-center lg:px-0" : ""}
            `}
            title={isMinimized ? "Settings" : undefined}
          >
            <Settings size={20} className="shrink-0 transition-transform group-hover:rotate-90" />
            <span className={`text-[15px] whitespace-nowrap transition-all duration-300 ${isMinimized ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
              Settings
            </span>
          </button>
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white dark:bg-[#121212] border border-border dark:border-[#2A2A2A] shadow-lg rounded-full p-1.5 flex justify-between items-center gap-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 flex-1 h-[3.5rem] rounded-full ${
                  isActive
                    ? "bg-primary/10 dark:bg-accent-cyan/10"
                    : "hover:bg-surface-light dark:hover:bg-[#1A1A1A]"
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-all duration-300 ${
                    isActive 
                      ? "text-primary dark:text-accent-cyan scale-110 mb-0.5" 
                      : "text-text-secondary dark:text-text-secondary-dark hover:scale-105"
                  }`} 
                />
                <span 
                  className={`text-[9px] font-semibold transition-all duration-300 ${
                    isActive ? "text-primary dark:text-accent-cyan opacity-100" : "text-text-secondary opacity-0 h-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
