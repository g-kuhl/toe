/**
 * server.ts — TOE Agent Manager HTTP server entry point.
 *
 * Start with:
 *   deno run --allow-read=/home/geoff/projects/code/toe \
 *            --allow-write=/home/geoff/projects/code/toe \
 *            --allow-net \
 *            --allow-env \
 *            server.ts
 *
 * Run from the web/ directory so relative paths resolve correctly.
 *
 * Environment variables (see config.ts for defaults):
 *   PORT                    — HTTP port (default: 8080)
 *   TOE_AGENT_ROOT          — Path to directory with .agent.md files
 *   TOE_ADMIN_USERNAME      — Admin username (default: admin)
 *   TOE_ADMIN_PASSWORD_HASH — PBKDF2 hash; generate with scripts/hash-password.ts
 *   USE_HTTPS               — "true" to enable Secure cookie flag
 */

import { serveDir } from "jsr:@std/http/file-server";
import { join } from "jsr:@std/path";
import { PORT, AGENT_ROOT_RAW, setAgentRoot } from "./config.ts";
import { router, SECURITY_HEADERS } from "./api/router.ts";

// ---------------------------------------------------------------------------
// Resolve AGENT_ROOT to a real absolute path (expands symlinks, "..", etc.)
// Must happen before any request is handled.
// ---------------------------------------------------------------------------

let agentRootResolved = false;

async function initAgentRoot(): Promise<void> {
  try {
    const real = await Deno.realPath(AGENT_ROOT_RAW);
    setAgentRoot(real);
    console.log(`[server] AGENT_ROOT resolved to: ${real}`);
  } catch (err) {
    console.error(`[server] FATAL: Cannot resolve AGENT_ROOT "${AGENT_ROOT_RAW}": ${err}`);
    Deno.exit(1);
  }
  agentRootResolved = true;
}

// ---------------------------------------------------------------------------
// Static file serving from public/
// ---------------------------------------------------------------------------

// Determine the absolute path of the public/ directory relative to this file.
// import.meta.dirname is available in Deno 1.40+.
const PUBLIC_DIR = join(import.meta.dirname ?? Deno.cwd(), "public");

async function serveStatic(req: Request): Promise<Response> {
  const response = await serveDir(req, {
    fsRoot: PUBLIC_DIR,
    urlRoot: "",
    showDirListing: false,
    enableCors: false,
    quiet: true,
  });

  // Apply security headers to static responses too
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    // Don't override CORS headers for same-origin static content
    if (key.startsWith("Access-Control")) continue;
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

// ---------------------------------------------------------------------------
// Main request handler
// ---------------------------------------------------------------------------

async function handler(
  req: Request,
  info: Deno.ServeHandlerInfo,
): Promise<Response> {
  if (!agentRootResolved) {
    return new Response("Server initializing, please retry", { status: 503 });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // Route all /api/* requests to the API router
  if (pathname.startsWith("/api/")) {
    try {
      return await router(req, info);
    } catch (err) {
      console.error("[server] Unhandled router error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...SECURITY_HEADERS },
      });
    }
  }

  // Serve static files from public/
  // Root "/" -> serve index.html (handled automatically by serveDir)
  try {
    return await serveStatic(req);
  } catch (err) {
    console.error("[server] Static file error:", err);
    return new Response("Not found", { status: 404, headers: SECURITY_HEADERS });
  }
}

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------

await initAgentRoot();

console.log(`[server] TOE Agent Manager starting on http://localhost:${PORT}`);
console.log(`[server] Serving static files from: ${PUBLIC_DIR}`);

Deno.serve(
  {
    port: PORT,
    onListen({ hostname, port }) {
      console.log(`[server] Listening on http://${hostname}:${port}`);
      console.log(`[server] Login: POST http://${hostname}:${port}/api/login`);
    },
  },
  handler,
);
