import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function main() {
  const db = admin.firestore();
  
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    console.log(`User: ${data.displayName} (${doc.id})`);
    
    const lockerDoc = await db.collection('users').doc(doc.id).collection('data').doc('locker').get();
    if (lockerDoc.exists) {
      const balls = lockerDoc.data()?.balls || [];
      const cosmicBalls = balls.filter(b => b.name && b.name.toLowerCase().includes('cosmic'));
      if (cosmicBalls.length > 0) {
        console.log(`Found ${cosmicBalls.length} Cosmic balls!`);
        console.log(JSON.stringify(cosmicBalls, null, 2));
      }
    }
  }
  process.exit(0);
}

main().catch(console.error);
