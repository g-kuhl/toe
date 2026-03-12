---
name: Technical Specification
description: Write a technical specification (tech spec) before implementing a feature or system. Use this skill when a task is complex enough that coding without a plan risks wasted effort or misaligned output.
---

# Technical Specification

Use this skill when a feature, change, or system is complex enough to warrant writing before building. A good spec prevents rework, aligns the team, and forces you to think through problems before they become bugs.

**When to write a spec:**
- The feature touches multiple files or modules
- The approach isn't immediately obvious
- Other agents or team members will be affected by the design
- The task has significant edge cases or tradeoffs

**When you can skip the spec:**
- A single-function bug fix with a clear cause
- Straightforward copy of an existing pattern
- A change that only affects one file and has no side effects

## Spec Location

Save specs to the requesting agent's office directory:

```
.agents/<agent_office>/specs/<feature-name>.md
```

For example:
```
.agents/senior_developer/specs/user-authentication.md
.agents/architect/specs/caching-layer.md
```

## Spec Format

Use this structure for every spec:

```markdown
# Spec: <Feature or Change Name>

**Author:** <Your agent name>
**Date:** <Today's date>
**Status:** Draft | In Review | Approved | Superseded

---

## Problem Statement

What problem does this solve? Who is affected? Why does it need to be solved now?
Write 2–4 sentences. Be specific — avoid vague descriptions like "improve performance."

---

## Goals

What this spec is trying to achieve. Use a short bulleted list.

- Goal 1
- Goal 2
- Goal 3

## Non-Goals

What this spec explicitly does NOT address. This prevents scope creep.

- Not goal 1
- Not goal 2

---

## Background & Context

Any context needed to understand the problem: relevant existing code, past decisions,
external constraints, or related issues. Keep it brief — link to files rather than
copy/pasting large code blocks.

---

## Proposed Solution

Describe the implementation approach clearly enough that a developer could build it
from this description alone.

Include:
- Key data structures, interfaces, or types
- High-level control flow or sequence of operations
- Module/file structure if new files are created
- Key algorithms or logic (pseudocode is fine)
- Any external dependencies (new imports, APIs, environment variables)

Use code blocks for type definitions and pseudocode:

```typescript
interface UserSession {
  userId: string;
  token: string;
  expiresAt: Date;
}
```

---

## Alternatives Considered

List at least one alternative approach and explain why it was not chosen.

### Alternative 1: <Name>
**Approach:** Brief description.
**Rejected because:** Reason.

### Alternative 2: <Name>
**Approach:** Brief description.
**Rejected because:** Reason.

---

## Edge Cases & Risks

| Scenario | How it's handled |
|---|---|
| Input is null or empty | ... |
| Network request fails | ... |
| Concurrent requests | ... |
| Large dataset | ... |

Add any security, performance, or reliability risks and how they are mitigated.

---

## Testing Plan

How will this be verified?

- Unit tests: which functions need tests, what cases to cover
- Integration tests: which flows to exercise end-to-end
- Manual verification steps (if automated testing isn't sufficient)

---

## Open Questions

List unresolved questions that need answers before or during implementation.

- [ ] Question 1 — who can answer this?
- [ ] Question 2
```

## Writing Guidelines

- **Write for the reader, not yourself.** Assume the reader knows the codebase but not your reasoning.
- **Be concrete.** Vague specs produce vague implementations. Show type definitions, file paths, and examples.
- **State tradeoffs.** If you chose simplicity over performance, say so.
- **Keep it proportional.** A two-file change needs half a page. A new subsystem needs three pages. Never longer than needed.
- **Update the spec if the implementation diverges.** The spec is a living document, not a historical artifact.

## After the Spec is Written

1. Share the spec with the Project Manager and relevant agents for review
2. Incorporate feedback and update status to `In Review` then `Approved`
3. Begin implementation only after the spec is approved (or explicitly waived by the PM)
4. After implementation, mark the spec `Approved` and note any deviations from the plan

## Constraints

- Do NOT begin coding a complex feature without at least a draft spec
- Do NOT write specs for trivial changes — specs have overhead, use judgment
- Do NOT let a spec become a substitute for communication — discuss ambiguities with the team
