---
name: Code Review Standards
description: Review Deno code changes for correctness, security, style, and adherence to project standards. Use this skill when providing code feedback on pull requests or changes.
---

# Code Review Standards

Use this skill when the Senior Developer (or any developer) needs to review code changes in a Deno project. This ensures consistency in quality, security, and style across the codebase.

## Code Review Checklist

Before approving a pull request or change, verify:

### 1. Functionality & Logic
- [ ] Does the code do what it's supposed to do?
- [ ] Are edge cases handled (null, empty arrays, errors)?
- [ ] Are error messages clear and actionable?
- [ ] Are there any obvious bugs or logic errors?
- [ ] Does the code follow the existing architecture?

### 2. Type Safety
- [ ] Are all functions properly typed (parameters and return types)?
- [ ] Are interfaces/types defined in `types.ts` or appropriate module?
- [ ] Are any type assertions (`as` keyword) justified with comments?
- [ ] Are there no implicit `any` types?
- [ ] Does TypeScript compilation succeed with strict mode?

### 3. Testing
- [ ] Are there tests for new functionality? (`.test.ts` files)
- [ ] Do tests cover happy path and error cases?
- [ ] Do tests pass locally? (`deno task test`)
- [ ] Is test coverage reasonable (>80% for critical code)?
- [ ] Are mock/stub patterns used correctly?

### 4. Code Style & Quality
- [ ] Does code pass `deno fmt` (formatting)?
- [ ] Does code pass `deno lint` (linting)?
- [ ] Are variable/function names clear and descriptive?
- [ ] Are magic numbers extracted to named constants?
- [ ] Is code DRY (Don't Repeat Yourself)? Any duplication to refactor?
- [ ] Are comments present for non-obvious logic?

### 5. Deno Best Practices
- [ ] Are all imports from JSR, deno.land/std, or esm.sh?
- [ ] Are no npm packages imported?
- [ ] Are permission flags used correctly (--allow-net, --allow-read)?
- [ ] Are environment variables read from `Deno.env`?
- [ ] Are there any unsafe TypeScript features used inappropriately?

### 6. Security
- [ ] Are user inputs validated and sanitized?
- [ ] Are no secrets hardcoded (check for API keys, passwords)?
- [ ] Are SQL queries parameterized (if using database)?
- [ ] Are file operations restricted to intended directories?
- [ ] Are permission flags as minimal as possible?

### 7. Performance
- [ ] Are loops optimized (no inefficient iterations)?
- [ ] Are large objects cloned unnecessarily?
- [ ] Are async operations justified?
- [ ] Are any blocking operations used in async code?
- [ ] Are expensive operations (I/O, network) handled efficiently?

### 8. Documentation
- [ ] Are complex functions documented with JSDoc comments?
- [ ] Are public APIs documented?
- [ ] Are configuration options documented?
- [ ] Is the README updated if behavior changes?
- [ ] Is the CHANGELOG updated with new features/fixes? (See `Version and Changelog Management`.)

### 9. Git & Commit Quality
- [ ] Are commit messages clear and descriptive?
- [ ] Are commits logically grouped (one feature per commit)?
- [ ] Is the branch name descriptive (e.g., `feature/auth-system`, `fix/memory-leak`)?
- [ ] Are unrelated changes separated into different commits?

## How to Conduct a Review

### Step 1: Understand the Change

Read the PR description to understand:
- What problem does this solve?
- What changed?
- Are there any known limitations?

### Step 2: Review File by File

1. Start with modified `types.ts` or interfaces
2. Review core logic files
3. Review tests
4. Review documentation changes

### Step 3: Try to Break It Mentally

Think about:
- What if the input is empty?
- What if the network is slow?
- What if the file doesn't exist?
- What if permissions are denied?

### Step 4: Check Against Checklist

Go through the checklist above and note any issues.

### Step 5: Approve or Request Changes

- **Approve** if no issues found or only minor cosmetic issues
- **Request Changes** if there are functional, security, or style issues
- **Comment** for suggestions or questions

## Providing Feedback

### Be Constructive

❌ **Bad**: "This is wrong"
✅ **Good**: "This approach could cause issues if `data` is null. Consider validating at the start of the function."

### Be Specific

❌ **Bad**: "Too complex"
✅ **Good**: "The nested if/else in this function is hard to follow. Consider extracting the validation logic to a separate helper."

### Explain the Why

❌ **Bad**: "Use const instead of let"
✅ **Good**: "Use `const` instead of `let` — this prevents accidental reassignment and makes intent clearer."

### Suggest Concrete Solutions

❌ **Bad**: "This should be better"
✅ **Good**: "Consider using a `Set` here instead of an array for O(1) lookup: `const seen = new Set<string>();`"

## Example Review Comments

### Functionality Issue
```
Line 42: If `user` is null, this will throw. Consider:

if (!user) {
  throw new Error("User not found");
}

const email = user.email;
```

### Type Safety Issue
```
Line 18: This function returns `object | null`, but callers might not handle null.
Consider making it either:
- Return an empty object: `return {};`
- Or change return type to explicitly document null: `Promise<Result | null>`
```

### Testing Gap
```
Missing test case: What happens if the array is empty?

```typescript
Deno.test("processItems handles empty array", () => {
  const result = processItems([]);
  assertEquals(result, []);
});
```
```

### Security Issue
```
Line 35: This SQL query is vulnerable to injection:

// ❌ Bad
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Better (with prepared statements)
const query = "SELECT * FROM users WHERE id = $1";
const result = await db.query(query, [userId]);
```

### Performance Issue
```
Line 56: This creates a new array copy on every iteration.
Consider building once instead:

// ❌ Bad (copies array N times)
items.forEach(item => {
  const sorted = items.sort(); // Creates new array each time!
  process(sorted);
});

// ✅ Good (sort once)
const sorted = items.sort();
items.forEach(item => process(sorted));
```

## Common Deno Issues to Watch For

1. **Accidental npm imports**: `import { something } from "npm:package"` in production code
2. **Permissions too loose**: `--allow-all` instead of specific permissions
3. **Missing type annotations**: Functions without parameter/return types
4. **Uncaught promise rejections**: Missing `.catch()` or `await` without try/catch
5. **Hardcoded paths**: Using absolute paths instead of `Deno.mainModule` or relative imports
6. **Missing CHANGELOG**: Features added without updating version/changelog
7. **Incomplete tests**: New code without corresponding test files

## Approval Levels

### Approve (Ready to Merge)
- All checklist items pass
- No blocking issues
- Style is consistent

### Request Changes (Before Merge)
- Functional bugs
- Security issues
- Missing required tests
- Violates architecture decisions

### Comment Only (FYI, Not Blocking)
- Minor style suggestions
- Questions about approach
- "Nice to have" optimizations

## Reference Standards

- [Deno Manual](https://docs.deno.com/)
- [Deno Style Guide](https://docs.deno.com/runtime/fundamentals/security/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Clean Code Principles](https://en.wikipedia.org/wiki/Code_smell)

## Constraints

- Do NOT approve code that doesn't pass `deno lint` and `deno fmt`
- Do NOT merge pull requests without evidence tests pass
- Do NOT approve code with hardcoded secrets or credentials
- Do NOT accept pull requests that import from npm packages (unless explicitly approved)
- Do NOT merge to `main` without at least one approval (team policy)
