import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function test() {
  const users = await db.collection('users').limit(5).get();
  users.forEach(doc => {
    console.log(doc.id, "=>", doc.data().username, "ShareToken:", doc.data().shareToken);
  });
}
test().catch(console.error);
