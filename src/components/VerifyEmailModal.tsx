/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { nativeHaptics } from "../utils/native";
import { auth } from "../firebase";
import { applyActionCode, checkActionCode } from "firebase/auth";

interface VerifyEmailModalProps {
  isOpen: boolean;
  code: string;
  onClose: () => void;
  onSuccess: (email?: string) => void;
}

export default function VerifyEmailModal({
  isOpen,
  code,
  onClose,
  onSuccess
}: VerifyEmailModalProps) {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!code) {
      setStatus("error");
      setErrorMessage("No verification code found in this link. Please request a new one.");
      return;
    }

    const verifyCode = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let targetEmail = urlParams.get("email") || "";

        if (code.startsWith("verify.")) {
          // Token-based verification
          const res = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: code, email: targetEmail || undefined })
          });
          const data = await res.json();
          if (isMounted) {
            if (data.success) {
              setVerifiedEmail(data.email || targetEmail || "");
              setStatus("success");
              nativeHaptics.notificationSuccess();
            } else {
              setStatus("error");
              setErrorMessage(data.error || "This email verification link has expired or is invalid.");
              nativeHaptics.notificationWarning();
            }
          }
          return;
        }

        // Firebase Auth Action Code verification
        if (!auth) {
          throw new Error("Authentication service is unavailable.");
        }

        // 1. Try resolving email from action code info if not in URL params
        try {
          const actionInfo = await checkActionCode(auth, code);
          if (actionInfo?.data?.email) {
            targetEmail = actionInfo.data.email;
          }
        } catch (checkErr) {
          console.warn("checkActionCode skipped or failed:", checkErr);
        }

        // 2. Apply action code in Firebase Auth
        await applyActionCode(auth, code);

        // 3. Reload current user if active session exists
        if (auth.currentUser) {
          try {
            await auth.currentUser.reload();
            if (auth.currentUser.email) {
              targetEmail = auth.currentUser.email;
            }
          } catch (rErr) {}
        }

        // 4. Sync verification state to backend database so the account is fully verified in one step
        try {
          const syncRes = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: targetEmail || auth.currentUser?.email })
          });
          const syncData = await syncRes.json();
          if (syncData?.email) {
            targetEmail = syncData.email;
          }
        } catch (syncErr) {
          console.warn("Backend email verification sync skipped:", syncErr);
        }

        if (isMounted) {
          setVerifiedEmail(targetEmail || auth.currentUser?.email || "");
          setStatus("success");
          nativeHaptics.notificationSuccess();
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Email verification error:", err);
          setStatus("error");
          if (err.code === "auth/expired-action-code") {
            setErrorMessage("This verification link has expired. Please request a new verification email from Profile Settings.");
          } else if (err.code === "auth/invalid-action-code") {
            setErrorMessage("This verification link is invalid or has already been used.");
          } else {
            setErrorMessage(err.message || "Failed to verify email address.");
          }
          nativeHaptics.notificationWarning();
        }
      }
    };

    verifyCode();
    return () => {
      isMounted = false;
    };
  }, [code]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-neutral-900 border border-neutral-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-neutral-850">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Golf Ball Vault
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Account Email Verification
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {status === "verifying" && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <RefreshCw size={36} className="text-emerald-400 animate-spin" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Verifying Email Address
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Confirming your verification code...
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Email Verified!
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                    {verifiedEmail ? (
                      <>
                        <span className="font-mono text-emerald-400 font-bold">{verifiedEmail}</span> has been successfully verified.
                      </>
                    ) : (
                      "Your email address has been successfully verified."
                    )}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                    Your account recovery and locker data are fully secured.
                  </p>
                </div>

                <div className="w-full pt-2">
                  <button
                    onClick={() => {
                      nativeHaptics.impactLight();
                      onSuccess(verifiedEmail);
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Continue to Vault
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle size={30} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Verification Failed
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-mono">
                    {errorMessage || "This verification link is invalid or has expired."}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2 font-mono">
                    You can request a new verification email anytime in Profile Settings.
                  </p>
                </div>

                <div className="w-full pt-2">
                  <button
                    onClick={() => {
                      nativeHaptics.impactLight();
                      onClose();
                    }}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
