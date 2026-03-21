"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import toast from "react-hot-toast";
import {
  MessageSquare,
  ThumbsUp,
  Send,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
  Loader2,
} from "lucide-react";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";

import { useRef } from "react";

interface Reply {
  body: string;
  authorName: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  body: string;
  author: string;
  authorName: string;
  replies: Reply[];
  upvotes: string[];
  tags: string[];
  createdAt: string;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", tags: "" });
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // Global Chat State
  const [activeTab, setActiveTab] = useState<"forums" | "global">("forums");
  const [chats, setChats] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "global") {
      fetchChats();
      interval = setInterval(fetchChats, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chat/global");
      if (res.ok) setChats(await res.json());
    } catch {}
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      setPosts(data);
    } catch {
      toast.error("Failed to load posts");
    }
    setLoading(false);
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Post created! 🎉");
      setShowModal(false);
      setNewPost({ title: "", body: "", tags: "" });
      fetchPosts();
    } catch {
      toast.error("Failed to create post");
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      await fetch(`/api/community/${postId}`, { method: "PATCH" });
      fetchPosts();
    } catch {}
  };

  const handleReply = async (postId: string) => {
    const text = replyText[postId];
    if (!text?.trim()) return;
    try {
      await fetch(`/api/community/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      setReplyText({ ...replyText, [postId]: "" });
      fetchPosts();
      toast.success("Reply posted!");
    } catch {}
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/community/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      fetchPosts();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedPosts);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedPosts(next);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const textToSend = chatInput.trim();
    setChatInput(""); // optimistic clear

    try {
      const res = await fetch("/api/chat/global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend })
      });
      
      if (!res.ok) {
        if (res.status === 406) {
          const data = await res.json();
          toast.error("Message blocked! Contains inappropriate language.", { icon: "🚨" });
          
          // Scrub blocked words automatically from the input field
          let scrubbedText = textToSend;
          data.blockedWords?.forEach((bw: string) => {
            scrubbedText = scrubbedText.replace(new RegExp(bw, 'gi'), '');
          });
          setChatInput(scrubbedText.replace(/\s+/g, ' ').trim());
          return;
        }
        throw new Error();
      }
      fetchChats();
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast.error("Failed to send message");
      setChatInput(textToSend); // restore on hard fail
    }
  };

  const timeAgo = (date: string) => {
    const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (d < 60) return "just now";
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
                <MessageSquare className="text-primary" /> Community Hub
              </h1>
              <p className="text-text-secondary mt-1">Connect with your peers globally</p>
            </div>
            {activeTab === "forums" && (
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 shrink-0">
                <Plus size={18} /> New Post
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-6 border-b border-border pb-3">
             <button onClick={() => setActiveTab("forums")} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === "forums" ? "bg-gradient-to-r from-primary to-secondary text-white" : "bg-white text-text-secondary hover:bg-gray-50 border border-border"}`}>
               Discussion Forums
             </button>
             <button onClick={() => setActiveTab("global")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === "global" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" : "bg-white text-text-secondary hover:bg-gray-50 border border-border"}`}>
               <Globe size={16} className={activeTab === "global" ? "text-white" : "text-primary"} /> Live Chat
             </button>
          </div>

          {activeTab === "forums" && (
            loading ? (
            <div className="flex justify-center py-20">
              <HeartbeatLoader message="LOADING POSTS..." />
            </div>
          ) : posts.length === 0 ? (
            <div className="card text-center py-16">
              <MessageSquare className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-semibold">No discussions yet</h3>
              <p className="text-text-secondary mt-1">Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="card animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-text-primary">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                        <span className="font-medium text-primary">{post.authorName}</span>
                        <span>•</span>
                        <span>{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    {(user?.role === "moderator" || user?.id === post.author) && (
                      <button onClick={() => handleDelete(post._id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-text-primary leading-relaxed">{post.body}</p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="badge-primary text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleUpvote(post._id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition ${
                        post.upvotes.includes(user?.id)
                          ? "text-primary"
                          : "text-text-secondary hover:text-primary"
                      }`}
                    >
                      <ThumbsUp size={16} /> {post.upvotes.length}
                    </button>
                    <button
                      onClick={() => toggleExpand(post._id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition"
                    >
                      <MessageSquare size={16} /> {post.replies.length} replies
                      {expandedPosts.has(post._id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {expandedPosts.has(post._id) && (
                    <div className="mt-4 space-y-3">
                      {post.replies.map((reply, i) => (
                        <div
                          key={i}
                          className="bg-surface-light rounded-xl p-3 ml-4 border-l-2 border-primary/20"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-primary">{reply.authorName}</span>
                            <span className="text-text-secondary">{timeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm mt-1">{reply.body}</p>
                        </div>
                      ))}

                      <div className="flex gap-2 ml-4 mt-3">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyText[post._id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [post._id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleReply(post._id)}
                          className="input-field text-sm !py-2"
                        />
                        <button
                          onClick={() => handleReply(post._id)}
                          className="btn-primary !px-3 !py-2"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )
          )}

          {activeTab === "global" && (
            <div className="card flex flex-col h-[650px] !p-0 overflow-hidden relative border-t-4 border-t-indigo-500 shadow-xl">
              <div className="bg-gray-50 border-b border-border p-4 shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-text-primary flex items-center gap-2 text-lg"><Globe size={20} className="text-indigo-500"/> Global Community Chat</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Real-time public discussion room</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                  </span>
                  <span className="text-xs font-semibold text-success uppercase tracking-wider">Live</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundColor: '#fafafa' }}>
                {chats.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                    <Globe size={48} className="mb-2" />
                    <p className="font-medium">Be the first to say hello!</p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const isMe = chat.senderId === user?.id;
                    return (
                      <div key={chat._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                           <span className={`text-[11px] font-bold ${isMe ? "text-indigo-600" : "text-text-secondary"}`}>{isMe ? "You" : chat.senderName}</span>
                           <span className="text-[9px] text-text-secondary opacity-70">{new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${isMe ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm" : "bg-white text-text-primary border border-border rounded-tl-sm"}`}>
                           {chat.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} className="h-4" />
              </div>
              
              <form onSubmit={handleSendChat} className="p-3 border-t border-border bg-white flex gap-2 shrink-0">
                 <input 
                   type="text" 
                   value={chatInput} 
                   onChange={(e) => setChatInput(e.target.value)} 
                   placeholder="Type a message..." 
                   className="input-field flex-1 !bg-gray-50 focus:!bg-white border-gray-200" 
                   maxLength={1000}
                 />
                 <button type="submit" disabled={!chatInput.trim()} className="btn-primary !px-5 !py-3 shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                   <Send size={18} />
                 </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="card w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New Discussion</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createPost} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="input-field"
                required
              />
              <textarea
                placeholder="What's on your mind?"
                value={newPost.body}
                onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                className="input-field !h-32 resize-none"
                required
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="input-field"
              />
              <button type="submit" className="btn-primary w-full">Post Discussion</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
