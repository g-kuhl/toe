/**
 * test.ts — TOE Agent Manager API Test Script
 * QA Engineer: Yuki Tanaka
 * Date: 2026-03-02
 *
 * Run with:
 *   deno run --allow-net test.ts
 *
 * Expects the server to be running on http://localhost:8080
 */

const BASE = "http://localhost:8080";
const COOKIE_JAR: Record<string, string> = {};

// ---------------------------------------------------------------------------
// Test runner utilities
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const results: Array<{ name: string; status: "PASS" | "FAIL"; detail?: string }> = [];

function pass(name: string, detail?: string) {
  passed++;
  results.push({ name, status: "PASS", detail });
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, detail: string) {
  failed++;
  results.push({ name, status: "FAIL", detail });
  console.error(`  FAIL  ${name} — ${detail}`);
}

function section(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"─".repeat(60)}`);
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

interface FetchOptions {
  method?: string;
  body?: unknown;
  cookie?: string;
  headers?: Record<string, string>;
}

async function api(
  path: string,
  opts: FetchOptions = {},
): Promise<{ status: number; body: unknown; headers: Headers }> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.cookie) {
    headers["Cookie"] = opts.cookie;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  return { status: res.status, body, headers: res.headers };
}

/** Extract the session cookie from a Set-Cookie header value. */
function extractCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  const pair = setCookieHeader.split(";")[0];
  return pair.trim();
}

// ---------------------------------------------------------------------------
// Main test suite
// ---------------------------------------------------------------------------

let sessionCookie = "";
let firstAgentId = "";
let createdAgentId = "";
let renamedAgentId = "";

// ---------------------------------------------------------------------------
section("AUTH — POST /api/login");
// ---------------------------------------------------------------------------

// TC-01: Bad credentials → 401
{
  const { status } = await api("/api/login", {
    method: "POST",
    body: { username: "admin", password: "wrongpassword" },
  });
  if (status === 401) {
    pass("TC-01: Bad credentials → 401");
  } else {
    fail("TC-01: Bad credentials → 401", `Got ${status}`);
  }
}

// TC-02: Good credentials → 200 + session cookie
{
  const res = await fetch(`${BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "changeme" }),
  });
  const body = await res.json();
  const rawCookie = res.headers.get("Set-Cookie");
  sessionCookie = extractCookie(rawCookie);

  if (res.status === 200 && body.ok === true && sessionCookie) {
    pass("TC-02: Good credentials → 200 + cookie", `cookie: ${sessionCookie.substring(0, 30)}…`);
  } else {
    fail("TC-02: Good credentials → 200 + cookie", `status=${res.status}, cookie=${sessionCookie}`);
  }
}

// ---------------------------------------------------------------------------
section("AGENTS — No Auth");
// ---------------------------------------------------------------------------

// TC-03: GET /api/agents with no cookie → 401
{
  const { status } = await api("/api/agents");
  if (status === 401) {
    pass("TC-03: GET /api/agents (no cookie) → 401");
  } else {
    fail("TC-03: GET /api/agents (no cookie) → 401", `Got ${status}`);
  }
}

// ---------------------------------------------------------------------------
section("AGENTS — With Auth");
// ---------------------------------------------------------------------------

// TC-04: GET /api/agents → 200, array of agents
{
  const { status, body } = await api("/api/agents", { cookie: sessionCookie });
  const b = body as { agents?: unknown[] };
  if (status === 200 && Array.isArray(b?.agents)) {
    const agents = b.agents as Array<{ id: string; name: string; enabled: boolean }>;
    firstAgentId = agents[0]?.id ?? "";
    pass("TC-04: GET /api/agents → 200, array", `${agents.length} agents, first: ${firstAgentId}`);
  } else {
    fail("TC-04: GET /api/agents → 200, array", `status=${status}, body=${JSON.stringify(body).substring(0, 80)}`);
  }
}

// TC-05: GET /api/agents/:id for first agent → 200, content returned
let originalContent = "";
{
  if (!firstAgentId) {
    fail("TC-05: GET /api/agents/:id → 200", "No agents available to test");
  } else {
    const { status, body } = await api(`/api/agents/${encodeURIComponent(firstAgentId)}`, {
      cookie: sessionCookie,
    });
    const b = body as { id?: string; content?: string };
    if (status === 200 && typeof b?.content === "string") {
      originalContent = b.content;
      pass("TC-05: GET /api/agents/:id → 200", `id=${firstAgentId}, content length=${b.content.length}`);
    } else {
      fail("TC-05: GET /api/agents/:id → 200", `status=${status}`);
    }
  }
}

// TC-06: PUT /api/agents/:id with modified content → 200
const modifiedContent = originalContent + "\n<!-- QA Test modification -->";
{
  if (!firstAgentId) {
    fail("TC-06: PUT /api/agents/:id → 200", "No agent ID");
  } else {
    const { status, body } = await api(`/api/agents/${encodeURIComponent(firstAgentId)}`, {
      method: "PUT",
      body: { content: modifiedContent },
      cookie: sessionCookie,
    });
    const b = body as { ok?: boolean };
    if (status === 200 && b?.ok === true) {
      pass("TC-06: PUT /api/agents/:id → 200");
    } else {
      fail("TC-06: PUT /api/agents/:id → 200", `status=${status}, body=${JSON.stringify(body)}`);
    }
  }
}

// TC-07: GET /api/agents/:id again → verify content changed
{
  if (!firstAgentId) {
    fail("TC-07: Verify PUT persisted content", "No agent ID");
  } else {
    const { status, body } = await api(`/api/agents/${encodeURIComponent(firstAgentId)}`, {
      cookie: sessionCookie,
    });
    const b = body as { content?: string };
    if (status === 200 && b?.content === modifiedContent) {
      pass("TC-07: Verify PUT persisted content — content matches");
    } else {
      fail(
        "TC-07: Verify PUT persisted content",
        `status=${status}, match=${b?.content === modifiedContent}`,
      );
    }
  }
}

// Restore original content
if (firstAgentId) {
  await api(`/api/agents/${encodeURIComponent(firstAgentId)}`, {
    method: "PUT",
    body: { content: originalContent },
    cookie: sessionCookie,
  });
}

// TC-08: PATCH /api/agents/:id/toggle → 200, newId returned
let toggledId = "";
{
  if (!firstAgentId) {
    fail("TC-08: PATCH /api/agents/:id/toggle → 200", "No agent ID");
  } else {
    const { status, body } = await api(
      `/api/agents/${encodeURIComponent(firstAgentId)}/toggle`,
      { method: "PATCH", cookie: sessionCookie },
    );
    const b = body as { id?: string; name?: string; enabled?: boolean };
    if (status === 200 && typeof b?.id === "string") {
      toggledId = b.id;
      pass("TC-08: PATCH /api/agents/:id/toggle → 200", `newId=${toggledId}, enabled=${b.enabled}`);
    } else {
      fail("TC-08: PATCH /api/agents/:id/toggle → 200", `status=${status}, body=${JSON.stringify(body)}`);
    }
  }
}

// TC-09: PATCH /api/agents/:newId/toggle → toggle back
{
  if (!toggledId) {
    fail("TC-09: Toggle back → original name", "No toggled ID from TC-08");
  } else {
    const { status, body } = await api(
      `/api/agents/${encodeURIComponent(toggledId)}/toggle`,
      { method: "PATCH", cookie: sessionCookie },
    );
    const b = body as { id?: string; enabled?: boolean };
    if (status === 200 && b?.id === firstAgentId) {
      pass("TC-09: Toggle back → original name restored", `id=${b.id}, enabled=${b.enabled}`);
    } else {
      fail(
        "TC-09: Toggle back → original name restored",
        `status=${status}, id=${b?.id}, expected=${firstAgentId}`,
      );
    }
  }
}

// TC-10: POST /api/agents with name "Test Agent QA" → 201
{
  const { status, body } = await api("/api/agents", {
    method: "POST",
    body: { name: "Test Agent QA" },
    cookie: sessionCookie,
  });
  const b = body as { id?: string; name?: string; enabled?: boolean };
  if (status === 201 && b?.id === "Test Agent QA.agent.md") {
    createdAgentId = b.id;
    pass("TC-10: POST /api/agents → 201", `id=${createdAgentId}`);
  } else {
    fail("TC-10: POST /api/agents → 201", `status=${status}, body=${JSON.stringify(body)}`);
  }
}

// TC-11: Verify new agent appears in GET /api/agents
{
  if (!createdAgentId) {
    fail("TC-11: New agent in list", "Agent was not created in TC-10");
  } else {
    const { status, body } = await api("/api/agents", { cookie: sessionCookie });
    const b = body as { agents?: Array<{ id: string }> };
    const found = b?.agents?.some((a) => a.id === createdAgentId);
    if (status === 200 && found) {
      pass("TC-11: New agent appears in GET /api/agents");
    } else {
      fail("TC-11: New agent appears in GET /api/agents", `found=${found}`);
    }
  }
}

// TC-12: PATCH /api/agents/:newAgentId/rename with newName "Test Agent QA Renamed" → 200
{
  if (!createdAgentId) {
    fail("TC-12: PATCH rename → 200", "No created agent ID");
  } else {
    const { status, body } = await api(
      `/api/agents/${encodeURIComponent(createdAgentId)}/rename`,
      {
        method: "PATCH",
        body: { newName: "Test Agent QA Renamed" },
        cookie: sessionCookie,
      },
    );
    const b = body as { id?: string; name?: string };
    if (status === 200 && b?.id === "Test Agent QA Renamed.agent.md") {
      renamedAgentId = b.id;
      pass("TC-12: PATCH rename → 200", `newId=${renamedAgentId}`);
    } else {
      fail("TC-12: PATCH rename → 200", `status=${status}, body=${JSON.stringify(body)}`);
    }
  }
}

// TC-13: DELETE /api/agents/:renamedId → 200
{
  const idToDelete = renamedAgentId || createdAgentId;
  if (!idToDelete) {
    fail("TC-13: DELETE → 200", "No agent to delete");
  } else {
    const { status, body } = await api(`/api/agents/${encodeURIComponent(idToDelete)}`, {
      method: "DELETE",
      cookie: sessionCookie,
    });
    const b = body as { ok?: boolean };
    if (status === 200 && b?.ok === true) {
      pass("TC-13: DELETE /api/agents/:id → 200", `deleted: ${idToDelete}`);
    } else {
      fail("TC-13: DELETE /api/agents/:id → 200", `status=${status}, body=${JSON.stringify(body)}`);
    }
  }
}

// TC-14: Verify deleted agent is gone from GET /api/agents
{
  const idToVerify = renamedAgentId || createdAgentId;
  if (!idToVerify) {
    fail("TC-14: Deleted agent gone from list", "No agent to verify");
  } else {
    const { status, body } = await api("/api/agents", { cookie: sessionCookie });
    const b = body as { agents?: Array<{ id: string }> };
    const found = b?.agents?.some((a) => a.id === idToVerify);
    if (status === 200 && !found) {
      pass("TC-14: Deleted agent is gone from GET /api/agents");
    } else {
      fail("TC-14: Deleted agent is gone from GET /api/agents", `found=${found}`);
    }
  }
}

// TC-15: Path traversal → 400 or 404
{
  // The router decodes the URL path, so ..%2F becomes ../
  // The agent ID param after decoding would contain "/" which triggers SecurityError → 400
  const { status } = await api("/api/agents/..%2F..%2Fetc%2Fpasswd", {
    cookie: sessionCookie,
  });
  if (status === 400 || status === 404) {
    pass("TC-15: Path traversal blocked → 400/404", `Got ${status}`);
  } else {
    fail("TC-15: Path traversal blocked → 400/404", `Got ${status}`);
  }
}

// ---------------------------------------------------------------------------
section("SUMMARY");
// ---------------------------------------------------------------------------

console.log(`\n  Total: ${passed + failed}   PASS: ${passed}   FAIL: ${failed}`);
console.log("");

if (failed > 0) {
  console.error("  ❌ Some tests FAILED — see details above.");
  Deno.exit(1);
} else {
  console.log("  ✅ All tests PASSED.");
  Deno.exit(0);
}
