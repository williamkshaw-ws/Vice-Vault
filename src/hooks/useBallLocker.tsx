import { useState, useEffect, useRef } from "react";
import { filterLegacyBalls, safeJSONParse, INITIAL_OWNED_BALLS } from "../utils/bagUtils";
import { GolfBall } from "../types";
import { idbGet, idbSet } from "../utils/storage";
import { getAuthHeaders } from "../utils/authHeaders";
import { isFirebaseConfigured, db } from "../firebase";

export function useBallLocker(currentUser: any, userProfile?: any) {
  const [balls, setBalls] = useState<GolfBall[]>(() => {
    try {
      const mockStr = localStorage.getItem("vice_vault_mock_user");
      if (mockStr) {
        const mockUser = safeJSONParse(mockStr);
        const mockUid = mockUser?.uid;
        if (mockUid) {
          const saved = localStorage.getItem(`vice_vault_bag_${mockUid}`);
          if (saved !== null) {
            const parsed = safeJSONParse(saved);
            if (Array.isArray(parsed)) {
              return filterLegacyBalls(parsed);
            }
          }
        }
      } else {
        const saved = localStorage.getItem("vice_vault_guest_v2");
        if (saved !== null) {
          const parsed = safeJSONParse(saved);
          if (Array.isArray(parsed)) {
            return filterLegacyBalls(parsed);
          }
        }
      }
    } catch (e) {}
    return INITIAL_OWNED_BALLS;
  });

  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false);
  const [isCloudDataLoaded, setIsCloudDataLoaded] = useState(false);
  const ballsRef = useRef<GolfBall[]>(balls);
  ballsRef.current = balls;
  const prevUidRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (currentUser) {
      const targetUid = userProfile?.uid || currentUser.uid || currentUser.id;
      const authUid = currentUser.uid || currentUser.id;
      const isAdminUser =
        targetUid === "u-admin" ||
        userProfile?.username?.toLowerCase() === "admin" ||
        currentUser?.username?.toLowerCase() === "admin" ||
        currentUser?.email?.toLowerCase() === "admin@vault.com";

      const bagKey = "vice_vault_bag_" + targetUid;

      // If switching between two different logged-in accounts or logging in fresh, reset state before loading
      if (prevUidRef.current !== authUid) {
        prevUidRef.current = authUid;
        setIsCloudDataLoaded(false);
        setBalls([]);
      }

      setIsLoadingCloudData(true);

      // 1. Check local caches strictly scoped to THIS user's keys
      const candidateKeys = Array.from(new Set([
        bagKey,
        authUid ? `vice_vault_bag_${authUid}` : null,
        userProfile?.uid ? `vice_vault_bag_${userProfile.uid}` : null,
        isAdminUser ? "vice_vault_bag_u-admin" : null
      ])).filter(Boolean) as string[];

      let localFound = false;
      for (const key of candidateKeys) {
        const cached = localStorage.getItem(key);
        if (cached !== null) {
          try {
            const parsed = safeJSONParse(cached);
            if (Array.isArray(parsed)) {
              setBalls(filterLegacyBalls(parsed));
              localFound = true;
              break;
            }
          } catch (e) {}
        }
      }

      if (!localFound) {
        (async () => {
          for (const key of candidateKeys) {
            try {
              const idbBalls = await idbGet<GolfBall[]>(key);
              if (!isCancelled && idbBalls && Array.isArray(idbBalls)) {
                setBalls(filterLegacyBalls(idbBalls));
                break;
              }
            } catch (e) {}
          }
        })();
      }

      // 2. Fetch from cloud / server API
      const fetchLocker = async () => {
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`/api/users/${targetUid}/locker`, { headers });

          let cloudBalls: GolfBall[] | null = null;

          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.balls)) {
              cloudBalls = filterLegacyBalls(data.balls);
            }
          }

          // 3. Fallback to direct client-side Firestore if server returned null or failed
          if (cloudBalls === null && isFirebaseConfigured && db) {
            try {
              const { doc, getDoc } = await import("firebase/firestore");
              const firestoreUids = Array.from(new Set([
                targetUid,
                authUid,
                isAdminUser ? "u-admin" : null
              ])).filter(Boolean) as string[];
              for (const fUid of firestoreUids) {
                const snap = await getDoc(doc(db, "users", fUid, "data", "locker"));
                if (snap.exists() && Array.isArray(snap.data()?.balls)) {
                  cloudBalls = filterLegacyBalls(snap.data().balls);
                  const postHeaders = await getAuthHeaders({ "Content-Type": "application/json" });
                  fetch(`/api/users/${targetUid}/locker`, {
                    method: "POST",
                    headers: postHeaders,
                    body: JSON.stringify({ balls: cloudBalls })
                  }).catch(() => {});
                  break;
                }
              }
            } catch (fsErr) {
              console.warn("Direct Firestore locker check skipped:", fsErr);
            }
          }

          if (isCancelled) return;

          if (cloudBalls !== null) {
            setBalls(cloudBalls);
            for (const key of candidateKeys) {
              await idbSet(key, cloudBalls);
              try {
                localStorage.setItem(key, JSON.stringify(cloudBalls));
              } catch (e) {}
            }
          } else if (localFound && ballsRef.current && ballsRef.current.length > 0) {
            // Server has no locker doc yet, and THIS user has a local cache: sync it to server
            const postHeaders = await getAuthHeaders({ "Content-Type": "application/json" });
            await fetch(`/api/users/${targetUid}/locker`, {
              method: "POST",
              headers: postHeaders,
              body: JSON.stringify({ balls: filterLegacyBalls(ballsRef.current) })
            }).catch(() => {});
          }
        } catch (err) {
          console.error("Error loading locker from cloud:", err);
        } finally {
          if (!isCancelled) {
            setIsLoadingCloudData(false);
            setIsCloudDataLoaded(true);
          }
        }
      };

      fetchLocker();

    } else {
      // Logged out / local-only fallback
      prevUidRef.current = null;
      if (!localStorage.getItem("vice_vault_mock_user")) {
        setIsCloudDataLoaded(false);
        const savedBalls = localStorage.getItem("vice_vault_guest_v2");
        const parsedBalls = safeJSONParse(savedBalls);
        setBalls(Array.isArray(parsedBalls) ? filterLegacyBalls(parsedBalls) : INITIAL_OWNED_BALLS);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [currentUser, userProfile?.uid]);

  // Effect to sync balls back to local storage and IndexedDB when not logged in
  useEffect(() => {
    if (!currentUser && !localStorage.getItem("vice_vault_mock_user")) {
      idbSet("vice_vault_guest_v2", balls);
      try {
        if (balls.length !== INITIAL_OWNED_BALLS.length || balls.some((b, i) => b.id !== INITIAL_OWNED_BALLS[i]?.id)) {
          localStorage.setItem("vice_vault_guest_v2", JSON.stringify(balls));
        }
      } catch (e) {
        /* localStorage quota exceeded on iOS; IndexedDB has it covered */
      }
    }
  }, [balls, currentUser]);

  return {
    balls,
    setBalls,
    isLoadingCloudData,
    isCloudDataLoaded,
    setIsCloudDataLoaded
  };
}
