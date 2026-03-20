"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import toast from "react-hot-toast";
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
    } catch {}
    setLoading(false);
  };

  const deletePlacement = async (id: string, company: string) => {
    if (!confirm(`Delete "${company}" listing?`)) return;
    try {
      await fetch(`/api/placement/${id}`, { method: "DELETE" });
      toast.success("Listing deleted");
      fetchPlacements();
    } catch {
      toast.error("Delete failed");
    }
  };

  const isExpired = (deadline: string) => new Date(deadline) < new Date();
  const daysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
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

  // Sort: active first, then by deadline
  const sorted = [...filtered].sort((a, b) => {
    const aExp = isExpired(a.deadline);
    const bExp = isExpired(b.deadline);
    if (aExp !== bExp) return aExp ? 1 : -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
              <Briefcase className="text-primary" /> Placement Updates
            </h1>
            <p className="text-text-secondary mt-1 flex items-center gap-2">
              <MapPin size={14} /> Kerala Engineering • Companies actively hiring
              <span className="hidden sm:flex items-center gap-1 ml-2 text-xs badge bg-blue-50 text-blue-600">
                <Linkedin size={10} /> LinkedIn Integrated
              </span>
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search companies, roles, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !pl-9"
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field !w-auto"
            >
              <option value="all">All Branches</option>
              {["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 mb-6 text-sm">
            <div className="badge bg-green-50 text-green-700">
              {sorted.filter((p) => !isExpired(p.deadline)).length} Active
            </div>
            <div className="badge bg-gray-100 text-gray-600">
              {sorted.filter((p) => isExpired(p.deadline)).length} Expired
            </div>
            <div className="badge bg-blue-50 text-blue-700">
              {sorted.length} Total
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="card text-center py-16">
              <Briefcase className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-semibold">No placement updates found</h3>
              <p className="text-text-secondary mt-1">
                {searchQuery ? "Try a different search term" : "Check back soon for hiring updates"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sorted.map((p) => {
                const expired = isExpired(p.deadline);
                const days = daysLeft(p.deadline);
                const urgent = days <= 7 && days > 0;

                return (
                  <div
                    key={p._id}
                    className={`card animate-fade-in transition-all hover:shadow-md ${
                      expired ? "opacity-50 grayscale-[30%]" : ""
                    } ${urgent ? "!border-amber-400" : ""}`}
                  >
                    {/* Company Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
                          <Building2 size={22} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-text-primary leading-tight flex items-center gap-2">
                            {p.company}
                            {p.driveType && (
                              <span className={`badge text-[10px] uppercase font-bold px-1.5 py-0.5 ${p.driveType === "On-Campus" ? "bg-green-50 text-green-700" : p.driveType === "Pooled" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                                {p.driveType}
                              </span>
                            )}
                          </h3>
                          <p className="text-primary font-semibold text-sm">{p.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.ctcRange && (
                          <span className="badge-success text-xs font-bold">{p.ctcRange}</span>
                        )}
                        {isMod && (
                          <button
                            onClick={() => deletePlacement(p._id, p.company)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-error/50 hover:text-error transition"
                            title="Delete listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {p.description && (
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">{p.description}</p>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-1">
                          <Code size={10} /> {skill}
                        </span>
                      ))}
                    </div>

                    {/* Meta info block */}
                    <div className="flex flex-wrap gap-2 text-xs text-text-secondary mb-3 p-2 bg-gray-50 rounded-lg border border-border">
                      {p.branches.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Filter size={10} /> {p.branches.join(", ")}
                        </span>
                      )}
                      {p.eligibleYears.length > 0 && (
                        <span className="border-l border-gray-300 pl-2">Year {p.eligibleYears.join(", ")}</span>
                      )}
                      {(p.minCgpa || 0) > 0 && (
                        <span className="border-l border-gray-300 pl-2 font-medium text-amber-700">Min CGPA: {p.minCgpa}</span>
                      )}
                      <span className={`border-l border-gray-300 pl-2 font-medium ${p.backlogsAllowed ? "text-success" : "text-error"}`}>
                        {p.backlogsAllowed ? "Active Backlogs Allowed" : "0 Active Backlogs"}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar size={14} className="text-text-secondary" />
                        {expired ? (
                          <span className="text-error font-medium">Expired</span>
                        ) : urgent ? (
                          <span className="text-amber-600 font-semibold">{days} days left!</span>
                        ) : (
                          <span className="text-text-secondary">
                            Deadline: {new Date(p.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      {p.applyLink && !expired && (
                        <a
                          href={p.applyLink}
                          target="_blank"
                          rel="noopener"
                          className={`flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 transition-all ${
                            isLinkedIn(p.applyLink)
                              ? "bg-[#0A66C2] text-white hover:bg-[#004182]"
                              : "bg-primary text-white hover:bg-primary-700"
                          }`}
                        >
                          {isLinkedIn(p.applyLink) ? (
                            <>
                              <Linkedin size={13} /> Apply
                            </>
                          ) : (
                            <>
                              <ExternalLink size={13} /> Apply
                            </>
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
