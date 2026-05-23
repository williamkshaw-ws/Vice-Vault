/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GolfBall, CatalogItem, BallModel, BallColor, BallCondition } from "./types";
import { VICE_BALLS_SPECS, COLOR_STYLES, SCRAPED_BALLS } from "./constants";
import CatalogItemCard from "./components/CatalogItemCard";
import AddMissingBallForm from "./components/AddMissingBallForm";
import XlsImporter from "./components/XlsImporter";
import OwnedBallCard from "./components/OwnedBallCard";
import BallVisual from "./components/BallVisual";
import { 
  Search, 
  Sparkles, 
  Database, 
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  PlusSquare,
  PackageCheck,
  Settings,
  Pencil,
  AlertTriangle,
  FileSpreadsheet,
  User,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  LogOut,
  CloudLightning,
  ChevronDown,
  Palette,
  Check,
  Lock,
  Mail
} from "lucide-react";

import { auth, db, isFirebaseConfigured } from "./firebase";
import AuthModal, { AvatarRenderer } from "./components/AuthModal";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, query, where, collection, getDocs } from "firebase/firestore";

// Premium Custom Golf-Specific SVGs designed to match the Munich technical aesthetic
function GolfBagIcon({ className = "w-5 h-5 text-neutral-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {/* Club Shafts */}
      <path d="M10 8L8.5 4M8.5 4C7.5 4 7 5 8 5" />
      <path d="M12 8L12 3M12 3C13.5 3 14 4.5 12.5 5" />
      <path d="M14 8L15.5 4M15.5 4C16.5 4 17 5 16 5" />
      {/* Main Bag Body */}
      <path d="M8 8 L9.5 21 C9.7 22 14.3 22 14.5 21 L16 8 Z" fill="#000" />
      {/* Side Pocket */}
      <path d="M8.5 11.5 C6.5 11.5 6.5 17 9.1 17.5" fill="#070707" />
      {/* Shoulder Strap */}
      <path d="M15.5 10 C18 11 18 16.5 14.5 18" />
    </svg>
  );
}

function GolfBallOutlineIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="8.5" cy="9.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="12" cy="8.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="15.5" cy="10.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="9.5" cy="13.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="13" cy="14.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="16.5" cy="14.5" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="11.5" cy="18" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="14.5" cy="17" r="0.75" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

function GolfBallStackIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {/* Top Ball */}
      <circle cx="12" cy="8.5" r="5" fill="#000" />
      <circle cx="10.5" cy="7.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="13" cy="7.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="12" cy="10" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />

      {/* Bottom Left Ball */}
      <circle cx="7.5" cy="15.5" r="5" fill="#000" />
      <circle cx="6.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="8.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="7.5" cy="17" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />

      {/* Bottom Right Ball */}
      <circle cx="16.5" cy="15.5" r="5" fill="#000" />
      <circle cx="15.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="17.5" cy="14.5" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="16.5" cy="17" r="0.5" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

function BallVaultIcon({ className = "w-4 h-4 text-neutral-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      {/* Safe Box Frame */}
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      {/* Heavy door hinge lines on side */}
      <path d="M6 3v18" strokeWidth="1" strokeDasharray="1 1" opacity="0.6" />
      {/* Main combination dial */}
      <circle cx="12.5" cy="12" r="4.5" strokeWidth="1.5" />
      <circle cx="12.5" cy="12" r="1.5" fill="currentColor" />
      {/* Radial dial ticks */}
      <path d="M12.5 4.5v1.5" />
      <path d="M12.5 18v1.5" />
      <path d="M5 12h1.5" />
      <path d="M18 12h1.5" />
      {/* Accent details to signify high security vault lock */}
      <path d="M8.5 12h1" />
      <path d="M15.5 12h1" />
      <path d="M12.5 8v1" />
      <path d="M12.5 15v1" />
      {/* Golf dimples embedded for unique Vault identity */}
      <circle cx="7" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="18" r="0.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

// Initial owned mockup data to make the app look stunning right away
const INITIAL_OWNED_BALLS: GolfBall[] = [
  {
    id: "OWNED-PRO-PURE_GLOSS_WHITE-STANDARD_EDITION-BRAND_NEW-BOX-V1",
    model: BallModel.PRO,
    color: "Pure Gloss White",
    quantity: 12,
    condition: BallCondition.NEW,
    packageType: "box",
    customNumber: 1,
    notes: "Tournament dozen box. Extreme wedge backspin control.",
    version: "Standard Edition",
    dateAdded: "5/12/2026"
  },
  {
    id: "OWNED-PRO_PLUS-RED_BLUE_DRIP_SPLATTER-STANDARD_EDITION-NEAR_MINT_SCUFFED_0-EA-V2",
    model: BallModel.PRO_PLUS,
    color: "Red/Blue Drip Splatter",
    quantity: 6,
    condition: BallCondition.MINT,
    packageType: "ea",
    customNumber: 77,
    notes: "My lucky splattered golf balls.",
    version: "Standard Edition",
    dateAdded: "5/14/2026"
  },
  {
    id: "OWNED-PRO_SOFT-NEON_GLOSS_RED-STANDARD_EDITION-PLAYED_SCUFFED_1-SLEEVE-V3",
    model: BallModel.PRO_SOFT,
    color: "Neon Gloss Red",
    quantity: 3,
    condition: BallCondition.PLAYED,
    packageType: "sleeve",
    customNumber: 3,
    notes: "Practice round balls. Extremely responsive feel.",
    version: "Standard Edition",
    dateAdded: "5/15/2026"
  }
];

function sanitizeId(model: string, color: string): string {
  const modelPart = model.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const colorPart = color.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${modelPart}-${colorPart}`;
}


// Helper to generate the standard default Vice catalog entries
const generateDefaultCatalog = (): CatalogItem[] => {
  return SCRAPED_BALLS;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "124, 179, 0";
};

export default function App() {
  // Theme state: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem("vice_vault_theme") as 'light' | 'dark' | 'system') || "system";
  });

  // Firebase Auth & Cloud Sync states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<{ displayName: string; username?: string; avatarUrl?: string; preferredColor: string; role?: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false);
  const [isCloudDataLoaded, setIsCloudDataLoaded] = useState(false);
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);

  // State for tracked owned balls
  const [balls, setBalls] = useState<GolfBall[]>(() => {
    const saved = localStorage.getItem("vice_vault_balls");
    return saved ? JSON.parse(saved) : INITIAL_OWNED_BALLS;
  });

  // State for searchable database catalog
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    const saved = localStorage.getItem("vice_vault_catalog");
    return saved ? JSON.parse(saved) : generateDefaultCatalog();
  });

  // Active search query
  const [searchQuery, setSearchQuery] = useState("");
  // Quick filter to narrow core brand models
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("ALL");

  // Secondary panel state: "browse" or "admin" inside database panel
  const [dbPanelTab, setDbPanelTab] = useState<"browse" | "admin" | "users" | "register">("browse");

  // User Manager States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // User Editing States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState<"Admin" | "User">("User");
  const [editColor, setEditColor] = useState("#2563eb");
  const [editAvatarUrl, setEditAvatarUrl] = useState("preset-1");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [editPasswordFocused, setEditPasswordFocused] = useState(false);

  // Mobile layout active workspace tab: "bag" or "catalog"
  const [mobileTab, setMobileTab] = useState<"bag" | "catalog">("bag");

  // Active Catalog Item for modification
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Tracks which specification is in "Confirm Delete" mode
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Tracks if the global reset confirm toggle is active
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Tracks if delete all for locker confirm is active
  const [showDeleteAllLockerConfirm, setShowDeleteAllLockerConfirm] = useState(false);

  // Tracks if delete all for catalog confirm is active
  const [showDeleteAllCatalogConfirm, setShowDeleteAllCatalogConfirm] = useState(false);

  // Search input filter inside Catalog Admin
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // Toggle for Spreadsheet bulk importer in admin
  const [showXlsImporter, setShowXlsImporter] = useState(false);

  // Add multiple catalog items from Excel/Spreadsheet import
  const handleXlsImportCatalogItems = async (newItems: Omit<CatalogItem, "id">[]) => {
    try {
      const itemsWithIds: CatalogItem[] = [];
      const seenIds = new Set<string>();
      
      // Filter out newItems that would result in duplicate IDs within the import itself, or that already exist in our catalog state
      const catalogIds = new Set(catalog.map(c => c.id));
      
      const filteredNewItems: Omit<CatalogItem, "id">[] = [];
      for (const item of newItems) {
        const id = sanitizeId(item.model, item.color);
        if (!seenIds.has(id) && !catalogIds.has(id)) {
          seenIds.add(id);
          filteredNewItems.push(item);
        }
      }

      if (filteredNewItems.length === 0) {
        alert("All imported items are already present in the catalog.");
        return;
      }

      if (currentUser) {
        for (const item of filteredNewItems) {
          const res = await fetch("/api/catalog", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": currentUser.uid
            },
            body: JSON.stringify({
              model: item.model,
              color: item.color,
              notes: item.notes,
              customImage: item.customImage
            })
          });
          if (res.ok) {
            const createdItem = await res.json();
            itemsWithIds.push(createdItem);
          }
        }
      } else {
        filteredNewItems.forEach((item) => {
          const id = sanitizeId(item.model, item.color);
          itemsWithIds.push({
            id,
            model: item.model.trim(),
            color: item.color.trim(),
            notes: item.notes ? item.notes.trim() : "",
            customImage: item.customImage
          });
        });
      }
      
      setCatalog((prev) => [...itemsWithIds, ...prev]);
    } catch (err: any) {
      console.error("Error bulk importing catalog items:", err);
      alert(err.message || "Failed to bulk import catalog items.");
    }
  };

  // Update existing catalog template specifications (Sync logic to prevent duplications and maintain links)
  const handleUpdateCatalogItem = async (id: string, updatedFields: Partial<CatalogItem>) => {
    try {
      const originalItem = catalog.find((c) => c.id === id);
      if (!originalItem) throw new Error("Original item not found");

      const updatedModel = (updatedFields.model !== undefined ? updatedFields.model.trim() : originalItem.model);
      const updatedColor = (updatedFields.color !== undefined ? updatedFields.color.trim() : originalItem.color);
      const newId = sanitizeId(updatedModel, updatedColor);

      if (currentUser) {
        const res = await fetch(`/api/catalog/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.uid
          },
          body: JSON.stringify({
            model: updatedModel,
            color: updatedColor,
            notes: updatedFields.notes,
            customImage: updatedFields.customImage
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update global catalog item.");
        }
      }

      setCatalog((prev) => {
        const newItem: CatalogItem = {
          id: newId,
          model: updatedModel,
          color: updatedColor,
          notes: updatedFields.notes !== undefined ? updatedFields.notes.trim() : originalItem.notes,
          customImage: updatedFields.customImage !== undefined ? updatedFields.customImage : originalItem.customImage
        };
        return prev.map((item) => (item.id === id ? newItem : item));
      });

      // Sync info for already logged bags using the older color/model to protect visual layouts
      if (originalItem) {
        setBalls((prev) =>
          prev.map((ball) => {
            if (ball.model === originalItem.model && ball.color === originalItem.color) {
              return {
                ...ball,
                model: updatedModel.toUpperCase(),
                color: updatedColor,
                customImage: updatedFields.customImage !== undefined ? updatedFields.customImage : ball.customImage,
              };
            }
            return ball;
          })
        );
      }
      setEditingItem(null);
    } catch (err: any) {
      console.error("Error updating catalog item:", err);
      alert(err.message || "Failed to update catalog item.");
    }
  };

  // Safe removal of registered catalog templates
  const handleDeleteCatalogItem = async (id: string) => {
    try {
      if (currentUser) {
        const res = await fetch(`/api/catalog/${id}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUser.uid
          }
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to delete global catalog item.");
        }
      }

      setCatalog((prev) => prev.filter((item) => item.id !== id));
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    } catch (err: any) {
      console.error("Error deleting catalog item:", err);
      alert(err.message || "Failed to delete catalog item.");
    }
  };

  // Firebase Auth listener and Cloud sync loader
  useEffect(() => {
    // 1. Check for local mock user on mount
    const savedMockUser = localStorage.getItem("vice_vault_mock_user");
    if (savedMockUser) {
      try {
        const parsed = JSON.parse(savedMockUser);
        setCurrentUser(parsed);
        setUserProfile({
          displayName: parsed.displayName || "User",
          username: parsed.username || "",
          avatarUrl: parsed.photoURL || "initials",
          preferredColor: parsed.preferredColor || "#2563eb",
          role: (parsed.role && parsed.role.toLowerCase() === "admin") ? "Admin" : "User"
        });
        setAccentColor(parsed.preferredColor || "#2563eb");
        setIsCloudDataLoaded(false);
      } catch (e) {
        console.error("Error loading mock user:", e);
      }
    }

    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Clear mock user if a real Firebase user signs in
        localStorage.removeItem("vice_vault_mock_user");
        
        setCurrentUser(user);
        try {
          // 1. Load User Profile from the Server API (which resolves standard Firestore documents securely)
          let userDocData: any = null;
          let userDocId: string = "";

          if (db) {
            try {
              const profileRes = await fetch(`/api/users/${user.uid}/profile`);
              if (profileRes.ok) {
                const profileData = await profileRes.json();
                userDocData = {
                  displayName: profileData.displayName,
                  username: profileData.username,
                  avatarUrl: profileData.photoURL,
                  preferredColor: profileData.preferredColor,
                  role: profileData.role,
                  email: profileData.email,
                  uid: profileData.uid
                };
                userDocId = profileData.uid.startsWith("u-") ? profileData.uid : `u-${profileData.username}`;
              }
            } catch (apiErr) {
              console.error("Failed to fetch user profile from API:", apiErr);
            }
          }

          if (db) {
            if (userDocData && userDocId) {
              // Found user profile
              setUserProfile({
                displayName: userDocData.displayName || userDocData.name || user.displayName || "User",
                username: userDocData.username || userDocId.replace(/^u-/, ""),
                avatarUrl: userDocData.avatarUrl || "initials",
                preferredColor: userDocData.preferredColor || "#2563eb",
                role: (userDocData.role && userDocData.role.toLowerCase() === "admin") ? "Admin" : "User",
                createdAt: userDocData.createdAt,
                email: userDocData.email || user.email || ""
              } as any);
              setAccentColor(userDocData.preferredColor || "#2563eb");
            } else {
              console.warn("User profile data not resolved from backend API. Initializing basic fallback profile.");
              const rawUsername = user.displayName || user.email?.split("@")[0] || "user";
              const cleanUsername = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
              const fallbackDocId = `u-${cleanUsername}`;
              
              setUserProfile({
                displayName: user.displayName || cleanUsername,
                username: cleanUsername,
                avatarUrl: user.photoURL || "preset-1",
                preferredColor: "#2563eb",
                role: cleanUsername === "admin" ? "Admin" : "User",
                createdAt: new Date().toISOString(),
                email: user.email || ""
              } as any);
              setAccentColor("#2563eb");
              userDocId = fallbackDocId;
            }

            // 2. Load inventory documents using the standard user doc ID
            const lockerDoc = await getDoc(doc(db, "users", userDocId, "data", "locker"));

            let finalBalls = balls;

            if (lockerDoc.exists()) {
              finalBalls = lockerDoc.data().balls || [];
            } else {
              await setDoc(doc(db, "users", userDocId, "data", "locker"), { balls });
            }

            setBalls(finalBalls);
          }
        } catch (err) {
          console.error("Error loading user cloud data:", err);
        } finally {
          setIsLoadingCloudData(false);
          setIsCloudDataLoaded(true);
        }
      } else {
        // Logged out / local-only fallback
        if (!localStorage.getItem("vice_vault_mock_user")) {
          setUserProfile(null);
          setAccentColor("#2563eb");
          setIsCloudDataLoaded(false);
          setUserDropdownOpen(false);

          const savedBalls = localStorage.getItem("vice_vault_balls");
          setBalls(savedBalls ? JSON.parse(savedBalls) : INITIAL_OWNED_BALLS);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load Global Catalog on Mount/Config Change
  useEffect(() => {
    let active = true;
    const fetchGlobalCatalog = async () => {
      try {
        if (isFirebaseConfigured && db) {
          const { collection, getDocs } = await import("firebase/firestore");
          const catalogSnap = await getDocs(collection(db, "catalog"));
          const items: CatalogItem[] = [];
          catalogSnap.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as CatalogItem);
          });
          if (active) {
            setCatalog(items);
          }
        } else {
          const res = await fetch("/api/catalog");
          if (res.ok) {
            const data = await res.json();
            if (active && data) {
              setCatalog(data);
            }
          }
        }
      } catch (err) {
        console.error("Error loading global catalog:", err);
      }
    };

    fetchGlobalCatalog();
    return () => { active = false; };
  }, [isFirebaseConfigured, db, currentUser]);

  // Load mock user cloud data when mock user logs in or is loaded on mount
  useEffect(() => {
    if (currentUser && currentUser.isMock) {
      setIsLoadingCloudData(true);
      
      Promise.all([
        fetch(`/api/users/${currentUser.uid}/profile`).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setUserProfile({
                displayName: data.displayName || "User",
                username: data.username || "",
                avatarUrl: data.photoURL || "initials",
                preferredColor: data.preferredColor || "#2563eb",
                role: (data.role && data.role.toLowerCase() === "admin") ? "Admin" : "User"
              });
              setAccentColor(data.preferredColor || "#2563eb");
              // Keep local storage up to date with latest server-side profile
              localStorage.setItem("vice_vault_mock_user", JSON.stringify(data));
            }
          }
        }),
        fetch(`/api/users/${currentUser.uid}/locker`).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && data.balls !== null) {
              setBalls(data.balls);
            }
          }
        })
      ])
      .catch((err) => console.error("Error loading mock user server data:", err))
      .finally(() => {
        setIsLoadingCloudData(false);
        setIsCloudDataLoaded(true);
      });
    }
  }, [currentUser]);

  // Redirect safety for administrative panels if role changes or user logs out
  useEffect(() => {
    if (dbPanelTab === "admin" || dbPanelTab === "users") {
      if (!currentUser || userProfile?.role !== "Admin") {
        setDbPanelTab("browse");
      }
    }
  }, [currentUser, userProfile, dbPanelTab]);

  const fetchUsers = async () => {
    if (!currentUser) return;
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch("/api/users", {
        headers: {
          "x-user-id": currentUser.uid
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }
      // Normalize each user to have both id & uid, and name & displayName for compatibility
      const normalized = data.map((u: any) => ({
        ...u,
        id: u.uid || u.id,
        uid: u.uid || u.id,
        name: u.displayName || u.name,
        displayName: u.displayName || u.name,
        role: (u.role && u.role.toLowerCase() === "admin") ? "Admin" : "User"
      }));
      setUsersList(normalized);
    } catch (err: any) {
      setUsersError(err.message || "Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (dbPanelTab === "users" && currentUser) {
      fetchUsers();
    }
  }, [dbPanelTab, currentUser]);

  const handleUpdateUser = async (userId: string, updatedFields: { displayName: string; username: string; role: string; preferredColor: string; avatarUrl: string; email?: string; password?: string }) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.uid || ""
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user");
        return false;
      }
      setUsersList(prev => prev.map(u => (u.uid === userId || u.id === userId) ? { ...u, ...data, id: data.uid || data.id, name: data.displayName || data.name } : u));
      if (userId === currentUser?.uid) {
        setUserProfile({
          displayName: data.displayName,
          username: data.username,
          avatarUrl: data.avatarUrl,
          preferredColor: data.preferredColor,
          role: (data.role && data.role.toLowerCase() === "admin") ? "Admin" : "User"
        });
        setAccentColor(data.preferredColor);
      }
      return true;
    } catch (err: any) {
      alert(err.message || "Error updating user");
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.uid) {
      alert("Self-protection safeguard: You cannot delete your own account.");
      return;
    }

    if (currentUser) {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUser.uid
          }
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Failed to delete user");
          return;
        }
        setUsersList(prev => prev.filter(u => u.uid !== userId && u.id !== userId));
      } catch (err: any) {
        alert(err.message || "Error deleting user");
      }
    }
  };

  const startEditingUser = (user: any) => {
    setEditingUserId(user.uid || user.id);
    setEditName(user.displayName || user.name || "");
    setEditUsername(user.username || "");
    setEditRole(user.role || "User");
    setEditColor(user.preferredColor || "#2563eb");
    setEditAvatarUrl(user.avatarUrl || "preset-1");
    setEditEmail(user.email || "");
    setEditPassword("");
    setEditPasswordConfirm("");
  };

  const ACCENT_COLORS = [
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

  // Sync to localStorage, Firestore, or Express Server depending on login state
  useEffect(() => {
    if (currentUser && isCloudDataLoaded) {
      if (currentUser.isMock) {
        fetch(`/api/users/${currentUser.uid}/locker`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.uid
          },
          body: JSON.stringify({ balls })
        }).catch(err => console.error("Error writing locker to server:", err));
      } else if (db) {
        const username = userProfile?.username;
        const docId = username ? `u-${username}` : currentUser.uid;
        const lockerRef = doc(db, "users", docId, "data", "locker");
        setDoc(lockerRef, { balls }).catch(err => console.error("Error writing locker to Firestore:", err));
      }
    } else if (!currentUser) {
      localStorage.setItem("vice_vault_balls", JSON.stringify(balls));
    }
  }, [balls, currentUser, isCloudDataLoaded, userProfile]);



  // Handle theme switching and OS preference changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else {
        // System preference
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Handler to update theme and store it
  const handleSetTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem("vice_vault_theme", newTheme);
  };

  // Handler to register balls (from catalog items) to owned Locker
  const handleAddBallFromCatalog = (
    model: string,
    color: string,
    qty: number,
    customNum: number,
    notes: string,
    condition: BallCondition,
    customImage?: string,
    packageType?: 'ea' | 'sleeve' | 'box',
    version?: string
  ) => {
    const today = new Date().toLocaleDateString();
    
    setBalls((prev) => {
      const resolvedPkgType = packageType || (qty >= 12 ? 'box' : qty >= 3 ? 'sleeve' : 'ea');
      // Check if matching ball stack exists to merge (model, color, packageType, version, condition, and design notes matching)
      const existingIdx = prev.findIndex(b => 
        b.model.trim().toLowerCase() === model.trim().toLowerCase() &&
        b.color.trim().toLowerCase() === color.trim().toLowerCase() &&
        b.notes.trim().toLowerCase() === notes.trim().toLowerCase() &&
        b.condition === condition &&
        (b.version || "Standard Edition").trim().toLowerCase() === (version || "Standard Edition").trim().toLowerCase() &&
        (b.packageType || (b.quantity >= 12 ? 'box' : b.quantity >= 3 ? 'sleeve' : 'ea')) === resolvedPkgType
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty
        };
        return updated;
      } else {
        const sanitizeSegment = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const modelPart = sanitizeSegment(model);
        const colorPart = sanitizeSegment(color);
        const versionPart = sanitizeSegment(version || "Standard Edition");
        const conditionPart = sanitizeSegment(condition);
        const pkgPart = sanitizeSegment(resolvedPkgType);
        const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();

        const newBall: GolfBall = {
          id: `OWNED-${modelPart}-${colorPart}-${versionPart}-${conditionPart}-${pkgPart}-${randomPart}`,
          model,
          color,
          quantity: qty,
          condition,
          packageType: resolvedPkgType,
          customNumber: customNum,
          notes: notes || "",
          version: version || "Standard Edition",
          dateAdded: today,
          customImage
        };
        return [newBall, ...prev];
      }
    });
  };

  // Add missing ball to Catalog Database
  const handleAddCatalogItem = async (newItem: Omit<CatalogItem, "id">) => {
    try {
      const id = sanitizeId(newItem.model, newItem.color);
      const exists = catalog.some(c => c.id === id);
      if (exists) {
        alert("A design spec with this Model and Color already exists in the Catalog.");
        return;
      }

      let itemWithId: CatalogItem;
      if (currentUser) {
        const res = await fetch("/api/catalog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.uid
          },
          body: JSON.stringify({
            model: newItem.model,
            color: newItem.color,
            notes: newItem.notes,
            customImage: newItem.customImage
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to add design to global catalog.");
        }
        itemWithId = await res.json();
      } else {
        // Guest / fallback mode
        itemWithId = {
          id,
          model: newItem.model.trim(),
          color: newItem.color.trim(),
          notes: newItem.notes ? newItem.notes.trim() : "",
          customImage: newItem.customImage
        };
      }
      setCatalog((prev) => [itemWithId, ...prev]);
      setDbPanelTab("browse");
      setSearchQuery(newItem.model);
    } catch (err: any) {
      console.error("Error adding catalog item:", err);
      alert(err.message || "Failed to add catalog item.");
    }
  };

  // Update owned quantity stepper
  const handleUpdateQty = (id: string, newQty: number) => {
    setBalls((prev) => 
      prev.map(b => b.id === id ? { ...b, quantity: Math.max(1, newQty) } : b)
    );
  };

  // Update condition appraisal
  const handleUpdateCondition = (id: string, newCond: BallCondition) => {
    setBalls((prev) => 
      prev.map(b => b.id === id ? { ...b, condition: newCond } : b)
    );
  };

  // Update notes inline
  const handleUpdateNotes = (id: string, newNotes: string) => {
    setBalls((prev) => 
      prev.map(b => b.id === id ? { ...b, notes: newNotes } : b)
    );
  };

  // General update handler for locker balls
  const handleUpdateBall = (id: string, updatedFields: Partial<GolfBall>) => {
    setBalls((prev) =>
      prev.map(b => b.id === id ? { ...b, ...updatedFields } : b)
    );
  };

  // Delete/wipe from owned bag locker
  const handleDeleteBall = (id: string) => {
    setBalls((prev) => prev.filter(b => b.id !== id));
  };

  // Wipe entire owned Bag Locker
  const handleDeleteAllLocker = () => {
    setBalls([]);
    setShowDeleteAllLockerConfirm(false);
  };

  // Wipe entire Catalog templates list
  const handleDeleteAllCatalog = async () => {
    try {
      if (currentUser) {
        for (const item of catalog) {
          await fetch(`/api/catalog/${item.id}`, {
            method: "DELETE",
            headers: {
              "x-user-id": currentUser.uid
            }
          });
        }
      }
      
      setCatalog([]);
      if (editingItem) {
        setEditingItem(null);
      }
      setShowDeleteAllCatalogConfirm(false);
    } catch (err: any) {
      console.error("Error clearing catalog:", err);
      alert(err.message || "Failed to clear catalog.");
    }
  };

  // Safe restoration of demo inventory & default catalog database
  const handleResetApp = () => {
    setBalls(INITIAL_OWNED_BALLS);
    const standardCatalog = generateDefaultCatalog();
    setCatalog(standardCatalog);
    localStorage.removeItem("vice_vault_balls");
    localStorage.removeItem("vice_vault_catalog");
    setSearchQuery("");
    setSelectedBrandFilter("ALL");
    setDbPanelTab("browse");
    setShowResetConfirm(false);
  };

  // FILTERED CATALOG items based on search word and model filter tag
  const filteredCatalog = catalog.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.model.toLowerCase().includes(query) ||
      item.color.toLowerCase().includes(query) ||
      (item.notes && item.notes.toLowerCase().includes(query));

    const matchesBrand = 
      selectedBrandFilter === "ALL" || 
      item.model === selectedBrandFilter;

    return matchesSearch && matchesBrand;
  });

  // Unique models actually present in the registry catalog for the Filter Model buttons
  const registeredModels: string[] = Array.from<string>(
    new Set<string>(catalog.map(item => item.model))
  ).sort();

  // Sort Catalog alphabetically by Model, then by Color, then by Design Notes (Notes)
  const sortedCatalog = [...filteredCatalog].sort((a, b) => {
    const modelA = a.model.trim().toLowerCase();
    const modelB = b.model.trim().toLowerCase();
    if (modelA < modelB) return -1;
    if (modelA > modelB) return 1;

    const colorA = a.color.trim().toLowerCase();
    const colorB = b.color.trim().toLowerCase();
    if (colorA < colorB) return -1;
    if (colorA > colorB) return 1;

    const notesA = (a.notes || "").trim().toLowerCase();
    const notesB = (b.notes || "").trim().toLowerCase();
    if (notesA < notesB) return -1;
    if (notesA > notesB) return 1;

    return 0;
  });

  // Calculate high level statistics for Locker
  const totalOwnedCount = balls.reduce((sum, b) => sum + b.quantity, 0);
  const totalUniqueModels = new Set(
    balls.map(b => `${b.model.trim().toLowerCase()}|${b.color.trim().toLowerCase()}|${(b.version || "Standard Edition").trim().toLowerCase()}`)
  ).size;

  const eaCount = balls.filter(b => b.packageType === "ea" || !b.packageType).reduce((sum, b) => sum + b.quantity, 0);
  const sleeveCount = balls.filter(b => b.packageType === "sleeve").reduce((sum, b) => sum + Math.round(b.quantity / 3), 0);
  const boxCount = balls.filter(b => b.packageType === "box").reduce((sum, b) => sum + Math.round(b.quantity / 12), 0);

  return (
    <div className="min-h-screen transition-all duration-300 font-sans bg-black text-neutral-100 selection:bg-[#2563eb] selection:text-black" id="vice-vault-app">
      <style>{`
        :root {
          --theme-accent-color: ${accentColor};
          --theme-accent-color-rgb: ${hexToRgb(accentColor)};
        }
        
        /* Class overrides for dynamic theme colors */
        .text-\\[\\#2563eb\\] { color: var(--theme-accent-color) !important; }
        .bg-\\[\\#2563eb\\] { background-color: var(--theme-accent-color) !important; }
        .hover\\:text-\\[\\#2563eb\\]:hover { color: var(--theme-accent-color) !important; }
        .border-\\[\\#2563eb\\] { border-color: var(--theme-accent-color) !important; }
        .focus\\:border-\\[\\#2563eb\\]:focus { border-color: var(--theme-accent-color) !important; }
        .selection\\:bg-\\[\\#2563eb\\]::selection { background-color: var(--theme-accent-color) !important; }
        .shadow-\\[\\#2563eb\\]\\/10 { box-shadow: 0 10px 15px -3px rgba(var(--theme-accent-color-rgb), 0.1), 0 4px 6px -4px rgba(var(--theme-accent-color-rgb), 0.1) !important; }
        .border-\\[\\#2563eb\\]\\/30 { border-color: rgba(var(--theme-accent-color-rgb), 0.3) !important; }
        .border-\\[\\#2563eb\\]\\/25 { border-color: rgba(var(--theme-accent-color-rgb), 0.25) !important; }
        .bg-\\[\\#2563eb\\]\\/10 { background-color: rgba(var(--theme-accent-color-rgb), 0.1) !important; }
        .bg-\\[\\#2563eb\\]\\/20 { background-color: rgba(var(--theme-accent-color-rgb), 0.2) !important; }
        .hover\\:bg-\\[\\#2563eb\\]\\/80:hover { background-color: rgba(var(--theme-accent-color-rgb), 0.8) !important; }
        .bg-\\[\\#2563eb\\]\\/80 { background-color: rgba(var(--theme-accent-color-rgb), 0.8) !important; }
        .hover\\:border-\\[\\#2563eb\\]\\/50:hover { border-color: rgba(var(--theme-accent-color-rgb), 0.5) !important; }
        .border-\\[\\#2563eb\\]\\/50 { border-color: rgba(var(--theme-accent-color-rgb), 0.5) !important; }
        .focus\\:border-\\[\\#2563eb\\]\\/50:focus { border-color: rgba(var(--theme-accent-color-rgb), 0.5) !important; }
        
        /* Special elements using custom accent color styling */
        .text-accent-dynamic { color: var(--theme-accent-color) !important; }
        .bg-accent-dynamic { background-color: var(--theme-accent-color) !important; }
        .border-accent-dynamic { border-color: var(--theme-accent-color) !important; }
      `}</style>
      
      {/* Sleek Minimal Branded Header */}
      <header className="sticky top-0 z-30 shadow-sm transition-all duration-300 border-b border-neutral-850 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand statement */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full blur-sm transition duration-1000 bg-gradient-to-r from-lime-500 to-emerald-500 opacity-20 group-hover:opacity-40" />
              <div className="relative w-11 h-11 rounded-full flex items-center justify-center transition-colors bg-neutral-900 border border-neutral-800">
                <BallVisual color={BallColor.NEON_LIME} model="Logo" number={undefined} size="sm" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <h1 className="text-xl font-sans font-black tracking-tight text-white m-0 transition-all">
                  GOLF BALL VAULT
                </h1>
                <span className="px-2 py-0.5 rounded font-mono font-black text-[9px] uppercase tracking-wider transition-all duration-300 bg-[#2563eb] text-black font-black">
                  Pro-Edition
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 tracking-tight mt-0.5 max-w-sm">
                Search, catalog, and oversee your custom golf ball collections with visual precision.
              </p>
            </div>
          </div>

          {/* Double Actions: Dropdown Menus */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            
            {/* Quick login / Sync access */}
            {isLoadingCloudData ? (
              <div className="flex items-center gap-2 text-neutral-500 text-[11px] font-mono border border-neutral-850 px-4 py-2 rounded-xl bg-neutral-950">
                <RefreshCw size={13} className="animate-spin text-[#2563eb]" />
                <span>Syncing...</span>
              </div>
            ) : currentUser ? (
              <div className="relative" id="user-profile-dropdown-container">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="text-[11px] font-mono hover:text-[#2563eb] border transition-all cursor-pointer flex items-center gap-2 shadow-sm px-3 py-1.5 rounded-xl text-neutral-300 border border-neutral-850 hover:border-neutral-750 bg-neutral-950 hover:bg-neutral-900"
                  id="user-profile-menu-btn"
                >
                  <AvatarRenderer avatarUrl={userProfile?.avatarUrl} name={userProfile?.displayName || currentUser.displayName || "User"} size="sm" color={accentColor} />
                  <span>{userProfile?.displayName || currentUser.displayName || "User"}</span>
                  {userProfile?.role === "Admin" && (
                    <span className="px-1 py-0.2 rounded border border-[#2563eb]/30 text-[8px] uppercase tracking-wider font-extrabold text-[#2563eb] bg-[#2563eb]/10 leading-none">
                      Admin
                    </span>
                  )}
                  <ChevronDown size={11} className={`text-neutral-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
 
                {userDropdownOpen && (
                  <>
                    {/* Backdrop cover for clicking outside */}
                    <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)}></div>
                    <div
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-neutral-850 bg-neutral-950/95 backdrop-blur-md p-2 shadow-2xl z-40 flex flex-col gap-1 text-[11px] font-mono animate-in fade-in slide-in-from-top-2 duration-150"
                      id="user-profile-menu"
                    >
                      <div className="px-2.5 py-2 border-b border-neutral-900 mb-1">
                        <div className="flex items-center gap-3">
                          <AvatarRenderer avatarUrl={userProfile?.avatarUrl} name={userProfile?.displayName || currentUser.displayName || "User"} size="md" color={accentColor} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-white block truncate max-w-[110px]">
                                {userProfile?.displayName || currentUser.displayName || "User"}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Cloud Sync Active"></span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
                              {userProfile?.username ? (
                                <span className="text-[9px] text-[#2563eb] truncate font-bold">@{userProfile.username}</span>
                              ) : (
                                <span className="text-[9px] text-neutral-500 truncate font-bold">@user</span>
                              )}
                              {userProfile?.role === "Admin" && (
                                <span className="px-1 py-px rounded border border-[#2563eb]/30 text-[#2563eb] bg-[#2563eb]/10 text-[7px] uppercase tracking-wider font-extrabold shrink-0 leading-none">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-neutral-500 block truncate mt-0.5">{currentUser.email}</span>
                          </div>
                        </div>
                      </div>

                      {userProfile?.role === "Admin" && (
                        <>
                          <button
                            onClick={() => {
                              setDbPanelTab("users");
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-[#2563eb] hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                          >
                            <User size={12} className="text-[#2563eb]" />
                            <span>User Manager</span>
                          </button>
                          <button
                            onClick={() => {
                              setDbPanelTab("admin");
                              setEditingItem(null);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-[#2563eb] hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                          >
                            <Settings size={12} className="text-[#2563eb]" />
                            <span>Vault Admin</span>
                          </button>
                          <div className="border-b border-neutral-900 my-1"></div>
                        </>
                      )}

                      {/* Theme selection row */}
                      <div className="px-2.5 py-2 hover:bg-neutral-900 rounded-lg transition-colors flex items-center justify-between border border-transparent">
                        <div className="flex items-center gap-2 text-neutral-400">
                          {theme === "light" && <Sun size={12} className="text-neutral-500" />}
                          {theme === "dark" && <Moon size={12} className="text-neutral-500" />}
                          {theme === "system" && <Monitor size={12} className="text-neutral-500" />}
                          <span>Theme</span>
                        </div>
                        <select
                          value={theme}
                          onChange={(e) => handleSetTheme(e.target.value as 'light' | 'dark' | 'system')}
                          className="bg-neutral-950 border border-neutral-850 rounded px-1.5 py-0.5 text-neutral-300 focus:outline-none focus:border-[#2563eb] text-[10px] cursor-pointer"
                        >
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>

                      <div className="border-b border-neutral-900 my-1"></div>

                      <button
                        onClick={() => {
                          setAuthModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent"
                      >
                        <Settings size={12} className="text-neutral-500" />
                        <span>Setting</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            localStorage.removeItem("vice_vault_mock_user");
                            if (auth) {
                              await signOut(auth);
                            }
                            setCurrentUser(null);
                            setUserProfile(null);
                            setIsCloudDataLoaded(false);
                            setAccentColor("#2563eb");
                            setUserDropdownOpen(false);

                            const savedBalls = localStorage.getItem("vice_vault_balls");
                            setBalls(savedBalls ? JSON.parse(savedBalls) : INITIAL_OWNED_BALLS);
                          } catch (err) {
                            console.error("Sign out error:", err);
                          }
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-red-900/30"
                      >
                        <LogOut size={12} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-[11px] font-mono hover:text-[#2563eb] border transition-all cursor-pointer flex items-center gap-2 shadow-sm px-3 py-1.5 rounded-xl text-neutral-300 border border-neutral-850 hover:border-neutral-750 bg-neutral-950 hover:bg-neutral-900 font-bold"
                id="login-signup-btn"
              >
                <User size={13} className="text-neutral-500" />
                <span>Login / Sign Up</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Single-View Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile View Tab Switcher */}
        {currentUser && (
          <div className="lg:hidden flex p-1.5 bg-neutral-950 border border-neutral-850 rounded-2xl mb-6 shadow-md">
            <button
              onClick={() => setMobileTab("bag")}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mobileTab === "bag"
                  ? "bg-[#2563eb] text-black font-extrabold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <GolfBagIcon className="w-4 h-4" />
              <span>My Bag</span>
            </button>
            <button
              onClick={() => setMobileTab("catalog")}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mobileTab === "catalog"
                  ? "bg-[#2563eb] text-black font-extrabold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BallVaultIcon className={`w-4 h-4 ${mobileTab === "catalog" ? "text-neutral-950" : "text-neutral-400"}`} />
              <span>Ball Vault</span>
            </button>
          </div>
        )}

        {/* Responsive Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5 COLUMNS: DISCOVERY CATALOG DATABASE & NEW REGISTRATION */}
          <section className={`${currentUser ? "lg:col-span-6" : "lg:col-span-12 max-w-4xl mx-auto w-full"} space-y-6 ${!currentUser || mobileTab === "catalog" ? "block" : "hidden lg:block"}`}>
            
            {/* Database Panel Box */}
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl overflow-hidden shadow-md">
              
              {/* Registry Database Header Banner (Static, removing redundant Admin Tab) */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-neutral-850 bg-neutral-950">
                <BallVaultIcon className="w-5 h-5 text-[#2563eb]" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                  Ball Vault ({catalog.length} Available Designs)
                </span>
              </div>

              {/* Panel tab content rendering */}
              <div className="p-4">
                {dbPanelTab === "admin" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Back to Search button for Catalog Admin */}
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                      <div className="flex items-center gap-1.5 text-[#2563eb]">
                        <Settings className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                        <span className="text-[10px] font-mono uppercase font-black tracking-wider">
                          {editingItem ? "Change Catalog Specifications Editor" : "Catalog Specifications Editor"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDbPanelTab("browse");
                          setEditingItem(null);
                        }}
                        className="px-2.5 py-1 text-[10px] font-mono font-black text-[#2563eb] hover:text-white hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all cursor-pointer"
                      >
                        ◄ Back to Search
                      </button>
                    </div>
                    {/* Inner admin toggle buttons */}
                    <div className="flex gap-2 p-1 bg-neutral-950/60 border border-neutral-850 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setShowXlsImporter(false);
                          setEditingItem(null);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          !showXlsImporter
                            ? "bg-neutral-900 text-[#2563eb] border border-neutral-800"
                            : "text-neutral-500 hover:text-neutral-350"
                        }`}
                      >
                        <PlusSquare className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Single Form</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowXlsImporter(true);
                          setEditingItem(null);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          showXlsImporter
                            ? "bg-neutral-900 text-[#2563eb] border border-neutral-800"
                            : "text-neutral-500 hover:text-neutral-350"
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Excel / XLS Bulk</span>
                      </button>
                    </div>

                    {!showXlsImporter ? (
                      <AddMissingBallForm 
                        onAddCatalogItem={handleAddCatalogItem} 
                        onUpdateCatalogItem={handleUpdateCatalogItem}
                        editItem={editingItem}
                        onCancelEdit={() => setEditingItem(null)}
                      />
                    ) : (
                      <XlsImporter onImportItems={handleXlsImportCatalogItems} />
                    )}

                    {/* Registry Manager Header */}
                    <div className="border-t border-neutral-850 pt-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider text-[#2563eb] font-extrabold">
                            Registry Catalog Manager
                          </h4>
                          <p className="text-[10px] text-neutral-400">
                            Prune and edit existing designs to prevent duplicate similar entries.
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[9px] bg-neutral-950 border border-neutral-850 text-neutral-400 px-2 py-0.5 rounded font-mono">
                            {catalog.length} TEMPLATES
                          </span>
                          {catalog.length > 0 && (
                            showDeleteAllCatalogConfirm ? (
                              <div className="flex items-center gap-1 bg-rose-950/30 border border-rose-900/60 rounded-md p-0.5 animate-pulse">
                                <span className="text-[8px] font-mono text-rose-300 px-1 uppercase font-bold">Wipe?</span>
                                <button
                                  type="button"
                                  onClick={handleDeleteAllCatalog}
                                  className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[8px] font-mono rounded font-bold cursor-pointer transition-all"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowDeleteAllCatalogConfirm(false)}
                                  className="px-1 text-[8px] font-mono text-neutral-400 hover:text-white rounded cursor-pointer transition-all"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowDeleteAllCatalogConfirm(true)}
                                className="text-[9px] font-mono text-neutral-500 hover:text-rose-400 border border-neutral-850 hover:border-rose-950/40 bg-neutral-950/30 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                              >
                                Delete All
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Admin filter input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={13} />
                        <input
                          type="text"
                          placeholder="Search database templates..."
                          value={adminSearchQuery}
                          onChange={(e) => setAdminSearchQuery(e.target.value)}
                          className="w-full bg-neutral-950 hover:bg-neutral-900/60 border border-neutral-850 rounded-xl px-9 py-2 text-xs text-white placeholder-neutral-550 outline-none focus:border-neutral-750 transition-all font-mono"
                        />
                      </div>

                      {/* Admin items list */}
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 font-sans">
                        {catalog
                          .filter(item => {
                            const q = adminSearchQuery.toLowerCase();
                            return item.model.toLowerCase().includes(q) || item.color.toLowerCase().includes(q);
                          })
                          .map((item) => (
                            <div 
                              key={item.id}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                editingItem?.id === item.id 
                                  ? "bg-neutral-900 border-[#2563eb]" 
                                  : "bg-neutral-950/60 hover:bg-neutral-900/80 border-neutral-850"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-8 h-8 rounded-full bg-black/40 border border-neutral-950 flex items-center justify-center shrink-0 overflow-hidden">
                                  <BallVisual 
                                    color={item.color} 
                                    model={item.model} 
                                    size="sm" 
                                    className="!w-8 !h-8 shadow-none border-none" 
                                    customImage={item.customImage} 
                                  />
                                </span>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-bold text-xs text-white truncate max-w-[120px] md:max-w-[160px]">
                                      {item.model}
                                    </h5>
                                  </div>
                                  <p className="text-[10px] text-neutral-400 truncate mt-0.5 flex flex-wrap gap-x-2 items-center">
                                    <span className="font-medium text-neutral-300">{item.color}</span>
                                    {item.notes && (
                                      <>
                                        <span className="text-neutral-600 font-mono select-none">•</span>
                                        <span className="text-neutral-400 italic text-[10px] truncate max-w-[150px] md:max-w-[280px]" title={item.notes}>
                                          {item.notes}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                {deleteConfirmId === item.id ? (
                                  <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-900/60 rounded-md p-0.5 animate-pulse">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteCatalogItem(item.id);
                                        setDeleteConfirmId(null);
                                      }}
                                      className="py-1 px-1.5 text-[8px] font-mono font-black uppercase text-rose-400 hover:text-white rounded transition-all cursor-pointer"
                                      title="Confirm delete specification template"
                                    >
                                      Delete?
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-1 text-[9px] text-neutral-400 hover:text-white rounded transition-all cursor-pointer font-bold"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowXlsImporter(false); // force switch to form
                                        setEditingItem(item);
                                        // Smoothly scroll to top of database panel
                                        const el = document.getElementById("register-missing-database-panel");
                                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }}
                                      className="p-1 px-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-750 text-[#2563eb] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono font-black shrink-0 cursor-pointer"
                                      title="Edit Entry Specs"
                                    >
                                      <Pencil size={11} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(item.id)}
                                      className="p-1 rounded-md bg-neutral-900 hover:bg-rose-950/50 border border-neutral-850 hover:border-rose-900 text-neutral-550 hover:text-rose-450 transition-colors cursor-pointer"
                                      title="Delete Specification"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}

                        {catalog.length === 0 ? (
                          <div className="py-8 px-4 text-center border border-dashed border-neutral-850 rounded-xl bg-neutral-950/10 text-neutral-500 text-xs">
                            Ball Vault templates list is empty. Create some above or use Excel Bulk Import!
                          </div>
                        ) : (
                          catalog.filter(item => {
                            const q = adminSearchQuery.toLowerCase();
                            return item.model.toLowerCase().includes(q) || item.color.toLowerCase().includes(q);
                          }).length === 0 && (
                            <div className="py-6 text-center border border-dashed border-neutral-850 rounded-xl bg-neutral-950/10 text-neutral-500 text-xs">
                              No templates match "{adminSearchQuery}"
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {dbPanelTab === "users" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header Banner */}
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                      <div className="flex items-center gap-1.5 text-[#2563eb]">
                        <User className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                        <span className="text-[10px] font-mono uppercase font-black tracking-wider">User Registry Manager</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDbPanelTab("browse");
                          setEditingUserId(null);
                        }}
                        className="px-2.5 py-1 text-[10px] font-mono font-black text-[#2563eb] hover:text-white hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all cursor-pointer"
                      >
                        ◄ Back to Search
                      </button>
                    </div>

                    {isLoadingUsers ? (
                      <div className="py-12 text-center text-neutral-500 font-mono text-xs flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="animate-spin text-[#2563eb] w-6 h-6" />
                        <span>Querying user accounts...</span>
                      </div>
                    ) : usersError ? (
                      <div className="py-6 text-center text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-xl font-mono text-xs p-4">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
                        <span>{usersError}</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase flex justify-between items-center">
                          <span>Registered Accounts ({usersList.length})</span>
                          <button onClick={fetchUsers} className="text-[#2563eb] hover:underline flex items-center gap-1">
                            <RefreshCw size={10} /> Reload
                          </button>
                        </div>

                        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                          {[...usersList].sort((a, b) => {
                            const isSelfA = (a.uid || a.id) === currentUser?.uid;
                            const isSelfB = (b.uid || b.id) === currentUser?.uid;
                            if (isSelfA && !isSelfB) return -1;
                            if (!isSelfA && isSelfB) return 1;
                            
                            const roleA = a.role || "User";
                            const roleB = b.role || "User";
                            if (roleA === "Admin" && roleB !== "Admin") return -1;
                            if (roleA !== "Admin" && roleB === "Admin") return 1;
                            
                            const nameA = (a.displayName || a.name || "").trim().toLowerCase();
                            const nameB = (b.displayName || b.name || "").trim().toLowerCase();
                            if (nameA < nameB) return -1;
                            if (nameA > nameB) return 1;
                            
                            const userA = (a.username || "").trim().toLowerCase();
                            const userB = (b.username || "").trim().toLowerCase();
                            if (userA < userB) return -1;
                            if (userA > userB) return 1;
                            
                            const idA = a.uid || a.id || "";
                            const idB = b.uid || b.id || "";
                            return idA.localeCompare(idB);
                          }).map((user) => {
                            const userUid = user.uid || user.id;
                            const isSelf = userUid === currentUser?.uid;
                            const isEditing = editingUserId === userUid;

                            if (isEditing) {
                              return (
                                <div key={userUid} className="bg-neutral-900 border border-[#2563eb] rounded-xl p-4 space-y-4 font-mono text-xs">
                                  <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                                    <AvatarRenderer avatarUrl={editAvatarUrl} name={editName} size="md" color={editColor} />
                                    <div>
                                      <span className="text-white font-bold block">Editing User Profile</span>
                                      <span className="text-neutral-555 text-[10px]">ID: {userUid}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Display Name</label>
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none"
                                        placeholder="Name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Username</label>
                                      <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none"
                                        placeholder="username"
                                      />
                                    </div>
                                  </div>

                                  {/* System Role + Email Address */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">System Role</label>
                                      <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value as "Admin" | "User")}
                                        disabled={isSelf}
                                        className="w-full bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-lg p-2 text-xs focus:border-[#2563eb] outline-none cursor-pointer disabled:opacity-50"
                                      >
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                      </select>
                                      {isSelf && <span className="text-[8px] text-amber-500 mt-1 block font-bold">You cannot demote yourself</span>}
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Email Address</label>
                                      <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none"
                                        placeholder="email@domain.com"
                                      />
                                    </div>
                                  </div>

                                  {/* New Password + Confirm Password */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">New Password</label>
                                      <div className="relative">
                                        <input
                                          type="password"
                                          value={editPassword}
                                          onChange={(e) => setEditPassword(e.target.value)}
                                          onFocus={() => setEditPasswordFocused(true)}
                                          onBlur={() => setTimeout(() => setEditPasswordFocused(false), 200)}
                                          className={`w-full bg-neutral-950 border rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none ${editPassword && editPasswordConfirm && editPassword !== editPasswordConfirm ? "border-red-600" : "border-neutral-800"}`}
                                          placeholder="Leave blank to keep"
                                        />
                                        {editPasswordFocused && (
                                          <div className="absolute z-20 left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-2xl space-y-1.5 font-mono text-[9px] text-left">
                                            <div className="text-[8px] uppercase text-neutral-500 font-bold mb-1">Password Requirements:</div>
                                            <div className="flex items-center gap-1.5">
                                              <span className={editPassword.length >= 8 ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                                {editPassword.length >= 8 ? "✓" : "○"}
                                              </span>
                                              <span className={editPassword.length >= 8 ? "text-emerald-300" : "text-neutral-400"}>At least 8 characters</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className={/[A-Z]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                                {/[A-Z]/.test(editPassword) ? "✓" : "○"}
                                              </span>
                                              <span className={/[A-Z]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One uppercase letter</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className={/[a-z]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                                {/[a-z]/.test(editPassword) ? "✓" : "○"}
                                              </span>
                                              <span className={/[a-z]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One lowercase letter</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className={/[0-9]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                                {/[0-9]/.test(editPassword) ? "✓" : "○"}
                                              </span>
                                              <span className={/[0-9]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One number</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? "text-emerald-400 font-bold" : "text-neutral-600"}>
                                                {/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? "✓" : "○"}
                                              </span>
                                              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? "text-emerald-300" : "text-neutral-400"}>One special character</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Confirm Password</label>
                                      <div className="relative">
                                        <input
                                          type="password"
                                          value={editPasswordConfirm}
                                          onChange={(e) => setEditPasswordConfirm(e.target.value)}
                                          className={`w-full bg-neutral-950 border rounded-lg p-2 text-xs focus:border-[#2563eb] outline-none pr-7 ${
                                            editPasswordConfirm && editPassword !== editPasswordConfirm
                                              ? "border-red-600 text-red-400"
                                              : editPasswordConfirm && editPassword === editPasswordConfirm && editPassword
                                              ? "border-emerald-600 text-white"
                                              : "border-neutral-800 text-white"
                                          }`}
                                          placeholder="Re-enter password"
                                        />
                                        {editPasswordConfirm && (
                                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold">
                                            {editPassword === editPasswordConfirm
                                              ? <span className="text-emerald-400">✓</span>
                                              : <span className="text-red-500">✗</span>
                                            }
                                          </div>
                                        )}
                                      </div>
                                      {editPasswordConfirm && editPassword !== editPasswordConfirm && (
                                        <span className="text-[8px] text-red-500 mt-0.5 block">Passwords do not match</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Profile Picture + Accent Color side by side */}
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Profile Picture */}
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Profile Picture</label>
                                      <div className="grid grid-cols-4 gap-1.5 bg-neutral-950 border border-neutral-800 p-2 rounded-lg">
                                        {["preset-1", "preset-2", "preset-3", "preset-4", "preset-5", "preset-6", "preset-7", "preset-8"].map((presetId) => (
                                          <button
                                            key={presetId}
                                            type="button"
                                            onClick={() => setEditAvatarUrl(presetId)}
                                            className="p-0.5 rounded-full relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-transparent shrink-0"
                                            style={{
                                              boxShadow: editAvatarUrl === presetId ? `0 0 6px ${editColor}` : "none",
                                              borderColor: editAvatarUrl === presetId ? "rgba(255,255,255,0.4)" : "transparent"
                                            }}
                                          >
                                            <AvatarRenderer avatarUrl={presetId} name={editName || "VV"} size="sm" color={editColor} />
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Accent Color — 2 rows of 5 */}
                                    <div>
                                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Accent Color</label>
                                      <div className="bg-neutral-950 border border-neutral-800 p-2 rounded-lg">
                                        <div className="grid grid-cols-5 gap-1.5">
                                          {ACCENT_COLORS.slice(0, 5).map(c => (
                                            <button
                                              key={c.value}
                                              type="button"
                                              onClick={() => setEditColor(c.value)}
                                              className="w-6 h-6 rounded-full border border-transparent transition-transform hover:scale-110 active:scale-95 mx-auto block"
                                              style={{
                                                backgroundColor: c.value,
                                                boxShadow: editColor.toLowerCase() === c.value.toLowerCase() ? `0 0 6px ${c.value}` : "none",
                                                borderColor: editColor.toLowerCase() === c.value.toLowerCase() ? "white" : "transparent"
                                              }}
                                              title={c.name}
                                            />
                                          ))}
                                        </div>
                                        <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                                          {ACCENT_COLORS.slice(5).map(c => (
                                            <button
                                              key={c.value}
                                              type="button"
                                              onClick={() => setEditColor(c.value)}
                                              className="w-6 h-6 rounded-full border border-transparent transition-transform hover:scale-110 active:scale-95 mx-auto block"
                                              style={{
                                                backgroundColor: c.value,
                                                boxShadow: editColor.toLowerCase() === c.value.toLowerCase() ? `0 0 6px ${c.value}` : "none",
                                                borderColor: editColor.toLowerCase() === c.value.toLowerCase() ? "white" : "transparent"
                                              }}
                                              title={c.name}
                                            />
                                          ))}
                                          {/* Custom Color Picker */}
                                          {(() => {
                                            const isPreset = ACCENT_COLORS.some(c => c.value.toLowerCase() === editColor.toLowerCase());
                                            return (
                                              <div 
                                                className="w-6 h-6 rounded-full border relative flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 overflow-hidden mx-auto"
                                                style={{ 
                                                  backgroundColor: isPreset ? "#1e1e1e" : editColor,
                                                  borderColor: !isPreset ? "#ffffff" : "rgba(255,255,255,0.1)",
                                                  boxShadow: !isPreset ? `0 0 6px ${editColor}` : "none"
                                                }}
                                                title="Custom Color Picker"
                                              >
                                                <input 
                                                  type="color" 
                                                  value={isPreset ? "#2563eb" : editColor}
                                                  onChange={(e) => setEditColor(e.target.value)}
                                                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                />
                                                {isPreset ? (
                                                  <Palette size={9} className="text-neutral-400" />
                                                ) : (
                                                  <Check size={9} className="text-black font-black" />
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 justify-end pt-2 border-t border-neutral-800">
                                    <button
                                      type="button"
                                      onClick={() => setEditingUserId(null)}
                                        className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (editPassword && editPassword !== editPasswordConfirm) {
                                          alert("Passwords do not match. Please confirm the password correctly.");
                                          return;
                                        }
                                        const success = await handleUpdateUser(userUid, {
                                          displayName: editName,
                                          username: editUsername,
                                          role: editRole,
                                          preferredColor: editColor,
                                          avatarUrl: editAvatarUrl,
                                          email: editEmail,
                                          password: editPassword
                                        });
                                        if (success) {
                                          setEditingUserId(null);
                                          setEditPasswordConfirm("");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#b5e000] text-black font-extrabold rounded-lg transition-all cursor-pointer text-[10px]"
                                    >
                                      Save Settings
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div 
                                key={userUid}
                                className="bg-neutral-950/60 border border-neutral-850 hover:border-neutral-750 p-3 rounded-xl flex items-center justify-between gap-3 transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <AvatarRenderer avatarUrl={user.avatarUrl} name={user.displayName || user.name || "User"} size="md" color={user.preferredColor || "#2563eb"} />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-xs truncate max-w-[130px]">{user.displayName || user.name || "User"}</span>
                                      {isSelf && (
                                        <span className="text-[7.5px] font-mono text-[#2563eb] px-1 bg-[#2563eb]/10 border border-[#2563eb]/25 rounded uppercase">
                                          Self
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9.5px] text-neutral-500 font-mono flex flex-wrap gap-x-1.5 items-center">
                                      {user.username && (
                                        <span className="text-neutral-400">@{user.username}</span>
                                      )}
                                      {user.email && (
                                        <>
                                          <span className="text-neutral-700 select-none">•</span>
                                          <span className="truncate max-w-[120px]">{user.email}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      {user.role === "Admin" ? (
                                        <span className="px-1 py-0.2 rounded border border-[#2563eb]/30 text-[#2563eb] bg-[#2563eb]/10 text-[8px] uppercase tracking-wider font-bold font-mono">
                                          Admin
                                        </span>
                                      ) : (
                                        <span className="px-1 py-0.2 rounded border border-neutral-800 text-neutral-400 bg-neutral-900/40 text-[8px] uppercase tracking-wider font-bold font-mono">
                                          User
                                        </span>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <span className="text-[8px] text-neutral-600 font-mono">Accent:</span>
                                        <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: user.preferredColor || "#2563eb" }}></span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditingUser(user)}
                                    className="p-1 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-750 text-[#2563eb] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono font-black cursor-pointer"
                                    title="Edit User Settings"
                                  >
                                    <Pencil size={10} />
                                    <span>Edit</span>
                                  </button>
                                  {!isSelf && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you absolutely sure you want to delete user ${user.displayName || user.name || "this user"}? This will also purge their custom specifications and locker storage permanently.`)) {
                                          handleDeleteUser(userUid);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/50 border border-neutral-800 hover:border-rose-900 text-neutral-555 hover:text-rose-450 transition-colors cursor-pointer"
                                      title="Delete User"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {dbPanelTab === "browse" && (
                  <div className="space-y-4">
                    
                    {/* Database Header */}
                    <div className="flex items-center justify-between text-[11px] font-mono border-b border-neutral-850 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-neutral-400 font-bold">
                        <BallVaultIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span className="uppercase font-bold">Ball Vault</span>
                      </div>
                    </div>


                    {/* Database Search Filter control */}
                    <div className="space-y-3">
                      
                      {/* Live keyword filter input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                        <input
                          type="text"
                          placeholder="Search database by brand, model, or color..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-neutral-950 hover:bg-neutral-900/60 border border-neutral-850 rounded-xl px-9 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-stone-550 transition-all"
                          id="catalog-search-input"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 hover:text-white"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>

                      {/* Brand quick filter drop-down */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono uppercase text-neutral-450 shrink-0">Filter model:</span>
                        <div className="relative flex-1 max-w-[180px]">
                          <select
                            value={selectedBrandFilter}
                            onChange={(e) => setSelectedBrandFilter(e.target.value)}
                            className="w-full bg-neutral-950 text-neutral-300 border border-neutral-850 hover:border-neutral-750 focus:border-[#2563eb] rounded-xl px-3 py-1.5 text-[11px] font-semibold outline-none transition-all cursor-pointer appearance-none pr-8 font-mono uppercase tracking-wider"
                          >
                            <option value="ALL">All Varieties</option>
                            {registeredModels.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-550">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Catalog results count label */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-850 pb-2">
                      <span>Showing {sortedCatalog.length} Matching Models</span>
                      <span>{currentUser ? "Click + to add any to your Bag" : "Login to add balls to your bag"}</span>
                    </div>

                    {/* Catalog item list */}
                    {sortedCatalog.length === 0 ? (
                      <div className="py-12 text-center rounded-xl border border-dashed border-neutral-850 bg-neutral-950/20">
                        <Database className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                        <h4 className="font-bold text-neutral-400 text-sm">No balls found in registry</h4>
                        <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                          {currentUser 
                            ? `We didn't find any designs fitting "${searchQuery}". Register your custom brand or missing color design inside the Add Missing Ball tab!`
                            : `We didn't find any designs fitting "${searchQuery}".`}
                        </p>
                        {currentUser && (
                          <button
                            onClick={() => {
                              setDbPanelTab("register");
                              // Fallback seed
                              if (searchQuery) setDbPanelTab("register");
                            }}
                            className="mt-3 text-xs font-bold text-[#2563eb] hover:underline inline-flex items-center gap-1"
                          >
                            Register "{searchQuery || 'Custom Ball'}" now <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                        {sortedCatalog.map((item) => (
                          <CatalogItemCard 
                            key={item.id} 
                            item={item} 
                            isReadOnly={!currentUser}
                            onAddToLocker={handleAddBallFromCatalog}
                          />
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>
          </section>

            {/* RIGHT 7 COLUMNS: LOCKER INVENTORY (BALLS YOU OWN) */}
            {currentUser && (
            <section className={`lg:col-span-6 space-y-6 ${mobileTab === "bag" ? "block" : "hidden lg:block"}`}>
              
              {/* Quick Metrics display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider">
                      Total Owned Balls
                    </span>
                    <span className="font-sans font-black text-2xl text-white tracking-tight">
                      {totalOwnedCount}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-[#2563eb]">
                    <GolfBallStackIcon className="w-[22px] h-[22px]" />
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider">
                      Unique Balls
                    </span>
                    <span className="font-sans font-black text-2xl text-white tracking-tight">
                      {totalUniqueModels}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-[#2563eb]">
                    <GolfBallOutlineIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Owned Locker Container */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <GolfBagIcon className="w-5 h-5 text-neutral-400" />
                    <h2 className="font-sans font-black text-white text-base uppercase tracking-wider">
                      My Bag
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {balls.length > 0 && (
                      showDeleteAllLockerConfirm ? (
                        <div className="flex items-center gap-1.5 bg-rose-950/30 border border-rose-900/60 rounded-lg p-0.5 px-2 animate-pulse">
                          <span className="text-[10px] font-mono text-rose-300 uppercase font-black">Wipe All?</span>
                          <button
                            type="button"
                            onClick={handleDeleteAllLocker}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-mono font-bold py-0.5 px-2 rounded cursor-pointer transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteAllLockerConfirm(false)}
                            className="text-neutral-400 hover:text-white text-[9px] font-mono py-0.5 px-1 rounded cursor-pointer transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteAllLockerConfirm(true)}
                          className="text-[10px] font-mono text-neutral-500 hover:text-rose-450 border border-neutral-850 hover:border-rose-950/40 bg-neutral-950/40 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                        >
                          Delete All
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Package Type Counts Status Bar */}
                {balls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-850/70 text-center text-xs font-mono">
                    <div className="flex flex-col p-1.5 bg-neutral-900/50 rounded-lg">
                      <span className="text-neutral-500 text-[9px] uppercase tracking-wider">Balls</span>
                      <span className="text-white font-black text-sm mt-0.5">{eaCount}</span>
                    </div>
                    <div className="flex flex-col p-1.5 bg-neutral-900/50 rounded-lg border-x border-neutral-850/10">
                      <span className="text-neutral-500 text-[9px] uppercase tracking-wider">Sleeves</span>
                      <span className="text-white font-black text-sm mt-0.5">{sleeveCount}</span>
                    </div>
                    <div className="flex flex-col p-1.5 bg-neutral-900/50 rounded-lg">
                      <span className="text-neutral-500 text-[9px] uppercase tracking-wider">Boxes</span>
                      <span className="text-white font-black text-sm mt-0.5">{boxCount}</span>
                    </div>
                  </div>
                )}

                {balls.length === 0 ? (
                  <div className="py-20 text-center rounded-3xl border-2 border-dashed border-neutral-850 bg-neutral-950/10 text-neutral-400">
                    <GolfBagIcon className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                    <h4 className="font-bold text-neutral-350 text-sm">Your bag is currently empty</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      You don't have any balls recorded in your inventory. Explore the database on the left to locate and log your balls!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4" id="owned-list-container">
                    {balls.map((ball) => (
                      <OwnedBallCard
                        key={ball.id}
                        ball={ball}
                        onUpdateBall={handleUpdateBall}
                        onDelete={handleDeleteBall}
                      />
                    ))}
                  </div>
                )}
              </div>

            </section>
          )}
        </div>

      </main>

      {/* Styled Footer space */}
      <footer className="border-t border-neutral-850 bg-neutral-950 py-6 mt-12 text-neutral-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span>© 2026 Golf Ball Vault. Clean, coordinates visual workspace.</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span> Munich Design Engine ◄</span>
            <span className="text-neutral-800">|</span>
            <span>All trade marks remain property of original owners.</span>
          </div>
        </div>
      </footer>

      {/* Firebase Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        currentUser={currentUser}
        userProfile={userProfile}
        theme={theme}
        onThemeChange={handleSetTheme}
        onProfileUpdate={(updatedUser) => {
          setCurrentUser(updatedUser);
          setUserProfile({
            displayName: updatedUser.displayName,
            username: updatedUser.username,
            avatarUrl: updatedUser.photoURL,
            preferredColor: updatedUser.preferredColor,
            role: updatedUser.role
          });
          setAccentColor(updatedUser.preferredColor);
        }}
        onMockLogin={(mockUser) => {
          setCurrentUser(mockUser);
          setUserProfile({
            displayName: mockUser.displayName,
            username: mockUser.username,
            avatarUrl: mockUser.photoURL,
            preferredColor: mockUser.preferredColor,
            role: mockUser.role
          });
          setAccentColor(mockUser.preferredColor);
        }}
      />

    </div>
  );
}
