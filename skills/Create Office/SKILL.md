---
name: Create Office
description: Create a new office space for a team or project.
---
All agent work should be done in the office. To create an office, create a new folder in `./agents/office/`. All workspaces and other related files will be created in this folder. 

Workspaces can be created withing the office using the `Create Workspace` skill. Workspaces are where agents will work from. Never in the office directly. The office is for organizing workspaces and other related files.

Office Structure:
`.agents/office/` will contain a `team-roster.md` file with information about the team members and their roles. Each workspace will be a subfolder within the office, named after the agent.

`.agents/office/email/` will contain all email communications between team members. Each inbox will be a sub-folder named after the TO: recepient, and each email will dated.

`.agents/office/email/archive/` will contain archived emails that have been read and summarized. Each inbox will be a sub-folder named after the TO: recepient, and each email will dated.

`.agents/office/tasks/` will contain all sprints and work that is deligated and tracked here for project management purposes. Each sprint will be a separate file named in the format `sprint-[number].md`.

`.agents/office/cleanup-summary.md` will contain a summary of the cleanup process, including what was removed and what was preserved.