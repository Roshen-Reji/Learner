"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  Flame,
  Star,
  Menu,
  X,
  Shield,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/aptitude", label: "Aptitude", icon: Brain },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/placement", label: "Placement", icon: Briefcase },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/ai-chat", label: "AI Assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

      {/* Sidebar Desktop Floating Panel / Mobile Slide-in */}
      <aside
        className={`fixed z-50 transform transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        top-0 left-0 h-full w-72 bg-white dark:bg-surface-dark border-r border-border dark:border-border-dark lg:border-r-0 lg:bg-transparent lg:dark:bg-transparent
        lg:top-4 lg:left-4 lg:h-[calc(100vh-32px)] lg:rounded-[2.5rem] ${glassContainer}
        ${isMinimized ? "lg:w-20" : "lg:w-[260px]"} flex flex-col`}
      >
        <div className="flex flex-col h-full overflow-hidden p-2 lg:p-3">
          {/* Header/Logo */}
          <div className={`p-4 lg:p-3 flex items-center relative border-b border-border dark:border-border-dark lg:border-white/20 shrink-0 ${isMinimized ? "lg:justify-center" : "justify-between"}`}>
            <div className={`flex items-center gap-3 ${isMinimized ? "lg:mx-auto" : ""}`}>
              <div className="w-10 h-10 lg:w-10 lg:h-10 gradient-bg rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div className={`transition-opacity duration-300 ${isMinimized ? "lg:hidden" : ""}`}>
                <h1 className="text-xl lg:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  IEEE Learn
                </h1>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  Level Up Your Career
                </p>
              </div>
            </div>
            
            {/* Minimize toggle button */}
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="hidden lg:flex p-2 rounded-xl text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-blue-400 hover:bg-white/40 dark:hover:bg-white/5 transition-all"
              title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
               {isMinimized ? <Maximize2 size={16} /> : <Menu size={18} />}
            </button>
          </div>

          {/* User card (Mobile/Desktop Expanded only) */}
          <div className={`py-4 px-2 lg:p-2 shrink-0 transition-opacity duration-300 ${isMinimized ? "lg:hidden" : ""}`}>
            <div className="card !p-4 lg:!p-3 border border-white/60 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-inner rounded-2xl">
              <p className="font-semibold text-sm truncate text-text-primary dark:text-text-primary-dark">{user?.name}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                {user?.branch} • Year {user?.year}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-amber-500 lg:text-amber-500 text-sm font-bold">
                  <Star size={14} /> {displayPoints} pts
                </div>
                {displayStreak > 0 && (
                  <div className="flex items-center gap-1 text-red-500 lg:text-red-500 text-sm font-bold">
                    <Flame size={14} /> {displayStreak} d
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-1 lg:px-0 py-2 overflow-y-auto space-y-1 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 lg:px-3 py-3 rounded-2xl lg:rounded-[1.25rem] transition-all duration-300 group
                    ${isActive ? glassItemActive : glassItemInactive}
                    ${isActive ? "" : "bg-transparent"}
                    ${isMinimized ? "lg:justify-center lg:px-0" : ""}
                  `}
                  title={isMinimized ? item.label : undefined}
                >
                  <Icon size={isMinimized ? 22 : 20} className={`shrink-0 transition-all ${isActive ? "scale-110 drop-shadow-sm" : "group-hover:scale-110"}`} />
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isMinimized ? "lg:hidden" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {user?.role === "moderator" && (
              <>
                <div className={`border-t border-border dark:border-border-dark lg:border-white/10 my-3 transition-opacity ${isMinimized ? "lg:mx-2" : "lg:mx-0"}`} />
                <Link
                  href="/moderator"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 lg:px-3 py-3 rounded-2xl lg:rounded-[1.25rem] transition-all duration-300 group
                    ${pathname === "/moderator" 
                      ? "bg-amber-100/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-sm border border-amber-200 dark:border-amber-500/20" 
                      : "text-text-secondary lg:text-amber-600/70 dark:text-amber-500/70 hover:bg-white/40 dark:hover:bg-white/5 border border-transparent"}
                    ${isMinimized ? "lg:justify-center lg:px-0" : ""}
                  `}
                  title={isMinimized ? "Moderator Panel" : undefined}
                >
                  <Shield size={isMinimized ? 22 : 20} className={`shrink-0 transition-transform group-hover:scale-110 ${pathname === "/moderator" ? "scale-110 drop-shadow-sm" : ""}`} />
                  <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isMinimized ? "lg:hidden" : ""}`}>Moderator Panel</span>
                </Link>
              </>
            )}
          </nav>

          {/* Bottom */}
          <div className="p-2 lg:p-0 border-t border-border dark:border-border-dark lg:border-white/20 shrink-0">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={`flex items-center gap-3 px-4 lg:px-3 py-3 mt-1 w-full rounded-2xl lg:rounded-[1.25rem] transition-colors
                text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-100 dark:hover:border-red-500/20
                ${isMinimized ? "lg:justify-center lg:px-0" : ""}
              `}
              title={isMinimized ? "Sign Out" : undefined}
            >
              <LogOut size={isMinimized ? 22 : 20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isMinimized ? "lg:hidden" : ""}`}>Sign Out</span>
            </button>
          </div>
        </div>
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
    </>
  );
}
