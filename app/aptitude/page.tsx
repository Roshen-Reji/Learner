"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
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
  Bot,
  Sparkles,
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
  const user = session?.user as any;
  const [tab, setTab] = useState<Tab>("coding");
  const [mode, setMode] = useState<Mode>("qotd");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    correctIndex: number;
    explanation: string;
    alreadyAttempted?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sprintTimer, setSprintTimer] = useState(300);
  const [sprintActive, setSprintActive] = useState(false);
  const [answeredSet, setAnsweredSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [tab, mode]);

  useEffect(() => {
    if (!sprintActive || sprintTimer <= 0) return;
    const t = setInterval(() => setSprintTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [sprintActive, sprintTimer]);

  useEffect(() => {
    if (sprintTimer === 0 && sprintActive) {
      setSprintActive(false);
      toast.error("Time's up! ⏰");
    }
  }, [sprintTimer, sprintActive]);

  const fetchQuestions = async () => {
    setLoading(true);
    setCurrentQ(0);
    setSelected(null);
    setResult(null);
    setScore(0);
    setTotalAnswered(0);
    try {
      const res = await fetch(`/api/aptitude?category=${tab}&mode=${mode}`);
      const data = await res.json();
      setQuestions(data);
      // Initialize answeredSet from server data (persisted attempts)
      const alreadyAttempted = new Set<string>(
        data.filter((q: Question) => q.attempted).map((q: Question) => q._id)
      );
      setAnsweredSet(alreadyAttempted);
      setScore(data.filter((q: Question) => q.isCorrect).length);
      if (mode === "sprint") {
        setSprintTimer(300);
        setSprintActive(true);
      }
    } catch {
      toast.error("Failed to load questions");
    }
    setLoading(false);
  };

  const isAlreadyAnswered = (qId: string) => answeredSet.has(qId);

  const handleAnswer = async (index: number) => {
    if (result !== null) return;
    const qId = questions[currentQ]._id;
    if (isAlreadyAnswered(qId)) return;
    setSelected(index);
    try {
      const res = await fetch("/api/aptitude/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: qId,
          selectedIndex: index,
          mode,
        }),
      });
      const data = await res.json();
      setResult(data);
      setAnsweredSet(prev => new Set(prev).add(qId));
      setTotalAnswered((t) => t + 1);
      if (data.alreadyAttempted) {
        toast("You've already answered this question.", { icon: "ℹ️" });
      } else if (data.correct) {
        setScore((s) => s + 1);
        toast.success("Correct! 🎉 +10 points");
        if (session) {
          await update({ points: ((session.user as any)?.points || 0) + 10 });
        }
      } else {
        toast.error("Wrong answer 😅");
      }
    } catch {
      toast.error("Failed to submit answer");
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setResult(null);
    } else {
      toast.success(`Completed! Score: ${score}/${questions.length}`);
      setSprintActive(false);
    }
  };

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: "coding", label: "Coding", emoji: "💻" },
    { key: "numerical", label: "Numerical", emoji: "🔢" },
    { key: "verbal", label: "Verbal", emoji: "📝" },
  ];

  const modes: { key: Mode; label: string; icon: any; desc: string; badge?: string }[] = [
    { key: "qotd", label: "Question of the Day", icon: Zap, desc: "Daily AI challenge", badge: "⭐" },
    { key: "sprint", label: "5-min Sprint", icon: Clock, desc: "Timed challenge" },
    { key: "browse", label: "Practice All", icon: Brain, desc: "Browse & practice" },
  ];

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
              <Brain className="text-primary" /> Aptitude Center
            </h1>
            <p className="text-text-secondary mt-1 flex items-center gap-2">
              AI-powered questions that update daily
              <span className="badge bg-cyan-50 text-cyan-700 text-xs flex items-center gap-1">
                <Bot size={10} /> AI Generated
              </span>
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  tab === t.key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-text-secondary hover:bg-gray-50 border border-border"
                }`}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`card !p-4 text-left transition-all ${
                    mode === m.key
                      ? "!border-primary !shadow-md ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        mode === m.key
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm flex items-center gap-1">
                        {m.label}
                        {m.badge && <span className="text-xs">{m.badge}</span>}
                      </p>
                      <p className="text-xs text-text-secondary">{m.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sprint Timer */}
          {mode === "sprint" && sprintActive && (
            <div className="card-gamify mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Clock size={24} className="text-gamify-red" />
                <div>
                  <p className="text-sm text-gray-400">Time Remaining</p>
                  <p className="text-2xl font-bold text-gamify-red">
                    {Math.floor(sprintTimer / 60)}:
                    {(sprintTimer % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm text-gray-400">Score</p>
                <p className="text-2xl font-bold">
                  {score}/{questions.length}
                </p>
              </div>
            </div>
          )}

          {/* Question Display */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-text-secondary">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="card text-center py-16">
              <Sparkles className="mx-auto text-primary/50 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-text-primary">
                No {tab} questions available yet
              </h3>
              <p className="text-text-secondary mt-1 max-w-sm mx-auto">
                Questions are generated by AI daily. A moderator can also
                trigger generation from the Moderator Panel → AI Tools.
              </p>
              <button
                onClick={fetchQuestions}
                className="btn-secondary mt-4 flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          ) : (
            <div className="card animate-fade-in">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="badge-primary">
                    Q{currentQ + 1} of {questions.length}
                  </span>
                  {questions[currentQ].aiGenerated && (
                    <span className="badge bg-cyan-50 text-cyan-700 text-xs flex items-center gap-1">
                      <Bot size={10} /> AI
                    </span>
                  )}
                </div>
                <span className="badge-success flex items-center gap-1">
                  <Trophy size={12} /> {score} correct
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-6 leading-relaxed">
                {questions[currentQ].text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => {
                  const qAnswered = isAlreadyAnswered(questions[currentQ]._id) && result === null;
                  let optClass = "card !p-4 cursor-pointer hover:border-primary/50 transition-all";
                  
                  if (result !== null) {
                    if (i === result.correctIndex)
                      optClass = "card !p-4 !border-success !bg-green-50";
                    else if (i === selected && !result.correct)
                      optClass = "card !p-4 !border-error !bg-red-50";
                  } else if (qAnswered) {
                     if (i === questions[currentQ].correctIndex) {
                       optClass = "card !p-4 !border-success !bg-green-50 opacity-80 cursor-not-allowed";
                     } else {
                       optClass = "card !p-4 !bg-gray-100/50 !text-gray-400 opacity-60 cursor-not-allowed border-transparent";
                     }
                  } else if (i === selected) {
                    optClass = "card !p-4 !border-primary !bg-primary-50";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={result !== null || qAnswered}
                      className={`${optClass} w-full text-left flex items-center gap-3`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {(result !== null && i === result.correctIndex) || (qAnswered && i === questions[currentQ].correctIndex) ? (
                        <CheckCircle
                          className="text-success shrink-0"
                          size={20}
                        />
                      ) : null}
                      {result !== null &&
                        i === selected &&
                        !result.correct && (
                          <XCircle
                            className="text-error shrink-0"
                            size={20}
                          />
                        )}
                    </button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              {result && (
                <div
                  className={`mt-4 p-4 rounded-xl ${
                    result.correct
                      ? "bg-green-50 border border-success/30"
                      : "bg-red-50 border border-error/30"
                  }`}
                >
                  <p className={`font-semibold ${result.correct ? "text-success" : "text-error"}`}>
                    {result.correct ? "Correct!" : "Incorrect"}
                  </p>
                  {result.explanation && (
                    <p className="text-sm text-text-secondary mt-1">
                      {result.explanation}
                    </p>
                  )}
                </div>
              )}

              {result && result.alreadyAttempted && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                   <div className="p-2 bg-amber-100 rounded-lg shrink-0 mt-0.5"><CheckCircle size={18} className="text-amber-600" /></div>
                   <div>
                     <p className="font-bold text-text-primary text-sm">You've already solved this question.</p>
                     <p className="text-xs text-text-secondary mt-1">
                       No points were awarded for this repeat attempt.
                     </p>
                   </div>
                </div>
              )}

              {isAlreadyAnswered(questions[currentQ]._id) && !result && (
                <div className={`mt-4 p-4 rounded-xl ${questions[currentQ].isCorrect ? "bg-green-50 border border-success/30" : "bg-red-50 border border-error/30"}`}>
                   <p className={`font-semibold ${questions[currentQ].isCorrect ? "text-success" : "text-error"}`}>
                     {questions[currentQ].isCorrect ? "You previously answered this correctly." : "You previously answered this incorrectly."}
                   </p>
                   {questions[currentQ].explanation && (
                     <p className="text-sm text-text-secondary mt-1">
                       {questions[currentQ].explanation}
                     </p>
                   )}
                </div>
              )}

              {/* Next Button */}
              {(result !== null || isAlreadyAnswered(questions[currentQ]._id)) && currentQ < questions.length - 1 && (
                <button
                  onClick={nextQuestion}
                  className="btn-primary mt-4 flex items-center gap-2"
                >
                  Next Question <ChevronRight size={18} />
                </button>
              )}

              {/* Completion */}
              {(result !== null || isAlreadyAnswered(questions[currentQ]._id)) && currentQ === questions.length - 1 && (
                <div className="mt-4 card-gamify text-center">
                  <Trophy
                    className="text-gamify-gold mx-auto mb-2"
                    size={40}
                  />
                  <h3 className="text-xl font-bold text-white">
                    {mode === "sprint" ? "Sprint" : "Session"} Complete!
                  </h3>
                  <p className="text-gray-300 mt-1">
                    Score: {score}/{questions.length} •{" "}
                    {Math.round((score / questions.length) * 100)}%
                  </p>
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={fetchQuestions}
                      className="btn-gamify flex items-center gap-2"
                    >
                      <RefreshCw size={16} /> Try Again
                    </button>
                    <button
                      onClick={() => {
                        const next =
                          tabs[(tabs.findIndex((t) => t.key === tab) + 1) % tabs.length];
                        setTab(next.key);
                      }}
                      className="px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium"
                    >
                      Next Category →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
