"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  X,
  LogOut,
  Calculator,
  MessageSquareText,
  CreditCard,
  Github,
  ChevronRight,
  Send,
  User,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  RefreshCw,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// KTU Grade mapping
const KTU_GRADES = [
  { grade: "O", point: 10 },
  { grade: "A+", point: 9 },
  { grade: "A", point: 8.5 },
  { grade: "B+", point: 8 },
  { grade: "B", point: 7.5 },
  { grade: "C", point: 7 },
  { grade: "P", point: 6 },
  { grade: "F", point: 0 },
  { grade: "FE", point: 0 },
  { grade: "Ab", point: 0 },
];

interface Course {
  name: string;
  credits: string;
  grade: string;
}

interface Semester {
  id: number;
  sgpa: string;
  totalCredits: string;
}

type SettingsTab = "account" | "calculator" | "feedback" | "ieee" | "github";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  
  // Theme Handling
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Feedback
  const [feedbackText, setFeedbackText] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // SGPA Calculator
  const [courses, setCourses] = useState<Course[]>([
    { name: "", credits: "", grade: "O" },
    { name: "", credits: "", grade: "O" },
    { name: "", credits: "", grade: "O" },
    { name: "", credits: "", grade: "O" },
    { name: "", credits: "", grade: "O" },
  ]);
  const [sgpaResult, setSgpaResult] = useState<number | null>(null);
  const [sgpaSemester, setSgpaSemester] = useState<number>(1);

  // CGPA Calculator
  const [calcMode, setCalcMode] = useState<"sgpa" | "cgpa">("sgpa");
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: 1, sgpa: "", totalCredits: "" },
    { id: 2, sgpa: "", totalCredits: "" },
  ]);
  const [cgpaResult, setCgpaResult] = useState<number | null>(null);

  // IEEE Membership
  const [ieeeCardUrl, setIeeeCardUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [ieeeStatus, setIeeeStatus] = useState<"none" | "pending" | "verified" | "failed">("none");

  // GitHub
  const [githubData, setGithubData] = useState<{ connected: boolean; username?: string; points?: number } | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(false);

  // Fetch GitHub status when tab is active
  useEffect(() => {
    if (isOpen && activeTab === "github" && !githubData) {
      fetchGithubStatus();
    }
  }, [isOpen, activeTab]);

  // Fetch IEEE state actively on tab focus
  useEffect(() => {
    if (isOpen && activeTab === "ieee") {
      fetch("/api/users/me").then(r => r.json()).then(data => {
        if (data.ieeeCardUrl && !ieeeCardUrl) setIeeeCardUrl(data.ieeeCardUrl);
        if (data.ieeeStatus && ieeeStatus === "none") setIeeeStatus(data.ieeeStatus);
      }).catch(() => {});
    }
  }, [isOpen, activeTab]);

  const fetchGithubStatus = async () => {
    setLoadingGithub(true);
    try {
      const res = await fetch("/api/github");
      if (res.ok) setGithubData(await res.json());
    } catch {}
    setLoadingGithub(false);
  };

  if (!isOpen) return null;

  // ──── SGPA CALCULATION ────
  const calculateSGPA = () => {
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let valid = true;

    courses.forEach((c) => {
      const cr = parseFloat(c.credits);
      if (!c.credits || isNaN(cr) || cr <= 0) {
        valid = false;
        return;
      }
      const gradeObj = KTU_GRADES.find((g) => g.grade === c.grade);
      if (!gradeObj) {
        valid = false;
        return;
      }
      totalWeightedPoints += cr * gradeObj.point;
      totalCredits += cr;
    });

    if (!valid || totalCredits === 0) {
      toast.error("Please fill in valid credits for all courses");
      return;
    }

    const sgpa = totalWeightedPoints / totalCredits;
    const finalSgpa = Math.round(sgpa * 100) / 100;
    setSgpaResult(finalSgpa);

    // Auto-sync mapped targets directly to CGPA arrays
    const existingIndex = semesters.findIndex(s => s.id === sgpaSemester);
    if (existingIndex !== -1) {
      const upd = [...semesters];
      upd[existingIndex] = { id: sgpaSemester, sgpa: finalSgpa.toString(), totalCredits: totalCredits.toString() };
      setSemesters(upd);
    } else {
      const newSems = [...semesters, { id: sgpaSemester, sgpa: finalSgpa.toString(), totalCredits: totalCredits.toString() }];
      newSems.sort((a, b) => a.id - b.id);
      setSemesters(newSems);
    }
    toast.success(`SGPA mapped directly to S${sgpaSemester} in CGPA calculator!`, { icon: '🎓' });
  };

  // ──── CGPA CALCULATION ────
  const calculateCGPA = () => {
    let totalWeighted = 0;
    let totalCredits = 0;
    let valid = true;

    semesters.forEach((s) => {
      const sgpa = parseFloat(s.sgpa);
      const credits = parseFloat(s.totalCredits);
      if (!s.sgpa || !s.totalCredits || isNaN(sgpa) || isNaN(credits) || credits <= 0 || sgpa < 0 || sgpa > 10) {
        valid = false;
        return;
      }
      totalWeighted += sgpa * credits;
      totalCredits += credits;
    });

    if (!valid || totalCredits === 0) {
      toast.error("Please fill in valid SGPA and credits for all semesters");
      return;
    }

    const cgpa = totalWeighted / totalCredits;
    setCgpaResult(Math.round(cgpa * 100) / 100);
  };

  const addCourse = () => setCourses([...courses, { name: "", credits: "", grade: "O" }]);
  const removeCourse = (i: number) => setCourses(courses.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: keyof Course, value: string) => {
    const updated = [...courses];
    updated[i] = { ...updated[i], [field]: value };
    setCourses(updated);
  };

  const addSemester = () => setSemesters([...semesters, { id: semesters.length + 1, sgpa: "", totalCredits: "" }]);
  const removeSemester = (i: number) => setSemesters(semesters.filter((_, idx) => idx !== i));

  // ──── FEEDBACK ────
  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSendingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: feedbackText }),
      });
      if (!res.ok) throw new Error();
      toast.success("Feedback submitted! Thank you 💖");
      setFeedbackText("");
    } catch {
      toast.error("Failed to submit feedback");
    }
    setSendingFeedback(false);
  };

  // ──── IEEE VERIFICATION ────
  const verifyIEEECard = async () => {
    if (!ieeeCardUrl.trim()) {
      toast.error("Please upload your IEEE membership card image first");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/users/ieee-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUrl: ieeeCardUrl }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIeeeStatus("verified");
        toast.success("Already Verified!");
      } else if (res.ok) {
        setIeeeStatus("pending");
        toast.success("Card submitted for manual moderator review! ⏱️");
      } else {
        toast.error(data.reason || "Submission error");
      }
    } catch {
      toast.error("Failed to connect to verification core");
    }
    setVerifying(false);
  };

  // ──── GITHUB ────
  const connectGithub = () => {
    window.location.href = "/api/github/auth";
  };

  const tabs = [
    { key: "account" as SettingsTab, label: "Account", icon: User },
    { key: "calculator" as SettingsTab, label: "GPA Calculator", icon: Calculator },
    { key: "feedback" as SettingsTab, label: "Feedback", icon: MessageSquareText },
    { key: "ieee" as SettingsTab, label: "IEEE Membership", icon: CreditCard },
    { key: "github" as SettingsTab, label: "GitHub", icon: Github },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-border dark:border-white/10 flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border dark:border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2.5">
            <Sparkles size={22} className="text-primary" /> Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-4 sm:px-6 py-3 border-b border-border dark:border-white/10 overflow-x-auto shrink-0 no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  activeTab === t.key
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {/* ════════ ACCOUNT ════════ */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5 sm:p-6 border border-primary/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{user?.name}</h3>
                    <p className="text-sm text-text-secondary">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border dark:border-white/10">
                    <p className="text-xs text-text-secondary font-medium">Branch</p>
                    <p className="text-sm font-bold text-text-primary">{user?.branch}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border dark:border-white/10">
                    <p className="text-xs text-text-secondary font-medium">Year</p>
                    <p className="text-sm font-bold text-text-primary">{user?.year}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border dark:border-white/10">
                    <p className="text-xs text-text-secondary font-medium">Role</p>
                    <p className="text-sm font-bold text-text-primary capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Appearance Block */}
              {mounted && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border dark:border-white/10 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-text-primary flex items-center gap-2">
                      <Moon size={18} className="text-accent-cyan dark:text-accent-emerald" /> Dark Mode
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">Override system theme preferences</p>
                  </div>
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`w-14 h-7 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute transition-transform shadow-md ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl border border-red-200 dark:border-red-500/20 transition-all"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}

          {/* ════════ GPA CALCULATOR ════════ */}
          {activeTab === "calculator" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button onClick={() => { setCalcMode("sgpa"); setSgpaResult(null); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${calcMode === "sgpa" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-text-secondary"}`}>SGPA</button>
                <button onClick={() => { setCalcMode("cgpa"); setCgpaResult(null); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${calcMode === "cgpa" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-text-secondary"}`}>CGPA</button>
              </div>

              {calcMode === "sgpa" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-text-secondary bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-xl">
                    <Info size={14} className="text-blue-500 shrink-0" />
                    <span>KTU Grade Points: O(10), A+(9), A(8.5), B+(8), B(7.5), C(7), P(6), F/FE/Ab(0)</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-white/10">
                    <label className="text-sm font-bold text-text-primary">Target Semester:</label>
                    <select 
                      value={sgpaSemester} 
                      onChange={(e) => {
                        setSgpaSemester(Number(e.target.value));
                        setCourses([
                          { name: "", credits: "", grade: "O" },
                          { name: "", credits: "", grade: "O" },
                          { name: "", credits: "", grade: "O" },
                          { name: "", credits: "", grade: "O" },
                          { name: "", credits: "", grade: "O" },
                        ]);
                        setSgpaResult(null);
                      }} 
                      className="input-field !py-1.5 w-full sm:w-40 font-bold text-primary"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    {courses.map((c, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" placeholder={`Course ${i + 1}`} value={c.name} onChange={(e) => updateCourse(i, "name", e.target.value)} className="input-field !py-2 text-sm flex-1 min-w-0" />
                        <input type="number" placeholder="Cr" value={c.credits} onChange={(e) => updateCourse(i, "credits", e.target.value)} className="input-field !py-2 text-sm w-16 sm:w-24" min="1" max="10" />
                        <select value={c.grade} onChange={(e) => updateCourse(i, "grade", e.target.value)} className="input-field !py-2 text-sm w-16 sm:w-20">
                          {KTU_GRADES.map((g) => (<option key={g.grade} value={g.grade}>{g.grade}</option>))}
                        </select>
                        {courses.length > 1 && (<button onClick={() => removeCourse(i)} className="text-red-400 hover:text-red-600 p-1 shrink-0"><Trash2 size={16} /></button>)}
                      </div>
                    ))}
                  </div>
                  <button onClick={addCourse} className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"><Plus size={16} /> Add Course</button>
                  <button onClick={calculateSGPA} className="btn-primary w-full flex items-center justify-center gap-2"><Calculator size={18} /> Calculate SGPA</button>
                  {sgpaResult !== null && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 text-center animate-fade-in">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Your Semester GPA</p>
                      <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400">{sgpaResult}</p>
                      <p className="text-xs text-text-secondary mt-2">out of 10.0</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-text-secondary bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-xl">
                    <Info size={14} className="text-blue-500 shrink-0" />
                    <span>Enter each semester's SGPA and total credits to calculate your cumulative GPA.</span>
                  </div>
                  <div className="space-y-2.5">
                    {semesters.map((s, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-sm font-bold text-text-secondary w-8 shrink-0">S{s.id}</span>
                        <input type="number" placeholder="SGPA" value={s.sgpa} onChange={(e) => { const upd = [...semesters]; upd[i] = { ...upd[i], sgpa: e.target.value }; setSemesters(upd); }} className="input-field !py-2 text-sm flex-1" min="0" max="10" step="0.01" />
                        <input type="number" placeholder="Credits" value={s.totalCredits} onChange={(e) => { const upd = [...semesters]; upd[i] = { ...upd[i], totalCredits: e.target.value }; setSemesters(upd); }} className="input-field !py-2 text-sm w-20" min="1" />
                        {semesters.length > 1 && (<button onClick={() => removeSemester(i)} className="text-red-400 hover:text-red-600 p-1 shrink-0"><Trash2 size={16} /></button>)}
                      </div>
                    ))}
                  </div>
                  <button onClick={addSemester} className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"><Plus size={16} /> Add Semester</button>
                  <button onClick={calculateCGPA} className="btn-primary w-full flex items-center justify-center gap-2"><GraduationCap size={18} /> Calculate CGPA</button>
                  {cgpaResult !== null && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-2xl p-5 text-center animate-fade-in">
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 font-semibold mb-1">Your Cumulative GPA</p>
                      <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{cgpaResult}</p>
                      <p className="text-xs text-text-secondary mt-2">out of 10.0</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════ FEEDBACK ════════ */}
          {activeTab === "feedback" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
                <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2"><MessageSquareText size={18} /> Share Your Thoughts</h3>
                <p className="text-sm text-amber-700 dark:text-amber-500">Help us improve! Your feedback goes directly to the moderator team.</p>
              </div>
              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="What would you like to see improved? Any bugs? Feature requests?" className="input-field !h-36 resize-none" maxLength={2000} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{feedbackText.length}/2000</span>
                <button onClick={submitFeedback} disabled={!feedbackText.trim() || sendingFeedback} className="btn-primary flex items-center gap-2">
                  <Send size={16} /> {sendingFeedback ? "Sending..." : "Submit Feedback"}
                </button>
              </div>
            </div>
          )}

          {/* ════════ IEEE MEMBERSHIP ════════ */}
          {activeTab === "ieee" && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-700 rounded-2xl p-5">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-2"><CreditCard size={18} /> IEEE Membership Verification</h3>
                <p className="text-sm text-blue-700 dark:text-blue-500">Upload your IEEE membership card to earn bonus points. Our moderators will verify its authenticity.</p>
              </div>
              {ieeeStatus === "verified" ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden animate-fade-in">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  {ieeeCardUrl && (
                    <div className="mb-5 relative z-10 mx-auto max-w-[200px] rounded-xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-md transform -rotate-2 hover:rotate-0 transition-all duration-300">
                      <img src={ieeeCardUrl} alt="Verified IEEE Card" className="w-full h-auto object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-400" /> Authorized</span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-800 dark:to-green-900 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-200 dark:border-emerald-700"><Sparkles className="text-emerald-600 dark:text-emerald-400" size={32} /></div>
                  <h3 className="font-black text-emerald-800 dark:text-emerald-300 text-xl tracking-tight mb-2 relative z-10">You are officially Verified! ✓</h3>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-500 max-w-[280px] sm:max-w-sm mx-auto relative z-10 leading-relaxed">Your IEEE membership card has been successfully audited and approved. You have officially earned the exclusive <b>IEEE Member</b> badge along with your new <b>Premium</b> ranking privileges!</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-semibold text-text-primary mb-2 block">Upload Card Image</label>
                    <UploadDropzone<OurFileRouter, "ieeeUploader">
                      endpoint="ieeeUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setIeeeCardUrl(res[0].url);
                          toast.success("Image uploaded successfully!");
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload error: ${error.message}`);
                      }}
                      appearance={{
                        container: "border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 p-8 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20",
                        label: "text-blue-600 dark:text-blue-400 font-bold",
                        allowedContent: "text-blue-500/70 text-xs mt-1",
                        button: "bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2 rounded-xl mt-4 focus:ring-2 focus:ring-primary/50",
                      }}
                    />
                    {ieeeCardUrl && (
                      <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 size={16} /> Image Document Uploaded Successfully
                      </div>
                    )}
                  </div>
                  
                  {ieeeStatus === "pending" && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" /> Submitted for Moderator Review
                    </div>
                  )}
                  {ieeeStatus === "failed" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-3 text-sm text-red-600 dark:text-red-400 font-medium flex gap-2">
                      <X size={16} className="shrink-0 mt-0.5" /> Verification rejected by moderator. Please upload a clear official IEEE membership card.
                    </div>
                  )}
                  
                  <button 
                    onClick={verifyIEEECard} 
                    disabled={verifying || ieeeStatus === "pending" || !ieeeCardUrl} 
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    <Sparkles size={18} /> {verifying ? "Submitting Request..." : ieeeStatus === "pending" ? "Awaiting Review" : "Submit for Verification"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ════════ GITHUB ════════ */}
          {activeTab === "github" && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-1 flex items-center gap-2"><Github size={18} /> GitHub Integration</h3>
                <p className="text-sm text-text-secondary">Connect your GitHub account to earn points for commits and showcase your work in the community forums.</p>
              </div>

              {loadingGithub ? (
                <div className="text-center py-8">
                  <RefreshCw size={24} className="animate-spin text-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Checking connection...</p>
                </div>
              ) : githubData?.connected ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
                        <Github className="text-white dark:text-gray-900" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary flex items-center gap-2">
                          @{githubData.username} <CheckCircle2 size={16} className="text-emerald-500" />
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Connected & Synced</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between border border-border dark:border-white/10">
                      <span className="text-sm text-text-secondary">Points earned from GitHub</span>
                      <span className="font-bold text-amber-600">{githubData.points || 0} pts</span>
                    </div>
                  </div>
                  <a href="/github" onClick={onClose} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                    View full GitHub Hub <ChevronRight size={14} />
                  </a>
                </div>
              ) : (
                <>
                  <button onClick={connectGithub} className="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg">
                    <Github size={20} /> Connect with GitHub <ChevronRight size={16} />
                  </button>
                  <p className="text-xs text-text-secondary text-center">We use OAuth for secure authentication. We only read your public profile and repositories.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
