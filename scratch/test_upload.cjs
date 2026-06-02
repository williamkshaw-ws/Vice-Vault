const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));

// Use the exact same logic as server.ts
const storageBucket = "vice-vault-f52e4.firebasestorage.app";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket
});

async function testUpload() {
  try {
    const base64Str = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filename = `test/${Date.now()}.${ext}`;
    console.log("Bucket:", storageBucket);
    const bucket = admin.storage().bucket();
    const file = bucket.file(filename);
    
    console.log("Saving file...");
    await file.save(buffer, {
      metadata: { contentType: `image/${ext}` }
    });
    
    console.log("Success!");
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
    console.log("URL:", url);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
  }
}

testUpload();
