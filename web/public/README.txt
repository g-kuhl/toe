This directory is served as static files by server.ts.

Frontend files (HTML, CSS, JS) will be placed here by the frontend developer (Priya Patel).

Expected structure (Sprint 2):
  public/
  ├── index.html         ← login page (served at /)
  ├── dashboard.html     ← agent dashboard
  ├── css/
  │   └── main.css
  └── js/
      ├── api.js         ← fetch wrapper; always use credentials: "include"
      ├── auth.js        ← login/logout logic
      ├── agents.js      ← list/view/edit agents
      └── editor.js      ← inline text editor

IMPORTANT for Priya:
- Always pass `credentials: "include"` to every fetch() call so the session cookie is sent.
- URL-encode agent IDs: encodeURIComponent(agent.id)
- After toggle or rename, the agent's :id changes — use the returned id from the response.
- See .agents/senior_developer/api-contract.md for full request/response shapes.
