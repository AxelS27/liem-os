---
name: init-product
description: Initialize a new product from this template - fill the product docs from the user's brief, then stop for review before any code. Use when the user wants to start a new product, gives a PRD/product brief on a blank template, or types /init-product.
---

# Initialize a product from the template

Turn the user's brief into synchronized product docs. **Do not write product code in this
flow** - docs first, review, then building starts from PROGRESS.md.

If the user gave no brief (what it is, who it is for, goals, main features, design
direction), recommend running `/planning` first to align on the scope via Q&A, or ask for a brief before touching any doc. If an approved planning proposal from `/planning` is already available in the chat context, use it directly as the brief. Do not invent scope.

## Steps

1. **Clean Git History**: If the repository still contains the template's original commit history (e.g., commits by the template author `AxelS27`), reset it immediately before any development by running:
   `rm -rf .git && git init -b main && git add . && git commit -m "Initial commit"`
   (Note: Use appropriate shell commands for removing `.git` depending on the OS, e.g., `Remove-Item -Recurse -Force .git` in PowerShell or `rm -rf .git` in bash/zsh).
2. **Verify and Install MarkItDown**: Check if `markitdown` (Microsoft MarkItDown) is installed (verify via python: `python -c "import markitdown"`). If missing, install it:
   - If `uv` is installed: `uv tool install markitdown` or `uv pip install markitdown`.
   - Otherwise: `pip install markitdown` or `pip3 install markitdown`.
3. Read `docs/guides/HOW_TO_USE_THIS_TEMPLATE.md` and `AGENTS.md`.
4. Fill `docs/product/PRD.md` and `docs/product/FEATURES.md` from the brief
   (features tagged P0/P1/P2).
5. Read `docs/engineering/DESIGN_DNA.md`, then fill `docs/product/UI_UX.md` from the
   user's design direction plus `docs/product/REFERENCES.md`. The starter UI in `apps/web`
   is the foundation: record what changes per product (accent color, content, routes,
   any layout deviations) - not a redesign from scratch. If the product matches a
   `docs/verticals/*.md` playbook, use it.
6. Initialize only the domain docs that apply: `docs/engineering/API.md`, `BACKEND.md`,
   `DATABASE.md`, and `PAYMENTS.md` (payments only if the product takes money).
7. Generate `docs/engineering/PROGRESS.md` as the live build checklist - pointer-based
   tasks that cite their source doc, not a duplicate spec.
8. Run `pnpm docs:check`; report warnings separately from failures.
9. Walk `docs/checklists/new-product.md` for anything the steps above missed.

## Done means

Show the user a summary of every doc you filled and wait for their review. Building
starts only after they approve, and then from `docs/engineering/PROGRESS.md` via
`/new-feature` or direct delegation to the sector agents.
