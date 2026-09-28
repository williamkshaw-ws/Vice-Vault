import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { GolfRound } from "../components/RoundTrackerModal";
import { getAuthHeaders } from "../utils/authHeaders";
import { isFirebaseConfigured, db, auth } from "../firebase";

const ACTIVE_ROUND_STORAGE_KEY = "golf_ball_vault_active_round";
const ROUND_HISTORY_STORAGE_KEY = "golf_ball_vault_round_history";
const LEGACY_ACTIVE_KEY = "vice_vault_active_round";
const LEGACY_HISTORY_KEY = "vice_vault_round_history";

function cleanSanitizedJson<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return data;
  }
}

function getStoredActiveRound(candidateIds: string[] = []): GolfRound | null {
  // If user is logged in, check ONLY user-scoped candidate keys
  if (candidateIds && candidateIds.length > 0) {
    for (const id of candidateIds) {
      const keys = [`${ACTIVE_ROUND_STORAGE_KEY}_${id}`, `${LEGACY_ACTIVE_KEY}_${id}`];
      for (const k of keys) {
        try {
          const saved = localStorage.getItem(k);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object" && parsed.id) return parsed;
          }
        } catch (e) {}
      }
    }
    // Never fall back to unscoped global keys when candidate IDs exist
    return null;
  }

  // Only check guest keys if unauthenticated (candidateIds is empty)
  for (const k of [ACTIVE_ROUND_STORAGE_KEY, LEGACY_ACTIVE_KEY]) {
    try {
      const saved = localStorage.getItem(k);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.id) return parsed;
      }
    } catch (e) {}
  }
  return null;
}

function getStoredHistory(candidateIds: string[] = []): GolfRound[] {
  if (candidateIds && candidateIds.length > 0) {
    for (const id of candidateIds) {
      const keys = [`${ROUND_HISTORY_STORAGE_KEY}_${id}`, `${LEGACY_HISTORY_KEY}_${id}`];
      for (const k of keys) {
        try {
          const saved = localStorage.getItem(k);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch (e) {}
      }
    }
    return [];
  }

  for (const k of [ROUND_HISTORY_STORAGE_KEY, LEGACY_HISTORY_KEY]) {
    try {
      const saved = localStorage.getItem(k);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }
  return [];
}

export function useRoundTracker(currentUser: any, userProfile?: any) {
  const targetUid = userProfile?.uid || currentUser?.uid || currentUser?.id;

  const isAdminUser = useMemo(() => {
    const role = (userProfile?.role || currentUser?.role || "").toLowerCase();
    const username = (userProfile?.username || currentUser?.username || "").toLowerCase();
    return role === "admin" || username === "admin";
  }, [userProfile?.role, userProfile?.username, currentUser?.role, currentUser?.username]);

  const candidateUids = useMemo(() => {
    if (!targetUid) return [];
    const ids = [
      targetUid,
      userProfile?.uid,
      currentUser?.uid,
      currentUser?.id,
      userProfile?.username ? `u-${userProfile.username.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : null,
      currentUser?.displayName ? `u-${currentUser.displayName.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : null,
      currentUser?.email ? `u-${currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')}` : null,
      isAdminUser ? "u-admin" : null
    ].filter(Boolean) as string[];
    return Array.from(new Set(ids));
  }, [targetUid, userProfile?.uid, userProfile?.username, currentUser?.uid, currentUser?.id, currentUser?.displayName, currentUser?.email, isAdminUser]);

  const [activeRound, setActiveRoundState] = useState<GolfRound | null>(() => getStoredActiveRound(candidateUids));
  const [roundHistory, setRoundHistoryState] = useState<GolfRound[]>(() => getStoredHistory(candidateUids));
  const [isCloudRoundsLoaded, setIsCloudRoundsLoaded] = useState(false);

  // References to keep track of latest values for debounce and immediate updates
  const activeRoundRef = useRef<GolfRound | null>(activeRound);
  activeRoundRef.current = activeRound;
  const roundHistoryRef = useRef<GolfRound[]>(roundHistory);
  roundHistoryRef.current = roundHistory;

  const syncTimeoutRef = useRef<any>(null);
  const prevUserRef = useRef<string | null>(targetUid || null);

  // Helper to persist locally
  const persistLocally = useCallback((newActive: GolfRound | null, newHistory: GolfRound[], uids: string[] = []) => {
    try {
      const allUids = Array.from(new Set([...uids, targetUid].filter(Boolean))) as string[];
      
      if (allUids.length > 0) {
        // User is logged in: save ONLY under user-scoped keys
        for (const u of allUids) {
          if (newActive) {
            localStorage.setItem(`${ACTIVE_ROUND_STORAGE_KEY}_${u}`, JSON.stringify(newActive));
            localStorage.setItem(`${LEGACY_ACTIVE_KEY}_${u}`, JSON.stringify(newActive));
          } else {
            localStorage.removeItem(`${ACTIVE_ROUND_STORAGE_KEY}_${u}`);
            localStorage.removeItem(`${LEGACY_ACTIVE_KEY}_${u}`);
          }

          localStorage.setItem(`${ROUND_HISTORY_STORAGE_KEY}_${u}`, JSON.stringify(newHistory));
          localStorage.setItem(`${LEGACY_HISTORY_KEY}_${u}`, JSON.stringify(newHistory));
        }
        // Remove unscoped keys so they do not leak into guest mode or other users
        localStorage.removeItem(ACTIVE_ROUND_STORAGE_KEY);
        localStorage.removeItem(LEGACY_ACTIVE_KEY);
      } else {
        // Guest mode
        if (newActive) {
          localStorage.setItem(ACTIVE_ROUND_STORAGE_KEY, JSON.stringify(newActive));
          localStorage.setItem(LEGACY_ACTIVE_KEY, JSON.stringify(newActive));
        } else {
          localStorage.removeItem(ACTIVE_ROUND_STORAGE_KEY);
          localStorage.removeItem(LEGACY_ACTIVE_KEY);
        }

        localStorage.setItem(ROUND_HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
        localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(newHistory));
      }
    } catch (e) {
      console.warn("Error persisting rounds to localStorage:", e);
    }
  }, [targetUid]);

  // Sync to Cloud (Firestore + Server API)
  const syncToCloud = useCallback(async (newActive: GolfRound | null, newHistory: GolfRound[]) => {
    if (!targetUid && candidateUids.length === 0) return;
    const primaryUid = targetUid || candidateUids[0];

    const cleanActive = newActive ? cleanSanitizedJson(newActive) : null;
    const cleanHistory = newHistory ? cleanSanitizedJson(newHistory) : [];

    // 1. Direct Firestore write if configured
    if (isFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        const docRef = doc(db, "users", primaryUid, "data", "rounds");
        await setDoc(docRef, {
          activeRound: cleanActive,
          roundHistory: cleanHistory,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // If targetUid differs from auth UID, also mirror to auth UID
        if (currentUser?.uid && currentUser.uid !== primaryUid) {
          const authDocRef = doc(db, "users", currentUser.uid, "data", "rounds");
          setDoc(authDocRef, {
            activeRound: cleanActive,
            roundHistory: cleanHistory,
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        }
      } catch (fsErr) {
        console.warn("Direct Firestore round sync failed, fallback to server API:", fsErr);
      }
    }

    // 2. Server API write
    try {
      const headers = await getAuthHeaders({ "Content-Type": "application/json" });
      await fetch(`/api/users/${primaryUid}/rounds`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          activeRound: cleanActive,
          roundHistory: cleanHistory
        })
      });
    } catch (apiErr) {
      console.warn("Server API round sync failed:", apiErr);
    }
  }, [targetUid, candidateUids, currentUser?.uid]);

  // Debounced cloud sync
  const scheduleCloudSync = useCallback((newActive: GolfRound | null, newHistory: GolfRound[]) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToCloud(newActive, newHistory);
    }, 250);
  }, [syncToCloud]);

  // Set active round (called from anywhere in the app)
  const setActiveRound = useCallback((updater: GolfRound | null | ((prev: GolfRound | null) => GolfRound | null)) => {
    setActiveRoundState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const wasStartingOrClearing = (next === null) || (!activeRoundRef.current && next !== null);
      activeRoundRef.current = next;
      persistLocally(next, roundHistoryRef.current, candidateUids);
      
      if (targetUid || candidateUids.length > 0) {
        if (wasStartingOrClearing) {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncToCloud(next, roundHistoryRef.current);
        } else {
          scheduleCloudSync(next, roundHistoryRef.current);
        }
      }
      return next;
    });
  }, [persistLocally, scheduleCloudSync, syncToCloud, targetUid, candidateUids]);

  // Save history (called when round completed or deleted)
  const saveRoundHistory = useCallback((newHistory: GolfRound[]) => {
    roundHistoryRef.current = newHistory;
    setRoundHistoryState(newHistory);
    persistLocally(activeRoundRef.current, newHistory, candidateUids);
    if (targetUid || candidateUids.length > 0) {
      if (activeRoundRef.current === null) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncToCloud(activeRoundRef.current, newHistory);
      } else {
        scheduleCloudSync(activeRoundRef.current, newHistory);
      }
    }
  }, [persistLocally, scheduleCloudSync, syncToCloud, targetUid, candidateUids]);

  // Fetch rounds from cloud (Server API + Direct Firestore fallback)
  const fetchRoundsFromCloud = useCallback(async () => {
    if (!targetUid && candidateUids.length === 0) return;

    try {
      let cloudActive: GolfRound | null = null;
      let cloudHistory: GolfRound[] | null = null;
      let fetched = false;

      // 1. Try server API across candidate UIDs
      const headers = await getAuthHeaders();
      for (const uid of candidateUids) {
        try {
          const res = await fetch(`/api/users/${uid}/rounds`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.hasData || data.activeRound) {
              cloudActive = data.activeRound ?? null;
              cloudHistory = Array.isArray(data.roundHistory) ? data.roundHistory : [];
              fetched = true;
              break;
            }
          }
        } catch (err) {}
      }

      // 2. Fallback to direct Firestore across candidate UIDs
      if (!fetched && isFirebaseConfigured && db) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          for (const uid of candidateUids) {
            const snap = await getDoc(doc(db, "users", uid, "data", "rounds"));
            if (snap.exists()) {
              const data = snap.data();
              if (data && (data.activeRound !== undefined || data.roundHistory !== undefined)) {
                cloudActive = data.activeRound ?? null;
                cloudHistory = Array.isArray(data.roundHistory) ? data.roundHistory : [];
                fetched = true;
                break;
              }
            }
          }
        } catch (e) {}
      }

      if (fetched) {
        activeRoundRef.current = cloudActive;
        roundHistoryRef.current = cloudHistory || [];
        setActiveRoundState(cloudActive);
        setRoundHistoryState(cloudHistory || []);
        persistLocally(cloudActive, cloudHistory || [], candidateUids);
      } else {
        // If server had no data and this user had a locally cached round SPECIFICALLY for their own UID, sync up
        const cachedForThisUser = getStoredActiveRound(candidateUids);
        if (cachedForThisUser) {
          syncToCloud(cachedForThisUser, roundHistoryRef.current);
        }
      }
    } catch (e) {
      console.warn("Failed fetching rounds from cloud:", e);
    } finally {
      setIsCloudRoundsLoaded(true);
    }
  }, [targetUid, candidateUids, persistLocally, syncToCloud]);

  // Effect on authentication: load local cache, fetch cloud, and listen to Firestore real-time
  useEffect(() => {
    const currentPrimary = targetUid || null;
    const isUserSwitch = prevUserRef.current !== null && currentPrimary !== null && prevUserRef.current !== currentPrimary;
    const isLogout = prevUserRef.current !== null && currentPrimary === null;
    prevUserRef.current = currentPrimary;

    // On user switch or sign out, immediately reset round state to prevent data bleed
    if (isUserSwitch || isLogout) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      activeRoundRef.current = null;
      roundHistoryRef.current = [];
      setActiveRoundState(null);
      setRoundHistoryState([]);
      if (isLogout) {
        try {
          localStorage.removeItem(ACTIVE_ROUND_STORAGE_KEY);
          localStorage.removeItem(LEGACY_ACTIVE_KEY);
        } catch (e) {}
      }
    }

    if (!targetUid && candidateUids.length === 0) {
      // Guest mode
      const guestActive = isLogout ? null : getStoredActiveRound([]);
      const guestHistory = isLogout ? [] : getStoredHistory([]);
      activeRoundRef.current = guestActive;
      roundHistoryRef.current = guestHistory;
      setActiveRoundState(guestActive);
      setRoundHistoryState(guestHistory);
      setIsCloudRoundsLoaded(true);
      return;
    }

    // 1. Immediately hydrate from local user cache for THIS user only
    const userActive = getStoredActiveRound(candidateUids);
    const userHistory = getStoredHistory(candidateUids);
    activeRoundRef.current = userActive;
    roundHistoryRef.current = userHistory;
    setActiveRoundState(userActive);
    setRoundHistoryState(userHistory);

    // 2. Fetch from cloud
    fetchRoundsFromCloud();

    // 3. Set up real-time listener via Firestore
    const unsubList: (() => void)[] = [];
    let isCancelled = false;

    if (isFirebaseConfigured && db) {
      (async () => {
        try {
          const { doc, onSnapshot } = await import("firebase/firestore");
          const uidsToWatch = Array.from(new Set([targetUid, currentUser?.uid])).filter(Boolean) as string[];

          for (const uid of uidsToWatch) {
            const docRef = doc(db, "users", uid, "data", "rounds");
            if (isCancelled) return;
            const unsub = onSnapshot(docRef, (snapshot) => {
              if (snapshot.metadata.hasPendingWrites) return;

              if (snapshot.exists()) {
                const data = snapshot.data();
                if (data) {
                  const incomingActive = data.activeRound !== undefined ? data.activeRound : null;
                  const incomingHistory = Array.isArray(data.roundHistory) ? data.roundHistory : [];
                  activeRoundRef.current = incomingActive;
                  roundHistoryRef.current = incomingHistory;
                  setActiveRoundState(incomingActive);
                  setRoundHistoryState(incomingHistory);
                  persistLocally(incomingActive, incomingHistory, candidateUids);
                }
              }
            }, (err) => {
              console.warn("Firestore rounds onSnapshot warning:", err);
            });
            unsubList.push(unsub);
          }
        } catch (e) {
          console.warn("Could not set up rounds onSnapshot listener:", e);
        }
      })();
    }

    // 4. Listen for auth state transitions
    let unsubAuth: (() => void) | null = null;
    if (auth) {
      unsubAuth = auth.onAuthStateChanged((user) => {
        if (user) {
          fetchRoundsFromCloud();
        }
      });
    }

    // 5. Also listen for window focus / visibility change
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        fetchRoundsFromCloud();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      isCancelled = true;
      unsubList.forEach(fn => fn());
      if (unsubAuth) unsubAuth();
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [targetUid, candidateUids, currentUser?.uid, userProfile?.uid, fetchRoundsFromCloud, persistLocally]);

  return {
    activeRound,
    setActiveRound,
    roundHistory,
    saveRoundHistory,
    isCloudRoundsLoaded
  };
}
