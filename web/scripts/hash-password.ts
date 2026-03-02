/**
 * scripts/hash-password.ts — One-time utility to generate a PBKDF2 password hash
 * for the TOE Agent Manager admin account.
 *
 * Usage (run from the web/ directory):
 *   deno run --allow-none scripts/hash-password.ts
 *
 * The script reads the password from stdin (NOT from a CLI argument, to avoid
 * shell history exposure). It prints the hash string to stdout for you to paste
 * into your environment:
 *
 *   export TOE_ADMIN_PASSWORD_HASH="pbkdf2:600000:<salt_hex>:<hash_hex>"
 *
 * Or store it in a .env file (add .env to .gitignore to avoid committing it).
 *
 * NEVER hardcode the plaintext password in any source file.
 */

const encoder = new TextEncoder();

/** Read a single line from stdin without echoing (best-effort). */
async function readPasswordStdin(): Promise<string> {
  const buf = new Uint8Array(1024);
  let input = "";
  while (true) {
    const n = await Deno.stdin.read(buf);
    if (n === null) break;
    const chunk = new TextDecoder().decode(buf.subarray(0, n));
    if (chunk.includes("\n")) {
      input += chunk.split("\n")[0];
      break;
    }
    input += chunk;
  }
  return input.trim();
}

async function main(): Promise<void> {
  console.error("TOE Agent Manager — Admin Password Hash Generator");
  console.error("Enter password (input will be visible; use a private terminal):");

  const password = await readPasswordStdin();

  if (!password) {
    console.error("Error: password cannot be empty.");
    Deno.exit(1);
  }

  // Generate a cryptographically random 16-byte salt
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const saltHex = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Derive key via PBKDF2-HMAC-SHA-256
  const ITERATIONS = 600_000;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations: ITERATIONS,
    },
    keyMaterial,
    256,
  );

  const hashHex = Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const hashString = `pbkdf2:${ITERATIONS}:${saltHex}:${hashHex}`;

  console.error("\nHash generated successfully. Copy this value:");
  console.log(hashString);
  console.error(
    "\nSet it as an environment variable before starting the server:\n" +
    `  export TOE_ADMIN_PASSWORD_HASH="${hashString}"\n` +
    "Or add it to a .env file and source it."
  );
}

await main();
