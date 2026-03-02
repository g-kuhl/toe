# Changelog

All notable changes to the TOE (Team of Experts) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - v2.0.0

### Added
- **Janitor Agent**: Organizes workspaces and verifies cleanup after task completion
- **Morpheus Agent**: Creates custom agent skills and side-loads them into projects
- **Junior Developer Agent**: Handles straightforward coding tasks and bug fixes
- **Senior Developer Agent**: Handles complex architecture and code reviews
- **Email Communication System**: Agents now use `.agents/email/` for async communication
  - Email format: `to-[name]-from-[yourname].email`
  - Replaces the previous inbox system
- **Agent Manager Web App**: Complete Deno/TypeScript web server for managing `.agent.md` files via browser
  - `web/server.ts`: HTTP server entry point using `Deno.serve`; serves static files from `web/public/`; configurable via env vars (`PORT`, `TOE_AGENT_ROOT`, `TOE_ADMIN_USERNAME`, `TOE_ADMIN_PASSWORD_HASH`)
  - `web/config.ts`: Centralised configuration with `SESSION_TTL_MS` (8h), `MAX_BODY_BYTES` (512 KB), `MAX_AGENT_CONTENT_BYTES` (256 KB)
  - `web/auth.ts`: PBKDF2-HMAC-SHA-256 password verification (constant-time), in-memory session store, HttpOnly/SameSite=Strict cookies, rate limiting (5 failed attempts → 15-minute lockout)
  - `web/api/router.ts`: API dispatcher with CORS, security headers (CSP, X-Frame-Options, X-Content-Type-Options), body size guard, Content-Type enforcement
  - `web/api/agents.ts`: Full CRUD for agent files — list, get, create, update, toggle (enable/disable), rename, delete; path validation to prevent traversal attacks
  - `web/scripts/hash-password.ts`: CLI utility to generate PBKDF2 password hashes without shell history exposure
  - `web/test.ts`: API test suite with 15 test cases covering auth, CRUD, toggle, rename, delete, and path-traversal security
  - `web/public/index.html`: Login page
  - `web/public/dashboard.html`: Agent dashboard with sidebar and inline editor panel
  - `web/public/css/main.css`: Dark-theme CSS design system with CSS custom properties (583 lines)
  - `web/public/js/api.js`: Fetch wrapper (`credentials: include` on all requests)
  - `web/public/js/auth.js`: Login form, logout, and auth redirect guard
  - `web/public/js/agents.js`: Full agent management — list, select, toggle, rename, delete, create, search/filter
  - `web/public/js/editor.js`: Inline text editor with auto-resize, Tab→2-spaces, save button
- **Documentation**: Added comprehensive web app documentation
  - `docs/web-app.md` (NEW): Complete web app guide — Quick Start, setup, env vars, password management, full REST API reference (all 9 endpoints with curl examples), test suite usage, troubleshooting
  - `README.md` (UPDATED): Expanded web app section with quick reference and links
  - `docs/getting-started.md` (UPDATED): Added web app reference for administrators

### Changed
- **`.gitignore`**: Added `.github/` to exclude skills and internal tooling from commits
- **Directory Structure**: All agent workspaces moved from `.agent/` to `.agents/`
  - Updated all agent definitions and documentation
  - Updated `.gitignore` to exclude `.agents/` folder
- **Developer Agent Split**: Original Developer agent split into distinct Junior and Senior roles
  - Junior Developer: Straightforward tasks, bug fixes, smaller features
  - Senior Developer: Complex architecture, code reviews, mentoring
- **DevOps Agent**: Refactored with clearer responsibilities and simplified structure
- **All Agent Definitions**: Simplified and restructured for clarity
  - Clearer Prime Directives
  - Simplified Key Responsibilities
  - Updated communication protocols (email instead of inbox)
  - Changed reporting structure (all report to Project Manager)
- **Documentation**: All references to `.agent/` updated to `.agents/` across docs

### Removed
- **Director Agent**: Responsibilities merged into Project Manager agent
  - Project Manager is now the primary entry point and orchestrator
  - User interacts directly with Project Manager who coordinates all agents
  - All references to Director throughout documentation updated to Project Manager
- **Inbox Communication System**: Replaced by email-based communication
- `Developer.agent.md`: Split into Junior Developer and Senior Developer
- `Devops.agent.md`: Replaced by properly cased `DevOps.agent.md`
- Old agent file structures and outdated communication patterns

---

### Changed
- **Office Terminology**: All `.agent/` folders now referred to as "offices"
  - Updated all agent definitions to use "office" instead of "workspace"
  - Each agent maintains their own office (`.agent/[agent-name]/`)
  - Added office cleanup instructions to all agents
  - Project Manager instructs teams to clean up offices when work completes
  - Remove outdated files and keep only necessary artifacts
- Updated documentation to reflect office terminology

### Added
- **SVG Icon Workflow**: Designer now creates complete SVG icon sets for projects
  - Icon set development in `.agent/designer/icons/`
  - Includes favicons for web projects
  - Designer provides icon usage guides
  - Developer uses Designer's SVGs (no icon libraries)
- **Communication Guidelines**: Minimal emoji usage policy for all agents
  - Allowed: ✅ (checkmarks), ❌ (X marks), ℹ️ (info), ⚠️ (warnings), 🚫 (errors)
  - No other emojis - professional, clean communication

### Changed
- Designer agent: Added SVG icon creation workflow and best practices
- Developer agent: Added guidance on using Designer's SVG icons
- All agents: Added minimal emoji usage policy

## [0.2.0] - 2026-02-14

### Changed
- **MAJOR: Strengthened Deno-only architecture enforcement across all agents**
- Added explicit FORBIDDEN technology sections to all 12 agent definitions:
  - ❌ Node.js, npm, pnpm, bun (FORBIDDEN)
  - ❌ package.json, node_modules (FORBIDDEN)
  - ❌ JavaScript frameworks (React, Vue, Angular, etc.) (FORBIDDEN)
  - ❌ CSS frameworks (Tailwind, Bootstrap, etc.) (FORBIDDEN)
  - ❌ Build tools, bundlers, transpilers (FORBIDDEN)
- Added explicit ALLOWED technology sections to all agents:
  - ✅ Deno runtime (ONLY allowed runtime)
  - ✅ TypeScript (vanilla, pure)
  - ✅ Deno standard library
  - ✅ Web APIs
  - ✅ JSR packages (only if necessary)
- Migrated from Orbit to inbox-based communication:
  - All agents use `.agent/inbox/` for coordination
  - Simplified communication protocols
  - File-based status updates and messages

### Purpose
- Enforce pure Deno/TypeScript architecture with zero Node.js ecosystem dependencies
- Eliminate ambiguity about allowed vs forbidden technologies
- Ensure all agents operate within strict Deno-only constraints
- Prevent framework bloat and maintain vanilla TypeScript approach

## [0.1.0] - 2026-02-13

### Added
- Initial release of TOE multi-agent system
- Core agent definitions for 12 specialized roles:
  - Project Manager: Project orchestration, coordination, planning, and task management
  - Researcher: Technology investigation and best practices
  - Designer: UI/UX and system architecture design
  - Developer: Code implementation with Deno-first approach
  - QA Engineer: Targeted quality assurance and testing
  - Documentation Specialist: Technical and user documentation
  - Database Engineer: Database design and optimization
  - DevOps: Infrastructure and CI/CD pipeline management
  - Data Engineer: ETL pipelines and data processing
  - Security Engineer: Security audits and compliance
  - Marketing: Product messaging and launch coordination
- Multi-agent orchestration with handoff mechanisms
- Workspace organization system using `.agent/` directories
- Inter-agent communication via inbox system (`.agent/inbox/`)
- Comprehensive documentation:
  - Getting Started guide
  - Architecture documentation
  - Agent Reference guide
  - Examples and workflow patterns
- README with project overview and key principles
- Agent-specific coding principles and guidelines
- Quality assurance efficiency guidelines
- GitHub integration for issues and pull requests

### Principles Established
- Delegation over implementation (Project Manager as coordinator only)
- Specialized expertise per agent
- Clear handoffs between agents
- Quality and documentation as first-class concerns
- Deno-first development approach
- Targeted testing over exhaustive coverage

### Agent Capabilities
- Project Manager: Hires and coordinates all specialized agents, creates plans and manages milestones
- All agents: Access to VS Code tools, file operations, terminal execution
- Developer: GitHub integration, browser automation (Playwright)
- Project Manager: Mermaid diagram rendering, GitHub project management
- QA Engineer: Browser automation for UI testing
- All agents: Todo management and inbox-based communication

[0.2.0]: https://github.com/username/toe/releases/tag/v0.2.0
[0.1.0]: https://github.com/username/toe/releases/tag/v0.1.0
