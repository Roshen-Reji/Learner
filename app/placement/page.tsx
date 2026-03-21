"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import toast from "react-hot-toast";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";
import {
  Briefcase,
  ExternalLink,
  Calendar,
  Code,
  Filter,
  MapPin,
  Trash2,
  Linkedin,
  Building2,
  Search,
  Sparkles,
  Award,
  Clock
} from "lucide-react";

interface Placement {
  _id: string;
  company: string;
  role: string;
  skills: string[];
  ctcRange: string;
  deadline: string;
  applyLink: string;
  branches: string[];
  eligibleYears: number[];
  description: string;
  driveType: "On-Campus" | "Off-Campus" | "Pooled";
  minCgpa: number;
  backlogsAllowed: boolean;
  createdAt: string;
}

export default function PlacementPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isMod = user?.role === "moderator";

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPlacements();
  }, [branchFilter]);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const params = branchFilter !== "all" ? `?branch=${branchFilter}` : "";
      const res = await fetch(`/api/placement${params}`);
      const data = await res.json();
      setPlacements(data);
    } catch {
      toast.error("Failed to load placements");
    }
    setLoading(false);
  };

  const deletePlacement = async (id: string, company: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the listing for "${company}"?`)) return;
    try {
      await fetch(`/api/placement/${id}`, { method: "DELETE" });
      toast.success("Listing securely deleted");
      fetchPlacements();
    } catch {
      toast.error("Deletion failed");
    }
  };

  const isExpired = (deadline: string) => new Date(deadline) < new Date();
  const daysLeft = (deadline: string) => {
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };
  const isLinkedIn = (url: string) => url?.includes("linkedin.com");

  const filtered = placements.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.company.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.skills.some((s) => s.toLowerCase().includes(q)) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const aExp = isExpired(a.deadline);
    const bExp = isExpired(b.deadline);
    if (aExp !== bExp) return aExp ? 1 : -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-black transition-colors duration-700">
      {/* Decorative blurred blobs for glassy background */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px] pointer-events-none" />

      <Sidebar />
      <main className="relative z-10 lg:ml-72 pt-20 lg:pt-8 pb-28 lg:pb-8 min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full flex-1 flex flex-col">
          
          {/* Header */}
          <div className="mb-8 drop-shadow-sm flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-text-primary flex items-center gap-3 tracking-tight">
                <Briefcase className="text-primary" size={36} /> Placement Radar
              </h1>
              <p className="text-text-secondary mt-2 font-medium flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> KTU Engineering • High-Match Opportunities
                <span className="hidden sm:flex items-center gap-1.5 ml-2 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold shadow-sm">
                  <Linkedin size={12} /> Auto-Sync Active
                </span>
              </p>
            </div>
            {/* Quick Stats Banner */}
            <div className="flex gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-white/10 p-2 rounded-2xl shadow-sm w-fit">
              <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-black flex items-center gap-2 shadow-inner">
                <Sparkles size={14}/> {sorted.filter((p) => !isExpired(p.deadline)).length} Live
              </div>
              <div className="px-4 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-text-secondary text-sm font-bold flex items-center gap-2 shadow-inner">
                {sorted.length} Total
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-sm flex items-center px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-primary/50">
                <Search size={20} className="text-text-secondary shrink-0" />
                <input
                  type="text"
                  placeholder="Ask for companies, roles, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 ml-3 text-text-primary placeholder:text-text-secondary/70 font-medium"
                />
              </div>
            </div>
            
            <div className="relative sm:w-64 group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="relative w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-sm px-4 py-3 sm:py-3.5 appearance-none outline-none font-bold text-text-primary cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <option value="all">🌐 All Engineering Branches</option>
                {["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map((b) => (
                  <option key={b} value={b}>🎯 {b} Exclusive</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
            </div>
          </div>

          {/* Content Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-20 min-h-[400px]">
              <HeartbeatLoader message="PULSING JOB BOARDS" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-10 text-center shadow-xl w-full max-w-lg mx-auto mt-10">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Briefcase className="text-primary/70 drop-shadow-sm" size={48} />
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-2">No active radars found</h3>
              <p className="text-text-secondary font-medium leading-relaxed max-w-sm mx-auto">
                {searchQuery ? "We couldn't find a match for that specific term. Try broadening your horizon." : "The cron job hasn't fetched any recent opportunities. Check back later!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
              {sorted.map((p) => {
                const expired = isExpired(p.deadline);
                const days = daysLeft(p.deadline);
                const urgent = days <= 3 && days > 0;
                const approaching = days <= 7 && days > 3;

                let statusBadge = null;
                if (expired) {
                  statusBadge = <span className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">Expired</span>;
                } else if (urgent) {
                  statusBadge = <span className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pulse"><Clock size={12}/> {days} Days Left!</span>;
                } else if (approaching) {
                  statusBadge = <span className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-sm flex items-center gap-1"><Clock size={12}/> Closing Soon</span>;
                } else {
                  statusBadge = <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">Active</span>;
                }

                return (
                  <div
                    key={p._id}
                    className={`group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border ${
                      urgent && !expired ? "border-rose-400 dark:border-rose-500/50 shadow-[0_5px_30px_rgba(244,63,94,0.15)]" : "border-white/60 dark:border-white/10 shadow-lg"
                    } rounded-[2rem] p-6 sm:p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                      expired ? "opacity-60 grayscale-[40%] hover:grayscale-0" : ""
                    }`}
                  >
                    {/* Background glow hover effect */}
                    {!expired && (
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    )}

                    {/* Header: Company & Action */}
                    <div className="flex items-start justify-between mb-5 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center shrink-0 border border-white/40 dark:border-white/5 shadow-inner group-hover:scale-105 transition-transform duration-500">
                          <Building2 size={28} className="text-primary drop-shadow-sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-xl text-text-primary tracking-tight">
                              {p.company}
                            </h3>
                            {statusBadge}
                          </div>
                          <p className="text-primary dark:text-blue-400 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                            {p.role} 
                            {p.driveType && (
                              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${
                                p.driveType === "On-Campus" ? "bg-green-100/50 border-green-200 text-green-800" : 
                                p.driveType === "Pooled" ? "bg-purple-100/50 border-purple-200 text-purple-800" : 
                                "bg-blue-100/50 border-blue-200 text-blue-800"
                              }`}>
                                {p.driveType}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Moderator Controls */}
                      {isMod && (
                        <button
                          onClick={() => deletePlacement(p._id, p.company)}
                          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors shadow-sm shrink-0"
                          title="Eradicate Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Highlight Strip (Salary & CGPA) */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      {p.ctcRange && (
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                           <Award size={14} /> {p.ctcRange}
                        </span>
                      )}
                      {(p.minCgpa || 0) > 0 && (
                        <span className="bg-amber-100/80 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                           <Sparkles size={14} className="text-amber-500" /> Min {p.minCgpa} CGPA
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {p.description && (
                      <p className="text-sm font-medium text-text-secondary mb-5 leading-relaxed bg-white/40 dark:bg-black/20 p-4 rounded-xl border border-white/50 dark:border-white/5 shadow-inner">
                        {p.description}
                      </p>
                    )}

                    {/* Required Skills Badges */}
                    {p.skills && p.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {p.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform hover:-translate-y-0.5">
                            <Code size={12} className="text-blue-500" /> {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* KTU Eligibility Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-border/50 dark:border-white/10 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                          <span className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md border border-white/10"><Filter size={12} className="text-blue-500"/> {p.branches.length > 0 ? p.branches.join(", ") : "All Branches"}</span>
                          {p.eligibleYears.length > 0 && (
                            <span className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md border border-white/10">Year {p.eligibleYears.join(", ")}</span>
                          )}
                        </div>
                        <p className={`text-xs font-black uppercase tracking-widest ${p.backlogsAllowed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {p.backlogsAllowed ? "✓ Active Backlogs Allowed" : "✕ Zero Active Backlogs"}
                        </p>
                      </div>

                      {/* Call to Action Button */}
                      {p.applyLink && !expired && (
                        <a
                          href={p.applyLink}
                          target="_blank"
                          rel="noopener"
                          className={`flex items-center justify-center gap-2 text-sm font-extrabold rounded-xl px-6 py-3 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0 w-full sm:w-auto ${
                            isLinkedIn(p.applyLink)
                              ? "bg-gradient-to-r from-[#0A66C2] to-[#0855A1] text-white hover:brightness-110"
                              : "bg-gradient-to-r from-primary to-blue-600 text-white hover:brightness-110"
                          }`}
                        >
                          {isLinkedIn(p.applyLink) ? (
                            <><Linkedin size={16} fill="currentColor" /> Apply via LinkedIn</>
                          ) : (
                            <><ExternalLink size={16} /> Direct Apply</>
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
