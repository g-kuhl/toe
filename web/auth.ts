/**
 * auth.ts — Session management, password verification, and rate limiting
 * for TOE Agent Manager.
 *
 * Security design: David Okonkwo (Security Engineer), 2026-03-02
 * Implementation: Marcus Silva (Senior Developer), 2026-03-02
 */

import {
  ADMIN_PASSWORD_HASH,
  ADMIN_USERNAME,
  SESSION_TTL_MS,
  USE_HTTPS,
} from "./config.ts";

// ---------------------------------------------------------------------------
// Session store
// ---------------------------------------------------------------------------

interface SessionRecord {
  username: string;
  createdAt: number;
  expiresAt: number;
  ipAddress: string;
}

const sessions = new Map<string, SessionRecord>();

/** Generate a cryptographically random 64-char hex session token (32 bytes). */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a new session for the given username/IP.
 * Returns the session token string.
 */
export function createSession(username: string, ipAddress: string): string {
  const token = generateToken();
  const now = Date.now();
  sessions.set(token, {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    ipAddress,
  });
  return token;
}

/**
 * Validate a session token.
 * Returns the SessionRecord on success, or null if invalid/expired.
 */
export function validateSession(token: string): SessionRecord | null {
  const record = sessions.get(token);
  if (!record) return null;
  if (Date.now() >= record.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return record;
}

/**
 * Destroy a session token (logout).
 */
export function destroySession(token: string): void {
  sessions.delete(token);
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

const COOKIE_NAME = "toe_session";

/** Build the Set-Cookie header value for a new session. */
export function buildSetCookieHeader(token: string): string {
  const base = `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`;
  return USE_HTTPS ? `${base}; Secure` : base;
}

/** Build the Set-Cookie header value to clear the session cookie. */
export function buildClearCookieHeader(): string {
  const base = `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
  return USE_HTTPS ? `${base}; Secure` : base;
}

/**
 * Extract the toe_session token from a Cookie header string.
 * Returns the token string or null if not found.
 */
export function extractToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key.trim() === COOKIE_NAME) {
      return rest.join("=").trim() || null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Password verification (PBKDF2-HMAC-SHA-256, constant-time comparison)
// ---------------------------------------------------------------------------

/**
 * Parse the stored hash string: "pbkdf2:<iterations>:<salt_hex>:<hash_hex>"
 */
function parseStoredHash(
  stored: string,
): { iterations: number; saltHex: string; hashHex: string } {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    throw new Error("Invalid stored hash format");
  }
  return {
    iterations: parseInt(parts[1], 10),
    saltHex: parts[2],
    hashHex: parts[3],
  };
}

/** Convert a hex string to Uint8Array. */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time byte comparison.
 * Returns true only if every byte is identical.
 * Never short-circuits — resistant to timing attacks.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Verify a plaintext password against the stored PBKDF2 hash.
 * Uses constant-time comparison to avoid timing attacks.
 */
export async function verifyPassword(
  input: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const { iterations, saltHex, hashHex } = parseStoredHash(storedHash);
    const saltBytes = hexToBytes(saltHex);
    const expectedBytes = hexToBytes(hashHex);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(input),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: saltBytes,
        iterations,
      },
      keyMaterial,
      256,
    );

    const derivedBytes = new Uint8Array(derived);
    return timingSafeEqual(derivedBytes, expectedBytes);
  } catch (err) {
    console.error("[auth] verifyPassword error:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Login credential check
// ---------------------------------------------------------------------------

/**
 * Validate username + password against the configured admin credential.
 * Returns true on match.
 */
export async function validateCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  return await verifyPassword(password, ADMIN_PASSWORD_HASH);
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

interface RateLimitRecord {
  attempts: number;
  windowStart: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/** Check whether a login attempt from the given IP is allowed. */
export function checkRateLimit(
  ip: string,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let record = loginAttempts.get(ip) ?? {
    attempts: 0,
    windowStart: now,
    lockedUntil: 0,
  };

  // Currently locked out
  if (record.lockedUntil > now) {
    // Extend lockout on each attempt during lockout
    record.lockedUntil = now + LOCKOUT_MS;
    loginAttempts.set(ip, record);
    return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  // Window has expired — reset counter
  if (now - record.windowStart > WINDOW_MS) {
    record = { attempts: 0, windowStart: now, lockedUntil: 0 };
    loginAttempts.set(ip, record);
  }

  return { allowed: true };
}

/** Record a failed login attempt for the given IP. */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  let record = loginAttempts.get(ip) ?? {
    attempts: 0,
    windowStart: now,
    lockedUntil: 0,
  };

  // Reset if window expired
  if (now - record.windowStart > WINDOW_MS) {
    record = { attempts: 0, windowStart: now, lockedUntil: 0 };
  }

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  loginAttempts.set(ip, record);
}

/** Clear the rate limit record for an IP on successful login. */
export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

// Periodic cleanup: remove stale rate limit records every 30 minutes.
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts) {
    if (record.lockedUntil < now && now - record.windowStart > WINDOW_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 30 * 60 * 1000);

// ---------------------------------------------------------------------------
// Auth middleware helper
// ---------------------------------------------------------------------------

/**
 * Extract and validate the session from the request.
 * Returns the SessionRecord on success, or null if unauthorized.
 */
export function requireAuth(req: Request): SessionRecord | null {
  const cookieHeader = req.headers.get("Cookie");
  const token = extractToken(cookieHeader);
  if (!token) return null;
  return validateSession(token);
}
