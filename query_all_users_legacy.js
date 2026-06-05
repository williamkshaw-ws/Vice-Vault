import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function checkLocker() {
  const users = await db.collection("users").get();
  for (const doc of users.docs) {
    const data = doc.data();
    const legacy = await db.collection(`users/${doc.id}/data`).get();
    if (legacy.size > 0) {
      console.log(`Doc ID: ${doc.id}, shareBag: ${data.shareBag}, shareToken: ${data.shareToken}, balls in legacy data: ${legacy.size}`);
    }
  }
}
checkLocker();
