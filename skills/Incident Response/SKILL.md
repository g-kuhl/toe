---
name: Incident Response
description: Handle production incidents systematically from detection through resolution and post-mortem. Use this skill when a live system is down, degraded, or behaving unexpectedly in production.
---

# Incident Response

Use this skill when a production system is down, degraded, or behaving unexpectedly. Incidents require fast, coordinated action — this skill keeps you focused and methodical under pressure.

## Severity Levels

Classify the incident immediately. Severity drives urgency and who gets notified.

| Severity | Definition | Response Time |
|---|---|---|
| **SEV-1** | Full outage. System is completely unavailable or data loss is occurring | Immediate — drop everything |
| **SEV-2** | Major degradation. Core feature broken for most users, workaround unavailable | Within 15 minutes |
| **SEV-3** | Partial degradation. Non-critical feature broken or issue affects small subset of users | Within 1 hour |
| **SEV-4** | Minor issue. Cosmetic problem, edge case failure, or minor inconvenience | Next business day |

## Phase 1: Detect & Classify (First 5 Minutes)

1. **Confirm the incident is real** — rule out local issues, stale cache, or test data
2. **Assess impact** — how many users affected? What functionality is broken?
3. **Assign severity** using the table above
4. **Notify stakeholders** — use the `Write Email` skill to alert the Project Manager immediately with:
   - What is broken
   - Severity level
   - Who is responding
   - Next update time

Do NOT spend time diagnosing before notifying. Stakeholders need to know something is happening.

## Phase 2: Triage & Stabilize

The goal is to **stop the bleeding**, not to understand the root cause.

### Check These First (in order)

1. **Recent deployments** — was anything deployed in the last hour?
   - If yes: consider an immediate rollback before investigating
2. **Infrastructure** — are servers running? Is the database reachable? Is disk space full?
3. **External dependencies** — is a third-party API or service down?
4. **Logs** — scan recent error logs for repeated failures or new error patterns
5. **Configuration** — were any environment variables or config files changed recently?

### Stabilization Actions

- **Rollback** if a recent deployment is likely the cause (fastest path to recovery)
- **Restart** the service if it appears stuck or deadlocked (document why you restarted)
- **Disable** a specific feature or endpoint if it's causing cascading failures
- **Scale up** if the issue is resource exhaustion (CPU, memory, connections)

Always prefer a fast, reversible fix over a slow, "correct" fix during an active incident.

## Phase 3: Root Cause Investigation

Only begin deep investigation once the system is stable or the impact is contained.

1. Gather evidence: error logs, metrics, traces, recent code changes, config diffs
2. Form a hypothesis — what single change or condition could explain the observed behavior?
3. Test the hypothesis against the evidence without making changes to production
4. Narrow to root cause: the specific code path, config value, or external factor

Use the `Debugging` skill for application-level bugs found during investigation.

## Phase 4: Fix & Verify

1. Apply the permanent fix (not just a stopgap) in a non-production environment first
2. Verify the fix resolves the issue in testing
3. Deploy to production following the normal deployment process (do not skip reviews under pressure)
4. Monitor for 15–30 minutes after the fix to confirm stability
5. Declare the incident resolved and notify stakeholders via `Write Email`

## Phase 5: Post-Mortem

Write a post-mortem within 24 hours of resolution. Save it to `.agents/office/devops/incidents/` or `.agents/office/security/incidents/` as appropriate.

### Post-Mortem Template

```markdown
# Incident Post-Mortem: <Short Title>

**Date:** <Incident date>
**Severity:** SEV-1 / SEV-2 / SEV-3
**Duration:** <Start time> → <End time> (<total duration>)
**Author:** <Your agent name>

---

## Summary

2–3 sentence summary of what happened, why, and how it was resolved.

---

## Timeline

| Time | Event |
|---|---|
| HH:MM | Incident detected |
| HH:MM | Severity classified, PM notified |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Incident resolved |

---

## Root Cause

What was the underlying cause? Be specific — name the file, config value, or condition.

---

## Contributing Factors

What made this incident worse or harder to detect?

- Factor 1
- Factor 2

---

## Impact

- Users affected: estimate
- Features affected: list
- Duration: X minutes / hours

---

## Resolution

What was done to resolve the incident?

---

## Action Items

Concrete steps to prevent recurrence. Each item must have an owner.

| Action | Owner | Status |
|---|---|---|
| Add monitoring alert for X | DevOps | Pending |
| Fix bug in users.ts line 42 | Senior Developer | Pending |
| Add test for edge case Y | QA Engineer | Pending |

---

## Lessons Learned

What did we learn? What went well? What was hard?
```

## Communication Guidelines

- **Over-communicate** during an incident — silence creates panic
- Send updates every **15–30 minutes** even if there's no new information ("Still investigating, no ETA yet")
- Keep messages **factual and calm** — avoid speculation or blame in stakeholder updates
- After resolution, send a clear "All Clear" notification with a brief summary

## Constraints

- Do NOT make multiple production changes simultaneously — isolate each change
- Do NOT skip the post-mortem — even SEV-3 incidents have lessons
- Do NOT assign blame in post-mortems — focus on systems and processes, not individuals
- Do NOT close an incident until monitoring confirms stability for at least 15 minutes
