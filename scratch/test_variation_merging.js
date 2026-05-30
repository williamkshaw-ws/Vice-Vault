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

async function runVariationTests() {
  console.log('--- STARTING VARIATION MERGING API TESTS ---');

  // 1. Sign in as Admin
  const signInRes = await request('POST', '/api/auth/signin', {
    email: 'admin@vault.com',
    password: 'AdminPass123!'
  });

  if (signInRes.statusCode !== 200) {
    console.error('✗ Failed to sign in as admin:', signInRes);
    process.exit(1);
  }
  const adminUid = signInRes.body.uid;

  // 2. Clear Catalog
  console.log('\n2. Clearing catalog...');
  await request('POST', '/api/catalog/clear', null, { 'x-user-id': adminUid });

  // 3. Add Item 1
  console.log('\n3. Adding Item 1 with Variation: "Gold Logo"...');
  const addRes1 = await request('POST', '/api/catalog', {
    model: 'PRO PLUS',
    name: 'Special Edition',
    color: 'Pure White',
    variation: 'Gold Logo',
    year: '2026'
  }, { 'x-user-id': adminUid });

  console.log('addRes1 body:', addRes1.body);

  // 4. Add Item 2 (same model, name, color, year; different variation)
  console.log('\n4. Adding Item 2 with Variation: "Silver Logo"...');
  const addRes2 = await request('POST', '/api/catalog', {
    model: 'PRO PLUS',
    name: 'Special Edition',
    color: 'Pure White',
    variation: 'Silver Logo',
    year: '2026'
  }, { 'x-user-id': adminUid });

  console.log('addRes2 body:', addRes2.body);

  // 5. Fetch catalog and verify
  console.log('\n5. Verifying catalog item in Database...');
  const catRes = await request('GET', '/api/catalog');
  console.log('Catalog items count:', catRes.body.length);
  console.log('Catalog item details:', JSON.stringify(catRes.body, null, 2));

  if (catRes.body.length !== 1) {
    console.error('✗ Failed: Expected exactly 1 catalog item, found:', catRes.body.length);
    process.exit(1);
  }

  const item = catRes.body[0];
  if (!item.variations || !item.variations.includes('Gold Logo') || !item.variations.includes('Silver Logo')) {
    console.error('✗ Failed: variations array is incorrect:', item.variations);
    process.exit(1);
  }

  console.log('✓ Success: Variations correctly merged into a single catalog entry!');
  console.log('\n--- ALL VARIATION MERGING TESTS PASSED SUCCESSFULLY! ---');
}

runVariationTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
