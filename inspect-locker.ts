import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf-8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function check() {
  const usersSnap = await db.collection("users").get();
  for (const userDoc of usersSnap.docs) {
    const lockerSnap = await db.collection("users").doc(userDoc.id).collection("data").doc("locker").get();
    if (lockerSnap.exists) {
      const data = lockerSnap.data();
      if (data && data.balls) {
         for (const b of data.balls) {
           if ((b.notes && b.notes.includes("Smiley")) || (b.variation && b.variation.includes("Smiley")) || (b.name && b.name.includes("Greg"))) {
             console.log(`Found in user ${userDoc.id}:`, JSON.stringify(b, null, 2));
           }
         }
      }
    }
  }
}

check().catch(console.error);
