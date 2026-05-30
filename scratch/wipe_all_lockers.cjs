const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = path.join(__dirname, "../service-account.json");

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  db.collection("users").get()
    .then(async snapshot => {
      console.log("Wiping lockers in Firestore...");
      for (const doc of snapshot.docs) {
        const lockerRef = doc.ref.collection("data").doc("locker");
        await lockerRef.set({ balls: [] });
        console.log(`Wiped locker for ${doc.id}`);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error("Error wiping lockers:", err);
      process.exit(1);
    });
} else {
  console.log("No service-account.json found at", serviceAccountPath);
  process.exit(1);
}
