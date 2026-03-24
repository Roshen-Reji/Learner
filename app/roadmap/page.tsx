"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import toast from "react-hot-toast";
import { Map, CheckCircle, ChevronRight, ArrowLeft, BookOpen, Star, Sparkles, Navigation, Layers, Check, MoveRight, Lock } from "lucide-react";

interface RoadmapNode {
  title: string;
  description: string;
  resources: string[];
  questions: { text: string; options: string[]; correctIndex: number }[];
  order: number;
}

interface Roadmap {
  _id: string;
  skill: string;
  icon: string;
  description: string;
  nodes: RoadmapNode[];
  approved?: boolean;
}

interface Progress {
  completedNodes: number[];
}
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";

export default function RoadmapPage() {
  const { data: session } = useSession();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [generating, setGenerating] = useState(false);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const nodeVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch("/api/roadmap");
      const data = await res.json();
      setRoadmaps(data);
    } catch {}
    setLoading(false);
  };

  const getImageUrl = (skill: string) => {
    const cleanSkill = encodeURIComponent(skill.trim().toLowerCase());
    return `https://loremflickr.com/600/800/${cleanSkill},technology/all`;
  };

  const openRoadmap = async (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    try {
      const res = await fetch(`/api/roadmap/${roadmap._id}`);
      const data = await res.json();
      setProgress(data.progress);
    } catch {}
  };

  const generateCustomRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkill.trim()) return;
    setGenerating(true);
    const loadingToast = toast.loading("AI is curating your roadmap... This takes about 10 seconds.");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiPropose: true, skill: customSkill }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.dismiss(loadingToast);
      toast.success(`Awesome! Ready to learn ${data.skill} 🎉`);
      setCustomSkill("");
      await fetchRoadmaps();
      
      const newRoadmaps = await fetch("/api/roadmap").then(r => r.json());
      setRoadmaps(newRoadmaps);
      
      const newRm = newRoadmaps.find((r: any) => r._id === data._id) || data;
      openRoadmap(newRm);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to generate roadmap");
    }
    setGenerating(false);
  };

  const completeNode = async (nodeIndex: number) => {
    if (!selectedRoadmap) return;
    try {
      const res = await fetch(`/api/roadmap/${selectedRoadmap._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completeNode: nodeIndex }),
      });
      const data = await res.json();
      setProgress(data);
      toast.success("Node completed! +25 points 🎯");
    } catch {}
  };

  const handleQuizAnswer = (nodeIndex: number, answerIndex: number) => {
    const node = selectedRoadmap?.nodes[nodeIndex];
    if (!node?.questions.length) return;
    setQuizAnswer(answerIndex);
    const correct = node.questions[0].correctIndex === answerIndex;
    setQuizResult(correct);
    if (correct) {
      completeNode(nodeIndex);
    }
  };

  const isNodeCompleted = (index: number) => progress?.completedNodes?.includes(index) || false;

  const progressPercent = selectedRoadmap
    ? Math.round(((progress?.completedNodes?.length || 0) / selectedRoadmap.nodes.length) * 100)
    : 0;

  // ------------------------------------------
  // CAROUSEL VIEW
  // ------------------------------------------
  if (!selectedRoadmap) {
    return (
      <div className="min-h-screen bg-surface-light relative">
        <Sidebar />
        <main className="lg:ml-72 pt-20 lg:pt-8 pb-32 lg:pb-8 min-h-screen flex flex-col">
          <div className="px-4 sm:px-8 shrink-0">
            <h1 className="text-3xl sm:text-4xl font-black text-text-primary flex items-center gap-3 drop-shadow-sm tracking-tight">
              <Map className="text-primary" size={32} /> Master Your Craft
            </h1>
            <p className="text-text-secondary mt-1 font-medium text-sm sm:text-base">Swipe to explore curated roadmaps</p>
          </div>

          <div className="w-full mt-6 md:mt-8 flex flex-col items-center">
            
            {/* Custom Roadmap Quick Input */}
            <form onSubmit={generateCustomRoadmap} className="w-full px-4 sm:px-8 mb-4 shrink-0 max-w-4xl">
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-full p-2 shadow-lg flex items-center gap-2">
                <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0 ml-1">
                  <Sparkles size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Need something else? Type any skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-sm sm:text-base text-text-primary placeholder:text-text-secondary px-2 min-w-0"
                  required
                />
                <button 
                  type="submit" 
                  disabled={generating} 
                  className={`bg-primary hover:bg-primary-hover text-white px-5 sm:px-6 py-3 rounded-full font-bold transition-all shadow-md shrink-0 whitespace-nowrap flex items-center gap-2 ${generating ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {generating ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>Generate <span className="hidden sm:inline">AI Roadmap</span></>
                  )}
                </button>
              </div>
            </form>

            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 h-[400px]">
                <HeartbeatLoader message="CURATING ROADMAPS" />
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full max-w-sm text-center mt-20 px-4">
                <Map className="text-text-secondary/50 mb-4" size={56} />
                <h3 className="text-xl font-bold text-text-primary">No Roadmaps Found</h3>
                <p className="text-text-secondary mt-2 text-sm">Generate your first AI roadmap above!</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="show" 
                className="w-full overflow-x-auto snap-x snap-mandatory flex gap-4 sm:gap-5 px-4 sm:px-8 pb-8 pt-2 custom-scrollbar items-center"
              >
                {/* 
                  w-[85vw] on mobile gives a 15vw peek of the next card, 
                  satisfying the "swipe preview" requirement perfectly.
                */}
                {roadmaps.map((rm) => (
                  <motion.button
                    variants={cardVariants}
                    key={rm._id}
                    onClick={() => openRoadmap(rm)}
                    className="group relative w-[85vw] sm:w-[360px] lg:w-[400px] h-[60vh] sm:h-[65vh] min-h-[400px] max-h-[550px] shrink-0 snap-center rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,120,255,0.4)] transition-all duration-500 scale-[0.98] hover:scale-100 text-left border border-white/40 dark:border-white/5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
                  >
                    {/* Background Image dynamically fetched based on skill name */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 dark:from-indigo-500/10 dark:to-purple-600/10 z-0" />
                    <img 
                      src={getImageUrl(rm.skill)} 
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0 text-transparent"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-90 z-10" />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500 z-10" />
                    
                    {/* Private Badge */}
                    {rm.approved === false && (
                       <div className="absolute top-5 left-5 bg-black/50 backdrop-blur-md text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg z-20">
                         <Lock size={12} /> Private
                       </div>
                    )}

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:translate-y-[-8px] z-20">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <span className="text-3xl filter drop-shadow-md bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border border-white/30">{rm.icon || "📚"}</span>
                        <div className="flex items-center gap-2 text-white/80 text-sm font-semibold tracking-wide uppercase bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                          <Layers size={14} className="text-blue-400" />
                          <span>{rm.nodes.length} Stages</span>
                        </div>
                      </div>
                      
                      <h3 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-2 mt-2 leading-tight">
                        {rm.skill}
                      </h3>
                      
                      <p className="text-white/70 text-xs sm:text-sm line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
                        {rm.description}
                      </p>

                      <div className="mt-4 sm:mt-6 flex items-center text-blue-300 font-bold gap-2 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                        Start Journey <MoveRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.button>
                ))}
                
                {/* Spacer block so the last item can center correctly depending on margin */}
                <div className="w-[10vw] sm:w-[calc(50vw-200px)] shrink-0 h-10" />
              </motion.div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ------------------------------------------
  // DETAIL VIEW (Glassy Fun Node Timeline)
  // ------------------------------------------
  return (
    <div className="min-h-screen relative bg-black">
      {/* Dynamic Blurred Background representing the Roadmap */}
      <div className="fixed inset-0 z-0">
        <img 
          src={getImageUrl(selectedRoadmap.skill)} 
          alt="Background" 
          className="w-full h-full object-cover blur-[80px] opacity-40 dark:opacity-30 scale-125 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] pointer-events-none" />
      </div>

      <Sidebar />
      <main className="relative z-10 lg:ml-72 pt-16 sm:pt-20 lg:pt-8 pb-32 sm:pb-12 min-h-screen">
        <div className="max-w-3xl mx-auto px-3 sm:px-8 pb-12 relative z-10">
          
          <button
            onClick={() => { setSelectedRoadmap(null); setActiveNode(null); }}
            className="flex items-center gap-2 bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/60 dark:border-white/10 text-text-primary px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm mb-6 sm:mb-8 font-semibold text-xs sm:text-sm group w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Roadmaps
          </button>

          {/* Header Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 dark:border-white/10 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/10 flex items-center justify-center shadow-inner border border-white/60 dark:border-white/5 shrink-0">
                  {selectedRoadmap.icon}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary flex items-center gap-3 tracking-tight leading-tight">
                    {selectedRoadmap.skill}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                    {selectedRoadmap.approved === false && (
                      <span className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500 text-white uppercase font-black tracking-widest shadow-md">
                        Private
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5"><Layers size={14}/> {selectedRoadmap.nodes.length} Stages</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-text-secondary font-medium leading-relaxed max-w-2xl text-xs sm:text-sm">
              {selectedRoadmap.description}
            </p>

            {/* Premium Progress Bar */}
            <div className="mt-8 bg-white/50 dark:bg-black/30 p-4 rounded-2xl border border-white/40 dark:border-white/5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Completion Flow</span>
                <span className="text-2xl font-black text-primary drop-shadow-sm">{progressPercent}%</span>
              </div>
              <div className="h-4 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden shadow-inner p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full relative transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
                  style={{ width: `${Math.max(progressPercent, 2)}%` }} 
                >
                  <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse blur-[2px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Glassy Timeline */}
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="space-y-4 sm:space-y-6 relative before:absolute before:inset-y-0 before:left-6 sm:before:left-10 before:w-1 before:bg-gradient-to-b before:from-primary/30 before:via-secondary/30 before:to-transparent before:rounded-full before:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            {selectedRoadmap.nodes
              .sort((a, b) => a.order - b.order)
              .map((node, i) => {
                const completed = isNodeCompleted(i);
                const isActive = activeNode === i;
                
                return (
                  <motion.div variants={nodeVariants} key={i} className="relative z-10 pl-14 sm:pl-24">
                    {/* Node Dot / Checked Circle floating directly over the vertical bar */}
                    <div 
                      className={`absolute left-2.5 sm:left-6 top-5 sm:top-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-xl transition-all duration-500 z-20 ${
                        completed 
                          ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110" 
                          : isActive
                            ? "bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-[1.15] sm:scale-125 ring-4 ring-primary/20"
                            : "bg-white dark:bg-slate-800 text-text-secondary border-2 border-border dark:border-white/10"
                      }`}
                    >
                      {completed ? <Check size={18} className="drop-shadow-sm" /> : <span>{i + 1}</span>}
                    </div>

                    <div 
                      className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl sm:rounded-[2rem] transition-all duration-500 overflow-hidden shadow-lg hover:shadow-xl ${
                        isActive ? "ring-2 ring-primary/30 dark:ring-primary/50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]" : "hover:-translate-y-1"
                      }`}
                    >
                      <button
                        onClick={() => { setActiveNode(isActive ? null : i); setQuizAnswer(null); setQuizResult(null); }}
                        className="w-full text-left p-4 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-4 outline-none"
                      >
                        <div className="flex-1 pr-2">
                          <h3 className={`font-bold text-base sm:text-xl transition-colors leading-tight ${completed ? "text-emerald-600 dark:text-emerald-400" : isActive ? "text-primary dark:text-blue-400" : "text-text-primary"}`}>
                            {node.title}
                          </h3>
                          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 transition-all ${isActive ? "text-text-primary font-medium" : "text-text-secondary line-clamp-2"}`}>
                            {node.description}
                          </p>
                        </div>
                        
                        <div className={`p-2 rounded-full shrink-0 transition-all ${isActive ? "bg-primary text-white rotate-90 shadow-md" : "bg-white/50 dark:bg-white/5 text-text-secondary hover:bg-white dark:hover:bg-white/20"}`}>
                           <ChevronRight size={18} />
                        </div>
                      </button>

                      <div 
                        className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isActive ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className={`px-5 sm:px-6 pb-6 pt-2 border-t border-white/40 dark:border-white/5 transform transition-transform duration-500 delay-100 ${isActive ? "translate-y-0" : "-translate-y-4"}`}>
                          
                          {node.resources.length > 0 && (
                            <div className="mb-6 bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/40 dark:border-white/5">
                              <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-3 flex items-center gap-2">
                                <Navigation size={14} className="text-primary"/> Recommended Path
                              </h4>
                              <ul className="flex flex-col gap-2">
                                {node.resources.map((r, ri) => (
                                  <li key={ri}>
                                    {r.startsWith("http") ? (
                                      <a href={r} target="_blank" rel="noopener" className="text-sm font-semibold text-primary hover:text-blue-400 underline decoration-blue-500/30 underline-offset-4 decoration-2 transition-colors block truncate w-full">
                                        {r}
                                      </a>
                                    ) : (
                                      <span className="text-sm font-medium text-text-primary flex items-center gap-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-secondary">
                                        {r}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {node.questions.length > 0 && !completed && (
                            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 p-5 rounded-2xl border border-primary/20 dark:border-primary/30 relative overflow-hidden shadow-inner">
                              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                              <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3">Knowledge Check</h4>
                              <p className="text-sm font-bold text-text-primary mb-4 leading-relaxed">{node.questions[0].text}</p>
                              
                              <div className="space-y-2.5 relative z-10">
                                {node.questions[0].options.map((opt, oi) => {
                                  let cls = "w-full text-left p-4 text-sm font-medium rounded-xl transition-all border outline-none ";
                                  
                                  if (quizResult !== null) {
                                    if (oi === node.questions[0].correctIndex) {
                                       cls += "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                                    } else if (oi === quizAnswer) {
                                       cls += "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500";
                                    } else {
                                       cls += "bg-white/40 dark:bg-white/5 border-transparent text-text-secondary opacity-50";
                                    }
                                  } else {
                                    cls += "bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 hover:border-primary/30 border-white/50 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5";
                                  }

                                  return (
                                    <button
                                      key={oi}
                                      onClick={() => handleQuizAnswer(i, oi)}
                                      disabled={quizResult !== null}
                                      className={cls}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {completed && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 py-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 shadow-sm mt-2">
                              <Sparkles size={16} /> Stage Cleared Successfully
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>

        </div>
      </main>
    </div>
  );
}
