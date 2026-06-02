const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));

const storageBucket = "vice-vault-f52e4.firebasestorage.app";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket
});

const db = admin.firestore();

async function uploadBase64ToStorage(base64Str, folder = "images") {
  if (!base64Str || !base64Str.startsWith('data:image/')) return base64Str;
  const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64Str;
  
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const uuid = 'xxxx-xxxx-xxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
  const filename = `${folder}/${Date.now()}-${uuid}.${ext}`;
  const bucket = admin.storage().bucket();
  const file = bucket.file(filename);
  await file.save(buffer, { metadata: { contentType: `image/${ext}` } });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
}

async function runLocalMigration() {
  console.log("Running migration against production database...");
  let catalogCount = 0;
  
  try {
    const snap = await db.collection("catalog").get();
    for (const doc of snap.docs) {
      const item = doc.data();
      let updated = false;
      
      if (item.customImage?.startsWith('data:image/')) {
        item.customImage = await uploadBase64ToStorage(item.customImage, "catalog");
        updated = true;
      }
      if (item.customImageSleeve?.startsWith('data:image/')) {
        item.customImageSleeve = await uploadBase64ToStorage(item.customImageSleeve, "catalog");
        updated = true;
      }
      if (item.customImageBox?.startsWith('data:image/')) {
        item.customImageBox = await uploadBase64ToStorage(item.customImageBox, "catalog");
        updated = true;
      }
      
      if (updated) {
        await db.collection("catalog").doc(doc.id).set(item, { merge: true });
        console.log(`Migrated catalog item: ${doc.id}`);
        catalogCount++;
      }
    }

    console.log(`\nCatalog migration complete! Migrated ${catalogCount} items.`);

    // Users
    let lockerCount = 0;
    const usersSnap = await db.collection("users").get();
    for (const userDoc of usersSnap.docs) {
      const lockerRef = userDoc.ref.collection("data").doc("locker");
      const lockerSnap = await lockerRef.get();
      if (lockerSnap.exists) {
        const lockerData = lockerSnap.data();
        const balls = lockerData.balls;
        if (balls && Array.isArray(balls)) {
          let updated = false;
          for (const b of balls) {
            if (b.customImage?.startsWith('data:image/')) {
              b.customImage = await uploadBase64ToStorage(b.customImage, `users/${userDoc.id}`);
              updated = true;
            }
            if (b.customImageSleeve?.startsWith('data:image/')) {
              b.customImageSleeve = await uploadBase64ToStorage(b.customImageSleeve, `users/${userDoc.id}`);
              updated = true;
            }
            if (b.customImageBox?.startsWith('data:image/')) {
              b.customImageBox = await uploadBase64ToStorage(b.customImageBox, `users/${userDoc.id}`);
              updated = true;
            }
          }
          if (updated) {
            await lockerRef.set({ balls }, { merge: true });
            console.log(`Migrated locker for user: ${userDoc.id}`);
            lockerCount++;
          }
        }
      }
    }
    console.log(`Locker migration complete! Migrated ${lockerCount} lockers.`);

  } catch (err) {
    console.error("Migration failed:", err);
  }
}

runLocalMigration();
