/**
 * config.ts — Server configuration for TOE Agent Manager
 *
 * Environment variables:
 *   PORT                    HTTP port (default: 8080)
 *   TOE_AGENT_ROOT          Absolute path to directory containing .agent.md files
 *                           (default: /home/geoff/projects/code/toe)
 *   TOE_ADMIN_USERNAME      Admin username (default: admin)
 *   TOE_ADMIN_PASSWORD_HASH PBKDF2 hash string in format pbkdf2:<iter>:<salt_hex>:<hash_hex>
 *                           Generate with: deno run web/scripts/hash-password.ts
 *   USE_HTTPS               Set to "true" to add Secure flag to session cookie
 *
 * IMPORTANT: Before deploying, generate a fresh password hash:
 *   deno run web/scripts/hash-password.ts
 * Then export TOE_ADMIN_PASSWORD_HASH=<output> in your shell or .env file.
 *
 * The TEST HASH below is for password "changeme" — DO NOT use in production.
 * Derivation: deno eval with PBKDF2-HMAC-SHA-256, 600000 iterations, random 16-byte salt.
 */

export const PORT: number = parseInt(Deno.env.get("PORT") ?? "8080", 10);

// AGENT_ROOT is resolved to a real absolute path at startup (symlinks expanded).
// Must be set before any request is handled. See server.ts for initialization.
const rawAgentRoot =
  Deno.env.get("TOE_AGENT_ROOT") ?? "/home/geoff/projects/code/toe";

// Resolve at import time using sync-style workaround:
// The real resolution happens in server.ts init; this is the raw configured value.
export const AGENT_ROOT_RAW: string = rawAgentRoot;

// AGENT_ROOT is the realPath-resolved version, set by server.ts after async init.
// Exported as a mutable reference so server.ts can set it after Deno.realPath resolves.
export let AGENT_ROOT: string = rawAgentRoot;

/** Set by server.ts after Deno.realPath resolution. */
export function setAgentRoot(resolved: string): void {
  AGENT_ROOT = resolved;
}

export const ADMIN_USERNAME: string =
  Deno.env.get("TOE_ADMIN_USERNAME") ?? "admin";

/**
 * PBKDF2 hash for the admin password.
 * Format: pbkdf2:<iterations>:<salt_hex>:<hash_hex>
 *
 * TEST HASH — password is "changeme"
 * Generated: 2026-03-02 via PBKDF2-HMAC-SHA-256, 600000 iterations, random salt
 * Replace with output of: deno run web/scripts/hash-password.ts
 */
export const ADMIN_PASSWORD_HASH: string =
  Deno.env.get("TOE_ADMIN_PASSWORD_HASH") ??
  "pbkdf2:600000:20824febaf5e03b24ba1abde0f771be7:7db84452c707c10915b67286a5295c21531135806a325f1bc5d466ae960f0277";

/** When true, the Secure flag is appended to the Set-Cookie header. */
export const USE_HTTPS: boolean = Deno.env.get("USE_HTTPS") === "true";

/** Session time-to-live in milliseconds: 8 hours. */
export const SESSION_TTL_MS: number = 8 * 60 * 60 * 1000;

/** Maximum API request body size: 512 KB. */
export const MAX_BODY_BYTES: number = 512 * 1024;

/** Maximum agent content upload size: 256 KB. */
export const MAX_AGENT_CONTENT_BYTES: number = 256 * 1024;
