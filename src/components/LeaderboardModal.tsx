import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Target, BarChart2, Medal } from "lucide-react";
import { AvatarRenderer } from "./AuthModal";

interface LeaderboardUser {
  username: string;
  displayName: string;
  avatarUrl?: string;
  totalUniqueBalls: number;
  totalBalls: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserUsername?: string;
}

export default function LeaderboardModal({ isOpen, onClose, currentUserUsername }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<"unique" | "total">("unique");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchLeaderboard();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use cache-busting for Safari aggressive caching
      const res = await fetch(`/api/leaderboard?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (activeTab === "unique") {
      return b.totalUniqueBalls - a.totalUniqueBalls || b.totalBalls - a.totalBalls;
    }
    return b.totalBalls - a.totalBalls || b.totalUniqueBalls - a.totalUniqueBalls;
  });

  const getRankColor = (index: number) => {
    if (index === 0) return "text-[#d4af37] border-[#d4af37] bg-[#d4af37]/10"; // Gold
    if (index === 1) return "text-[#c0c0c0] border-[#c0c0c0] bg-[#c0c0c0]/10"; // Silver
    if (index === 2) return "text-[#cd7f32] border-[#cd7f32] bg-[#cd7f32]/10"; // Bronze
    return "text-neutral-500 border-neutral-800 bg-neutral-900"; // Standard
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-850 flex justify-between items-center bg-gradient-to-b from-neutral-900 to-neutral-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
                  <Trophy className="text-[#d4af37]" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Global Rankings</h2>
                  <p className="text-xs text-neutral-400 font-mono">The biggest collections in the Vault</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white p-2 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-neutral-900 p-1 border-b border-neutral-800">
              <button
                onClick={() => setActiveTab("unique")}
                className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  activeTab === "unique"
                    ? "bg-neutral-950 text-[#d4af37] font-bold shadow-inner"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                }`}
              >
                <Target size={14} /> Unique Balls
              </button>
              <button
                onClick={() => setActiveTab("total")}
                className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  activeTab === "total"
                    ? "bg-neutral-950 text-[#2563eb] font-bold shadow-inner"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                }`}
              >
                <BarChart2 size={14} /> Total Balls
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto flex-grow p-4 bg-neutral-950 relative">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : error ? (
                <div className="text-red-400 text-center font-mono text-sm py-10">{error}</div>
              ) : sortedUsers.length === 0 ? (
                <div className="text-neutral-500 text-center font-mono text-sm py-10">No users have opted into the leaderboard yet.</div>
              ) : (
                <div className="space-y-3">
                  {sortedUsers.map((user, index) => {
                    const isCurrentUser = user.username === currentUserUsername;
                    const rankStyle = getRankColor(index);
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={user.username}
                        className={`flex items-center gap-3 p-3 rounded-2xl border ${
                          isCurrentUser ? "bg-neutral-900 border-[#2563eb]/50" : "bg-neutral-900/50 border-neutral-850"
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center font-black text-sm font-mono ${rankStyle}`}>
                          {index < 3 ? <Medal size={16} /> : index + 1}
                        </div>

                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <AvatarRenderer avatarUrl={user.avatarUrl} name={user.displayName} size="md" color={isCurrentUser ? "#2563eb" : "#404040"} />
                          <div className="truncate">
                            <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              {user.displayName}
                              {isCurrentUser && <span className="text-[9px] bg-[#2563eb]/20 text-[#2563eb] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">You</span>}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono truncate">@{user.username}</div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="shrink-0 text-right">
                          <div className={`text-lg font-black tracking-tighter ${activeTab === "unique" ? "text-[#d4af37]" : "text-[#2563eb]"}`}>
                            {activeTab === "unique" ? user.totalUniqueBalls : user.totalBalls}
                          </div>
                          <div className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">
                            {activeTab === "unique" ? "Unique" : "Total"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
