import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createWorktree, removeWorktree, listWorktrees } from "./worktree.mjs";
import { prepareCouncil, formatSummonsInstructions } from "./council.mjs";
import { createWorktree, removeWorktree, listWorktrees } from "./worktree.mjs";
import { prepareCouncil, formatSummonsInstructions } from "./council.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration & state paths
const WORKSPACE_ROOT = path.resolve(__dirname, "../../..");
const LIEM_OS_DIR = path.resolve(WORKSPACE_ROOT, "Liem OS");
const STATE_FILE = path.join(LIEM_OS_DIR, ".liem_os_state.json");
const CONFIG_FILE = path.join(LIEM_OS_DIR, ".liem_os_config.json");

// Helper to load state
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch (e) {
      // Return default if corrupt
    }
  }
  return { attempts: {}, session_id: "" };
}

// Helper to save state
function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

// Helper to load config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    } catch (e) {
      // Return default
    }
  }
  return { conversationId: "", appDataDir: "", tokenLimit: 128000 };
}

// Helper to calculate context metrics
function calculateContextMetrics() {
  const config = loadConfig();
  const limit = config.tokenLimit || 128000;
  let used = 0;

  if (config.appDataDir && config.conversationId) {
    const transcriptPath = path.join(
      config.appDataDir,
      "brain",
      config.conversationId,
      ".system_generated",
      "logs",
      "transcript.jsonl"
    );

    if (fs.existsSync(transcriptPath)) {
      try {
        const stats = fs.statSync(transcriptPath);
        // Approximation: 1 token is roughly 3.5 bytes of JSON transcript
        used = Math.round(stats.size / 3.5);
      }

      case "liem_os__worktree_create": {
        const { branchName, targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = createWorktree(branchName, resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully created Git worktree at '${resolvedPath}' checking out branch '${branchName}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to create Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__worktree_cleanup": {
        const { targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = removeWorktree(resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully removed Git worktree at '${resolvedPath}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to clean up Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__council": {
        const { topic, members, mode = "debate" } = args;
        try {
          const agenda = prepareCouncil(topic, members, mode);
          const instructions = formatSummonsInstructions(agenda);
          return {
            content: [
              {
                type: "text",
                text: instructions + metrics
              }
            ]
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to summon Agent Council: ${e.message}${metrics}`
              }
            ],
            isError: true
          };
        }
      }

      case "liem_os__worktree_create": {
        const { branchName, targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = createWorktree(branchName, resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully created Git worktree at '${resolvedPath}' checking out branch '${branchName}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to create Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__worktree_cleanup": {
        const { targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = removeWorktree(resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully removed Git worktree at '${resolvedPath}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to clean up Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__council": {
        const { topic, members, mode = "debate" } = args;
        try {
          const agenda = prepareCouncil(topic, members, mode);
          const instructions = formatSummonsInstructions(agenda);
          return {
            content: [
              {
                type: "text",
                text: instructions + metrics
              }
            ]
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to summon Agent Council: ${e.message}${metrics}`
              }
            ],
            isError: true
          };
        }
      } catch (e) {
        used = 1000; // fallback estimate
      }
    }
  }

  // Cap at limit
  if (used > limit) used = limit;

  const pct = ((used / limit) * 100).toFixed(1);
  return `\n\n[CONTEXT_METRICS: ${used}/${limit} (${pct}%)]`;
}

// Instantiate server
const server = new Server(
  {
    name: "liem-os-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "liem_os__route",
        description: "Routes a natural language instruction or command to the correct domain agent in Liem OS.",
        inputSchema: {
          type: "object",
          properties: {
            instruction: {
              type: "string",
              description: "The plain language prompt or command to route.",
            },
          },
          required: ["instruction"],
        },
      },
      {
        name: "liem_os__scaffold",
        description: "Scaffolds a new project template modeled on the liem-monorepo workspace.",
        inputSchema: {
          type: "object",
          properties: {
            projectName: {
              type: "string",
              description: "The name of the new project.",
            },
            targetPath: {
              type: "string",
              description: "Absolute directory path where the project should be initialized.",
            },
            template: {
              type: "string",
              description: "The template type (e.g. 'monorepo', 'ecommerce', 'landing'). Default is 'monorepo'.",
            },
          },
          required: ["projectName", "targetPath"],
        },
      },
      {
        name: "liem_os__verify",
        description: "Runs static checks, audits rules, and manages the deterministic attempts counter.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute path to the target code file to audit.",
            },
            lintOutput: {
              type: "string",
              description: "Compiler or linter output for the file (optional).",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "liem_os__compact",
        description: "Manually triggers context metrics reporting and suggests compaction instructions.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "liem_os__update",
        description: "Performs dynamic upstream rule synchronization and compiles cursorrules.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "liem_os__self_learn",
        description: "Extracts and stages a learned pattern in the core/memory/scratch directory.",
        inputSchema: {
          type: "object",
          properties: {
            patternName: {
              type: "string",
              description: "Short snake_case name for the pattern."
            },
            description: {
              type: "string",
              description: "Brief description of the learned behavior."
            },
            rulesToStage: {
              type: "string",
              description: "Detailed Markdown/text rules to stage."
            }
          },
          required: ["patternName", "description", "rulesToStage"]
        }
      },
      {
        name: "liem_os__consolidate",
        description: "Promotes a staged pattern to approved memory or merges it directly into domain rules.",
        inputSchema: {
          type: "object",
          properties: {
            patternName: {
              type: "string",
              description: "The name of the pattern file to promote (without .json)."
            },
            targetDomain: {
              type: "string",
              description: "Target domain to merge to ('coding', 'writing', 'common', 'approved'). Default is 'approved'."
            }
          },
          required: ["patternName"]
        }
      },
      {
        name: "liem_os__worktree_create",
        description: "Spawns a new Git worktree for isolated parallel task execution.",
        inputSchema: {
          type: "object",
          properties: {
            branchName: {
              type: "string",
              description: "The Git branch name to create or switch to."
            },
            targetPath: {
              type: "string",
              description: "Absolute or relative directory path where the worktree should be placed."
            }
          },
          required: ["branchName", "targetPath"]
        }
      },
      {
        name: "liem_os__worktree_cleanup",
        description: "Cleans up and removes an existing Git worktree directory.",
        inputSchema: {
          type: "object",
          properties: {
            targetPath: {
              type: "string",
              description: "Absolute or relative directory path of the worktree to remove."
            }
          },
          required: ["targetPath"]
        }
      },
      {
        name: "liem_os__worktree_create",
        description: "Spawns a new Git worktree for isolated parallel task execution.",
        inputSchema: {
          type: "object",
          properties: {
            branchName: {
              type: "string",
              description: "The Git branch name to create or switch to."
            },
            targetPath: {
              type: "string",
              description: "Absolute or relative directory path where the worktree should be placed."
            }
          },
          required: ["branchName", "targetPath"]
        }
      },
      {
        name: "liem_os__worktree_cleanup",
        description: "Cleans up and removes an existing Git worktree directory.",
        inputSchema: {
          type: "object",
          properties: {
            targetPath: {
              type: "string",
              description: "Absolute or relative directory path of the worktree to remove."
            }
          },
          required: ["targetPath"]
        }
      },
      {
        name: "liem_os__council",
        description: "Summons a panel of AI agents to debate a topic and compile a synthesized consensus report.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "The technical question, architectural decision, or code block to debate."
            },
            members: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Optional list of agents to summon (e.g. ['architect', 'security', 'coder', 'auditor'])."
            },
            mode: {
              type: "string",
              description: "Debate mode. Default is 'debate'. Options: 'debate', 'one-shot'."
            }
          },
          required: ["topic"]
        }
      }
    ],
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const metrics = calculateContextMetrics();

  try {
    switch (name) {
      case "liem_os__route": {
        const { instruction } = args;
        const lower = instruction.toLowerCase();

        // 80% Deterministic Routing
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

        // Output format
        if (agent !== "axel") {
          return {
            content: [
              {
                type: "text",
                text: `ROUTE: ${agent} | SKILL: ${skill} | PARAMS: ${params}${metrics}`,
              },
            ],
          };
        }

        // 20% Fallback LLM Reasoning breakdown
        return {
          content: [
            {
              type: "text",
              text: `Axel Hybrid Reasoning:
The instruction "${instruction}" is mixed or requires a multi-step orchestration.
Recommended breakdown:
1. Delegate research to **researcher** if information is needed.
2. Delegate core coding changes to **coder**.
3. Delegate review to **auditor** before shipping.${metrics}`,
            },
          ],
        };
      }

      case "liem_os__worktree_create": {
        const { branchName, targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = createWorktree(branchName, resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully created Git worktree at '${resolvedPath}' checking out branch '${branchName}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to create Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__worktree_cleanup": {
        const { targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = removeWorktree(resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully removed Git worktree at '${resolvedPath}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to clean up Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__worktree_create": {
        const { branchName, targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = createWorktree(branchName, resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully created Git worktree at '${resolvedPath}' checking out branch '${branchName}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to create Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__worktree_cleanup": {
        const { targetPath } = args;
        const resolvedPath = path.isAbsolute(targetPath) 
          ? targetPath 
          : path.resolve(WORKSPACE_ROOT, targetPath);

        try {
          const result = removeWorktree(resolvedPath, WORKSPACE_ROOT);
          return {
            content: [
              {
                type: "text",
                text: `Successfully removed Git worktree at '${resolvedPath}'.\nOutput:\n${result}${metrics}`,
              },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to clean up Git worktree: ${e.message}${metrics}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "liem_os__scaffold": {
        const { projectName, targetPath, template = "monorepo" } = args;
        const normalizedTarget = path.resolve(targetPath);

        if (!fs.existsSync(normalizedTarget)) {
          fs.mkdirSync(normalizedTarget, { recursive: true });
        }

        // Resolve template source directory
        let templateSrc = "";
        const lowerTemplate = template.toLowerCase();

        if (lowerTemplate === "docs" || lowerTemplate === "docs-project") {
          templateSrc = path.join(LIEM_OS_DIR, "scaffolds/docs-project");
        } else if (lowerTemplate === "research" || lowerTemplate === "research-project") {
          templateSrc = path.join(LIEM_OS_DIR, "scaffolds/research-project");
        } else if (lowerTemplate === "content" || lowerTemplate === "content-project") {
          templateSrc = path.join(LIEM_OS_DIR, "scaffolds/content-project");
        } else {
          // Default to monorepo / fullstack-app
          const localScaffold = path.join(LIEM_OS_DIR, "scaffolds/fullstack-app");
          if (fs.existsSync(localScaffold)) {
            templateSrc = localScaffold;
          } else {
            templateSrc = path.join(WORKSPACE_ROOT, "liem-monorepo");
          }
        }

        if (!fs.existsSync(templateSrc)) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Reference template source at '${templateSrc}' not found.${metrics}`,
              },
            ],
            isError: true,
          };
        }

        // Recursive directory copy helper
        const copyDir = (src, dest) => {
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          const entries = fs.readdirSync(src, { withFileTypes: true });

          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            // Skip node_modules and .git
            if (entry.name === "node_modules" || entry.name === ".git") continue;

            if (entry.isDirectory()) {
              copyDir(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        };

        copyDir(templateSrc, normalizedTarget);

        // Customize project name in package.json if it exists
        const pkgJsonPath = path.join(normalizedTarget, "package.json");
        if (fs.existsSync(pkgJsonPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
            pkg.name = projectName;
            fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2), "utf8");
          } catch (e) {
            // Ignore custom naming errors
          }
        }

        return {
          content: [
            {
              type: "text",
              text: `Successfully scaffolded project '${projectName}' at '${normalizedTarget}' using '${template}' template.${metrics}`,
            },
          ],
        };
      }

      case "liem_os__verify": {
        const { filePath } = args;
        const normalizedPath = path.resolve(filePath);

        if (!fs.existsSync(normalizedPath)) {
          return {
            content: [
              {
                type: "text",
                text: `Error: File not found at '${normalizedPath}'.${metrics}`,
              },
            ],
            isError: true,
          };
        }

        const state = loadState();
        if (!state.attempts) state.attempts = {};

        const mtime = fs.statSync(normalizedPath).mtimeMs;
        const fileState = state.attempts[normalizedPath] || { count: 0, lastMtime: mtime };

        // State Desync Prevention: if modified time changed outside of this tool, reset counter
        if (mtime !== fileState.lastMtime) {
          fileState.count = 0;
          fileState.lastMtime = mtime;
        }

        // Increment attempt
        fileState.count += 1;
        state.attempts[normalizedPath] = fileState;
        saveState(state);

        // Run some basic validation checks
        const content = fs.readFileSync(normalizedPath, "utf8");
        const failures = [];

        // Check Law #1 (Monolithic functions - quick heuristic check)
        const functions = content.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>/g) || [];
        if (functions.length > 10 && content.length > 15000) {
          failures.push("Law #1 Violation: File might be too large/monolithic (functions > 10 & bytes > 15KB).");
        }

        // Check Law #2 (Hallucinated claims/comments)
        if (content.includes("120K+ users") || content.includes("120,000 users")) {
          failures.push("Law #2 Violation: Unverified marketing claim detected ('120K+ users').");
        }

        // Check Law #3 (Direct cross-import coupling between sibling directories in Liem OS)
        if (normalizedPath.includes("core/agents") && /import.*from.*(axel|auditor|coder|researcher|writer|strategist|operator)\.md/.test(content)) {
          failures.push("Law #3 Violation: Direct coupling between agent personas.");
        }

        // Check hardcoded credentials
        if (/(password|secret|api_key|token|private_key)\s*=\s*['"`][a-zA-Z0-9_\-]{8,}['"`]/i.test(content)) {
          failures.push("Security Check: Potential hardcoded secret or credential detected.");
        }

        // Check Academic & Research Markdown Rigor
        const ext = path.extname(normalizedPath).toLowerCase();
        if (ext === ".md") {
          const isResearch = normalizedPath.toLowerCase().includes("research") || 
                             normalizedPath.toLowerCase().includes("academic") || 
                             normalizedPath.toLowerCase().includes("synthesis") || 
                             normalizedPath.toLowerCase().includes("outline");
          if (isResearch) {
            const doiMatches = content.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi) || [];
            const urlMatches = content.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi) || [];
            
            const uniqueDois = [...new Set(doiMatches)];
            const uniqueUrls = [...new Set(urlMatches.map(u => u.toLowerCase()))];

            if (uniqueDois.length < 5 || uniqueUrls.length < 5) {
              failures.push(`Academic Rigor Violation: Research documentation must contain at least 5 verified journal/paper citations with clickable URLs and official DOIs. Found ${uniqueDois.length} unique DOIs and ${uniqueUrls.length} unique URLs.`);
            }
          }
        }

        // Hard Block check
        if (failures.length > 0) {
          if (fileState.count >= 2) {
            return {
              content: [
                {
                  type: "text",
                  text: `[AUDIT_FAILED: Maximum remediation attempts (2/2) reached. You must halt and ask the user for guidance.]\nFailures:\n- ${failures.join("\n- ")}${metrics}`,
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: `Audit failed (Attempt ${fileState.count}/2):\n- ${failures.join("\n- ")}\nPlease resolve these failures.${metrics}`,
              },
            ],
            isError: false, // allow agent to remediate once
          };
        }

        // Reset on success
        fileState.count = 0;
        state.attempts[normalizedPath] = fileState;
        saveState(state);

        return {
          content: [
            {
              type: "text",
              text: `Audit passed successfully for '${normalizedPath}' (Attempt ${fileState.count}/2 reset to 0/2).${metrics}`,
            },
          ],
        };
      }

      case "liem_os__compact": {
        const config = loadConfig();
        const limit = config.tokenLimit || 128000;
        let used = 0;

        if (config.appDataDir && config.conversationId) {
          const transcriptPath = path.join(
            config.appDataDir,
            "brain",
            config.conversationId,
            ".system_generated",
            "logs",
            "transcript.jsonl"
          );

          if (fs.existsSync(transcriptPath)) {
            try {
              const stats = fs.statSync(transcriptPath);
              used = Math.round(stats.size / 3.5);
            } catch (e) {
              used = 1000;
            }
          }
        }

        const pct = (used / limit) * 100;
        const msg = pct >= 80
          ? `WARNING: Context is at ${pct.toFixed(1)}% of limit (${used}/${limit}). Run context compaction rules or summarize the conversation history.`
          : `Context is in good status: ${pct.toFixed(1)}% of limit (${used}/${limit}).`;

        return {
          content: [
            {
              type: "text",
              text: `${msg}${metrics}`,
            },
          ],
        };
      }

      case "liem_os__update": {
        // Compile cursor rules from common rules and coding rules
        const commonRulesPath = path.join(LIEM_OS_DIR, "core/rules/common/rules.md");
        const codingRulesPath = path.join(LIEM_OS_DIR, "core/rules/coding/rules.md");
        let mergedRules = "# Compiled Cursor Rules for Liem OS\n\n";

        if (fs.existsSync(commonRulesPath)) {
          mergedRules += fs.readFileSync(commonRulesPath, "utf8") + "\n\n";
        }
        if (fs.existsSync(codingRulesPath)) {
          mergedRules += fs.readFileSync(codingRulesPath, "utf8") + "\n\n";
        }

        // Read all approved memories
        const memoryApprovedDir = path.join(LIEM_OS_DIR, "core/memory/approved");
        if (fs.existsSync(memoryApprovedDir)) {
          const files = fs.readdirSync(memoryApprovedDir);
          let memorySectionAdded = false;

          for (const file of files) {
            if (file.endsWith(".json")) {
              if (!memorySectionAdded) {
                mergedRules += "# Approved Self-Learned Rules\n\n";
                memorySectionAdded = true;
              }
              const approvedData = JSON.parse(fs.readFileSync(path.join(memoryApprovedDir, file), "utf8"));
              mergedRules += `## Pattern: ${approvedData.name}\nDescription: ${approvedData.description}\n\n${approvedData.rules}\n\n`;
            }
          }
        }

        const cursorRulesDest = path.join(WORKSPACE_ROOT, ".cursorrules");
        fs.writeFileSync(cursorRulesDest, mergedRules, "utf8");

        return {
          content: [
            {
              type: "text",
              text: `Upstream rules synchronized. Compiled new .cursorrules at '${cursorRulesDest}'.${metrics}`,
            },
          ],
        };
      }

      case "liem_os__self_learn": {
        const { patternName, description, rulesToStage } = args;
        const memoryScratchDir = path.join(LIEM_OS_DIR, "core/memory/scratch");
        
        if (!fs.existsSync(memoryScratchDir)) {
          fs.mkdirSync(memoryScratchDir, { recursive: true });
        }

        const cleanName = patternName.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
        const filePath = path.join(memoryScratchDir, `${cleanName}.json`);

        const patternData = {
          name: cleanName,
          description,
          rules: rulesToStage,
          stagedAt: new Date().toISOString(),
          status: "STAGED",
          requiresApproval: true
        };

        fs.writeFileSync(filePath, JSON.stringify(patternData, null, 2), "utf8");

        return {
          content: [
            {
              type: "text",
              text: `Successfully staged learning pattern '${cleanName}' at '${filePath}'. Run liem_os__consolidate to approve and apply it.${metrics}`,
            },
          ],
        };
      }

      case "liem_os__consolidate": {
        const { patternName, targetDomain = "approved" } = args;
        const memoryScratchDir = path.join(LIEM_OS_DIR, "core/memory/scratch");
        const memoryApprovedDir = path.join(LIEM_OS_DIR, "core/memory/approved");
        
        const cleanName = patternName.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
        const scratchPath = path.join(memoryScratchDir, `${cleanName}.json`);

        if (!fs.existsSync(scratchPath)) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Staged pattern '${cleanName}' not found in '${scratchPath}'.${metrics}`,
              },
            ],
            isError: true,
          };
        }

        const patternData = JSON.parse(fs.readFileSync(scratchPath, "utf8"));
        
        if (targetDomain === "approved") {
          // Promote to core/memory/approved
          if (!fs.existsSync(memoryApprovedDir)) {
            fs.mkdirSync(memoryApprovedDir, { recursive: true });
          }
          const approvedPath = path.join(memoryApprovedDir, `${cleanName}.json`);
          patternData.status = "APPROVED";
          patternData.requiresApproval = false;
          patternData.approvedAt = new Date().toISOString();
          
          fs.writeFileSync(approvedPath, JSON.stringify(patternData, null, 2), "utf8");
          // Remove from scratch
          fs.unlinkSync(scratchPath);
        } else {
          // Merge directly into domain rules file (e.g. coding, writing, common)
          const domainRulesPath = path.join(LIEM_OS_DIR, `core/rules/${targetDomain}/rules.md`);
          if (!fs.existsSync(domainRulesPath)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error: Target domain rules file not found at '${domainRulesPath}'.${metrics}`,
                },
              ],
              isError: true,
            };
          }

          // Append to Markdown
          let rulesContent = fs.readFileSync(domainRulesPath, "utf8");
          rulesContent += `\n\n## Staged Rule: ${patternData.description}\n${patternData.rules}\n`;
          fs.writeFileSync(domainRulesPath, rulesContent, "utf8");
          // Remove from scratch
          fs.unlinkSync(scratchPath);
        }

        // Trigger dynamic compilation of .cursorrules
        const commonRulesPath = path.join(LIEM_OS_DIR, "core/rules/common/rules.md");
        const codingRulesPath = path.join(LIEM_OS_DIR, "core/rules/coding/rules.md");
        let mergedRules = "# Compiled Cursor Rules for Liem OS\n\n";

        if (fs.existsSync(commonRulesPath)) {
          mergedRules += fs.readFileSync(commonRulesPath, "utf8") + "\n\n";
        }
        if (fs.existsSync(codingRulesPath)) {
          mergedRules += fs.readFileSync(codingRulesPath, "utf8") + "\n\n";
        }

        // Read all approved memories
        if (fs.existsSync(memoryApprovedDir)) {
          const files = fs.readdirSync(memoryApprovedDir);
          let memorySectionAdded = false;

          for (const file of files) {
            if (file.endsWith(".json")) {
              if (!memorySectionAdded) {
                mergedRules += "# Approved Self-Learned Rules\n\n";
                memorySectionAdded = true;
              }
              const approvedData = JSON.parse(fs.readFileSync(path.join(memoryApprovedDir, file), "utf8"));
              mergedRules += `## Pattern: ${approvedData.name}\nDescription: ${approvedData.description}\n\n${approvedData.rules}\n\n`;
            }
          }
        }

        const cursorRulesDest = path.join(WORKSPACE_ROOT, ".cursorrules");
        fs.writeFileSync(cursorRulesDest, mergedRules, "utf8");

        return {
          content: [
            {
              type: "text",
              text: `Successfully consolidated staged pattern '${cleanName}' to domain '${targetDomain}'. Compiled new .cursorrules.${metrics}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool '${name}': ${error.message}${metrics}`,
        },
      ],
      isError: true,
    };
  }
});

// Run server using Stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Liem OS MCP Server running on stdio");
