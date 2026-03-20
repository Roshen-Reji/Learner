"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import toast from "react-hot-toast";
import { FileText, Upload, Eye, Download, Search, X } from "lucide-react";
import { useUploadThing } from "@/utils/uploadthing";

interface Note {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploaderName: string;
  subject: string;
  branch: string;
  year: number;
  readerCount: number;
  createdAt: string;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    branch: "General",
    year: "0",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { startUpload } = useUploadThing("notesUploader");

  useEffect(() => {
    fetchNotes();
  }, [branchFilter]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (branchFilter !== "all") params.set("branch", branchFilter);
      if (search) params.set("subject", search);
      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();
      setNotes(data);
    } catch {
      toast.error("Failed to load notes");
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    setUploading(true);
    try {
      // 1. Upload direct to AWS via UploadThing
      const uploadRes = await startUpload([file]);
      if (!uploadRes || !uploadRes[0]) throw new Error("AWS Upload failed");
      
      const fileUrl = uploadRes[0].url;
      const fileKey = uploadRes[0].key;

      // 2. Save metadata to DB
      const res = await fetch("/api/notes", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...uploadForm, fileUrl, fileKey }) 
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Notes uploaded! +20 points 🎉");
      setShowUpload(false);
      setFile(null);
      setUploadForm({ title: "", description: "", subject: "", branch: "General", year: "0" });
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
  };

  const handleRead = async (note: Note) => {
    try {
      await fetch(`/api/notes/${note._id}`, { method: "PATCH" });
    } catch {}
    
    window.open(note.fileUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
                <FileText className="text-primary" /> Notes Hub
              </h1>
              <p className="text-text-secondary mt-1">Share knowledge, earn points</p>
            </div>
            <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
              <Upload size={18} /> Upload Notes
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchNotes()}
                className="input-field !pl-10"
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field !w-auto"
            >
              <option value="all">All Branches</option>
              {["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS", "General"].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="card text-center py-16">
              <FileText className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-semibold">No notes yet</h3>
              <p className="text-text-secondary mt-1">Be the first to share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <div key={note._id} className="card animate-fade-in group hover:scale-[1.02] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                      <FileText size={22} className="text-white" />
                    </div>
                    <span className="badge-primary">{note.branch}</span>
                  </div>
                  <h3 className="font-semibold text-text-primary line-clamp-2">{note.title}</h3>
                  <p className="text-sm text-text-secondary mt-1">{note.subject}</p>
                  <p className="text-xs text-text-secondary mt-1">by {note.uploaderName}</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Eye size={14} /> {note.readerCount} readers
                    </div>
                    <button onClick={() => handleRead(note)} className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                      <Download size={14} /> Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="card w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upload Notes</h2>
              <button onClick={() => setShowUpload(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={uploadForm.subject}
                onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                className="input-field"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="input-field !h-20 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={uploadForm.branch}
                  onChange={(e) => setUploadForm({ ...uploadForm, branch: e.target.value })}
                  className="input-field"
                >
                  {["General", "CSE", "ECE", "EEE", "ME", "CE", "IT", "AI&DS"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <select
                  value={uploadForm.year}
                  onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                  className="input-field"
                >
                  <option value="0">All Years</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-text-secondary mb-2" size={32} />
                  <p className="text-sm text-text-secondary">
                    {file ? file.name : "Click to select PDF, DOC, or image"}
                  </p>
                </label>
              </div>
              <button type="submit" disabled={uploading} className="btn-primary w-full">
                {uploading ? "Uploading..." : "Upload & Earn Points"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
