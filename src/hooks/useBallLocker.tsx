import { useState, useEffect } from "react";
import { filterLegacyBalls, safeJSONParse, INITIAL_OWNED_BALLS } from "../utils/bagUtils";
import { GolfBall } from "../types";

export function useBallLocker(currentUser: any) {
  const [balls, setBalls] = useState<GolfBall[]>(() => {
    try {
      const saved = localStorage.getItem("vice_vault_guest_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return filterLegacyBalls(parsed);
        }
      }
    } catch (e) {}
    return INITIAL_OWNED_BALLS;
  });

  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false);
  const [isCloudDataLoaded, setIsCloudDataLoaded] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLoadingCloudData(true);
      
      // Check cache first for immediate render
      const cachedBag = localStorage.getItem("vice_vault_bag_" + currentUser.uid);
      if (cachedBag) {
        try {
          setBalls(filterLegacyBalls(safeJSONParse(cachedBag)));
        } catch (e) {}
      }

      // Fetch from cloud
      fetch(`/api/users/${currentUser.uid}/locker`, { headers: {} })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && data.balls !== null) {
              const finalBalls = filterLegacyBalls(data.balls);
              setBalls(finalBalls);
              try {
                localStorage.setItem("vice_vault_bag_" + currentUser.uid, JSON.stringify(finalBalls));
              } catch (e) { console.warn("localStorage quota exceeded"); }
            } else {
              // If locker doesn't exist on server, upload current client balls (migration of guest data)
              await fetch(`/api/users/${currentUser.uid}/locker`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",

                },
                body: JSON.stringify({ balls: filterLegacyBalls(balls) })
              });
            }
          }
        })
        .catch(err => console.error("Error loading locker from cloud:", err))
        .finally(() => {
          setIsLoadingCloudData(false);
          setIsCloudDataLoaded(true);
        });

    } else {
      // Logged out / local-only fallback
      if (!localStorage.getItem("vice_vault_mock_user")) {
        setIsCloudDataLoaded(false);
        const savedBalls = localStorage.getItem("vice_vault_guest_v2");
        const parsedBalls = safeJSONParse(savedBalls);
        setBalls(Array.isArray(parsedBalls) ? filterLegacyBalls(parsedBalls) : INITIAL_OWNED_BALLS);
      }
    }
  }, [currentUser]);

  // Effect to sync balls back to localstorage when not logged in
  useEffect(() => {
    if (!currentUser && !localStorage.getItem("vice_vault_mock_user")) {
      try {
        if (balls.length !== INITIAL_OWNED_BALLS.length || balls.some((b, i) => b.id !== INITIAL_OWNED_BALLS[i]?.id)) {
          localStorage.setItem("vice_vault_guest_v2", JSON.stringify(balls));
        }
      } catch (e) {
        console.warn("Failed to write to localStorage:", e);
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
