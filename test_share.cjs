const crypto = require("crypto");
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
const token = encryptUsername("admin");
console.log("Token for admin:", token);
fetch("http://localhost:3000/api/share/" + token)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
