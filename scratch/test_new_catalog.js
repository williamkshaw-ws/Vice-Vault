import http from 'http';

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
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          body: parsed
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

async function runTests() {
  console.log('--- STARTING NEW VARIATIONS SEPARATION TESTS ---');

  // 1. Sign in as Admin
  console.log('1. Signing in as admin...');
  const signInRes = await request('POST', '/api/auth/signin', {
    email: 'admin@vault.com',
    password: 'AdminPass123!'
  });

  if (signInRes.statusCode !== 200) {
    console.error('✗ Failed to sign in as admin:', signInRes);
    process.exit(1);
  }
  const adminUid = signInRes.body.uid;

  // 2. Add catalog item 1 (Variation A)
  console.log('\n2. Creating Catalog Item with Variation A...');
  const res1 = await request('POST', '/api/catalog', {
    model: 'PRO PLUS',
    name: 'Gold Edition',
    color: 'White',
    variation: 'Gold Num 1',
    customImage: 'imageA'
  }, { 'x-user-id': adminUid });

  if (res1.statusCode !== 211) {
    console.error('✗ Failed to create item 1:', res1);
    process.exit(1);
  }
  console.log('✓ Item 1 created. ID:', res1.body.id);

  // 3. Add catalog item 2 (Variation B) - Same model, name, color but different variation!
  console.log('\n3. Creating Catalog Item with Variation B...');
  const res2 = await request('POST', '/api/catalog', {
    model: 'PRO PLUS',
    name: 'Gold Edition',
    color: 'White',
    variation: 'Gold Num 2',
    customImage: 'imageB'
  }, { 'x-user-id': adminUid });

  if (res2.statusCode !== 211) {
    console.error('✗ Failed to create item 2:', res2);
    process.exit(1);
  }
  console.log('✓ Item 2 created. ID:', res2.body.id);

  if (res1.body.id === res2.body.id) {
    console.error('✗ Failure: IDs are identical! Variation was not factored into ID separation.');
    process.exit(1);
  } else {
    console.log('✓ Success: IDs are different! Separated correctly.');
  }

  // 4. Fetch catalog and verify both are listed separately
  console.log('\n4. Fetching catalog list...');
  const listRes = await request('GET', '/api/catalog');
  const item1 = listRes.body.find(i => i.id === res1.body.id);
  const item2 = listRes.body.find(i => i.id === res2.body.id);

  if (item1 && item2) {
    console.log('✓ Verified: Both variations exist separately in the catalog.');
  } else {
    console.error('✗ Failed: Variations not found separately in catalog list.');
    process.exit(1);
  }

  // 5. Update Item 1 (Variation A) using PUT
  console.log('\n5. Updating Item 1 via PUT...');
  const putRes = await request('PUT', `/api/catalog/${res1.body.id}`, {
    model: 'PRO PLUS',
    name: 'Gold Edition',
    color: 'White',
    variation: 'Gold Num 1 Edited'
  }, { 'x-user-id': adminUid });

  if (putRes.statusCode !== 200) {
    console.error('✗ PUT request failed:', putRes);
    process.exit(1);
  }
  console.log('✓ PUT request succeeded. New ID:', putRes.body.id);

  // Verify the old ID is deleted and new ID exists
  const listRes2 = await request('GET', '/api/catalog');
  const oldItemExists = listRes2.body.some(i => i.id === res1.body.id);
  const newItemExists = listRes2.body.some(i => i.id === putRes.body.id);
  
  if (!oldItemExists && newItemExists) {
    console.log('✓ Success: Old ID was deleted and updated ID was saved.');
  } else {
    console.error('✗ Failure in ID migration during PUT:', { oldItemExists, newItemExists });
    process.exit(1);
  }

  // 6. Delete both test items
  console.log('\n6. Cleaning up test items...');
  await request('DELETE', `/api/catalog/${putRes.body.id}`, null, { 'x-user-id': adminUid });
  await request('DELETE', `/api/catalog/${res2.body.id}`, null, { 'x-user-id': adminUid });
  console.log('✓ Cleanup complete.');

  console.log('\n--- ALL VARIATIONS SEPARATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
