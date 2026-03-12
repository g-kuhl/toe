---
name: Version and Changelog Management
description: Maintain semantic versioning, update the VERSION file, and manage CHANGELOG.md using Keep a Changelog format. Use this before every release.
---

# Version and Changelog Management

Use this skill when preparing to release a new version of a Deno project. Follow these steps to maintain consistency with semantic versioning and Keep a Changelog standards.

## Understanding Semantic Versioning

Semantic versioning uses the format: `MAJOR.MINOR.PATCH`

- **MAJOR** (e.g., 2.0.0) — Breaking changes, incompatible API changes, removed features
- **MINOR** (e.g., 1.1.0) — New features added in a backward-compatible manner
- **PATCH** (e.g., 1.0.1) — Bug fixes, security patches, backward-compatible fixes

**Examples**:
- 1.0.0 → 1.0.1 (bug fix)
- 1.0.0 → 1.1.0 (new feature, backward compatible)
- 1.0.0 → 2.0.0 (breaking change)

## Step 1: Determine the Version Bump

Review the changes since the last release and determine which version number to increment:

1. Did you make **breaking changes** (API incompatible, removed features)? → Bump **MAJOR**
2. Did you add **new features** (backward compatible)? → Bump **MINOR**
3. Did you only **fix bugs or security issues**? → Bump **PATCH**

If unsure, consult the commit log or use `git log <last-tag>..HEAD` to review all changes.

## Step 2: Update the VERSION File

The `VERSION` file contains a single line with the new version number.

1. Read the current VERSION:
   ```bash
   cat VERSION
   ```

2. Update it with the new version:
   ```bash
   echo "1.1.0" > VERSION
   ```

3. Verify the change:
   ```bash
   cat VERSION
   ```

## Step 3: Update CHANGELOG.md

Every release must have an entry in `CHANGELOG.md` following the Keep a Changelog format.

### CHANGELOG Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Features that are in development

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security vulnerability fixes

## [1.1.0] - 2026-03-12

### Added
- New feature description
- Another new feature

### Changed
- Updated existing behavior

### Fixed
- Fixed bug description

### Security
- Fixed security vulnerability

## [1.0.0] - 2026-02-15

### Added
- Initial release
```

### Steps to Update CHANGELOG.md

1. **Before Release**: During development, add entries to the `[Unreleased]` section:
   ```markdown
   ## [Unreleased]

   ### Added
   - Support for WebSocket connections
   - New testing utilities

   ### Fixed
   - Memory leak in request handler
   ```

2. **At Release Time**: Move `[Unreleased]` items to a new version section:
   - Replace `## [Unreleased]` with `## [1.1.0] - 2026-03-12` (use today's date in YYYY-MM-DD format)
   - Create a fresh `## [Unreleased]` section above it
   - Keep only the categories that have content (remove empty sections)

3. **Example before release**:
   ```markdown
   # Changelog

   ## [Unreleased]

   ### Added
   - WebSocket support
   - Logging utilities

   ### Fixed
   - Connection timeout bug

   ## [1.0.0] - 2026-02-15
   ...
   ```

4. **Example after release**:
   ```markdown
   # Changelog

   ## [Unreleased]

   ### Added

   ### Changed

   ### Fixed

   ## [1.1.0] - 2026-03-12

   ### Added
   - WebSocket support
   - Logging utilities

   ### Fixed
   - Connection timeout bug

   ## [1.0.0] - 2026-02-15
   ...
   ```

## Step 4: Create a Git Tag

After updating VERSION and CHANGELOG.md, commit and tag the release:

```bash
git add VERSION CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"
git tag -a v1.1.0 -m "Release version 1.1.0"
```

**Tag naming convention**: Always prefix with `v` (e.g., `v1.1.0`, `v2.0.0`)

## Step 5: Push Changes and Tags

Push the commit and tag to the remote repository:

```bash
git push origin main
git push origin v1.1.0
```

Or if you want to push all tags at once:

```bash
git push origin main --tags
```

## When to Update Changelog

- **Every feature**: When adding a new feature, add it to `[Unreleased] -> Added`
- **Every bug fix**: When fixing a bug, add it to `[Unreleased] -> Fixed`
- **Breaking changes**: When making breaking changes, add to `[Unreleased] -> Removed` or `Changed` and bump MAJOR
- **Security patches**: When fixing security vulnerabilities, add to `[Unreleased] -> Security` and bump at least PATCH
- **Before release**: Move all `[Unreleased]` items to a dated version section

## Best Practices

1. **Be descriptive**: Write clear, user-facing descriptions in the changelog. Don't just copy commit messages.
2. **Include issue references**: If applicable, reference GitHub issues (e.g., "Fixed crash (#42)")
3. **Group by type**: Keep Added, Changed, Fixed, etc. categories separate
4. **One file per release**: Don't maintain separate changelog files for each version
5. **Date format**: Always use YYYY-MM-DD format for release dates (e.g., 2026-03-12)
6. **User-focused**: Write changelog entries for end users and developers, not internal commit details

## Example Changelog Entry

```markdown
## [2.1.0] - 2026-03-12

### Added
- Support for environment variable interpolation in config files (#128)
- New `--dry-run` flag for preview mode

### Changed
- Improved error messages for configuration validation
- Updated TypeScript version to 5.0.2

### Deprecated
- The `--legacy-mode` flag is now deprecated and will be removed in v3.0.0

### Removed
- Dropped support for Deno versions below 1.40.0

### Fixed
- Fixed race condition in concurrent file processing (#125)
- Memory leak in connection pooling (#130)

### Security
- Patched timing attack vulnerability in password comparison (#131)
```

## Reference

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

## Constraints

- Do NOT manually edit version numbers in `deno.json`; always use the `VERSION` file as the source of truth
- Do NOT create new CHANGELOG files; maintain a single `CHANGELOG.md` in the project root
- Do NOT commit code changes in the same commit as version bumps; separate concerns clearly
- Do NOT use pre-release versions (like 1.0.0-alpha) unless your project explicitly uses them
