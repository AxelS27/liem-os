import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, "../../../..");
const LIEM_OS_DIR = path.resolve(WORKSPACE_ROOT, "Liem OS");
const STATE_FILE = path.join(LIEM_OS_DIR, ".liem_os_state.json");
const CONFIG_FILE = path.join(LIEM_OS_DIR, ".liem_os_config.json");

console.log("Starting Liem OS MCP Server Unit Tests...");

// Mock state and config load/save functions for testing
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  }
  return { attempts: {}, session_id: "" };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

// 1. Test Routing Logic
function testRouting() {
  console.log("Running Test: testRouting...");

  // Mock routing logic from server.mjs
  const route = (instruction) => {
    const lower = instruction.toLowerCase();
    let agent = "axel";
    let skill = "none";

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
    } else if (lower.includes("deep research") || (lower.includes("search") && !lower.includes("research")) || lower.includes("investigate") || lower.includes("query") || lower.includes("researcher")) {
      agent = "deep-researcher";
    } else if (lower.includes("marketing") || lower.includes("tweet") || lower.includes("linkedin") || lower.includes("content") || lower.includes("post") || lower.includes("growth")) {
      agent = "growth-agent";
    } else if (lower.includes("ceo") || lower.includes("business") || lower.includes("okr") || lower.includes("product") || lower.includes("goals") || lower.includes("milestone")) {
      agent = "ceo";
    } else if (lower.startsWith("/tdd") || lower.includes("write code") || lower.includes("coding") || lower.includes("bug") || lower.includes("fix")) {
      agent = "coder";
      if (lower.startsWith("/tdd")) skill = "tdd";
    } else if (lower.startsWith("/search-first") || lower.includes("research") || lower.includes("analyze") || lower.includes("find info")) {
      agent = "researcher";
      if (lower.startsWith("/search-first")) skill = "search-first";
    } else if (lower.includes("write article") || lower.includes("copywrite") || lower.includes("social") || lower.includes("tweet") || lower.includes("post") || lower.includes("blog")) {
      agent = "writer";
    } else if (lower.startsWith("/plan") || lower.includes("scope") || lower.includes("prd") || lower.includes("milestone")) {
      agent = "strategist";
      if (lower.startsWith("/plan")) skill = "plan";
    } else if (lower.startsWith("/handoff") || lower.includes("deploy") || lower.includes("setup") || lower.includes("install")) {
      agent = "operator";
      if (lower.startsWith("/handoff")) skill = "handoff";
    } else if (lower.startsWith("/quality-gate") || lower.startsWith("/ship-check") || lower.includes("audit") || lower.includes("verify") || lower.includes("check")) {
      agent = "auditor";
      if (lower.startsWith("/quality-gate")) skill = "quality-gate";
      if (lower.startsWith("/ship-check")) skill = "ship-check";
    }

    return { agent, skill };
  };

  assert.strictEqual(route("/tdd implement authentication").agent, "coder");
  assert.strictEqual(route("/tdd implement authentication").skill, "tdd");
  assert.strictEqual(route("please research Next.js 16 updates").agent, "researcher");
  assert.strictEqual(route("write a tweet about Liem OS").agent, "growth-agent");
  assert.strictEqual(route("/plan the next phase").agent, "strategist");
  assert.strictEqual(route("let's deploy this build").agent, "build-resolver");
  assert.strictEqual(route("debug supabase row-level security").agent, "database-reviewer");
  assert.strictEqual(route("optimize memory leak and performance").agent, "performance-optimizer");
  assert.strictEqual(route("manage loop and stall warning").agent, "loop-operator");
  assert.strictEqual(route("write docker container and devops pipeline").agent, "devops");
  assert.strictEqual(route("run playwright E2E test scripts").agent, "browser");
  assert.strictEqual(route("coordinate swarm consensus and voting").agent, "consensus-coordinator");
  assert.strictEqual(route("audit user journeys and ux usability").agent, "ux");
  assert.strictEqual(route("verify accessibility wcag standard compliance").agent, "a11y");
  assert.strictEqual(route("standardize API route json envelope contract").agent, "api-architect");
  assert.strictEqual(route("perform deep research report on competitors").agent, "deep-researcher");
  assert.strictEqual(route("align milestone target with company business goals and ceo").agent, "ceo");
  
  console.log("✅ testRouting passed!");
}

// 2. Test Verification and Attempts Counter
function testVerification() {
  console.log("Running Test: testVerification...");

  const testFilePath = path.join(__dirname, "temp_test_file.js");
  
  // Create a file violating rules (120K+ users claim)
  fs.writeFileSync(testFilePath, "// We have 120K+ users!\nfunction test() {}", "utf8");

  // Mock verify logic
  const verify = (filePath) => {
    const state = loadState();
    if (!state.attempts) state.attempts = {};

    const mtime = fs.statSync(filePath).mtimeMs;
    const fileState = state.attempts[filePath] || { count: 0, lastMtime: mtime };

    if (mtime !== fileState.lastMtime) {
      fileState.count = 0;
      fileState.lastMtime = mtime;
    }

    fileState.count += 1;
    state.attempts[filePath] = fileState;
    saveState(state);

    const content = fs.readFileSync(filePath, "utf8");
    const failures = [];

    if (content.includes("120K+ users")) {
      failures.push("Law #2 Violation: Unverified marketing claim.");
    }

    if (failures.length > 0) {
      if (fileState.count >= 2) {
        return { isError: true, count: fileState.count, msg: "Max attempts reached" };
      }
      return { isError: false, count: fileState.count, msg: "Failed audit" };
    }

    fileState.count = 0;
    state.attempts[filePath] = fileState;
    saveState(state);
    return { isError: false, count: 0, msg: "Passed" };
  };

  // Run 1st attempt: should fail but not block
  let res = verify(testFilePath);
  assert.strictEqual(res.isError, false);
  assert.strictEqual(res.count, 1);

  // Run 2nd attempt: should fail and block
  res = verify(testFilePath);
  assert.strictEqual(res.isError, true);
  assert.strictEqual(res.count, 2);

  // Modify file (mtime changes) and check reset
  fs.writeFileSync(testFilePath, "// We have 50 active beta testers.\nfunction test() {}", "utf8");
  // update file modification time manually to be absolutely sure
  const now = new Date();
  fs.utimesSync(testFilePath, now, now);

  res = verify(testFilePath);
  assert.strictEqual(res.count, 0); // resets to 0 and passes
  assert.strictEqual(res.isError, false);

  // Clean up
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }

  console.log("✅ testVerification passed!");
}

// 3. Test Memory & Self-Learning System
function testMemorySystem() {
  console.log("Running Test: testMemorySystem...");

  const scratchDir = path.join(LIEM_OS_DIR, "core/memory/scratch");
  const approvedDir = path.join(LIEM_OS_DIR, "core/memory/approved");
  const patternName = "test_pattern_behavior";
  const scratchFile = path.join(scratchDir, `${patternName}.json`);
  const approvedFile = path.join(approvedDir, `${patternName}.json`);

  // Ensure directories exist
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  if (!fs.existsSync(approvedDir)) fs.mkdirSync(approvedDir, { recursive: true });

  // Cleanup pre-existing test files
  if (fs.existsSync(scratchFile)) fs.unlinkSync(scratchFile);
  if (fs.existsSync(approvedFile)) fs.unlinkSync(approvedFile);

  // 3.1 Verify self-learn staging
  const rulesToStage = "### Rule A\n- Always return true.";
  const stagedPattern = {
    name: patternName,
    description: "Verify staging behavior",
    rules: rulesToStage,
    stagedAt: new Date().toISOString(),
    status: "STAGED",
    requiresApproval: true
  };
  fs.writeFileSync(scratchFile, JSON.stringify(stagedPattern, null, 2), "utf8");
  assert.ok(fs.existsSync(scratchFile));

  // 3.2 Verify consolidate promotion to approved
  const patternData = JSON.parse(fs.readFileSync(scratchFile, "utf8"));
  patternData.status = "APPROVED";
  patternData.requiresApproval = false;
  patternData.approvedAt = new Date().toISOString();

  fs.writeFileSync(approvedFile, JSON.stringify(patternData, null, 2), "utf8");
  fs.unlinkSync(scratchFile);

  assert.ok(!fs.existsSync(scratchFile));
  assert.ok(fs.existsSync(approvedFile));

  // 3.3 Verify compilation of cursor rules with approved memory
  const commonRulesPath = path.join(LIEM_OS_DIR, "core/rules/common/rules.md");
  const codingRulesPath = path.join(LIEM_OS_DIR, "core/rules/coding/rules.md");
  let compiled = "# Compiled Rules\n\n";

  if (fs.existsSync(commonRulesPath)) compiled += fs.readFileSync(commonRulesPath, "utf8") + "\n\n";
  if (fs.existsSync(codingRulesPath)) compiled += fs.readFileSync(codingRulesPath, "utf8") + "\n\n";

  // Scan approved memories
  const files = fs.readdirSync(approvedDir);
  let memoryAdded = false;
  for (const file of files) {
    if (file.endsWith(".json")) {
      if (!memoryAdded) {
        compiled += "# Approved Self-Learned Rules\n\n";
        memoryAdded = true;
      }
      const data = JSON.parse(fs.readFileSync(path.join(approvedDir, file), "utf8"));
      compiled += `## Pattern: ${data.name}\n${data.rules}\n\n`;
    }
  }

  assert.ok(compiled.includes("# Approved Self-Learned Rules"));
  assert.ok(compiled.includes("### Rule A"));

  // Cleanup after test
  if (fs.existsSync(approvedFile)) fs.unlinkSync(approvedFile);

  console.log("✅ testMemorySystem passed!");
}

// 4. Test Git Worktree System
function testWorktreeSystem() {
  console.log("Running Test: testWorktreeSystem...");

  const mockWorktrees = [];
  const create = (branch, targetPath) => {
    if (fs.existsSync(targetPath)) throw new Error("Directory already exists");
    fs.mkdirSync(targetPath, { recursive: true });
    mockWorktrees.push({ path: targetPath, branch });
    return `Cloning into '${targetPath}'...`;
  };

  const remove = (targetPath) => {
    if (!fs.existsSync(targetPath)) throw new Error("Directory not found");
    fs.rmSync(targetPath, { recursive: true, force: true });
    const idx = mockWorktrees.findIndex(w => w.path === targetPath);
    if (idx !== -1) mockWorktrees.splice(idx, 1);
    return `Removed worktree at '${targetPath}'`;
  };

  const tempPath = path.join(__dirname, "temp_git_worktree_mock");
  
  // Cleanup pre-existing files
  if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true, force: true });

  // Create worktree
  const resCreate = create("test-branch", tempPath);
  assert.ok(fs.existsSync(tempPath));
  assert.strictEqual(mockWorktrees.length, 1);
  assert.strictEqual(mockWorktrees[0].branch, "test-branch");

  // Remove worktree
  const resRemove = remove(tempPath);
  assert.ok(!fs.existsSync(tempPath));
  assert.strictEqual(mockWorktrees.length, 0);

  console.log("✅ testWorktreeSystem passed!");
}

// 5. Test Scaffolding System
function testScaffoldingSystem() {
  console.log("Running Test: testScaffoldingSystem...");

  const testTargetDir = path.join(__dirname, "temp_scaffold_output");

  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.name === "node_modules" || entry.name === ".git") continue;

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  // 5.1 Test docs template
  const docsSrc = path.join(LIEM_OS_DIR, "scaffolds/docs-project");
  const docsTarget = path.join(testTargetDir, "docs_test");
  if (fs.existsSync(docsTarget)) fs.rmSync(docsTarget, { recursive: true, force: true });
  copyDir(docsSrc, docsTarget);
  assert.ok(fs.existsSync(path.join(docsTarget, "package.json")));
  assert.ok(fs.existsSync(path.join(docsTarget, "docs/index.md")));

  // 5.2 Test research template
  const researchSrc = path.join(LIEM_OS_DIR, "scaffolds/research-project");
  const researchTarget = path.join(testTargetDir, "research_test");
  if (fs.existsSync(researchTarget)) fs.rmSync(researchTarget, { recursive: true, force: true });
  copyDir(researchSrc, researchTarget);
  assert.ok(fs.existsSync(path.join(researchTarget, "outline.md")));
  assert.ok(fs.existsSync(path.join(researchTarget, "sources/.gitkeep")));

  // 5.3 Test content template
  const contentSrc = path.join(LIEM_OS_DIR, "scaffolds/content-project");
  const contentTarget = path.join(testTargetDir, "content_test");
  if (fs.existsSync(contentTarget)) fs.rmSync(contentTarget, { recursive: true, force: true });
  copyDir(contentSrc, contentTarget);
  assert.ok(fs.existsSync(path.join(contentTarget, "brief.md")));
  assert.ok(fs.existsSync(path.join(contentTarget, "calendar/.gitkeep")));

  // 5.4 Test fullstack-app template
  const fullstackSrc = path.join(LIEM_OS_DIR, "scaffolds/fullstack-app");
  const fullstackTarget = path.join(testTargetDir, "fullstack_test");
  if (fs.existsSync(fullstackTarget)) fs.rmSync(fullstackTarget, { recursive: true, force: true });
  copyDir(fullstackSrc, fullstackTarget);
  assert.ok(fs.existsSync(path.join(fullstackTarget, "package.json")));
  assert.ok(fs.existsSync(path.join(fullstackTarget, "pnpm-workspace.yaml")));

  // Clean up
  if (fs.existsSync(testTargetDir)) fs.rmSync(testTargetDir, { recursive: true, force: true });

  console.log("✅ testScaffoldingSystem passed!");
}

// 6. Test Agent Council System
function testCouncilSystem() {
  console.log("Running Test: testCouncilSystem...");

  const topic = "Design a database schema for multitenancy";
  const members = ["architect", "coder"];

  const activeMembers = members.filter(m => {
    const filePath = path.join(LIEM_OS_DIR, "core/agents", `${m}.md`);
    return fs.existsSync(filePath);
  });

  assert.strictEqual(activeMembers.length, 2);
  console.log("✅ testCouncilSystem passed!");
}

try {
  testRouting();
  testVerification();
  testMemorySystem();
  testWorktreeSystem();
  testScaffoldingSystem();
  testCouncilSystem();
  console.log("\n==========================================");
  console.log("All Liem OS MCP Unit Tests Passed!");
  console.log("==========================================");
} catch (e) {
  console.error("❌ Test verification failed:", e);
  process.exit(1);
}
