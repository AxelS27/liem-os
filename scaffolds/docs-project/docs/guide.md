# Documentation Guide — [Project Name]

> [!NOTE]
> Use this guide to manage, structure, and style your project's VitePress documentation. Replace it with your specific documentation guidelines.

---

## 1. Documentation Workspace Structure

This workspace is powered by VitePress to compile high-performance, responsive documentation from Markdown files:

```text
├── docs/
│   ├── .vitepress/
│   │   ├── config.js     # VitePress site and navigation configuration
│   │   └── theme/        # Custom CSS styling tokens
│   ├── index.md          # Documentation landing homepage
│   └── guide.md          # Technical user guide (this file)
├── package.json          # Node dependencies and build scripts
└── pnpm-lock.yaml        # Lockfile mapping
```

---

## 2. Writing Style & Spacing Standards

Keep documentation clean, direct, and easy to scan for technical readers:

- **Semantic Hierarchy**: Use a single `# H1` tag per file for the page title. Organize subsections logically using `## H2` and `### H3`.
- **Active Voice**: Write in active, reader-focused sentences (e.g. "Run `npm run dev` to start," not "The dev server is started by running `npm run dev`").
- **Alert Blocks**: Use GitHub-styled alerts strategically to emphasize critical details:
  ```markdown
  > [!IMPORTANT]
  > Essential requirements that the user must know.

  > [!TIP]
  > Performance tips or configuration options.
  ```

---

## 3. Customizing the VitePress Configuration

Manage the site navigation, logo, and theme settings inside `docs/.vitepress/config.js`:

```javascript
// docs/.vitepress/config.js
export default {
  title: 'Project Title',
  description: 'Project description goes here.',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'API Reference', link: '/api' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' }
        ]
      }
    ]
  }
}
```

---

## 4. Build and Deployment Workflow

Run these package scripts from the workspace root to test and build documentation:

- **Local Development Server**:
  ```bash
  pnpm run dev
  ```
  Starts a hot-reloading documentation server locally at `http://localhost:5173`.
- **Production Build compilation**:
  ```bash
  pnpm run build
  ```
  Compiles static HTML files under `docs/.vitepress/dist` ready for static CDN deployment (Vercel, Netlify, GitHub Pages).
