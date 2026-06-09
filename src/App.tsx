/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GolfBall, CatalogItem, BallModel, BallColor, BallCondition } from "./types";
import { VICE_BALLS_SPECS, COLOR_STYLES, SCRAPED_BALLS } from "./constants";
import CatalogItemCard from "./components/CatalogItemCard";
import AddMissingBallForm from "./components/AddMissingBallForm";
import * as XLSX from "xlsx";
import XlsImporter from "./components/XlsImporter";
import FriendsPortal from "./components/FriendsPortal";
import OwnedBallCard from "./components/OwnedBallCard";
import TrophyCase from "./components/TrophyCase";
import ImportExportModal from "./components/ImportExportModal";
import VaultFilterBar from "./components/VaultFilterBar";
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
  Mail,
  X,
  Eye,
  EyeOff,
  ShoppingBag,
  FileText,
  Users,
  Heart,
  Trophy
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
## 5. Production Bug Fixes

During the live deployment of the migration, several production issues were identified and resolved:
1. **Firebase Storage Bucket Alignment**: Updated the default bucket URL in the backend server from `.appspot.com` to the newer `.firebasestorage.app` domain which aligned with the newly provisioned Firebase Spark plan storage bucket.
2. **Firestore Payload Limits Bypass**: The initial API-based migration endpoint crashed the Render server due to the 11.5MB Base64 payload exceeding Firestore's 10MB batch limit. We bypassed the server and executed a secure, direct local script using the Firebase Admin SDK to seamlessly migrate all items.
3. **App Crash Resilience**: Pushed a critical frontend fix to `App.tsx` utilizing a `safeJSONParse` helper to gracefully handle corrupted or empty strings in `localStorage` which were causing fatal React rendering crashes on boot.
4. **Firebase Security Configuration**: Instructed the configuration of Firebase Storage security rules to allow public read access, resolving HTTP 403 Forbidden errors when fetching catalog images. Also registered the `vice-vault.onrender.com` domain in Firebase Auth to ensure OAuth login options remain fully functional.      {/* Side Pocket */}
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
const INITIAL_OWNED_BALLS: GolfBall[] = [];

const filterLegacyBalls = (ballsList: any[]): GolfBall[] => {
  if (!Array.isArray(ballsList)) return [];
  return ballsList.filter((b: any) => b && b.id && !/-V\d+$/.test(b.id));
};

const safeJSONParse = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn("Failed to parse JSON from localStorage:", e);
    return null;
  }
};


function sanitizeId(model: string, color: string, name?: string, variation?: string, year?: string): string {
  const clean = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const modelPart = clean(model);
  const colorPart = clean(color);
  const namePart = name ? clean(name) : "";
  const varPart = variation ? clean(variation) : "";
  
  let base = modelPart;
  if (namePart) base += `-${namePart}`;
  base += `-${colorPart}`;
  if (varPart) base += `-${varPart}`;
  return base;
}


// Helper to generate the standard default Vice catalog entries
const generateDefaultCatalog = (): CatalogItem[] => {
  return SCRAPED_BALLS;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "124, 179, 0";
};

const getHash = (model: string, name: string, color: string, variation: string, year: string) => {
  return `${(model||"").trim().toLowerCase()}|${(name||"").trim().toLowerCase()}|${(color||"").trim().toLowerCase()}|${(variation||"").trim().toLowerCase()}|${(year||"").trim().toLowerCase()}`;
};

const getOwnedUniqueCount = (balls: GolfBall[], catalog: CatalogItem[]) => {
  const ownedUniqueHashes = new Set<string>();
  
  balls.forEach(b => {
    const isGroupBox = b.packageType === "box" && (b.color === "Mixed" || b.color === "" || b.variation === "Mixed" || b.variation === "") && catalog.some(c => 
      c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
      (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase() &&
      (c.groupColor || c.groupVariation)
    );

    if (b.bundleItems && b.bundleItems.length > 0) {
      b.bundleItems.forEach(item => {
        const c = catalog.find(cat => cat.id === item.catalogId);
        if (c) {
          ownedUniqueHashes.add(getHash(c.model, c.name || "", c.color, c.variation || "", c.year || ""));
        }
      });
    } else if (isGroupBox) {
      catalog.filter(c => 
        c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase()
      ).forEach(c => {
        ownedUniqueHashes.add(getHash(c.model, c.name || "", c.color, c.variation || "", c.year || ""));
      });
    } else {
      ownedUniqueHashes.add(getHash(b.model as string, b.name || "", b.color as string, b.variation || "", b.year || ""));
    }
  });
  
  return ownedUniqueHashes.size;
};

const getUniqueCatalogItems = (balls: GolfBall[], catalog: CatalogItem[]): CatalogItem[] => {
  const uniqueItems = new Map<string, CatalogItem>();
  
  balls.forEach(b => {
    const isGroupBox = b.packageType === "box" && (b.color === "Mixed" || b.color === "" || b.variation === "Mixed" || b.variation === "") && catalog.some(c => 
      c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
      (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase() &&
      (c.groupColor || c.groupVariation)
    );

    if (b.bundleItems && b.bundleItems.length > 0) {
      b.bundleItems.forEach(item => {
        const c = catalog.find(cat => cat.id === item.catalogId);
        if (c) {
          uniqueItems.set(c.id, c);
        }
      });
    } else if (isGroupBox) {
      catalog.filter(c => 
        c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase()
      ).forEach(c => {
        uniqueItems.set(c.id, c);
      });
    } else {
      const c = catalog.find(cat => 
        cat.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        (cat.name || cat.model).trim().toLowerCase() === (b.name || b.model).trim().toLowerCase() &&
        cat.color.trim().toLowerCase() === b.color.trim().toLowerCase() &&
        (cat.variation || "").trim().toLowerCase() === (b.variation || "").trim().toLowerCase() &&
        (cat.year || "").trim().toLowerCase() === (b.year || "").trim().toLowerCase()
      );
      if (c) {
        uniqueItems.set(c.id, c);
      }
    }
  });
  
  return Array.from(uniqueItems.values());
};

export default function App() {
  // Theme state: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem("vice_vault_theme") as 'light' | 'dark' | 'system') || "system";
  });

  // Toast state for beautiful UI notifications matching site theme
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Firebase Auth & Cloud Sync states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<{ uid: string; displayName: string; username?: string; avatarUrl?: string; preferredColor: string; role?: string; shareBag?: boolean; shareToken?: string; pendingFriendRequestsCount?: number; wishlist?: string[] } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false);
  const [isCloudDataLoaded, setIsCloudDataLoaded] = useState(false);
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [showClearWishlistConfirm, setShowClearWishlistConfirm] = useState(false);
  const [showTrophyCase, setShowTrophyCase] = useState(false);

  // Shared Locker states
  const [sharedLockerOwner, setSharedLockerOwner] = useState<any | null>(null);
  const [sharedLockerBalls, setSharedLockerBalls] = useState<any[]>([]);
  const [sharedLockerError, setSharedLockerError] = useState<string | null>(null);
  const [isSharedViewLoading, setIsSharedViewLoading] = useState(false);

  // State for tracked owned balls
  const [balls, setBalls] = useState<GolfBall[]>(() => {
    const saved = localStorage.getItem("vice_vault_guest_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return filterLegacyBalls(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved balls:", e);
      }
    }
    return INITIAL_OWNED_BALLS;
  });

  const [bagFilter, setBagFilter] = useState<'ea' | 'sleeve' | 'box' | null>(null);
  const [bagSortBy, setBagSortBy] = useState<string>('added_desc');
  const [bagTab, setBagTab] = useState<"owned" | "wishlist">("owned");

  useEffect(() => {
    if (bagTab === "wishlist") {
      setShowTrophyCase(false);
    }
  }, [bagTab]);

  // State for searchable database catalog
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem("vice_vault_catalog");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse catalog from localStorage", e);
    }
    return generateDefaultCatalog();
  });

  // Active search query
  const [searchQuery, setSearchQuery] = useState("");
  // Quick filter to narrow core brand models
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("ALL");
  // Catalog Filters
  const [cFilterModel, setCFilterModel] = useState<string>("");
  const [cFilterColor, setCFilterColor] = useState<string>("");
  const [cFilterVariation, setCFilterVariation] = useState<string>("");
  const [cFilterYear, setCFilterYear] = useState<string>("");
  const [cFilterName, setCFilterName] = useState<string>("");
  const [cFilterCondition, setCFilterCondition] = useState<string>("");

  const catalogFilters = useMemo(() => ({
    model: cFilterModel, setModel: setCFilterModel,
    color: cFilterColor, setColor: setCFilterColor,
    variation: cFilterVariation, setVariation: setCFilterVariation,
    year: cFilterYear, setYear: setCFilterYear,
    name: cFilterName, setName: setCFilterName,
    condition: cFilterCondition, setCondition: setCFilterCondition
  }), [cFilterModel, cFilterColor, cFilterVariation, cFilterYear, cFilterName, cFilterCondition]);

  // Bag Filters
  const [bFilterModel, setBFilterModel] = useState<string>("");
  const [bFilterColor, setBFilterColor] = useState<string>("");
  const [bFilterVariation, setBFilterVariation] = useState<string>("");
  const [bFilterYear, setBFilterYear] = useState<string>("");
  const [bFilterName, setBFilterName] = useState<string>("");
  const [bFilterCondition, setBFilterCondition] = useState<string>("");

  const bagFilters = useMemo(() => ({
    model: bFilterModel, setModel: setBFilterModel,
    color: bFilterColor, setColor: setBFilterColor,
    variation: bFilterVariation, setVariation: setBFilterVariation,
    year: bFilterYear, setYear: setBFilterYear,
    name: bFilterName, setName: setBFilterName,
    condition: bFilterCondition, setCondition: setBFilterCondition
  }), [bFilterModel, bFilterColor, bFilterVariation, bFilterYear, bFilterName, bFilterCondition]);

const [sharedTab, setSharedTab] = useState<"owned" | "wishlist">("owned");

  const [sFilterModel, setSFilterModel] = useState<string>("");
  const [sFilterColor, setSFilterColor] = useState<string>("");
  const [sFilterVariation, setSFilterVariation] = useState<string>("");
  const [sFilterYear, setSFilterYear] = useState<string>("");
  const [sFilterName, setSFilterName] = useState<string>("");
  const [sFilterCondition, setSFilterCondition] = useState<string>("");

  const sharedFilters = useMemo(() => ({
    model: sFilterModel, setModel: setSFilterModel,
    color: sFilterColor, setColor: setSFilterColor,
    variation: sFilterVariation, setVariation: setSFilterVariation,
    year: sFilterYear, setYear: setSFilterYear,
    name: sFilterName, setName: setSFilterName,
    condition: sFilterCondition, setCondition: setSFilterCondition
  }), [sFilterModel, sFilterColor, sFilterVariation, sFilterYear, sFilterName, sFilterCondition]);

  const [swFilterModel, setSwFilterModel] = useState<string>("");
  const [swFilterColor, setSwFilterColor] = useState<string>("");
  const [swFilterVariation, setSwFilterVariation] = useState<string>("");
  const [swFilterYear, setSwFilterYear] = useState<string>("");
  const [swFilterName, setSwFilterName] = useState<string>("");

  const sharedWishlistFilters = useMemo(() => ({
    model: swFilterModel, setModel: setSwFilterModel,
    color: swFilterColor, setColor: setSwFilterColor,
    variation: swFilterVariation, setVariation: setSwFilterVariation,
    year: swFilterYear, setYear: setSwFilterYear,
    name: swFilterName, setName: setSwFilterName,
  }), [swFilterModel, swFilterColor, swFilterVariation, swFilterYear, swFilterName]);


  // Wishlist Filters
  const [wFilterModel, setWFilterModel] = useState<string>("");
  const [wFilterColor, setWFilterColor] = useState<string>("");
  const [wFilterVariation, setWFilterVariation] = useState<string>("");
  const [wFilterYear, setWFilterYear] = useState<string>("");
  const [wFilterName, setWFilterName] = useState<string>("");
  const [wFilterCondition, setWFilterCondition] = useState<string>("");

  const wishlistFilters = useMemo(() => ({
    model: wFilterModel, setModel: setWFilterModel,
    color: wFilterColor, setColor: setWFilterColor,
    variation: wFilterVariation, setVariation: setWFilterVariation,
    year: wFilterYear, setYear: setWFilterYear,
    name: wFilterName, setName: setWFilterName,
    condition: wFilterCondition, setCondition: setWFilterCondition
  }), [wFilterModel, wFilterColor, wFilterVariation, wFilterYear, wFilterName, wFilterCondition]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const uniqueTrophyBalls = useMemo(() => getUniqueCatalogItems(balls, catalog), [balls, catalog]);

  // Secondary panel state: "browse" or "admin" inside database panel
  const [dbPanelTab, setDbPanelTab] = useState<"browse" | "admin" | "users" | "register">("browse");

  // User Manager States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isFriendsPortalOpen, setIsFriendsPortalOpen] = useState(false);
  const [friendBagUsername, setFriendBagUsername] = useState<string | null>(null);
  const [isVaultManagerOpen, setIsVaultManagerOpen] = useState(false);
  const [isVaultProcessing, setIsVaultProcessing] = useState(false);

  // State for viewing/editing user bags
  const [selectedUserForBag, setSelectedUserForBag] = useState<any | null>(null);
  const [selectedUserBalls, setSelectedUserBalls] = useState<any[]>([]);
  const [isLoadingSelectedUserBalls, setIsLoadingSelectedUserBalls] = useState(false);
  const [bagModalErrorMessage, setBagModalErrorMessage] = useState<string | null>(null);
  const [modalSelectedModel, setModalSelectedModel] = useState("");
  const [modalSelectedColor, setModalSelectedColor] = useState("");
  const [modalQty, setModalQty] = useState(12);
  const [modalPkgType, setModalPkgType] = useState<"ea" | "sleeve" | "box">("box");
  const [modalCondition, setModalCondition] = useState<BallCondition>(BallCondition.NEW);
  const [modalNotes, setModalNotes] = useState("");
  const [modalPlayNumber, setModalPlayNumber] = useState<number>(1);
  const [modalCustomNumberInput, setModalCustomNumberInput] = useState<string>("");
  const [modalYear, setModalYear] = useState<string>("");

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
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

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
  // Quick filter to narrow models inside Catalog Admin (Vault Manager)
  const [adminBrandFilter, setAdminBrandFilter] = useState<string>("ALL");

  // Toggle for Spreadsheet bulk importer in admin
  const [showXlsImporter, setShowXlsImporter] = useState(false);

  // Prevent background scrolling when a modal overlay is open
  useEffect(() => {
    const isAnyModalOpen = !!(
      isUserManagerOpen ||
      isVaultManagerOpen ||
      selectedUserForBag ||
      authModalOpen ||
      deletingUserId ||
      isImportExportModalOpen
    );
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isUserManagerOpen, isVaultManagerOpen, selectedUserForBag, authModalOpen, deletingUserId, isImportExportModalOpen]);

  // Load shared locker data if share username is in query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareUsername = params.get("share");
    if (shareUsername) {
      setIsSharedViewLoading(true);
      fetch(`/api/share/${encodeURIComponent(shareUsername)}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setSharedLockerOwner(data.profile);
            setSharedLockerBalls(data.balls);
            if (data.profile.preferredColor) {
              setAccentColor(data.profile.preferredColor);
            }
          } else {
            setSharedLockerError(data.error || "This bag is private or does not exist.");
          }
        })
        .catch((err) => {
          setSharedLockerError("Failed to connect to server. Please try again.");
        })
        .finally(() => {
          setIsSharedViewLoading(false);
        });
    }
  }, []);

  // Load friend's locker data if friendBagUsername is set
  useEffect(() => {
    if (friendBagUsername && userProfile?.uid) {
      setIsSharedViewLoading(true);
      setSharedLockerError(null);
      if (userProfile?.preferredColor) {
        setAccentColor(userProfile.preferredColor);
      }      fetch(`/api/friends/${encodeURIComponent(userProfile.uid)}/bag/${encodeURIComponent(friendBagUsername)}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setSharedLockerOwner(data.profile);
            setSharedLockerBalls(data.balls);
            if (data.profile?.preferredColor) {
              setAccentColor(data.profile.preferredColor);
            }
          } else {
            setSharedLockerError(data.error || "Failed to load friend's bag.");
          }
        })
        .catch((err) => {
          setSharedLockerError("Failed to connect to server.");
        })
        .finally(() => {
          setIsSharedViewLoading(false);
        });
    } else if (!friendBagUsername && !new URLSearchParams(window.location.search).get("share")) {
      // Clear when closed
      setSharedLockerOwner(null);
      setSharedLockerBalls([]);
      setSharedLockerError(null);
      if (userProfile?.preferredColor) {
        setAccentColor(userProfile.preferredColor);
      }    }
  }, [friendBagUsername, userProfile?.uid]);

  // --- Export / Import Logic ---
  const handleExportData = () => {
    // Generate JSON payload without images
    const exportData = balls.map((b) => {
      const { image, sleeveImage, boxImage, packagingImage, ...rest } = b;
      return rest;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vice_vault_bag_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (importedData: GolfBall[]) => {
    // Add new items and update existing ones if they match exactly on id/model/color/variation
    let updatedBalls = [...balls];
    let newItemsCount = 0;
    let updatedItemsCount = 0;

    for (const incoming of importedData) {
      // Find exact match
      const existingIdx = updatedBalls.findIndex(
        (b) =>
          b.id === incoming.id ||
          (b.model === incoming.model &&
            b.color === incoming.color &&
            b.variation === incoming.variation)
      );

      if (existingIdx !== -1) {
        // Merge quantities safely
        updatedBalls[existingIdx] = {
          ...updatedBalls[existingIdx],
          quantity: incoming.quantity || updatedBalls[existingIdx].quantity,
          packageType: incoming.packageType || updatedBalls[existingIdx].packageType,
          year: incoming.year || updatedBalls[existingIdx].year,
          notes: incoming.notes || updatedBalls[existingIdx].notes,
          name: incoming.name || updatedBalls[existingIdx].name,
          // Do not overwrite images if incoming doesn't have them
        };
        updatedItemsCount++;
      } else {
        // Add new item
        updatedBalls.push({
          ...incoming,
          // Generate new unique ID if missing
          id: incoming.id || crypto.randomUUID(),
        });
        newItemsCount++;
      }
    }

    setBalls(updatedBalls);
    showToast(`Imported! Added ${newItemsCount}, Updated ${updatedItemsCount}.`);
  };

  // Add multiple catalog items from Excel/Spreadsheet import
  const handleXlsImportCatalogItems = async (newItems: Omit<CatalogItem, "id">[]) => {
    setIsVaultProcessing(true);
    try {
      const itemsWithIds: CatalogItem[] = [];
      
      if (currentUser) {
        const res = await fetch("/api/catalog/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.uid
          },
          body: JSON.stringify({
            items: newItems.map(item => ({
              model: item.model,
              name: item.name || "",
              color: item.color,
              variation: item.variation || item.notes,
              year: item.year,
              groupColor: item.groupColor,
              groupVariation: item.groupVariation,
              customImage: item.customImage,
              customImageSleeve: item.customImageSleeve,
              customImageBox: item.customImageBox
            }))
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items)) {
            itemsWithIds.push(...data.items);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to bulk import catalog items.");
        }
      } else {
        // Guest / fallback mode: save without merging variations
        const groupedLocal: Record<string, CatalogItem> = {};
        for (const item of newItems) {
          const id = sanitizeId(item.model, item.color, item.name, item.variation);
          if (!groupedLocal[id]) {
            const existingInCatalog = catalog.find(c => c.id === id);
            groupedLocal[id] = {
              id,
              model: item.model.trim(),
              name: item.name ? item.name.trim() : "",
              color: item.color.trim(),
              variation: item.variation ? item.variation.trim() : undefined,
              groupColor: !!item.groupColor,
              groupVariation: !!item.groupVariation,
              customImage: item.customImage || (existingInCatalog ? existingInCatalog.customImage : undefined),
              customImageSleeve: item.customImageSleeve || (existingInCatalog ? existingInCatalog.customImageSleeve : undefined),
              customImageBox: item.customImageBox || (existingInCatalog ? existingInCatalog.customImageBox : undefined)
            };
          } else {
            const existing = groupedLocal[id];
            if (!existing.customImage && item.customImage) existing.customImage = item.customImage;
            if (!existing.customImageSleeve && item.customImageSleeve) existing.customImageSleeve = item.customImageSleeve;
            if (!existing.customImageBox && item.customImageBox) existing.customImageBox = item.customImageBox;
          }
        }
        itemsWithIds.push(...Object.values(groupedLocal));
      }
      
      setCatalog((prev) => {
        const updated = [...prev];
        for (const item of itemsWithIds) {
          const idx = updated.findIndex(c => c.id === item.id);
          if (idx > -1) {
            updated[idx] = item;
          } else {
            updated.unshift(item);
          }
        }
        return updated;
      });
    } catch (err: any) {
      console.error("Error bulk importing catalog items:", err);
      alert(err.message || "Failed to bulk import catalog items.");
    } finally {
      setIsVaultProcessing(false);
    }
  };

  // Export catalog database items to Excel spreadsheet
  const handleExportCatalogToExcel = () => {
    try {
      const chunkString = (str: string | undefined, limit = 30000) => {
        if (!str) return [];
        const chunks = [];
        for (let i = 0; i < str.length; i += limit) {
          chunks.push(str.slice(i, i + limit));
        }
        return chunks;
      };

      let maxBallChunks = 0;
      let maxSleeveChunks = 0;
      let maxBoxChunks = 0;

      const mapped = catalog.map(item => {
        const ballChunks = chunkString(item.customImage);
        const sleeveChunks = chunkString(item.customImageSleeve);
        const boxChunks = chunkString(item.customImageBox);

        if (ballChunks.length > maxBallChunks) maxBallChunks = ballChunks.length;
        if (sleeveChunks.length > maxSleeveChunks) maxSleeveChunks = sleeveChunks.length;
        if (boxChunks.length > maxBoxChunks) maxBoxChunks = boxChunks.length;

        return { item, ballChunks, sleeveChunks, boxChunks };
      });

      const dataToExport = mapped.map(({ item, ballChunks, sleeveChunks, boxChunks }) => {
        const row: Record<string, any> = {
          "Model": item.model,
          "Name": item.name || "",
          "Color": item.color,
          "Variation": item.variation || "",
          "Year": item.year || "",
          "Group By Color": item.groupColor ? "TRUE" : "FALSE",
          "Group By Variation": item.groupVariation ? "TRUE" : "FALSE",
          "Bundle Data": item.bundleItems ? JSON.stringify(item.bundleItems) : ""
        };

        for (let i = 0; i < maxBallChunks; i++) {
          row[`Ball Image P${i + 1}`] = ballChunks[i] || "";
        }
        for (let i = 0; i < maxSleeveChunks; i++) {
          row[`Sleeve Image P${i + 1}`] = sleeveChunks[i] || "";
        }
        for (let i = 0; i < maxBoxChunks; i++) {
          row[`Box Image P${i + 1}`] = boxChunks[i] || "";
        }

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Catalog Registry");
      XLSX.writeFile(wb, "Vice_Golf_Ball_Catalog.xlsx");
    } catch (err: any) {
      console.error("Failed to export catalog to Excel:", err);
      alert("Failed to export catalog: " + err.message);
    }
  };

  // Update existing catalog template specifications (Sync logic to prevent duplications and maintain links)
  const handleUpdateCatalogItem = async (id: string, updatedFields: Partial<CatalogItem>) => {
    try {
      const originalItem = catalog.find((c) => c.id === id);
      if (!originalItem) throw new Error("Original item not found");

      const updatedModel = (updatedFields.model !== undefined ? updatedFields.model.trim() : originalItem.model);
      const updatedName = (updatedFields.name !== undefined ? (updatedFields.name ? updatedFields.name.trim() : null) : (originalItem.name || ""));
      const updatedColor = (updatedFields.color !== undefined ? updatedFields.color.trim() : originalItem.color);
      const updatedVariation = (updatedFields.variation !== undefined ? (updatedFields.variation ? updatedFields.variation.trim() : null) : originalItem.variation);
      const updatedNotes = (updatedFields.notes !== undefined ? (updatedFields.notes ? updatedFields.notes.trim() : null) : originalItem.notes);
      const updatedGroupColor = (updatedFields.groupColor !== undefined ? updatedFields.groupColor : originalItem.groupColor);
      const updatedGroupVariation = (updatedFields.groupVariation !== undefined ? updatedFields.groupVariation : originalItem.groupVariation);
      
      const newId = sanitizeId(updatedModel, updatedColor, updatedName, updatedVariation);

      if (currentUser) {
        const res = await fetch(`/api/catalog/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.uid
          },
          body: JSON.stringify({
            model: updatedModel,
            name: updatedName,
            color: updatedColor,
            variation: updatedVariation === null ? null : updatedVariation,
            notes: updatedNotes === null ? null : updatedNotes,
            groupColor: updatedGroupColor,
            groupVariation: updatedGroupVariation,
            customImage: updatedFields.customImage,
            customImageSleeve: updatedFields.customImageSleeve,
            customImageBox: updatedFields.customImageBox,
            bundleItems: updatedFields.bundleItems
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
          name: updatedName === null ? undefined : updatedName,
          color: updatedColor,
          variation: updatedVariation === null ? undefined : updatedVariation,
          notes: updatedNotes === null ? undefined : updatedNotes,
          groupColor: updatedGroupColor,
          groupVariation: updatedGroupVariation,
          customImage: updatedFields.customImage !== undefined ? updatedFields.customImage : originalItem.customImage,
          customImageSleeve: updatedFields.customImageSleeve !== undefined ? updatedFields.customImageSleeve : originalItem.customImageSleeve,
          customImageBox: updatedFields.customImageBox !== undefined ? updatedFields.customImageBox : originalItem.customImageBox,
          bundleItems: updatedFields.bundleItems !== undefined ? updatedFields.bundleItems : originalItem.bundleItems
        };
        return prev.map((item) => (item.id === id ? newItem : item));
      });

      // Sync info for already logged bags using the older color/model to protect visual layouts
      if (originalItem) {
        setBalls((prev) =>
          prev.map((ball) => {
            if (ball.model === originalItem.model && ball.color === originalItem.color && ball.variation === originalItem.variation) {
              return {
                ...ball,
                model: updatedModel.toUpperCase(),
                color: updatedColor,
                name: updatedName || undefined,
                variation: updatedVariation === null ? undefined : updatedVariation,
                notes: updatedNotes === null ? undefined : updatedNotes,
                customImage: updatedFields.customImage !== undefined ? updatedFields.customImage : ball.customImage,
                customImageSleeve: updatedFields.customImageSleeve !== undefined ? updatedFields.customImageSleeve : ball.customImageSleeve,
                customImageBox: updatedFields.customImageBox !== undefined ? updatedFields.customImageBox : ball.customImageBox
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
    // Clean local storage once of any legacy mock balls to prevent uploading back
    const saved = localStorage.getItem("vice_vault_guest_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = filterLegacyBalls(parsed);
          if (filtered.length !== parsed.length) {
            try {
              localStorage.setItem("vice_vault_guest_v2", JSON.stringify(filtered));
            } catch(e) { console.warn("localStorage quota exceeded"); }
          }
        }
      } catch (e) {}
    }

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
          shareToken: parsed.shareToken, pendingFriendRequestsCount: parsed.pendingFriendRequestsCount || 0
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
        setIsLoadingCloudData(true);
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
                  uid: profileData.uid,
                  shareBag: profileData.shareBag,
                  shareToken: profileData.shareToken, pendingFriendRequestsCount: profileData.pendingFriendRequestsCount || 0,
                  wishlist: profileData.wishlist || []
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
                uid: userDocId,
                displayName: userDocData.displayName || userDocData.name || user.displayName || "User",
                username: userDocData.username || userDocId.replace(/^u-/, ""),
                avatarUrl: userDocData.avatarUrl || "initials",
                preferredColor: userDocData.preferredColor || "#2563eb", pendingFriendRequestsCount: userDocData.pendingFriendRequestsCount || 0,
                role: (userDocData.role && userDocData.role.toLowerCase() === "admin") ? "Admin" : "User",
                createdAt: userDocData.createdAt,
                email: userDocData.email || user.email || "",
                shareBag: !!userDocData.shareBag,
                shareToken: userDocData.shareToken,
                wishlist: userDocData.wishlist || []
              } as any);
              setAccentColor(userDocData.preferredColor || "#2563eb");
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
                wishlist: []
              } as any);
              setAccentColor("#2563eb");
              userDocId = fallbackDocId;
            }

            // Load cache immediately for instant UI render
            const cachedBag = localStorage.getItem("vice_vault_bag_" + user.uid);
            if (cachedBag) {
              try {
                setBalls(filterLegacyBalls(safeJSONParse(cachedBag)));
                setIsAuthLoading(false);
              } catch (e) {}
            }

            // 2. Load locker documents using the server API instead of client-side Firestore
            const lockerRes = await fetch(`/api/users/${user.uid}/locker`);
            let finalBalls = cachedBag ? filterLegacyBalls(safeJSONParse(cachedBag)) : filterLegacyBalls(balls);
            if (lockerRes.ok) {
              const lockerData = await lockerRes.json();
              if (lockerData && lockerData.balls !== null) {
                finalBalls = filterLegacyBalls(lockerData.balls);
              try {
                localStorage.setItem("vice_vault_bag_" + user.uid, JSON.stringify(finalBalls));
              } catch(e) { console.warn("localStorage quota exceeded"); }
              } else {
                // If locker doesn't exist on server, upload current client balls (migration of guest data)
                await fetch(`/api/users/${user.uid}/locker`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.uid
                  },
                  body: JSON.stringify({ balls: filterLegacyBalls(balls) })
                });
              }
            }
            setBalls(finalBalls);
          }
        } catch (err) {
          console.error("Error loading user cloud data:", err);
        } finally {
          setIsLoadingCloudData(false);
          setIsCloudDataLoaded(true);
          setIsAuthLoading(false);
        }
      } else {
        // Logged out / local-only fallback
        if (!localStorage.getItem("vice_vault_mock_user")) {
          setUserProfile(null);
          setAccentColor("#2563eb");
          setIsCloudDataLoaded(false);
          setUserDropdownOpen(false);

          const savedBalls = localStorage.getItem("vice_vault_guest_v2");
          setBalls(savedBalls ? filterLegacyBalls(safeJSONParse(savedBalls)) : INITIAL_OWNED_BALLS);
        }
        setIsAuthLoading(false);
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

  // Synchronize catalog changes to localStorage for instant UI caching on refresh
  useEffect(() => {
    try {
      localStorage.setItem("vice_vault_catalog", JSON.stringify(catalog));
    } catch (e) {
      console.warn("Failed to write catalog to localStorage:", e);
    }
  }, [catalog]);

  // Load mock user cloud data when mock user logs in or is loaded on mount
  useEffect(() => {
    if (currentUser && currentUser.isMock) {
      // Load cache immediately for instant UI render
      const cachedBag = localStorage.getItem("vice_vault_bag_" + currentUser.uid);
      if (cachedBag) {
        try {
          setBalls(filterLegacyBalls(safeJSONParse(cachedBag)));
          setIsLoadingCloudData(false);
          setIsCloudDataLoaded(true);
        } catch (e) {}
      } else {
        setIsLoadingCloudData(true);
      }
      
      Promise.all([
        fetch(`/api/users/${currentUser.uid}/profile`).then(async (res) => {
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
              // Keep local storage up to date with latest server-side profile
            try {
              localStorage.setItem("vice_vault_mock_user", JSON.stringify(data));
            } catch(e) {}
            }
          }
        }),
        fetch(`/api/users/${currentUser.uid}/locker`).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && data.balls !== null) {
              const parsedBalls = filterLegacyBalls(data.balls);
              setBalls(parsedBalls);
            try {
              localStorage.setItem("vice_vault_bag_" + currentUser.uid, JSON.stringify(parsedBalls));
            } catch(e) {}
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
    if (isUserManagerOpen && currentUser) {
      fetchUsers();
    }
  }, [isUserManagerOpen, currentUser]);

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
          uid: data.uid || currentUser.uid,
          displayName: data.displayName,
          username: data.username,
          avatarUrl: data.photoURL || data.avatarUrl,
          preferredColor: data.preferredColor,
          role: (data.role && data.role.toLowerCase() === "admin") ? "Admin" : "User",
          shareBag: !!data.shareBag,
          shareToken: data.shareToken, pendingFriendRequestsCount: data.pendingFriendRequestsCount || 0
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

  const handleViewUserBag = async (user: any) => {
    setSelectedUserForBag(user);
    setIsLoadingSelectedUserBalls(true);
    setBagModalErrorMessage(null);
    setModalSelectedModel("");
    setModalSelectedColor("");
    setModalQty(12);
    setModalPkgType("box");
    setModalCondition(BallCondition.NEW);
    setModalNotes("");
    try {
      const res = await fetch(`/api/users/${user.uid || user.id}/locker`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserBalls(filterLegacyBalls(data.balls || []));
      } else {
        setSelectedUserBalls([]);
      }
    } catch (err: any) {
      console.error("Failed to load user locker:", err);
      setBagModalErrorMessage(err.message || "Failed to load user bag");
      setSelectedUserBalls([]);
    } finally {
      setIsLoadingSelectedUserBalls(false);
    }
  };

  const handleSaveUserBag = async () => {
    if (!selectedUserForBag) return;
    try {
      const res = await fetch(`/api/users/${selectedUserForBag.uid || selectedUserForBag.id}/locker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.uid || ""
        },
        body: JSON.stringify({ balls: selectedUserBalls })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save user bag.");
      }
      showToast("User bag inventory updated successfully!", "success");
      setTimeout(() => {
        setSelectedUserForBag(null);
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error("Error saving user bag:", err);
      showToast(err.message || "Failed to update user bag.", "error");
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
      // Sync locker via the backend server API for both mock and real Firebase users
      fetch(`/api/users/${currentUser.uid}/locker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.uid
        },
        body: JSON.stringify({ balls })
      }).catch(err => console.error("Error writing locker to server:", err));
    }
  }, [balls, currentUser, isCloudDataLoaded]);

  // Synchronize balls changes to localStorage for instant UI caching on refresh
  useEffect(() => {
    if (balls.length > 0) {
      try {
        if (currentUser && currentUser.uid) {
          localStorage.setItem("vice_vault_bag_" + currentUser.uid, JSON.stringify(balls));
        } else {
          localStorage.setItem("vice_vault_guest_v2", JSON.stringify(balls));
        }
      } catch (e) {
        console.warn("Failed to write bag to localStorage:", e);
      }
    }
  }, [balls, currentUser]);


  // Self-heal / hydrate legacy owned balls with name and variation from the catalog
  useEffect(() => {
    if (catalog.length === 0 || balls.length === 0) return;

    let changed = false;
    const updatedBalls = balls.map(b => {
      // Find matching catalog item (matching model, color, name, variation)
      const match = catalog.find(c => 
        c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
        c.color.trim().toLowerCase() === b.color.trim().toLowerCase() &&
        (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase() &&
        (c.variation || "").trim().toLowerCase() === (b.variation || "").trim().toLowerCase()
      );

      if (match) {
        let updatedB = { ...b };
        let localChanged = false;
        
        if (!b.name && match.name) {
          updatedB.name = match.name;
          localChanged = true;
        }
        
        if (!b.variation && match.variation) {
          updatedB.variation = match.variation;
          localChanged = true;
        }
        
        if ('variations' in updatedB) {
          delete (updatedB as any).variations;
          localChanged = true;
        }

        if (localChanged) {
          changed = true;
          return updatedB;
        }
      } else {
        // If there's no exact match with variation, try matching by model, color, name only for legacy healing
        const legacyMatch = catalog.find(c =>
          c.model.trim().toLowerCase() === b.model.trim().toLowerCase() &&
          c.color.trim().toLowerCase() === b.color.trim().toLowerCase() &&
          (c.name || "").trim().toLowerCase() === (b.name || "").trim().toLowerCase()
        );
        if (legacyMatch) {
          let updatedB = { ...b };
          let localChanged = false;
          
          if (!b.name && legacyMatch.name) {
            updatedB.name = legacyMatch.name;
            localChanged = true;
          }
          if (!b.variation && legacyMatch.variation) {
            updatedB.variation = legacyMatch.variation;
            localChanged = true;
          }
          if ('variations' in updatedB) {
            delete (updatedB as any).variations;
            localChanged = true;
          }
          
          if (localChanged) {
            changed = true;
            return updatedB;
          }
        }
      }
      return b;
    });

    if (changed) {
      setBalls(updatedBalls);
    }
  }, [catalog, balls]);


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
    year?: string,
    customImageSleeve?: string,
    customImageBox?: string,
    name?: string,
    variation?: string,
    bundleItems?: { catalogId: string; qty: number }[],
    catalogId?: string
  ) => {
    const today = new Date().toLocaleDateString();
    
    // Auto-remove from wishlist if present
    if (catalogId && userProfile?.wishlist?.includes(catalogId)) {
      handleToggleWishlist(catalogId);
    }
    
    setBalls((prev) => {
      const resolvedPkgType = packageType || (qty >= 12 ? 'box' : qty >= 3 ? 'sleeve' : 'ea');
      // Check if matching ball stack exists to merge (model, color, packageType, year, condition, name, variation, and design notes matching)
      const existingIdx = prev.findIndex(b => 
        b.model.trim().toLowerCase() === model.trim().toLowerCase() &&
        b.color.trim().toLowerCase() === color.trim().toLowerCase() &&
        b.notes.trim().toLowerCase() === notes.trim().toLowerCase() &&
        b.condition === condition &&
        (b.year || "").trim().toLowerCase() === (year || "").trim().toLowerCase() &&
        (b.name || "").trim().toLowerCase() === (name || "").trim().toLowerCase() &&
        (b.variation || "").trim().toLowerCase() === (variation || "").trim().toLowerCase() &&
        (b.packageType || (b.quantity >= 12 ? 'box' : b.quantity >= 3 ? 'sleeve' : 'ea')) === resolvedPkgType
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty,
          bundleItems
        };
        return updated;
      } else {
        const sanitizeSegment = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const modelPart = sanitizeSegment(model);
        const colorPart = sanitizeSegment(color);
        const yearPart = year ? sanitizeSegment(year) : "ANY";
        const conditionPart = sanitizeSegment(condition);
        const pkgPart = sanitizeSegment(resolvedPkgType);
        const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();

        const newBall: GolfBall = {
          id: `OWNED-${modelPart}-${colorPart}-${yearPart}-${conditionPart}-${pkgPart}-${randomPart}`,
          model,
          color,
          quantity: qty,
          condition,
          packageType: resolvedPkgType,
          customNumber: customNum,
          notes: notes || "",
          year: year || undefined,
          dateAdded: today,
          customImage,
          customImageSleeve,
          customImageBox,
          name,
          variation,
          bundleItems
        };
        return [newBall, ...prev];
      }
    });
  };

  // Add missing ball to Catalog Database
  const handleAddCatalogItem = async (newItem: Omit<CatalogItem, "id">) => {
    try {
      const id = sanitizeId(newItem.model, newItem.color, newItem.name, newItem.variation);
      
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
            name: newItem.name,
            color: newItem.color,
            variation: newItem.variation,
            groupColor: newItem.groupColor,
            groupVariation: newItem.groupVariation,
            customImage: newItem.customImage,
            customImageSleeve: newItem.customImageSleeve,
            customImageBox: newItem.customImageBox,
            bundleItems: newItem.bundleItems
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to add design to global catalog.");
        }
        itemWithId = await res.json();
      } else {
        // Guest / fallback mode
        const existing = catalog.find(c => c.id === id);
        itemWithId = {
          id,
          model: newItem.model.trim(),
          name: newItem.name ? newItem.name.trim() : "",
          color: newItem.color.trim(),
          variation: newItem.variation ? newItem.variation.trim() : undefined,
          groupColor: newItem.groupColor,
          groupVariation: newItem.groupVariation,
          notes: newItem.notes ? newItem.notes.trim() : "",
          customImage: newItem.customImage || (existing ? existing.customImage : undefined),
          customImageSleeve: newItem.customImageSleeve || (existing ? existing.customImageSleeve : undefined),
          customImageBox: newItem.customImageBox || (existing ? existing.customImageBox : undefined),
          bundleItems: newItem.bundleItems || (existing ? existing.bundleItems : undefined)
        };
      }
      setCatalog((prev) => {
        const idx = prev.findIndex(c => c.id === itemWithId.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = itemWithId;
          return updated;
        }
        return [itemWithId, ...prev];
      });
    } catch (err: any) {
      console.error("Error adding catalog item:", err);
      alert(err.message || "Failed to add catalog item.");
    }
  };

  const handleToggleWishlist = async (catalogId: string) => {
    if (!currentUser || !userProfile) return;
    
    // Optimistic update
    const prevWishlist = userProfile.wishlist || [];
    const isWishlisted = prevWishlist.includes(catalogId);
    const newWishlist = isWishlisted 
      ? prevWishlist.filter(id => id !== catalogId)
      : [...prevWishlist, catalogId];
      
    setUserProfile({ ...userProfile, wishlist: newWishlist });
    
    try {
      const res = await fetch(`/api/users/${currentUser.uid}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.uid
        },
        body: JSON.stringify({ catalogId })
      });
      if (!res.ok) throw new Error("Failed to update wishlist");
    } catch (e) {
      console.error(e);
      // Revert optimistic update
      setUserProfile({ ...userProfile, wishlist: prevWishlist });
    }
  };

  const handleClearWishlist = async () => {
    if (!currentUser || !userProfile) return;
    
    const prevWishlist = userProfile.wishlist || [];
    setUserProfile({ ...userProfile, wishlist: [] });
    
    try {
      const res = await fetch(`/api/users/${currentUser.uid}/wishlist/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.uid
        }
      });
      if (!res.ok) throw new Error("Failed to clear wishlist");
    } catch (e) {
      console.error(e);
      setUserProfile({ ...userProfile, wishlist: prevWishlist });
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
    setIsVaultProcessing(true);
    try {
      if (currentUser) {
        const res = await fetch("/api/catalog/clear", {
          method: "POST",
          headers: {
            "x-user-id": currentUser.uid
          }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to clear catalog items from server.");
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
    } finally {
      setIsVaultProcessing(false);
    }
  };

  // Safe restoration of demo inventory & default catalog database
  const handleResetApp = () => {
    setBalls(INITIAL_OWNED_BALLS);
    const standardCatalog = generateDefaultCatalog();
    setCatalog(standardCatalog);
    localStorage.removeItem("vice_vault_guest_v2");
    localStorage.removeItem("vice_vault_catalog");
    setSearchQuery("");
    setSelectedBrandFilter("ALL");
    setDbPanelTab("browse");
    setShowResetConfirm(false);
  };

  // FILTERED CATALOG items based on search word and model filter tag
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.model.toLowerCase().includes(query) ||
        (item.name && item.name.toLowerCase().includes(query)) ||
        item.color.toLowerCase().includes(query) ||
        (item.variation && item.variation.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        (item.year && item.year.toLowerCase().includes(query));

      const matchesBrand = selectedBrandFilter === "ALL" || item.model === selectedBrandFilter;
      const matchesAdvancedModel = !cFilterModel || item.model === cFilterModel;
      const matchesAdvancedColor = !cFilterColor || item.color === cFilterColor;
      const matchesAdvancedVariation = !cFilterVariation || item.variation === cFilterVariation;
      const matchesAdvancedYear = !cFilterYear || item.year === cFilterYear;
      const matchesAdvancedName = !cFilterName || item.name === cFilterName;

      const itemWishlisted = userProfile?.wishlist?.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`));
      const isWishlistTab = dbPanelTab === "wishlist";
      const matchesWishlist = isWishlistTab
        ? itemWishlisted
        : (!showWishlistOnly || itemWishlisted);

      // If showWishlistOnly is active, be agnostic to the filters and show full wishlist options
      if (showWishlistOnly) {
          return matchesSearch && matchesWishlist;
      }

      return matchesSearch && matchesBrand && matchesWishlist && matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;
    });
  }, [catalog, searchQuery, selectedBrandFilter, showWishlistOnly, userProfile, dbPanelTab, cFilterModel, cFilterColor, cFilterVariation, cFilterYear, cFilterName]);

  // Unique models actually present in the registry catalog for the Filter Model buttons
  const registeredModels = useMemo(() => {
    return Array.from<string>(
      new Set<string>(catalog.map(item => item.model))
    ).sort();
  }, [catalog]);

  // Sort Catalog alphabetically by Model, then by Name, then by Color, then by Variation (Notes), then by Year
  const sortedCatalog = useMemo(() => {
    return [...filteredCatalog].sort((a, b) => {
      const modelA = a.model.trim().toLowerCase();
      const modelB = b.model.trim().toLowerCase();
      if (modelA < modelB) return -1;
      if (modelA > modelB) return 1;

      const nameA = (a.name || "").trim().toLowerCase();
      const nameB = (b.name || "").trim().toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      const colorA = a.color.trim().toLowerCase();
      const colorB = b.color.trim().toLowerCase();
      if (colorA < colorB) return -1;
      if (colorA > colorB) return 1;

      const varA = (a.variation || a.notes || "").trim().toLowerCase();
      const varB = (b.variation || b.notes || "").trim().toLowerCase();
      if (varA < varB) return -1;
      if (varA > varB) return 1;

      const yearA = (a.year || "").trim().toLowerCase();
      const yearB = (b.year || "").trim().toLowerCase();
      if (yearA < yearB) return -1;
      if (yearA > yearB) return 1;

      return 0;
    });
  }, [filteredCatalog]);

  // Group catalog items dynamically based on groupColor and groupVariation flags
  const groupedCatalog = useMemo(() => {
    const groups: { primary: CatalogItem; subItems: CatalogItem[] }[] = [];
    const visited = new Set<string>();

    for (const item of sortedCatalog) {
      if (visited.has(item.id)) continue;

      const shouldGroup = (item.groupColor || item.groupVariation) && dbPanelTab !== "wishlist";
      if (shouldGroup && item.name) {
        const matching = catalog.filter(i => {
          const sameModelName = i.model.trim().toLowerCase() === item.model.trim().toLowerCase() &&
                                (i.name || "").trim().toLowerCase() === (item.name || "").trim().toLowerCase();
          
          if (!sameModelName) return false;
          if (item.groupVariation && !i.groupVariation) return false;
          if (item.groupColor && !i.groupColor) return false;

          if (item.groupVariation) {
            // If grouping by variation, they must share the SAME color
            return i.color.trim().toLowerCase() === item.color.trim().toLowerCase();
          }
          
          if (item.groupColor) {
            // If grouping by color, they must share the SAME variation
            const itemVar = (item.variation || item.notes || "").trim().toLowerCase();
            const iVar = (i.variation || i.notes || "").trim().toLowerCase();
            return itemVar === iVar;
          }

          return false;
        });

        matching.forEach(i => visited.add(i.id));

        const primary = { ...matching[0] };
        matching.forEach(m => {
          if (!primary.customImageSleeve && m.customImageSleeve) primary.customImageSleeve = m.customImageSleeve;
          if (!primary.customImageBox && m.customImageBox) primary.customImageBox = m.customImageBox;
        });

        groups.push({
          primary,
          subItems: matching
        });
      } else {
        visited.add(item.id);
        groups.push({
          primary: item,
          subItems: [item]
        });
      }
    }

    return groups;
  }, [sortedCatalog, catalog]);

  // Calculate high level statistics for Locker
  const totalOwnedCount = useMemo(() => {
    return balls.reduce((sum, b) => sum + b.quantity, 0);
  }, [balls]);

  const totalUniqueModels = useMemo(() => {
    return getOwnedUniqueCount(balls, catalog);
  }, [balls, catalog]);

  const eaCount = useMemo(() => {
    return balls.filter(b => b.packageType === "ea" || !b.packageType).reduce((sum, b) => sum + b.quantity, 0);
  }, [balls]);

  const sleeveCount = useMemo(() => {
    return balls.filter(b => b.packageType === "sleeve").reduce((sum, b) => sum + Math.round(b.quantity / 3), 0);
  }, [balls]);

  const boxCount = useMemo(() => {
    return balls.filter(b => b.packageType === "box").reduce((sum, b) => {
      if (b.bundleItems && b.bundleItems.length > 0) {
        const bundleTotal = b.bundleItems.reduce((acc, item) => acc + item.qty, 0);
        return sum + Math.max(1, Math.round(b.quantity / bundleTotal));
      }
      return sum + Math.round(b.quantity / 12);
    }, 0);
  }, [balls]);

  // Check if we are viewing a shared locker link
  const params = new URLSearchParams(window.location.search);
  const shareUsername = params.get("share");
  const isSharedView = !!shareUsername || !!friendBagUsername;

  if (isSharedView) {
    if (isSharedViewLoading) {
      return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
          <div className="text-center space-y-3 font-mono text-xs text-neutral-500">
            <RefreshCw className="animate-spin text-[#2563eb] mx-auto" size={24} />
            <span>Loading shared bag...</span>
          </div>
        </div>
      );
    }

    if (sharedLockerError) {
      return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-900/60 flex items-center justify-center text-rose-500 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-sans font-black text-white text-lg uppercase tracking-wider">Bag Access Blocked</h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                {sharedLockerError === "Locker not found or set to private" ? "This bag is private or does not exist." : sharedLockerError}
              </p>
            </div>
            <a
              href="/"
              className="block w-full py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all text-center font-mono"
            >
              Go to Golf Ball Vault
            </a>
          </div>
        </div>
      );
    }

    if (sharedLockerOwner) {
      return (
        <div className="min-h-screen transition-all duration-300 font-sans bg-black text-neutral-100 selection:bg-[#2563eb] selection:text-black flex flex-col" id="shared-locker-view">
          <style>{`
            :root {
              --theme-accent-color: ${accentColor};
              --theme-accent-color-rgb: ${hexToRgb(accentColor)};
            }
            .text-\\[\\#2563eb\\] { color: var(--theme-accent-color) !important; }
            .bg-\\[\\#2563eb\\] { background-color: var(--theme-accent-color) !important; }
            .border-\\[\\#2563eb\\] { border-color: var(--theme-accent-color) !important; }
            .bg-\\[\\#2563eb\\]\\/10 { background-color: rgba(var(--theme-accent-color-rgb), 0.1) !important; }
            .border-\\[\\#2563eb\\]\\/20 { border-color: rgba(var(--theme-accent-color-rgb), 0.2) !important; }
          `}</style>

          <header className="sticky top-0 z-30 shadow-sm border-b border-neutral-850 bg-neutral-950">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                <span className="font-sans font-black text-sm text-white uppercase tracking-widest">Golf Ball Vault</span>
              </div>
              {friendBagUsername ? (
                <button
                  onClick={() => setFriendBagUsername(null)}
                  className="text-[10px] font-mono font-black uppercase text-neutral-400 hover:text-white px-3 py-1.5 border border-neutral-800 hover:border-neutral-750 bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                >
                  Return to My Vault
                </button>
              ) : (
                <a
                  href="/"
                  className="text-[10px] font-mono font-black uppercase text-neutral-400 hover:text-white px-3 py-1.5 border border-neutral-800 hover:border-neutral-750 bg-neutral-900 rounded-lg transition-colors"
                >
                  Return to My Vault
                </a>
              )}
            </div>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
            {/* Owner Banner */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex items-center gap-4 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />
              <AvatarRenderer avatarUrl={sharedLockerOwner.avatarUrl} name={sharedLockerOwner.displayName || "User"} size="lg" color={sharedLockerOwner.preferredColor || "#2563eb"} />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-white truncate leading-tight font-sans">{sharedLockerOwner.displayName}'s Bag</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5 font-bold">@{sharedLockerOwner.username}</p>
                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/20 text-[9px] font-mono font-bold text-[#2563eb] uppercase tracking-wider">
                  {friendBagUsername ? "Friend's Bag" : "Public Share View"}
                </div>
              </div>
            </div>

            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider font-bold">Unique Balls</span>
                  <span className="font-sans font-black text-2xl text-white tracking-tight">
                    {getOwnedUniqueCount(sharedLockerBalls, catalog)}
                    <span className="text-sm text-neutral-500 ml-1">/ {catalog.length}</span>
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-[#2563eb]">
                  <GolfBallOutlineIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider font-bold">Total Owned Balls</span>
                  <span className="font-sans font-black text-2xl text-white tracking-tight">
                    {sharedLockerBalls.reduce((sum, b) => sum + b.quantity, 0)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-[#2563eb]">
                  <GolfBallStackIcon className="w-[22px] h-[22px]" />
                </div>
              </div>
            </div>

            {/* Shared Inventory / Wishlist Container */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2 gap-2">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setSharedTab("owned")}
                    className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                      sharedTab === "owned"
                        ? "border-[#2563eb] text-white"
                        : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <ShoppingBag className={`w-4 h-4 ${sharedTab === "owned" ? "text-neutral-400" : ""}`} />
                    <h2 className="font-sans font-black text-sm uppercase tracking-wider">
                      Bag Inventory
                    </h2>
                  </button>
                  
                  {sharedLockerOwner?.wishlist && (
                    <button
                      onClick={() => setSharedTab("wishlist")}
                      className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                        sharedTab === "wishlist"
                          ? "border-white text-white"
                          : "border-transparent text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${sharedTab === "wishlist" ? "fill-current text-rose-500" : ""}`} />
                      <h2 className="font-sans font-black text-sm uppercase tracking-wider">
                        Wishlist
                      </h2>
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
              {sharedTab === "wishlist" ? (
                <motion.div key="shared-wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">
                  {sharedLockerOwner?.wishlist?.length > 0 && (
                    <VaultFilterBar items={catalog.filter(c => sharedLockerOwner.wishlist.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={sharedWishlistFilters} showCondition={false} />
                  )}
                  {!sharedLockerOwner?.wishlist?.length ? (
                    <div className="py-20 text-center rounded-3xl border-2 border-dashed border-neutral-850 bg-neutral-950/10 text-neutral-400">
                      <Heart className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                      <h4 className="font-bold text-neutral-350 text-sm">This wishlist is empty</h4>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.from(new Set(sharedLockerOwner.wishlist.map(id => id.replace(/-pkg-(box|ea)$/, ""))))
                        .map(baseId => catalog.find(c => c.id === baseId))
                        .filter(item => {
                          if (!item) return false;
                          const matchesAdvancedModel = !swFilterModel || item.model === swFilterModel;
                          const matchesAdvancedColor = !swFilterColor || item.color === swFilterColor;
                          const matchesAdvancedVariation = !swFilterVariation || item.variation === swFilterVariation;
                          const matchesAdvancedYear = !swFilterYear || item.year === swFilterYear;
                          const matchesAdvancedName = !swFilterName || item.name === swFilterName;
                          return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;
                        })
                        .map((item, index) => {
                          if (!item) return null;
                          return (
                          <CatalogItemCard
                            index={index}
                            key={item.id}
                            item={item}
                            isReadOnly={true}
                            wishlistItems={sharedLockerOwner.wishlist}
                            variant="wishlist"
                            onAddToLocker={() => {}}
                          />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="shared-owned" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
                  {sharedLockerBalls.length > 0 && (
                    <VaultFilterBar items={sharedLockerBalls} filters={sharedFilters} showCondition={true} />
                  )}

                  {sharedLockerBalls.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-950/20 text-neutral-500 font-mono text-xs">
                      This user's bag is empty.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {sharedLockerBalls
                        .filter((ball) => {
                      const matchesAdvancedModel = !sFilterModel || ball.model === sFilterModel;
                      const matchesAdvancedColor = !sFilterColor || ball.color === sFilterColor;
                      const matchesAdvancedVariation = !sFilterVariation || ball.variation === sFilterVariation;
                      const matchesAdvancedYear = !sFilterYear || ball.year === sFilterYear;
                      const matchesAdvancedName = !sFilterName || ball.name === sFilterName;
                      const matchesAdvancedCondition = !sFilterCondition || ball.condition === sFilterCondition;
                      return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedCondition;
                    })
                    .map((ball, index) => {
                    const currentPkg = ball.packageType || "ea";
                    const displayQty = ball.packageType === "box" 
                      ? Math.max(1, Math.round(ball.quantity / 12)) 
                      : ball.packageType === "sleeve" 
                      ? Math.max(1, Math.round(ball.quantity / 3)) 
                      : ball.quantity;

                    return (
                      <OwnedBallCard 
                        index={index}
                        key={ball.id} 
                        ball={ball} 
                        catalog={catalog} 
                        readOnly={true} 
                      />
                    );
                  })}
                </div>
              )}
              </motion.div>
            )}
            </AnimatePresence>
            </div>
          </main>
        </div>
      );
    }
  }

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
            <div className="relative group flex items-center justify-center">
              <div className="relative w-11 h-11 flex items-center justify-center transition-colors">
                <img src="/vault-logo.png" alt="Logo" className="w-11 h-11 object-contain drop-shadow-md scale-[2] translate-y-[4px]" />
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
                  className="text-[11px] font-mono hover:text-[#2563eb] border transition-all cursor-pointer flex items-center gap-2 shadow-sm px-3 py-1.5 rounded-xl text-neutral-300 border border-neutral-850 hover:border-neutral-750 bg-neutral-950 hover:bg-neutral-900 relative"
                  id="user-profile-menu-btn"
                >
                  <div className="relative">
                    <AvatarRenderer avatarUrl={userProfile?.avatarUrl} name={userProfile?.displayName || currentUser.displayName || "User"} size="sm" color={accentColor} />
                    {userProfile?.pendingFriendRequestsCount ? (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-neutral-950"></span>
                    ) : null}
                  </div>
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
                              setIsUserManagerOpen(true);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-[#2563eb] hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                          >
                            <User size={12} className="text-[#2563eb]" />
                            <span>User Manager</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsVaultManagerOpen(true);
                              setEditingItem(null);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-[#2563eb] hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                          >
                            <Settings size={12} className="text-[#2563eb]" />
                            <span>Vault Manager</span>
                          </button>
                          <div className="border-b border-neutral-900 my-1"></div>
                        </>
                      )}

                      
                      {/* Friends Portal */}
                      <button
                        onClick={() => {
                          setIsFriendsPortalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                      >
                        <Users size={12} className="text-neutral-500" />
                        <span className="flex-1">Friends</span>
                        {userProfile?.pendingFriendRequestsCount ? (
                          <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                            {userProfile.pendingFriendRequestsCount}
                          </span>
                        ) : null}
                      </button>

                      {/* Manage Bag Data */}
                      <button
                        onClick={() => {
                          setIsImportExportModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                      >
                        <Database size={12} className="text-neutral-500" />
                        <span className="flex-1">Manage Bag Data</span>
                      </button>

                      <div className="border-b border-neutral-900 my-1"></div>

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
                        <span>Settings</span>
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

                            const savedBalls = localStorage.getItem("vice_vault_guest_v2");
                            setBalls(savedBalls ? filterLegacyBalls(safeJSONParse(savedBalls)) : INITIAL_OWNED_BALLS);
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
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl shadow-md">
              
              {/* Registry Database Header Banner (Static, removing redundant Admin Tab) */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-neutral-850 bg-neutral-950 rounded-t-2xl">
                <BallVaultIcon className="w-5 h-5 text-[#2563eb]" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                  Ball Vault ({catalog.length} Available Designs)
                </span>
              </div>

              {/* Panel tab content rendering */}
              <div className="p-4">
                <div className="space-y-4">


                    {/* Database Search Filter control */}
                    <div className="space-y-3">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <VaultFilterBar items={catalog} filters={catalogFilters} showCondition={false} />
                      </div>

                    </div>

                    {/* Catalog results count label */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-850 pb-2">
                      <span>Showing {sortedCatalog.length} Matching Models</span>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline">{currentUser ? "Click + to add any to your Bag" : "Login to add balls to your bag"}</span>
                        {currentUser && (
                          <label className="flex items-center gap-1.5 cursor-pointer group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-300 transition-colors">
                              Wishlist
                            </span>
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={showWishlistOnly}
                                onChange={(e) => setShowWishlistOnly(e.target.checked)}
                                className="appearance-none w-3.5 h-3.5 rounded-sm border border-neutral-700 bg-neutral-950 checked:bg-rose-500 checked:border-rose-500 focus:outline-none transition-all cursor-pointer"
                              />
                              <Heart size={9} className={`absolute pointer-events-none transition-opacity ${showWishlistOnly ? 'opacity-100 text-white' : 'opacity-0'}`} weight="fill" />
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Catalog item list */}
                    {sortedCatalog.length === 0 ? (
                      <div className="py-12 text-center rounded-xl border border-dashed border-neutral-850 bg-neutral-950/20">
                        <Database className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                        <h4 className="font-bold text-neutral-400 text-sm">No balls found in the vault</h4>
                        <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                          {currentUser 
                            ? `We didn't find any designs fitting "${searchQuery}".`
                            : `We didn't find any designs fitting "${searchQuery}".`}
                        </p>
                        {userProfile?.role === "Admin" && (
                          <button
                            onClick={() => {
                              setIsVaultManagerOpen(true);
                              setShowXlsImporter(false);
                              setEditingItem(null);
                            }}
                            className="mt-3 text-xs font-bold text-[#2563eb] hover:underline inline-flex items-center gap-1"
                          >
                            Register a new one <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {groupedCatalog.map((group) => (
                          <CatalogItemCard 
                            key={group.primary.id} 
                            item={group.primary} 
                            subItems={group.subItems}
                            isReadOnly={!currentUser}
                            onAddToLocker={handleAddBallFromCatalog}
                            wishlistItems={userProfile?.wishlist || []}
                            onToggleWishlist={handleToggleWishlist}
                          />
                        ))}
                      </div>
                    )}

                  </div>
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
                      Unique Balls
                    </span>
                    <span className="font-sans font-black text-2xl text-white tracking-tight">
                      {totalUniqueModels}
                      <span className="text-sm text-neutral-500 ml-1">/ {catalog.length}</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (bagTab !== "wishlist") {
                        setShowTrophyCase(!showTrophyCase);
                      }
                    }}
                    className={`w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center transition-colors bg-neutral-950 ${bagTab === "wishlist" ? "cursor-default" : "hover:bg-neutral-900 cursor-pointer"}`}
                    title={bagTab === "wishlist" ? "" : "Toggle Trophy Case"}
                    disabled={bagTab === "wishlist"}
                  >
                    <AnimatePresence mode="wait">
                      {showTrophyCase ? (
                        <motion.div key="trophy" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                      ) : (
                        <motion.div key="ball" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <GolfBallOutlineIcon className="w-5 h-5 text-[#2563eb]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

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
              </div>

              {/* Owned Locker Container */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2 gap-2">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setBagTab("owned")}
                      className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                        bagTab === "owned"
                          ? "border-[#2563eb] text-white"
                          : "border-transparent text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      <GolfBagIcon className={`w-5 h-5 ${bagTab === "owned" ? "text-neutral-400" : ""}`} />
                      <h2 className="font-sans font-black text-base uppercase tracking-wider">
                        My Bag
                      </h2>
                    </button>
                    
                    {userProfile && (
                      <button
                        onClick={() => setBagTab("wishlist")}
                        className={`flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 transition-colors border-b-2 ${
                          bagTab === "wishlist"
                            ? "border-white text-white"
                            : "border-transparent text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${bagTab === "wishlist" ? "fill-current" : ""}`} />
                        <h2 className="font-sans font-black text-base uppercase tracking-wider">
                          Wishlist
                        </h2>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {balls.length > 0 && (
                      <div className="relative">
                        <select
                          value={bagSortBy}
                          onChange={(e) => setBagSortBy(e.target.value)}
                          className="appearance-none bg-neutral-950/40 border border-neutral-850 text-neutral-400 hover:text-white text-[10px] font-mono py-0.5 pl-2 pr-6 rounded-md transition-all cursor-pointer focus:outline-none focus:border-[#2563eb]"
                        >
                          <option value="added_desc">Sort: Added (New)</option>
                          <option value="added_asc">Sort: Added (Old)</option>
                          <option value="model_asc">Sort: Model (A-Z)</option>
                          <option value="model_desc">Sort: Model (Z-A)</option>
                          <option value="qty_desc">Sort: Qty (High-Low)</option>
                          <option value="qty_asc">Sort: Qty (Low-High)</option>
                          <option value="year_desc">Sort: Year (New)</option>
                          <option value="year_asc">Sort: Year (Old)</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Package Type Counts Status Bar */}
                {balls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-850/70 text-center text-xs font-mono">
                    <button 
                      type="button"
                      onClick={() => setBagFilter(bagFilter === 'ea' ? null : 'ea')}
                      className={`flex flex-col p-1.5 rounded-lg transition-all cursor-pointer border ${bagFilter === 'ea' ? 'bg-neutral-900 border-neutral-350 shadow-md' : 'bg-neutral-900/50 hover:bg-neutral-800/50 border-transparent'}`}
                    >
                      <span className={`text-[9px] uppercase tracking-wider transition-colors ${bagFilter === 'ea' ? 'text-neutral-400 font-bold' : 'text-neutral-500'}`}>Balls</span>
                      <span className="text-white font-black text-sm mt-0.5">{eaCount}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBagFilter(bagFilter === 'sleeve' ? null : 'sleeve')}
                      className={`flex flex-col p-1.5 rounded-lg transition-all cursor-pointer border ${bagFilter === 'sleeve' ? 'bg-neutral-900 border-neutral-350 shadow-md' : 'bg-neutral-900/50 hover:bg-neutral-800/50 border-transparent'}`}
                    >
                      <span className={`text-[9px] uppercase tracking-wider transition-colors ${bagFilter === 'sleeve' ? 'text-neutral-400 font-bold' : 'text-neutral-500'}`}>Sleeves</span>
                      <span className="text-white font-black text-sm mt-0.5">{sleeveCount}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBagFilter(bagFilter === 'box' ? null : 'box')}
                      className={`flex flex-col p-1.5 rounded-lg transition-all cursor-pointer border ${bagFilter === 'box' ? 'bg-neutral-900 border-neutral-350 shadow-md' : 'bg-neutral-900/50 hover:bg-neutral-800/50 border-transparent'}`}
                    >
                      <span className={`text-[9px] uppercase tracking-wider transition-colors ${bagFilter === 'box' ? 'text-neutral-400 font-bold' : 'text-neutral-500'}`}>Boxes/Bundles</span>
                      <span className="text-white font-black text-sm mt-0.5">{boxCount}</span>
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                {(isAuthLoading || isLoadingCloudData) ? (
                  <motion.div key="loading" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} transition={{ duration: 0.2 }} className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-900/40 flex flex-col items-center justify-center shadow-inner">
                    <RefreshCw className="w-8 h-8 text-[#2563eb] animate-spin mb-3 opacity-80" />
                    <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Loading Vault...</h4>
                  </motion.div>
                ) : bagTab === "wishlist" ? (
                  <motion.div key="wishlist" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{ duration: 0.2 }} className="space-y-3">
                    {userProfile?.wishlist?.length > 0 && (
                      <VaultFilterBar items={catalog.filter(c => userProfile.wishlist.some(w => w === c.id || w.startsWith(`${c.id}-pkg-`)))} filters={wishlistFilters} showCondition={false}>
                        <button
                          onClick={() => setShowClearWishlistConfirm(true)}
                          className="shrink-0 text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 whitespace-nowrap"
                        >
                          <X className="w-3 h-3" /> Clear Wishlist
                        </button>
                      </VaultFilterBar>
                    )}
                    {!userProfile?.wishlist?.length ? (
                      <div className="py-20 text-center rounded-3xl border-2 border-dashed border-neutral-850 bg-neutral-950/10 text-neutral-400">
                        <Heart className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                        <h4 className="font-bold text-neutral-350 text-sm">Your wishlist is empty</h4>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          Click the heart icon on any catalog item to add it to your wishlist.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Array.from(new Set(userProfile.wishlist.map(id => id.replace(/-pkg-(box|ea)$/, ""))))
                          .map(baseId => catalog.find(c => c.id === baseId))
                          .filter(item => {
                            if (!item) return false;
                            const matchesAdvancedModel = !wFilterModel || item.model === wFilterModel;
                            const matchesAdvancedColor = !wFilterColor || item.color === wFilterColor;
                            const matchesAdvancedVariation = !wFilterVariation || item.variation === wFilterVariation;
                            const matchesAdvancedYear = !wFilterYear || item.year === wFilterYear;
                            const matchesAdvancedName = !wFilterName || item.name === wFilterName;
                            return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;
                          })
                          .map((item, index) => {
                            if (!item) return null;
                            return (
                            <CatalogItemCard
                              index={index}
                              key={item.id}
                              item={item}
                              isReadOnly={!currentUser}
                              onAddToLocker={handleAddBallFromCatalog}
                              wishlistItems={userProfile.wishlist}
                              onToggleWishlist={handleToggleWishlist}
                              variant="wishlist"
                            />
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="bag" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.2 }} className="space-y-4">
                    <AnimatePresence mode="wait">
                    {showTrophyCase ? (
                      <motion.div key="trophycase" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ perspective: 1000 }}>
                        <TrophyCase 
                          uniqueBalls={uniqueTrophyBalls}
                          username={userProfile?.username || "GOLFER"}
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="gridcase" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ perspective: 1000 }}>
                    {balls.length > 0 && (
                      <VaultFilterBar items={balls} filters={bagFilters} showCondition={true} />
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
                        {balls
                          .map((ball, index) => ({ ball, index }))
                          .filter(({ ball }) => !bagFilter || ball.packageType === bagFilter || (!ball.packageType && bagFilter === 'ea'))
                          .filter(({ ball }) => {
                            const matchesAdvancedModel = !bFilterModel || ball.model === bFilterModel;
                            const matchesAdvancedColor = !bFilterColor || ball.color === bFilterColor;
                            const matchesAdvancedVariation = !bFilterVariation || ball.variation === bFilterVariation;
                            const matchesAdvancedYear = !bFilterYear || ball.year === bFilterYear;
                            const matchesAdvancedName = !bFilterName || ball.name === bFilterName;
                            const matchesAdvancedCondition = !bFilterCondition || ball.condition === bFilterCondition;
                            return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedCondition;
                          })
                          .sort((a, b) => {
                            switch (bagSortBy) {
                              case 'added_desc': return a.index - b.index;
                              case 'added_asc': return b.index - a.index;
                          case 'model_asc': return a.ball.model.localeCompare(b.ball.model) || (a.ball.name || "").localeCompare(b.ball.name || "");
                          case 'model_desc': return b.ball.model.localeCompare(a.ball.model) || (b.ball.name || "").localeCompare(a.ball.name || "");
                          case 'qty_desc': return b.ball.quantity - a.ball.quantity;
                          case 'qty_asc': return a.ball.quantity - b.ball.quantity;
                          case 'year_desc': return (b.ball.year || "").localeCompare(a.ball.year || "");
                          case 'year_asc': return (a.ball.year || "").localeCompare(b.ball.year || "");
                          default: return a.index - b.index;
                        }
                      })
                      .map(({ ball }, index) => (
                      <OwnedBallCard
                        index={index}
                        key={ball.id}
                        ball={ball}
                        catalog={catalog}
                        onUpdateBall={handleUpdateBall}
                        onDelete={handleDeleteBall}
                      />
                    ))}
                  </div>
                )}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

            </section>
          )}
        </div>

      </main>

      {/* Styled Footer space */}
      <footer className="border-t border-neutral-850 bg-neutral-950 py-6 mt-12 text-neutral-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span>© 2026 Golf Ball Vault.</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
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
            uid: updatedUser.uid || updatedUser.id,
            displayName: updatedUser.displayName,
            username: updatedUser.username,
            avatarUrl: updatedUser.photoURL,
            preferredColor: updatedUser.preferredColor,
            role: updatedUser.role,
            shareBag: !!updatedUser.shareBag,
            shareToken: updatedUser.shareToken, pendingFriendRequestsCount: userProfile?.pendingFriendRequestsCount || 0
          });
          setAccentColor(updatedUser.preferredColor);
        }}
        onMockLogin={(mockUser) => {
          setCurrentUser(mockUser);
          setUserProfile({
            uid: mockUser.uid || mockUser.id,
            displayName: mockUser.displayName,
            username: mockUser.username,
            avatarUrl: mockUser.photoURL,
            preferredColor: mockUser.preferredColor,
            role: mockUser.role,
            shareBag: !!mockUser.shareBag,
            shareToken: mockUser.shareToken, pendingFriendRequestsCount: mockUser.pendingFriendRequestsCount || 0
          });
          setAccentColor(mockUser.preferredColor);
        }}
      />

      {/* Selected User Bag Manager Modal */}
      {selectedUserForBag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-neutral-800">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                  Bag Manager for {selectedUserForBag.displayName || selectedUserForBag.name || "User"}
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  @{selectedUserForBag.username || "user"} • {selectedUserForBag.email}
                </p>
              </div>
              <button 
                onClick={() => setSelectedUserForBag(null)}
                className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              {bagModalErrorMessage && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-xs font-mono">
                  {bagModalErrorMessage}
                </div>
              )}

              {/* Add Ball to Bag Section */}
              <div className="bg-neutral-950/40 border border-neutral-850 p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-mono font-black uppercase text-neutral-300">Add Ball to User's Bag</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
                  <div>
                    <label className="block text-[9px] uppercase text-neutral-400 mb-1">Select Catalog Ball Design</label>
                    <select
                      value={`${modalSelectedModel}|${modalSelectedColor}`}
                      onChange={(e) => {
                        const [m, c] = e.target.value.split("|");
                        setModalSelectedModel(m || "");
                        setModalSelectedColor(c || "");
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none cursor-pointer font-sans"
                    >
                      <option value="">-- Choose a Ball Design --</option>
                      {catalog.map((item) => (
                        <option key={item.id} value={`${item.model}|${item.color}`}>
                          {item.model} ({item.color})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={modalQty}
                        onChange={(e) => setModalQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase text-neutral-400 mb-1">Packaging</label>
                      <select
                        value={modalPkgType}
                        onChange={(e) => setModalPkgType(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none cursor-pointer font-sans"
                      >
                        <option value="ea">Individual (ea)</option>
                        <option value="sleeve">Sleeve (3 balls)</option>
                        <option value="box">Dozen Box (12 balls)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
                  <div>
                    <label className="block text-[9px] uppercase text-neutral-400 mb-1">Ball Play-Number</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          disabled={modalPkgType === 'box'}
                          onClick={() => {
                            setModalPlayNumber(num);
                            setModalCustomNumberInput("");
                          }}
                          className={`flex-1 text-center py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                            modalPkgType === 'box'
                              ? "bg-neutral-950 text-neutral-600 border-neutral-900 cursor-not-allowed opacity-55"
                              : modalPlayNumber === num && modalCustomNumberInput === ""
                              ? "bg-[#2563eb] border-[#2563eb] text-black"
                              : "bg-neutral-950 border-neutral-850 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <input
                        type="text"
                        maxLength={2}
                        disabled={modalPkgType === 'box'}
                        value={modalPkgType === 'box' ? "" : modalCustomNumberInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setModalCustomNumberInput(val);
                          if (val === "") {
                            setModalPlayNumber(1);
                          } else {
                            setModalPlayNumber(parseInt(val, 10));
                          }
                        }}
                        placeholder={modalPkgType === 'box' ? "—" : "##"}
                        className={`w-9 text-center py-1 font-mono text-xs border rounded transition-all focus:outline-none focus:border-neutral-500 ${
                          modalPkgType === 'box'
                            ? "border-neutral-800 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-55"
                            : modalCustomNumberInput !== ""
                            ? "bg-[#2563eb] text-black border-[#2563eb] font-bold"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400"
                        }`}
                        title={modalPkgType === 'box' ? "Not customizable for boxes" : "Enter any 2-digit number"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-neutral-400 mb-1">Condition</label>
                    <select
                      value={modalCondition}
                      onChange={(e) => setModalCondition(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none cursor-pointer font-sans"
                    >
                      <option value={BallCondition.NEW}>{BallCondition.NEW}</option>
                      <option value={BallCondition.MINT}>{BallCondition.MINT}</option>
                      <option value={BallCondition.PLAYED}>{BallCondition.PLAYED}</option>
                      <option value={BallCondition.SHAG}>{BallCondition.SHAG}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-neutral-400 mb-1">Release Year</label>
                    <select
                      value={modalYear}
                      onChange={(e) => setModalYear(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-[#2563eb] outline-none cursor-pointer font-sans"
                    >
                      <option value="">Unknown</option>
                      {Array.from({ length: new Date().getFullYear() - 2012 + 1 }, (_, i) => String(2012 + i)).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!modalSelectedModel || !modalSelectedColor) {
                      alert("Please select a ball design from the Catalog.");
                      return;
                    }
                    const today = new Date().toLocaleDateString();
                    const calculatedQty = modalPkgType === "box"
                      ? modalQty * 12
                      : modalPkgType === "sleeve"
                      ? modalQty * 3
                      : modalQty;

                    const matchedCatalogItem = catalog.find(
                      item => item.model === modalSelectedModel && item.color === modalSelectedColor
                    );
                    const customImage = matchedCatalogItem?.customImage;

                    const newBall: GolfBall = {
                      id: `OWNED-${modalSelectedModel.toUpperCase().replace(/\s+/g, "_")}-${modalSelectedColor.toUpperCase().replace(/\s+/g, "_")}-${Date.now()}`,
                      model: modalSelectedModel,
                      color: modalSelectedColor,
                      quantity: calculatedQty,
                      condition: modalCondition,
                      packageType: modalPkgType,
                      customNumber: modalPkgType === 'box' ? 1 : modalPlayNumber,
                      notes: modalNotes.trim() || "Added by Admin",
                      year: modalYear === "" ? undefined : modalYear,
                      dateAdded: today,
                      customImage
                    };
                    setSelectedUserBalls(prev => [newBall, ...prev]);
                    setModalNotes("");
                    setModalPlayNumber(1);
                    setModalCustomNumberInput("");
                    setModalYear("");
                  }}
                  className="w-full py-2 bg-[#2563eb] hover:bg-[#b5e000] text-black font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  + Add Ball to Bag
                </button>
               </div>

               {/* User Bag Inventory List */}
               <div className="space-y-3">
                 <h3 className="text-xs font-mono font-black uppercase text-neutral-300">Bag Inventory ({selectedUserBalls.length} Items)</h3>
                 {isLoadingSelectedUserBalls ? (
                   <div className="py-8 text-center text-xs text-neutral-500 font-mono flex items-center justify-center gap-2">
                     <RefreshCw className="animate-spin text-[#2563eb]" size={14} />
                     <span>Loading locker data...</span>
                   </div>
                 ) : selectedUserBalls.length === 0 ? (
                   <div className="py-8 text-center bg-neutral-950/20 border border-dashed border-neutral-850 rounded-xl text-xs text-neutral-500 font-mono">
                     This user's bag is empty.
                   </div>
                 ) : (
                   <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                     {selectedUserBalls.map((ball) => {
                        const currentPkg = ball.packageType || "ea";
                        const pkgUnit = currentPkg === "box" ? 12 : currentPkg === "sleeve" ? 3 : 1;
                        const displayQty = Math.max(1, Math.round(ball.quantity / pkgUnit));

                        return (
                          <div key={ball.id} className="bg-neutral-950 border border-neutral-850 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-3">
                              <BallVisual 
                                color={ball.color} 
                                model={ball.model} 
                                size="sm" 
                                customImage={ball.customImage} 
                                customImageSleeve={ball.customImageSleeve}
                                customImageBox={ball.customImageBox}
                                packageType={ball.packageType} 
                              />
                              <div>
                                <span className="text-white font-bold block">{ball.model}</span>
                                <span className="text-neutral-450 block text-[10px]">{ball.color} • {currentPkg === "box" ? "box" : currentPkg === "sleeve" ? "sleeve" : "ea"}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-neutral-900/60 pt-2 sm:border-t-0 sm:pt-0">
                              {/* Qty Stepper */}
                              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserBalls(prev => prev.map(b => {
                                      if (b.id === ball.id) {
                                        const step = b.packageType === "box" ? 12 : b.packageType === "sleeve" ? 3 : 1;
                                        return { ...b, quantity: Math.max(step, b.quantity - step) };
                                      }
                                      return b;
                                    }));
                                  }}
                                  className="px-2 py-0.5 text-neutral-400 hover:text-white font-extrabold cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-2 text-white font-bold text-[11px] min-w-[14px] text-center">{displayQty}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserBalls(prev => prev.map(b => {
                                      if (b.id === ball.id) {
                                        const step = b.packageType === "box" ? 12 : b.packageType === "sleeve" ? 3 : 1;
                                        return { ...b, quantity: b.quantity + step };
                                      }
                                      return b;
                                    }));
                                  }}
                                  className="px-2 py-0.5 text-neutral-400 hover:text-white font-extrabold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              {/* Packaging Type Selector */}
                              <select
                                value={currentPkg}
                                onChange={(e) => {
                                  const newPkg = e.target.value as 'ea' | 'sleeve' | 'box';
                                  setSelectedUserBalls(prev => prev.map(b => {
                                    if (b.id === ball.id) {
                                      const oldPkg = b.packageType || "ea";
                                      const oldUnit = oldPkg === "box" ? 12 : oldPkg === "sleeve" ? 3 : 1;
                                      const pkgCount = Math.max(1, Math.round(b.quantity / oldUnit));
                                      const newUnit = newPkg === "box" ? 12 : newPkg === "sleeve" ? 3 : 1;
                                      return {
                                        ...b,
                                        packageType: newPkg,
                                        quantity: pkgCount * newUnit
                                      };
                                    }
                                    return b;
                                  }));
                                }}
                                className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-[#2563eb] cursor-pointer font-sans"
                              >
                                <option value="ea">Ball (ea)</option>
                                <option value="sleeve">Sleeve (3)</option>
                                <option value="box">Box (12)</option>
                              </select>

                              {/* Condition Select */}
                              <select
                                value={ball.condition}
                                onChange={(e) => {
                                  const newCond = e.target.value as any;
                                  setSelectedUserBalls(prev => prev.map(b => b.id === ball.id ? { ...b, condition: newCond } : b));
                                }}
                                className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-[#2563eb] cursor-pointer font-sans"
                              >
                                <option value={BallCondition.NEW}>{BallCondition.NEW}</option>
                                <option value={BallCondition.MINT}>{BallCondition.MINT}</option>
                                <option value={BallCondition.PLAYED}>{BallCondition.PLAYED}</option>
                                <option value={BallCondition.SHAG}>{BallCondition.SHAG}</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserBalls(prev => prev.filter(b => b.id !== ball.id));
                                }}
                                className="p-1.5 text-neutral-500 hover:text-rose-450 hover:bg-neutral-900 rounded transition-colors cursor-pointer"
                                title="Remove Ball Stack"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                 )}
               </div>
             </div>

             {/* Modal Footer */}
             <div className="flex gap-2 justify-end p-5 border-t border-neutral-800 bg-neutral-950/60">
               <button
                 type="button"
                 onClick={() => setSelectedUserForBag(null)}
                 className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold font-sans"
               >
                 Cancel
               </button>
               <button
                 type="button"
                 disabled={isLoadingSelectedUserBalls}
                 onClick={handleSaveUserBag}
                 className="px-4 py-2 bg-[#2563eb] hover:bg-[#b5e000] text-black font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-sans"
               >
                 Save Bag Inventory
               </button>
             </div>
           </div>
         </div>
       )}

      {/* Vault Manager Modal */}
      {isVaultManagerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-950/60">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                  Vault Manager
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  Prune and edit existing designs to prevent duplicate similar entries.
                </p>
              </div>
              <button 
                disabled={isVaultProcessing}
                onClick={() => {
                  setIsVaultManagerOpen(false);
                  setEditingItem(null);
                  setAdminSearchQuery("");
                  setAdminBrandFilter("ALL");
                }}
                className={`p-1 rounded-lg transition-all ${
                  isVaultProcessing
                    ? "text-neutral-750 cursor-not-allowed"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-850 cursor-pointer"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6 relative" id="register-missing-database-panel">
              {isVaultProcessing && (
                <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-fade-in p-6">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center space-y-1">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider">Syncing with the Ball Vault</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">Please keep this window open while we commit database changes...</p>
                  </div>
                </div>
              )}
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
                      : "text-neutral-550 hover:text-neutral-350"
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
                      : "text-neutral-550 hover:text-neutral-350"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excel / XLS Bulk</span>
                </button>
              </div>

              {!showXlsImporter ? (
                <AddMissingBallForm 
                  catalog={catalog}
                  onAddCatalogItem={handleAddCatalogItem} 
                  onUpdateCatalogItem={handleUpdateCatalogItem}
                  editItem={editingItem}
                  onCancelEdit={() => setEditingItem(null)}
                />
              ) : (
                <XlsImporter onImportItems={handleXlsImportCatalogItems} />
              )}

              {/* Registry Manager List Header */}
              <div className="border-t border-neutral-800 pt-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider text-[#2563eb] font-extrabold">
                      Existing Catalog
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      Search and manage balls that are already in the vault
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[9px] bg-neutral-950 border border-neutral-850 text-neutral-400 px-2 py-0.5 rounded font-mono">
                      {catalog.length} BALLS
                    </span>
                    <div className="flex items-center gap-1.5">
                      {catalog.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExportCatalogToExcel}
                          className="text-[9px] font-mono text-neutral-400 hover:text-emerald-450 border border-neutral-850 hover:border-emerald-950/40 bg-neutral-950/30 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-450" /> Export
                        </button>
                      )}
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
                </div>

                {/* Admin filter input & Model filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={13} />
                    <input
                      type="text"
                      placeholder="Search database..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="w-full bg-neutral-950 hover:bg-neutral-900/60 border border-neutral-850 rounded-xl px-9 py-2 text-xs text-white placeholder-neutral-550 outline-none focus:border-neutral-750 transition-all font-mono"
                    />
                    {adminSearchQuery && (
                      <button
                        onClick={() => setAdminSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-550 hover:text-white"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono uppercase text-neutral-450 shrink-0">Filter model:</span>
                    <div className="relative w-full sm:w-[180px]">
                      <select
                        value={adminBrandFilter}
                        onChange={(e) => setAdminBrandFilter(e.target.value)}
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

                {/* Admin items list */}
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 font-sans">
                  {catalog
                    .filter(item => {
                      const q = adminSearchQuery.toLowerCase();
                      const matchesSearch = 
                        item.model.toLowerCase().includes(q) || 
                        item.color.toLowerCase().includes(q) ||
                        (item.name && item.name.toLowerCase().includes(q)) ||
                        (item.variation && item.variation.toLowerCase().includes(q)) ||
                        (item.notes && item.notes.toLowerCase().includes(q)) ||
                        (item.year && item.year.toLowerCase().includes(q));

                      const matchesBrand = 
                        adminBrandFilter === "ALL" || 
                        item.model === adminBrandFilter;

                      return matchesSearch && matchesBrand;
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
                              customImageSleeve={item.customImageSleeve}
                              customImageBox={item.customImageBox}
                            />
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-bold text-xs text-white truncate max-w-[120px] md:max-w-[160px]">
                                {item.model}{item.name ? ` - ${item.name}` : ''}
                              </h5>
                              {item.year && (
                                <span className="text-[9px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-450 px-1.5 py-0.5 rounded leading-none scale-90 select-none">
                                  {item.year}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5 flex flex-wrap gap-x-2 items-center">
                              <span className="font-medium text-neutral-300">{item.color}</span>
                              {(item.variation || item.notes) && (
                                <>
                                  <span className="text-neutral-600 font-mono select-none">•</span>
                                  <span className="text-neutral-400 italic text-[10px] truncate max-w-[150px] md:max-w-[280px]" title={
                                    item.variation || item.notes
                                  }>
                                    {item.variation || item.notes}
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
                                title="Confirm delete specification"
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
                                  // Smoothly scroll to top of database panel inside the modal
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
                                className="p-1 rounded-md bg-neutral-900 hover:bg-rose-950/50 border border-neutral-850 hover:border-rose-900 text-neutral-555 hover:text-rose-455 transition-colors cursor-pointer"
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
                      Ball Vault list is empty. Create some above or use Excel Bulk Import!
                    </div>
                  ) : (
                    catalog.filter(item => {
                      const q = adminSearchQuery.toLowerCase();
                      const matchesSearch = 
                        item.model.toLowerCase().includes(q) || 
                        item.color.toLowerCase().includes(q) ||
                        (item.name && item.name.toLowerCase().includes(q)) ||
                        (item.variation && item.variation.toLowerCase().includes(q)) ||
                        (item.notes && item.notes.toLowerCase().includes(q)) ||
                        (item.year && item.year.toLowerCase().includes(q));

                      const matchesBrand = 
                        adminBrandFilter === "ALL" || 
                        item.model === adminBrandFilter;

                      return matchesSearch && matchesBrand;
                    }).length === 0 && (
                      <div className="py-6 text-center border border-dashed border-neutral-850 rounded-xl bg-neutral-950/10 text-neutral-500 text-xs">
                        No balls match "{adminSearchQuery}"{adminBrandFilter !== "ALL" && ` under model "${adminBrandFilter}"`}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Manager Modal */}
      
      {isFriendsPortalOpen && userProfile && (
        <FriendsPortal
          currentUserUid={userProfile.uid}
          onClose={() => {
            setIsFriendsPortalOpen(false);
            if (userProfile?.uid) {
              fetch(`/api/users/${userProfile.uid}/profile`)
                .then(res => res.json())
                .then(data => {
                  if (data) {
                    setUserProfile(prev => prev ? {
                      ...prev,
                      pendingFriendRequestsCount: data.pendingFriendRequestsCount || 0
                    } : null);
                  }
                })
                .catch(err => console.error("Failed to refresh friend requests count", err));
            }
          }}
          onViewBag={(username) => {
            setFriendBagUsername(username);
          }}
        />
      )}

      {isUserManagerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-950/60">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                  User Manager
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  Manage registered user accounts, edit profiles, and view/edit locker bags.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsUserManagerOpen(false);
                  setEditingUserId(null);
                }}
                className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6">
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
                    <button onClick={fetchUsers} className="text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer">
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
                      const isSelf = userUid === currentUser?.uid || user.authUid === currentUser?.uid;
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
                                    type={showEditPassword ? "text" : "password"}
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    onFocus={() => setEditPasswordFocused(true)}
                                    onBlur={() => setTimeout(() => setEditPasswordFocused(false), 200)}
                                    className={`w-full bg-neutral-950 border rounded-lg p-2 pl-2 pr-9 text-xs text-white focus:border-[#2563eb] outline-none ${editPassword && editPasswordConfirm && editPassword !== editPasswordConfirm ? "border-red-600" : "border-neutral-800"}`}
                                    placeholder="Leave blank to keep"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                                  >
                                    {showEditPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                                  </button>
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
                                    type={showEditConfirmPassword ? "text" : "password"}
                                    value={editPasswordConfirm}
                                    onChange={(e) => setEditPasswordConfirm(e.target.value)}
                                    className={`w-full bg-neutral-950 border rounded-lg p-2 pl-2 pr-[60px] text-xs focus:border-[#2563eb] outline-none ${
                                      editPasswordConfirm && editPassword !== editPasswordConfirm
                                        ? "border-red-600 text-red-400"
                                        : editPasswordConfirm && editPassword === editPasswordConfirm && editPassword
                                        ? "border-emerald-600 text-white"
                                        : "border-neutral-800 text-white"
                                    }`}
                                    placeholder="Re-enter password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-1"
                                  >
                                    {showEditConfirmPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                                  </button>
                                  {editPasswordConfirm && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold pointer-events-none">
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
                                        className="w-6 h-6 rounded-full border border-transparent transition-transform hover:scale-110 active:scale-95 mx-auto block cursor-pointer"
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
                                        className="w-6 h-6 rounded-full border border-transparent transition-transform hover:scale-110 active:scale-95 mx-auto block cursor-pointer"
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
                              onClick={() => handleViewUserBag(user)}
                              className="p-1 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-750 text-neutral-355 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono font-black cursor-pointer"
                              title="View & Edit Bag"
                            >
                              <ShoppingBag size={10} />
                              <span>Show Bag</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingUser(user)}
                              className="p-1 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-750 text-[#2563eb] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono font-black cursor-pointer"
                              title="Edit User Settings"
                            >
                              <Pencil size={10} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingUserId(userUid);
                              }}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/50 border border-neutral-800 hover:border-rose-900 text-neutral-555 hover:text-rose-455 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styled Deletion Confirmation Modal */}
      {deletingUserId && (() => {
        const targetUser = usersList.find(u => (u.uid || u.id) === deletingUserId);
        const isSelfDeletion = targetUser && (
          (targetUser.uid || targetUser.id) === currentUser?.uid ||
          targetUser.authUid === currentUser?.uid
        );

        if (isSelfDeletion) {
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-neutral-900 border border-amber-950/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Self-Deletion Blocked
                </h3>
                <p className="text-xs text-neutral-350 font-mono leading-relaxed">
                  You cannot delete your own logged in account (<span className="text-white font-bold font-sans">{targetUser?.displayName || "System Admin"}</span>). This self-protection safeguard prevents administrative lockout.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDeletingUserId(null)}
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-450 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold font-mono uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-neutral-900 border border-rose-950/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Confirm Delete User
              </h3>
              <p className="text-xs text-neutral-350 font-mono leading-relaxed">
                Are you absolutely sure you want to delete user <span className="text-white font-bold font-sans">
                  {targetUser?.displayName || "this user"}
                </span>? This will also purge their custom specifications and locker storage permanently.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingUserId(null)}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteUser(deletingUserId);
                    setDeletingUserId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        onDeleteBag={handleDeleteAllLocker}
        hasBagItems={balls.length > 0}
      />

      {/* Clear Wishlist Confirmation Modal */}
      <AnimatePresence>
      {showClearWishlistConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            className="bg-neutral-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
          >
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
            <h4 className="text-white font-sans font-black text-base uppercase tracking-wider">
              Clear Wishlist
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Are you sure you want to remove all items from your wishlist? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 pt-2 w-full">
              <button
                type="button"
                onClick={() => setShowClearWishlistConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClearWishlist();
                  setShowClearWishlistConfirm(false);
                }}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] uppercase font-extrabold tracking-wider rounded-xl transition-all cursor-pointer border-none"
              >
                Yes, Clear
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

       {/* Toast Notification */}
       {toast && (
         <div className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2.5 font-mono text-xs animate-fade-in ${
           toast.type === 'success' 
             ? 'bg-neutral-900 border-emerald-900 text-emerald-400' 
             : 'bg-rose-950/80 border-rose-900 text-rose-300'
         }`}>
           <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
           <span>{toast.message}</span>
         </div>
       )}

     </div>
   );
 }
