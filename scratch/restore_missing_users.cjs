const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const serviceAccountPath = '/Users/williamkshaw/antigravity/Vice-Vault/service-account.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: service-account.json not found at " + serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper to clean username
function cleanUsernameString(str) {
  if (!str) return "";
  return str.replace(/[^a-zA-Z0-9_]/g, "");
}

async function restoreUsers() {
  try {
    console.log("Fetching all users from Firebase Auth...");
    let authUsers = [];
    let pageToken;
    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      authUsers = authUsers.concat(result.users);
      pageToken = result.pageToken;
    } while (pageToken);
    
    console.log(`Found ${authUsers.length} users in Auth.`);
    
    for (const userRecord of authUsers) {
      const email = userRecord.email || "";
      const displayName = userRecord.displayName || email.split("@")[0] || "user";
      const cleanUsername = cleanUsernameString(displayName) || "user";
      const docId = `u-${cleanUsername.toLowerCase()}`;
      
      const docRef = db.collection("users").doc(docId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        console.log(`Restoring missing Firestore profile for: ${email} (${docId})`);
        await docRef.set({
          uid: docId,
          authUid: userRecord.uid,
          username: cleanUsername,
          displayName: displayName,
          email: email,
          role: "User",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        console.log(`Profile for ${email} (${docId}) already exists. Skipping.`);
      }

      // Check if they have an orphaned locker
      const lockerSnap = await docRef.collection("locker").limit(1).get();
      if (!lockerSnap.empty) {
        console.log(`  -> Good news: Found existing locker data for ${docId}!`);
      }
    }
    
    console.log("Restoration complete!");
  } catch (error) {
    console.error("Error restoring users:", error);
  }
}

restoreUsers();
