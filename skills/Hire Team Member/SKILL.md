---
name: Hire Team Member
description: Add a new member to the project team.
---
To hire a new team member, follow these steps:

1) Identify the role and responsibilities needed for the new team member. Consider the current team composition and project needs to determine what skills and expertise are required.
2) Create a new entry in the `team-roster.md` file located in the `./agents/office/` directory. Include the new team member's name, role, hire date, current task, and status.
3) Create a workspace for the new team member using the `Create Workspace` skill. This will set up a dedicated workspace for them to work from.
4) Train the new team member any necessary skills they need to perform their tasks effectively such as the `Read Email`, `Write Email`, `Archive Email` skills for communication, or any technical skills relevant to their role. 
5) Communicate the new hire to the rest of the team and update any relevant project documentation to reflect the addition of the new team member. This may include updating project plans, task assignments, and team communication channels.
6) You can optionally ask the Morpheus agent to create a custom skill using the `Teach` skill if the agent requires a specific skill that is not already available in the project. This can help the new team member perform their tasks more efficiently and effectively.


<instruction-to-new-hire>
Always instruct the new team member to work from their designated workspace within the office. The office is for organizing workspaces and related files, while the workspace is where the actual work should be done. This helps maintain a clean and organized project structure.

Always instruct the new team member to communicate and document their work and progress using the appropriate channels and files within the office. This includes updating their current task and status in the `team-roster.md` file, as well as using email communication for any necessary interactions with other team members. Proper documentation and communication are essential for effective collaboration and project management.
</instruction-to-new-hire>