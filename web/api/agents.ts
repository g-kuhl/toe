/**
 * api/agents.ts — All agent CRUD route handlers for TOE Agent Manager.
 *
 * Agent file conventions:
 *   Active:   <name>.agent.md
 *   Disabled: <name>.agent.md.disabled
 *
 * The :id URL parameter is the raw filename (URL-decoded by the router).
 * All paths are validated and contained within AGENT_ROOT.
 */

import { join, resolve } from "jsr:@std/path";
import { AGENT_ROOT, MAX_AGENT_CONTENT_BYTES } from "../config.ts";
import { jsonResponse, errorResponse } from "./router.ts";

// ---------------------------------------------------------------------------
// Path validation
// ---------------------------------------------------------------------------

const VALID_ID_RE = /^[a-zA-Z0-9 ._()\-]+$/;
const VALID_NAME_RE = /^[a-zA-Z0-9 ._()\-]+$/;
const MAX_ID_LENGTH = 255;

class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Validate and resolve an agent ID to an absolute file path within AGENT_ROOT.
 * Throws SecurityError on any suspicious input.
 * Use for existing files (uses Deno.realPath).
 */
async function resolveAgentPath(agentId: string): Promise<string> {
  validateAgentId(agentId);

  const candidate = join(AGENT_ROOT, agentId);
  let realPath: string;
  try {
    realPath = await Deno.realPath(candidate);
  } catch {
    throw Object.assign(new Error("Not found"), { notFound: true });
  }

  if (!realPath.startsWith(AGENT_ROOT + "/")) {
    console.error(`[agents] Path escape attempt: ${realPath}`);
    throw new SecurityError("Forbidden: path escapes agent root");
  }

  return realPath;
}

/**
 * Validate and resolve a new agent path (file does not yet exist).
 * Uses lexical resolution only (no filesystem access).
 */
function resolveNewAgentPath(agentId: string): string {
  validateAgentId(agentId);

  const normalized = resolve(AGENT_ROOT, agentId);

  if (!normalized.startsWith(AGENT_ROOT + "/")) {
    throw new SecurityError("Forbidden: normalized path escapes agent root");
  }

  return normalized;
}

/** Run all static validation checks on an agent ID string. */
function validateAgentId(agentId: string): void {
  if (!agentId) {
    throw new SecurityError("Invalid agent ID: empty");
  }
  if (agentId.includes("/") || agentId.includes("\\") || agentId.includes("\0")) {
    throw new SecurityError("Invalid agent ID: contains path separator or null byte");
  }
  if (agentId.includes("..")) {
    throw new SecurityError("Invalid agent ID: contains parent traversal sequence");
  }
  if (!agentId.endsWith(".agent.md") && !agentId.endsWith(".agent.md.disabled")) {
    throw new SecurityError("Invalid agent ID: disallowed file extension");
  }
  if (agentId.length > MAX_ID_LENGTH) {
    throw new SecurityError("Invalid agent ID: exceeds maximum length");
  }
  if (!VALID_ID_RE.test(agentId)) {
    throw new SecurityError("Invalid agent ID: contains disallowed characters");
  }
}

/** Derive display name from agent filename. */
function nameFromId(id: string): string {
  return id.replace(/\.agent\.md(\.disabled)?$/, "");
}

/** Check whether an agent ID represents an enabled agent. */
function isEnabled(id: string): boolean {
  return id.endsWith(".agent.md");
}

// ---------------------------------------------------------------------------
// Handler: GET /api/agents
// ---------------------------------------------------------------------------

export async function handleListAgents(_req: Request): Promise<Response> {
  const agents: Array<{ id: string; name: string; enabled: boolean }> = [];

  try {
    for await (const entry of Deno.readDir(AGENT_ROOT)) {
      if (
        entry.isFile &&
        (entry.name.endsWith(".agent.md") ||
          entry.name.endsWith(".agent.md.disabled"))
      ) {
        agents.push({
          id: entry.name,
          name: nameFromId(entry.name),
          enabled: isEnabled(entry.name),
        });
      }
    }
  } catch (err) {
    console.error("[agents] readDir error:", err);
    return errorResponse("Internal server error", 500);
  }

  agents.sort((a, b) => a.name.localeCompare(b.name));
  return jsonResponse({ agents });
}

// ---------------------------------------------------------------------------
// Handler: GET /api/agents/:id
// ---------------------------------------------------------------------------

export async function handleGetAgent(
  _req: Request,
  agentId: string,
): Promise<Response> {
  let filePath: string;
  try {
    filePath = await resolveAgentPath(agentId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    if ((err as { notFound?: boolean }).notFound) return errorResponse("Not found", 404);
    return errorResponse("Internal server error", 500);
  }

  let content: string;
  try {
    const bytes = await Deno.readFile(filePath);
    content = new TextDecoder().decode(bytes);
  } catch {
    return errorResponse("Not found", 404);
  }

  return jsonResponse({
    id: agentId,
    name: nameFromId(agentId),
    enabled: isEnabled(agentId),
    content,
  });
}

// ---------------------------------------------------------------------------
// Handler: PUT /api/agents/:id
// ---------------------------------------------------------------------------

export async function handleUpdateAgent(
  req: Request,
  agentId: string,
): Promise<Response> {
  const body = await parseJsonBody(req);
  if (body === null) return errorResponse("Bad request", 400);

  const content = body.content;
  if (typeof content !== "string") return errorResponse("Bad request", 400);

  const contentBytes = new TextEncoder().encode(content);
  if (contentBytes.byteLength > MAX_AGENT_CONTENT_BYTES) {
    return errorResponse("Content too large", 413);
  }

  let filePath: string;
  try {
    filePath = await resolveAgentPath(agentId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    if ((err as { notFound?: boolean }).notFound) return errorResponse("Not found", 404);
    return errorResponse("Internal server error", 500);
  }

  try {
    await Deno.writeFile(filePath, contentBytes);
  } catch (err) {
    console.error("[agents] writeFile error:", err);
    return errorResponse("Internal server error", 500);
  }

  return jsonResponse({ ok: true });
}

// ---------------------------------------------------------------------------
// Handler: PATCH /api/agents/:id/toggle
// ---------------------------------------------------------------------------

export async function handleToggleAgent(
  _req: Request,
  agentId: string,
): Promise<Response> {
  let filePath: string;
  try {
    filePath = await resolveAgentPath(agentId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    if ((err as { notFound?: boolean }).notFound) return errorResponse("Not found", 404);
    return errorResponse("Internal server error", 500);
  }

  // Derive new filename
  let newId: string;
  if (agentId.endsWith(".agent.md.disabled")) {
    newId = agentId.slice(0, -".disabled".length);
  } else {
    newId = agentId + ".disabled";
  }

  const newPath = resolveNewAgentPath(newId);

  try {
    await Deno.rename(filePath, newPath);
  } catch (err) {
    console.error("[agents] rename error:", err);
    return errorResponse("Internal server error", 500);
  }

  return jsonResponse({
    id: newId,
    name: nameFromId(newId),
    enabled: isEnabled(newId),
  });
}

// ---------------------------------------------------------------------------
// Handler: PATCH /api/agents/:id/rename
// ---------------------------------------------------------------------------

export async function handleRenameAgent(
  req: Request,
  agentId: string,
): Promise<Response> {
  const body = await parseJsonBody(req);
  if (body === null) return errorResponse("Bad request", 400);

  const newName = body.newName;
  if (typeof newName !== "string" || !newName.trim()) {
    return errorResponse("Bad request", 400);
  }
  if (!VALID_NAME_RE.test(newName)) {
    return errorResponse("Bad request", 400);
  }

  let filePath: string;
  try {
    filePath = await resolveAgentPath(agentId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    if ((err as { notFound?: boolean }).notFound) return errorResponse("Not found", 404);
    return errorResponse("Internal server error", 500);
  }

  // Preserve enabled/disabled state
  const suffix = agentId.endsWith(".disabled") ? ".agent.md.disabled" : ".agent.md";
  const newId = newName + suffix;

  let newPath: string;
  try {
    newPath = resolveNewAgentPath(newId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    return errorResponse("Internal server error", 500);
  }

  // Check for conflict
  try {
    await Deno.stat(newPath);
    return errorResponse("An agent with that name already exists", 409);
  } catch {
    // File does not exist — proceed
  }

  try {
    await Deno.rename(filePath, newPath);
  } catch (err) {
    console.error("[agents] rename error:", err);
    return errorResponse("Internal server error", 500);
  }

  return jsonResponse({
    id: newId,
    name: newName,
    enabled: isEnabled(newId),
  });
}

// ---------------------------------------------------------------------------
// Handler: DELETE /api/agents/:id
// ---------------------------------------------------------------------------

export async function handleDeleteAgent(
  _req: Request,
  agentId: string,
): Promise<Response> {
  let filePath: string;
  try {
    filePath = await resolveAgentPath(agentId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    if ((err as { notFound?: boolean }).notFound) return errorResponse("Not found", 404);
    return errorResponse("Internal server error", 500);
  }

  try {
    await Deno.remove(filePath);
  } catch (err) {
    console.error("[agents] remove error:", err);
    return errorResponse("Internal server error", 500);
  }

  return jsonResponse({ ok: true });
}

// ---------------------------------------------------------------------------
// Handler: POST /api/agents
// ---------------------------------------------------------------------------

export async function handleCreateAgent(req: Request): Promise<Response> {
  const body = await parseJsonBody(req);
  if (body === null) return errorResponse("Bad request", 400);

  const name = body.name;
  if (typeof name !== "string" || !name.trim()) {
    return errorResponse("Bad request", 400);
  }
  if (!VALID_NAME_RE.test(name)) {
    return errorResponse("Bad request", 400);
  }

  const agentId = name + ".agent.md";
  let filePath: string;
  try {
    filePath = resolveNewAgentPath(agentId);
  } catch (err) {
    if (err instanceof SecurityError) return errorResponse("Bad request", 400);
    return errorResponse("Internal server error", 500);
  }

  // Check for conflict
  try {
    await Deno.stat(filePath);
    return errorResponse("An agent with that name already exists", 409);
  } catch {
    // File does not exist — proceed
  }

  const initialContent = `# ${name}\n\n`;
  try {
    await Deno.writeFile(filePath, new TextEncoder().encode(initialContent));
  } catch (err) {
    console.error("[agents] writeFile error:", err);
    return errorResponse("Internal server error", 500);
  }

  return jsonResponse(
    {
      id: agentId,
      name,
      enabled: true,
      content: initialContent,
    },
    201,
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Parse a JSON request body safely.
 * Returns null if the body is missing, malformed, or the content-type is wrong.
 */
async function parseJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
