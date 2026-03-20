"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { Trophy, Medal, Star, Flame, Crown } from "lucide-react";

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  points: number;
  streakDays: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const rankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="text-amber-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={22} />;
    if (rank === 3) return <Medal className="text-amber-600" size={22} />;
    return <span className="text-sm font-bold text-text-secondary">#{rank}</span>;
  };

  const getRowStyle = (rank: number) => {
    if (rank === 1) return "card-gamify !border-amber-500 !shadow-amber-500/20";
    if (rank === 2) return "card !border-gray-300 !shadow-md";
    if (rank === 3) return "card !border-amber-600/30 !shadow-md";
    return "card";
  };

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="text-center mb-8">
            <Trophy className="text-amber-500 mx-auto mb-3" size={48} />
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Leaderboard</h1>
            <p className="text-text-secondary mt-1">Top performers this month • Resets monthly</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="card text-center py-16">
              <Trophy className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-semibold">No one on the board yet</h3>
              <p className="text-text-secondary">Start earning points to appear here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u, i) => {
                const rank = i + 1;
                const isMe = u._id === user?.id;
                return (
                  <div
                    key={u._id}
                    className={`${getRowStyle(rank)} flex items-center gap-4 animate-fade-in ${
                      isMe ? "ring-2 ring-primary/30" : ""
                    }`}
                  >
                    <div className="w-10 flex items-center justify-center shrink-0">
                      {rankBadge(rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold truncate ${rank <= 3 ? (rank === 1 ? "text-white" : "text-text-primary") : "text-text-primary"}`}>
                          {u.name}
                        </span>
                        {isMe && <span className="badge-primary text-xs">You</span>}
                      </div>
                      <div className={`text-xs ${rank === 1 ? "text-gray-300" : "text-text-secondary"}`}>
                        {u.branch} • Year {u.year}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {u.streakDays > 0 && (
                        <div className={`flex items-center gap-1 text-sm font-bold ${rank === 1 ? "text-red-300" : "text-red-500"}`}>
                          <Flame size={14} /> {u.streakDays}
                        </div>
                      )}
                      <div className={`flex items-center gap-1 font-bold ${rank === 1 ? "text-amber-300 text-lg" : "text-amber-600"}`}>
                        <Star size={16} /> {u.points}
                      </div>
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
