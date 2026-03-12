---
name: Memory
description: Teaches agents how to create and maintain a memory.md file in their workspace to capture decisions, findings, and task state across sessions. Use this skill when onboarding a new agent or when an agent needs to establish persistent memory for their work.
---

# Memory Skill

## Overview

Your `memory.md` file is your personal, living notebook. It lives in your workspace at `.agents/office/<your-name>/memory.md`. You own it, you update it, and you read it at the start of every session to quickly re-orient yourself.

Without it, context is lost between sessions. With it, you hit the ground running every time.

---

## When to Read Your Memory

- **At the start of every session** — before doing anything else, read your `memory.md` to recall where you left off, what decisions were made, and what is pending.

---

## When to Update Your Memory

Update your `memory.md`:

- **Before wrapping up a session** — summarize what was done, what is pending, and any blockers.
- **When making a key decision** — record the decision and the reasoning behind it.
- **When discovering something important** — a constraint, a dependency, a requirement, a fact that will matter later.
- **When completing a task** — mark it done and note any follow-up items.
- **When receiving instructions that affect your future work** — capture them so they are not forgotten.

---

## How to Structure Your Memory File

Use clear, dated sections. Keep entries concise — bullet points are preferred. The goal is fast re-orientation, not exhaustive prose.

**Sections to maintain:**

- **Status** — What is your current task or focus? What is blocked or pending?
- **Decisions** — Key decisions made, with brief reasoning.
- **Findings** — Important facts, constraints, or discoveries.
- **Task Log** — Completed tasks with dates.
- **References** — Paths, links, or file names you frequently need.
- **Notes** — Anything else worth remembering.

---

## How to Create Your Memory File

On your first day, copy the template below into `.agents/office/<your-name>/memory.md`. Replace placeholder text with your own details. Update it throughout your work.

---

## Template

```markdown
# Memory — <Your Name>

## Status
- **Current focus**: <What are you working on right now?>
- **Pending**: <What is waiting or blocked?>
- **Last updated**: <YYYY-MM-DD>

## Decisions
- [YYYY-MM-DD] <Decision made> — <Brief reason>

## Findings
- [YYYY-MM-DD] <Important fact, constraint, or discovery>

## Task Log
- [YYYY-MM-DD] ✅ <Completed task description>

## References
- Office directory: `.agents/office/`
- My workspace: `.agents/office/<your-name>/`
- Team roster: `.agents/office/team-roster.md`

## Notes
- <Any other context worth remembering>
```

---

## Best Practices

- **Keep it short and scannable.** Long prose is hard to skim at session start. Use bullets.
- **Date every entry.** You will thank yourself later.
- **Update status every session.** The Status section is your north star.
- **Do not delete old entries** — move outdated ones to a `## Archive` section at the bottom if they clutter the file.
- **Treat it as essential, not optional.** Memory is how you maintain continuity and avoid repeating work.
