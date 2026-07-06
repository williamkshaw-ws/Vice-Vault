import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function main() {
  const db = admin.firestore();
  let totalFixed = 0;
  
  const catalogSnapshot = await db.collection('catalog').get();
  for (const doc of catalogSnapshot.docs) {
    const data = doc.data();
    if (!data.rarity) {
      await doc.ref.update({ rarity: 'common' });
      totalFixed++;
    }
  }

  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const lockerDocRef = db.collection('users').doc(doc.id).collection('data').doc('locker');
    const lockerDoc = await lockerDocRef.get();
    
    if (lockerDoc.exists) {
      let balls = lockerDoc.data()?.balls || [];
      let updated = false;

      balls = balls.map((b: any) => {
        if (!b.rarity) {
          b.rarity = 'common';
          updated = true;
          totalFixed++;
        }
        return b;
      });

      if (updated) {
        console.log(`Updating ${data.displayName} (${doc.id})`);
        await lockerDocRef.update({ balls });
      }
    }
  }
  
  // also do local json files just in case
  const DATA_DIR = './data';
  const CATALOG_FILE = `${DATA_DIR}/catalog.json`;
  if (fs.existsSync(CATALOG_FILE)) {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    let updated = false;
    for (const item of catalog) {
      if (!item.rarity) {
        item.rarity = 'common';
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
      console.log('Updated local catalog.json');
    }
  }
  
  const USERS_DATA_DIR = `${DATA_DIR}/users_data`;
  if (fs.existsSync(USERS_DATA_DIR)) {
    const files = fs.readdirSync(USERS_DATA_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = `${USERS_DATA_DIR}/${file}`;
        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let updated = false;
        if (userData.balls) {
          userData.balls = userData.balls.map((b: any) => {
            if (!b.rarity) {
              b.rarity = 'common';
              updated = true;
            }
            return b;
          });
        }
        if (userData.catalog) {
          userData.catalog = userData.catalog.map((c: any) => {
             if (!c.rarity) {
               c.rarity = 'common';
               updated = true;
             }
             return c;
          });
        }
        if (updated) {
          fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf8');
          console.log(`Updated local user data: ${file}`);
        }
      }
    }
  }
  
  console.log(`Migration complete! Fixed ${totalFixed} items across Firestore and local JSON.`);
  process.exit(0);
}

main().catch(console.error);
