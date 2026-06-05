import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function checkLocker() {
  const users = await db.collection("users").get();
  for (const doc of users.docs) {
    const data = doc.data();
    if (data.shareBag) {
       const locker = await db.collection(`users/${data.uid}/locker`).get();
       const legacy = await db.collection(`users/${data.uid}/data`).get();
       console.log(`User ${data.username} (${data.uid}) has ${locker.size} balls in locker, ${legacy.size} balls in legacy data`);
    }
  }
}
checkLocker();
