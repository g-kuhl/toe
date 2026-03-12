---
name: Create Office
description: Create a new office space for a team or project.
---
All agent work should be organized under `.agents/office/`. To create an office, create a new folder in `.agents/office/`. All workspaces and related files live inside it.

Workspaces can be created within the office using the `Create Workspace` skill. Workspaces are where agents do their actual work. Do not work directly in the office root.

Office Structure:

`.agents/office/` contains a `team-roster.md` file with information about team members and roles. Each workspace is a subfolder named after the agent.

`.agents/office/email/` contains all email communication between team members. Each inbox is a subfolder named after the recipient, and each email is dated.

`.agents/office/email/archive/` contains archived emails that have been read and summarized.

`.agents/office/tasks/` contains delegated work and sprint tracking files such as `sprint-[number].md`.

`.agents/office/cleanup-summary.md` summarizes what was removed and what was preserved during cleanup.