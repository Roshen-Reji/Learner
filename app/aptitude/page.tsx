"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";
import toast from "react-hot-toast";
import {
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Zap,
  Trophy,
  RefreshCw,
  Sparkles,
  Layers,
  Bot
} from "lucide-react";

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
  category: string;
  aiGenerated?: boolean;
  attempted?: boolean;
  isCorrect?: boolean;
}

type Tab = "coding" | "numerical" | "verbal";
type Mode = "qotd" | "sprint" | "browse";

export default function AptitudePage() {
  const { data: session, update } = useSession();

  // App State
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("coding");
  const [mode, setMode] = useState<Mode>("qotd");
  const [isHighIQ, setIsHighIQ] = useState(false);

  // Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);

  // Interactive State
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    correctIndex: number;
    explanation: string;
    alreadyAttempted?: boolean;
  } | null>(null);
  const [answeredSet, setAnsweredSet] = useState<Set<string>>(new Set());

  // Timer
  const [sprintTimer, setSprintTimer] = useState(300);
  const [sprintActive, setSprintActive] = useState(false);
  const [sprintState, setSprintState] = useState<"idle" | "ready" | "active" | "locked">("idle");
  const [nextSprintDate, setNextSprintDate] = useState<string | null>(null);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
    }
  };

  // Eliminate Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchQuestions();
    }
  }, [tab, mode, isHighIQ, isMounted]);

  useEffect(() => {
    if (!sprintActive || sprintTimer <= 0) return;
    const timer = setInterval(() => setSprintTimer((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [sprintActive, sprintTimer]);

  useEffect(() => {
    if (sprintTimer === 0 && sprintActive) {
      setSprintActive(false);
      toast.error("Time's up! ⏰");
    }
  }, [sprintTimer, sprintActive]);

  const fetchQuestions = async (action?: string) => {
    setLoading(true);
    setCurrentQ(0);
    setSelected(null);
    setResult(null);
    setScore(0);

    try {
      const res = await fetch(`/api/aptitude?category=${tab}&mode=${mode}&highIq=${isHighIQ}${action ? `&action=${action}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (mode === "sprint") {
        setLoading(false);
        if (data.status === "locked") {
          setSprintState("locked");
          setNextSprintDate(data.nextAvailable);
          setQuestions([]);
          setSprintActive(false);
          return;
        } else if (data.status === "ready") {
          setSprintState("ready");
          setQuestions([]);
          setSprintActive(false);
          return;
        } else if (data.status === "active") {
          setSprintState("active");
          setQuestions(data.questions);
          setSprintTimer(data.remainingSeconds);
          setSprintActive(true);
          
          const preAttempted = new Set<string>();
          let preScore = 0;
          data.questions.forEach((q: Question) => {
            if (q.attempted) preAttempted.add(q._id);
            if (q.isCorrect) preScore += 1;
          });
          setAnsweredSet(preAttempted);
          setScore(preScore);
          return;
        }
      }

      setQuestions(data);
      const preAttempted = new Set<string>();
      let preScore = 0;

      data.forEach((q: Question) => {
        if (q.attempted) preAttempted.add(q._id);
        if (q.isCorrect) preScore += 1;
      });

      setAnsweredSet(preAttempted);
      setScore(preScore);

    } catch {
      toast.error("Error retrieving puzzles");
    } finally {
      if (mode !== "sprint") setLoading(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (result !== null) return;
    const qId = questions[currentQ]._id;
    if (answeredSet.has(qId)) return;

    setSelected(index);
    try {
      const res = await fetch("/api/aptitude/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId, selectedIndex: index, mode }),
      });
      const data = await res.json();
      setResult(data);
      setAnsweredSet(prev => new Set(prev).add(qId));

      if (data.alreadyAttempted) {
        toast("Already answered previously.", { icon: "ℹ️" });
      } else if (data.correct) {
        setScore(s => s + 1);
        toast.success("Correct! 🎉 +10 pts");
        if (session) {
          await update({ points: ((session.user as any)?.points || 0) + 10 });
        }
      } else {
        toast.error("Incorrect!");
      }
    } catch {
      toast.error("Connection failed");
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setResult(null);
    } else {
      setSprintActive(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-black transition-colors duration-700 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px] pointer-events-none" />

      <Sidebar />
      <main className="relative z-10 lg:ml-72 pt-20 lg:pt-8 pb-32 lg:pb-8 min-h-screen flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 w-full flex-1 flex flex-col">

          {/* Header & Main Toggles */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-text-primary flex items-center gap-3 tracking-tight">
                <Brain className="text-primary" size={32} /> Aptitude Hub
              </h1>
              <p className="text-text-secondary mt-1 font-medium text-sm sm:text-base">
                Challenge your logic with daily assessments.
              </p>
            </div>

            <div className="flex bg-white/50 dark:bg-slate-800/50 p-1 r-xl shadow-inner border border-white/60 dark:border-white/10 w-fit rounded-xl">
              <button
                onClick={() => setIsHighIQ(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 ${!isHighIQ ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-text-secondary"}`}
              >
                <Layers size={14} /> My KTU Branch
              </button>
              <button
                onClick={() => { setIsHighIQ(true); setMode("browse"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 ${isHighIQ ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm" : "text-text-secondary"}`}
              >
                <Zap size={14} /> High IQ General
              </button>
            </div>
          </div>

          {/* Navigation Bars */}
          {!isHighIQ && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar snap-x">
            {[
              { key: "coding" as Tab, label: "Coding", e: "💻" },
              { key: "numerical" as Tab, label: "Numericals", e: "🔢" },
              { key: "verbal" as Tab, label: "Verbal", e: "📝" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`snap-start shrink-0 px-5 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all flex items-center gap-2 backdrop-blur-md border ${tab === t.key ? "bg-primary text-white border-primary shadow-[0_5px_20px_rgba(59,130,246,0.4)]" : "bg-white/60 dark:bg-slate-800/60 text-text-secondary hover:bg-white"}`}
              >
                {t.e} {t.label}
              </button>
            ))}
            </div>
          )}

          {!isHighIQ && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
            >
            {[
              { key: "qotd" as Mode, label: "Daily Challenge", icon: Zap, c: "bg-amber-400 text-white" },
              { key: "sprint" as Mode, label: "5-min Sprint", icon: Clock, c: "bg-primary/10 text-primary" },
              { key: "browse" as Mode, label: "Practice All", icon: Brain, c: "bg-emerald-500/10 text-emerald-600" },
            ].map((m) => {
              const Icon = m.icon;
              const active = mode === m.key;
              return (
                <motion.button
                  variants={itemVariants}
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`relative overflow-hidden text-left p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] transition-all backdrop-blur-xl border ${active ? "bg-white/90 dark:bg-slate-800/90 border-primary ring-2 ring-primary/30 shadow-xl" : "bg-white/50 dark:bg-slate-900/50 border-white/60 hover:-translate-y-1 hover:bg-white text-text-secondary"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${active ? "bg-gradient-to-br from-primary to-blue-600 text-white" : "bg-white/80 dark:bg-slate-800"}`}>
                      <Icon size={18} />
                    </div>
                    <p className={`font-extrabold text-sm sm:text-base ${active ? "text-primary dark:text-blue-400" : ""}`}>{m.label}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
          )}

          {/* Sprint HUD */}
          {mode === "sprint" && sprintActive && questions.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 sm:p-5 rounded-[1.5rem] flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse"><Clock size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Time Remaining</p>
                  <p className="text-2xl sm:text-3xl font-black">{Math.floor(sprintTimer / 60)}:{(sprintTimer % 60).toString().padStart(2, "0")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Score</p>
                <p className="text-2xl sm:text-3xl font-black">{score}</p>
              </div>
            </div>
          )}

          {/* Core Content */}
          <div className="flex-1 pb-10">
            {mode === "sprint" && sprintState === "locked" ? (
              <div className="bg-slate-900 flex flex-col items-center justify-center p-8 sm:p-12 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden animate-fade-in border border-slate-800 w-full max-w-2xl mx-auto mt-6">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />
                <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-500/20 transform -rotate-3 relative z-10">
                  <Clock className="text-white drop-shadow-md" size={40} />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight relative z-10">Cooldown Active</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 leading-relaxed relative z-10">
                  Sprints are intense cognitive stress tests limited to once per week. Your next sprint unlocks on:
                  <span className="block mt-4 text-xl font-bold text-rose-400 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 inline-block">
                    {nextSprintDate ? new Date(nextSprintDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </p>
              </div>
            ) : mode === "sprint" && sprintState === "ready" ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-xl w-full max-w-2xl mx-auto mt-6 animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 transform rotate-3 relative z-10">
                  <Zap className="text-white drop-shadow-md animate-pulse" size={40} />
                </div>
                <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight relative z-10">Ready for your Weekly Sprint?</h3>
                <p className="text-text-secondary font-medium leading-relaxed max-w-md mx-auto mb-8 relative z-10">
                  You are about to start a 5-minute uninterrupted logic test. 
                  <strong className="text-rose-500 dark:text-rose-400 ml-1">This consumes your strict 1-week cooldown.</strong> 
                  The timer will not pause if you refresh!
                </p>
                <button
                  onClick={() => fetchQuestions("start")}
                  className="relative z-10 bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-full font-black tracking-wide shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 flex justify-center items-center gap-2 mx-auto w-full sm:w-auto text-lg"
                >
                  <Zap size={20} /> START 5-MIN SPRINT
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-48"><HeartbeatLoader message="SYNCING WITH SYSTEMS" /></div>
            ) : questions.length === 0 ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-10 text-center shadow-xl w-full max-w-lg mx-auto mt-6 animate-fade-in">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Sparkles className="text-primary/70" size={40} />
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2">No Challenges Uploaded</h3>
                <p className="text-text-secondary font-medium leading-relaxed mb-6">
                  There are currently no active puzzles for "{tab}" under your selected context. Moderators sync new puzzles routinely—check back later!
                </p>
                <button
                  onClick={() => fetchQuestions()}
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold shadow-md transition-all flex justify-center items-center gap-2 mx-auto"
                >
                  <RefreshCw size={18} /> Refresh Board
                </button>
              </div>
            ) : ((result !== null || answeredSet.has(questions[currentQ]._id)) && currentQ === questions.length - 1) ? (
              <div className="bg-black/90 dark:bg-black p-8 sm:p-10 rounded-[2.5rem] text-center shadow-2xl animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Challenge Conquered!</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <p className="text-slate-300 font-medium bg-white/10 px-6 py-2 rounded-xl text-lg">
                    Score: <span className="font-bold text-white ml-2">{score}</span>/{questions.length}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => fetchQuestions()} className="bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full flex justify-center items-center gap-2"><RefreshCw size={18} /> Retry Set</button>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 sm:rounded-[2.5rem] rounded-2xl p-5 sm:p-10 shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                  <div className="flex gap-3 items-center">
                    <span className="bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-xl font-black shadow-inner">Q <span className="text-primary">{currentQ + 1}</span>{mode !== 'sprint' && `/${questions.length}`}</span>
                    {questions[currentQ].aiGenerated && <span className="bg-cyan-500/10 text-cyan-700 px-3 py-1.5 rounded-xl font-bold text-xs flex gap-1 items-center"><Bot size={14} /> AI Assisted</span>}
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-700 font-black px-3 py-1.5 rounded-xl flex items-center gap-2"><Trophy size={16} /> {score} Pts</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-8 leading-tight">{questions[currentQ].text}</h2>

                <div className="space-y-4">
                  {questions[currentQ].options.map((opt, i) => {
                    const qAnswered = answeredSet.has(questions[currentQ]._id) && result === null;
                    let style = "bg-white/70 hover:bg-white text-text-primary border-transparent opacity-80 cursor-pointer shadow-sm";
                    let badge = "bg-primary/5 text-primary";

                    if (result) {
                      if (i === result.correctIndex) { style = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md font-bold scale-[1.01]"; badge = "bg-emerald-500 text-white"; }
                      else if (i === selected) { style = "border-red-500 bg-red-50 text-red-900 shadow-sm font-bold scale-[1.01]"; badge = "bg-red-500 text-white"; }
                      else { style = "opacity-50 cursor-not-allowed"; }
                    } else if (qAnswered) {
                      if (i === questions[currentQ].correctIndex) { style = "border-emerald-300 bg-emerald-50 text-emerald-800 opacity-80 cursor-not-allowed"; badge = "bg-emerald-500/20 text-emerald-700"; }
                      else { style = "opacity-50 cursor-not-allowed"; }
                    } else if (i === selected) {
                      style = "border-primary bg-primary/5 shadow-md scale-[1.01] font-bold"; badge = "bg-primary text-white";
                    }

                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={result !== null || qAnswered} className={`w-full text-left flex items-center gap-4 transition-all rounded-2xl p-4 sm:p-5 border-2 ${style}`}>
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 transition-colors ${badge}`}>{String.fromCharCode(65 + i)}</span>
                        <span className="flex-1">{opt}</span>
                        {(result && i === result.correctIndex) || (qAnswered && i === questions[currentQ].correctIndex) ? <CheckCircle className="text-emerald-500" size={24} /> : null}
                        {result && i === selected && !result.correct && <XCircle className="text-red-500" size={24} />}
                      </button>
                    );
                  })}
                </div>

                {result && (
                  <div className={`mt-8 p-6 rounded-2xl animate-fade-in border ${result.correct ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"} flex gap-4 items-start`}>
                    <div className={`p-2 rounded-xl text-white mt-1 ${result.correct ? "bg-emerald-500" : "bg-red-500"}`}>{result.correct ? <CheckCircle size={24} /> : <XCircle size={24} />}</div>
                    <div>
                      <p className={`font-black text-xl mb-2 ${result.correct ? "text-emerald-900" : "text-red-900"}`}>{result.correct ? "Phenomenal! That's correct!" : "Not quite right!"}</p>
                      {result.explanation && <p className="text-sm font-medium text-slate-700 bg-white/50 p-3 rounded-xl">{result.explanation}</p>}
                    </div>
                  </div>
                )}

                {answeredSet.has(questions[currentQ]._id) && !result && (
                  <div className={`mt-8 p-6 rounded-2xl bg-slate-100/80 border border-slate-300 flex items-start gap-4`}>
                    <div className="bg-slate-300 text-slate-700 p-2 rounded-xl mt-1"><CheckCircle size={24} /></div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">You've locked this in previously.</p>
                      <p className="text-sm text-slate-600 mt-1">To maintain fair leaderboards, points are only awarded on your first attempt.</p>
                    </div>
                  </div>
                )}

                {(result || answeredSet.has(questions[currentQ]._id)) && currentQ < questions.length - 1 && (
                  <div className="mt-8 text-right">
                    <button onClick={nextQuestion} className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 ml-auto">
                      Next Challenge <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
