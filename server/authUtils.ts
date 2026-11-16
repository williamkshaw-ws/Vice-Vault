import crypto from "crypto";

const SECRET_KEY = process.env.SHARE_SECRET || (() => {
  const generated = crypto.randomBytes(32).toString("hex");
  console.warn("==========================================================");
  console.warn("WARNING: No SHARE_SECRET set in environment variables!");
  console.warn("A random secret key has been generated for share links.");
  // NOTE: The generated secret is intentionally NOT logged here to prevent
  // it from appearing in persistent log storage or log aggregators.
  console.warn("Please set SHARE_SECRET in your .env file to ensure share links persist across server restarts.");
  console.warn("==========================================================");
  return generated;
})();

const AES_KEY = crypto.createHash("sha256").update(SECRET_KEY).digest();

export function encryptUsername(username: string): string {
  if (!username) return "";
  // Use a secure random IV per encryption to prevent deterministic ciphertexts
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, iv);
  let encrypted = cipher.update(username, "utf8", "base64url");
  encrypted += cipher.final("base64url");
  return iv.toString("base64url") + "." + encrypted;
}

export function decryptUsername(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], "base64url");
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY, iv);
    let decrypted = decipher.update(encryptedText, "base64url", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

function signToken(prefix: string, payloadObj: Record<string, unknown>, ttlMs: number): string {
  const payload = Buffer.from(JSON.stringify({ ...payloadObj, exp: Date.now() + ttlMs })).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("base64url");
  return `${prefix}.${payload}.${signature}`;
}

function verifySignedToken<T extends Record<string, unknown>>(token: string, prefix: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== prefix) return null;
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(parts[1]).digest("base64url");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(parts[2], "utf8");
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as T & { exp: number };
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateMockToken(uid: string): string {
  return signToken("mock", { uid }, 86400000);
}

export function verifyMockToken(token: string): string | null {
  return verifySignedToken<{ uid: string }>(token, "mock")?.uid ?? null;
}

export function generateResetToken(email: string): string {
  return signToken("reset", { email: email.trim().toLowerCase() }, 3600000);
}

export function verifyResetToken(token: string): string | null {
  return verifySignedToken<{ email: string }>(token, "reset")?.email ?? null;
}

export function generateVerifyEmailToken(email: string): string {
  return signToken("verify", { email: email.trim().toLowerCase() }, 86400000);
}

export function verifyEmailToken(token: string): string | null {
  return verifySignedToken<{ email: string }>(token, "verify")?.email ?? null;
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 600000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return `${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;

  const parts = storedHash.split(":");
  let iterations: number;
  let salt: string;
  let hash: string;

  if (parts.length === 2) {
    // Legacy 1000 iteration hash
    iterations = 1000;
    [salt, hash] = parts;
  } else if (parts.length === 3) {
    // New format with embedded iterations
    iterations = parseInt(parts[0], 10);
    if (!Number.isFinite(iterations) || iterations < 1000 || iterations > 2000000) return false;
    salt = parts[1];
    hash = parts[2];
  } else {
    return false;
  }

  if (!salt || !hash) return false;
  const checkHash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  const expectedBuf = Buffer.from(hash, "utf8");
  const actualBuf = Buffer.from(checkHash, "utf8");
  return expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function cleanUsernameString(username: string): string {
  let u = username.trim().toLowerCase();
  if (u.includes("@")) {
    const parts = u.split("@");
    u = parts[0] ? parts[0] : parts[1];
  }
  return u.replace(/[^a-z0-9_]/g, "");
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.net",
  "yopmail.com",
  "dispostable.com",
  "getairmail.com",
  "mytemp.email",
  "fakemailgenerator.com",
  "mohmal.com",
  "emailondeck.com",
  "nada.ltd",
  "crazymailing.com",
  "burnermail.io",
  "guerrillamail.biz",
  "guerrillamail.org"
]);

export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(parts[1]);
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = localPart.length <= 2
    ? localPart[0] + "***"
    : localPart[0] + "***" + localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
}
