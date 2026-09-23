/**
 * Zero-dependency native IndexedDB storage helper with localStorage fallback
 * and automatic legacy migration.
 * 
 * Completely eliminates the 5MB quota limit on iOS WebKit/Safari, allowing
 * hundreds of megabytes of offline golf ball collections, custom photos,
 * and catalog caching.
 */

const DB_NAME = "vice_vault_idb";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbErr) {
    // Fallback to localStorage if IDB fails
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (lsErr) {
      console.warn("Storage write failed in both IndexedDB and localStorage:", lsErr);
    }
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Automatically migrate existing keys from localStorage into IndexedDB on boot
 * so user collections are seamlessly carried forward.
 */
export async function migrateLocalStorageToIdb(): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) return;

  const keysToMigrate = [
    "vice_vault_guest_v2",
    "vice_vault_catalog"
  ];

  // Also collect any user bag keys: vice_vault_bag_*
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("vice_vault_bag_")) {
      keysToMigrate.push(k);
    }
  }

  for (const key of keysToMigrate) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const existingInIdb = await idbGet(key);
        if (!existingInIdb) {
          await idbSet(key, parsed);
        }
      }
    } catch (e) {
      // Ignore migration errors on corrupted items
    }
  }
}
