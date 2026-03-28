"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Bot, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });
      const data = await res.json();
      setMessages([...allMessages, { role: "assistant", content: data.response }]);
    } catch {
      setMessages([
        ...allMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const suggestions = [
    "How do I start learning Data Structures?",
    "What skills do I need for a software engineering role?",
    "Give me a study plan for placement preparation",
    "What are the trending technologies in 2024?",
  ];

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-0 flex flex-col h-screen bg-surface-light dark:bg-[#121212]">
        {/* Header */}
        <div className="border-b border-border dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md px-4 sm:px-6 py-4 z-10 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary dark:from-accent-cyan dark:to-accent-emerald shadow-lg flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary dark:text-text-primary-dark text-lg">AI Learning Assistant</h1>
              <p className="text-xs font-semibold text-primary/70 dark:text-accent-cyan/70">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 custom-scrollbar relative z-0">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.length === 0 && (
              <div className="text-center py-10 lg:py-20 animate-fade-in">
                <div className="w-24 h-24 mx-auto bg-primary/5 dark:bg-accent-cyan/5 rounded-full flex items-center justify-center mb-8 border-2 border-primary/10 dark:border-accent-cyan/20">
                  <Bot className="text-primary dark:text-accent-cyan" size={40} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
                  Hey {(session?.user as any)?.name?.split(" ")[0]}! How can I help?
                </h2>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-12 max-w-md mx-auto text-[15px] leading-relaxed">
                  I'm your AI learning companion. Ask me anything about career paths, technical concepts, or study strategies.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s)}
                      className="bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#2A2A2A] p-5 rounded-2xl text-left text-[14px] text-text-secondary dark:text-text-secondary-dark font-medium hover:text-primary dark:hover:text-accent-cyan hover:border-primary/50 dark:hover:border-accent-cyan/50 hover:shadow-md transition-all active:scale-[0.98] group"
                    >
                      <Sparkles size={16} className="text-primary/40 dark:text-accent-cyan/40 mb-2 group-hover:text-primary dark:group-hover:text-accent-cyan transition-colors" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 animate-fade-in ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-accent-cyan/20 dark:to-accent-emerald/20 border border-primary/20 dark:border-accent-cyan/30 shadow-sm flex items-center justify-center shrink-0 mt-1">
                    <Bot size={20} className="text-primary dark:text-accent-cyan" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary dark:bg-accent-cyan/10 text-white dark:text-accent-cyan border border-transparent dark:border-accent-cyan/20 rounded-tr-sm"
                      : "bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#2A2A2A] rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-[15px] font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm sm:prose-base dark:prose-invert prose-slate max-w-none 
                                    prose-p:leading-relaxed prose-pre:bg-surface-light dark:prose-pre:bg-[#121212] prose-pre:border prose-pre:border-border dark:prose-pre:border-[#2A2A2A]
                                    prose-headings:font-bold prose-headings:text-text-primary dark:prose-headings:text-white
                                    prose-a:text-primary dark:prose-a:text-accent-cyan hover:prose-a:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-2xl bg-surface-light dark:bg-[#121212] border border-border dark:border-[#2A2A2A] shadow-sm flex items-center justify-center shrink-0 mt-1">
                    <User size={20} className="text-text-primary dark:text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-accent-cyan/20 dark:to-accent-emerald/20 border border-primary/20 dark:border-accent-cyan/30 shadow-sm flex items-center justify-center shrink-0 mt-1">
                  <Bot size={20} className="text-primary dark:text-accent-cyan" />
                </div>
                <div className="bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#2A2A2A] shadow-sm rounded-3xl rounded-tl-sm px-6 py-5">
                  <div className="flex gap-2.5">
                    <div className="w-2 h-2 bg-primary/40 dark:bg-accent-cyan/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary/40 dark:bg-accent-cyan/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary/40 dark:bg-accent-cyan/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md border-t border-border dark:border-[#2A2A2A] px-4 sm:px-6 py-5 mb-16 lg:mb-0 shrink-0">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-surface-light dark:bg-[#121212] border border-border dark:border-[#2A2A2A] text-text-primary dark:text-white px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent-cyan/40 transition-shadow text-[15px]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-primary/95 dark:bg-[#121212] dark:border dark:border-accent-cyan dark:hover:bg-accent-cyan/10 text-white dark:text-accent-cyan px-5 py-3.5 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
