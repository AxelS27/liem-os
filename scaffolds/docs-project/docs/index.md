---
layout: home

hero:
  name: "[Project Name]"
  text: "Documentation Portal"
  tagline: "High-performance, structured technical knowledge base."
  image:
    src: /logo.png
    alt: Project Logo
  actions:
    - theme: brand
      text: Get Started Guide
      link: /guide
    - theme: alt
      text: API Reference
      link: /api

features:
  - icon: 📖
    title: Docs-first Discipline
    details: Complete alignment with architecture decision records (ADRs) and locked code choices.
  - icon: 🚀
    title: VitePress Performance
    details: Instant loading speeds, pre-rendered static HTML, and clean responsive layouts out of the box.
  - icon: 🛠️
    title: Automated Verification
    details: Fully integrated checks to keep your technical documentation synced with codebase modifications.
---

<div class="features-custom">

## Quick Start Walkthrough

Welcome to the **[Project Name]** documentation hub. This workspace houses all design guidelines, API definitions, and operational runbooks.

To get oriented and start developing:

1. **Read the Technical Guide**: Navigate to the [Developer Guide](/guide) to understand project structure and development workflow.
2. **Review API Contracts**: Open the [API Reference](/api) to review endpoints, Zod validation schemas, and envelopes.
3. **Local Dev Setup**:
   ```bash
   pnpm install
   pnpm run dev
   ```
4. **Compile and Verify**:
   ```bash
   pnpm run build
   ```
</div>

<style>
.features-custom {
  max-width: 1152px;
  margin: 0 auto;
  padding: 48px 24px;
}
.features-custom h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  border: none;
}
.features-custom ol {
  line-height: 1.8;
}
.features-custom pre {
  background-color: var(--vp-code-block-bg);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin: 12px 0;
}
</style>
