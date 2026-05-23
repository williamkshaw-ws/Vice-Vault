import http from 'http';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      defaultHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: { ...defaultHeaders, ...headers }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function checkLockerExists(uid) {
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    const admin = (await import('firebase-admin')).default;
    if (admin.apps.length === 0) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    const db = admin.firestore();
    let docId = uid;
    if (!uid.startsWith("u-")) {
      const snap = await db.collection("users").where("uid", "==", uid).get();
      if (!snap.empty) {
        docId = snap.docs[0].id;
      }
    }
    const doc = await db.collection("users").doc(docId).collection("data").doc("locker").get();
    return doc.exists;
  } else {
    const lockerPath = path.join(DATA_DIR, 'users_data', `${uid}.json`);
    return fs.existsSync(lockerPath);
  }
}


async function runTests() {
  console.log('--- STARTING EXPRESS ADMIN END-TO-END TESTS ---');

  // Clean up any existing "admin" or test users in the local users.json to ensure clean test environment
  if (fs.existsSync(USERS_FILE)) {
    console.log('Cleaning up users.json for fresh test run...');
    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    users = users.filter(u => 
      u.username !== 'admin' && 
      u.username !== 'testadmin' && 
      u.username !== 'regularuser' &&
      u.username !== 'updated_user' &&
      u.email !== 'admin@vault.com' &&
      u.email !== 'user@vault.com'
    );
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  // Clean up Firestore if service-account.json is present
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Firebase Service Account detected. Cleaning up Firestore users...');
    try {
      const admin = (await import('firebase-admin')).default;
      if (admin.apps.length === 0) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      // Clean up Firebase Auth users
      for (const email of ['admin@vault.com', 'user@vault.com']) {
        try {
          const authUser = await admin.auth().getUserByEmail(email);
          console.log(`Deleting Auth user: ${email} (${authUser.uid})`);
          await admin.auth().deleteUser(authUser.uid);
        } catch (authErr) {
          if (authErr.code !== 'auth/user-not-found') {
            console.error(`Error deleting Auth user ${email}:`, authErr);
          }
        }
      }

      const db = admin.firestore();
      const snapshot = await db.collection("users").get();
      const deletePromises = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const username = data.username || '';
        const email = data.email || '';
        if (
          username === 'admin' || 
          username === 'testadmin' || 
          username === 'regularuser' || 
          username === 'updated_user' || 
          email === 'admin@vault.com' || 
          email === 'user@vault.com'
        ) {
          console.log(`Deleting Firestore user: ${doc.id} (${username} - ${email})`);
          deletePromises.push(db.collection("users").doc(doc.id).delete());
          deletePromises.push(db.collection("users").doc(doc.id).collection("data").doc("locker").delete());
          deletePromises.push(db.collection("users").doc(doc.id).collection("data").doc("catalog").delete());
        }
      });
      await Promise.all(deletePromises);
      console.log('Firestore and Auth user cleanup complete.');
    } catch (err) {
      console.error('Error cleaning up Firestore/Auth users:', err);
    }
  }


  // 1. Sign Up as Admin (using username "@admin")
  console.log('\n1. Testing Sign Up with username "@admin"...');
  const signUpAdminRes = await request('POST', '/api/auth/signup', {
    email: 'admin@vault.com',
    password: 'AdminPass123!',
    username: '@admin', // username with @ symbol
    displayName: 'System Admin',
    preferredColor: '#2563eb',
    avatarUrl: 'preset-1'
  });

  if (signUpAdminRes.statusCode === 211 && signUpAdminRes.body.role === 'Admin') {
    console.log('✓ Admin Sign Up Success (Auto-Promoted to Admin):', signUpAdminRes.body);
  } else {
    console.error('✗ Admin Sign Up Failed or role is not Admin:', signUpAdminRes);
    process.exit(1);
  }

  const adminUser = signUpAdminRes.body;
  const adminUid = adminUser.uid;

  // 1B. Test GET /api/users/:id/profile
  console.log('\n1B. Testing GET /api/users/:id/profile...');
  const getProfileRes = await request('GET', `/api/users/${adminUid}/profile`);
  if (getProfileRes.statusCode === 200 && getProfileRes.body.role === 'Admin') {
    console.log('✓ Get Profile Success:', getProfileRes.body);
  } else {
    console.error('✗ Get Profile Failed:', getProfileRes);
    process.exit(1);
  }

  // 2. Sign Up as regular user
  console.log('\n2. Testing Sign Up as regular user...');
  const signUpUserRes = await request('POST', '/api/auth/signup', {
    email: 'user@vault.com',
    password: 'UserPass123!',
    username: 'regularuser',
    displayName: 'Regular User',
    preferredColor: '#ff3366',
    avatarUrl: 'preset-2'
  });

  if (signUpUserRes.statusCode === 211 && signUpUserRes.body.role === 'User') {
    console.log('✓ Regular User Sign Up Success (Role is User):', signUpUserRes.body);
  } else {
    console.error('✗ Regular User Sign Up Failed:', signUpUserRes);
    process.exit(1);
  }

  const regularUser = signUpUserRes.body;
  let regularUid = regularUser.uid;

  // 3. Save some locker data for regular user so we can test cleanup on delete
  console.log('\n3. Saving locker data for regular user...');
  const saveLockerRes = await request('POST', `/api/users/${regularUid}/locker`, {
    balls: [{ id: 'b-1', model: 'PRO', color: 'White', quantity: 6 }]
  });
  if (saveLockerRes.statusCode === 200) {
    console.log('✓ Saved regular user locker data successfully');
    const exists = await checkLockerExists(regularUid);
    if (exists) {
      console.log(`✓ Locker data/file exists for user ${regularUid}`);
    } else {
      console.error(`✗ Locker data/file NOT found for user ${regularUid}`);
      process.exit(1);
    }
  } else {
    console.error('✗ Failed to save locker data:', saveLockerRes);
    process.exit(1);
  }

  // 4. Test Authorization Gate: Regular User attempts GET /api/users
  console.log('\n4. Testing GET /api/users gate with regular user...');
  const getUsersRegularRes = await request('GET', '/api/users', null, {
    'x-user-id': regularUid
  });

  if (getUsersRegularRes.statusCode === 403) {
    console.log('✓ Correctly rejected regular user (403 Forbidden):', getUsersRegularRes.body);
  } else {
    console.error('✗ Failed to reject regular user on GET /api/users:', getUsersRegularRes);
    process.exit(1);
  }

  // 5. Test Authorization Gate: Admin User attempts GET /api/users
  console.log('\n5. Testing GET /api/users gate with admin user...');
  const getUsersAdminRes = await request('GET', '/api/users', null, {
    'x-user-id': adminUid
  });

  if (getUsersAdminRes.statusCode === 200 && Array.isArray(getUsersAdminRes.body)) {
    console.log('✓ Admin successfully retrieved user list. Count:', getUsersAdminRes.body.length);
    // Ensure no passwords are in the payload
    const hasPassword = getUsersAdminRes.body.some(u => u.password !== undefined);
    if (!hasPassword) {
      console.log('✓ Checked: User records do not contain password fields');
    } else {
      console.error('✗ Checked: Password fields found in user payload!');
      process.exit(1);
    }
  } else {
    console.error('✗ Admin failed to retrieve user list:', getUsersAdminRes);
    process.exit(1);
  }

  // 6. Test Admin Updating User Details (PATCH /api/users/:id)
  console.log('\n6. Testing Admin modifying regular user details...');
  const updateFields = {
    displayName: 'Updated Name',
    username: 'updated_user',
    role: 'Admin',
    preferredColor: '#00e5ff',
    avatarUrl: 'preset-5'
  };

  const updateRes = await request('PATCH', `/api/users/${regularUid}`, updateFields, {
    'x-user-id': adminUid
  });

  if (updateRes.statusCode === 200 && updateRes.body.role === 'Admin' && updateRes.body.displayName === 'Updated Name') {
    console.log('✓ User modified successfully by admin:', updateRes.body);
    regularUid = updateRes.body.uid;
  } else {
    console.error('✗ Failed to modify user details:', updateRes);
    process.exit(1);
  }

  // 7. Test Self-Protection Safeguards
  console.log('\n7. Testing Self-Protection Safeguards...');
  
  // A. Self-demotion check
  console.log('7A. Testing self-demotion block...');
  const demoteSelfRes = await request('PATCH', `/api/users/${adminUid}`, {
    role: 'User'
  }, {
    'x-user-id': adminUid
  });

  if (demoteSelfRes.statusCode === 400 && demoteSelfRes.body.error.toLowerCase().includes('self-protection')) {
    console.log('✓ Demote self blocked correctly:', demoteSelfRes.body);
  } else {
    console.error('✗ Failed to block self-demotion:', demoteSelfRes);
    process.exit(1);
  }

  // B. Self-deletion check
  console.log('7B. Testing self-deletion block...');
  const deleteSelfRes = await request('DELETE', `/api/users/${adminUid}`, null, {
    'x-user-id': adminUid
  });

  if (deleteSelfRes.statusCode === 400 && deleteSelfRes.body.error.toLowerCase().includes('self-protection')) {
    console.log('✓ Delete self blocked correctly:', deleteSelfRes.body);
  } else {
    console.error('✗ Failed to block self-deletion:', deleteSelfRes);
    process.exit(1);
  }

  // 8. Test Admin Deleting User (DELETE /api/users/:id) and file cleanup
  console.log('\n8. Testing Admin deleting user and verifying workspace file cleanup...');
  const deleteUserRes = await request('DELETE', `/api/users/${regularUid}`, null, {
    'x-user-id': adminUid
  });

  if (deleteUserRes.statusCode === 200 && deleteUserRes.body.success) {
    console.log('✓ User deleted successfully:', deleteUserRes.body);
    const exists = await checkLockerExists(regularUid);
    if (!exists) {
      console.log(`✓ Confirmed: User locker data/file was deleted`);
    } else {
      console.error(`✗ Failed: User locker data/file still exists!`);
      process.exit(1);
    }
  } else {
    console.error('✗ Failed to delete user:', deleteUserRes);
    process.exit(1);
  }

  console.log('\n--- ALL ADMIN API & ROLE TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Unhandled admin test error:', err);
  process.exit(1);
});
