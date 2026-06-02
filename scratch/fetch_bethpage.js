const admin = require("firebase-admin");
const serviceAccount = require("../service-account-key.json"); // Or however we connect

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function run() {
  const db = admin.firestore();
  const snapshot = await db.collection("catalog").where("name", "==", "Bethpage Station").get();
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
  process.exit(0);
}
run();
