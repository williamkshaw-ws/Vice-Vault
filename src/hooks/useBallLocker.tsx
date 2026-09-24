import { useState, useEffect, useRef } from "react";
import { filterLegacyBalls, safeJSONParse, INITIAL_OWNED_BALLS } from "../utils/bagUtils";
import { GolfBall } from "../types";
import { idbGet, idbSet } from "../utils/storage";
import { getAuthHeaders } from "../utils/authHeaders";
import { isFirebaseConfigured, db } from "../firebase";

export function useBallLocker(currentUser: any, userProfile?: any) {
  const [balls, setBalls] = useState<GolfBall[]>(() => {
    try {
      const candidates = ["vice_vault_bag_u-admin", "vice_vault_guest_v2"];
      for (const k of candidates) {
        const saved = localStorage.getItem(k);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
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

  useEffect(() => {
    if (currentUser) {
      setIsLoadingCloudData(true);
      
      const targetUid = userProfile?.uid || currentUser.uid || currentUser.id;
      const bagKey = "vice_vault_bag_" + targetUid;

      // 1. Check local caches across all candidate keys
      const candidateKeys = Array.from(new Set([
        bagKey,
        currentUser.uid ? `vice_vault_bag_${currentUser.uid}` : null,
        userProfile?.uid ? `vice_vault_bag_${userProfile.uid}` : null,
        "vice_vault_bag_u-admin",
        "vice_vault_guest_v2"
      ])).filter(Boolean) as string[];

      let localFound = false;
      for (const key of candidateKeys) {
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const parsed = safeJSONParse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
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
              if (idbBalls && Array.isArray(idbBalls) && idbBalls.length > 0) {
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
          let headers = await getAuthHeaders();
          let res = await fetch(`/api/users/${targetUid}/locker`, { headers });

          let cloudBalls: GolfBall[] | null = null;

          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.balls) && data.balls.length > 0) {
              cloudBalls = filterLegacyBalls(data.balls);
            }
          }

          // 3. Fallback to direct client-side Firestore if server had 0 balls or failed
          if ((!cloudBalls || cloudBalls.length === 0) && isFirebaseConfigured && db) {
            try {
              const { doc, getDoc } = await import("firebase/firestore");
              const firestoreUids = Array.from(new Set([targetUid, currentUser.uid, "u-admin"])).filter(Boolean) as string[];
              for (const fUid of firestoreUids) {
                const snap = await getDoc(doc(db, "users", fUid, "data", "locker"));
                if (snap.exists() && snap.data()?.balls && Array.isArray(snap.data().balls) && snap.data().balls.length > 0) {
                  cloudBalls = filterLegacyBalls(snap.data().balls);
                  // Sync to local server
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

          if (cloudBalls && cloudBalls.length > 0) {
            setBalls(cloudBalls);
            await idbSet(bagKey, cloudBalls);
            try {
              localStorage.setItem(bagKey, JSON.stringify(cloudBalls));
            } catch (e) {}
          } else if (ballsRef.current && ballsRef.current.length > 0) {
            // Server has no balls, but client has cached balls: preserve them and sync to server!
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
          setIsLoadingCloudData(false);
          setIsCloudDataLoaded(true);
        }
      };

      fetchLocker();

    } else {
      // Logged out / local-only fallback
      if (!localStorage.getItem("vice_vault_mock_user")) {
        setIsCloudDataLoaded(false);
        const savedBalls = localStorage.getItem("vice_vault_guest_v2");
        const parsedBalls = safeJSONParse(savedBalls);
        setBalls(Array.isArray(parsedBalls) ? filterLegacyBalls(parsedBalls) : INITIAL_OWNED_BALLS);
      }
    }
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
