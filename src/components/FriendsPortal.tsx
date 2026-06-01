import React, { useState, useEffect } from "react";
import { GolfBagIcon } from "./GolfBagIcon";
import { Users, UserPlus, UserCheck, UserX, Trash2, Search, ChevronRight, X } from "lucide-react";

interface ProfileItem {
  username: string;
  displayName: string;
  avatarUrl?: string;
  preferredColor?: string;
}

interface FriendsPortalProps {
  currentUserUid: string;
  onClose: () => void;
  onViewBag: (username: string) => void;
}

export default function FriendsPortal({ currentUserUid, onClose, onViewBag }: FriendsPortalProps) {
  const [friends, setFriends] = useState<ProfileItem[]>([]);
  const [requestsIn, setRequestsIn] = useState<ProfileItem[]>([]);
  const [requestsOut, setRequestsOut] = useState<ProfileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const fetchFriendsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/friends/${currentUserUid}`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setRequestsIn(data.requestsIn || []);
        setRequestsOut(data.requestsOut || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, [currentUserUid]);

  const showMessage = (text: string, type: "error" | "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    try {
      const res = await fetch(`/api/friends/${currentUserUid}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername: searchUsername.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request.");
      showMessage("Friend request sent!", "success");
      setSearchUsername("");
      fetchFriendsData();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
  };

  const handleAccept = async (targetUsername: string) => {
    try {
      const res = await fetch(`/api/friends/${currentUserUid}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername })
      });
      if (res.ok) {
        showMessage("Friend request accepted!", "success");
        fetchFriendsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecline = async (targetUsername: string) => {
    try {
      const res = await fetch(`/api/friends/${currentUserUid}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername })
      });
      if (res.ok) {
        fetchFriendsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (targetUsername: string) => {
    if (!window.confirm(`Are you sure you want to remove ${targetUsername} from your friends?`)) return;
    try {
      const res = await fetch(`/api/friends/${currentUserUid}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername })
      });
      if (res.ok) {
        fetchFriendsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-950 border border-neutral-850 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-900 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2563eb]/20 rounded-lg text-[#2563eb]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Friends Portal</h2>
              <p className="text-xs text-neutral-400">Connect with other Vault members</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Add Friend Section */}
          <section>
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-neutral-500" />
              Add a Friend
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Search size={16} />
                </div>
                <input 
                  type="search" 
                  value={searchUsername}
                  onChange={e => setSearchUsername(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendRequest(e as any);
                  }}
                  placeholder="Enter username..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  data-1p-ignore="true"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#2563eb]"
                />
              </div>
              <button 
                onClick={handleSendRequest}
                disabled={!searchUsername.trim()}
                className="bg-[#2563eb] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Send Request
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-xs font-bold ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                {message.text}
              </p>
            )}
          </section>

          {/* Incoming Requests */}
          {requestsIn.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-500" />
                Friend Requests ({requestsIn.length})
              </h3>
              <div className="space-y-2">
                {requestsIn.map(req => (
                  <div key={req.username} className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white"
                        style={{ backgroundColor: req.preferredColor || "#2563eb" }}
                      >
                        {req.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{req.displayName}</p>
                        <p className="text-xs text-neutral-400 font-mono">@{req.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(req.username)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleDecline(req.username)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Friends List */}
          <section>
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={16} className="text-[#2563eb]" />
              My Friends ({friends.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-neutral-500">Loading friends...</div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-sm text-neutral-400 font-medium">You don't have any friends yet.</p>
                <p className="text-xs text-neutral-500 mt-1">Send a request using their username to connect!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map(friend => (
                  <div key={friend.username} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-inner"
                        style={{ backgroundColor: friend.preferredColor || "#2563eb" }}
                      >
                        {friend.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{friend.displayName}</p>
                        <p className="text-xs text-neutral-400 font-mono truncate">@{friend.username}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button 
                        onClick={() => {
                          onViewBag(friend.username);
                          onClose();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#2563eb] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <GolfBagIcon className="w-3.5 h-3.5" />
                        View Bag
                      </button>
                      <button 
                        onClick={() => handleRemove(friend.username)}
                        className="flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 text-neutral-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Outgoing */}
          {requestsOut.length > 0 && (
            <section className="pt-4 border-t border-neutral-900">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Pending Outgoing Requests
              </h3>
              <div className="flex flex-wrap gap-2">
                {requestsOut.map(req => (
                  <div key={req.username} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full flex items-center gap-2">
                    <span className="text-xs text-neutral-300 font-medium">{req.displayName}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">@{req.username}</span>
                    <button 
                      onClick={() => handleDecline(req.username)} // Decline works same as cancel for outgoing
                      className="ml-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                      title="Cancel Request"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
