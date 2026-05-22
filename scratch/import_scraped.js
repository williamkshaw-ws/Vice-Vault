import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { SCRAPED_BALLS } from '../src/constants.js';

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");

async function runImport() {
  console.log(`Starting import of ${SCRAPED_BALLS.length} scraped balls...`);

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Overwrite data/catalog.json with ONLY these 19 items
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(SCRAPED_BALLS, null, 2), 'utf-8');
  console.log(`Overwrote ${CATALOG_FILE} with exactly the 19 scraped items.`);

  // 2. Connect to Firebase and sync/overwrite Firestore collection
  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.log("Found service-account.json. Initializing Firebase Admin...");
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    const db = admin.firestore();
    const catalogRef = db.collection("catalog");
    
    // Clear existing documents in the catalog collection
    console.log("Fetching existing catalog items from Firestore to clear them...");
    const snap = await catalogRef.get();
    
    if (!snap.empty) {
      const deleteBatch = db.batch();
      snap.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log(`Deleted ${snap.size} old catalog items from Firestore.`);
    } else {
      console.log("No catalog items to delete in Firestore.");
    }
    
    console.log("Writing 19 scraped catalog items to Firestore...");
    const writeBatch = db.batch();
    for (const item of SCRAPED_BALLS) {
      const { id, ...data } = item;
      const docRef = catalogRef.doc(id);
      writeBatch.set(docRef, data);
    }
    await writeBatch.commit();
    console.log(`Successfully wrote ${SCRAPED_BALLS.length} items to Firestore catalog.`);
  } else {
    console.log("No service-account.json found. Skipping Firestore sync.");
  }
}

runImport().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
