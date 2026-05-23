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
  
  admin.auth().listUsers(1000)
    .then(listUsersResult => {
      console.log("Current Users in Firebase Auth:");
      listUsersResult.users.forEach(userRecord => {
        console.log(`Email: ${userRecord.email}, UID: ${userRecord.uid}, DisplayName: ${userRecord.displayName}`);
      });
      process.exit(0);
    })
    .catch(err => {
      console.error("Error reading Auth users:", err);
      process.exit(1);
    });
} else {
  console.log("No service-account.json found at", serviceAccountPath);
  process.exit(1);
}
