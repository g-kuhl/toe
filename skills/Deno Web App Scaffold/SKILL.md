---
name: Deno Web App Scaffold
description: Initialize a new Deno web application by cloning the template and setting up for development. Keep it simple and vanilla.
---

# Deno Web App Scaffold

Use this skill when a Junior or Senior Developer needs to set up a new Deno-based web application project.

## Prerequisites

- Git installed
- Deno installed

## Step 1: Clone the Template

Clone the deno-web-template and initialize a new project:

```bash
git clone https://github.com/g-kuhl/deno-web-template.git my-web-app
cd my-web-app
rm -rf .git
git init
```

## Step 2: Update deno.json

Edit `deno.json` with your project name:

```json
{
  "name": "my-web-app",
  "version": "1.0.0",
  "description": "Your web app description",
  "tasks": {
    "dev": "deno run --allow-read --allow-net --watch=src/ src/main.ts"
  }
}
```

Keep it minimal. Only add imports if you need external packages from JSR or a CDN.

## Step 3: Create Your Application

Create `src/main.ts`:

```typescript
// Simple example web app
const app = document.getElementById("app");

if (app) {
  app.innerHTML = `
    <h1>Hello, Deno Web App!</h1>
    <p>You can build your app here.</p>
  `;
}
```

Create `web/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Web App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="app/main.js"></script>
</body>
</html>
```

Create `web/style.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f5f5f5;
  padding: 20px;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  color: #333;
  margin-bottom: 10px;
}

p {
  color: #666;
  line-height: 1.6;
}
```

## Step 4: Project Structure

Your project structure:

```
my-web-app/
├── src/                 # TypeScript source
│   ├── main.ts         # App entry point
│   ├── types.ts        # Types (if needed)
│   └── lib/            # Utilities (if needed)
├── web/                # Web assets
│   ├── index.html      # HTML
│   ├── style.css       # CSS
│   ├── icon.svg        # Icon
│   └── favicon.ico     # Favicon
├── deno.json           # Configuration
└── .gitignore          # Git ignore
```

## Step 5: Start Development

Say you want to view your web app while developing. Open a terminal in the `web/` directory and run Deno's built-in file server:

```bash
cd web
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts .
```

This serves your `web/` directory at `http://localhost:8000`. Open that URL in your browser.

For now, `web/app/main.js` is empty. That's fine—it will be bundled/transpiled later if needed. For development, just write plain JavaScript in `web/` (`.html`, `.css`, `.js` files) and view it.

## Step 6: Write Your Application

Edit `web/index.html` to add your content. Edit `web/style.css` to style it. Edit or create `web/app/` JavaScript files as needed.

For TypeScript projects that need to bundle to JavaScript, you can add build tooling later. For now, keep it simple.

## Step 7: Commit Your Work

```bash
git add .
git commit -m "Initial commit: Deno web app scaffold"
```

## What NOT to Do

- Do NOT add `node_modules` or `package.json`
- Do NOT use npm packages
- Do NOT import React, Vue, Angular, or other frameworks
- Do NOT use CSS frameworks like Tailwind or Bootstrap
- Do NOT over-architect before you have code
- Keep it vanilla: plain HTML, CSS, JavaScript
- If you need to bundle TypeScript to JavaScript, that's a separate task

## Growing Your App

As your app grows:

1. **Add more TypeScript in `src/`** — Organize as needed
2. **Add more HTML/CSS** — Keep it simple and semantic
3. **Import types from `src/types.ts`** — Share interfaces across modules
4. **Create utility modules** in `src/lib/` — Avoid duplication

Example organized structure:

```
src/
├── main.ts
├── types.ts
├── lib/
│   ├── api.ts
│   └── utils.ts
└── components/      (if building UI pieces)
    ├── header.ts
    └── footer.ts
```

## That's It

You have a working Deno web application. Write your code. Keep it vanilla. Build structure as you need it, not before.
