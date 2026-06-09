/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Settings, Palette, Check, RefreshCw, Link as LinkIcon, Sun, Moon, Monitor, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  auth,
  db,
  isFirebaseConfigured
} from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMockLogin?: (user: any) => void;
  currentUser?: any;
  userProfile?: { displayName: string; username?: string; avatarUrl?: string; preferredColor: string; role?: string; createdAt?: string; email?: string; shareBag?: boolean; shareToken?: string } | null;
  onProfileUpdate?: (updatedUser: any) => void;
  theme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  hasBagItems?: boolean;
}

export const ACCENT_COLORS = [
  { name: "Royal Blue", value: "#2563eb" },
  { name: "Neon Red", value: "#ff3366" },
  { name: "Gold", value: "#d4af37" },
  { name: "Cyan Blue", value: "#00e5ff" },
  { name: "Royal Purple", value: "#9d4edf" },
  { name: "Masters Green", value: "#17b056" },
  { name: "Volt Orange", value: "#ff6b00" },
  { name: "Hot Pink", value: "#ff33cc" },
  { name: "Electric Teal", value: "#00f5d4" }
];

function isStrongPassword(pass: string): boolean {
  if (pass.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}

export function AvatarRenderer({ 
  avatarUrl, 
  name, 
  size = "md", 
  color = "#2563eb" 
}: { 
  avatarUrl?: string; 
  name: string; 
  size?: "sm" | "md" | "lg"; 
  color?: string 
}) {
  const sizeClasses = {
    sm: "w-5 h-5 text-[9px]",
    md: "w-8 h-8 text-xs",
    lg: "w-12 h-12 text-sm"
  };
  
  const iconSizes = {
    sm: 10,
    md: 16,
    lg: 24
  };

  const initials = name ? name.trim().charAt(0).toUpperCase() : "U";

  if (!avatarUrl || avatarUrl === "initials") {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-black transition-all`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }

  if (avatarUrl.startsWith("preset-")) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border border-white/10 text-black transition-all`}
        style={{ backgroundColor: color }}
      >
        {avatarUrl === "preset-1" && (
          // Golf ball circle with dimples
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="8" cy="9" r="0.75" fill="currentColor" />
            <circle cx="12" cy="8" r="0.75" fill="currentColor" />
            <circle cx="16" cy="9" r="0.75" fill="currentColor" />
            <circle cx="9" cy="13" r="0.75" fill="currentColor" />
            <circle cx="13" cy="14" r="0.75" fill="currentColor" />
            <circle cx="15" cy="13" r="0.75" fill="currentColor" />
            <circle cx="12" cy="18" r="0.75" fill="currentColor" />
          </svg>
        )}
        {avatarUrl === "preset-2" && (
          // Golf Tee with Ball
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M9 13.5c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
            <path d="M12 15v5.5" />
            <path d="M7 21.5h10" />
          </svg>
        )}
        {avatarUrl === "preset-3" && (
          // Crossed Golf Clubs
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 5l11 11" />
            <path d="M17 16c.8.3 1.5 1 1.2 1.8c-.3.8-1.2 1-1.8.6l-1.4-1" />
            <path d="M18 5L7 16" />
            <path d="M7 16c-.8.3-1.5 1-1.2 1.8c.3.8 1.2 1 1.8.6l1.4-1" />
          </svg>
        )}
        {avatarUrl === "preset-4" && (
          // Golf Hole & Flagstick
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18c3.5 1.5 14.5 1.5 18 0" />
            <path d="M12 18V4" />
            <path d="M12 4l6 3.5-6 3.5" fill="currentColor" />
            <ellipse cx="12" cy="18" rx="2" ry="0.5" fill="currentColor" stroke="none" />
            <circle cx="7" cy="17" r="1" fill="currentColor" stroke="none" />
          </svg>
        )}
        {avatarUrl === "preset-5" && (
          // Golf Bag
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="7" width="8" height="13" rx="1.5" />
            <path d="M8 10l-2 9" />
            <path d="M16 10l2 9" />
            <rect x="10" y="11" width="4" height="5" rx="0.5" />
            <path d="M10 7V4.5" />
            <path d="M12 7V4" />
            <path d="M14 7V4.5" />
            <path d="M9.5 4.5h1" />
            <path d="M11.5 4h1" />
            <path d="M13.5 4.5h1" />
          </svg>
        )}
        {avatarUrl === "preset-6" && (
          // Golf Cart / Buggy
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M3 14h15a3 3 0 0 0 3-3V9h-3" />
            <path d="M6 14V8a2 2 0 0 1 2-2h5" />
            <path d="M10 6v8" />
            <path d="M15 14V8a2 2 0 0 1 2-2h4v8H15z" fill="currentColor" fillOpacity="0.2" />
          </svg>
        )}
        {avatarUrl === "preset-7" && (
          // Putter / Golf Club
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 3L8 18H5.5c-1 0-1.5.5-1.5 1.5S4.5 21 5.5 21H10c1 0 1.5-.5 1.5-1.5V19l8-16" />
          </svg>
        )}
        {avatarUrl === "preset-8" && (
          // Trophy Cup
          <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
            <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
            <path d="M6 2h12v7a6 6 0 0 1-12 0V2z" />
            <path d="M12 15v4" />
            <path d="M9 19h6" />
            <path d="M9 22h6" />
          </svg>
        )}
      </div>
    );
  }

  // Custom Image URL fallback
  return (
    <img 
      src={avatarUrl} 
      alt={name} 
      className={`${sizeClasses[size]} rounded-full object-cover border border-white/20`}
      onError={(e) => {
        // Fallback to initials if image load fails
        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
      }}
    />
  );
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onMockLogin,
  currentUser,
  userProfile,
  onProfileUpdate,
  theme = "system",
  onThemeChange,
  hasBagItems
}: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup" | "settings">("signin");
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [preferredColor, setPreferredColor] = useState("#2563eb");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [shareBag, setShareBag] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Avatar Selection State
  const [selectedPreset, setSelectedPreset] = useState("preset-1");
  
  // UX State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize/Load state on mount/open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setConfirmPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      
      if (currentUser) {
        setTab("settings");
        
        const nameVal = userProfile?.displayName || currentUser.displayName || "";
        const usernameVal = userProfile?.username || currentUser.username || "";
        const colorVal = userProfile?.preferredColor || currentUser.preferredColor || "#2563eb";
        const avatarVal = userProfile?.avatarUrl || currentUser.photoURL || "preset-1";
        const shareBagVal = userProfile?.shareBag || currentUser.shareBag || false;
        
        setDisplayName(nameVal);
        setUsername(usernameVal);
        setPreferredColor(colorVal);
        setShareBag(shareBagVal);
        
        if (avatarVal.startsWith("preset-")) {
          setSelectedPreset(avatarVal);
        } else {
          setSelectedPreset("preset-1");
        }
      } else {
        setTab("signin");
        setEmail("");
        setPassword("");
        setDisplayName("");
        setUsername("");
        setPreferredColor("#2563eb");
        setSelectedPreset("preset-1");
        setShareBag(false);
      }
    }
  }, [isOpen]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isFirebaseConfigured || !auth) {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to log in.");
        }
        
        localStorage.setItem("vice_vault_mock_user", JSON.stringify(data));
        setSuccessMsg("Logged in locally!");
        setTimeout(() => {
          onMockLogin?.(data);
          onClose();
          setIsLoading(false);
        }, 1000);
        return;
      } catch (err: any) {
        setError(err.message || "Local auth failed.");
        setIsLoading(false);
        return;
      }
    }

    let resolvedEmail = email.trim();
    if (!resolvedEmail.includes("@")) {
      try {
        const resolveRes = await fetch(`/api/auth/resolve-email?username=${encodeURIComponent(resolvedEmail)}`);
        if (!resolveRes.ok) {
          const resolveData = await resolveRes.json();
          throw new Error(resolveData.error || `Username '${resolvedEmail}' not found.`);
        }
        const resolveData = await resolveRes.json();
        resolvedEmail = resolveData.email;
      } catch (err: any) {
        setError(err.message || "Failed to resolve username to email.");
        setIsLoading(false);
        return;
      }
    }

    try {
      await signInWithEmailAndPassword(auth, resolvedEmail, password);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to log in. Please check credentials.");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please enter your display Name.");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanUsername) {
      setError("Username must contain letters, numbers, or underscores.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please confirm your password.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const finalAvatar = selectedPreset;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          username: cleanUsername,
          displayName: displayName.trim(),
          avatarUrl: finalAvatar,
          preferredColor
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      if (!isFirebaseConfigured || !auth) {
        localStorage.setItem("vice_vault_mock_user", JSON.stringify(data));
        setSuccessMsg("Local account created!");
        setTimeout(() => {
          onMockLogin?.(data);
          onClose();
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Real Firebase environment: sign in the user client-side now that the server created their Auth/Firestore record
      await signInWithEmailAndPassword(auth, email, password);

      // Ensure client-side user profile displayName and photoURL match
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: displayName.trim(),
          photoURL: finalAvatar
        });
      }

      setSuccessMsg("Account created successfully!");
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account.");
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanUsername) {
      setError("Username must contain letters, numbers, or underscores.");
      return;
    }
    if (newPassword && !isStrongPassword(newPassword)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }
    if (newPassword && newPassword !== newPasswordConfirm) {
      setError("Passwords do not match. Please confirm your new password correctly.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const finalAvatar = selectedPreset;

    if (!isFirebaseConfigured || !auth || (currentUser && currentUser.isMock)) {
      try {
        const updateData: any = {
          displayName: displayName.trim(),
          username: cleanUsername,
          avatarUrl: finalAvatar,
          preferredColor,
          shareBag
        };
        if (newPassword) {
          updateData.password = newPassword;
        }

        const res = await fetch(`/api/users/${currentUser.uid}/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateData)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update profile settings.");
        }

        // Update local mock user
        localStorage.setItem("vice_vault_mock_user", JSON.stringify(data));
        setSuccessMsg("Settings updated successfully!");
        
        setTimeout(() => {
          onProfileUpdate?.(data);
          onClose();
          setIsLoading(false);
        }, 1000);
        return;
      } catch (err: any) {
        setError(err.message || "Failed to update profile settings.");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: displayName,
          photoURL: finalAvatar
        });
        if (newPassword) {
          await updatePassword(auth.currentUser, newPassword);
        }
      }

      const updateData: any = {
        displayName: displayName.trim(),
        username: cleanUsername,
        avatarUrl: finalAvatar,
        preferredColor: preferredColor,
        shareBag
      };

      const res = await fetch(`/api/users/${currentUser.uid}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }

      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => {
        onProfileUpdate?.({
          uid: data.uid,
          email: data.email || currentUser.email,
          displayName: displayName,
          photoURL: finalAvatar,
          username: cleanUsername,
          preferredColor: preferredColor,
          role: data.role || userProfile?.role || "User",
          shareBag: data.shareBag,
          shareToken: data.shareToken
        });
        onClose();
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile settings.");
      setIsLoading(false);
    }
  };

  const activeAvatarUrl = selectedPreset;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            id="auth-modal-container"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-neutral-850">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse"></span>
              {tab === "signin" && "Golf Ball Vault Login"}
              {tab === "signup" && "Create Vault Account"}
              {tab === "settings" && "Profile Settings"}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              {tab === "settings" ? "Manage your profile details" : "Synchronize your golf bag across devices"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            id="auth-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector - Only show if not logged in */}
        {!currentUser && (
          <div className="flex bg-neutral-950 p-1 border-b border-neutral-850">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                tab === "signin" 
                  ? "bg-neutral-900 text-[#2563eb] font-bold" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                tab === "signup" 
                  ? "bg-neutral-900 text-[#2563eb] font-bold" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {/* Banner notification / error messaging */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-xs flex flex-col gap-1 font-mono">
              <span className="font-bold uppercase text-[10px]">Error occurred</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-mono">
              <Check size={14} className="text-emerald-400 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN TAB */}
          {tab === "signin" && !currentUser && (
            <form onSubmit={handleSignIn} className="space-y-4" id="signin-form">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Email or Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-550 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all font-mono"
                    placeholder="name@domain.com or username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                  >
                    {showPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2563eb] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#3b82f6] active:scale-98 transition-all cursor-pointer flex justify-center items-center gap-2 mt-6 shadow-lg shadow-[#2563eb]/10"
              >
                {isLoading ? (
                  <>
                     <RefreshCw className="animate-spin text-black" size={14} />
                     Authenticating...
                  </>
                ) : (
                  "Access Vault Account"
                )}
              </button>

              <p className="text-[10px] text-neutral-500 text-center mt-4 font-mono">
                No account? <button type="button" onClick={() => setTab("signup")} className="text-[#2563eb] underline hover:text-white cursor-pointer bg-transparent border-0 p-0">Create one now</button>
              </p>
            </form>
          )}

          {/* SIGN UP TAB */}
          {tab === "signup" && !currentUser && (
            <form onSubmit={handleSignUp} className="space-y-4" id="signup-form">
              {/* Real-time Preview Profile Header */}
              <div className="flex items-center gap-4 bg-neutral-950/40 border border-neutral-850 p-3 rounded-xl mb-4">
                <AvatarRenderer avatarUrl={activeAvatarUrl} name={displayName || "New User"} size="lg" color={preferredColor} />
                <div className="min-w-0">
                  <span className="text-white text-xs font-black block truncate">{displayName || "Display Name"}</span>
                  <span className="text-neutral-550 text-[10px] font-mono block truncate">
                    @{username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") : "username"}
                  </span>
                  <span className="text-[9px] text-[#2563eb] uppercase font-mono tracking-wider mt-0.5 block">Live Preview</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-550" size={12} />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-550 text-xs font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                      placeholder="johndoe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-550" size={12} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-555" size={12} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setTimeout(() => setPasswordFocused(false), 200)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-9 pr-9 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                  >
                    {showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  {passwordFocused && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-2xl space-y-1.5 font-mono text-[10px] text-left">
                      <div className="text-[9px] uppercase text-neutral-500 font-bold mb-1">Password Strength Checklist:</div>
                      <div className="flex items-center gap-2">
                        <span className={password.length >= 8 ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {password.length >= 8 ? "✓" : "○"}
                        </span>
                        <span className={password.length >= 8 ? "text-emerald-300" : "text-neutral-400"}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[A-Z]/.test(password) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[A-Z]/.test(password) ? "✓" : "○"}
                        </span>
                        <span className={/[A-Z]/.test(password) ? "text-emerald-300" : "text-neutral-400"}>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[a-z]/.test(password) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[a-z]/.test(password) ? "✓" : "○"}
                        </span>
                        <span className={/[a-z]/.test(password) ? "text-emerald-300" : "text-neutral-400"}>One lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[0-9]/.test(password) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[0-9]/.test(password) ? "✓" : "○"}
                        </span>
                        <span className={/[0-9]/.test(password) ? "text-emerald-300" : "text-neutral-400"}>One number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"}
                        </span>
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-emerald-300" : "text-neutral-400"}>One special character</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Verify Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-555" size={12} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-9 pr-9 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                    placeholder="Verify password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
              </div>
                    {/* Profile Picture / Avatar Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Profile Picture</label>
                <div className="flex items-center justify-between gap-1 bg-neutral-950 border border-neutral-850 px-2 py-2 rounded-xl">
                  {["preset-1", "preset-2", "preset-3", "preset-4", "preset-5", "preset-6", "preset-7", "preset-8"].map((presetId) => (
                    <button
                      key={presetId}
                      type="button"
                      onClick={() => setSelectedPreset(presetId)}
                      className="p-0.5 rounded-full relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 border"
                      style={{
                        boxShadow: selectedPreset === presetId ? `0 0 6px ${preferredColor}` : "none",
                        borderColor: selectedPreset === presetId ? "rgba(255,255,255,0.4)" : "transparent"
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: preferredColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <AvatarRenderer avatarUrl={presetId} name={displayName || "VV"} size="sm" color={preferredColor} />
                      </div>
                      {selectedPreset === presetId && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 border border-black shadow" style={{width:12,height:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <Check size={6} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-2">
                  Theme Accent Color
                </label>
                <div className="flex items-center justify-between gap-1.5 bg-neutral-950 border border-neutral-850 px-2.5 py-2 rounded-xl">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setPreferredColor(c.value)}
                      className="w-6 h-6 rounded-full border relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                      style={{ 
                        backgroundColor: c.value, 
                        borderColor: preferredColor.toLowerCase() === c.value.toLowerCase() ? "#ffffff" : "transparent",
                        boxShadow: preferredColor.toLowerCase() === c.value.toLowerCase() ? `0 0 10px ${c.value}` : "none" 
                      }}
                      title={c.name}
                    >
                      {preferredColor.toLowerCase() === c.value.toLowerCase() && (
                        <Check size={12} className={c.value === "#2563eb" || c.value === "#00e5ff" || c.value === "#00f5d4" ? "text-black font-black" : "text-white"} />
                      )}
                    </button>
                  ))}
                  {/* Custom Color Picker Button */}
                  {(() => {
                    const isPreset = ACCENT_COLORS.some(c => c.value.toLowerCase() === preferredColor.toLowerCase());
                    return (
                      <div 
                        className="w-6 h-6 rounded-full border relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 overflow-hidden"
                        style={{ 
                          backgroundColor: isPreset ? "#1e1e1e" : preferredColor,
                          borderColor: !isPreset ? "#ffffff" : "rgba(255,255,255,0.1)",
                          boxShadow: !isPreset ? `0 0 10px ${preferredColor}` : "none"
                        }}
                        title="Custom Color Picker"
                      >
                        <input 
                          type="color" 
                          value={isPreset ? "#2563eb" : preferredColor}
                          onChange={(e) => setPreferredColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        {isPreset ? (
                          <Palette size={12} className="text-neutral-400" />
                        ) : (
                          <Check size={12} className="text-black font-black" />
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2563eb] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#3b82f6] active:scale-98 transition-all cursor-pointer flex justify-center items-center gap-2 mt-6 shadow-lg shadow-[#2563eb]/10"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin text-black" size={14} />
                    Registering Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-[10px] text-neutral-500 text-center mt-4 font-mono">
                Already registered? <button type="button" onClick={() => setTab("signin")} className="text-[#2563eb] underline hover:text-white cursor-pointer bg-transparent border-0 p-0">Access your vault account</button>
              </p>
            </form>
          )}

          {/* PROFILE SETTINGS TAB */}
          {tab === "settings" && currentUser && (
            <form onSubmit={handleUpdateProfile} className="space-y-4" id="settings-form">
              {/* Real-time Preview Profile Header */}
              <div className="flex items-center gap-4 bg-neutral-950/40 border border-neutral-850 p-3 rounded-xl mb-4">
                <AvatarRenderer avatarUrl={activeAvatarUrl} name={displayName || "VV"} size="lg" color={preferredColor} />
                <div className="min-w-0 flex-1">
                  <span className="text-white text-xs font-black block truncate">{displayName || "Display Name"}</span>
                  <span className="text-neutral-550 text-[10px] font-mono block truncate">
                    @{username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") : "username"}
                  </span>
                  <span className="text-[9px] text-[#2563eb] uppercase font-mono tracking-wider mt-0.5 block">Live Preview</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-550" size={12} />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-555 text-xs font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                      placeholder="johndoe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Email Address (Uneditable)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" size={12} />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ""}
                    className="w-full bg-neutral-950/50 border border-neutral-900 rounded-xl py-2 pl-9 pr-3 text-xs text-neutral-500 cursor-not-allowed font-mono opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-555" size={12} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setNewPasswordFocused(true)}
                    onBlur={() => setTimeout(() => setNewPasswordFocused(false), 200)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 pl-9 pr-9 text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-[#2563eb] transition-all font-mono"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                  >
                    {showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  {newPasswordFocused && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-2xl space-y-1.5 font-mono text-[10px] text-left">
                      <div className="text-[9px] uppercase text-neutral-500 font-bold mb-1">Password Strength Checklist:</div>
                      <div className="flex items-center gap-2">
                        <span className={newPassword.length >= 8 ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {newPassword.length >= 8 ? "✓" : "○"}
                        </span>
                        <span className={newPassword.length >= 8 ? "text-emerald-300" : "text-neutral-400"}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[A-Z]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[A-Z]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[A-Z]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[a-z]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[a-z]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[a-z]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>One lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[0-9]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[0-9]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[0-9]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>One number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>One special character</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm New Password — always visible */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-555" size={12} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className={`w-full bg-neutral-950 border rounded-xl py-2 pl-9 pr-[60px] text-xs focus:outline-none focus:border-[#2563eb] transition-all font-mono ${
                      newPasswordConfirm && newPassword && newPassword !== newPasswordConfirm
                        ? "border-red-600 text-red-400"
                        : newPasswordConfirm && newPassword && newPassword === newPasswordConfirm
                        ? "border-emerald-600 text-white"
                        : "border-neutral-850 text-neutral-500"
                    }`}
                    placeholder="Re-enter new password to confirm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  {newPasswordConfirm && newPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold">
                      {newPassword === newPasswordConfirm
                        ? <span className="text-emerald-400">✓</span>
                        : <span className="text-red-500">✗</span>
                      }
                    </div>
                  )}
                </div>
                {newPasswordConfirm && newPassword && newPassword !== newPasswordConfirm && (
                  <span className="text-[9px] text-red-500 mt-1 block font-mono">Passwords do not match</span>
                )}
              </div>

              {/* Profile Picture / Avatar Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Profile Picture</label>
                <div className="flex items-center justify-between gap-1 bg-neutral-950 border border-neutral-850 px-2 py-2 rounded-xl">
                  {["preset-1", "preset-2", "preset-3", "preset-4", "preset-5", "preset-6", "preset-7", "preset-8"].map((presetId) => (
                    <button
                      key={presetId}
                      type="button"
                      onClick={() => setSelectedPreset(presetId)}
                      className="p-0.5 rounded-full relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 border"
                      style={{
                        boxShadow: selectedPreset === presetId ? `0 0 6px ${preferredColor}` : "none",
                        borderColor: selectedPreset === presetId ? "rgba(255,255,255,0.4)" : "transparent"
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: preferredColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <AvatarRenderer avatarUrl={presetId} name={displayName || "VV"} size="sm" color={preferredColor} />
                      </div>
                      {selectedPreset === presetId && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 border border-black shadow" style={{width:12,height:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <Check size={6} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locker Sharing Section */}
              <div className="bg-neutral-950/30 border border-neutral-850 p-3.5 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Share your bag</span>
                    <span className="text-neutral-550 text-[10px] block mt-0.5">Allow others to view your golf bag</span>
                  </div>
                  
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={shareBag} 
                      onChange={(e) => setShareBag(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-neutral-400 peer-checked:after:bg-black after:border-neutral-800 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                {shareBag ? (
                  <div className="space-y-2 pt-1 border-t border-neutral-900/60">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Your Public Share Link</span>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-neutral-950 border border-neutral-850 rounded-lg p-2 text-[10.5px] text-neutral-300 truncate select-all flex items-center gap-1.5 font-mono">
                        <LinkIcon size={12} className="text-[#2563eb] shrink-0" />
                        <span>{window.location.origin}/?share={userProfile?.shareToken || currentUser?.shareToken || ""}</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const link = `${window.location.origin}/?share=${userProfile?.shareToken || currentUser?.shareToken || ""}`;
                          try {
                            await navigator.clipboard.writeText(link);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch (err) {
                            console.error("Failed to copy link:", err);
                          }
                        }}
                        className={`p-2 border rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                          copied
                            ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                            : "bg-neutral-900 hover:bg-[#2563eb] hover:text-black border-neutral-850 hover:border-transparent text-neutral-400"
                        }`}
                        title={copied ? "Copied!" : "Copy Share Link"}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-neutral-550 italic pt-1 border-t border-neutral-900/60">
                    Sharing is currently disabled. Toggle on to generate a public viewer link.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-2">
                  Theme Accent Color
                </label>
                <div className="flex items-center justify-between gap-1 bg-neutral-950 border border-neutral-850 px-2.5 py-2 rounded-xl">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setPreferredColor(c.value)}
                      className="w-6 h-6 rounded-full border relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                      style={{ 
                        backgroundColor: c.value, 
                        borderColor: preferredColor.toLowerCase() === c.value.toLowerCase() ? "#ffffff" : "transparent",
                        boxShadow: preferredColor.toLowerCase() === c.value.toLowerCase() ? `0 0 10px ${c.value}` : "none" 
                      }}
                      title={c.name}
                    >
                      {preferredColor.toLowerCase() === c.value.toLowerCase() && (
                        <Check size={12} className={c.value === "#2563eb" || c.value === "#00e5ff" || c.value === "#00f5d4" ? "text-black font-black" : "text-white"} />
                      )}
                    </button>
                  ))}
                  {/* Custom Color Picker Button */}
                  {(() => {
                    const isPreset = ACCENT_COLORS.some(c => c.value.toLowerCase() === preferredColor.toLowerCase());
                    return (
                      <div 
                        className="w-6 h-6 rounded-full border relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 overflow-hidden"
                        style={{ 
                          backgroundColor: isPreset ? "#1e1e1e" : preferredColor,
                          borderColor: !isPreset ? "#ffffff" : "rgba(255,255,255,0.1)",
                          boxShadow: !isPreset ? `0 0 10px ${preferredColor}` : "none"
                        }}
                        title="Custom Color Picker"
                      >
                        <input 
                          type="color" 
                          value={isPreset ? "#2563eb" : preferredColor}
                          onChange={(e) => setPreferredColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        {isPreset ? (
                          <Palette size={12} className="text-neutral-400" />
                        ) : (
                          <Check size={12} className="text-black font-black" />
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2563eb] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#3b82f6] active:scale-98 transition-all cursor-pointer flex justify-center items-center gap-2 mt-6 shadow-lg shadow-[#2563eb]/10"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin text-black" size={14} />
                    Saving Changes...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>

    </div>
    )}
  </AnimatePresence>
  );
}
