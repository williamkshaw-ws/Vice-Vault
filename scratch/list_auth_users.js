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
  const auth = admin.auth();
  auth.listUsers(1000)
    .then(result => {
      console.log("Firebase Auth Users:");
      result.users.forEach(user => {
        console.log(`- Email: ${user.email}, UID: ${user.uid}, CreatedAt: ${user.metadata.creationTime}`);
      });
      process.exit(0);
    })
    .catch(err => {
      console.error("Error listing Auth users:", err);
      process.exit(1);
    });
} else {
  console.log("No service-account.json found");
  process.exit(1);
}
