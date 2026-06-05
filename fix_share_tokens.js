import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { Buffer } from 'buffer';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const OB_KEY = "ViceVaultSecretObfuscationKey_2026";

function encryptUsername(username) {
  if (!username) return "";
  const buffer = Buffer.from(username, "utf-8");
  const keyBuf = Buffer.from(OB_KEY, "utf-8");
  const result = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ keyBuf[i % keyBuf.length];
  }
  return result.toString("base64url");
}

async function fixTokens() {
  const users = await db.collection('users').get();
  let count = 0;
  for (const doc of users.docs) {
    const data = doc.data();
    if (data.username && !data.shareToken) {
      const token = encryptUsername(data.username);
      await doc.ref.update({ shareToken: token });
      console.log(`Updated ${data.username} with token ${token}`);
      count++;
    }
  }
  console.log(`Fixed ${count} users.`);
}
fixTokens().catch(console.error);
