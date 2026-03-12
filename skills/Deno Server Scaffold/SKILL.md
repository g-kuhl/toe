---
name: Deno Server Scaffold
description: Initialize a new Deno server application by cloning the template and setting up for development. Focus on code, not deployment.
---

# Deno Server Scaffold

Use this skill when a Junior or Senior Developer needs to set up a new Deno-based server application.

## Prerequisites

- Git installed
- Deno installed

## Step 1: Clone the Template

Clone the deno-server-template and initialize a new project:

```bash
git clone https://github.com/g-kuhl/deno-server-template.git my-server-app
cd my-server-app
rm -rf .git
git init
```

## Step 2: Update deno.json

Edit `deno.json` with your project name and the dev task:

```json
{
  "name": "my-server-app",
  "version": "1.0.0",
  "description": "Your server application description",
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-env --watch=server/ server/main.ts"
  }
}
```

Keep it minimal. Only add imports to `deno.json` if you use external packages from JSR or a CDN.

## Step 3: Implement Your Server

Create `server/main.ts`:

```typescript
const PORT = parseInt(Deno.env.get("PORT") || "8000", 10);

console.log(`Server running at http://localhost:${PORT}`);

Deno.serve({ port: PORT }, (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
});
```

This uses Deno's native `Deno.serve()` API. No imports needed—it's built-in.

## Step 4: Organize Routes as You Grow

As your server grows, split handlers into separate files.

**`server/routes/health.ts`**:
```typescript
export const handleHealth = (_req: Request): Response => {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
};
```

**`server/main.ts`** (updated):
```typescript
import { handleHealth } from "./routes/health.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000", 10);

console.log(`Server running at http://localhost:${PORT}`);

Deno.serve({ port: PORT }, (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/health") {
    return handleHealth(req);
  }
  
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
});
```

## Project Structure Reference

Start simple. Add structure only as needed:

```
server/
├── main.ts              # Entry point
├── types.ts             # Shared types (if needed)
├── routes/              # Route handlers
│   └── health.ts
└── services/            # Business logic (if needed)
```

**Conventions**:
- `main.ts`: Server setup, routing, port binding
- `routes/`: Individual route handler functions
- `services/`: Database queries, business logic, external API calls
- `types.ts`: Shared TypeScript interfaces

## Step 5: Run the Server

Start development:

```bash
deno task dev
```

Your server runs at `http://localhost:8000`. The `--watch` flag auto-reloads on changes.

Test it:

```bash
curl http://localhost:8000/health
```

Should respond: `{"status":"ok"}`

## Step 6: Commit Your Work

```bash
git add .
git commit -m "Initial commit: Deno server scaffold"
```

## Environment Configuration

If you need environment variables, create `.env`:

```env
PORT=8000
```

Read it in your code:

```typescript
const port = Deno.env.get("PORT") || "8000";
```

Add `.env` to `.gitignore` so it's not committed.

## Adding More Routes

As you add routes, keep each handler focused and move them to `routes/`:

```typescript
// server/routes/users.ts
export const handleGetUsers = (_req: Request): Response => {
  const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
  return new Response(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" },
  });
};
```

Import and use in `main.ts`:

```typescript
import { handleHealth } from "./routes/health.ts";
import { handleGetUsers } from "./routes/users.ts";

Deno.serve({ port: PORT }, (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/health") return handleHealth(req);
  if (url.pathname === "/users") return handleGetUsers(req);
  
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
});
```

## What NOT to Do

- Do NOT import `serve` from `std/http/server.ts` — use `Deno.serve()` instead
- Do NOT add `node_modules` or `package.json`
- Do NOT use npm packages
- Do NOT over-architect before you have code to organize
- Do NOT import frameworks like Express.js
- Start with a single `main.ts` file. Add structure only when needed.

## That's It

You now have a working Deno server. Focus on writing your code. Structure grows naturally as your application grows.
