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
      console.log("Current Users in Firestore:");
      for (const doc of snapshot.docs) {
        console.log(doc.id, "=>", doc.data());
        const lockerSnap = await doc.ref.collection("data").doc("locker").get();
        if (lockerSnap.exists) {
          console.log(`  Locker:`, JSON.stringify(lockerSnap.data()));
        } else {
          console.log(`  Locker: (does not exist)`);
        }
      }
      process.exit(0);
    })
    .catch(err => {
      console.error("Error reading users:", err);
      process.exit(1);
    });
} else {
  console.log("No service-account.json found at", serviceAccountPath);
  process.exit(1);
}
