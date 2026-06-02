const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");

if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  console.error("❌ Cannot find service-account.json. Please make sure it is in the root of the Vice-Vault folder.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Vice Vault Admin Elevation Script ===");

rl.question('Enter your UID (From Firebase Console -> Authentication): ', async (uid) => {
  uid = uid.trim();
  try {
    console.log(`\nLooking up user in Firestore with Auth UID: ${uid}`);
    
    // Find the user document
    let docId = uid;
    let query = await db.collection("users").where("authUid", "==", uid).get();
    if (query.empty) {
      query = await db.collection("users").where("uid", "==", uid).get();
    }
    
    if (!query.empty) {
      docId = query.docs[0].id;
      console.log(`Found user document: ${docId}`);
    } else {
      console.log(`Could not find a user document with that UID. Creating one...`);
    }

    // Elevate role
    await db.collection("users").doc(docId).set({
      role: "Admin",
      uid: uid,
      authUid: uid
    }, { merge: true });

    console.log(`\n✅ Success! You have been elevated to Admin role.`);
    console.log(`You can now re-run the migration script:\nnode scratch/migrate_images_prod.cjs`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
});
