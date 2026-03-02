/**
 * api/router.ts — Dispatches /api/* requests to the correct handler.
 *
 * All authenticated routes verify the session before delegating.
 * Login/logout are handled here because they touch the session cookie directly.
 */

import { PORT, MAX_BODY_BYTES } from "../config.ts";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  requireAuth,
  validateCredentials,
  createSession,
  destroySession,
  extractToken,
  buildSetCookieHeader,
  buildClearCookieHeader,
} from "../auth.ts";
import {
  handleListAgents,
  handleGetAgent,
  handleUpdateAgent,
  handleToggleAgent,
  handleRenameAgent,
  handleDeleteAgent,
  handleCreateAgent,
} from "./agents.ts";

// ---------------------------------------------------------------------------
// CORS / Security headers applied to every response
// ---------------------------------------------------------------------------

const ALLOWED_ORIGIN = `http://localhost:${PORT}`;

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'",
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cookie",
};

// ---------------------------------------------------------------------------
// Response helpers (exported so agents.ts can use them)
// ---------------------------------------------------------------------------

export function jsonResponse(
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...SECURITY_HEADERS,
      ...extra,
    },
  });
}

export function errorResponse(
  message: string,
  status: number,
  extra: Record<string, string> = {},
): Response {
  return jsonResponse({ error: message }, status, extra);
}

// ---------------------------------------------------------------------------
// Client IP extraction
// ---------------------------------------------------------------------------

function getClientIp(req: Request, info: Deno.ServeHandlerInfo): string {
  const forwarded = req.headers.get("X-Forwarded-For");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Deno.ServeHandlerInfo provides remoteAddr
  const remote = (info as { remoteAddr?: { hostname?: string } }).remoteAddr;
  return remote?.hostname ?? "unknown";
}

// ---------------------------------------------------------------------------
// Body size guard
// ---------------------------------------------------------------------------

async function enforceBodySize(req: Request, maxBytes: number): Promise<boolean> {
  const contentLength = req.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return false;
  }
  // For chunked transfers, we rely on server.ts body limiting instead.
  return true;
}

// ---------------------------------------------------------------------------
// Content-Type guard for mutating requests
// ---------------------------------------------------------------------------

function requireJson(req: Request): boolean {
  const ct = req.headers.get("Content-Type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}

// ---------------------------------------------------------------------------
// Main router
// ---------------------------------------------------------------------------

export async function router(
  req: Request,
  info: Deno.ServeHandlerInfo,
): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: SECURITY_HEADERS });
  }

  // CORS origin check — reject cross-origin requests
  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) {
    return new Response("Forbidden", { status: 403, headers: SECURITY_HEADERS });
  }

  // Body size guard for all API requests
  if (!await enforceBodySize(req, MAX_BODY_BYTES)) {
    return errorResponse("Content too large", 413);
  }

  // ---------------------------------------------------------------------------
  // POST /api/login
  // ---------------------------------------------------------------------------
  if (method === "POST" && pathname === "/api/login") {
    if (!requireJson(req)) {
      return errorResponse("Unsupported media type", 415);
    }

    let body: { username?: unknown; password?: unknown };
    try {
      body = await req.json();
    } catch {
      return errorResponse("Bad request", 400);
    }

    const username = body.username;
    const password = body.password;

    if (typeof username !== "string" || typeof password !== "string") {
      return errorResponse("Bad request", 400);
    }

    const ip = getClientIp(req, info);

    // Rate limit check
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return errorResponse(
        "Too many failed login attempts. Try again later.",
        429,
        { "Retry-After": String(rl.retryAfter ?? 900) },
      );
    }

    const valid = await validateCredentials(username, password);
    if (!valid) {
      recordFailedAttempt(ip);
      return errorResponse("Invalid credentials", 401);
    }

    clearRateLimit(ip);
    const token = createSession(username, ip);
    const cookie = buildSetCookieHeader(token);

    return jsonResponse({ ok: true }, 200, { "Set-Cookie": cookie });
  }

  // ---------------------------------------------------------------------------
  // POST /api/logout
  // ---------------------------------------------------------------------------
  if (method === "POST" && pathname === "/api/logout") {
    const session = requireAuth(req);
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const token = extractToken(req.headers.get("Cookie"));
    if (token) destroySession(token);

    return jsonResponse({ ok: true }, 200, {
      "Set-Cookie": buildClearCookieHeader(),
    });
  }

  // ---------------------------------------------------------------------------
  // Authenticated /api/agents routes
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api/agents")) {
    const session = requireAuth(req);
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    // Content-type check for mutating requests
    if (["POST", "PUT", "PATCH"].includes(method)) {
      // toggle has no body requirement — skip for it
      const isToggle = /\/toggle$/.test(pathname);
      if (!isToggle && !requireJson(req)) {
        return errorResponse("Unsupported media type", 415);
      }
    }

    // GET /api/agents
    if (method === "GET" && pathname === "/api/agents") {
      return await handleListAgents(req);
    }

    // POST /api/agents  (create)
    if (method === "POST" && pathname === "/api/agents") {
      return await handleCreateAgent(req);
    }

    // Routes with :id
    // Match /api/agents/<id>, /api/agents/<id>/toggle, /api/agents/<id>/rename
    const agentBase = "/api/agents/";
    if (pathname.startsWith(agentBase)) {
      const rest = pathname.slice(agentBase.length); // everything after /api/agents/

      // Split off sub-action if present
      const toggleSuffix = "/toggle";
      const renameSuffix = "/rename";

      if (rest.endsWith(toggleSuffix)) {
        const rawId = rest.slice(0, -toggleSuffix.length);
        const agentId = decodeURIComponent(rawId);
        if (method !== "PATCH") return errorResponse("Method not allowed", 405);
        return await handleToggleAgent(req, agentId);
      }

      if (rest.endsWith(renameSuffix)) {
        const rawId = rest.slice(0, -renameSuffix.length);
        const agentId = decodeURIComponent(rawId);
        if (method !== "PATCH") return errorResponse("Method not allowed", 405);
        return await handleRenameAgent(req, agentId);
      }

      // Plain :id routes
      const agentId = decodeURIComponent(rest);

      if (method === "GET") return await handleGetAgent(req, agentId);
      if (method === "PUT") return await handleUpdateAgent(req, agentId);
      if (method === "DELETE") return await handleDeleteAgent(req, agentId);

      return errorResponse("Method not allowed", 405);
    }
  }

  return errorResponse("Not found", 404);
}
