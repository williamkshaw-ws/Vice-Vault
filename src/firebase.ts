/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeFirestore, Firestore } from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = "vice_vault_firebase_config";

const getEnvConfig = (): FirebaseConfig => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  };
};

export const isConfigValid = (config: FirebaseConfig): boolean => {
  return !!(config && config.apiKey && config.projectId);
};

export const getActiveFirebaseConfig = (): FirebaseConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isConfigValid(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading Firebase config from localStorage", e);
  }
  return getEnvConfig();
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  if (isConfigValid(config)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  window.location.reload();
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

const activeConfig = getActiveFirebaseConfig();
const isConfigured = isConfigValid(activeConfig);

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(activeConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

export { auth, db };
export const isFirebaseConfigured = isConfigured && auth !== null && db !== null;
export const isConfigLoadedFromEnv = isConfigValid(getEnvConfig());
