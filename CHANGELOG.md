# Changelog

All notable changes to the TOE (Team of Experts) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - v2.0.0

### Added
- **API Designer Agent**: New specialized agent for designing API contracts, OpenAPI specifications, and REST/GraphQL standards
- **Janitor Agent**: Organizes workspaces and verifies cleanup after task completion
- **Morpheus Agent**: Creates custom agent skills and side-loads them into projects
- **Junior Developer Agent**: Handles straightforward coding tasks and bug fixes
- **Senior Developer Agent**: Handles complex architecture and code reviews
- **Email Communication System**: Agents now use `.agents/office/email/` for async communication
  - Email format: `to-[name]-from-[yourname].email`
  - Replaces the previous inbox system
- **Skills Directory** (`.agents/skills/`): New centralized location for reusable agent skills
  - Archive Email
  - Code Review Standards
  - Create Office
  - Create Workspace
  - Debugging
  - Deno Server Scaffold
  - Deno Web App Scaffold
  - Hire Team Member
  - Incident Response
  - Memory
  - Read Email
  - Teach
  - Technical Specification
  - Version and Changelog Management
  - Write Email
- **Debugging Skill**: Structured debugging process for Deno/TypeScript applications
- **Incident Response Skill**: Handles production incidents from detection through post-mortem
- **Memory Skill**: Teaches agents to maintain memory.md files for persistent context across sessions
- **Technical Specification Skill**: Writing tech specs before implementing complex features
- **Morpheus Agent Enhancements**:
  - Built-In Skills Catalog with pre-built skills available for deployment in projects
  - Simplified skill creation workflow using the `Teach` skill for standardized procedures
- **Project Manager Agent Comprehensive Overhaul**:
  - Added workflow and stopping rules for proper project coordination
  - Office and workspace management using dedicated skills
  - Team roster tracking (`.agents/team-roster.md`)
  - Expert roster table with all available agent specializations and engagement criteria
  - Clear guidelines for hiring, assigning, and managing team members
- **Documentation**: Added comprehensive web app documentation
  - `docs/web-app.md` (NEW): Complete web app guide — Quick Start, setup, env vars, password management, full REST API reference (all 9 endpoints with curl examples), test suite usage, troubleshooting
  - `README.md` (UPDATED): Expanded web app section with quick reference and links
  - `docs/getting-started.md` (UPDATED): Added web app reference for administrators

### Changed
- **Agent and Skill Path Standardization**: Updated active agent and skill guidance to consistently use `.agents/office/<agent-name>/` workspaces and `.agents/office/email/` inboxes.
- **Agent Instruction Condensation**: Reduced repeated communication boilerplate, removed dead commented instruction blocks, and simplified duplicated skill-creation guidance for lower context overhead.
- **`.gitignore`**: Added `.github/` to exclude skills and internal tooling from commits
- **Directory Structure**: 
  - All agent workspaces moved from `.agent/` to `.agents/`
  - Updated all agent definitions and documentation
  - Updated `.gitignore` to exclude `.agents/` folder
  - Skills location updated from `.github/skills/` to `.agents/skills/`
- **Developer Agent Split**: Original Developer agent split into distinct Junior and Senior roles
  - Junior Developer: Straightforward tasks, bug fixes, smaller features
  - Senior Developer: Complex architecture, code reviews, mentoring
- **Technology Stack & Standards** (new section in both Junior and Senior Developer agents):
  - Enforces Deno-only for server-side JavaScript
  - Mandates vanilla JavaScript/TypeScript on front-end (no frameworks)
  - Prohibits Node.js, npm, Bun, CDNs, and heavy frameworks
  - Establishes dependency priority: Deno stdlib → JSR → NPM (last resort, via Deno)
  - Junior Developer: Added priority for vanilla code to Guidelines
  - Senior Developer: Added enforcement of technology standards and mentoring on Deno best practices to Guidelines
- **Hire Team Member Skill**: Updated to include Memory skill training on day one for new hires
- **Morpheus Agent**:
  - Refactored skill creation process to use the `Teach` skill for consistency
  - Updated skill directory naming convention (human-readable names instead of kebab-case)
  - Added Built-In Skills Catalog documenting pre-built skills for rapid deployment
- **Project Manager Agent**: Major restructure for improved project coordination
  - Added explicit workflow steps (planning, hiring, assigning, reviewing)
  - Added office and workspace management integration
  - Introduced team roster tracking and regular team reviews
  - Added expert roster table mapping team member roles to engagement criteria
  - Replaced inline instructions with structured constraint sections (STOPPING_RULES, workflow, office, workspace, onboarding, team_roster, EXPERTS)
- **DevOps Agent**: Refactored with clearer responsibilities and simplified structure
- **All Agent Definitions**: Simplified and restructured for clarity
  - Clearer Prime Directives
  - Simplified Key Responsibilities
  - Updated communication protocols (email instead of inbox)
  - Changed reporting structure (all report to Project Manager)
- **Documentation**: All references to `.agent/` updated to `.agents/` across docs

### Removed
- **Deprecated Frontmatter**: Removed deprecated `user-invokable` from active `*.agent.md` files.
- **web/ directory**: Entire web app and all supporting files deleted
  - Removed server infrastructure (server.ts, config.ts, auth.ts, router.ts)
  - Removed frontend assets (HTML, CSS, JavaScript files)
  - Removed API endpoints and authentication system
  - Removed test suite (web/test.ts) and password hashing utility
- **docs/ directory**: Documentation files removed
  - agent-reference.md
  - architecture.md
  - examples.md
  - getting-started.md
  - web-app.md

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
