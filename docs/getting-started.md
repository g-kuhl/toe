# Getting Started with TOE

## Overview

TOE (Team of Experts) is a multi-agent system that builds complex software projects by assembling specialized AI agents. The Project Manager agent orchestrates the team, hiring the right specialists for each task and coordinating their work.

## Installation

TOE agent definitions are designed for AI agent orchestration systems that support multi-agent workflows. To use TOE:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd toe
   ```

2. Ensure your AI orchestration system supports `.agent.md` files and multi-agent workflows

3. Configure your orchestration system to recognize TOE agents

## Quick Start

### Basic Usage

1. **Invoke the Project Manager** - Start by talking to the Project Manager agent with your project description
   
2. **Describe Your Project** - Be clear about what you need:
   - "Build a REST API for user management"
   - "Create a data processing pipeline for CSV files"
   - "Set up CI/CD for a Deno application"

3. **Let the Project Manager Orchestrate** - The Project Manager will:
   - Analyze your requirements
   - Hire the appropriate specialists
   - Coordinate work between agents
   - Deliver the completed project

### Example Workflow

```
User: "I need a web application with user authentication"

Project Manager: Analyzes requirements
  ↓
Hires Researcher: Investigates auth best practices
  ↓
Hires Designer: Designs UI/UX and data models
  ↓
Hires Developer: Implements the application
  ↓
Hires QA Engineer: Tests functionality
  ↓
Hires Documentation Specialist: Creates user guides
```

## Understanding Agent Roles

### Core Team
- **Project Manager** - Your main point of contact, coordinates all other agents, creates plans and manages milestones
- **Researcher** - Investigates technologies and best practices
- **Designer** - Designs architecture, UI/UX, and data models
- **Developer** - Writes code and implements features
- **QA Engineer** - Tests and ensures quality
- **Documentation Specialist** - Creates all documentation

### Specialized Team
- **Database Engineer** - Database design and optimization
- **DevOps** - Infrastructure and deployment pipelines
- **Data Engineer** - ETL pipelines and data processing
- **Security Engineer** - Security audits and compliance
- **Marketing** - Product messaging and launches

## Key Concepts

### Delegation Over Implementation
The Project Manager never writes code or creates project files (except `.agents/` office folders). All implementation is delegated to specialists.

### Office Organization
Agents create their working files in `.agents/<agent-name>/` offices:
- `.agents/developer/` - Implementation notes
- `.agents/designer/` - Design mockups and specs
- `.agents/qa/` - Test reports
- `.agents/documentation/` - Documentation drafts

Agents clean up their offices when work completes, removing outdated files and keeping only necessary artifacts.

### Communication Methods
Agents coordinate through:
- **Handoffs** - Direct delegation between agents
- **Inbox** - `.agents/inbox/` for status updates, messages, and blockers

## Best Practices

1. **Be Specific** - Clear requirements lead to better results
2. **Trust the Process** - Let the Project Manager handle coordination
3. **Start Simple** - Begin with core functionality, expand later
4. **Review Outputs** - Check `.agents/` offices for intermediate work

## Common Use Cases

- Web applications and APIs
- Data processing pipelines
- Infrastructure automation
- Database design and migration
- Security audits
- Product documentation
- DevOps setup

## Next Steps

- Read [Architecture](architecture.md) to understand how agents work together
- Check [Agent Reference](agent-reference.md) for detailed agent descriptions
- See [Examples](examples.md) for real-world workflows
- **Administrators**: See [Web App Guide](web-app.md) to run the browser-based Agent Manager for editing agents
