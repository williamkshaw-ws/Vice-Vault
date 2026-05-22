import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, "../service-account.json");

if (fs.existsSync(serviceAccountPath)) {
  const raw = fs.readFileSync(serviceAccountPath, "utf-8");
  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  db.collection("users").get()
    .then(snapshot => {
      console.log("Current Users in Firestore:");
      snapshot.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
      });
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
