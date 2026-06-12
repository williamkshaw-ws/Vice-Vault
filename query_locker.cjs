const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
async function run() {
  const doc = await db.collection("users").doc("u-admin").collection("data").doc("locker").get();
  const balls = doc.data()?.balls || [];
  let totalOwned = 0;
  balls.forEach(b => totalOwned += b.quantity);
  console.log("Total Owned:", totalOwned);
  console.log("Total Unique:", balls.length);
  process.exit(0);
}
run();
