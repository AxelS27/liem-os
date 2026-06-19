# CANONICAL BUSINESS & SCOPING RULES — Liem OS

These rules govern all product requirements documents (PRDs), roadmap milestones, copywriting briefs, and customer value proposals in Liem OS.

---

## 1. The Plan-Before-Build Protocol

To avoid feature creep and un-scoped work, engineers must write a plan before writing functional code.

- **PRD Validation**: A Product Requirements Document must exist for any feature or service.
- **Scope Agreement**: The PRD must define the exact boundary between Phase 1 (Core MVP) and future phases before execution starts.
- **Complexity Assessment**: Evaluate the code changes against simpler alternatives. Over-engineered architectures must be rejected.

---

## 2. Standard PRD / Scoping Brief Structure

Every business roadmap plan or PRD must contain the following sections:

### 1. Executive Summary
- State the product goal in exactly 3 sentences.
- Define the user-facing value proposition (how does this save user time, reduce hosting cost, or increase conversion?).

### 2. Functional Specifications
- Detail the user stories as structured tables (ID, User Story, Acceptance Criteria).
- Do not list vague requirements. Every specification must have a binary, verifiable pass condition.

### 3. Feature Scope Boundaries
- **In-Scope**: Bulleted list of Phase 1 MVP features.
- **Out-of-Scope**: Explicit list of deferred items to prevent feature creep.

### 4. Phased Roadmap
- Detail step-by-step milestones (e.g. Scaffolding -> Database -> API/Backend -> Dashboard Integration -> E2E Auditing).
- Attach expected duration estimations, factoring in buffer coefficients.

### 5. Risks and Mitigations
- Maintain a Risk Register table detailing Technical, Operational, and Security risks.
- Every risk must map to a concrete mitigation strategy.

---

## 3. Financial & Resource Budget Constraints

To prevent resource exhaustion and excessive costs during automated agent execution:

- **API Token Tracking**: Always estimate the API and token consumption costs of third-party integrations.
- **Dependency Sizing**: Prioritize lightweight, open-source dependencies over massive, heavy enterprise packages.
- **Hosting Bounds**: Ensure architectures fit within standard serverless limits or budget hosting instances (e.g. Supabase Free/Pro tiers, Vercel Hobby limits).
