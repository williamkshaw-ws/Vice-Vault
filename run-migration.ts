import admin from "firebase-admin";
import fs from "fs";

if (!fs.existsSync("service-account.json")) {
  console.log("No service-account.json");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf-8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const storage = admin.storage().bucket("vice-vault-8a4ce.firebasestorage.app");

async function migrate() {
  console.log("Starting migration...");
  
  // 1. Optimize users collection
  const usersSnap = await db.collection("users").get();
  console.log(`Found ${usersSnap.docs.length} users`);
  
  for (const userDoc of usersSnap.docs) {
    const lockerRef = db.collection("users").doc(userDoc.id).collection("data").doc("locker");
    const lockerSnap = await lockerRef.get();
    if (lockerSnap.exists) {
      const data = lockerSnap.data();
      if (data && data.balls) {
         let updated = false;
         for (const b of data.balls) {
           if (b.customImage?.startsWith("data:image/")) {
             b.customImage = null; // We can strip it if it's breaking it, or we could just null it out to save space since ImgBB is live
             updated = true;
           }
         }
         if (updated) {
           await lockerRef.update({ balls: data.balls });
           console.log(`Optimized locker for ${userDoc.id}`);
         }
      }
    }
  }

  // 2. Optimize catalog
  const catalogSnap = await db.collection("catalog").get();
  console.log(`Found ${catalogSnap.docs.length} catalog items`);
  for (const catDoc of catalogSnap.docs) {
    const data = catDoc.data();
    let updated = false;
    if (data.customImage?.startsWith("data:image/")) {
       data.customImage = null;
       updated = true;
    }
    if (updated) {
       await db.collection("catalog").doc(catDoc.id).update({ customImage: data.customImage });
       console.log(`Optimized catalog item ${catDoc.id}`);
    }
  }
  
  console.log("Done");
}

migrate().catch(console.error);
