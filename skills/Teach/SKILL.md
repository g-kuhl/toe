---
name: Teach
description: Side-load new skills into a project by creating SKILL.md files in .agents/skills/ so that agents can dynamically acquire capabilities they don't yet have.
---

# Teach — Side-Loading New Skills

Use this skill when an agent (or the Project Manager) needs a capability that doesn't already exist in the project's skill set. Morpheus will design the skill, write the SKILL.md file, and place it in the correct location so any agent can discover and use it immediately.

## Target Location

All project-level skills are stored in:

```
.agents/skills/<Skill Name>/SKILL.md
```

Each skill lives in its own directory. The directory name should be human-readable and describe the skill's purpose (e.g., `Code Review`, `Database Migration`, `API Testing`).

A skill directory can contain more than just the SKILL.md file. You can include **supporting assets** — scripts, templates, example files, configuration snippets, or any other resources the skill needs. These assets live alongside the SKILL.md in the same directory:

```
.agents/skills/<Skill Name>/
├── SKILL.md              # Required — the skill instructions
├── setup.sh              # Optional — a helper script
├── template.md           # Optional — a reusable template
├── examples/             # Optional — example files or reference material
│   ├── good-example.md
│   └── bad-example.md
└── config.json           # Optional — default configuration
```

The SKILL.md file is the only required file. Everything else is optional and driven by what the skill needs to be effective.

## Before Creating a New Skill

1. **Check for duplicates.** Search `.agents/skills/` to see if a skill already exists that covers the requested capability. If one exists, consider updating it instead of creating a new one.
2. **Clarify the need.** Confirm the following with the requester:
   - What problem or task does this skill address?
   - Which agent role(s) will use it?
   - What specific steps, tools, or conventions should the skill encode?
   - Are there any project-specific constraints or patterns to follow?
3. **Scope the skill.** A good skill is focused on one coherent capability. If the request is too broad, break it into multiple skills.

## Creating the Skill

### Step 1: Create the Skill Directory

Create a new directory under `.agents/skills/` named after the skill:

```
.agents/skills/<Skill Name>/
```

### Step 2: Create Supporting Assets (If Needed)

Before writing the SKILL.md, consider whether the skill benefits from supporting files:

- **Scripts** (`.sh`, `.py`, `.js`, etc.) — Automate repetitive steps the skill describes. For example, a "Database Migration" skill might include a `migrate.sh` script that agents can execute.
- **Templates** — Provide starter files that agents fill in. For example, a "Write Proposal" skill might include a `proposal-template.md`.
- **Examples** — Show concrete before/after samples, reference implementations, or known-good outputs. Place these in an `examples/` subdirectory if there are several.
- **Configuration files** — Default configs, linter rules, or schema definitions the skill relies on.

Create these files in the skill directory alongside the SKILL.md. Name them clearly so their purpose is obvious.

### Step 3: Write the SKILL.md File

Every skill must have a `SKILL.md` file with YAML frontmatter and a Markdown body. Follow this structure:

```markdown
---
name: <Skill Name>
description: <One-line summary of what the skill does and when to use it.>
---

<Body: Clear, actionable instructions that an agent can follow to perform the skill. Include step-by-step procedures, conventions, file paths, examples, and any guardrails or constraints.>
```

### Writing Guidelines

- **Be direct and actionable.** Write instructions as if you are telling the agent exactly what to do, not explaining a concept. Agents will follow these instructions literally.
- **Reference concrete paths.** Use relative paths from the project root (e.g., `.agents/office/`, `src/`, `tests/`). Never use absolute paths.
- **Include file naming conventions** when the skill involves creating files (extensions, date formats, naming patterns).
- **Specify boundaries.** State what the skill should and should NOT be used for so agents don't misapply it.
- **Keep it self-contained.** The SKILL.md should contain everything an agent needs. If the skill depends on another skill, reference it by name (e.g., "Use the `Write Email` skill to notify the team").
- **Reference supporting assets by relative path.** When the skill includes scripts, templates, or examples, reference them from the SKILL.md using paths relative to the skill directory (e.g., "Run the `./setup.sh` script" or "Use the template at `./proposal-template.md`"). This keeps the skill portable.
- **Match the voice and style** of the existing skills in the project. Keep instructions concise and imperative.

### Step 4: Validate the Skill

Before considering the skill complete:

1. Re-read the SKILL.md and confirm it answers: *If an agent loaded only this file, could it perform the skill without asking follow-up questions?*
2. Verify the directory and file are in the correct location: `.agents/skills/<Skill Name>/SKILL.md`
3. Confirm the YAML frontmatter `name` matches the directory name.
4. Check that no existing skill already covers the same ground.
5. If the skill includes supporting assets, verify that every file referenced in the SKILL.md actually exists in the skill directory and that the relative paths are correct.

### Step 5: Notify the Team

After creating the skill:

1. Inform the Project Manager (via the `Write Email` skill or direct communication) that a new skill is available, including its name, purpose, and which roles should use it.
2. If the skill was created for a specific agent being hired, ensure the `Hire Team Member` skill workflow includes training the new hire on this skill.

## Updating an Existing Skill

If a skill exists but needs enhancement:

1. Read the current `.agents/skills/<Skill Name>/SKILL.md`.
2. Make targeted edits — preserve what works, add what's missing.
3. Do not change the `name` in the frontmatter unless the skill's purpose has fundamentally changed.
4. Notify affected agents of the update.

## Example: Creating a "Code Review" Skill

Directory structure:

```
.agents/skills/Code Review/
├── SKILL.md
├── checklist.md
└── examples/
    ├── good-review.md
    └── bad-review.md
```

`SKILL.md`:

```markdown
---
name: Code Review
description: Review code changes for correctness, style, and potential issues before merging.
---

When asked to review code, follow these steps:

1) Read the diff or changed files carefully. Focus on logic errors, security issues, and deviations from project conventions.
2) Use the checklist at `./checklist.md` to ensure you cover all required review areas.
3) Check that new code has appropriate test coverage. If tests are missing, flag this in your review.
4) Verify naming conventions and code style match the rest of the codebase.
5) Write your review feedback in a structured format:
   - **Summary**: One-line overall assessment.
   - **Issues**: List of problems found, with file paths and line references.
   - **Suggestions**: Optional improvements that aren't blocking.
6) Refer to `./examples/good-review.md` for the expected tone and depth of a review.
7) Save your review to your workspace and notify the author via the `Write Email` skill.
```

`checklist.md`:

```markdown
# Code Review Checklist
- [ ] Logic correctness
- [ ] Error handling
- [ ] Security implications
- [ ] Test coverage
- [ ] Naming conventions
- [ ] Documentation updated
- [ ] No hardcoded secrets or credentials
```

## Key Principles

- **Skills are the unit of capability.** Every distinct thing an agent should know how to do is a skill.
- **Skills are portable.** They travel with the project. When the team deploys to a new project, relevant skills can be copied into the new `.agents/skills/` directory.
- **Skills evolve.** Start minimal, then refine based on how agents use them. A short, clear skill is better than a long, vague one.
- **One skill, one purpose.** Avoid skills that try to do too many things. Compose multiple focused skills instead.
