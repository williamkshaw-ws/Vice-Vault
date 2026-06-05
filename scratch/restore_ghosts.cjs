const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountPath = '/Users/williamkshaw/antigravity/Vice-Vault/service-account.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const missingIds = [
  "u-bigdick",
  "u-golf",
  "u-tyo14",
  "u-wineandshine247"
];

async function restoreGhostUsers() {
  try {
    for (const docId of missingIds) {
      const docRef = db.collection("users").doc(docId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        console.log(`Restoring ghost document: ${docId}`);
        // Extract a username from the docId (e.g. u-golf -> golf)
        const username = docId.replace("u-", "");
        
        await docRef.set({
          uid: docId,
          authUid: docId, // Placeholder until they re-register
          username: username,
          displayName: username,
          email: `${username}@restored.com`, // Placeholder
          role: "User",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Successfully restored ${docId}`);
      } else {
        console.log(`${docId} already exists as a real document. Skipping.`);
      }
    }
    console.log("Finished restoring ghost users!");
  } catch (error) {
    console.error("Error restoring ghost users:", error);
  }
}

restoreGhostUsers();
