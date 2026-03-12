# Team of Experts (TOE)

A multi-agent system for building complex software projects by assembling specialized AI agents.

## Overview

This repository contains agent definitions for a Project Manager-led team of specialized AI experts. The Project Manager orchestrates complex software projects by hiring and coordinating agents with specific expertise.

## Available Agents

### Core Team
- **Project Manager** - Orchestrates projects, hires and coordinates specialized agents, creates plans and manages milestones
- **Researcher** - Investigates technologies, best practices, and design patterns
- **Designer** - Designs system architecture, UI/UX, and data models
- **Junior Developer** - Implements straightforward features and bug fixes
- **Senior Developer** - Handles complex coding, architecture, and code reviews
- **QA Engineer** - Tests software for quality, bugs, and compliance
- **Documentation Specialist** - Creates user guides, API docs, and technical documentation

### Specialized Team
- **API Designer** - Designs API contracts, OpenAPI specifications, and REST/GraphQL standards
- **Database Engineer** - Designs databases, optimizes queries, manages schemas
- **DevOps** - Manages infrastructure, CI/CD pipelines, and deployments
- **Data Engineer** - Builds ETL pipelines, data processing workflows
- **Security Engineer** - Performs security audits, compliance checks, penetration testing
- **Marketing** - Handles product messaging, launches, and content creation

### Support Team
- **Janitor** - Organizes workspaces and archives project history after completion
- **Morpheus** - Creates custom agent skills and side-loads them into projects

## Available Skills

These reusable skills extend agent capabilities across the team:

- **Archive Email** - Archives and retrieves email messages from project history
- **Code Review Standards** - Establishes code quality guidelines and review processes
- **Create Office** - Sets up dedicated agent workspaces and office directories
- **Create Workspace** - Initializes project workspaces with proper structure
- **Debugging** - Structured debugging process for Deno/TypeScript applications
- **Deno Server Scaffold** - Scaffolds production-ready Deno server projects
- **Deno Web App Scaffold** - Scaffolds Deno-based web application projects
- **Hire Team Member** - Onboards new agents with proper training and setup
- **Incident Response** - Handles production incidents from detection through post-mortem
- **Memory** - Agents maintain persistent context across sessions via memory.md files
- **Read Email** - Retrieves and processes email messages from agent inboxes
- **Teach** - Creates standardized agent skills and procedures
- **Technical Specification** - Writing tech specs before implementing complex features
- **Version and Changelog Management** - Manages semantic versioning and release notes
- **Write Email** - Composes and sends async messages between agents

## How It Works

1. **User Request** - Describe what you need built
2. **Project Manager Analysis** - Project Manager understands requirements and determines approach
3. **Team Assembly** - Project Manager hires the right specialists for the job
4. **Coordination** - Project Manager manages handoffs, dependencies, and parallel work
5. **Delivery** - Completed project with all artifacts, tests, and documentation

## Key Principles

- **Delegation Over Implementation** - Project Manager never writes code, only coordinates
- **Specialized Expertise** - Each agent is an expert in their domain
- **Clear Handoffs** - Work products flow seamlessly between agents
- **Quality Focus** - Testing and documentation are first-class concerns
- **Deno-Only Architecture** - NEVER Node.js, npm, or frameworks; pure Deno/TypeScript only

## Agent Workspace & Communication Conventions

The current standard for agent operations is:

- Agent workspace: `.agents/office/<agent-name>/`
- Team email inboxes: `.agents/office/email/<recipient-name>/`
- Email archive: `.agents/office/email/archive/<recipient-name>/`
- Skills directory: `.agents/skills/`

Deprecated frontmatter note:

- `user-invokable` is deprecated in agent files and should not be used in `*.agent.md`.

## Technology Stack

### ✅ ALLOWED
- **Deno runtime** - The ONLY allowed JavaScript/TypeScript runtime
- **TypeScript** - Vanilla, pure TypeScript (no transpilers)
- **Deno standard library** - Built-in modules only
- **Web APIs** - Standard browser and Deno APIs
- **JSR packages** - Only when absolutely necessary

### ❌ FORBIDDEN
- **Node.js ecosystem** - No Node.js, npm, pnpm, bun, or Yarn
- **package.json/node_modules** - Never created or used
- **JavaScript frameworks** - No React, Vue, Angular, Svelte, etc.
- **CSS frameworks** - No Tailwind, Bootstrap, etc.
- **Build tools** - No webpack, vite, rollup, esbuild, or transpilers
- **Meta-frameworks** - No Next.js, Nuxt, Remix, SvelteKit, etc.

### Why Deno-Only?

This system enforces a **pure, minimal, vanilla approach**:
- No dependency hell or npm bloat
- No build pipelines or compilation steps
- Direct execution with `deno run`
- Security-first with explicit permissions
- Modern ESM imports from URLs or JSR
- Web-standard APIs throughout

## Usage

These agent definitions are designed for use with AI agent orchestration systems that support multi-agent workflows and specialized agent roles.

## Project Types Supported

- Web applications and APIs
- Data processing pipelines
- Infrastructure and DevOps projects
- Security-critical systems
- Product launches and documentation
- Database design and optimization

## License

MIT License - See LICENSE file for details

## Agent Manager Web App

A lightweight browser-based dashboard for viewing and editing agent definition files in this repository. Built with Deno and vanilla JavaScript — no frameworks, no build tools, no dependencies.

### Quick Start (30 seconds)

```bash
# Start the server
deno run --allow-all web/server.ts

# Open in browser
# → http://localhost:8080

# Login with default credentials
# Username: admin
# Password: changeme
```

### What It Does

- **Browse Agents** — View all agent definitions (`.agent.md` files)
- **Edit Live** — Modify agent instructions directly in the browser
- **Instant Sync** — Changes saved to disk in real time
- **Secure Access** — PBKDF2-encrypted passwords, session cookies, rate limiting
- **REST API** — Full CRUD via JSON endpoints for programmatic access

### Documentation

**For complete setup, usage, and API reference**, see [Web App Guide](docs/web-app.md):

- [Running the Server](docs/web-app.md#running-the-server) — Detailed setup and configuration
- [Managing Passwords](docs/web-app.md#managing-passwords) — Generate and update hashes
- [REST API Reference](docs/web-app.md#rest-api-reference) — All endpoints documented
- [Running Tests](docs/web-app.md#running-the-test-suite) — Verify setup with test suite

### Quick Reference

**Change Default Password:**

```bash
# Generate secure hash
deno run --allow-env web/scripts/hash-password.ts

# Set as environment variable
export TOE_ADMIN_PASSWORD_HASH="pbkdf2:sha256:1000:..."
deno run --allow-all web/server.ts
```

**Run Automated Tests:**

```bash
deno run --allow-net web/test.ts
```

**Custom Port & Agent Directory:**

```bash
PORT=3000 TOE_AGENT_ROOT=/custom/path deno run --allow-all web/server.ts
```

For more details, see [docs/web-app.md](docs/web-app.md).
