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
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-0 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-[#FDEFDA]/40 to-[#FDE7EA]/40 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FDEFDA] to-[#FDE7EA] shadow-sm flex items-center justify-center border border-white">
              <Bot size={24} className="text-orange-600" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-lg">AI Learning Assistant</h1>
              <p className="text-xs font-medium text-text-secondary/80">Powered by Google Gemini</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FDEFDA] to-[#FDE7EA] rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/60">
                  <Sparkles className="text-orange-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">
                  Hey {(session?.user as any)?.name?.split(" ")[0]}! How can I help?
                </h2>
                <p className="text-text-secondary mb-10 max-w-md mx-auto text-[15px] leading-relaxed">
                  I'm your AI learning companion. Ask me anything about career paths, technical concepts, or study strategies.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s)}
                      className="bg-white border border-border p-4 rounded-2xl text-left text-[14px] text-text-secondary hover:text-text-primary hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50 transition-all active:scale-[0.98]"
                    >
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
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FDEFDA] to-[#FDE7EA] shadow-sm border border-white flex items-center justify-center shrink-0 mt-1">
                    <Bot size={20} className="text-orange-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-3xl px-6 py-4 ${
                    msg.role === "user"
                      ? "bg-text-primary text-white rounded-tr-sm"
                      : "bg-white border border-border shadow-sm rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm sm:prose-base prose-slate max-w-none 
                                    prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 
                                    prose-pre:text-gray-800 prose-headings:font-semibold prose-headings:text-text-primary 
                                    prose-a:text-blue-600 hover:prose-a:text-blue-500">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-border flex items-center justify-center shrink-0 mt-1">
                    <User size={20} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FDEFDA] to-[#FDE7EA] shadow-sm border border-white flex items-center justify-center shrink-0 mt-1">
                  <Bot size={20} className="text-orange-600" />
                </div>
                <div className="bg-white border border-border shadow-sm rounded-3xl rounded-tl-sm px-6 py-5">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2.5 h-2.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2.5 h-2.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-white px-4 sm:px-6 py-4 mb-16 lg:mb-0">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary !px-4"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
