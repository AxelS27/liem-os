// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  // Set random session id
  const sessId = document.getElementById("session-id");
  if (sessId) {
    sessId.textContent = "003ec96b-4146-4959-882d-19072db83ec4".substring(0, 12) + "...";
  }
});

// 1. Axel Router Simulation
const btnRoute = document.getElementById("btn-route");
const routeInput = document.getElementById("route-input");
const routeLoading = document.getElementById("route-loading");
const routeOutputBox = document.getElementById("route-output-box");
const routeOutputText = document.getElementById("route-output-text");
const routeResultBadge = document.getElementById("route-result-badge");

if (btnRoute) {
  btnRoute.addEventListener("click", () => {
    const val = routeInput.value.trim();
    if (!val) return;

    // Show loading spinner (Iron Law #4: progressive feedback)
    routeLoading.classList.remove("hidden");
    routeOutputBox.classList.add("hidden");

    setTimeout(() => {
      routeLoading.classList.add("hidden");
      routeOutputBox.classList.remove("hidden");

      const lower = val.toLowerCase();
      let agent = "axel";
      let skill = "none";
      let params = "{}";

      if (lower.includes("build") || lower.includes("typeerror") || lower.includes("compiler") || lower.includes("error") || lower.includes("typescript")) {
        agent = "build-resolver";
      } else if (lower.includes("supabase") || lower.includes("postgres") || lower.includes("database") || lower.includes("sql") || lower.includes("schema") || lower.includes("rls")) {
        agent = "database-reviewer";
      } else if (lower.includes("performance") || lower.includes("latency") || lower.includes("leak") || lower.includes("optimize") || lower.includes("slow") || lower.includes("profile")) {
        agent = "performance-optimizer";
      } else if (lower.includes("loop") || lower.includes("autonomous") || lower.includes("stall") || lower.includes("auto")) {
        agent = "loop-operator";
      } else if (lower.includes("devops") || lower.includes("docker") || lower.includes("cicd") || lower.includes("deploy") || lower.includes("infrastructure") || lower.includes("actions")) {
        agent = "devops";
      } else if (lower.includes("browser") || lower.includes("playwright") || lower.includes("scrape") || lower.includes("puppeteer") || lower.includes("e2e")) {
        agent = "browser";
      } else if (lower.includes("consensus") || lower.includes("conflict") || lower.includes("vote") || lower.includes("agree") || lower.includes("sync") || lower.includes("swarm")) {
        agent = "consensus-coordinator";
      } else if (lower.includes("ux") || lower.includes("usability") || lower.includes("flow") || lower.includes("journey") || lower.includes("copywrite")) {
        agent = "ux";
      } else if (lower.includes("a11y") || lower.includes("accessibility") || lower.includes("wcag") || lower.includes("aria")) {
        agent = "a11y";
      } else if (lower.includes("api") || lower.includes("rest") || lower.includes("graphql") || lower.includes("endpoint") || lower.includes("contract")) {
        agent = "api-architect";
      } else if (lower.includes("deep research") || lower.includes("search") || lower.includes("investigate") || lower.includes("query") || lower.includes("researcher")) {
        agent = "deep-researcher";
      } else if (lower.includes("marketing") || lower.includes("tweet") || lower.includes("linkedin") || lower.includes("content") || lower.includes("post") || lower.includes("growth")) {
        agent = "growth-agent";
      } else if (lower.includes("ceo") || lower.includes("business") || lower.includes("okr") || lower.includes("product") || lower.includes("goals") || lower.includes("milestone")) {
        agent = "ceo";
      } else if (lower.startsWith("/tdd") || lower.includes("write code") || lower.includes("coding") || lower.includes("bug") || lower.includes("fix")) {
        agent = "coder";
        if (lower.startsWith("/tdd")) skill = "tdd";
        params = `{"file": "auth.ts"}`;
      } else if (lower.startsWith("/search-first") || lower.includes("research") || lower.includes("analyze") || lower.includes("find info")) {
        agent = "researcher";
        if (lower.startsWith("/search-first")) skill = "search-first";
        params = `{"topic": "nextjs"}`;
      } else if (lower.includes("write article") || lower.includes("copywrite") || lower.includes("social") || lower.includes("tweet") || lower.includes("post") || lower.includes("blog")) {
        agent = "writer";
        params = `{"platform": "twitter"}`;
      } else if (lower.startsWith("/plan") || lower.includes("scope") || lower.includes("prd") || lower.includes("milestone")) {
        agent = "strategist";
        if (lower.startsWith("/plan")) skill = "plan";
        params = `{"scope": "phase2"}`;
      } else if (lower.startsWith("/handoff") || lower.includes("deploy") || lower.includes("setup") || lower.includes("install")) {
        agent = "operator";
        if (lower.startsWith("/handoff")) skill = "handoff";
      }

      if (agent !== "axel") {
        routeResultBadge.textContent = `ROUTE: ${agent.toUpperCase()}`;
        routeResultBadge.className = "badge route-badge badge-green";
        routeOutputText.textContent = `ROUTE: ${agent} | SKILL: ${skill} | PARAMS: ${params}\n\n[CONTEXT_METRICS: 1245/128000 (0.9%)]`;
      } else {
        routeResultBadge.textContent = `ROUTE: AXEL (FALLBACK)`;
        routeResultBadge.className = "badge route-badge badge-amber";
        routeOutputText.textContent = `Axel Hybrid Reasoning Fallback:\nThe prompt "${val}" is multi-step or ambiguous. Recommended plan:\n1. Delegate to researcher to compile references.\n2. Route to coder for implementation.\n\n[CONTEXT_METRICS: 1245/128000 (0.9%)]`;
      }
    }, 500); // 500ms delay to satisfy Iron Law progress feedback and feel realistic
  });
}

// 2. Git Worktree Swarms
const btnAddWt = document.getElementById("btn-add-wt");
const wtBranchInput = document.getElementById("wt-branch-input");
const worktreeList = document.getElementById("worktree-list");

if (btnAddWt) {
  btnAddWt.addEventListener("click", () => {
    const branchName = wtBranchInput.value.trim();
    if (!branchName) return;

    const cleanName = branchName.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

    const item = document.createElement("div");
    item.className = "worktree-item";
    item.innerHTML = `
      <div class="wt-info">
        <span class="wt-branch font-mono">${cleanName}</span>
        <span class="wt-path">core/worktrees/${cleanName}</span>
      </div>
      <button class="btn-icon btn-danger" onclick="deleteWorktree(this)"><i data-lucide="trash-2"></i></button>
    `;
    worktreeList.appendChild(item);
    lucide.createIcons();

    wtBranchInput.value = "";
  });
}

window.deleteWorktree = (btn) => {
  const item = btn.closest(".worktree-item");
  if (item) {
    item.remove();
  }
};

// 3. Auditor Quality Gates
const btnVerify = document.getElementById("btn-verify");
const btnMockFail = document.getElementById("btn-mock-fail");
const auditFileSelect = document.getElementById("audit-file-select");
const attemptBadge = document.getElementById("attempt-badge");
const auditOutputBox = document.getElementById("audit-output-box");
const auditStatusBadge = document.getElementById("audit-status-badge");
const auditIssuesList = document.getElementById("audit-issues-list");

let attempts = 0;

if (btnVerify) {
  btnVerify.addEventListener("click", () => {
    const file = auditFileSelect.value;
    attempts = 0;
    
    attemptBadge.textContent = "0/2 Attempts";
    attemptBadge.className = "badge badge-green";

    auditOutputBox.classList.remove("hidden");
    auditStatusBadge.textContent = "AUDIT PASSED";
    auditStatusBadge.className = "badge badge-green";
    
    auditIssuesList.innerHTML = `
      <p style="color: var(--emerald-accent); font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">✅ All quality gates passed successfully!</p>
      <pre style="color: var(--text-secondary); font-size: 0.8rem;">- Functions: Focused & small (< 50 lines)\n- Biome Linter: 0 errors\n- Security: CSRF & XSS checks passed\n- Decoupled modules check: Safe</pre>
    `;
  });
}

if (btnMockFail) {
  btnMockFail.addEventListener("click", () => {
    attempts++;
    
    auditOutputBox.classList.remove("hidden");
    
    if (attempts >= 2) {
      attemptBadge.textContent = "2/2 Attempts (LOCKED)";
      attemptBadge.className = "badge badge-danger";
      
      auditStatusBadge.textContent = "HARD BLOCK";
      auditStatusBadge.className = "badge badge-danger";
      
      auditIssuesList.innerHTML = `
        <p style="color: var(--danger-accent); font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">[AUDIT_FAILED: Maximum remediation attempts (2/2) reached.]</p>
        <p style="color: var(--text-secondary); font-size: 0.8rem;">You must halt and request manual guidance from the user to resolve this deadlock loop.</p>
      `;
    } else {
      attemptBadge.textContent = "1/2 Attempts";
      attemptBadge.className = "badge badge-amber";
      
      auditStatusBadge.textContent = "AUDIT FAILED";
      auditStatusBadge.className = "badge badge-amber";
      
      auditIssuesList.innerHTML = `
        <p style="color: var(--amber-accent); font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">⚠️ Quality checks failed (1/2 attempts):</p>
        <pre style="color: var(--text-secondary); font-size: 0.8rem;">- Security: Potential hardcoded secret or token detected on line 14.\n- Code Style: Function 'configureAuth' has deep nesting (> 4 levels).</pre>
      `;
    }
  });
}

// 4. Memory Staging Manager
const stagedList = document.getElementById("staged-list");
const emptyStagedMsg = document.getElementById("empty-staged-msg");

window.promotePattern = (itemId, patternName) => {
  const item = document.getElementById(itemId);
  if (item) {
    // Fade animation and remove
    item.style.transition = "all 0.3s ease";
    item.style.opacity = "0";
    item.style.transform = "translateX(20px)";
    
    setTimeout(() => {
      item.remove();
      
      // Check if staged is empty
      const items = stagedList.getElementsByClassName("staged-item");
      if (items.length === 0) {
        stagedList.classList.add("hidden");
        emptyStagedMsg.classList.remove("hidden");
        lucide.createIcons();
      }
    }, 300);
  }
};

// 5. Agent Council Chamber Simulation
const btnSummonCouncil = document.getElementById("btn-summon-council");
const councilTopicInput = document.getElementById("council-topic-input");
const councilLoading = document.getElementById("council-loading");
const councilDebateBox = document.getElementById("council-debate-box");
const debateTranscript = document.getElementById("debate-transcript");
const memberChipsContainer = document.getElementById("member-chips");

if (memberChipsContainer) {
  // Chip selection toggler
  memberChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) {
      chip.classList.toggle("active");
    }
  });
}

if (btnSummonCouncil) {
  btnSummonCouncil.addEventListener("click", () => {
    const topic = councilTopicInput.value.trim();
    if (!topic) return;

    // Get active members
    const activeChips = Array.from(memberChipsContainer.querySelectorAll(".chip.active"));
    const selectedMembers = activeChips.map(c => c.dataset.member);

    if (selectedMembers.length === 0) {
      alert("Please select at least one council member!");
      return;
    }

    // Show loading spinner
    councilLoading.classList.remove("hidden");
    councilDebateBox.classList.add("hidden");
    debateTranscript.innerHTML = "";

    setTimeout(() => {
      councilLoading.classList.add("hidden");
      councilDebateBox.classList.remove("hidden");

      // Generate dialogue scripts dynamically based on topic keywords
      const lower = topic.toLowerCase();
      let dialogue = [];

      selectedMembers.forEach(m => {
        let comment = "";
        if (m === "strategist") {
          comment = `We must first establish the scope boundaries. The business logic of "${topic}" requires a clear mapping of tenant metadata and isolated milestones. I recommend treating this as a Phase 1 core loop requirement.`;
        } else if (m === "architect") {
          comment = `From an architectural perspective, the domain boundaries must be cleanly isolated. Sibling services must not import directly from each other. If we are implementing this, we need a shared contract library and explicit schema mapping.`;
        } else if (m === "security") {
          comment = `Warning: We must evaluate the threat model. Ensure zero hardcoded signing keys exist in source control, validate all incoming parameters against schemas, and strictly enforce Row-Level Security checks at the boundary.`;
        } else if (m === "coder") {
          comment = `I will implement this feature following strict TDD cycles. I'll write the failing unit and integration tests first, write the minimal functional code using pnpm dependencies, and optimize the functions to stay under 50 lines.`;
        } else if (m === "auditor") {
          comment = `I have audited all inputs. The proposed consensus satisfies the 5 relaxed Iron Laws. I approve the architecture subject to passing standard quality gates, Biome linting, and 80%+ test coverage.`;
        } else if (m === "researcher") {
          comment = `Based on my research of active frameworks, similar implementations on GitHub show that we should reference existing patterns rather than inventing custom abstractions. Let me pull documentation references.`;
        } else if (m === "writer") {
          comment = `I will craft clean developer guides and update working contexts. The wording must be clear, concise, and structured in readable markdown. I'll avoid hyperbolic language.`;
        } else if (m === "designer") {
          comment = `For the visual aspects of "${topic}", we must ensure consistent HSL colors, responsive spacing grids, and clear micro-animations (e.g. outline focus rings and hover transitions) that feel premium.`;
        } else if (m === "tester") {
          comment = `I'll set up integration test cases and verify coverage limits. We must target a minimum of 80% coverage across unit, integration, and E2E flows to satisfy our quality gates.`;
        } else if (m === "operator") {
          comment = `I will manage the project scaffolding and environment configurations. I'll prepare clean templates, configure state paths, and handle post-session handoffs.`;
        } else if (m === "planner") {
          comment = `I will decompose this task into clear, actionable bullet points in task.md, adding estimation buffers and capacity tracking to align with our milestone targets.`;
        } else if (m === "build-resolver") {
          comment = `I'll audit package dependency versions and resolve tsconfig mappings. We must prevent circular dependencies and TypeScript typing exceptions during compilation.`;
        } else if (m === "database-reviewer") {
          comment = `We need normalized tables and indexed joins. I'll specify foreign key constraints and write Row-Level Security (RLS) policies targeting tenant profiles.`;
        } else if (m === "performance-optimizer") {
          comment = `We must keep the critical path lean. I'll run profiles to identify query bottlenecks, optimize bundle assets, and ensure our responses return within 500ms.`;
        } else if (m === "loop-operator") {
          comment = `Safety check: I will monitor the execution state and prevent infinite loops. If our remediation counter hits 2/2, I'll force a hard halt to save token context.`;
        } else if (m === "devops") {
          comment = `I'll write a multi-stage Dockerfile and configure a GitHub Actions pipeline to automate testing, build checks, and deployment staging.`;
        } else if (m === "browser") {
          comment = `I'll implement E2E testing scripts using Playwright. I'll use robust accessibility role selectors and verify interaction flows on responsive viewport targets.`;
        } else if (m === "consensus-coordinator") {
          comment = `I will structure the voting weights and resolve conflicts between architectural recommendations and coding implementation speeds to achieve clean agreement.`;
        } else if (m === "ux") {
          comment = `I will map the happy path and error paths. We need clear page hierarchies, a single dominant primary CTA, and descriptive, polite form validation messages.`;
        } else if (m === "a11y") {
          comment = `We must enforce WCAG 2.1 compliance. Every interactive node must be focusable via Tab, and dynamic changes must be announced via aria-live elements.`;
        } else if (m === "api-architect") {
          comment = `I'll design the REST/GraphQL endpoints, enforcing a consistent envelope response structure, pagination query inputs, and standardized HTTP status codes.`;
        } else if (m === "deep-researcher") {
          comment = `I will query Context7 for up-to-date documentation on the APIs. I'll compile a technical note citing references to ensure zero version hallucinations.`;
        } else if (m === "growth-agent") {
          comment = `I'll draft social content highlighting this implementation. I'll focus on high-fidelity, value-dense copy showcasing our performance gains without generic fluff.`;
        } else if (m === "ceo") {
          comment = `From a business perspective, the complexity of this implementation must align with our primary OKR. We will focus on Phase 1 MVP to deliver maximum value quickly.`;
        } else {
          comment = `I'm analyzing the implications of "${topic}" under my core mandates and will coordinate with the team.`;
        }

        dialogue.push({
          agent: m,
          text: comment
        });
      });

      // Add final synthesis consensus step
      dialogue.push({
        agent: "auditor",
        isSynthesis: true,
        text: `### 🏛️ Consensus Synthesis Verdict\n\nThe Agent Council has analyzed the topic: **"${topic}"**.\n\n**Consensus Decisions:**\n1. **Strategist & Planner**: Scope is approved as Phase 1 (P0 Core).\n2. **Architect & Coder**: Decoupled domain boundaries will be implemented using shared data contracts.\n3. **Security & Auditor**: Parameterized verification gates are mandated. Zero secrets in source.\n\n**Result:** APPROVED TO BUILD`
      });

      // Populate dialogue to UI
      dialogue.forEach(d => {
        const item = document.createElement("div");
        item.className = `debate-item ${d.agent}`;
        if (d.isSynthesis) {
          item.innerHTML = `
            <div class="debate-speaker">Consensus Synthesis Judge (Auditor)</div>
            <div class="debate-text">${d.text.replace(/\n/g, "<br>")}</div>
          `;
        } else {
          item.innerHTML = `
            <div class="debate-speaker">${d.agent.toUpperCase()} Agent</div>
            <div class="debate-text">"${d.text}"</div>
          `;
        }
        debateTranscript.appendChild(item);
      });

    }, 1500); // 1.5s delay to represent parallel subagent analysis
  });
}
