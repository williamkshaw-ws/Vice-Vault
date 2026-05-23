const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: service-account.json not found at " + serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const usersToCreate = [
  {
    email: 'admin@vault.com',
    password: 'AdminPass123!',
    username: 'admin',
    displayName: 'System Admin',
    role: 'Admin',
    preferredColor: '#2563eb',
    avatarUrl: 'preset-1',
    createdAt: '2026-05-22T17:03:24.324Z'
  },
  {
    email: 'user@vault.com',
    password: 'AdminPass123!',
    username: 'user',
    displayName: 'System User',
    role: 'User',
    preferredColor: '#2563eb',
    avatarUrl: 'preset-1',
    createdAt: '2026-05-22T17:03:24.325Z'
  }
];

async function run() {
  console.log("Starting Firebase user recreation...");

  for (const u of usersToCreate) {
    let authUser = null;
    
    // 1. Check if user exists in Firebase Auth, and delete them to start fresh
    try {
      authUser = await auth.getUserByEmail(u.email);
      console.log(`Found existing Auth user: ${u.email} (UID: ${authUser.uid}). Deleting...`);
      await auth.deleteUser(authUser.uid);
      console.log(`Deleted Auth user: ${u.email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log(`Auth user ${u.email} does not exist yet.`);
      } else {
        console.error(`Error checking/deleting Auth user ${u.email}:`, err);
        continue;
      }
    }

    // 2. Create the user in Firebase Auth
    try {
      authUser = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName
        // Do not set photoURL as a preset string since Firebase Auth requires a valid URL format
      });
      console.log(`Created Auth user: ${u.email} (UID: ${authUser.uid})`);
    } catch (err) {
      console.error(`Error creating Auth user ${u.email}:`, err);
      continue;
    }

    // 3. Create or update the user document in Firestore
    try {
      const userDocRef = db.collection('users').doc('u-' + u.username);
      await userDocRef.set({
        uid: authUser.uid,
        authUid: authUser.uid,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        preferredColor: u.preferredColor,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
        email: u.email
      });
      console.log(`Created Firestore document for ${u.username} (UID: ${authUser.uid}, Role: ${u.role})`);
    } catch (err) {
      console.error(`Error writing Firestore doc for ${u.username}:`, err);
    }
  }

  console.log("Firebase user recreation finished!");
  process.exit(0);
}

run().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
