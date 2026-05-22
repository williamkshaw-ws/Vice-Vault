import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_DATA_DIR = path.join(DATA_DIR, "users_data");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");

async function cleanDatabase() {
  console.log("Cleaning local database files...");

  // 1. Reset catalog.json to empty array
  if (fs.existsSync(CATALOG_FILE)) {
    fs.writeFileSync(CATALOG_FILE, "[]", "utf-8");
    console.log("Reset data/catalog.json to []");
  }

  // 2. Delete local user locker files
  if (fs.existsSync(USERS_DATA_DIR)) {
    const files = fs.readdirSync(USERS_DATA_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(USERS_DATA_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted local locker file: ${file}`);
      }
    }
  }

  // 3. Clear Firestore collections if service account exists
  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.log("Found service-account.json. Initializing Firebase Admin...");
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const db = admin.firestore();

    // 3a. Delete all catalog items in Firestore
    console.log("Deleting catalog documents in Firestore...");
    const catalogSnap = await db.collection("catalog").get();
    if (!catalogSnap.empty) {
      const batch = db.batch();
      catalogSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Deleted ${catalogSnap.size} catalog documents.`);
    } else {
      console.log("No catalog documents found to delete.");
    }

    // 3b. Delete all locker documents in Firestore
    console.log("Clearing user lockers in Firestore...");
    const usersSnap = await db.collection("users").get();
    for (const doc of usersSnap.docs) {
      const lockerRef = doc.ref.collection("data").doc("locker");
      const lockerSnap = await lockerRef.get();
      if (lockerSnap.exists) {
        await lockerRef.delete();
        console.log(`Deleted locker for user: ${doc.id}`);
      }
    }
  } else {
    console.log("No service-account.json found. Skipping Firestore clean.");
  }

  console.log("Database cleanup completed successfully!");
}

cleanDatabase().catch((err) => {
  console.error("Cleanup failed:", err);
});
