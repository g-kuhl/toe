---
name: Debugging
description: Systematically diagnose and fix bugs in Deno/TypeScript applications using structured debugging techniques. Use this skill when an error is not immediately obvious from reading the code.
---

# Debugging

Use this skill when a bug is not immediately obvious from reading the code. Follow a structured process to isolate, reproduce, and fix the issue rather than guessing.

## Step 1: Reproduce the Bug Reliably

Before debugging, confirm you can reproduce the bug consistently:

1. Identify the exact input, environment, or sequence of steps that triggers it
2. Reduce the reproduction case to the smallest possible scenario
3. If you cannot reproduce it, stop and gather more information (logs, environment details, user reports)

A bug you can reproduce is 80% solved.

## Step 2: Read the Error Carefully

When an error is thrown, extract all available information:

- **Error type** — `TypeError`, `RangeError`, `SyntaxError`, etc.
- **Message** — read the full message, not just the first word
- **Stack trace** — identify the file and line where the error originates vs. where it was called from
- **Deno-specific context** — permission errors (`PermissionDenied`), import resolution failures, or runtime panics have distinct messages

```
TypeError: Cannot read properties of undefined (reading 'name')
    at getUser (file:///app/users.ts:42:18)
    at handler (file:///app/server.ts:15:22)
```

Here the root cause is at `users.ts:42`, triggered from `server.ts:15`.

## Step 3: Add Targeted Logging

Add `console.log` or `console.error` at the point of failure to inspect actual values:

```typescript
// Before the failing line
console.log("user value:", user);
console.log("user type:", typeof user);

const name = user.name; // failing line
```

Use `console.trace()` to print a stack trace at any point without throwing:

```typescript
console.trace("Reached checkpoint A");
```

Use `JSON.stringify` with indent for objects:

```typescript
console.log(JSON.stringify(data, null, 2));
```

Remove debug logs before committing.

## Step 4: Use the Deno Inspector (For Complex Bugs)

For bugs that logging alone can't reveal, use Deno's built-in V8 inspector:

```bash
deno run --inspect-brk --allow-all main.ts
```

Then open **Chrome** and navigate to `chrome://inspect`. Click "inspect" under Remote Target.

In the DevTools debugger you can:
- Set breakpoints by clicking line numbers
- Step through code with F10 (step over) and F11 (step into)
- Inspect variable values in the Scope panel
- Watch expressions
- View the full call stack

`--inspect-brk` pauses execution at the first line. Use `--inspect` (without `-brk`) to attach without pausing.

## Step 5: Isolate the Problem

Narrow the problem space using binary search:

1. Comment out half the suspect code — does the bug still occur?
2. Replace complex logic with hardcoded values — does the bug still occur?
3. Test individual functions in isolation with `deno eval` or a scratch test file:

```bash
deno eval "
import { myFunction } from './src/utils.ts';
console.log(myFunction('test input'));
"
```

## Step 6: Check Common Deno Pitfalls

Before assuming complex bugs, check these first:

| Symptom | Likely cause |
|---|---|
| `PermissionDenied` | Missing `--allow-net`, `--allow-read`, `--allow-env`, etc. |
| Module not found | Wrong import path, missing file extension (`.ts` required) |
| `undefined` instead of data | Async function not `await`ed |
| Stale behavior after code change | Deno cache — run with `--reload` |
| Type errors at runtime | `any` cast hiding a type mismatch |
| Works locally, fails in CI | Environment variable not set, different Deno version |

Reload cache when imports behave unexpectedly:

```bash
deno run --reload main.ts
```

## Step 7: Fix and Verify

Once you understand the root cause:

1. Make the minimal change that fixes the root cause (not just the symptom)
2. Re-run the reproduction case — confirm the bug is gone
3. Run the full test suite: `deno task test`
4. Check for related code that may have the same bug (search the codebase)

## Step 8: Prevent Recurrence

After fixing:

1. Write a test that would have caught this bug
2. If the bug was caused by a missing type check, add explicit types
3. If the bug was an edge case (null, empty array, zero), add a guard at the boundary

## Constraints

- Do NOT ship `console.log` debug statements
- Do NOT use `as any` to silence a type error as a "fix" — find the real type
- Do NOT fix only the symptom without understanding the root cause
- If a bug takes more than 30 minutes to isolate, step back and re-read the error from scratch — fresh eyes often reveal the obvious
