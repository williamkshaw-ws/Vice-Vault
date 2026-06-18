import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function main() {
  const db = admin.firestore();
  let totalFixed = 0;
  
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    
    const lockerDocRef = db.collection('users').doc(doc.id).collection('data').doc('locker');
    const lockerDoc = await lockerDocRef.get();
    
    if (lockerDoc.exists) {
      let balls = lockerDoc.data()?.balls || [];
      let updated = false;

      balls = balls.map((b: any) => {
        if (b.name === 'Cosmic') {
          b.name = 'Cosmic Collection';
          updated = true;
          totalFixed++;
        }
        if (b.name === 'ZaraHome') {
          b.name = 'Zara Home';
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
  console.log(`Migration complete! Fixed ${totalFixed} items across all users.`);
  process.exit(0);
}

main().catch(console.error);
