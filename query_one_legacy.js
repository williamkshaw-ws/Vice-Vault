import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function checkLocker() {
  const legacy = await db.collection("users/u-admin/data").get();
  for (const doc of legacy.docs) {
    console.log(`Doc ID: ${doc.id}`);
    const data = doc.data();
    if (data.balls) {
      console.log(`Found 'balls' array with length ${data.balls.length}`);
    } else {
      console.log(`No 'balls' array found. Keys: ${Object.keys(data).join(", ")}`);
    }
  }
}
checkLocker();
