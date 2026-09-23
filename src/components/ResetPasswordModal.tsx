/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Check, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { isStrongPassword } from "../utils";
import { nativeHaptics } from "../utils/native";
import { auth } from "../firebase";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

interface ResetPasswordModalProps {
  isOpen: boolean;
  oobCode: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function ResetPasswordModal({
  isOpen,
  oobCode,
  onClose,
  onSuccess
}: ResetPasswordModalProps) {
  const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success" | "error">("verifying");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Verify the oobCode upon modal mount
  useEffect(() => {
    let isMounted = true;
    if (!oobCode) {
      setStatus("error");
      setErrorMessage("No password reset code found in this link. Please request a new link.");
      return;
    }

    const checkCode = async () => {
      try {
        if (oobCode.startsWith("reset.")) {
          const res = await fetch("/api/auth/verify-reset-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: oobCode })
          });
          const data = await res.json();
          if (isMounted) {
            if (data.success && data.email) {
              setEmail(data.email);
              setStatus("ready");
            } else {
              setStatus("error");
              setErrorMessage(data.error || "This password reset link has expired or is invalid.");
            }
          }
          return;
        }

        if (!auth) {
          throw new Error("Authentication service is unavailable.");
        }
        const resolvedEmail = await verifyPasswordResetCode(auth, oobCode);
        if (isMounted) {
          setEmail(resolvedEmail);
          setStatus("ready");
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Password reset code verification failed:", err);
          setStatus("error");
          if (err.code === "auth/expired-action-code") {
            setErrorMessage("This password reset link has expired. Password reset links are valid for 1 hour.");
          } else if (err.code === "auth/invalid-action-code") {
            setErrorMessage("This password reset link is invalid or has already been used. Please request a new one.");
          } else {
            setErrorMessage(err.message || "Failed to verify password reset code.");
          }
        }
      }
    };

    checkCode();
    return () => {
      isMounted = false;
    };
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      nativeHaptics.notificationWarning();
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setErrorMessage("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.");
      nativeHaptics.notificationWarning();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your new password.");
      nativeHaptics.notificationWarning();
      return;
    }

    setStatus("submitting");
    nativeHaptics.impactLight();

    try {
      if (oobCode.startsWith("reset.")) {
        // Backend token-based reset
        const res = await fetch("/api/auth/reset-password-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: oobCode, newPassword })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to reset password.");
        }
        nativeHaptics.notificationSuccess();
        setStatus("success");
        return;
      }

      if (!auth) {
        throw new Error("Authentication service is unavailable.");
      }

      // 1. Confirm reset in Firebase Auth
      await confirmPasswordReset(auth, oobCode, newPassword);

      // 2. Sync updated password hash to backend database
      try {
        await fetch("/api/auth/reset-password-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword })
        });
      } catch (syncErr) {
        console.warn("Backend password sync skipped:", syncErr);
      }

      nativeHaptics.notificationSuccess();
      setStatus("success");
    } catch (err: any) {
      console.error("Password reset confirmation error:", err);
      setStatus("ready");
      if (err.code === "auth/expired-action-code") {
        setErrorMessage("This password reset link has expired. Please request a new link.");
      } else if (err.code === "auth/invalid-action-code") {
        setErrorMessage("This reset link is invalid or has already been used.");
      } else {
        setErrorMessage(err.message || "Failed to update password. Please try again.");
      }
      nativeHaptics.notificationWarning();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-neutral-850">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
                Golf Ball Vault
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                {status === "success" 
                  ? "Password reset complete"
                  : email 
                  ? `Choose a new password for ${email}` 
                  : "Account Password Recovery"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            {/* 1. Loading / Verifying State */}
            {status === "verifying" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 font-mono">
                <RefreshCw size={28} className="text-accent animate-spin" />
                <p className="text-sm text-neutral-300 font-bold uppercase tracking-wider">
                  Verifying reset link...
                </p>
                <p className="text-xs text-neutral-500">
                  Connecting to Golf Ball Vault authentication service
                </p>
              </div>
            )}

            {/* 2. Error State */}
            {status === "error" && (
              <div className="space-y-5">
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-xs font-mono flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold uppercase text-[11px] block text-red-300">Link Invalid or Expired</span>
                    <p className="text-red-300/90 leading-relaxed">
                      {errorMessage || "This password reset link is invalid or has expired."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer font-mono"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* 3. Ready / Submitting State */}
            {(status === "ready" || status === "submitting") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setTimeout(() => setPasswordFocused(false), 200)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2.5 pl-10 pr-10 text-sm sm:text-xs text-white placeholder-neutral-555 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                    >
                      {showPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>

                  {/* Password Strength Checklist */}
                  {passwordFocused && (
                    <div className="mt-2 bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1.5 font-mono text-[10px]">
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
                        <span className={/[A-Z]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>At least one uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[a-z]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[a-z]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[a-z]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>At least one lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[0-9]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[0-9]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[0-9]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>At least one number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                          {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"}
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-300" : "text-neutral-400"}>At least one special character</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password (Verify Field) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-mono uppercase text-neutral-400">Verify New Password</label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-mono ${newPassword === confirmPassword ? "text-emerald-400" : "text-amber-400"}`}>
                        {newPassword === confirmPassword ? "✓ Passwords match" : "✕ Must match"}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className={`w-full bg-neutral-950 border rounded-xl py-2.5 pl-10 pr-10 text-sm sm:text-xs text-white placeholder-neutral-555 focus:outline-none transition-all font-mono ${
                        confirmPassword && newPassword !== confirmPassword 
                          ? "border-amber-500 focus:border-amber-500" 
                          : "border-neutral-850 focus:border-accent focus:ring-1 focus:ring-accent"
                      }`}
                      placeholder="Re-enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting" || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
                  className="w-full py-3 bg-accent text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#3b82f6] active:scale-98 transition-all cursor-pointer flex justify-center items-center gap-2 mt-6 shadow-lg shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <>
                      <RefreshCw className="animate-spin text-black" size={14} />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            )}

            {/* 4. Success State */}
            {status === "success" && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 font-mono">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Password Updated</h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Your password for <span className="text-white font-bold">{email}</span> has been securely changed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSuccess(email)}
                  className="w-full py-3 bg-accent text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#3b82f6] active:scale-98 transition-all cursor-pointer mt-2"
                >
                  Sign In to Golf Ball Vault
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
