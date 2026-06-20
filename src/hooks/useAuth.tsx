import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "../firebase";
import { UserProfile } from "../types";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check for local mock user on mount
    const savedMockUser = localStorage.getItem("vice_vault_mock_user");
    if (savedMockUser) {
      try {
        const parsed = JSON.parse(savedMockUser);
        setCurrentUser(parsed);
        setUserProfile({
          uid: parsed.uid || parsed.id || "",
          displayName: parsed.displayName || "User",
          username: parsed.username || "",
          avatarUrl: parsed.photoURL || "initials",
          preferredColor: parsed.preferredColor || "#2563eb",
          role: (parsed.role && parsed.role.toLowerCase() === "admin") ? "Admin" : "User",
          shareBag: !!parsed.shareBag,
          shareToken: parsed.shareToken,
          pendingFriendRequestsCount: parsed.pendingFriendRequestsCount || 0,
          wishlist: parsed.wishlist || []
        });
        setAccentColor(parsed.preferredColor || "#2563eb");
      } catch (e) {
        console.error("Error loading mock user:", e);
      }
    }

    if (!auth) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Clear mock user if a real Firebase user signs in
        localStorage.removeItem("vice_vault_mock_user");
        setCurrentUser(user);

        try {
          if (db) {
            const profileRes = await fetch(`/api/users/${user.uid}/profile`, { headers: {} });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              const userDocId = profileData.uid.startsWith("u-") ? profileData.uid : `u-${profileData.username}`;
              
              setUserProfile({
                uid: userDocId,
                displayName: profileData.displayName || profileData.name || user.displayName || "User",
                username: profileData.username || userDocId.replace(/^u-/, ""),
                avatarUrl: profileData.photoURL || profileData.avatarUrl || "initials",
                preferredColor: profileData.preferredColor || "#2563eb",
                pendingFriendRequestsCount: profileData.pendingFriendRequestsCount || 0,
                role: (profileData.role && profileData.role.toLowerCase() === "admin") ? "Admin" : "User",
                createdAt: profileData.createdAt,
                email: profileData.email || user.email || "",
                shareBag: !!profileData.shareBag,
                shareToken: profileData.shareToken,
                wishlist: profileData.wishlist || []
              });
              setAccentColor(profileData.preferredColor || "#2563eb");
            } else {
              console.warn("User profile data not resolved from backend API. Initializing basic fallback profile.");
              const rawUsername = user.displayName || user.email?.split("@")[0] || "user";
              const cleanUsername = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
              const fallbackDocId = `u-${cleanUsername}`;
              
              setUserProfile({
                uid: fallbackDocId,
                displayName: user.displayName || cleanUsername,
                username: cleanUsername,
                avatarUrl: user.photoURL || "preset-1",
                preferredColor: "#2563eb",
                role: cleanUsername === "admin" ? "Admin" : "User",
                createdAt: new Date().toISOString(),
                email: user.email || "",
                shareBag: false,
                wishlist: [],
                pendingFriendRequestsCount: 0
              });
              setAccentColor("#2563eb");
            }
          }
        } catch (apiErr) {
          console.error("Failed to fetch user profile from API:", apiErr);
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        // Logged out
        if (!localStorage.getItem("vice_vault_mock_user")) {
          setUserProfile(null);
          setAccentColor("#2563eb");
        }
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load mock user cloud data when mock user logs in or is loaded on mount
  useEffect(() => {
    if (currentUser && (currentUser as any).isMock) {
      fetch(`/api/users/${currentUser.uid}/profile`, { headers: {} })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setUserProfile({
                uid: data.uid || data.id,
                displayName: data.displayName || "User",
                username: data.username || "",
                avatarUrl: data.photoURL || "initials",
                preferredColor: data.preferredColor || "#2563eb",
                role: (data.role && data.role.toLowerCase() === "admin") ? "Admin" : "User",
                shareBag: !!data.shareBag,
                shareToken: data.shareToken, 
                pendingFriendRequestsCount: data.pendingFriendRequestsCount || 0,
                wishlist: data.wishlist || []
              });
              setAccentColor(data.preferredColor || "#2563eb");
              try {
                const existing = localStorage.getItem("vice_vault_mock_user");
                if (existing) {
                  const parsed = JSON.parse(existing);
                  if (parsed.token) data.token = parsed.token;
                }
                localStorage.setItem("vice_vault_mock_user", JSON.stringify(data));
              } catch(e) {}
            }
          }
        })
        .catch((err) => console.error("Error loading mock user profile data:", err));
    }
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      if (currentUser && (currentUser as any).isMock) {
        localStorage.removeItem("vice_vault_mock_user");
        setCurrentUser(null);
        setUserProfile(null);
        setAccentColor("#2563eb");
        window.location.reload();
        return;
      }
      
      if (auth) {
        await signOut(auth);
        setUserProfile(null);
        setCurrentUser(null);
        setAccentColor("#2563eb");
        localStorage.removeItem("vice_vault_mock_user");
      }
    } catch (err: any) {
      console.error("Error signing out", err);
      alert(err.message || "Error signing out");
    }
  };

  return {
    currentUser,
    setCurrentUser,
    userProfile,
    setUserProfile,
    isAuthLoading,
    accentColor,
    setAccentColor,
    authModalOpen,
    setAuthModalOpen,
    handleSignOut
  };
}
