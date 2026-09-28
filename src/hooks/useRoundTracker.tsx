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
  const keys: string[] = [];
  for (const id of candidateIds) {
    keys.push(`${ACTIVE_ROUND_STORAGE_KEY}_${id}`, `${LEGACY_ACTIVE_KEY}_${id}`);
  }
  keys.push(ACTIVE_ROUND_STORAGE_KEY, LEGACY_ACTIVE_KEY);

  for (const k of keys) {
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
  const keys: string[] = [];
  for (const id of candidateIds) {
    keys.push(`${ROUND_HISTORY_STORAGE_KEY}_${id}`, `${LEGACY_HISTORY_KEY}_${id}`);
  }
  keys.push(ROUND_HISTORY_STORAGE_KEY, LEGACY_HISTORY_KEY);

  for (const k of keys) {
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

  const candidateUids = useMemo(() => {
    const ids = [
      targetUid,
      userProfile?.uid,
      currentUser?.uid,
      currentUser?.id,
      userProfile?.username ? `u-${userProfile.username.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : null,
      currentUser?.displayName ? `u-${currentUser.displayName.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : null,
      currentUser?.email ? `u-${currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')}` : null,
      "u-admin"
    ].filter(Boolean) as string[];
    return Array.from(new Set(ids));
  }, [targetUid, userProfile?.uid, userProfile?.username, currentUser?.uid, currentUser?.id, currentUser?.displayName, currentUser?.email]);

  const [activeRound, setActiveRoundState] = useState<GolfRound | null>(() => getStoredActiveRound(candidateUids));
  const [roundHistory, setRoundHistoryState] = useState<GolfRound[]>(() => getStoredHistory(candidateUids));
  const [isCloudRoundsLoaded, setIsCloudRoundsLoaded] = useState(false);

  // References to keep track of latest values for debounce and immediate updates
  const activeRoundRef = useRef<GolfRound | null>(activeRound);
  activeRoundRef.current = activeRound;
  const roundHistoryRef = useRef<GolfRound[]>(roundHistory);
  roundHistoryRef.current = roundHistory;

  const syncTimeoutRef = useRef<any>(null);

  // Helper to persist locally
  const persistLocally = useCallback((newActive: GolfRound | null, newHistory: GolfRound[], uids: string[] = []) => {
    try {
      const allUids = Array.from(new Set([...uids, targetUid].filter(Boolean))) as string[];
      if (newActive) {
        localStorage.setItem(ACTIVE_ROUND_STORAGE_KEY, JSON.stringify(newActive));
        localStorage.setItem(LEGACY_ACTIVE_KEY, JSON.stringify(newActive));
        for (const u of allUids) {
          localStorage.setItem(`${ACTIVE_ROUND_STORAGE_KEY}_${u}`, JSON.stringify(newActive));
          localStorage.setItem(`${LEGACY_ACTIVE_KEY}_${u}`, JSON.stringify(newActive));
        }
      } else {
        localStorage.removeItem(ACTIVE_ROUND_STORAGE_KEY);
        localStorage.removeItem(LEGACY_ACTIVE_KEY);
        for (const u of allUids) {
          localStorage.removeItem(`${ACTIVE_ROUND_STORAGE_KEY}_${u}`);
          localStorage.removeItem(`${LEGACY_ACTIVE_KEY}_${u}`);
        }
      }

      localStorage.setItem(ROUND_HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(newHistory));
      for (const u of allUids) {
        localStorage.setItem(`${ROUND_HISTORY_STORAGE_KEY}_${u}`, JSON.stringify(newHistory));
        localStorage.setItem(`${LEGACY_HISTORY_KEY}_${u}`, JSON.stringify(newHistory));
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

        // If targetUid differs from auth UID, also mirror to auth UID so rules pass under all circumstances
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
        setActiveRoundState(cloudActive);
        setRoundHistoryState(cloudHistory || []);
        persistLocally(cloudActive, cloudHistory || [], candidateUids);
      } else {
        // If server had no data but we had locally cached data for this user, sync local up to server
        if (activeRoundRef.current || (roundHistoryRef.current && roundHistoryRef.current.length > 0)) {
          syncToCloud(activeRoundRef.current, roundHistoryRef.current);
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
    if (!targetUid && candidateUids.length === 0) {
      // Guest mode
      setActiveRoundState(getStoredActiveRound([]));
      setRoundHistoryState(getStoredHistory([]));
      setIsCloudRoundsLoaded(true);
      return;
    }

    // 1. Immediately hydrate from local user cache
    const cachedActive = getStoredActiveRound(candidateUids);
    const cachedHistory = getStoredHistory(candidateUids);
    if (cachedActive) {
      setActiveRoundState(cachedActive);
    }
    if (cachedHistory && cachedHistory.length > 0) {
      setRoundHistoryState(cachedHistory);
    }

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
                  if (data.activeRound !== undefined) {
                    setActiveRoundState(data.activeRound ?? null);
                  }
                  if (Array.isArray(data.roundHistory)) {
                    setRoundHistoryState(data.roundHistory);
                  }
                  persistLocally(data.activeRound ?? null, Array.isArray(data.roundHistory) ? data.roundHistory : [], candidateUids);
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

    // 4. Listen for auth state transitions (e.g. Firebase Auth token becoming ready)
    let unsubAuth: (() => void) | null = null;
    if (auth) {
      unsubAuth = auth.onAuthStateChanged((user) => {
        if (user) {
          fetchRoundsFromCloud();
        }
      });
    }

    // 5. Also listen for window focus / visibility change to guarantee fresh state when switching devices/tabs
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
