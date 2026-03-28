"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import toast from "react-hot-toast";
import {
  Shield,
  Users,
  Brain,
  Map,
  Briefcase,
  Plus,
  Check,
  X,
  Trash2,
  Bot,
  Eye,
  EyeOff,
  Edit3,
  RefreshCw,
  Key,
  UserPlus,
  BarChart3,
  Zap,
  AlertCircle,
  ExternalLink,
  Save,
  CloudLightning,
  FileText,
  Download,
  Settings,
  ShieldAlert,
  MessageSquareText,
} from "lucide-react";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";

export default function ModeratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({ users: 0, pendingQuestions: 0, totalQuestions: 0, roadmaps: 0, placements: 0, notes: 0 });

  // Create user form
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", branch: "CSE", year: 1, role: "student" });
  const [showPassword, setShowPassword] = useState(false);

  // Edit / View user
  const [editingUser, setEditingUser] = useState<any>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", branch: "", year: 1, role: "student", password: "", isPremium: false, roadmapCap: 3 });

  // Placement form
  const [newPlacement, setNewPlacement] = useState({
    company: "", role: "", skills: "", ctcRange: "", deadline: "", applyLink: "", branches: "", eligibleYears: "", description: "", driveType: "Off-Campus", minCgpa: "", backlogsAllowed: "false"
  });
  const [editingPlacement, setEditingPlacement] = useState<any>(null);

  // Notes Management
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editNoteForm, setEditNoteForm] = useState({ title: "", subject: "", branch: "General", year: 0, description: "" });

  // Word Moderation Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [savingWords, setSavingWords] = useState(false);

  // AI tools
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState<"coding" | "numerical" | "verbal">("coding");
  const [aiIsHighIQ, setAiIsHighIQ] = useState(false);
  const [aiTargetBranch, setAiTargetBranch] = useState("General");
  const [aiSkill, setAiSkill] = useState("");
  const [generating, setGenerating] = useState(false);
  const [syncingJobs, setSyncingJobs] = useState(false);

  // Questions CRUD
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [qFilter, setQFilter] = useState<string>("all");
  const [qView, setQView] = useState<"live" | "pending">("live");
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editQForm, setEditQForm] = useState({ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", category: "coding", difficulty: "medium", isHighIQ: false, targetBranch: "General" });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", category: "coding", difficulty: "medium", isHighIQ: false, targetBranch: "General" });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || user?.role !== "moderator") {
      router.push("/dashboard");
      return;
    }
    loadAll();
  }, [session, status]);

  useEffect(() => {
    if (activeTab === "questions") { loadPendingQuestions(); loadAllQuestions(); }
    if (activeTab === "roadmaps") loadRoadmaps();
    if (activeTab === "placement") loadPlacements();
    if (activeTab === "feedback") loadFeedbacks();
  }, [activeTab, qFilter]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, questionsRes, allAptitudeRes, roadmapsRes, placementsRes, notesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/aptitude?pending=true"),
        fetch("/api/aptitude?all=true&filterCategory=all"),
        fetch("/api/roadmap?all=true"),
        fetch(`/api/placement?t=${Date.now()}`),
        fetch("/api/notes"),
      ]);
      const u = await usersRes.json();
      const q = await questionsRes.json();
      const allQ = await allAptitudeRes.json();
      const r = await roadmapsRes.json();
      const p = await placementsRes.json();
      const n = await notesRes.json();
      
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) setBlockedWords(await settingsRes.json());

      setUsers(u);
      setPendingQuestions(q);
      setAllRoadmaps(r);
      setPlacements(p);
      setNotes(n);
      setStats({
        users: u.length,
        pendingQuestions: q.length,
        totalQuestions: allQ.length + q.length,
        roadmaps: r.length,
        placements: p.length,
        notes: n.length,
      });
    } catch {}
    setLoading(false);
  };

  const loadFeedbacks = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) setFeedbacks(await res.json());
    } catch {}
  };

  const loadPendingQuestions = async () => {
    const res = await fetch("/api/aptitude?pending=true");
    setPendingQuestions(await res.json());
  };

  const loadAllQuestions = async () => {
    const res = await fetch(`/api/aptitude?all=true&filterCategory=${qFilter}`);
    if (res.ok) setAllQuestions(await res.json());
  };

  const loadRoadmaps = async () => {
    const res = await fetch("/api/roadmap?all=true");
    setAllRoadmaps(await res.json());
  };

  const loadPlacements = async () => {
    const res = await fetch(`/api/placement?t=${Date.now()}`);
    setPlacements(await res.json());
  };

  // ──── User Management ────
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`User ${newUser.name} created!`);
      setNewUser({ name: "", email: "", password: "", branch: "CSE", year: 1, role: "student" });
      loadAll();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const startEditUser = (u: any) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, branch: u.branch, year: u.year, role: u.role, password: "", isPremium: u.isPremium || false, roadmapCap: u.roadmapCap || 3 });
  };

  const saveEditUser = async () => {
    if (!editingUser) return;
    try {
      const body: any = { ...editForm };
      if (!body.password) delete body.password;
      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("User updated!");
      setEditingUser(null);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      toast.success("User deleted");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  const resetPassword = async (id: string, name: string) => {
    const newPass = prompt(`Enter new password for "${name}":`);
    if (!newPass || newPass.length < 4) {
      if (newPass !== null) toast.error("Password must be at least 4 characters");
      return;
    }
    try {
      await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });
      toast.success(`Password reset for ${name}`);
    } catch {
      toast.error("Reset failed");
    }
  };

  // ──── Questions ────
  const approveQuestion = async (id: string, approved: boolean) => {
    try {
      if (approved) {
        await fetch(`/api/aptitude/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved: true }) });
        toast.success("Approved!");
      } else {
        await fetch(`/api/aptitude/${id}`, { method: "DELETE" });
        toast.success("Rejected");
      }
      loadPendingQuestions();
      loadAllQuestions();
      loadAll();
    } catch {}
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question permanently?")) return;
    try {
      await fetch(`/api/aptitude/${id}`, { method: "DELETE" });
      toast.success("Question deleted");
      loadAllQuestions();
      loadAll();
    } catch { toast.error("Delete failed"); }
  };

  const startEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setEditQForm({ text: q.text, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation || "", category: q.category, difficulty: q.difficulty || "medium", isHighIQ: q.isHighIQ || false, targetBranch: q.targetBranch || "General" });
  };

  const saveEditQuestion = async () => {
    if (!editingQuestion) return;
    try {
      const res = await fetch(`/api/aptitude/${editingQuestion._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editQForm),
      });
      if (!res.ok) throw new Error();
      toast.success("Question updated!");
      setEditingQuestion(null);
      loadAllQuestions();
    } catch { toast.error("Update failed"); }
  };

  const createManualQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.text || newQuestion.options.some(o => !o.trim())) {
      toast.error("Fill in all fields"); return;
    }
    try {
      const res = await fetch("/api/aptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });
      if (!res.ok) throw new Error();
      toast.success("Question added & approved!");
      setNewQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", category: "coding", difficulty: "medium", isHighIQ: false, targetBranch: "General" });
      setShowAddQuestion(false);
      loadAllQuestions();
      loadAll();
    } catch { toast.error("Failed to add question"); }
  };

  const generateDailyQuestions = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/aptitude/generate-daily", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Daily questions generated! Coding: ${data.generated.coding}, Numerical: ${data.generated.numerical}, Verbal: ${data.generated.verbal}`);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || "Generation failed. Check Gemini API key.");
    }
    setGenerating(false);
  };

  const generateAIQuestions = async () => {
    if (!aiTopic) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/aptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aiGenerate: true, 
          topic: aiTopic, 
          category: aiCategory, 
          count: 5,
          isHighIQ: aiIsHighIQ,
          targetBranch: aiIsHighIQ ? "General" : aiTargetBranch 
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("5 questions generated → Review in Pending!");
      setAiTopic("");
      setActiveTab("questions");
      loadPendingQuestions();
    } catch {
      toast.error("Generation failed. Check API key.");
    }
    setGenerating(false);
  };

  // ──── Roadmaps ────
  const approveRoadmap = async (id: string, approved: boolean) => {
    try {
      if (approved) {
        await fetch(`/api/roadmap/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ moderate: true, updates: { approved: true } }) });
        toast.success("Roadmap approved!");
      } else {
        await fetch(`/api/roadmap/${id}`, { method: "DELETE" });
        toast.success("Roadmap deleted");
      }
      loadRoadmaps();
    } catch {}
  };

  const generateAIRoadmap = async () => {
    if (!aiSkill) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/roadmap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aiPropose: true, skill: aiSkill }) });
      if (!res.ok) throw new Error();
      toast.success("AI roadmap proposed → Review in Roadmaps tab!");
      setAiSkill("");
      loadRoadmaps();
    } catch {
      toast.error("Generation failed.");
    }
    setGenerating(false);
  };

  // ──── Notes Management ────
  const startEditNote = (n: any) => {
    setEditingNote(n);
    setEditNoteForm({ title: n.title, subject: n.subject, branch: n.branch, year: n.year, description: n.description });
  };

  const saveEditNote = async () => {
    if (!editingNote) return;
    try {
      const res = await fetch(`/api/notes/${editingNote._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editNoteForm),
      });
      if (!res.ok) throw new Error();
      toast.success("Note updated!");
      setEditingNote(null);
      loadAll();
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteNote = async (id: string, title: string) => {
    if (!confirm(`Delete note "${title}"? This removes it permanently.`)) return;
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      toast.success("Note deleted");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ──── Placements ────
  const syncRealtimeJobs = async () => {
    setSyncingJobs(true);
    try {
      const res = await fetch("/api/placement/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      loadPlacements();
      loadAll();
    } catch (e: any) {
      toast.error(e.message || "Sync failed");
    }
    setSyncingJobs(false);
  };

  const createPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPlacement,
          skills: newPlacement.skills.split(",").map(s => s.trim()).filter(Boolean),
          branches: newPlacement.branches.split(",").map(s => s.trim()).filter(Boolean),
          eligibleYears: newPlacement.eligibleYears.split(",").map(s => parseInt(s.trim())).filter(Boolean),
          minCgpa: parseFloat(newPlacement.minCgpa as string) || 0,
          backlogsAllowed: newPlacement.backlogsAllowed === "true",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Placement listing added!");
      setNewPlacement({ company: "", role: "", skills: "", ctcRange: "", deadline: "", applyLink: "", branches: "", eligibleYears: "", description: "", driveType: "Off-Campus", minCgpa: "", backlogsAllowed: "false" });
      loadPlacements();
      loadAll();
    } catch {
      toast.error("Failed to create listing");
    }
  };

  const deletePlacement = async (id: string, company: string) => {
    if (!confirm(`Delete "${company}" listing?`)) return;
    try {
      await fetch(`/api/placement/${id}`, { method: "DELETE" });
      toast.success("Placement deleted");
      loadPlacements();
      loadAll();
    } catch {}
  };



  // ──── Moderation Settings ────
  const saveBlockedWords = async (updatedWords: string[]) => {
    setSavingWords(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: updatedWords })
      });
      if (!res.ok) throw new Error();
      setBlockedWords(updatedWords);
      toast.success("Word blocklist updated");
    } catch {
      toast.error("Failed to update blocklist");
    }
    setSavingWords(false);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const w = newWord.trim().toLowerCase();
    if (!w || blockedWords.includes(w)) return;
    const next = [...blockedWords, w];
    setNewWord("");
    saveBlockedWords(next);
  };

  const handleRemoveWord = (w: string) => {
    const next = blockedWords.filter(bw => bw !== w);
    saveBlockedWords(next);
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users },
    { key: "questions", label: "Questions", icon: Brain },
    { key: "roadmaps", label: "Roadmaps", icon: Map },
    { key: "notes", label: "Notes", icon: FileText },
    { key: "placement", label: "Placement", icon: Briefcase },
    { key: "feedback", label: "Feedback", icon: MessageSquareText },
    { key: "ai", label: "AI Tools", icon: Bot },
  ];

  if (status === "loading" || !session || user?.role !== "moderator") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HeartbeatLoader message="LOADING DASHBOARD..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          {/* Header */}
          <div className="gradient-bg rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={28} className="text-amber-300" />
                  <h1 className="text-2xl sm:text-3xl font-bold">Moderator Control Panel</h1>
                </div>
                <p className="text-white/80 text-sm max-w-lg">
                  Manage users, approve content, generate AI questions, and control platform settings.
                </p>
              </div>
              <button 
                onClick={() => setShowSettingsModal(true)} 
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white border border-white/10 shadow-sm flex items-center gap-2 backdrop-blur-md"
                title="System Settings"
              >
                <Settings size={20} /> <span className="text-sm font-medium hidden sm:block">Settings</span>
              </button>
            </div>
            {/* Background elements for depth */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all text-sm ${
                    activeTab === t.key
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white text-text-secondary hover:bg-gray-50 border border-border"
                  }`}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* ════════ OVERVIEW ════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: stats.users, icon: Users, color: "from-blue-500 to-indigo-600" },
                  { label: "Questions", value: stats.totalQuestions, icon: Brain, color: "from-amber-500 to-orange-600" },
                  { label: "Roadmaps", value: stats.roadmaps, icon: Map, color: "from-emerald-500 to-teal-600" },
                  { label: "Live Notes", value: stats.notes, icon: FileText, color: "from-purple-500 to-fuchsia-600" },
                  { label: "Placements", value: stats.placements, icon: Briefcase, color: "from-pink-500 to-rose-600" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="card !p-5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                      <p className="text-sm text-text-secondary">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-primary" /> Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setActiveTab("users")} className="btn-secondary text-sm flex items-center justify-center gap-2">
                    <UserPlus size={16} /> Create User
                  </button>
                  <button onClick={generateDailyQuestions} disabled={generating} className="btn-primary text-sm flex items-center justify-center gap-2">
                    {generating ? <RefreshCw size={16} className="animate-spin" /> : <Bot size={16} />}
                    {generating ? "Generating..." : "Generate Daily Questions"}
                  </button>
                  <button onClick={() => setActiveTab("placement")} className="btn-secondary text-sm flex items-center justify-center gap-2">
                    <Briefcase size={16} /> Add Placement
                  </button>
                </div>
              </div>

              {stats.pendingQuestions > 0 && (
                <div className="card border-l-4 border-l-warning">
                  <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                    <AlertCircle size={16} /> {stats.pendingQuestions} questions pending approval
                  </div>
                  <button onClick={() => setActiveTab("questions")} className="text-primary text-sm font-medium mt-1 hover:underline">
                    Review now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════ USERS ════════ */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Create User */}
              <div className="card">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <UserPlus size={18} className="text-primary" /> Create New User
                </h2>
                <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="input-field" required />
                  <input placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="input-field" required />
                  <div className="relative">
                    <input placeholder="Password" type={showPassword ? "text" : "password"} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="input-field pr-10" required minLength={4} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <select value={newUser.branch} onChange={e => setNewUser({ ...newUser, branch: e.target.value })} className="input-field">
                    {["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map(b => <option key={b}>{b}</option>)}
                  </select>
                  <select value={newUser.year} onChange={e => setNewUser({ ...newUser, year: parseInt(e.target.value) })} className="input-field">
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="input-field">
                    <option value="student">Student</option>
                    <option value="moderator">Moderator</option>
                  </select>
                  <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-3">
                    <UserPlus size={16} className="inline mr-2" /> Create User
                  </button>
                </form>
              </div>

              {/* User List */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">All Users ({users.length})</h2>
                  <button onClick={loadAll} className="text-text-secondary hover:text-primary transition p-1">
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {users.map(u => (
                    <div key={u._id} className={`border rounded-xl p-4 transition-all ${editingUser?._id === u._id ? "border-primary bg-primary-50" : "border-border hover:border-primary/30"}`}>
                      {editingUser?._id === u._id ? (
                        /* Editing mode */
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Edit3 className="text-primary" size={18} />
                              <span className="text-base font-bold text-text-primary">Edit User Profile</span>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-error transition-colors"><X size={18} /></button>
                          </div>

                          <div className="space-y-4">
                            {/* Personal Details */}
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Personal Information</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">Full Name</label>
                                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="input-field !py-2 text-sm bg-white" />
                                </div>
                                <div>
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">Email Address</label>
                                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="input-field !py-2 text-sm bg-white" />
                                </div>
                              </div>
                            </div>

                            {/* Academic Details */}
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Academic Profile</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">Branch</label>
                                  <select value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} className="input-field !py-2 text-sm bg-white">
                                    {["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map(b => <option key={b}>{b}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">Year of Study</label>
                                  <select value={editForm.year} onChange={e => setEditForm({...editForm, year: parseInt(e.target.value)})} className="input-field !py-2 text-sm bg-white">
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Access & Limits */}
                            <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/50">
                              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Shield size={12} /> Access & Resources
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-3">
                                <div>
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">System Role</label>
                                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="input-field !py-2 text-sm bg-white">
                                    <option value="student">Student</option>
                                    <option value="moderator">Moderator</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">Premium Tier Status</label>
                                  <label className="flex items-center justify-between px-3 text-sm text-text-primary font-medium bg-white border border-border rounded-xl h-10 w-full cursor-pointer hover:border-primary/50 transition-colors">
                                    <span className="flex items-center gap-2">👑 Premium Rank</span>
                                    <input type="checkbox" checked={editForm.isPremium} onChange={e => setEditForm({ ...editForm, isPremium: e.target.checked, roadmapCap: e.target.checked ? 100 : 3 })} className="w-4 h-4 rounded text-primary" />
                                  </label>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                  <label className="text-[11px] font-medium text-text-secondary mb-1 block">AI Roadmap Cap (Limit)</label>
                                  <input type="number" min={0} value={editForm.roadmapCap} onChange={e => setEditForm({...editForm, roadmapCap: parseInt(e.target.value) || 0})} className="input-field !py-2 text-sm bg-white" />
                                </div>
                              </div>
                            </div>

                            {/* Security */}
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Security Intervention</h4>
                              <div>
                                <label className="text-[11px] font-medium text-text-secondary mb-1 block">Force Password Update (Leave blank to keep existing)</label>
                                <input placeholder="Enter new password to override..." type="text" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="input-field !py-2 text-sm bg-white" />
                              </div>
                            </div>

                            {/* User's Roadmaps */}
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Generated Roadmaps ({allRoadmaps.filter(rm => rm.createdBy === editingUser?._id).length})</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {allRoadmaps.filter(rm => rm.createdBy === editingUser?._id).length === 0 ? (
                                  <p className="text-xs text-text-secondary italic">No roadmaps generated by this user yet.</p>
                                ) : (
                                  allRoadmaps.filter(rm => rm.createdBy === editingUser?._id).map(rm => (
                                    <div key={rm._id} className="flex items-center justify-between text-sm bg-white border border-border px-3 py-2 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <span className="text-base leading-none">{rm.icon}</span>
                                        <div className="flex flex-col">
                                           <span className="font-medium text-text-primary truncate max-w-[120px] sm:max-w-xs leading-tight">{rm.skill}</span>
                                           <span className="text-[10px] text-text-secondary">{rm.nodes?.length || 0} stages</span>
                                        </div>
                                        {!rm.approved && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ml-1">Private</span>}
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        {!rm.approved && (
                                          <button type="button" onClick={() => approveRoadmap(rm._id, true)} className="p-1.5 bg-green-50 hover:bg-green-100 rounded-md text-success transition" title="Approve & Publish Globally">
                                            <Check size={14} />
                                          </button>
                                        )}
                                        <button type="button" onClick={() => approveRoadmap(rm._id, false)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded-md text-error transition" title="Delete Roadmap">
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button onClick={() => setEditingUser(null)} className="btn-secondary text-sm !py-2 bg-white">Cancel</button>
                            <button onClick={saveEditUser} className="btn-primary text-sm !py-2 flex items-center gap-2 shadow-md">
                              <Save size={16} /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View mode */
                        <div className="flex flex-col gap-3">
                          <div 
                            className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 -m-2 rounded-xl transition-colors"
                            onClick={() => setExpandedUserId(expandedUserId === u._id ? null : u._id)}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-text-primary">{u.name}</span>
                                <span className={`badge text-xs ${u.role === "moderator" ? "badge-warning" : "badge-primary"}`}>{u.role}</span>
                                {u.ieeeStatus === "verified" && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">💳 IEEE True</span>}
                              </div>
                              <p className="text-sm text-text-secondary">{u.email} • {u.branch} Y{u.year} • {u.points || 0} pts</p>
                            </div>
                            <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => startEditUser(u)} className="p-2 hover:bg-blue-50 rounded-lg text-primary transition" title="Edit User">
                                <Edit3 size={15} />
                              </button>
                              <button onClick={() => resetPassword(u._id, u.name)} className="p-2 hover:bg-amber-50 rounded-lg text-amber-500 transition" title="Reset Password">
                                <Key size={15} />
                              </button>
                              <button onClick={() => deleteUser(u._id, u.name)} className="p-2 hover:bg-red-50 rounded-lg text-error transition" title="Delete User">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details Panel */}
                          {expandedUserId === u._id && (
                             <div className="pt-3 mt-1 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in relative z-10">
                               <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                                 <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Activity Overview</h4>
                                 <div className="flex flex-wrap gap-2">
                                   <span className="text-[11px] bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-semibold border border-blue-100 dark:border-blue-900 shadow-sm flex items-center gap-1">
                                     📝 Uploads: {u.noteCount || 0}
                                   </span>
                                   <span className="text-[11px] bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold border border-emerald-100 dark:border-emerald-900 shadow-sm flex items-center gap-1">
                                     🗺️ Roadmaps: {u.roadmapCount || 0}/{u.roadmapCap || 3}
                                   </span>
                                   {u.isPremium && (
                                     <span className="text-[11px] bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                       👑 Premium
                                     </span>
                                   )}
                                 </div>
                               </div>
                               
                               <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                 <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">IEEE Membership Verification</h4>
                                 {u.ieeeCardUrl ? (
                                   <div className="flex flex-col gap-2 h-full justify-center">
                                     <a 
                                       href={u.ieeeCardUrl} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className={`text-[11px] px-3 py-2 rounded-lg font-bold border shadow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full text-center
                                         ${u.ieeeStatus === "verified" ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700" : "bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600"}
                                       `}
                                     >
                                        💳 View Source Card Image {u.ieeeStatus === "verified" ? "✓" : "(Pending Verification)"}
                                     </a>
                                   </div>
                                 ) : (
                                   <div className="flex items-center justify-center h-full opacity-60">
                                     <p className="text-[10px] text-text-secondary italic font-medium">No membership card uploaded yet.</p>
                                   </div>
                                 )}
                               </div>
                             </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ QUESTIONS ════════ */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              {/* View Toggle & Actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  <button onClick={() => setQView("live")} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${qView === "live" ? "bg-primary text-white shadow" : "bg-white border border-border text-text-secondary hover:bg-gray-50"}`}>
                    Live Questions ({allQuestions.length})
                  </button>
                  <button onClick={() => setQView("pending")} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${qView === "pending" ? "bg-amber-500 text-white shadow" : "bg-white border border-border text-text-secondary hover:bg-gray-50"}`}>
                    Pending Approval ({pendingQuestions.length})
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddQuestion(!showAddQuestion)} className="btn-secondary text-sm flex items-center gap-1.5">
                    <Plus size={14} /> Add Question
                  </button>
                  <button onClick={generateDailyQuestions} disabled={generating} className="btn-primary text-sm flex items-center gap-2">
                    {generating ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
                    {generating ? "Generating..." : "Generate via AI"}
                  </button>
                </div>
              </div>

              {/* Manual Add Form */}
              {showAddQuestion && (
                <form onSubmit={createManualQuestion} className="card border-2 border-primary/20 space-y-4 animate-fade-in">
                  <h3 className="font-bold text-base flex items-center gap-2"><Plus size={16} className="text-primary" /> Add New Question</h3>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700/30 p-3 sm:p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer w-fit">
                      <input type="checkbox" checked={newQuestion.isHighIQ} onChange={e => setNewQuestion({...newQuestion, isHighIQ: e.target.checked})} className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 bg-white" />
                      <span className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2">
                        🧠 Mark as High IQ Question (Global)
                      </span>
                    </label>
                  </div>

                  {!newQuestion.isHighIQ && (
                    <div className="grid grid-cols-2 gap-3">
                      <select value={newQuestion.category} onChange={e => setNewQuestion({...newQuestion, category: e.target.value})} className="input-field">
                        <option value="coding">Coding</option>
                        <option value="numerical">Numerical</option>
                        <option value="verbal">Verbal</option>
                      </select>
                      <select value={newQuestion.targetBranch} onChange={e => setNewQuestion({...newQuestion, targetBranch: e.target.value})} className="input-field">
                        {["General", "CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} className="input-field">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <textarea placeholder="Question text..." value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="input-field !py-3" rows={2} required />
                  <div className="grid grid-cols-2 gap-2">
                    {newQuestion.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => setNewQuestion({...newQuestion, correctIndex: i})} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border-2 transition ${i === newQuestion.correctIndex ? "bg-success text-white border-success" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion({...newQuestion, options: opts}); }} className="input-field text-sm !py-2" required />
                      </div>
                    ))}
                  </div>
                  <input placeholder="Explanation (optional)" value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} className="input-field text-sm" />
                  <p className="text-xs text-text-secondary">Click the letter badge (A/B/C/D) to mark the correct answer.</p>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddQuestion(false)} className="btn-secondary text-sm">Cancel</button>
                    <button type="submit" className="btn-primary text-sm">Add Question</button>
                  </div>
                </form>
              )}

              {/* Category Filter (for live view) */}
              {qView === "live" && (
                <div className="flex gap-2 flex-wrap">
                  {["all", "coding", "numerical", "verbal"].map(c => (
                    <button key={c} onClick={() => setQFilter(c)} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${qFilter === c ? "bg-primary text-white shadow-sm" : "bg-white border border-border text-text-secondary hover:bg-gray-50"}`}>
                      {c === "all" ? "All Categories" : c}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Questions List */}
              {qView === "live" && (
                allQuestions.length === 0 ? (
                  <div className="card text-center py-12 text-text-secondary">
                    <Brain className="mx-auto mb-3 text-primary/40" size={40} />
                    <p className="font-medium">No questions found for this filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allQuestions.map(q => (
                      <div key={q._id} className="card animate-fade-in">
                        {editingQuestion?._id === q._id ? (
                          /* ── Inline Edit Mode ── */
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <select value={editQForm.category} onChange={e => setEditQForm({...editQForm, category: e.target.value})} className="input-field text-sm">
                                <option value="coding">Coding</option>
                                <option value="numerical">Numerical</option>
                                <option value="verbal">Verbal</option>
                              </select>
                              <select value={editQForm.difficulty} onChange={e => setEditQForm({...editQForm, difficulty: e.target.value})} className="input-field text-sm">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <select value={editQForm.isHighIQ ? "true" : "false"} onChange={e => setEditQForm({...editQForm, isHighIQ: e.target.value === "true"})} className="input-field">
                                <option value="false">Branch Specific</option>
                                <option value="true">High IQ General</option>
                              </select>
                              {!editQForm.isHighIQ && (
                                <select value={editQForm.targetBranch} onChange={e => setEditQForm({...editQForm, targetBranch: e.target.value})} className="input-field">
                                  {["General", "CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map(b => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                            <textarea value={editQForm.text} onChange={e => setEditQForm({...editQForm, text: e.target.value})} className="input-field text-sm !py-2" rows={2} />
                            <div className="grid grid-cols-2 gap-2">
                              {editQForm.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <button type="button" onClick={() => setEditQForm({...editQForm, correctIndex: i})} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 border-2 transition ${i === editQForm.correctIndex ? "bg-success text-white border-success" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                                    {String.fromCharCode(65 + i)}
                                  </button>
                                  <input value={opt} onChange={e => { const opts = [...editQForm.options]; opts[i] = e.target.value; setEditQForm({...editQForm, options: opts}); }} className="input-field text-sm !py-1.5" />
                                </div>
                              ))}
                            </div>
                            <input placeholder="Explanation" value={editQForm.explanation} onChange={e => setEditQForm({...editQForm, explanation: e.target.value})} className="input-field text-sm" />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingQuestion(null)} className="btn-secondary text-xs !py-1.5">Cancel</button>
                              <button onClick={saveEditQuestion} className="btn-primary text-xs !py-1.5 flex items-center gap-1"><Save size={12} /> Save</button>
                            </div>
                          </div>
                        ) : (
                          /* ── View Mode ── */
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`badge text-xs ${q.aiGenerated ? "bg-cyan-50 text-cyan-700" : "badge-primary"}`}>
                                  {q.aiGenerated ? "🤖 AI" : "Manual"}
                                </span>
                                <span className="badge-primary text-xs capitalize">{q.category}</span>
                                <span className={`badge text-xs ${q.isHighIQ ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                                  {q.isHighIQ ? "🧠 High IQ" : `🏫 ${q.targetBranch || "General"}`}
                                </span>
                                <span className={`badge text-xs ${q.difficulty === "hard" ? "bg-red-50 text-red-600" : q.difficulty === "easy" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}>{q.difficulty || "medium"}</span>
                                {q.isQOTD && <span className="badge bg-amber-50 text-amber-700 text-xs">⭐ QOTD</span>}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEditQuestion(q)} className="p-1.5 hover:bg-blue-50 rounded-lg text-primary transition" title="Edit">
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={() => deleteQuestion(q._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-error transition" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="font-medium text-text-primary text-sm">{q.text}</p>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {q.options.map((opt: string, i: number) => (
                                <p key={i} className={`text-xs px-3 py-1.5 rounded-lg ${i === q.correctIndex ? "bg-green-50 text-success font-semibold border border-success/20" : "bg-gray-50 text-text-secondary"}`}>
                                  {String.fromCharCode(65 + i)}. {opt}
                                </p>
                              ))}
                            </div>
                            {q.explanation && <p className="text-xs text-text-secondary mt-2 italic">💡 {q.explanation}</p>}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Pending Approval List */}
              {qView === "pending" && (
                pendingQuestions.length === 0 ? (
                  <div className="card text-center py-12 text-text-secondary">
                    <Check className="mx-auto mb-3 text-success" size={40} />
                    <p className="font-medium">All clear! No pending questions.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingQuestions.map(q => (
                      <div key={q._id} className="card animate-fade-in border-l-4 border-l-amber-400">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`badge text-xs ${q.aiGenerated ? "badge-warning" : "badge-primary"}`}>
                              {q.aiGenerated ? "🤖 AI Generated" : "Manual"}
                            </span>
                            <span className="badge-primary text-xs">{q.category}</span>
                            <span className={`badge text-xs ${q.isHighIQ ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                              {q.isHighIQ ? "🧠 High IQ" : `🏫 ${q.targetBranch || "General"}`}
                            </span>
                            <span className="badge text-xs bg-gray-100 text-gray-600">{q.difficulty || "medium"}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => approveQuestion(q._id, true)} className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-success transition" title="Approve">
                              <Check size={16} />
                            </button>
                            <button onClick={() => approveQuestion(q._id, false)} className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-error transition" title="Reject">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="font-medium text-text-primary">{q.text}</p>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {q.options.map((opt: string, i: number) => (
                            <p key={i} className={`text-sm px-3 py-1.5 rounded-lg ${i === q.correctIndex ? "bg-green-50 text-success font-semibold border border-success/20" : "bg-gray-50 text-text-secondary"}`}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </p>
                          ))}
                        </div>
                        {q.explanation && <p className="text-xs text-text-secondary mt-2 italic">💡 {q.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* ════════ ROADMAPS ════════ */}
          {activeTab === "roadmaps" && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Global Live Roadmaps ({allRoadmaps.filter(r => r.approved).length})</h2>
              {allRoadmaps.filter(r => r.approved).length === 0 ? (
                <div className="card text-center py-12 text-text-secondary">
                  <Map className="mx-auto mb-3" size={40} />
                  <p className="font-medium">No global roadmaps yet</p>
                  <p className="text-sm mt-1">Approve user roadmaps from their profiles.</p>
                </div>
              ) : (
                allRoadmaps.filter(r => r.approved).map(rm => (
                  <div key={rm._id} className="card animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {rm.icon} {rm.skill}
                          {!rm.approved && <span className="badge-warning text-xs">⏳ Pending</span>}
                          {rm.approved && <span className="badge-success text-xs">✓ Live</span>}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">{rm.description}</p>
                        <p className="text-xs text-text-secondary mt-1">{rm.nodes?.length || 0} stages • {rm.proposedByAI ? "🤖 AI Proposed" : "Manual"}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => approveRoadmap(rm._id, false)} className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-error transition" title="Delete Global Roadmap">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════════ PLACEMENT ════════ */}
          {activeTab === "placement" && (
            <div className="space-y-6">
              {/* Sync Alert / Banner */}
              <div className="card border-l-4 border-l-primary flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    <CloudLightning className="text-primary" size={20} /> India/Global Remote Auto-Sync
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Pulls relevant software roles explicitly accessible to students in India.
                  </p>
                </div>
                <button
                  onClick={syncRealtimeJobs}
                  disabled={syncingJobs}
                  className="btn-primary whitespace-nowrap flex items-center gap-2"
                >
                  {syncingJobs ? <RefreshCw size={16} className="animate-spin" /> : <CloudLightning size={16} />}
                  {syncingJobs ? "Syncing..." : "Sync Jobs Now"}
                </button>
              </div>

              <div className="card">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-primary" /> Add KTU Placement Drive
                </h2>
                <form onSubmit={createPlacement} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input placeholder="Company Name" value={newPlacement.company} onChange={e => setNewPlacement({ ...newPlacement, company: e.target.value })} className="input-field" required />
                    <input placeholder="Job Role" value={newPlacement.role} onChange={e => setNewPlacement({ ...newPlacement, role: e.target.value })} className="input-field" required />
                    <input placeholder="Skills (React, Java, SQL...)" value={newPlacement.skills} onChange={e => setNewPlacement({ ...newPlacement, skills: e.target.value })} className="input-field" />
                    <input placeholder="CTC Range (e.g. 5-8 LPA)" value={newPlacement.ctcRange} onChange={e => setNewPlacement({ ...newPlacement, ctcRange: e.target.value })} className="input-field" />
                    <input placeholder="Application Deadline" type="date" value={newPlacement.deadline} onChange={e => setNewPlacement({ ...newPlacement, deadline: e.target.value })} className="input-field" />
                    <input placeholder="Apply Link (LinkedIn/Company URL)" value={newPlacement.applyLink} onChange={e => setNewPlacement({ ...newPlacement, applyLink: e.target.value })} className="input-field" />
                    <input placeholder="Branches (CSE, ECE, EEE...)" value={newPlacement.branches} onChange={e => setNewPlacement({ ...newPlacement, branches: e.target.value })} className="input-field" />
                    <input placeholder="Eligible Years (1, 2, 3, 4)" value={newPlacement.eligibleYears} onChange={e => setNewPlacement({ ...newPlacement, eligibleYears: e.target.value })} className="input-field" />
                    <select value={newPlacement.driveType || "Off-Campus"} onChange={e => setNewPlacement({ ...newPlacement, driveType: e.target.value })} className="input-field">
                      <option value="Off-Campus">Off-Campus Drive</option>
                      <option value="On-Campus">On-Campus Drive</option>
                      <option value="Pooled">Pooled Drive</option>
                    </select>
                    <input placeholder="Min CGPA (e.g. 7.0)" step="0.1" type="number" value={newPlacement.minCgpa || ""} onChange={e => setNewPlacement({ ...newPlacement, minCgpa: e.target.value })} className="input-field" />
                    <select value={newPlacement.backlogsAllowed || "false"} onChange={e => setNewPlacement({ ...newPlacement, backlogsAllowed: e.target.value })} className="input-field">
                      <option value="false">0 Backlogs (No Active Backlogs)</option>
                      <option value="true">Active Backlogs Allowed</option>
                    </select>
                  </div>
                  <textarea placeholder="Description (interview rounds, bond details, etc.)" value={newPlacement.description} onChange={e => setNewPlacement({ ...newPlacement, description: e.target.value })} className="input-field !h-20 resize-none" />
                  <button type="submit" className="btn-primary">Add Drive Listing</button>
                </form>
              </div>

              <div className="card">
                <h2 className="font-bold text-lg mb-4">Active Listings ({placements.length})</h2>
                {placements.length === 0 ? (
                  <p className="text-text-secondary text-center py-8">No placement listings yet</p>
                ) : (
                  <div className="space-y-3">
                    {placements.map(p => (
                      <div key={p._id} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-text-primary">{p.company}</h3>
                            <p className="text-sm text-primary font-medium">{p.role}</p>
                            {p.ctcRange && <p className="text-xs text-success font-semibold mt-1">{p.ctcRange}</p>}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {p.skills?.map((s: string, i: number) => (
                                <span key={i} className="badge bg-blue-50 text-blue-700 text-xs">{s}</span>
                              ))}
                            </div>
                            {p.applyLink && (
                              <a href={p.applyLink} target="_blank" rel="noopener" className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline">
                                <ExternalLink size={10} /> {p.applyLink.length > 50 ? p.applyLink.slice(0, 50) + "..." : p.applyLink}
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => deletePlacement(p._id, p.company)} className="p-2 hover:bg-red-50 rounded-lg text-error transition" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ NOTES MANAGEMENT ════════ */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Community Notes ({notes.length})</h2>
                  <button onClick={loadAll} className="text-text-secondary hover:text-primary transition p-1">
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map(n => (
                    <div key={n._id} className={`border rounded-xl p-4 transition-all ${editingNote?._id === n._id ? "border-primary bg-primary-50" : "border-border hover:border-primary/30"}`}>
                      {editingNote?._id === n._id ? (
                        /* Edit Note Form */
                        <div className="space-y-3 animate-fade-in">
                           <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                             <div className="flex items-center gap-2">
                               <Edit3 className="text-primary" size={16} />
                               <span className="font-bold text-sm">Edit Note Details</span>
                             </div>
                             <button onClick={() => setEditingNote(null)} className="text-text-secondary hover:text-error"><X size={16} /></button>
                           </div>
                           <input value={editNoteForm.title} onChange={e => setEditNoteForm({...editNoteForm, title: e.target.value})} className="input-field !py-2 text-sm" placeholder="Title" />
                           <input value={editNoteForm.subject} onChange={e => setEditNoteForm({...editNoteForm, subject: e.target.value})} className="input-field !py-2 text-sm" placeholder="Subject" />
                           <textarea value={editNoteForm.description} onChange={e => setEditNoteForm({...editNoteForm, description: e.target.value})} className="input-field !py-2 text-sm !h-16" placeholder="Description" />
                           
                           <div className="grid grid-cols-2 gap-2">
                             <select value={editNoteForm.branch} onChange={e => setEditNoteForm({...editNoteForm, branch: e.target.value})} className="input-field !py-2 text-sm bg-white">
                                {["General", "CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map(b => <option key={b}>{b}</option>)}
                             </select>
                             <select value={editNoteForm.year} onChange={e => setEditNoteForm({...editNoteForm, year: parseInt(e.target.value)})} className="input-field !py-2 text-sm bg-white">
                                <option value="0">All Years</option>
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                             </select>
                           </div>
                           <div className="flex items-center justify-end gap-2 pt-2">
                             <button onClick={() => setEditingNote(null)} className="btn-secondary text-xs !py-1.5">Cancel</button>
                             <button onClick={saveEditNote} className="btn-primary text-xs !py-1.5 flex items-center gap-1"><Save size={14}/> Save</button>
                           </div>
                        </div>
                      ) : (
                        /* View Note */
                        <div className="flex flex-col h-full justify-between gap-3">
                           <div>
                             <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                                   <FileText size={16} className="text-white" />
                                 </div>
                                 <h3 className="font-bold text-text-primary line-clamp-1 text-sm">{n.title}</h3>
                               </div>
                               <span className="badge-primary text-[10px] whitespace-nowrap">{n.branch}</span>
                             </div>
                             <p className="text-xs font-semibold text-primary">{n.subject} • Y{n.year === 0 ? "All" : n.year}</p>
                             <p className="text-[11px] text-text-secondary mt-1">Uploaded by: {n.uploaderName}</p>
                           </div>
                           
                           <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                             <span className="text-xs text-text-secondary flex items-center gap-1"><Eye size={12}/> {n.readerCount}</span>
                             <div className="flex gap-1 shrink-0">
                               <button onClick={() => window.open(n.fileUrl, "_blank")} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary transition" title="Open PDF">
                                 <Download size={14} />
                               </button>
                               <button onClick={() => startEditNote(n)} className="p-1.5 hover:bg-blue-50 rounded-lg text-primary transition" title="Edit Metadata">
                                 <Edit3 size={14} />
                               </button>
                               <button onClick={() => deleteNote(n._id, n.title)} className="p-1.5 hover:bg-red-50 rounded-lg text-error transition" title="Delete Note">
                                 <Trash2 size={14} />
                               </button>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ AI TOOLS ════════ */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              {/* Daily Auto-Generate */}
              <div className="card border-2 border-primary/20">
                <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Zap size={18} className="text-primary" /> Auto-Generate Daily Questions
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Generates 9 questions (3 per category) from randomized employment-relevant topics. Auto-approved and ready for students immediately.
                </p>
                <button onClick={generateDailyQuestions} disabled={generating} className="btn-primary flex items-center gap-2">
                  {generating ? <RefreshCw size={16} className="animate-spin" /> : <Bot size={16} />}
                  {generating ? "Generating 9 Questions..." : "Generate Daily Questions Now"}
                </button>
              </div>

              {/* Custom Topic */}
              <div className="card">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain size={18} className="text-primary" /> Custom Topic Questions
                </h2>
                <p className="text-sm text-text-secondary mb-3">
                  Generate 5 questions on any specific topic. These go to Pending for your review first.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input placeholder="Topic (e.g. Sorting Algorithms, SQL Joins)" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="input-field flex-1" />
                    {!aiIsHighIQ && (
                      <select value={aiCategory} onChange={e => setAiCategory(e.target.value as any)} className="input-field !w-auto">
                        <option value="coding">💻 Coding</option>
                        <option value="numerical">🔢 Numerical</option>
                        <option value="verbal">📝 Verbal</option>
                      </select>
                    )}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-3 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <input type="checkbox" checked={aiIsHighIQ} onChange={e => setAiIsHighIQ(e.target.checked)} className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 bg-white" />
                      <span className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-1 text-sm">
                        🧠 Generate as High IQ Questions (Global)
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!aiIsHighIQ && (
                      <select value={aiTargetBranch} onChange={e => setAiTargetBranch(e.target.value)} className="input-field">
                        {["General", "CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map(b => (
                          <option key={b} value={b}>{b === "General" ? "General (All Branches)" : b}</option>
                        ))}
                      </select>
                    )}
                    <button onClick={generateAIQuestions} disabled={generating || !aiTopic} className="btn-primary whitespace-nowrap ml-auto">
                      {generating ? "Generating..." : "Generate 5 Questions"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Roadmap Generator */}
              <div className="card">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Map size={18} className="text-primary" /> AI Roadmap Generator
                </h2>
                <p className="text-sm text-text-secondary mb-3">
                  AI creates a full learning roadmap (8-12 stages with quizzes). Goes to Roadmaps tab for your review.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input placeholder="Skill (Java, Python, VLSI, Embedded Systems, Web Dev...)" value={aiSkill} onChange={e => setAiSkill(e.target.value)} className="input-field flex-1" />
                  <button onClick={generateAIRoadmap} disabled={generating || !aiSkill} className="btn-primary whitespace-nowrap">
                    {generating ? "Generating..." : "Generate Roadmap"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════ FEEDBACK ════════ */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <MessageSquareText size={18} className="text-primary" /> User Feedback ({feedbacks.length})
                  </h2>
                  <button onClick={loadFeedbacks} className="text-text-secondary hover:text-primary transition p-1">
                    <RefreshCw size={16} />
                  </button>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquareText className="mx-auto text-text-secondary mb-3" size={40} />
                    <h3 className="text-base font-semibold text-text-primary">No feedback yet</h3>
                    <p className="text-sm text-text-secondary mt-1">User feedback will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                    {feedbacks.map((fb: any) => (
                      <div key={fb._id} className="border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                              {fb.userName?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm text-text-primary">{fb.userName}</span>
                          </div>
                          <span className="text-xs text-text-secondary">
                            {new Date(fb.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{fb.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ════════ SYSTEM SETTINGS MODAL ════════ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="card w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Settings className="text-primary" /> System Settings
                </h2>
                <p className="text-sm text-text-secondary mt-1">Configure global platform behavior</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
                <div className="mb-5">
                  <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                    <ShieldAlert className="text-error" size={20} /> Global Profanity Blocker
                  </h3>
                  <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                    Instantly block specific words across the entire network. Messages containing these words will trigger a strict warning and auto-erase the word.
                  </p>
                </div>

                <form onSubmit={handleAddWord} className="flex gap-2 mb-6">
                   <input 
                     placeholder="Type a word to block..." 
                     value={newWord} 
                     onChange={e => setNewWord(e.target.value)} 
                     className="input-field flex-1 !py-2.5 !bg-white focus:!bg-white" 
                     maxLength={30}
                     disabled={savingWords}
                   />
                   <button type="submit" disabled={!newWord.trim() || savingWords} className="btn-primary !bg-error hover:!bg-red-600 !px-5 transition-all shadow-sm">
                     Add to Blocklist
                   </button>
                </form>

                <div>
                   <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Active Filters ({blockedWords.length})</h4>
                   {blockedWords.length === 0 ? (
                     <div className="text-center py-6 rounded-xl border border-dashed border-red-200 bg-white/50">
                       <p className="text-sm text-text-secondary font-medium">No active filters.</p>
                     </div>
                   ) : (
                     <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                       {blockedWords.map(word => (
                         <div key={word} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-100 text-error font-semibold text-sm shadow-sm group hover:border-red-300 transition-colors">
                           {word}
                           <button onClick={() => handleRemoveWord(word)} disabled={savingWords} className="p-0.5 opacity-50 group-hover:opacity-100 hover:bg-red-100 rounded text-red-600 transition-all">
                             <X size={14} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowSettingsModal(false)} className="btn-secondary !px-6">Close Panel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
