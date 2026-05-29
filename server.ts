import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import crypto from "crypto";
import { BallModel } from "./src/types";
import { VICE_BALLS_SPECS, COLOR_STYLES, SCRAPED_BALLS } from "./src/constants";

const _filename = typeof __filename !== "undefined"
  ? __filename
  : typeof import.meta !== "undefined" && import.meta.url
    ? fileURLToPath(import.meta.url)
    : "";
const _dirname = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(_filename);


interface UserProfile {
  uid: string;
  displayName: string;
  role: "Admin" | "User";
  preferredColor: string;
  avatarUrl?: string;
  createdAt: string;
  email?: string;
  password?: string;
  username?: string;
  authUid?: string;
  shareBag?: boolean;
  shareToken?: string;
}

const OB_KEY = "ViceVaultSecretObfuscationKey_2026";

function encryptUsername(username: string): string {
  if (!username) return "";
  const buffer = Buffer.from(username, "utf-8");
  const keyBuf = Buffer.from(OB_KEY, "utf-8");
  const result = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ keyBuf[i % keyBuf.length];
  }
  return result.toString("base64url");
}

function decryptUsername(token: string): string | null {
  try {
    const buffer = Buffer.from(token, "base64url");
    const keyBuf = Buffer.from(OB_KEY, "utf-8");
    const result = Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      result[i] = buffer[i] ^ keyBuf[i % keyBuf.length];
    }
    return result.toString("utf-8");
  } catch (err) {
    return null;
  }
}

interface CatalogItem {
  id: string;
  model: string;
  name?: string;
  color: string;
  variation?: string;
  year?: string;
  customImage?: string;
  customImageSleeve?: string;
  customImageBox?: string;
  notes?: string;
}

function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, hash] = storedHash.split(":");
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === checkHash;
}

function cleanUsernameString(username: string): string {
  let u = username.trim().toLowerCase();
  if (u.includes("@")) {
    const parts = u.split("@");
    u = parts[0] ? parts[0] : parts[1];
  }
  return u.replace(/[^a-z0-9_]/g, "");
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "15mb" }));

// Paths for JSON file persistence
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const USERS_DATA_DIR = path.join(DATA_DIR, "users_data");
const PRESERVED_IMAGES_FILE = path.join(DATA_DIR, "preserved_images.json");

// Dynamic directory and file creation if not exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_DATA_DIR)) {
  fs.mkdirSync(USERS_DATA_DIR, { recursive: true });
}

// Initial Mock users
const DEFAULT_USERS: UserProfile[] = [
  {
    uid: "u-admin",
    displayName: "System Admin",
    email: "admin@vault.com",
    username: "admin",
    role: "Admin",
    preferredColor: "#2563eb",
    avatarUrl: "preset-1",
    password: hashPassword("AdminPass123!"),
    shareBag: true,
    createdAt: new Date().toISOString()
  },
  {
    uid: "u-user",
    displayName: "System User",
    email: "user@vault.com",
    username: "user",
    role: "User",
    preferredColor: "#2563eb",
    avatarUrl: "preset-1",
    password: hashPassword("AdminPass123!"),
    shareBag: false,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_LOCKER: any[] = [];


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

// Dynamically build DEFAULT_IMAGES mapping from SCRAPED_BALLS for compatibility
const DEFAULT_IMAGES: Record<string, string> = SCRAPED_BALLS.reduce((acc, ball) => {
  if (ball.customImage) {
    acc[ball.id] = ball.customImage;
  }
  return acc;
}, {} as Record<string, string>);

// Initial Standard Catalog templates
const DEFAULT_CATALOG: CatalogItem[] = SCRAPED_BALLS;

function loadUsers(): UserProfile[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error loading users file, fallback to defaults.", error);
  }
  saveUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function saveUsers(users: UserProfile[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write users file", error);
  }
}

// Global Catalog File Load/Save (Fallback Mode)
function loadCatalog(): CatalogItem[] {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const raw = fs.readFileSync(CATALOG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error loading catalog file, fallback to defaults.", error);
  }
  saveCatalog(DEFAULT_CATALOG);
  return DEFAULT_CATALOG;
}

function saveCatalog(catalog: CatalogItem[]) {
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write catalog file", error);
  }
}

interface PreservedImages {
  customImage?: string;
  customImageSleeve?: string;
  customImageBox?: string;
}

function loadPreservedImagesLocal(): Record<string, PreservedImages> {
  try {
    if (fs.existsSync(PRESERVED_IMAGES_FILE)) {
      const raw = fs.readFileSync(PRESERVED_IMAGES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error loading preserved images file", error);
  }
  return {};
}

function savePreservedImagesLocal(data: Record<string, PreservedImages>) {
  try {
    fs.writeFileSync(PRESERVED_IMAGES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write preserved images file", error);
  }
}

async function preserveCatalogImages(
  id: string,
  customImage?: string,
  customImageSleeve?: string,
  customImageBox?: string
) {
  if (!customImage && !customImageSleeve && !customImageBox) return;

  const updateObj: PreservedImages = {};
  if (customImage) updateObj.customImage = customImage;
  if (customImageSleeve) updateObj.customImageSleeve = customImageSleeve;
  if (customImageBox) updateObj.customImageBox = customImageBox;

  if (dbAdmin) {
    try {
      await dbAdmin.collection("preserved_images").doc(id).set(updateObj, { merge: true });
    } catch (error) {
      console.error("Firestore preserveCatalogImages failed:", error);
    }
  }

  const localData = loadPreservedImagesLocal();
  localData[id] = {
    ...(localData[id] || {}),
    ...updateObj
  };
  savePreservedImagesLocal(localData);
}

async function lookupPreservedImages(id: string): Promise<PreservedImages | null> {
  if (dbAdmin) {
    try {
      const docSnap = await dbAdmin.collection("preserved_images").doc(id).get();
      if (docSnap.exists) {
        return docSnap.data() as PreservedImages;
      }
    } catch (error) {
      console.error("Firestore lookupPreservedImages failed:", error);
    }
  }

  const localData = loadPreservedImagesLocal();
  if (localData[id]) {
    return localData[id];
  }
  return null;
}

function getUserDataPath(uid: string): string {
  const sanitizedUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(USERS_DATA_DIR, `${sanitizedUid}.json`);
}

function loadUserData(uid: string) {
  const filePath = getUserDataPath(uid);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error(`Error loading user data for ${uid}`, error);
  }
  return null;
}

function saveUserData(uid: string, data: any) {
  const filePath = getUserDataPath(uid);
  try {
    const existing = loadUserData(uid) || {};
    const updated = { ...existing, ...data };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving user data for ${uid}`, error);
  }
}

async function deleteFirestoreDocAndSubcollections(docRef: admin.firestore.DocumentReference) {
  const subcollections = await docRef.listCollections();
  for (const sub of subcollections) {
    const docs = await sub.get();
    for (const doc of docs.docs) {
      await deleteFirestoreDocAndSubcollections(doc.ref);
    }
  }
  await docRef.delete();
}

async function cleanDatabaseFields() {
  console.log("Starting database cleanup migration to remove obsolete fields and unauthorized users...");
  let realAdminUid = "u-admin";
  let realUserUid = "u-user";
  
  const fieldsToRemove = ["compression", "cover", "feel", "layers", "tagline", "isCustom"];
  const userFieldsToRemove = [
    "compression", "cover", "feel", "layers", "tagline", "isCustom",
    "customCompression", "customCover", "customFeel", "customLayers",
    "isPackaged", "historyLogs"
  ];

  const cleanObject = (obj: any, keys: string[]) => {
    if (!obj || typeof obj !== "object") return obj;
    const cleaned = { ...obj };
    const lowerKeys = keys.map(x => x.toLowerCase());
    Object.keys(cleaned).forEach(origKey => {
      if (lowerKeys.includes(origKey.toLowerCase())) {
        delete cleaned[origKey];
      }
    });
    return cleaned;
  };

  // 1. Clean and prune local users.json
  const initialAdmin = DEFAULT_USERS.find(u => u.uid === "u-admin")!;
  const initialUser = DEFAULT_USERS.find(u => u.uid === "u-user")!;

  let localUsers = loadUsers();
  const adminInFile = localUsers.find(u => u.email?.toLowerCase() === "admin@vault.com");
  const userInFile = localUsers.find(u => u.email?.toLowerCase() === "user@vault.com");

  // Keep track of old IDs to migrate local data files if necessary
  const oldAdminId = adminInFile ? adminInFile.uid : null;
  const oldUserId = userInFile ? userInFile.uid : null;

  const finalAdmin: UserProfile = adminInFile ? { ...adminInFile, uid: "u-admin" } : { ...initialAdmin };
  finalAdmin.role = "Admin";
  finalAdmin.email = "admin@vault.com";
  finalAdmin.username = "admin";

  const finalUser: UserProfile = userInFile ? { ...userInFile, uid: "u-user" } : { ...initialUser };
  // Do not copy settings from admin
  finalUser.displayName = finalUser.displayName || initialUser.displayName;
  finalUser.preferredColor = finalUser.preferredColor || initialUser.preferredColor;
  finalUser.avatarUrl = finalUser.avatarUrl || initialUser.avatarUrl;
  finalUser.password = finalUser.password || initialUser.password;
  finalUser.role = "User";
  finalUser.email = "user@vault.com";
  finalUser.username = "user";

  const updatedLocalUsers = [finalAdmin, finalUser];
  saveUsers(updatedLocalUsers);
  console.log("Pruned local users.json to contain only admin@vault.com and user@vault.com with standardized UIDs");

  // Migrate local files from old IDs to standardized UIDs if necessary
  const migrateLocalFile = (oldId: string | null, newId: string) => {
    if (oldId && oldId !== newId) {
      const oldPath = path.join(USERS_DATA_DIR, `${oldId.replace(/[^a-zA-Z0-9_-]/g, "")}.json`);
      const newPath = path.join(USERS_DATA_DIR, `${newId}.json`);
      if (fs.existsSync(oldPath)) {
        console.log(`Migrating local user data from ${oldId} to ${newId}`);
        try {
          fs.renameSync(oldPath, newPath);
        } catch (err) {
          console.error(`Failed to rename ${oldPath} to ${newPath}:`, err);
        }
      }
    }
  };

  migrateLocalFile(oldAdminId, "u-admin");
  migrateLocalFile(oldUserId, "u-user");
  // Also migrate from legacy mock-u-admin and mock-u-user to u-admin and u-user
  migrateLocalFile("mock-u-admin", "u-admin");
  migrateLocalFile("mock-u-user", "u-user");

  // Set up allowed UIDs
  const allowedUids = new Set<string>(["u-admin", "u-user"]);

  // Fetch active Firebase Auth users if Firebase Admin is initialized
  if (isFirebaseAdminInitialized) {
    try {
      console.log("Fetching active users from Firebase Auth...");
      let nextPageToken: string | undefined = undefined;
      do {
        const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
        for (const userRecord of listUsersResult.users) {
          const emailLower = userRecord.email?.toLowerCase();
          if (emailLower === "admin@vault.com") {
            realAdminUid = userRecord.uid;
            allowedUids.add(userRecord.uid);
          } else if (emailLower === "user@vault.com") {
            realUserUid = userRecord.uid;
            allowedUids.add(userRecord.uid);
          } else {
            // Delete this random user from Firebase Auth!
            console.log(`Pruning unauthorized Auth user: ${userRecord.email} (${userRecord.uid})`);
            try {
              await admin.auth().deleteUser(userRecord.uid);
            } catch (delErr) {
              console.error(`Failed to delete user ${userRecord.email} from Auth:`, delErr);
            }
          }
        }
        nextPageToken = listUsersResult.pageToken;
      } while (nextPageToken);
      console.log(`Fetched and pruned active Firebase Auth users. Total allowed UIDs: ${allowedUids.size}. Real Admin UID: ${realAdminUid}, Real User UID: ${realUserUid}`);
    } catch (e) {
      console.error("Failed to fetch/prune users from Firebase Auth:", e);
    }
  }

  // 2. Prune legacy user data files and clean/seed remaining lockers
  if (fs.existsSync(USERS_DATA_DIR)) {
    try {
      const files = fs.readdirSync(USERS_DATA_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const fileUid = file.slice(0, -5);
          if (!allowedUids.has(fileUid)) {
            console.log(`Pruning legacy user data file: ${file}`);
            try {
              fs.unlinkSync(path.join(USERS_DATA_DIR, file));
            } catch (err) {
              console.error(`Failed to delete file ${file}:`, err);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to prune legacy user data files:", e);
    }
  }

  // Clean/seed lockers for allowed local users
  for (const u of updatedLocalUsers) {
    const uPath = getUserDataPath(u.uid);
    let data: any = {};
    if (fs.existsSync(uPath)) {
      try {
        data = JSON.parse(fs.readFileSync(uPath, "utf-8"));
      } catch (e) {
        console.error(`Failed to parse user data for ${u.uid}:`, e);
      }
    }
    
    // Seed default locker if missing or empty or for admin/user default accounts
    if (u.uid === "admin" || u.uid === "user" || !data.balls || !Array.isArray(data.balls) || data.balls.length === 0) {
      data.balls = [...DEFAULT_LOCKER];
      console.log(`Seeding default locker for local user ${u.uid}`);
    } else {
      data.balls = data.balls.map((b: any) => cleanObject(b, userFieldsToRemove));
    }
    
    if (data.catalog && Array.isArray(data.catalog)) {
      data.catalog = data.catalog.map((c: any) => cleanObject(c, fieldsToRemove));
    }
    
    try {
      fs.writeFileSync(uPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`Failed to save user data for ${u.uid}:`, err);
    }
  }

  // 3. Clean local catalog.json if it exists
  if (fs.existsSync(CATALOG_FILE)) {
    try {
      const raw = fs.readFileSync(CATALOG_FILE, "utf-8");
      const catalog = JSON.parse(raw);
      if (Array.isArray(catalog)) {
        const cleaned = catalog.map(item => cleanObject(item, fieldsToRemove));
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(cleaned, null, 2), "utf-8");
        console.log("Successfully cleaned local catalog.json");
      }
    } catch (e) {
      console.error("Failed to clean local catalog.json:", e);
    }
  }

  // 4. Clean and prune Firestore collections if initialized
  if (dbAdmin) {
    try {
      console.log("Pruning unauthorized users from Firestore and standardizing UIDs...");
      const usersSnap = await dbAdmin.collection("users").get();

      // 4A. Find existing doc IDs for admin@vault.com and user@vault.com in Firestore
      const adminDoc = usersSnap.docs.find(doc => doc.data()?.email?.toLowerCase() === "admin@vault.com");
      const userDoc = usersSnap.docs.find(doc => doc.data()?.email?.toLowerCase() === "user@vault.com");

      // 4B. Fetch locker data from old documents if their ID is not u-admin/u-user
      let adminLockerBalls = null;
      let userLockerBalls = null;

      if (adminDoc && adminDoc.id !== "u-admin") {
        console.log(`Found existing admin@vault.com under doc ID: ${adminDoc.id}. Migrating locker...`);
        const lockerSnap = await dbAdmin.collection("users").doc(adminDoc.id).collection("data").doc("locker").get();
        if (lockerSnap.exists) {
          adminLockerBalls = lockerSnap.data()?.balls;
        }
      }

      if (userDoc && userDoc.id !== "u-user") {
        console.log(`Found existing user@vault.com under doc ID: ${userDoc.id}. Migrating locker...`);
        const lockerSnap = await dbAdmin.collection("users").doc(userDoc.id).collection("data").doc("locker").get();
        if (lockerSnap.exists) {
          userLockerBalls = lockerSnap.data()?.balls;
        }
      }

      // 4C. Delete all users from Firestore that are not authorized, or migrate legacy authorized ones
      for (const doc of usersSnap.docs) {
        const docId = doc.id;
        const data = doc.data();
        const firebaseAuthUid = data.uid || data.authUid;
        const isAllowed = docId === "u-admin" || docId === "u-user" || (firebaseAuthUid && allowedUids.has(firebaseAuthUid));
        if (!isAllowed) {
          console.log(`Pruning unauthorized Firestore user doc and subcollections: ${docId}`);
          await deleteFirestoreDocAndSubcollections(doc.ref);
        } else if (!docId.startsWith("u-") && docId !== "u-admin" && docId !== "u-user") {
          // This is an authorized user, but uses a legacy raw Auth UID document ID. Migrate it!
          const username = (data.username || (data.email ? data.email.split('@')[0] : null) || "user").toLowerCase();
          const targetDocId = `u-${username}`;
          console.log(`Found legacy authorized user doc ${docId} for username ${username}. Migrating to ${targetDocId}...`);
          
          const targetRef = dbAdmin.collection("users").doc(targetDocId);
          // Save the user data to the new document
          await targetRef.set({
            ...data,
            uid: firebaseAuthUid,
            authUid: firebaseAuthUid,
            username: username
          }, { merge: true });

          // Copy locker subcollection
          const oldLockerRef = doc.ref.collection("data").doc("locker");
          const oldLockerSnap = await oldLockerRef.get();
          if (oldLockerSnap.exists) {
            const targetLockerRef = targetRef.collection("data").doc("locker");
            await targetLockerRef.set(oldLockerSnap.data() || {});
            console.log(`Migrated locker subcollection for legacy user ${docId} -> ${targetDocId}`);
          }
          
          // Now delete the old document
          console.log(`Deleting legacy user doc & subcollections: ${docId}`);
          await deleteFirestoreDocAndSubcollections(doc.ref);
        }
      }


      // 4D. Set up the two target users in Firestore with u-USERNAME IDs
      const firestoreAdminData = adminDoc ? { ...adminDoc.data() } : { ...initialAdmin };
      firestoreAdminData.uid = realAdminUid; // Keep internal uid field as the Auth UID
      firestoreAdminData.role = "Admin";
      firestoreAdminData.email = "admin@vault.com";
      firestoreAdminData.username = "admin";

      const firestoreUserData = userDoc ? { ...userDoc.data() } : { ...initialUser };
      firestoreUserData.uid = realUserUid; // Keep internal uid field as the Auth UID
      firestoreUserData.displayName = firestoreUserData.displayName || initialUser.displayName;
      firestoreUserData.preferredColor = firestoreUserData.preferredColor || initialUser.preferredColor;
      firestoreUserData.avatarUrl = firestoreUserData.avatarUrl || initialUser.avatarUrl;
      firestoreUserData.password = firestoreUserData.password || initialUser.password;
      firestoreUserData.role = "User";
      firestoreUserData.email = "user@vault.com";
      firestoreUserData.username = "user";

      const finalFirestoreUsers = [
        { docId: "u-admin", data: firestoreAdminData, authUid: realAdminUid, lockerBalls: adminLockerBalls },
        { docId: "u-user", data: firestoreUserData, authUid: realUserUid, lockerBalls: userLockerBalls }
      ];

      for (const item of finalFirestoreUsers) {
        const userRef = dbAdmin.collection("users").doc(item.docId);
        
        // Ensure profile settings are updated and correct
        await userRef.set({
          ...item.data,
          uid: item.authUid, // Keep Auth UID inside the 'uid' field
          authUid: item.authUid,
          username: item.docId.replace(/^u-/, "") // Ensure username field matches doc ID
        }, { merge: true });
        
        const lockerRef = userRef.collection("data").doc("locker");
        const lockerSnap = await lockerRef.get();

        let currentBalls = item.lockerBalls || (lockerSnap.exists ? lockerSnap.data()?.balls : null);
        
        if (item.docId === "u-admin" || item.docId === "u-user" || !currentBalls || !Array.isArray(currentBalls) || currentBalls.length === 0) {
          console.log(`Seeding default Firestore locker for user: ${item.docId}`);
          await lockerRef.set({ balls: DEFAULT_LOCKER });
        } else {
          const cleanedBalls = currentBalls.map((b: any) => cleanObject(b, userFieldsToRemove));
          await lockerRef.set({ balls: cleanedBalls });
          console.log(`Cleaned Firestore locker for user: ${item.docId}`);
        }
      }

      // Clean lockers of other active users from Firestore
      const freshUsersSnap = await dbAdmin.collection("users").get();
      for (const doc of freshUsersSnap.docs) {
        const docId = doc.id;
        if (docId !== "u-admin" && docId !== "u-user") {
          const lockerRef = doc.ref.collection("data").doc("locker");
          const lockerSnap = await lockerRef.get();
          if (lockerSnap.exists) {
            const currentBalls = lockerSnap.data()?.balls;
            if (Array.isArray(currentBalls) && currentBalls.length > 0) {
              const cleanedBalls = currentBalls.map((b: any) => cleanObject(b, userFieldsToRemove));
              await lockerRef.set({ balls: cleanedBalls }, { merge: true });
              console.log(`Cleaned Firestore locker for active user doc: ${docId}`);
            }
          }
        }
      }

      // 4E. Clean catalog collection in Firestore
      console.log("Cleaning Firestore catalog collection...");
      const catalogSnap = await dbAdmin.collection("catalog").get();
      const catalogBatch = dbAdmin.batch();
      let catalogNeedsCommit = false;
      catalogSnap.forEach(doc => {
        const data = doc.data();
        const cleaned = cleanObject(data, fieldsToRemove);
        
        // Check if any obsolete fields exist in original data
        const keys = Object.keys(data);
        const lowerKeys = fieldsToRemove.map(x => x.toLowerCase());
        const hasObsoleteFields = keys.some(k => lowerKeys.includes(k.toLowerCase()));
        
        if (hasObsoleteFields) {
          catalogBatch.set(doc.ref, cleaned);
          catalogNeedsCommit = true;
        }
      });
      if (catalogNeedsCommit) {
        await catalogBatch.commit();
        console.log("Firestore catalog collection cleaned successfully.");
      }
      console.log("Firestore cleanup and sync complete.");
    } catch (e) {
      console.error("Failed to clean/sync Firestore data:", e);
    }
  }
}

// --- FIREBASE ADMIN SDK INTEGRATION SETUP ---
const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");
let dbAdmin: admin.firestore.Firestore | null = null;
let isFirebaseAdminInitialized = false;

if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  try {
    const rawConfig = fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8");
    const serviceAccount = JSON.parse(rawConfig);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    dbAdmin = admin.firestore();
    dbAdmin.settings({ ignoreUndefinedProperties: true });
    isFirebaseAdminInitialized = true;
    console.log("Firebase Admin SDK successfully initialized with service-account.json");

    // Proactively seed default items and sync local catalog data on boot
    (async () => {
      try {
        const usersSnap = await dbAdmin!.collection("users").get();
        if (usersSnap.empty) {
          console.log("Seeding Firestore users collection with default profiles...");
          for (const user of DEFAULT_USERS) {
            const { uid, ...data } = user;
            await dbAdmin!.collection("users").doc(uid).set({ uid, ...data });
          }
        }

        // Seed default users in Firebase Auth if they don't exist
        for (const user of DEFAULT_USERS) {
          if (user.email) {
            try {
              await admin.auth().getUserByEmail(user.email);
            } catch (authErr: any) {
              if (authErr.code === 'auth/user-not-found') {
                console.log(`Seeding missing Firebase Auth user: ${user.email}`);
                try {
                  const authUser = await admin.auth().createUser({
                    uid: user.uid,
                    email: user.email,
                    password: "AdminPass123!",
                    displayName: user.displayName
                  });
                  await dbAdmin!.collection("users").doc(user.uid).set({
                    authUid: authUser.uid
                  }, { merge: true });
                } catch (createErr) {
                  console.error(`Failed to seed Firebase Auth user ${user.email}:`, createErr);
                }
              }
            }
          }
        }
        
        console.log("Synchronizing Firestore catalog collection...");
        
        const catalogRef = dbAdmin!.collection("catalog");
        const catalogSnap = await catalogRef.get();
        
        if (catalogSnap.empty) {
          console.log("Firestore catalog collection is empty. Skipping auto-seeding to respect user deletions.");
        }

        // Migrate and read catalog from Firestore
        const updatedSnap = await catalogRef.get();
        const rawItems: CatalogItem[] = [];
        updatedSnap.forEach(doc => {
          rawItems.push({ id: doc.id, ...doc.data() } as CatalogItem);
        });

        const groupedRaw: Record<string, CatalogItem> = {};
        const docsToDelete = new Set<string>();

        for (const item of rawItems) {
          const newId = sanitizeId(item.model, item.color, item.name, item.variation || item.notes);
          
          if (!groupedRaw[newId]) {
            groupedRaw[newId] = {
              ...item,
              id: newId,
              variation: item.variation || item.notes || undefined
            };
            delete (groupedRaw[newId] as any).year;
            delete (groupedRaw[newId] as any).variations;
          } else {
            const existing = groupedRaw[newId];
            if (!existing.customImage && item.customImage) existing.customImage = item.customImage;
            if (!existing.customImageSleeve && item.customImageSleeve) existing.customImageSleeve = item.customImageSleeve;
            if (!existing.customImageBox && item.customImageBox) existing.customImageBox = item.customImageBox;
            delete (existing as any).year;
            delete (existing as any).variations;
          }

          if (item.id !== newId) {
            docsToDelete.add(item.id);
          }
        }

        const firestoreItems: CatalogItem[] = Object.values(groupedRaw);
        const batch = dbAdmin!.batch();
        let needsCommit = false;

        for (const item of firestoreItems) {
          const { id, ...data } = item;
          batch.set(catalogRef.doc(id), data, { merge: true });
          needsCommit = true;
        }

        for (const deleteId of docsToDelete) {
          if (!groupedRaw[deleteId]) {
            batch.delete(catalogRef.doc(deleteId));
            needsCommit = true;
          }
        }

        if (needsCommit) {
          await batch.commit();
          console.log("Committed catalog ID migration/merging batch in Firestore.");
        }

        saveCatalog(firestoreItems);
        console.log(`Catalog sync complete. Firestore and local catalog.json are in sync with ${firestoreItems.length} items.`);
        if (process.env.CLEAN_DB === "true") {
          await cleanDatabaseFields();
        } else {
          console.log("Skipping database fields cleanup migration (CLEAN_DB environment variable is not true).");
        }
      } catch (err) {
        console.error("Failed to sync initial Firestore data:", err);
      }
    })();
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK from service-account.json:", error);
  }
} else {
  console.log("No service-account.json found. Operating in local JSON file mode.");
  try {
    const localCatalog = loadCatalog();
    const migratedCatalog: CatalogItem[] = [];
    for (const item of localCatalog) {
      const newId = sanitizeId(item.model, item.color, item.name, item.variation || item.notes);
      
      const existing = migratedCatalog.find(c => c.id === newId);
      if (existing) {
        if (!existing.customImage && item.customImage) existing.customImage = item.customImage;
        if (!existing.customImageSleeve && item.customImageSleeve) existing.customImageSleeve = item.customImageSleeve;
        if (!existing.customImageBox && item.customImageBox) existing.customImageBox = item.customImageBox;
        delete (existing as any).year;
        delete (existing as any).variations;
      } else {
        migratedCatalog.push({
          id: newId,
          model: item.model.trim(),
          name: item.name ? item.name.trim() : undefined,
          color: item.color.trim(),
          variation: item.variation || item.notes || undefined,
          customImage: item.customImage,
          customImageSleeve: item.customImageSleeve,
          customImageBox: item.customImageBox
        });
      }
    }
    saveCatalog(migratedCatalog);
    console.log(`Local catalog migration complete. File catalog.json is updated with ${migratedCatalog.length} items.`);
    (async () => {
      try {
        if (process.env.CLEAN_DB === "true") {
          await cleanDatabaseFields();
        } else {
          console.log("Skipping database fields cleanup migration (CLEAN_DB environment variable is not true).");
        }
      } catch (cleanErr) {
        console.error("Failed to run database fields cleanup:", cleanErr);
      }
    })();
  } catch (err) {
    console.error("Failed to migrate local catalog file on boot:", err);
  }
}

// User-verification middleware helper
async function verifyAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  if (dbAdmin) {
    try {
      const resolvedId = await resolveUserDocId(userId);
      const docRef = dbAdmin.collection("users").doc(resolvedId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const role = docSnap.data()?.role;
        return role && typeof role === "string" && role.toLowerCase() === "admin";
      }
    } catch (e) {
      console.error("verifyAdmin failed in Firebase Admin SDK:", e);
    }
    return false;
  }
  const users = loadUsers();
  const user = users.find(u => u.uid === userId);
  return user ? user.role?.toLowerCase() === "admin" : false;
}


// Async Database Helpers
async function resolveUserDocId(uid: string): Promise<string> {
  if (!uid) return "";
  if (uid.startsWith("u-")) return uid;
  if (dbAdmin) {
    try {
      const q = await dbAdmin.collection("users").where("uid", "==", uid).get();
      if (!q.empty) {
        return q.docs[0].id;
      }
      const qEmail = await dbAdmin.collection("users").where("email", "==", uid).get();
      if (!qEmail.empty) {
        return qEmail.docs[0].id;
      }
    } catch (e) {
      console.error("resolveUserDocId failed in Firestore:", e);
    }
  }
  return uid;
}

// Async Database Helpers
async function getUsersList(): Promise<UserProfile[]> {
  if (dbAdmin) {
    try {
      const snapshot = await dbAdmin.collection("users").get();
      const users: UserProfile[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        users.push({
          ...data,
          uid: doc.id, // uid is the doc ID u-USERNAME
          authUid: data.uid || data.authUid // keep Firebase Auth UID in authUid
        } as UserProfile);
      });
      return users;
    } catch (error) {
      console.error("Firestore getUsersList failed, fallback to file:", error);
    }
  }
  return loadUsers();
}

async function saveUserToDb(user: UserProfile): Promise<void> {
  if (dbAdmin) {
    try {
      const cleanUsername = cleanUsernameString(user.username || user.displayName || "user");
      const docId = user.uid.startsWith("u-") ? user.uid : `u-${cleanUsername}`;
      const dataToSave = {
        ...user,
        uid: user.authUid || user.uid, // Keep the Firebase Auth UID inside the 'uid' field for client lookup
        authUid: user.authUid || user.uid // Ensure authUid is populated
      };
      await dbAdmin.collection("users").doc(docId).set(dataToSave, { merge: true });
      return;
    } catch (error) {
      console.error("Firestore saveUserToDb failed, fallback to file:", error);
    }
  }
  const users = loadUsers();
  const idx = users.findIndex(u => u.uid === user.uid);
  if (idx > -1) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  saveUsers(users);
}

async function deleteUserFromDb(userId: string): Promise<boolean> {
  const resolvedId = await resolveUserDocId(userId);
  if (dbAdmin) {
    try {
      await deleteFirestoreDocAndSubcollections(dbAdmin.collection("users").doc(resolvedId));
      return true;
    } catch (error) {
      console.error("Firestore deleteUserFromDb failed, fallback to file:", error);
    }
  }
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.uid === resolvedId);
  if (userIndex === -1) return false;
  users.splice(userIndex, 1);
  saveUsers(users);

  // Delete user's workspace data file if it exists
  const userDataPath = getUserDataPath(resolvedId);
  if (fs.existsSync(userDataPath)) {
    try {
      fs.unlinkSync(userDataPath);
    } catch (error) {
      console.error(`Failed to delete user data file at ${userDataPath}:`, error);
    }
  }
  return true;
}

async function getUserLocker(uid: string): Promise<any[] | null> {
  const resolvedId = await resolveUserDocId(uid);
  if (dbAdmin) {
    try {
      const docSnap = await dbAdmin.collection("users").doc(resolvedId).collection("data").doc("locker").get();
      if (docSnap.exists) {
        return docSnap.data()?.balls || null;
      }
    } catch (error) {
      console.error("Firestore getUserLocker failed, fallback to file:", error);
    }
    return null;
  }
  const data = loadUserData(resolvedId);
  return data && data.balls ? data.balls : null;
}

async function saveUserLocker(uid: string, balls: any[]): Promise<void> {
  const resolvedId = await resolveUserDocId(uid);
  if (dbAdmin) {
    try {
      await dbAdmin.collection("users").doc(resolvedId).collection("data").doc("locker").set({ balls }, { merge: true });
      return;
    } catch (error) {
      console.error("Firestore saveUserLocker failed, fallback to file:", error);
    }
  }
  saveUserData(resolvedId, { balls });
}



async function getGlobalCatalog(): Promise<CatalogItem[]> {
  if (dbAdmin) {
    try {
      const snapshot = await dbAdmin.collection("catalog").get();
      if (!snapshot.empty) {
        const items: CatalogItem[] = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() } as CatalogItem);
        });
        return items;
      }
    } catch (error) {
      console.error("Firestore getGlobalCatalog failed, fallback to file:", error);
    }
  }
  return loadCatalog();
}

async function saveGlobalCatalogItem(item: CatalogItem): Promise<void> {
  await preserveCatalogImages(item.id, item.customImage, item.customImageSleeve, item.customImageBox);

  if (dbAdmin) {
    try {
      const { id, ...data } = item;
      await dbAdmin.collection("catalog").doc(id).set(data, { merge: true });
    } catch (error) {
      console.error("Firestore saveGlobalCatalogItem failed:", error);
    }
  }
  const catalog = loadCatalog();
  const idx = catalog.findIndex(c => c.id === item.id);
  if (idx > -1) {
    catalog[idx] = item;
  } else {
    catalog.push(item);
  }
  saveCatalog(catalog);
}

async function deleteGlobalCatalogItem(id: string): Promise<boolean> {
  let firestoreSuccess = true;
  if (dbAdmin) {
    try {
      await dbAdmin.collection("catalog").doc(id).delete();
    } catch (error) {
      console.error("Firestore deleteGlobalCatalogItem failed:", error);
      firestoreSuccess = false;
    }
  }
  const catalog = loadCatalog();
  const idx = catalog.findIndex(c => c.id === id);
  if (idx === -1) return firestoreSuccess;
  catalog.splice(idx, 1);
  saveCatalog(catalog);
  return true;
}

// --- MOCK AUTHENTICATION API ENDPOINTS ---

// Auth SignUp
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, username, displayName, avatarUrl, preferredColor } = req.body;
  
  if (!email || !password || !username || !displayName) {
    return res.status(400).json({ error: "Missing required registration fields" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: "Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    });
  }

  const users = await getUsersList();
  
  // Case-insensitive checks
  const emailLower = email.trim().toLowerCase();
  const cleanUsername = cleanUsernameString(username);

  if (!cleanUsername) {
    return res.status(400).json({ error: "Username must contain letters, numbers, or underscores." });
  }

  const emailExists = users.some(u => u.email?.toLowerCase() === emailLower);
  const usernameExists = users.some(u => u.username?.toLowerCase() === cleanUsername);

  if (emailExists) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }
  if (usernameExists) {
    return res.status(400).json({ error: "This username is already taken." });
  }

  let authUid = `u-${cleanUsername}`;
  if (isFirebaseAdminInitialized) {
    try {
      const userRecord = await admin.auth().createUser({
        email: emailLower,
        password: password,
        displayName: displayName.trim()
      });
      authUid = userRecord.uid;
      console.log(`Created Firebase Auth user for ${emailLower} with UID: ${authUid}`);
    } catch (authErr: any) {
      console.error("Failed to create Firebase Auth user:", authErr);
      return res.status(400).json({ error: authErr.message || "Failed to create user in Firebase Auth." });
    }
  }

  const newUser: UserProfile = {
    uid: `u-${cleanUsername}`,
    authUid: authUid,
    displayName: displayName.trim(),
    email: emailLower,
    password: hashPassword(password), // Store hashed password
    username: cleanUsername,
    preferredColor: preferredColor || "#2563eb",
    avatarUrl: avatarUrl || "preset-1",
    role: cleanUsername === "admin" ? "Admin" : "User",
    createdAt: new Date().toISOString()
  };

  await saveUserToDb(newUser);

  // Return the session user profile (without password)
  const clientUser = {
    uid: isFirebaseAdminInitialized ? authUid : newUser.uid,
    email: newUser.email,
    displayName: newUser.displayName,
    photoURL: newUser.avatarUrl,
    username: newUser.username,
    preferredColor: newUser.preferredColor,
    role: newUser.role,
    shareBag: false,
    shareToken: encryptUsername(newUser.username || ""),
    isMock: !isFirebaseAdminInitialized
  };

  res.status(211).json(clientUser);
});

// Resolve username to email address
app.get("/api/auth/resolve-email", async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username query parameter is required." });
  }

  const clean = username.trim().toLowerCase();
  
  // 1. Check local DEFAULT_USERS / loadUsers()
  const localUsers = loadUsers();
  const localUser = localUsers.find(u => u.username?.toLowerCase() === clean);
  if (localUser && localUser.email) {
    return res.json({ email: localUser.email });
  }

  // 2. Check Firestore if configured
  if (isFirebaseAdminInitialized && dbAdmin) {
    try {
      const usersRef = dbAdmin.collection("users");
      const snapshot = await usersRef.where("username", "==", clean).get();
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        if (userData.email) {
          return res.json({ email: userData.email });
        }
      }
    } catch (e) {
      console.error("resolve-email failed in Firestore:", e);
    }
  }

  return res.status(404).json({ error: "Username not found." });
});

// Auth SignIn
app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email/username and password are required." });
  }

  const users = await getUsersList();
  const identifier = email.trim().toLowerCase();
  
  // Resolve user by email or username
  const isEmail = identifier.includes("@");
  const user = isEmail
    ? users.find(u => u.email?.toLowerCase() === identifier)
    : users.find(u => u.username?.toLowerCase() === identifier);

  if (!user || !user.password || !verifyPassword(password, user.password)) {
    return res.status(400).json({ error: "Invalid email/username or password." });
  }

  // Auto-upgrade plain text passwords to hashed/salted format
  if (!user.password.includes(":")) {
    user.password = hashPassword(password);
    await saveUserToDb(user);
  }

  const clientUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.avatarUrl,
    username: user.username,
    preferredColor: user.preferredColor,
    role: user.role,
    shareBag: !!user.shareBag,
    shareToken: encryptUsername(user.username || ""),
    isMock: true
  };

  res.json(clientUser);
});

// User specific Locker APIs
app.get("/api/users/:uid/locker", async (req, res) => {
  const { uid } = req.params;
  const balls = await getUserLocker(uid);
  res.json({ balls });
});

// Public endpoint for sharing user bags
app.get("/api/share/:token", async (req, res) => {
  const { token } = req.params;
  if (!token || !token.trim()) {
    return res.status(400).json({ error: "Share token is required." });
  }

  const decryptedUsername = decryptUsername(token.trim());
  if (!decryptedUsername) {
    return res.status(400).json({ error: "Invalid share link." });
  }

  const users = await getUsersList();
  const user = users.find(u => u.username?.toLowerCase() === decryptedUsername.toLowerCase());

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!user.shareBag) {
    return res.status(403).json({ error: "This user's bag is private." });
  }

  const balls = await getUserLocker(user.uid);
  res.json({
    success: true,
    profile: {
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      preferredColor: user.preferredColor,
      shareToken: token
    },
    balls
  });
});

app.post("/api/users/:uid/locker", async (req, res) => {
  const { uid } = req.params;
  const { balls } = req.body;
  if (!balls) {
    return res.status(400).json({ error: "Balls array is required." });
  }
  await saveUserLocker(uid, balls);
  res.json({ success: true });
});



// Fetch user profile details (Name, Username, avatarUrl, preferredColor, role)
app.get("/api/users/:id/profile", async (req, res) => {
  const { id } = req.params;
  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  let user = users.find(u => u.uid === resolvedId);
  
  if (!user && isFirebaseAdminInitialized && dbAdmin && !id.startsWith("u-")) {
    try {
      const userRecord = await admin.auth().getUser(id);
      const email = userRecord.email || "";
      const displayName = userRecord.displayName || email.split("@")[0] || "user";
      const cleanUsername = cleanUsernameString(displayName) || "user";
      
      // Generate a unique doc ID
      let baseUsername = cleanUsername.toLowerCase();
      let docId = `u-${baseUsername}`;
      let suffix = 1;
      while (users.some(u => u.uid === docId)) {
        docId = `u-${baseUsername}_${suffix}`;
        suffix++;
      }

      const derivedUsername = docId.substring(2);
      const defaultProfile = {
        uid: id,
        authUid: id,
        displayName: displayName,
        username: derivedUsername,
        avatarUrl: userRecord.photoURL || "preset-1",
        preferredColor: "#2563eb",
        role: derivedUsername === "admin" ? "Admin" : "User",
        createdAt: new Date().toISOString(),
        email: email
      };

      await dbAdmin.collection("users").doc(docId).set(defaultProfile);
      await dbAdmin.collection("users").doc(docId).collection("data").doc("locker").set({ balls: [] });
      console.log(`Auto-created Firestore profile document ${docId} and locker for Auth user ${id}`);
      
      user = {
        ...defaultProfile,
        uid: docId,
        avatarUrl: defaultProfile.avatarUrl
      } as any;
    } catch (err: any) {
      console.error(`Failed to auto-create profile for user ${id}:`, err);
    }
  }

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  const clientUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.avatarUrl,
    username: user.username,
    preferredColor: user.preferredColor,
    role: user.role,
    shareBag: !!user.shareBag,
    shareToken: encryptUsername(user.username || ""),
    isMock: false
  };
  res.json(clientUser);
});

// Update user profile details (Name, Username, avatarUrl, preferredColor)
app.patch("/api/users/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { displayName, username, avatarUrl, preferredColor, password, shareBag } = req.body;

  if (!displayName || !displayName.trim()) {
    return res.status(400).json({ error: "Display name is required." });
  }
  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required." });
  }

  const cleanUsername = cleanUsernameString(username);
  if (!cleanUsername) {
    return res.status(400).json({ error: "Username must contain letters, numbers, or underscores." });
  }

  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  
  // Find target user
  const user = users.find(u => u.uid === resolvedId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Check if username is already taken by someone else
  const usernameLower = cleanUsername.toLowerCase();
  const usernameExists = users.some(u => u.uid !== resolvedId && u.username?.toLowerCase() === usernameLower);
  if (usernameExists) {
    return res.status(400).json({ error: "This username is already taken by another account." });
  }

  // Update profile fields
  user.displayName = displayName.trim();
  const oldDocId = resolvedId;
  let newDocId = resolvedId;
  if (username !== undefined) {
    const cleanUsername = cleanUsernameString(username);
    if (!cleanUsername) {
      return res.status(400).json({ error: "Username must contain letters, numbers, or underscores." });
    }
    // Check if username is already taken by someone else
    const usernameExists = users.some(u => u.uid !== resolvedId && u.username?.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return res.status(400).json({ error: "This username is already taken by another account." });
    }
    newDocId = `u-${cleanUsername}`;
    user.username = cleanUsername;
  }

  if (avatarUrl !== undefined) {
    user.avatarUrl = avatarUrl;
  }
  if (preferredColor !== undefined) {
    user.preferredColor = preferredColor;
  }
  if (shareBag !== undefined) {
    user.shareBag = !!shareBag;
  }
  if (password !== undefined && password !== "") {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
    }
    user.password = hashPassword(password);
  }

  if (newDocId !== oldDocId) {
    if (dbAdmin) {
      try {
        const oldDocRef = dbAdmin.collection("users").doc(oldDocId);
        const oldDocSnap = await oldDocRef.get();
        const oldLockerRef = oldDocRef.collection("data").doc("locker");
        const oldLockerSnap = await oldLockerRef.get();

        const oldData = oldDocSnap.exists ? oldDocSnap.data() : {};
        const newData = {
          ...oldData,
          ...user,
          uid: user.authUid || user.uid,
          authUid: user.authUid || user.uid,
          username: user.username
        };
        const newDocRef = dbAdmin.collection("users").doc(newDocId);
        await newDocRef.set(newData);

        if (oldLockerSnap.exists) {
          await newDocRef.collection("data").doc("locker").set(oldLockerSnap.data() || {});
        }

        await deleteFirestoreDocAndSubcollections(oldDocRef);
        console.log(`Firestore document renamed in profile update from ${oldDocId} to ${newDocId}`);
      } catch (err) {
        console.error(`Failed to rename Firestore document from ${oldDocId} to ${newDocId}:`, err);
        return res.status(500).json({ error: "Failed to rename user profile in database." });
      }
    } else {
      const oldPath = getUserDataPath(oldDocId);
      const newPath = getUserDataPath(newDocId);
      if (fs.existsSync(oldPath)) {
        try {
          fs.renameSync(oldPath, newPath);
        } catch (err) {
          console.error(`Failed to rename local file:`, err);
        }
      }
      const localUsers = loadUsers();
      const filtered = localUsers.filter(u => u.uid !== oldDocId);
      saveUsers(filtered);
    }
    user.uid = newDocId;
  }

  await saveUserToDb(user);

  // Return the updated session user profile
  const clientUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.avatarUrl,
    username: user.username,
    preferredColor: user.preferredColor,
    role: user.role,
    shareBag: !!user.shareBag,
    shareToken: encryptUsername(user.username || ""),
    isMock: true
  };

  res.json(clientUser);
});

// --- USER API ENDPOINTS ---

// Fetch all registered profile users
app.get("/api/users", async (req, res) => {
  const actingUserId = req.headers["x-user-id"] as string | undefined;
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can view user accounts." });
  }
  const users = await getUsersList();
  res.json(users.map(({ password, ...u }) => u));
});

// Create a new customized profile user
app.post("/api/users", async (req, res) => {
  const { displayName, username, email, password, preferredColor, avatarUrl, role } = req.body;
  if (!displayName || !displayName.trim()) {
    return res.status(400).json({ error: "Display name is required" });
  }

  const cleanUsername = cleanUsernameString(username || displayName || "user");
  const users = await getUsersList();
  
  let baseUsername = cleanUsername || "user";
  let userId = `u-${baseUsername}`;
  let suffix = 1;
  while (users.some(u => u.uid === userId)) {
    userId = `u-${baseUsername}_${suffix}`;
    suffix++;
  }

  let authUid = userId;
  if (isFirebaseAdminInitialized) {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required for creating a real Firebase user." });
    }
    const emailLower = email.trim().toLowerCase();
    if (!password) {
      return res.status(400).json({ error: "Password is required for creating a real Firebase user." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "Password is too weak. It must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters." });
    }
    try {
      const userRecord = await admin.auth().createUser({
        email: emailLower,
        password: password,
        displayName: displayName.trim()
      });
      authUid = userRecord.uid;
      console.log(`Created Firebase Auth user for ${emailLower} with UID: ${authUid}`);
    } catch (authErr: any) {
      console.error("Failed to create Firebase Auth user:", authErr);
      return res.status(400).json({ error: authErr.message || "Failed to create user in Firebase Auth." });
    }
  }

  const newUser: UserProfile = {
    uid: userId,
    authUid: authUid,
    displayName: displayName.trim(),
    username: userId.substring(2),
    email: email ? email.trim().toLowerCase() : undefined,
    password: password ? hashPassword(password) : undefined,
    role: (role && role.toLowerCase() === "admin") ? "Admin" : "User", // Defaults to User unless explicitly set
    preferredColor: preferredColor || "#3b82f6",
    avatarUrl: avatarUrl || "",
    createdAt: new Date().toISOString()
  };

  await saveUserToDb(newUser);
  res.status(211).json(newUser);
});

// Appoint or modify roles (Admin / User)
app.patch("/api/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const actingUserId = req.headers["x-user-id"] as string | undefined;

  const normalizedRole = role && role.toLowerCase() === "admin" ? "Admin" : role && role.toLowerCase() === "user" ? "User" : null;
  if (!normalizedRole) {
    return res.status(400).json({ error: "Invalid role. Must be 'Admin' or 'User'" });
  }

  // To check that the user appointing roles is an Admin
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Unauthorized. Only administrators can change roles." });
  }

  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const targetUser = users.find(u => u.uid === resolvedId);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  targetUser.role = normalizedRole;
  await saveUserToDb(targetUser);
  res.json(targetUser);
});

// Update user details (Admin only)
app.patch("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { displayName, username, role, preferredColor, avatarUrl, email, password } = req.body;
  const actingUserId = req.headers["x-user-id"] as string | undefined;

  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can update user details." });
  }

  const resolvedId = await resolveUserDocId(id);
  const resolvedActingId = await resolveUserDocId(actingUserId);
  const users = await getUsersList();
  const targetUser = users.find(u => u.uid === resolvedId);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  let normalizedRole: "Admin" | "User" | undefined = undefined;
  if (role !== undefined) {
    if (role.toLowerCase() === "admin") {
      normalizedRole = "Admin";
    } else if (role.toLowerCase() === "user") {
      normalizedRole = "User";
    } else {
      return res.status(400).json({ error: "Invalid role. Must be 'Admin' or 'User'." });
    }
  }

  // Self-demotion check
  if (resolvedId === resolvedActingId && normalizedRole !== undefined && normalizedRole !== "Admin") {
    return res.status(400).json({ error: "Self-protection safeguard: You cannot demote yourself from Admin." });
  }

  if (displayName !== undefined) {
    if (!displayName.trim()) {
      return res.status(400).json({ error: "Display name cannot be empty." });
    }
    targetUser.displayName = displayName.trim();
  }

  const oldDocId = resolvedId;
  let newDocId = resolvedId;
  if (username !== undefined) {
    const cleanUsername = cleanUsernameString(username);
    if (!cleanUsername) {
      return res.status(400).json({ error: "Username must contain letters, numbers, or underscores." });
    }
    // Check if username is already taken by someone else
    const usernameExists = users.some(u => u.uid !== resolvedId && u.username?.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return res.status(400).json({ error: "This username is already taken by another account." });
    }
    newDocId = `u-${cleanUsername}`;
    targetUser.username = cleanUsername;
  }

  if (normalizedRole !== undefined) {
    targetUser.role = normalizedRole;
  }

  if (preferredColor !== undefined) {
    targetUser.preferredColor = preferredColor;
  }

  if (avatarUrl !== undefined) {
    targetUser.avatarUrl = avatarUrl;
  }

  if (email !== undefined) {
    if (!email.trim() || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format." });
    }
    const emailExists = users.some(u => u.uid !== id && u.email?.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      return res.status(400).json({ error: "This email is already taken by another account." });
    }
    targetUser.email = email.trim();
  }

  if (password !== undefined && password !== "") {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
    }
    targetUser.password = hashPassword(password);
  }

  // If Firebase Admin SDK is initialized, propagate changes to Firebase Auth (skip for mock/local users)
  const isMockUser = !targetUser.authUid || targetUser.authUid.startsWith("u-");
  if (isFirebaseAdminInitialized && !isMockUser && targetUser.authUid) {
    try {
      const authUpdates: any = {};
      if (email !== undefined) {
        authUpdates.email = email.trim();
      }
      if (password !== undefined && password !== "") {
        authUpdates.password = password;
      }
      if (displayName !== undefined) {
        authUpdates.displayName = displayName.trim();
      }
      if (avatarUrl !== undefined) {
        authUpdates.photoURL = (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) ? avatarUrl : null;
      }
      if (Object.keys(authUpdates).length > 0) {
        await admin.auth().updateUser(targetUser.authUid, authUpdates);
        console.log(`Successfully updated Auth credentials for user ${targetUser.authUid} in Firebase Auth`);
      }
    } catch (authErr: any) {
      console.error(`Failed to update user Auth credentials in Firebase:`, authErr);
      if (authErr.code === "auth/user-not-found" || authErr.code === "auth/configuration-not-found") {
        console.warn(`Ignoring Firebase Auth update error (code: ${authErr.code}) for user ${targetUser.authUid} and proceeding with database update.`);
      } else {
        return res.status(400).json({ error: authErr.message || "Failed to update Firebase Auth credentials." });
      }
    }
  }

  if (newDocId !== oldDocId) {
    if (dbAdmin) {
      try {
        const oldDocRef = dbAdmin.collection("users").doc(oldDocId);
        const oldDocSnap = await oldDocRef.get();
        const oldLockerRef = oldDocRef.collection("data").doc("locker");
        const oldLockerSnap = await oldLockerRef.get();

        const oldData = oldDocSnap.exists ? oldDocSnap.data() : {};
        const newData = {
          ...oldData,
          ...targetUser,
          uid: targetUser.authUid || targetUser.uid,
          authUid: targetUser.authUid || targetUser.uid,
          username: targetUser.username
        };
        const newDocRef = dbAdmin.collection("users").doc(newDocId);
        await newDocRef.set(newData);

        if (oldLockerSnap.exists) {
          await newDocRef.collection("data").doc("locker").set(oldLockerSnap.data() || {});
        }

        await deleteFirestoreDocAndSubcollections(oldDocRef);
        console.log(`Firestore document renamed in admin update from ${oldDocId} to ${newDocId}`);
      } catch (err) {
        console.error(`Failed to rename Firestore document from ${oldDocId} to ${newDocId}:`, err);
        return res.status(500).json({ error: "Failed to rename user profile in database." });
      }
    } else {
      const oldPath = getUserDataPath(oldDocId);
      const newPath = getUserDataPath(newDocId);
      if (fs.existsSync(oldPath)) {
        try {
          fs.renameSync(oldPath, newPath);
        } catch (err) {
          console.error(`Failed to rename local file:`, err);
        }
      }
      const localUsers = loadUsers();
      const filtered = localUsers.filter(u => u.uid !== oldDocId);
      saveUsers(filtered);
    }
    targetUser.uid = newDocId;
  }

  await saveUserToDb(targetUser);

  // Return updated user without password
  const { password: userPassword, ...updatedUser } = targetUser;
  res.json(updatedUser);
});

// Delete user (Admin only)
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const actingUserId = req.headers["x-user-id"] as string | undefined;

  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can delete user accounts." });
  }

  const resolvedId = await resolveUserDocId(id);
  const resolvedActingId = await resolveUserDocId(actingUserId);

  // Self-deletion check
  if (resolvedId === resolvedActingId) {
    return res.status(400).json({ error: "Self-protection safeguard: You cannot delete your own admin account." });
  }

  const users = await getUsersList();
  const targetUser = users.find(u => u.uid === resolvedId);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Delete from Firebase Auth if isFirebaseAdminInitialized and it's a real Firebase user
  const isMockUser = !targetUser.authUid || targetUser.authUid.startsWith("u-");
  if (isFirebaseAdminInitialized && !isMockUser && targetUser.authUid) {
    try {
      await admin.auth().deleteUser(targetUser.authUid);
      console.log(`Successfully deleted user ${targetUser.authUid} from Firebase Auth`);
    } catch (authErr: any) {
      console.error(`Failed to delete user from Firebase Auth:`, authErr);
      if (authErr.code !== "auth/user-not-found") {
        return res.status(400).json({ error: authErr.message || "Failed to delete user from Firebase Auth" });
      }
    }
  }

  const success = await deleteUserFromDb(resolvedId);
  if (!success) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ success: true, message: `Successfully deleted user account` });
});

// --- CATALOG / BALL VAULT API ENDPOINTS ---

// Fetch current searchable Ball Vault Catalog
app.get("/api/catalog", async (req, res) => {
  const catalog = await getGlobalCatalog();
  res.json(catalog);

  // Background check: ensure default users exist in Firebase Auth
  if (isFirebaseAdminInitialized) {
    (async () => {
      try {
        for (const user of DEFAULT_USERS) {
          if (user.email) {
            try {
              await admin.auth().getUserByEmail(user.email);
            } catch (authErr: any) {
              if (authErr.code === 'auth/user-not-found') {
                console.log(`Dynamically re-seeding missing Firebase Auth user: ${user.email}`);
                try {
                  const authUser = await admin.auth().createUser({
                    uid: user.uid,
                    email: user.email,
                    password: "AdminPass123!",
                    displayName: user.displayName
                  });
                  await dbAdmin!.collection("users").doc(user.uid).set({
                    authUid: authUser.uid
                  }, { merge: true });
                } catch (createErr) {
                  console.error(`Failed to seed Firebase Auth user ${user.email}:`, createErr);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error in background Firebase Auth user seed:", err);
      }
    })();
  }
});

// POST: Add new design to catalog (Admin only)
app.post("/api/catalog", async (req, res) => {
  const actingUserId = req.headers["x-user-id"] as string | undefined;
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can modify the Ball Vault." });
  }

  const { model, name, color, variation, variations, year, customImage, customImageSleeve, customImageBox } = req.body;
  if (!model || !name || !color) {
    return res.status(400).json({ error: "Model, Name, and Color specifications are required." });
  }

  const newId = sanitizeId(model, color, name, variation);

  let resolvedImage = customImage;
  let resolvedImageSleeve = customImageSleeve;
  let resolvedImageBox = customImageBox;

  if (!resolvedImage || !resolvedImageSleeve || !resolvedImageBox) {
    const preserved = await lookupPreservedImages(newId);
    if (preserved) {
      if (!resolvedImage) resolvedImage = preserved.customImage;
      if (!resolvedImageSleeve) resolvedImageSleeve = preserved.customImageSleeve;
      if (!resolvedImageBox) resolvedImageBox = preserved.customImageBox;
    }
  }

  // Load existing catalog item if any
  const catalog = await getGlobalCatalog();
  const existingItem = catalog.find(item => item.id === newId);

  const newItem: CatalogItem = {
    id: newId,
    model: model.trim(),
    name: name.trim(),
    color: color.trim(),
    variation: variation ? variation.trim() : undefined,
    customImage: resolvedImage || (existingItem ? existingItem.customImage : undefined),
    customImageSleeve: resolvedImageSleeve || (existingItem ? existingItem.customImageSleeve : undefined),
    customImageBox: resolvedImageBox || (existingItem ? existingItem.customImageBox : undefined)
  };

  await saveGlobalCatalogItem(newItem);
  res.status(211).json(newItem);
});

// POST: Bulk add catalog items (Admin only)
app.post("/api/catalog/bulk", async (req, res) => {
  const actingUserId = req.headers["x-user-id"] as string | undefined;
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can modify the Ball Vault." });
  }

  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "An array of items is required under the 'items' key." });
  }

  const currentCatalog = await getGlobalCatalog();
  const currentMap = new Map(currentCatalog.map(item => [item.id, item]));

  const groupedItems: Record<string, CatalogItem> = {};

  for (const item of items) {
    const { model, name, color, variation, customImage, customImageSleeve, customImageBox } = item;
    if (!model || !name || !color) continue;

    const newId = sanitizeId(model, color, name, variation);

    if (!groupedItems[newId]) {
      const existing = currentMap.get(newId);
      groupedItems[newId] = {
        id: newId,
        model: model.trim(),
        name: name.trim(),
        color: color.trim(),
        variation: variation ? variation.trim() : undefined,
        customImage: customImage || (existing ? existing.customImage : undefined),
        customImageSleeve: customImageSleeve || (existing ? existing.customImageSleeve : undefined),
        customImageBox: customImageBox || (existing ? existing.customImageBox : undefined)
      };
    }
  }

  const createdItems = Object.values(groupedItems);
  const localCatalog = loadCatalog();
  const localPreserved = loadPreservedImagesLocal();

  if (dbAdmin) {
    try {
      let batch = dbAdmin.batch();
      let opCount = 0;
      const batches = [batch];

      for (const newItem of createdItems) {
        const newId = newItem.id;
        let resolvedImage = newItem.customImage;
        let resolvedImageSleeve = newItem.customImageSleeve;
        let resolvedImageBox = newItem.customImageBox;

        if (!resolvedImage || !resolvedImageSleeve || !resolvedImageBox) {
          const preserved = localPreserved[newId];
          if (preserved) {
            if (!resolvedImage) resolvedImage = preserved.customImage;
            if (!resolvedImageSleeve) resolvedImageSleeve = preserved.customImageSleeve;
            if (!resolvedImageBox) resolvedImageBox = preserved.customImageBox;
          }
        }

        newItem.customImage = resolvedImage;
        newItem.customImageSleeve = resolvedImageSleeve;
        newItem.customImageBox = resolvedImageBox;

        // Add to Firestore catalog collection in batch
        const catDocRef = dbAdmin.collection("catalog").doc(newId);
        const { id, ...dataToSave } = newItem;
        batch.set(catDocRef, dataToSave, { merge: true });
        opCount++;

        // Add to preserved images in batch if images exist
        if (resolvedImage || resolvedImageSleeve || resolvedImageBox) {
          const updateObj: PreservedImages = {};
          if (resolvedImage) updateObj.customImage = resolvedImage;
          if (resolvedImageSleeve) updateObj.customImageSleeve = resolvedImageSleeve;
          if (resolvedImageBox) updateObj.customImageBox = resolvedImageBox;

          const imgDocRef = dbAdmin.collection("preserved_images").doc(newId);
          batch.set(imgDocRef, updateObj, { merge: true });
          opCount++;
        }

        // Update in-memory fallback list
        const idx = localCatalog.findIndex(c => c.id === newId);
        if (idx > -1) {
          localCatalog[idx] = newItem;
        } else {
          localCatalog.push(newItem);
        }

        if (resolvedImage || resolvedImageSleeve || resolvedImageBox) {
          localPreserved[newId] = {
            ...(localPreserved[newId] || {}),
            ...(resolvedImage ? { customImage: resolvedImage } : {}),
            ...(resolvedImageSleeve ? { customImageSleeve: resolvedImageSleeve } : {}),
            ...(resolvedImageBox ? { customImageBox: resolvedImageBox } : {})
          };
        }

        // Limit each batch to 10 operations (5 items max)
        if (opCount >= 10) {
          batch = dbAdmin.batch();
          batches.push(batch);
          opCount = 0;
        }
      }

      // Commit batches in parallel
      await Promise.all(batches.map(b => b.commit()));

    } catch (error: any) {
      console.error("Firestore bulk catalog save failed:", error);
      return res.status(500).json({ error: `Failed to bulk save items in Firestore: ${error.message || error}` });
    }
  } else {
    // Non-Firestore local file fallback path
    for (const newItem of createdItems) {
      const newId = newItem.id;
      let resolvedImage = newItem.customImage;
      let resolvedImageSleeve = newItem.customImageSleeve;
      let resolvedImageBox = newItem.customImageBox;

      if (!resolvedImage || !resolvedImageSleeve || !resolvedImageBox) {
        const preserved = localPreserved[newId];
        if (preserved) {
          if (!resolvedImage) resolvedImage = preserved.customImage;
          if (!resolvedImageSleeve) resolvedImageSleeve = preserved.customImageSleeve;
          if (!resolvedImageBox) resolvedImageBox = preserved.customImageBox;
        }
      }

      newItem.customImage = resolvedImage;
      newItem.customImageSleeve = resolvedImageSleeve;
      newItem.customImageBox = resolvedImageBox;

      const idx = localCatalog.findIndex(c => c.id === newId);
      if (idx > -1) {
        localCatalog[idx] = newItem;
      } else {
        localCatalog.push(newItem);
      }

      if (resolvedImage || resolvedImageSleeve || resolvedImageBox) {
        localPreserved[newId] = {
          ...(localPreserved[newId] || {}),
          ...(resolvedImage ? { customImage: resolvedImage } : {}),
          ...(resolvedImageSleeve ? { customImageSleeve: resolvedImageSleeve } : {}),
          ...(resolvedImageBox ? { customImageBox: resolvedImageBox } : {})
        };
      }
    }
  }

  // Save changes to local disk once
  saveCatalog(localCatalog);
  savePreservedImagesLocal(localPreserved);

  res.json({ success: true, count: createdItems.length, items: createdItems });
});

// POST: Clear all catalog items (Admin only)
app.post("/api/catalog/clear", async (req, res) => {
  const actingUserId = req.headers["x-user-id"] as string | undefined;
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can modify the Ball Vault." });
  }

  if (dbAdmin) {
    try {
      const snapshot = await dbAdmin.collection("catalog").get();
      if (!snapshot.empty) {
        let batch = dbAdmin.batch();
        let opCount = 0;
        const batches = [batch];

        snapshot.forEach(doc => {
          batch.delete(doc.ref);
          opCount++;
          if (opCount >= 400) {
            batch = dbAdmin.batch();
            batches.push(batch);
            opCount = 0;
          }
        });

        await Promise.all(batches.map(b => b.commit()));
      }
    } catch (error) {
      console.error("Firestore catalog clear failed:", error);
      return res.status(500).json({ error: "Failed to clear Firestore catalog." });
    }
  }

  // Save empty catalog locally
  saveCatalog([]);

  res.json({ success: true, message: "Successfully cleared all catalog designs." });
});

// PUT: Save changes to existing catalog design (Admin only)
app.put("/api/catalog/:id", async (req, res) => {
  const actingUserId = req.headers["x-user-id"] as string | undefined;
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can modify the Ball Vault." });
  }

  const { id } = req.params;
  const { model, name, color, variation, customImage, customImageSleeve, customImageBox } = req.body;

  const catalog = await getGlobalCatalog();
  const currentItem = catalog.find(item => item.id === id);
  if (!currentItem) {
    return res.status(404).json({ error: "Design spec not found" });
  }

  const updatedModel = model ? model.trim() : currentItem.model;
  const updatedName = name ? name.trim() : (currentItem.name || "");
  const updatedColor = color ? color.trim() : currentItem.color;
  const updatedVariation = variation !== undefined ? (variation ? variation.trim() : undefined) : currentItem.variation;

  const newId = sanitizeId(updatedModel, updatedColor, updatedName, updatedVariation);

  let resolvedImage = customImage !== undefined ? customImage : currentItem.customImage;
  let resolvedImageSleeve = customImageSleeve !== undefined ? customImageSleeve : currentItem.customImageSleeve;
  let resolvedImageBox = customImageBox !== undefined ? customImageBox : currentItem.customImageBox;

  if (!resolvedImage || !resolvedImageSleeve || !resolvedImageBox) {
    const preserved = await lookupPreservedImages(newId);
    if (preserved) {
      if (!resolvedImage) resolvedImage = preserved.customImage;
      if (!resolvedImageSleeve) resolvedImageSleeve = preserved.customImageSleeve;
      if (!resolvedImageBox) resolvedImageBox = preserved.customImageBox;
    }
  }

  const updatedItem: CatalogItem = {
    id: newId,
    model: updatedModel,
    name: updatedName,
    color: updatedColor,
    variation: updatedVariation,
    customImage: resolvedImage,
    customImageSleeve: resolvedImageSleeve,
    customImageBox: resolvedImageBox
  };

  if (newId !== id) {
    await deleteGlobalCatalogItem(id);
  }
  await saveGlobalCatalogItem(updatedItem);
  res.json(updatedItem);
});

// DELETE: Remove design from catalog (Admin only)
app.delete("/api/catalog/:id", async (req, res) => {
  const actingUserId = req.headers["x-user-id"] as string | undefined;
  if (!(await verifyAdmin(actingUserId))) {
    return res.status(403).json({ error: "Access Denied. Only Admin users can modify the Ball Vault." });
  }

  const { id } = req.params;
  const success = await deleteGlobalCatalogItem(id);
  if (!success) {
    return res.status(404).json({ error: "Design spec not found" });
  }

  res.json({ success: true, message: "Successfully deleted spec" });
});

// --- VITE DEV SERVICE MIDDLEWARE INTEGRATION ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running at live container port ${PORT}`);
  });
}

startServer();
