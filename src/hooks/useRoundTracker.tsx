import { useState, useEffect, useRef, useCallback } from "react";
import type { GolfRound } from "../components/RoundTrackerModal";
import { getAuthHeaders } from "../utils/authHeaders";
import { isFirebaseConfigured, db } from "../firebase";

const ACTIVE_ROUND_STORAGE_KEY = "golf_ball_vault_active_round";
const ROUND_HISTORY_STORAGE_KEY = "golf_ball_vault_round_history";
const LEGACY_ACTIVE_KEY = "vice_vault_active_round";
const LEGACY_HISTORY_KEY = "vice_vault_round_history";

function getStoredActiveRound(uid?: string): GolfRound | null {
  const candidateKeys = uid
    ? [`${ACTIVE_ROUND_STORAGE_KEY}_${uid}`, `${LEGACY_ACTIVE_KEY}_${uid}`, ACTIVE_ROUND_STORAGE_KEY, LEGACY_ACTIVE_KEY]
    : [ACTIVE_ROUND_STORAGE_KEY, LEGACY_ACTIVE_KEY];
  for (const k of candidateKeys) {
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

function getStoredHistory(uid?: string): GolfRound[] {
  const candidateKeys = uid
    ? [`${ROUND_HISTORY_STORAGE_KEY}_${uid}`, `${LEGACY_HISTORY_KEY}_${uid}`, ROUND_HISTORY_STORAGE_KEY, LEGACY_HISTORY_KEY]
    : [ROUND_HISTORY_STORAGE_KEY, LEGACY_HISTORY_KEY];
  for (const k of candidateKeys) {
    try {
      const saved = localStorage.getItem(k);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
}

export function useRoundTracker(currentUser: any, userProfile?: any) {
  const targetUid = userProfile?.uid || currentUser?.uid || currentUser?.id;
  
  const [activeRound, setActiveRoundState] = useState<GolfRound | null>(() => getStoredActiveRound(targetUid));
  const [roundHistory, setRoundHistoryState] = useState<GolfRound[]>(() => getStoredHistory(targetUid));
  const [isCloudRoundsLoaded, setIsCloudRoundsLoaded] = useState(false);

  // References to keep track of latest values for debounce
  const activeRoundRef = useRef<GolfRound | null>(activeRound);
  activeRoundRef.current = activeRound;
  const roundHistoryRef = useRef<GolfRound[]>(roundHistory);
  roundHistoryRef.current = roundHistory;

  const syncTimeoutRef = useRef<any>(null);

  // Helper to persist locally
  const persistLocally = useCallback((newActive: GolfRound | null, newHistory: GolfRound[], uid?: string) => {
    try {
      if (newActive) {
        localStorage.setItem(ACTIVE_ROUND_STORAGE_KEY, JSON.stringify(newActive));
        localStorage.setItem(LEGACY_ACTIVE_KEY, JSON.stringify(newActive));
        if (uid) {
          localStorage.setItem(`${ACTIVE_ROUND_STORAGE_KEY}_${uid}`, JSON.stringify(newActive));
          localStorage.setItem(`${LEGACY_ACTIVE_KEY}_${uid}`, JSON.stringify(newActive));
        }
      } else {
        localStorage.removeItem(ACTIVE_ROUND_STORAGE_KEY);
        localStorage.removeItem(LEGACY_ACTIVE_KEY);
        if (uid) {
          localStorage.removeItem(`${ACTIVE_ROUND_STORAGE_KEY}_${uid}`);
          localStorage.removeItem(`${LEGACY_ACTIVE_KEY}_${uid}`);
        }
      }

      localStorage.setItem(ROUND_HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(newHistory));
      if (uid) {
        localStorage.setItem(`${ROUND_HISTORY_STORAGE_KEY}_${uid}`, JSON.stringify(newHistory));
        localStorage.setItem(`${LEGACY_HISTORY_KEY}_${uid}`, JSON.stringify(newHistory));
      }
    } catch (e) {
      console.warn("Error persisting rounds to localStorage:", e);
    }
  }, []);

  // Sync to Cloud (Firestore + Server API)
  const syncToCloud = useCallback(async (newActive: GolfRound | null, newHistory: GolfRound[]) => {
    if (!targetUid) return;

    // 1. Direct Firestore write if available
    if (isFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        const docRef = doc(db, "users", targetUid, "data", "rounds");
        await setDoc(docRef, {
          activeRound: newActive ?? null,
          roundHistory: newHistory || [],
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr) {
        console.warn("Direct Firestore round sync failed, fallback to server API:", fsErr);
      }
    }

    // 2. Server API write
    try {
      const headers = await getAuthHeaders({ "Content-Type": "application/json" });
      await fetch(`/api/users/${targetUid}/rounds`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          activeRound: newActive ?? null,
          roundHistory: newHistory || []
        })
      });
    } catch (apiErr) {
      console.warn("Server API round sync failed:", apiErr);
    }
  }, [targetUid]);

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
      activeRoundRef.current = next;
      persistLocally(next, roundHistoryRef.current, targetUid);
      if (targetUid) {
        if (next === null) {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncToCloud(next, roundHistoryRef.current);
        } else {
          scheduleCloudSync(next, roundHistoryRef.current);
        }
      }
      return next;
    });
  }, [persistLocally, scheduleCloudSync, syncToCloud, targetUid]);

  // Save history (called when round completed or deleted)
  const saveRoundHistory = useCallback((newHistory: GolfRound[]) => {
    roundHistoryRef.current = newHistory;
    setRoundHistoryState(newHistory);
    persistLocally(activeRoundRef.current, newHistory, targetUid);
    if (targetUid) {
      if (activeRoundRef.current === null) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncToCloud(activeRoundRef.current, newHistory);
      } else {
        scheduleCloudSync(activeRoundRef.current, newHistory);
      }
    }
  }, [persistLocally, scheduleCloudSync, syncToCloud, targetUid]);

  // Fetch rounds from cloud (Server API + Direct Firestore fallback)
  const fetchRoundsFromCloud = useCallback(async () => {
    if (!targetUid) return;

    try {
      let cloudActive: GolfRound | null = null;
      let cloudHistory: GolfRound[] | null = null;
      let fetched = false;

      // 1. Try server API
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/users/${targetUid}/rounds`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.hasData) {
            cloudActive = data.activeRound ?? null;
            cloudHistory = Array.isArray(data.roundHistory) ? data.roundHistory : [];
            fetched = true;
          }
        }
      } catch (err) {}

      // 2. Fallback to direct Firestore if server failed or returned empty
      if (!fetched && isFirebaseConfigured && db) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const snap = await getDoc(doc(db, "users", targetUid, "data", "rounds"));
          if (snap.exists()) {
            const data = snap.data();
            cloudActive = data.activeRound ?? null;
            cloudHistory = Array.isArray(data.roundHistory) ? data.roundHistory : [];
            fetched = true;
          }
        } catch (e) {}
      }

      if (fetched) {
        setActiveRoundState(cloudActive);
        setRoundHistoryState(cloudHistory || []);
        persistLocally(cloudActive, cloudHistory || [], targetUid);
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
  }, [targetUid, persistLocally, syncToCloud]);

  // Effect on authentication: load local cache, fetch cloud, and listen to Firestore real-time
  useEffect(() => {
    if (!targetUid) {
      // Guest mode
      setActiveRoundState(getStoredActiveRound());
      setRoundHistoryState(getStoredHistory());
      setIsCloudRoundsLoaded(true);
      return;
    }

    // 1. Immediately hydrate from local user cache
    const cachedActive = getStoredActiveRound(targetUid);
    const cachedHistory = getStoredHistory(targetUid);
    setActiveRoundState(cachedActive);
    setRoundHistoryState(cachedHistory);

    // 2. Fetch from cloud
    fetchRoundsFromCloud();

    // 3. Set up real-time listener via Firestore
    let unsubSnapshot: (() => void) | null = null;
    let isCancelled = false;

    if (isFirebaseConfigured && db) {
      (async () => {
        try {
          const { doc, onSnapshot } = await import("firebase/firestore");
          const docRef = doc(db, "users", targetUid, "data", "rounds");
          if (isCancelled) return;
          unsubSnapshot = onSnapshot(docRef, (snapshot) => {
            // Ignore updates triggered by our own pending local writes to prevent echo loops
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
                persistLocally(data.activeRound ?? null, Array.isArray(data.roundHistory) ? data.roundHistory : [], targetUid);
              }
            }
          }, (err) => {
            console.warn("Firestore rounds onSnapshot warning:", err);
          });
        } catch (e) {
          console.warn("Could not set up rounds onSnapshot listener:", e);
        }
      })();
    }

    // 4. Also listen for window focus / visibility change to guarantee fresh state when switching devices/tabs
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        fetchRoundsFromCloud();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      isCancelled = true;
      if (unsubSnapshot) unsubSnapshot();
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [targetUid, fetchRoundsFromCloud, persistLocally]);

  return {
    activeRound,
    setActiveRound,
    roundHistory,
    saveRoundHistory,
    isCloudRoundsLoaded
  };
}
