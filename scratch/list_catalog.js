import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");

if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  console.error("service-account.json not found!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf-8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function inspectCatalog() {
  try {
    const snap = await db.collection("catalog").get();
    console.log(`Total catalog documents: ${snap.size}`);
    snap.forEach(doc => {
      console.log(`Document ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
  } catch (err) {
    console.error("Error fetching catalog:", err);
  }
}

inspectCatalog();
