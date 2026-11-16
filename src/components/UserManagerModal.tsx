import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Palette,
  Check,
  ShoppingBag,
  Pencil,
  Trash2
} from "lucide-react";
import { GolfBall, BallCondition, UserProfile } from "../types";
import { AvatarRenderer } from "./AuthModal";
import BallVisual from "./BallVisual";
import { ACCENT_COLORS } from "../utils";
import { getAuthHeaders } from "../utils/authHeaders";
import { filterLegacyBalls } from "../utils/bagUtils";

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setAccentColor: React.Dispatch<React.SetStateAction<string>>;
  showToast: (message: string, type?: "success" | "error") => void;
}

export default function UserManagerModal({
  isOpen,
  onClose,
  currentUser,
  setUserProfile,
  setAccentColor,
  showToast
}: UserManagerModalProps) {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [selectedUserForBag, setSelectedUserForBag] = useState<UserProfile | null>(null);
  const [selectedUserBalls, setSelectedUserBalls] = useState<GolfBall[]>([]);
  const [isLoadingSelectedUserBalls, setIsLoadingSelectedUserBalls] = useState(false);
  const [bagModalErrorMessage, setBagModalErrorMessage] = useState<string | null>(null);
  const [isSavingUserBag, setIsSavingUserBag] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState<"Admin" | "User">("User");
  const [editColor, setEditColor] = useState("#2563eb");
  const [editAvatarUrl, setEditAvatarUrl] = useState("preset-1");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [editPasswordFocused, setEditPasswordFocused] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  const fetchUsers = async () => {
    if (!currentUser) return;
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/users", { headers });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned unexpected response (${res.status})`);
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }
      const normalized = (Array.isArray(data) ? data : []).map((u: any) => ({
        ...u,
        id: u.uid || u.id,
        uid: u.uid || u.id,
        name: u.displayName || u.name,
        displayName: u.displayName || u.name,
        role: ((u.role && u.role.toLowerCase() === "admin") || u.username?.toLowerCase() === "admin") ? "Admin" : "User"
      }));
      setUsersList(normalized);
    } catch (err: any) {
      console.error("fetchUsers error:", err?.message || err);
      setUsersError(err.message || "Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const handleUpdateUser = async (userId: string, updatedFields: { displayName: string; username: string; role: string; preferredColor: string; avatarUrl: string; email?: string; password?: string }) => {
    try {
      const headers = await getAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user");
        return false;
      }
      setUsersList(prev => prev.map(u => (u.uid === userId || u.id === userId) ? { ...u, ...data, id: data.uid || data.id, name: data.displayName || data.name } : u));
      if (userId === currentUser?.uid) {
        setUserProfile(prev => ({
          ...prev,
          ...data,
          uid: data.uid || currentUser.uid,
          displayName: data.displayName || prev?.displayName,
          username: data.username || prev?.username,
          avatarUrl: data.photoURL || data.avatarUrl || prev?.avatarUrl || "preset-1",
          preferredColor: data.preferredColor || prev?.preferredColor || "#2563eb",
          email: data.email !== undefined ? data.email : (prev?.email || (currentUser as any)?.email || ""),
          emailVerified: data.emailVerified !== undefined ? data.emailVerified : prev?.emailVerified,
          role: ((data.role && data.role.toLowerCase() === "admin") || data.username?.toLowerCase() === "admin") ? "Admin" : (prev?.role || "User"),
          shareBag: data.shareBag !== undefined ? !!data.shareBag : !!prev?.shareBag,
          shareToken: data.shareToken || prev?.shareToken,
          pendingFriendRequestsCount: data.pendingFriendRequestsCount !== undefined ? data.pendingFriendRequestsCount : (prev?.pendingFriendRequestsCount || 0)
        }));
        setAccentColor(data.preferredColor || (prevAccent => prevAccent));
      }
      return true;
    } catch (err: any) {
      alert(err.message || "Error updating user");
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.uid) {
      alert("Self-protection safeguard: You cannot delete your own account.");
      return;
    }

    if (currentUser) {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
          headers
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Failed to delete user");
          return;
        }
        setUsersList(prev => prev.filter(u => u.uid !== userId && u.id !== userId));
      } catch (err: any) {
        alert(err.message || "Error deleting user");
      }
    }
  };

  const handleViewUserBag = async (user: any) => {
    setEditingUserId(null);
    setSelectedUserForBag(user);
    setIsLoadingSelectedUserBalls(true);
    setBagModalErrorMessage(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/users/${user.uid || user.id}/locker`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserBalls(filterLegacyBalls(data.balls || []));
      } else {
        setSelectedUserBalls([]);
      }
    } catch (err: any) {
      console.error("Failed to load user locker:", err);
      setBagModalErrorMessage(err.message || "Failed to load user bag");
      setSelectedUserBalls([]);
    } finally {
      setIsLoadingSelectedUserBalls(false);
    }
  };

  const handleSaveUserBag = async () => {
    if (!selectedUserForBag) return;
    setIsSavingUserBag(true);
    try {
      const headers = await getAuthHeaders({ "Content-Type": "application/json" });
      const targetUid = selectedUserForBag.uid || selectedUserForBag.id;
      const res = await fetch(`/api/users/${targetUid}/locker`, {
        method: "POST",
        headers,
        body: JSON.stringify({ balls: selectedUserBalls })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save user bag.");
      }
      showToast("User bag inventory updated successfully!", "success");
    } catch (err: any) {
      console.error("Error saving user bag:", err);
      showToast(err.message || "Failed to update user bag.", "error");
    } finally {
      setIsSavingUserBag(false);
    }
  };

  const startEditingUser = (user: any) => {
    setSelectedUserForBag(null);
    setEditingUserId(user.uid || user.id);
    setEditName(user.displayName || user.name || "");
    setEditUsername(user.username || "");
    setEditRole(user.role || "User");
    setEditColor(user.preferredColor || "#2563eb");
    setEditAvatarUrl(user.avatarUrl || "preset-1");
    setEditEmail(user.email || "");
    setEditPassword("");
    setEditPasswordConfirm("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-950/60">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                User Manager
              </h2>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                Manage registered user accounts, edit profiles, and view/edit locker bags.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                setEditingUserId(null);
                setSelectedUserForBag(null);
              }}
              className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto flex-grow space-y-6">
            {isLoadingUsers ? (
              <div className="py-12 text-center text-neutral-500 font-mono text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="animate-spin text-accent w-6 h-6" />
                <span>Querying user accounts...</span>
              </div>
            ) : usersError ? (
              <div className="py-6 text-center text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-xl font-mono text-xs p-4">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
                <span>{usersError}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[10px] font-mono text-neutral-500 uppercase flex justify-between items-center">
                  <span>Registered Accounts ({usersList.length})</span>
                  <button onClick={fetchUsers} className="text-accent hover:underline flex items-center gap-1 cursor-pointer">
                    <RefreshCw size={10} /> Reload
                  </button>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {[...usersList].sort((a, b) => {
                    const isSelfA = (a.uid || a.id) === currentUser?.uid;
                    const isSelfB = (b.uid || b.id) === currentUser?.uid;
                    if (isSelfA && !isSelfB) return -1;
                    if (!isSelfA && isSelfB) return 1;

                    const roleA = a.role || "User";
                    const roleB = b.role || "User";
                    if (roleA === "Admin" && roleB !== "Admin") return -1;
                    if (roleA !== "Admin" && roleB === "Admin") return 1;

                    const nameA = (a.displayName || a.name || "").trim().toLowerCase();
                    const nameB = (b.displayName || b.name || "").trim().toLowerCase();
                    if (nameA < nameB) return -1;
                    if (nameA > nameB) return 1;

                    const userA = (a.username || "").trim().toLowerCase();
                    const userB = (b.username || "").trim().toLowerCase();
                    if (userA < userB) return -1;
                    if (userA > userB) return 1;

                    const idA = a.uid || a.id || "";
                    const idB = b.uid || b.id || "";
                    return idA.localeCompare(idB);
                  }).map((user) => {
                    const userUid = user.uid || user.id || "";
                    const isSelf = userUid === currentUser?.uid || user.authUid === currentUser?.uid;
                    const isEditing = editingUserId === userUid;
                    const isViewingBag = !!selectedUserForBag && ((selectedUserForBag.uid || selectedUserForBag.id) === userUid);

                    if (isEditing) {
                      return (
                        <div key={userUid} className="bg-neutral-900 border border-accent rounded-xl p-4 space-y-4 font-mono text-xs">
                          <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                            <AvatarRenderer avatarUrl={editAvatarUrl} name={editName} size="md" color={editColor} />
                            <div>
                              <span className="text-white font-bold block">Editing User Profile</span>
                              <span className="text-neutral-555 text-[10px]">ID: {userUid}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">Display Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-accent outline-none"
                                placeholder="Name"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">Username</label>
                              <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-accent outline-none"
                                placeholder="username"
                              />
                            </div>
                          </div>

                          {/* System Role + Email Address */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">System Role</label>
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value as "Admin" | "User")}
                                disabled={isSelf}
                                className="w-full bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-lg p-2 text-xs focus:border-accent outline-none cursor-pointer disabled:opacity-50"
                              >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                              </select>
                              {isSelf && <span className="text-[9px] text-amber-500 mt-1 block font-bold">You cannot demote yourself</span>}
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">Email Address</label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-accent outline-none"
                                placeholder="email@domain.com"
                              />
                            </div>
                          </div>

                          {/* New Password + Confirm Password */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">New Password</label>
                              <div className="relative">
                                <input
                                  type={showEditPassword ? "text" : "password"}
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  onFocus={() => setEditPasswordFocused(true)}
                                  onBlur={() => setTimeout(() => setEditPasswordFocused(false), 200)}
                                  className={`w-full bg-neutral-950 border rounded-lg p-2 pl-2 pr-9 text-xs text-white focus:border-accent outline-none ${editPassword && editPasswordConfirm && editPassword !== editPasswordConfirm ? "border-red-600" : "border-neutral-800"}`}
                                  placeholder="Leave blank to keep"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditPassword(!showEditPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                                >
                                  {showEditPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                                {editPasswordFocused && (
                                  <div className="absolute z-20 left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-2xl space-y-1.5 font-mono text-[9px] text-left">
                                    <div className="text-[9px] uppercase text-neutral-500 font-bold mb-1">Password Requirements:</div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={editPassword.length >= 8 ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                        {editPassword.length >= 8 ? "✓" : "○"}
                                      </span>
                                      <span className={editPassword.length >= 8 ? "text-emerald-300" : "text-neutral-400"}>At least 8 characters</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={/[A-Z]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                        {/[A-Z]/.test(editPassword) ? "✓" : "○"}
                                      </span>
                                      <span className={/[A-Z]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One uppercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={/[a-z]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                        {/[a-z]/.test(editPassword) ? "✓" : "○"}
                                      </span>
                                      <span className={/[a-z]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One lowercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={/[0-9]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                        {/[0-9]/.test(editPassword) ? "✓" : "○"}
                                      </span>
                                      <span className={/[0-9]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One number</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                        {/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? "✓" : "○"}
                                      </span>
                                      <span className={/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One special character</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">Confirm Password</label>
                              <div className="relative">
                                <input
                                  type={showEditConfirmPassword ? "text" : "password"}
                                  value={editPasswordConfirm}
                                  onChange={(e) => setEditPasswordConfirm(e.target.value)}
                                  className={`w-full bg-neutral-950 border rounded-lg p-2 pl-2 pr-[60px] text-xs focus:border-accent outline-none ${
                                    editPasswordConfirm && editPassword !== editPasswordConfirm
                                      ? "border-red-600 text-red-400"
                                      : editPasswordConfirm && editPassword === editPasswordConfirm && editPassword
                                      ? "border-emerald-600 text-white"
                                      : "border-neutral-800 text-white"
                                  }`}
                                  placeholder="Re-enter password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                                  className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                                >
                                  {showEditConfirmPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                                {editPasswordConfirm && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none">
                                    {editPassword === editPasswordConfirm
                                      ? <span className="text-emerald-400">✓</span>
                                      : <span className="text-red-500">✗</span>
                                    }
                                  </div>
                                )}
                              </div>
                              {editPasswordConfirm && editPassword !== editPasswordConfirm && (
                                <span className="text-[9px] text-red-500 mt-0.5 block">Passwords do not match</span>
                              )}
                            </div>
                          </div>

                          {/* Profile Picture + Accent Color side by side */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">Profile Picture</label>
                              <div className="grid grid-cols-4 gap-1.5 bg-neutral-950 border border-neutral-800 p-2 rounded-lg">
                                {["preset-1", "preset-2", "preset-3", "preset-4", "preset-5", "preset-6", "preset-7", "preset-8"].map((presetId) => (
                                  <button
                                    key={presetId}
                                    type="button"
                                    onClick={() => setEditAvatarUrl(presetId)}
                                    className="p-0.5 rounded-full relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-transparent shrink-0"
                                    style={{
                                      boxShadow: editAvatarUrl === presetId ? `0 0 6px ${editColor}` : "none",
                                      borderColor: editAvatarUrl === presetId ? "rgba(255,255,255,0.4)" : "transparent"
                                    }}
                                  >
                                    <AvatarRenderer avatarUrl={presetId} name={editName || "VV"} size="sm" color={editColor} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase text-neutral-400 mb-1">Accent Color</label>
                              <div className="bg-neutral-950 border border-neutral-800 p-2 rounded-lg">
                                <div className="grid grid-cols-5 gap-1.5">
                                  {ACCENT_COLORS.slice(0, 5).map(c => (
                                    <button
                                      key={c.value}
                                      type="button"
                                      onClick={() => setEditColor(c.value)}
                                      className="w-6 h-6 rounded-full border border-transparent transition-transform hover:scale-110 active:scale-95 mx-auto block cursor-pointer"
                                      style={{
                                        backgroundColor: c.value,
                                        boxShadow: editColor.toLowerCase() === c.value.toLowerCase() ? `0 0 6px ${c.value}` : "none",
                                        borderColor: editColor.toLowerCase() === c.value.toLowerCase() ? "white" : "transparent"
                                      }}
                                      title={c.name}
                                    />
                                  ))}
                                </div>
                                <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                                  {ACCENT_COLORS.slice(5).map(c => (
                                    <button
                                      key={c.value}
                                      type="button"
                                      onClick={() => setEditColor(c.value)}
                                      className="w-6 h-6 rounded-full border border-transparent transition-transform hover:scale-110 active:scale-95 mx-auto block cursor-pointer"
                                      style={{
                                        backgroundColor: c.value,
                                        boxShadow: editColor.toLowerCase() === c.value.toLowerCase() ? `0 0 6px ${c.value}` : "none",
                                        borderColor: editColor.toLowerCase() === c.value.toLowerCase() ? "white" : "transparent"
                                      }}
                                      title={c.name}
                                    />
                                  ))}
                                  {(() => {
                                    const isPreset = ACCENT_COLORS.some(c => c.value.toLowerCase() === editColor.toLowerCase());
                                    return (
                                      <div
                                        className="w-6 h-6 rounded-full border relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 overflow-hidden mx-auto"
                                        style={{
                                          backgroundColor: isPreset ? "#1e1e1e" : editColor,
                                          borderColor: !isPreset ? "#ffffff" : "rgba(255,255,255,0.1)",
                                          boxShadow: !isPreset ? `0 0 6px ${editColor}` : "none"
                                        }}
                                        title="Custom Color Picker"
                                      >
                                        <input
                                          type="color"
                                          value={isPreset ? "#2563eb" : editColor}
                                          onChange={(e) => setEditColor(e.target.value)}
                                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                        {isPreset ? (
                                          <Palette size={9} className="text-neutral-400" />
                                        ) : (
                                          <Check size={9} className="text-black font-black" />
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 border-t border-neutral-800">
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer text-[10px]"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (editPassword && editPassword !== editPasswordConfirm) {
                                  alert("Passwords do not match. Please confirm the password correctly.");
                                  return;
                                }
                                const success = await handleUpdateUser(userUid, {
                                  displayName: editName,
                                  username: editUsername,
                                  role: editRole,
                                  preferredColor: editColor,
                                  avatarUrl: editAvatarUrl,
                                  email: editEmail,
                                  password: editPassword
                                });
                                if (success) {
                                  setEditingUserId(null);
                                  setEditPasswordConfirm("");
                                }
                              }}
                              className="px-3 py-1.5 bg-accent hover:bg-[#b5e000] text-black font-extrabold rounded-lg transition-all cursor-pointer text-[10px]"
                            >
                              Save Settings
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={userUid}
                        className={`bg-neutral-950/60 border rounded-xl transition-all ${
                          isViewingBag
                            ? "border-accent/40 bg-neutral-950/90 shadow-lg p-3 space-y-3"
                            : "border-neutral-850 hover:border-neutral-750 p-3"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <AvatarRenderer avatarUrl={user.avatarUrl} name={user.displayName || user.name || "User"} size="md" color={user.preferredColor || "#2563eb"} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs truncate max-w-[130px]">{user.displayName || user.name || "User"}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-mono text-accent px-1 bg-accent/10 border border-accent/25 rounded uppercase">
                                    Self
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] text-neutral-500 font-mono flex flex-wrap gap-x-1.5 items-center">
                                {user.username && (
                                  <span className="text-neutral-400">@{user.username}</span>
                                )}
                                {user.email && (
                                  <>
                                    <span className="text-neutral-700 select-none">•</span>
                                    <span className="truncate max-w-[120px]">{user.email}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {user.role === "Admin" ? (
                                  <span className="px-1 py-0.2 rounded border border-accent/30 text-accent bg-accent/10 text-[9px] uppercase tracking-wider font-bold font-mono">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="px-1 py-0.2 rounded border border-neutral-800 text-neutral-400 bg-neutral-900/40 text-[9px] uppercase tracking-wider font-bold font-mono">
                                    User
                                  </span>
                                )}
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-neutral-600 font-mono">Accent:</span>
                                  <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: user.preferredColor || "#2563eb" }}></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (isViewingBag) {
                                  setSelectedUserForBag(null);
                                } else {
                                  handleViewUserBag(user);
                                }
                              }}
                              className={`p-1 px-2 rounded-lg border transition-colors flex items-center gap-1 text-[10px] font-mono font-black cursor-pointer ${
                                isViewingBag
                                  ? "bg-accent/15 border-accent text-accent"
                                  : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-750 text-neutral-355 hover:text-white"
                              }`}
                              title={isViewingBag ? "Hide Bag" : "Show Bag"}
                            >
                              <ShoppingBag size={10} />
                              <span>{isViewingBag ? "Hide Bag" : "Show Bag"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingUser(user)}
                              className="p-1 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-750 text-accent hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono font-black cursor-pointer"
                              title="Edit User Settings"
                            >
                              <Pencil size={10} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingUserId(userUid)}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/50 border border-neutral-800 hover:border-rose-900 text-neutral-555 hover:text-rose-455 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Inline User Bag Content */}
                        {isViewingBag && (
                          <div className="pt-3 border-t border-neutral-850 space-y-3 font-mono text-xs animate-in fade-in duration-200">
                            <div className="flex items-center justify-between pb-1">
                              <div className="flex items-center gap-2">
                                <ShoppingBag size={12} className="text-accent" />
                                <span className="text-white font-bold text-[11px] uppercase tracking-wider">
                                  Bag Inventory
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  ({selectedUserBalls.length} {selectedUserBalls.length === 1 ? "item" : "items"})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedUserForBag(null)}
                                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <X size={12} />
                                <span>Close</span>
                              </button>
                            </div>

                            {bagModalErrorMessage && (
                              <div className="p-2.5 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-200 text-[11px] font-mono">
                                {bagModalErrorMessage}
                              </div>
                            )}

                            {isLoadingSelectedUserBalls ? (
                              <div className="py-6 text-center text-xs text-neutral-500 font-mono flex items-center justify-center gap-2">
                                <RefreshCw className="animate-spin text-accent" size={14} />
                                <span>Loading bag data...</span>
                              </div>
                            ) : selectedUserBalls.length === 0 ? (
                              <div className="py-6 text-center bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl text-xs text-neutral-500 font-mono">
                                This user's bag is empty.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                {selectedUserBalls.map((ball) => {
                                  const currentPkg = ball.packageType || "ea";
                                  const pkgUnit = currentPkg === "box" ? 12 : currentPkg === "sleeve" ? 3 : 1;
                                  const displayQty = Math.max(1, Math.round(ball.quantity / pkgUnit));

                                  return (
                                    <div
                                      key={ball.id}
                                      className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <BallVisual
                                          color={ball.color}
                                          model={ball.model}
                                          size="sm"
                                          customImage={ball.customImage}
                                          customImageSleeve={ball.customImageSleeve}
                                          customImageBox={ball.customImageBox}
                                          packageType={ball.packageType}
                                        />
                                        <div className="min-w-0">
                                          <span className="text-white font-bold block truncate text-xs">{ball.model}</span>
                                          <span className="text-neutral-450 block text-[10px] truncate">
                                            {ball.color} • {currentPkg === "box" ? "box" : currentPkg === "sleeve" ? "sleeve" : "ea"}
                                            {ball.year ? ` • ${ball.year}` : ""}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t border-neutral-800/60 pt-2 sm:border-t-0 sm:pt-0 shrink-0">
                                        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedUserBalls(prev => prev.map(b => {
                                                if (b.id === ball.id) {
                                                  const step = b.packageType === "box" ? 12 : b.packageType === "sleeve" ? 3 : 1;
                                                  return { ...b, quantity: Math.max(step, b.quantity - step) };
                                                }
                                                return b;
                                              }));
                                            }}
                                            className="px-2 py-0.5 text-neutral-400 hover:text-white font-extrabold cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <span className="px-1.5 text-white font-bold text-xs min-w-[14px] text-center">
                                            {displayQty}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedUserBalls(prev => prev.map(b => {
                                                if (b.id === ball.id) {
                                                  const step = b.packageType === "box" ? 12 : b.packageType === "sleeve" ? 3 : 1;
                                                  return { ...b, quantity: b.quantity + step };
                                                }
                                                return b;
                                              }));
                                            }}
                                            className="px-2 py-0.5 text-neutral-400 hover:text-white font-extrabold cursor-pointer"
                                          >
                                            +
                                          </button>
                                        </div>

                                        <select
                                          value={currentPkg}
                                          onChange={(e) => {
                                            const newPkg = e.target.value as 'ea' | 'sleeve' | 'box';
                                            setSelectedUserBalls(prev => prev.map(b => {
                                              if (b.id === ball.id) {
                                                const oldPkg = b.packageType || "ea";
                                                const oldUnit = oldPkg === "box" ? 12 : oldPkg === "sleeve" ? 3 : 1;
                                                const pkgCount = Math.max(1, Math.round(b.quantity / oldUnit));
                                                const newUnit = newPkg === "box" ? 12 : newPkg === "sleeve" ? 3 : 1;
                                                return {
                                                  ...b,
                                                  packageType: newPkg,
                                                  quantity: pkgCount * newUnit
                                                };
                                              }
                                              return b;
                                            }));
                                          }}
                                          className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-accent cursor-pointer font-sans"
                                        >
                                          <option value="ea">Ball (ea)</option>
                                          <option value="sleeve">Sleeve (3)</option>
                                          <option value="box">Box (12)</option>
                                        </select>

                                        <select
                                          value={ball.condition}
                                          onChange={(e) => {
                                            const newCond = e.target.value as any;
                                            setSelectedUserBalls(prev => prev.map(b => b.id === ball.id ? { ...b, condition: newCond } : b));
                                          }}
                                          className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-accent cursor-pointer font-sans"
                                        >
                                          <option value={BallCondition.NEW}>{BallCondition.NEW}</option>
                                          <option value={BallCondition.MINT}>{BallCondition.MINT}</option>
                                          <option value={BallCondition.PLAYED}>{BallCondition.PLAYED}</option>
                                          <option value={BallCondition.DAMAGED}>{BallCondition.DAMAGED}</option>
                                        </select>

                                        <button
                                          type="button"
                                          onClick={() => setSelectedUserBalls(prev => prev.filter(b => b.id !== ball.id))}
                                          className="p-1.5 text-neutral-500 hover:text-rose-450 hover:bg-neutral-950 rounded transition-colors cursor-pointer"
                                          title="Remove Ball Stack"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {!isLoadingSelectedUserBalls && selectedUserBalls.length > 0 && (
                              <div className="flex items-center justify-between pt-2 border-t border-neutral-850">
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  Total: {selectedUserBalls.reduce((sum, b) => sum + (b.quantity || 1), 0)} balls
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUserForBag(null)}
                                    className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer text-[10px] font-sans"
                                  >
                                    Close
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSavingUserBag}
                                    onClick={handleSaveUserBag}
                                    className="px-3 py-1.5 bg-accent hover:bg-[#b5e000] disabled:opacity-50 text-black font-extrabold rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider font-sans flex items-center gap-1.5"
                                  >
                                    {isSavingUserBag ? (
                                      <>
                                        <RefreshCw size={10} className="animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : (
                                      <span>Save Bag</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styled Deletion Confirmation Modal */}
      {deletingUserId && (() => {
        const targetUser = usersList.find(u => (u.uid || u.id) === deletingUserId);
        const isSelfDeletion = targetUser && (
          (targetUser.uid || targetUser.id) === currentUser?.uid ||
          targetUser.authUid === currentUser?.uid
        );

        if (isSelfDeletion) {
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-neutral-900 border border-amber-950/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Self-Deletion Blocked
                </h3>
                <p className="text-xs text-neutral-350 font-mono leading-relaxed">
                  You cannot delete your own logged in account (<span className="text-white font-bold font-sans">{targetUser?.displayName || "System Admin"}</span>). This self-protection safeguard prevents administrative lockout.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDeletingUserId(null)}
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-450 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold font-mono uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-neutral-900 border border-rose-950/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Confirm Delete User
              </h3>
              <p className="text-xs text-neutral-350 font-mono leading-relaxed">
                Are you absolutely sure you want to delete user <span className="text-white font-bold font-sans">
                  {targetUser?.displayName || "this user"}
                </span>? This will also purge their custom specifications and locker storage permanently.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingUserId(null)}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteUser(deletingUserId);
                    setDeletingUserId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
