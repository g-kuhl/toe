# TOE Agent Manager Web Application

The TOE Agent Manager is a lightweight, browser-based dashboard for viewing and editing agent definition files (`.agent.md`). Built with vanilla HTML/CSS/JavaScript and Deno, it provides a simple authenticated interface for managing your team of AI agents.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup & Configuration](#setup--configuration)
3. [Running the Server](#running-the-server)
4. [Managing Passwords](#managing-passwords)
5. [REST API Reference](#rest-api-reference)
6. [Running the Test Suite](#running-the-test-suite)
7. [Features](#features)
8. [Architecture](#architecture)

---

## Quick Start

### Prerequisites
- Deno 1.40+
- Bash shell
- Access to the TOE agent repository

### Start the Server (5 seconds)

```bash
cd /path/to/toe
deno run --allow-all web/server.ts
```

Open your browser to **http://localhost:8080** and log in with:

| Username | Password |
|----------|----------|
| `admin`  | `changeme` |

### Stop the Server

Press **Ctrl+C** in the terminal running the server.

---

## Setup & Configuration

### Environment Variables

Configure the server with environment variables:

```bash
export PORT=8080                          # HTTP port (default: 8080)
export TOE_AGENT_ROOT=/path/to/agents    # Where .agent.md files are stored
export TOE_ADMIN_USERNAME=admin           # Admin username (default: admin)
export TOE_ADMIN_PASSWORD_HASH=sha256...  # PBKDF2 hash (see below)

deno run --allow-all web/server.ts
```

### Default Configuration

| Setting | Default | Purpose |
|---------|---------|---------|
| `PORT` | 8080 | HTTP port the server listens on |
| `TOE_AGENT_ROOT` | project root | Directory containing `.agent.md` files |
| `TOE_ADMIN_USERNAME` | admin | Username for web UI login |
| `TOE_ADMIN_PASSWORD_HASH` | changeme | PBKDF2-HMAC-SHA-256 hash |
| `USE_HTTPS` | false | Enable Secure cookie flag |

### Required Permissions

When running the server, Deno requires these permissions:

```bash
# Explicit permissions (more secure):
deno run \
  --allow-net=localhost:8080 \
  --allow-read=/path/to/toe \
  --allow-write=/path/to/toe \
  --allow-env=PORT,TOE_AGENT_ROOT,TOE_ADMIN_USERNAME,TOE_ADMIN_PASSWORD_HASH,USE_HTTPS \
  web/server.ts

# Or use --allow-all for development (less secure):
deno run --allow-all web/server.ts
```

---

## Running the Server

### Basic Start

```bash
deno run --allow-all web/server.ts
```

Output:
```
[server] AGENT_ROOT resolved to: /home/user/toe
[server] Listening on http://localhost:8080
```

### Start on Custom Port

```bash
PORT=3000 deno run --allow-all web/server.ts
```

Server will listen on http://localhost:3000

### Using a Custom Agent Directory

```bash
export TOE_AGENT_ROOT=/custom/agents/path
deno run --allow-all web/server.ts
```

All `.agent.md` files in that directory will be available in the web UI.

### Server Health Check

```bash
# Quick test that server is running
curl http://localhost:8080/api/agents
```

If the server is running correctly, you'll get a JSON response listing all agents.

---

## Managing Passwords

### Security Warning

⚠️ **Important:** The default password `changeme` is a security risk. Always change it before:
- Exposing the server to a network
- Using in production
- Sharing access with team members

### Change the Password

#### Step 1: Generate a Password Hash

```bash
deno run --allow-env web/scripts/hash-password.ts
```

Output:
```
Enter password: ••••••••
Hash: pbkdf2:sha256:1000:...long hash string...
```

**Copy the hash string** (everything after `Hash: `)

#### Step 2: Update Configuration

**Option A: Environment Variable (recommended for deployment)**

```bash
export TOE_ADMIN_PASSWORD_HASH="pbkdf2:sha256:1000:...your-hash..."
deno run --allow-all web/server.ts
```

**Option B: Edit config.ts (for development)**

Edit `web/config.ts`:

```typescript
export const ADMIN_PASSWORD_HASH =
  "pbkdf2:sha256:1000:...your-hash...";
```

Then restart the server.

#### Step 3: Verify

Visit http://localhost:8080 and try logging in with your new password.

### Password Security Details

- Hashing algorithm: **PBKDF2-HMAC-SHA-256**
- Salt: Random 32-byte salt per hash
- Iterations: 1000 (customizable in hash-password.ts)
- Session cookies:
  - Secure flag: Enabled if `USE_HTTPS=true`
  - HttpOnly flag: Always enabled (JavaScript cannot access)
  - SameSite: Strict (prevents CSRF)

### Rate Limiting

Login attempts are rate-limited to prevent brute-force attacks:

- **Limit**: 5 failed login attempts
- **Window**: 15 minutes
- **Action**: Account locked for 15 minutes after 5 failures

---

## REST API Reference

All API endpoints require authentication via session cookie (obtained after login).

### Base URL

```
http://localhost:8080/api
```

### Headers

```
Content-Type: application/json
Cookie: sid=<session-id>
```

### Authentication

1. Call `POST /api/login` with credentials
2. Receive session cookie in `Set-Cookie` header
3. Include cookie in all subsequent requests
4. Call `POST /api/logout` to end session

---

### Login

**`POST /api/login`**

Authenticate with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "changeme"
}
```

**Response (200 OK):**
```json
{
  "sessionId": "abc123def456"
}
```

**Set-Cookie Header:**
```
sid=abc123def456; Path=/; HttpOnly; SameSite=Strict
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Missing username or password |
| 401 | Unauthorized | Invalid credentials |
| 429 | Too many requests | Rate limit exceeded (5 attempts / 15 min) |

---

### Logout

**`POST /api/logout`**

End the current session.

**Request:**
```json
{}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Set-Cookie Header:**
```
sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

### List Agents

**`GET /api/agents`**

List all agent definition files in the repository.

**Response (200 OK):**
```json
{
  "agents": [
    {
      "id": "Project Manager.agent.md",
      "name": "Project Manager",
      "enabled": true
    },
    {
      "id": "Designer.agent.md",
      "name": "Designer",
      "enabled": true
    },
    {
      "id": "old-agent.agent.md.disabled",
      "name": "old-agent",
      "enabled": false
    }
  ]
}
```

**Agent Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Filename (includes `.agent.md` or `.agent.md.disabled`) |
| `name` | string | Display name (filename without extension) |
| `enabled` | boolean | Whether agent is active (true) or disabled (false) |

**Error Responses:**

| Status | Error |
|--------|-------|
| 401 | Unauthorized (not logged in) |
| 500 | Internal server error |

---

### Get Agent Content

**`GET /api/agents/:id`**

Retrieve the full content of an agent definition file.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent filename (URL-encoded), e.g., `Project%20Manager.agent.md` |

**Response (200 OK):**
```json
{
  "id": "Project Manager.agent.md",
  "name": "Project Manager",
  "enabled": true,
  "content": "# Project Manager\n\n## Role\nOrchestrates complex projects..."
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Invalid agent ID |
| 401 | Unauthorized | Not logged in |
| 404 | Not found | Agent file does not exist |

**Example:**

```bash
curl -b "sid=abc123" \
  "http://localhost:8080/api/agents/Project%20Manager.agent.md"
```

---

### Update Agent Content

**`PUT /api/agents/:id`**

Update the content of an agent definition file.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent filename (URL-encoded) |

**Request Body:**
```json
{
  "content": "# Project Manager\n\n## Updated instructions..."
}
```

**Response (200 OK):**
```json
{
  "id": "Project Manager.agent.md",
  "name": "Project Manager",
  "enabled": true,
  "content": "# Project Manager\n\n## Updated instructions..."
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Missing content or invalid agent ID |
| 401 | Unauthorized | Not logged in |
| 404 | Not found | Agent file does not exist |
| 413 | Payload too large | Content exceeds 1 MB |
| 500 | Internal error | File write failed |

---

### Create Agent

**`POST /api/agents/:id`**

Create a new agent definition file.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | New agent filename (must end in `.agent.md`) |

**Request Body:**
```json
{
  "content": "# New Agent\n\n## Role\nDescribe the agent..."
}
```

**Response (201 Created):**
```json
{
  "id": "New Agent.agent.md",
  "name": "New Agent",
  "enabled": true,
  "content": "# New Agent\n\n## Role\nDescribe the agent..."
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Missing content or invalid filename |
| 401 | Unauthorized | Not logged in |
| 409 | Conflict | File already exists |
| 413 | Payload too large | Content exceeds 1 MB |

**Filename Requirements:**

- Must end in `.agent.md`
- Alphanumeric, spaces, hyphens, underscores, parentheses, periods
- Maximum 255 characters
- Example: `Senior Developer.agent.md` ✅
- Example: `../evil.agent.md` ❌

---

### Delete Agent

**`DELETE /api/agents/:id`**

Delete an agent definition file permanently.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent filename (URL-encoded) |

**Response (200 OK):**
```json
{
  "message": "Agent deleted successfully",
  "id": "Old Agent.agent.md"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Invalid agent ID |
| 401 | Unauthorized | Not logged in |
| 404 | Not found | Agent file does not exist |
| 500 | Internal error | File deletion failed |

**Warning:** Deleted agents cannot be recovered except via git history.

---

### Toggle Agent (Enable/Disable)

**`POST /api/agents/:id/toggle`**

Enable a disabled agent or disable an enabled agent.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent filename (URL-encoded) |

**How It Works:**

- Enabled agents: Filename ends in `.agent.md`
- Disabled agents: Filename ends in `.agent.md.disabled`
- Toggle renames the file to switch state

**Response (200 OK):**
```json
{
  "id": "Old Agent.agent.md.disabled",
  "name": "Old Agent",
  "enabled": false,
  "message": "Agent disabled successfully"
}
```

Or if disabling:

```json
{
  "id": "New Agent.agent.md",
  "name": "New Agent",
  "enabled": true,
  "message": "Agent enabled successfully"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Invalid agent ID |
| 401 | Unauthorized | Not logged in |
| 404 | Not found | Agent file does not exist |
| 500 | Internal error | File rename failed |

---

### Rename Agent

**`POST /api/agents/:id/rename`**

Rename an agent definition file.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Current agent filename (URL-encoded) |

**Request Body:**
```json
{
  "newName": "New Agent Name"
}
```

**Response (200 OK):**
```json
{
  "oldId": "Old Name.agent.md",
  "newId": "New Agent Name.agent.md",
  "name": "New Agent Name",
  "enabled": true
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad request | Invalid name or missing newName |
| 401 | Unauthorized | Not logged in |
| 404 | Not found | Agent file does not exist |
| 409 | Conflict | Target filename already exists |
| 500 | Internal error | File rename failed |

**Name Requirements:**

- Alphanumeric, spaces, hyphens, underscores, parentheses, periods
- Maximum 255 characters (including `.agent.md` extension)
- Will preserve enabled/disabled state

---

## Running the Test Suite

The TOE Agent Manager includes a comprehensive API test suite to verify all endpoints and security features.

### Prerequisites

- Server running on http://localhost:8080
- Default password hash must match the test credentials (admin/changeme)

### Run All Tests

```bash
deno run --allow-net web/test.ts
```

**Output:**

```
────────────────────────────────────────────────────────────
  AUTH — POST /api/login
────────────────────────────────────────────────────────────
  PASS  Login with correct credentials
  PASS  Login persists session via Set-Cookie header
  FAIL  Login rate limit triggered after 5 failures — Expected 429, got 401

────────────────────────────────────────────────────────────
  AGENTS — GET /api/agents
────────────────────────────────────────────────────────────
  PASS  List agents returns all .agent.md files
  ...

────────────────────────────────────────────────────────────
SUMMARY: 42 passed, 2 failed
────────────────────────────────────────────────────────────
```

### Test Coverage

The test suite verifies:

| Feature | Tests |
|---------|-------|
| **Authentication** | Login, logout, rate limiting, session persistence |
| **Agent Listing** | Listing all agents, filtering active/disabled |
| **Agent Reading** | Reading agent content, handling missing agents |
| **Agent Writing** | Updating content, size limits, validation |
| **Agent Creation** | Creating new agents, preventing path traversal |
| **Agent Deletion** | Deleting agents, confirming removal |
| **Agent Management** | Enabling/disabling, renaming, status preservation |
| **Security** | CORS headers, cookie flags, permission validation |
| **Error Handling** | Invalid input, missing files, permission errors |

### Common Test Failures

**"Server not running"**

Start the server before running tests:
```bash
deno run --allow-all web/server.ts
```

**"Invalid credentials"**

Check that the test credentials match your password hash:
- Username: `admin`
- Password: `changeme`

If you changed the password, update the test file or revert password to default.

**"Rate limit triggered unexpectedly"**

The rate limiter tracks failed login attempts for 15 minutes. If tests fail:

1. Wait 15 minutes, or
2. Restart the server (clears rate limit in-memory state), or
3. Use a different username/password combo

---

## Features

### Web UI

- **Dashboard** — View all agents at a glance
- **Agent Editor** — Edit agent definitions directly in the browser
- **Real-time Sync** — Changes saved to disk immediately
- **Session Security** — Cookie-based authentication with rate limiting
- **Responsive Design** — Works on desktop and tablet browsers

### API Capabilities

- **Full CRUD** — Create, read, update, delete agents
- **Agent Toggling** — Enable/disable agents without deleting
- **Renaming** — Reorganize agents with rename functionality
- **Validation** — Path traversal protection, filename validation
- **Error Handling** — Graceful errors with clear messages
- **Security Headers** — CORS, CSP, frame denial, XSS protection

### Security Features

- **Authentication** — PBKDF2-HMAC-SHA-256 password hashing
- **Session Cookies** — HttpOnly, SameSite=Strict flags
- **Rate Limiting** — 5 attempts per 15-minute window
- **Path Validation** — Prevents directory traversal attacks
- **Size Limits** — 1 MB max agent content
- **CORS Restrictions** — Same-origin policy enforced
- **Security Headers** — CSP, X-Frame-Options, others

---

## Architecture

### File Structure

```
web/
├── server.ts              # Main HTTP server entry point
├── config.ts              # Centralized configuration
├── auth.ts                # Authentication & session management
├── test.ts                # Full API test suite
├── api/
│   ├── router.ts          # Request dispatcher & CORS/headers
│   └── agents.ts          # Agent CRUD handlers
├── scripts/
│   └── hash-password.ts   # Generate PBKDF2 password hashes
└── public/
    ├── index.html         # Login page
    ├── dashboard.html     # Main dashboard UI
    ├── css/
    │   └── main.css       # Styles
    └── js/
        ├── api.js         # API client
        ├── auth.js        # Auth UI logic
        ├── editor.js      # Agent editor component
        └── agents.js      # Agent list component
```

### Request Flow

```
Browser Request
       ↓
  HTTP Server (server.ts)
       ↓
  Static Files or API Router
       ↓
  [API Router checks auth]
       ↓
  [Route to handler]
       ↓
  Handler (agents.ts)
       ↓
  Validate & Process
       ↓
  Read/Write Agent Files
       ↓
  JSON Response
```

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Deno 1.40+|
| **Language** | TypeScript |
| **HTTP** | Deno std/http |
| **File I/O** | Deno file API |
| **Crypto** | Deno crypto API (PBKDF2) |
| **Frontend** | Vanilla HTML/CSS/JavaScript |
| **Testing** | Deno native testing |

### No External Dependencies

The TOE Agent Manager uses **zero npm packages** and **zero external frameworks**:

- ✅ Only Deno standard library
- ✅ Only vanilla JavaScript in browser
- ✅ Only standard web APIs
- ⚠️ No frameworks, no build tools, no transpilation

This ensures minimal attack surface, fast startup, and easy deployment.

---

## Troubleshooting

### Server won't start

```bash
# Check if port 8080 is already in use
lsof -i :8080

# Use a different port
PORT=3000 deno run --allow-all web/server.ts
```

### Login fails

```bash
# Ensure you're using the correct credentials
# Default: admin / changeme

# Check password hash
deno run --allow-env web/scripts/hash-password.ts
# Verify output matches TOE_ADMIN_PASSWORD_HASH
```

### Agent file not updating

- **Cause**: File permissions issue
- **Fix**: Ensure Deno has write permission to AGENT_ROOT
- **Check**: `ls -l /path/to/agents`

### "Path escapes agent root" error

- **Cause**: Attempted directory traversal (e.g., `../../../etc/passwd`)
- **Fix**: Use valid agent filenames only (e.g., `MyAgent.agent.md`)
- **Security**: This is intentional and prevents attacks

---

## Next Steps

- [REST API Examples](#rest-api-reference) — See example requests
- [Run Tests](#running-the-test-suite) — Verify your setup
- [Change Password](#managing-passwords) — Secure for production
- [Custom Agents](../getting-started.md) — Create your own agents
