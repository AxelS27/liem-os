#!/usr/bin/env node

/**
 * @file Liem OS CLI Router
 * @purpose Routes CLI commands (init, scaffold, council, server) for developer workspaces.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "..");

function printBanner() {
  console.log("\x1b[32m==========================================\x1b[0m");
  console.log("\x1b[32m          Liem OS Command Center          \x1b[0m");
  console.log("\x1b[32m==========================================\x1b[0m");
}

function printUsage() {
  console.log("Usage: npx liem-os <command> [options]");
  console.log("\nCommands:");
  console.log("  init [--template <type>]    Set up Liem OS workspace, compile rules, and install MCP");
  console.log("  scaffold --name <n> --target <t> [--template <type>]   Deploy a template to a specific folder");
  console.log("  council --topic \"<t>\"       Summon the Agent Council debate engine");
  console.log("  server                      Start the MCP server stdio transport");
  console.log("  watchdog-recover            Automatically extract subagent transcripts and bypass harness hangs");
  console.log("  changelog                   Show the patch logs and version release history");
  console.log("  version                     Print the current local version and check for remote updates");
  console.log("\nOptions:");
  console.log("  --template <type>           monorepo (default) | docs | research | content");
}


// Recursive directory copy helper
function copyDir(src, dest) {
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
}

// Auto-register MCP server in Claude Desktop
function registerClaudeMCP(configPath, serverPath) {
  console.log(`Checking for Claude Desktop configuration at: ${configPath}`);
  let config = { mcpServers: {} };

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.log("Warning: Existing Claude Desktop config is invalid JSON. Overwriting...");
    }
  } else {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers["liem-os"] = {
    command: "node",
    args: [serverPath]
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    console.log("Successfully registered Liem OS MCP Server in Claude Desktop!");
  } catch (e) {
    console.log("Error: Failed to write Claude Desktop configuration:", e.message);
  }
}

// Auto-register MCP server in standard JSON configs (Cursor, Trae, Windsurf, Cline, Roo Code)
function registerJsonMCP(configPath, serverPath, name) {
  console.log(`Checking for ${name} configuration at: ${configPath}`);
  let config = { mcpServers: {} };

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.log(`Warning: Existing ${name} config is invalid JSON. Overwriting...`);
    }
  } else {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers["liem-os"] = {
    command: "node",
    args: [serverPath]
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    console.log(`Successfully registered Liem OS MCP Server in ${name}!`);
  } catch (e) {
    console.log(`Error: Failed to write ${name} configuration:`, e.message);
  }
}

// Auto-register MCP server in OpenCode
function registerOpenCodeMCP(configPath, serverPath) {
  console.log(`Checking for OpenCode configuration at: ${configPath}`);
  let config = {};

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.log("Warning: Existing OpenCode config is invalid JSON. Overwriting...");
    }
  }

  if (!config.mcp) config.mcp = {};

  config.mcp["liem-os"] = {
    type: "local",
    command: ["node", serverPath],
    enabled: true
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    console.log("Successfully registered Liem OS MCP Server in OpenCode!");
  } catch (e) {
    console.log("Error: Failed to write OpenCode configuration:", e.message);
  }
}

// Auto-register MCP server in Codex (TOML format)
function registerCodexMCP(configPath, serverPath) {
  console.log(`Checking for Codex configuration at: ${configPath}`);
  let content = "";

  if (fs.existsSync(configPath)) {
    try {
      content = fs.readFileSync(configPath, "utf8");
    } catch (e) {
      console.log("Warning: Failed to read Codex config. Overwriting...");
    }
  } else {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  const blockHeader = "[mcp_servers.liem-os]";
  const formattedServerPath = serverPath.replace(/\\/g, "\\\\"); // escape backslashes for TOML
  const mcpBlock = `${blockHeader}\ncommand = "node"\nargs = ["${formattedServerPath}"]\n`;

  if (content.includes(blockHeader)) {
    const regex = new RegExp(`\\s*\\[mcp_servers\\.liem-os\\][^\\s]*[^]*?(?=\\n\\[|$)`, "g");
    content = content.replace(regex, "");
    content = content.trim() + "\n\n" + mcpBlock;
  } else {
    content = content.trim() + "\n\n" + mcpBlock;
  }

  try {
    fs.writeFileSync(configPath, content.trim() + "\n", "utf8");
    console.log("Successfully registered Liem OS MCP Server in Codex!");
  } catch (e) {
    console.log("Error: Failed to write Codex configuration:", e.message);
  }
}

// Orchestrator: Register all detected coding agents (locally in the workspace)
function registerAllLocalMCP(serverPath, targetDir) {
  const home = os.homedir();
  const isWin = os.platform() === "win32";

  // 1. Claude Desktop (Global config pointing to local path, since Claude has no project-local config)
  const claudePath = isWin
    ? path.join(process.env.APPDATA || path.join(home, "AppData/Roaming"), "Claude", "claude_desktop_config.json")
    : path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  if (fs.existsSync(path.dirname(claudePath))) {
    registerClaudeMCP(claudePath, serverPath);
  }

  // 2. Local Cursor
  const cursorPath = path.join(targetDir, ".cursor", "mcp.json");
  registerJsonMCP(cursorPath, serverPath, "Cursor (Local)");

  // 3. Local Trae
  const traePath = path.join(targetDir, ".trae", "mcp.json");
  registerJsonMCP(traePath, serverPath, "Trae (Local)");

  // 4. Local OpenCode
  const openCodePath = path.join(targetDir, ".opencode.json");
  registerOpenCodeMCP(openCodePath, serverPath);

  // 5. Local Codex
  const codexPath = path.join(targetDir, ".codex", "config.toml");
  registerCodexMCP(codexPath, serverPath);
}

// Check for updates against GitHub
async function checkUpdates() {
  try {
    const pkgPath = path.join(PACKAGE_ROOT, "package.json");
    if (!fs.existsSync(pkgPath)) return;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const localVersion = pkg.version;
    const remoteUrl = "https://raw.githubusercontent.com/AxelS27/liem-os/main/Liem%20OS/package.json";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(remoteUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const remoteVersion = data.version;
      if (remoteVersion && remoteVersion !== localVersion) {
        console.log(`\n--- Update Available ---`);
        console.log(`A new version of Liem OS is available: v${remoteVersion} (Local: v${localVersion})`);
        console.log(`To update, run: npx github:AxelS27/liem-os init`);
        console.log(`-------------------------\n`);
      }
    }
  } catch (e) {
    // Silently ignore update check failures (offline, timeout, etc.)
  }
}

// Active check command with verbose status output
async function checkUpdatesCommand() {
  try {
    const pkgPath = path.join(PACKAGE_ROOT, "package.json");
    if (!fs.existsSync(pkgPath)) return;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const localVersion = pkg.version;
    const remoteUrl = "https://raw.githubusercontent.com/AxelS27/liem-os/main/Liem%20OS/package.json";

    console.log("Connecting to GitHub update registry...");
    const response = await fetch(remoteUrl);
    if (response.ok) {
      const data = await response.json();
      const remoteVersion = data.version;
      if (remoteVersion === localVersion) {
        console.log(`[SUCCESS] You are running the latest version of Liem OS (v${localVersion}). Up to date! 👍`);
      } else {
        console.log(`\n--- Update Available ---`);
        console.log(`A new version of Liem OS is available: v${remoteVersion} (Local: v${localVersion})`);
        console.log(`To update, run: npx github:AxelS27/liem-os init`);
        console.log(`-------------------------\n`);
      }
    } else {
      console.log("[WARNING] Unable to contact GitHub update registry.");
    }
  } catch (e) {
    console.log("[ERROR] Could not check for updates. Please check your internet connection.");
  }
}

// Execute core command router
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "-v" || command === "--version") {
    const pkgPath = path.join(PACKAGE_ROOT, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    console.log(`v${pkg.version}`);
    process.exit(0);
  }

  if (!command || command === "--help" || command === "-h") {
    printBanner();
    printUsage();
    process.exit(0);
  }

  // Parse key-value flags
  const flags = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i + 1] && !args[i + 1].startsWith("--")) {
      flags[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  switch (command) {
    case "init": {
      printBanner();
      const targetDir = process.cwd();
      console.log(`[INFO] Initializing Liem OS workspace in: ${targetDir}`);

      // 1. Establish local directory in the active workspace
      const localInstallDir = path.join(targetDir, "Liem OS");
      console.log(`\n[INFO] Installing Liem OS locally to: ${localInstallDir}`);
      
      // Ensure the directory exists and copy package contents
      if (!fs.existsSync(localInstallDir)) {
        fs.mkdirSync(localInstallDir, { recursive: true });
      }
      copyDir(PACKAGE_ROOT, localInstallDir);

      // Run npm/pnpm install in the local directory
      console.log("[INFO] Installing core dependencies in the local folder...");
      const usePnpm = (() => {
        try {
          execSync("pnpm --version", { stdio: "ignore" });
          return true;
        } catch (e) {
          return false;
        }
      })();
      const installCmd = usePnpm ? "pnpm install" : "npm install";
      try {
        execSync(installCmd, { cwd: localInstallDir, stdio: "inherit" });
      } catch (e) {
        console.warn("[WARNING] Dependency installation failed. You can run 'npm install' inside ./Liem OS/ manually.");
      }

      // 2. Copy agent rules folders (.agents, .claude) from localInstallDir to targetDir
      const agentsSrc = path.join(localInstallDir, "scaffolds/fullstack-app/.agents");
      const claudeSrc = path.join(localInstallDir, "scaffolds/fullstack-app/.claude");
      
      if (fs.existsSync(agentsSrc)) {
        console.log("[INFO] Deploying agent rules to .agents...");
        copyDir(agentsSrc, path.join(targetDir, ".agents"));
      }
      if (fs.existsSync(claudeSrc)) {
        console.log("[INFO] Deploying Claude rules to .claude...");
        copyDir(claudeSrc, path.join(targetDir, ".claude"));
      }

      // Copy entrypoint rule files (AGENTS.md, CLAUDE.md, GEMINI.md) to targetDir
      console.log("[INFO] Deploying entrypoint rule files to root...");
      const ruleFiles = ["AGENTS.md", "CLAUDE.md", "GEMINI.md"];
      for (const file of ruleFiles) {
        const srcFile = path.join(localInstallDir, file);
        const destFile = path.join(targetDir, file);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, destFile);
        }
      }

      // 3. Compile rules to .cursorrules
      console.log("[INFO] Compiling rules to .cursorrules...");
      const commonRulesPath = path.join(localInstallDir, "core/rules/common/rules.md");
      const codingRulesPath = path.join(localInstallDir, "core/rules/coding/rules.md");
      
      let mergedRules = "";
      if (fs.existsSync(commonRulesPath)) mergedRules += fs.readFileSync(commonRulesPath, "utf8") + "\n\n";
      if (fs.existsSync(codingRulesPath)) mergedRules += fs.readFileSync(codingRulesPath, "utf8") + "\n\n";
      
      fs.writeFileSync(path.join(targetDir, ".cursorrules"), mergedRules, "utf8");

      // 4. Create LIEM_OS.md workspace indicator
      console.log("[INFO] Creating LIEM_OS.md workspace indicator...");
      const liemOsMdContent = `# Liem OS Workspace Active

This project workspace is powered by Liem OS.

## Active Components
- **Rules Compiler**: Rules are managed in \`.agents/\` and compiled to \`.cursorrules\`.
- **MCP Server**: Registered locally at \`./Liem OS/core/mcp/server.mjs\`.
- **Agent Council**: Summonable via \`npx liem-os council --topic "<topic>"\`.

## Using Liem OS
Simply ask the Chief of Staff (Axel) directly in your AI editor (Cursor / Trae / Claude Desktop) chat window:
- *"Axel, please run agent council to debate..."*
- *"Axel, create a git worktree for my NLP experiment..."*
`;
      fs.writeFileSync(path.join(targetDir, "LIEM_OS.md"), liemOsMdContent, "utf8");

      // 5. Register MCP servers for all installed/detected agents (locally in the workspace)
      const mcpServerPath = path.join(localInstallDir, "core/mcp/server.mjs");
      registerAllLocalMCP(mcpServerPath, targetDir);

      console.log("\n\x1b[32m==========================================\x1b[0m");
      console.log("\x1b[32mLiem OS Workspace Setup Completed!        \x1b[0m");
      console.log("\x1b[32m==========================================\x1b[0m");
      console.log(`\nOpen this folder in your AI editor (Cursor / VS Code / Trae).`);
      console.log(`Antigravity / Gemini will automatically load the rules from the '.agents' folder.`);
      console.log(`Liem OS MCP server has been registered locally in this project.`);
      
      await checkUpdates();
      break;
    }

    case "scaffold": {
      const name = flags.name || flags.projectName;
      const target = flags.target || flags.targetPath;
      const template = flags.template || "monorepo";

      if (!name || !target) {
        console.error("[ERROR] Missing --name or --target parameters.");
        console.log("Usage: npx liem-os scaffold --name <project-name> --target <absolute-path>");
        process.exit(1);
      }

      const absoluteTarget = path.resolve(target);
      console.log(`[INFO] Deploying template '${template}' to '${absoluteTarget}'...`);

      const localInstallDir = path.join(process.cwd(), "Liem OS");
      const home = os.homedir();
      const globalInstallDir = path.join(home, ".liem-os");
      
      let baseDir = PACKAGE_ROOT;
      if (fs.existsSync(localInstallDir)) {
        baseDir = localInstallDir;
      } else if (fs.existsSync(globalInstallDir)) {
        baseDir = globalInstallDir;
      }

      let srcDir = "";
      if (template === "docs") {
        srcDir = path.join(baseDir, "scaffolds/docs-project");
      } else if (template === "research") {
        srcDir = path.join(baseDir, "scaffolds/research-project");
      } else if (template === "content") {
        srcDir = path.join(baseDir, "scaffolds/content-project");
      } else {
        srcDir = path.join(baseDir, "scaffolds/fullstack-app");
      }

      if (!fs.existsSync(srcDir)) {
        console.error(`[ERROR] Source template at '${srcDir}' not found.`);
        process.exit(1);
      }

      copyDir(srcDir, absoluteTarget);
      console.log(`[SUCCESS] Scaffolded project '${name}'!`);
      
      await checkUpdates();
      break;
    }

    case "council": {
      const topic = flags.topic;
      if (!topic) {
        console.error("[ERROR] Missing --topic parameter.");
        process.exit(1);
      }
      
      const runnerPath = path.join(PACKAGE_ROOT, "core/council/runner.js");
      try {
        execSync(`node "${runnerPath}" --topic "${topic}"`, { stdio: "inherit" });
      } catch (e) {
        console.error("[ERROR] Agent Council runner failed.");
        process.exit(1);
      }
      break;
    }

    case "server": {
      const serverPath = path.join(PACKAGE_ROOT, "core/mcp/server.mjs");
      console.log("[INFO] Starting Liem OS MCP Server on stdio...");
      try {
        execSync(`node "${serverPath}"`, { stdio: "inherit" });
      } catch (e) {
        console.error("[ERROR] MCP Server stopped.");
        process.exit(1);
      }
      break;
    }

    case "watchdog-recover": {
      printBanner();
      console.log("[INFO] Running Liem OS Watchdog Recovery...");
      
      const configPath = path.join(process.cwd(), "Liem OS", ".liem_os_config.json");
      if (!fs.existsSync(configPath)) {
        console.error("[ERROR] Liem OS configuration file not found at ./Liem OS/.liem_os_config.json. Please run init first.");
        process.exit(1);
      }

      let config;
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (e) {
        console.error("[ERROR] Failed to parse .liem_os_config.json:", e.message);
        process.exit(1);
      }

      const { appDataDir, conversationId } = config;
      if (!appDataDir) {
        console.error("[ERROR] appDataDir is not defined in .liem_os_config.json");
        process.exit(1);
      }

      const brainDir = path.join(appDataDir, "brain");
      if (!fs.existsSync(brainDir)) {
        console.error(`[ERROR] Brain directory not found at: ${brainDir}`);
        process.exit(1);
      }

      console.log(`[INFO] Scanning for active subagent sessions in brain directory...`);
      const now = Date.now();
      const files = fs.readdirSync(brainDir);
      const activeSessions = [];

      for (const file of files) {
        const fullPath = path.join(brainDir, file);
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            const diffSeconds = (now - stats.mtimeMs) / 1000;
            if (diffSeconds <= 300 && file !== conversationId) {
              const transcriptPath = path.join(fullPath, ".system_generated", "logs", "transcript.jsonl");
              if (fs.existsSync(transcriptPath)) {
                activeSessions.push({
                  id: file,
                  mtimeMs: stats.mtimeMs,
                  diffSeconds,
                  transcriptPath
                });
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (activeSessions.length === 0) {
        console.log("[INFO] No active subagent sessions found in the last 5 minutes.");
        break;
      }

      activeSessions.sort((a, b) => b.mtimeMs - a.mtimeMs);
      console.log(`\nFound ${activeSessions.length} active subagent session(s):\n`);

      for (const session of activeSessions) {
        console.log(`--------------------------------------------------`);
        console.log(`Session ID: ${session.id} (Active ${Math.round(session.diffSeconds)}s ago)`);
        console.log(`Transcript: ${session.transcriptPath}`);
        console.log(`--------------------------------------------------`);
        
        try {
          const lines = fs.readFileSync(session.transcriptPath, "utf8").trim().split("\n");
          if (lines.length === 0 || lines[0] === "") {
            console.log("[Empty Transcript]");
            continue;
          }

          let lastResponse = null;

          for (const line of lines) {
            try {
              const step = JSON.parse(line);
              if (step.type === "PLANNER_RESPONSE" && step.content) {
                lastResponse = step.content;
              }
            } catch (e) {
              // ignore
            }
          }

          if (lastResponse) {
            console.log("\n[Last Agent Response]:");
            console.log(lastResponse);
          } else {
            console.log("\n[No completed response found yet inside transcript logs]");
          }
        } catch (e) {
          console.error(`[ERROR] Failed to read transcript for session ${session.id}:`, e.message);
        }
      }
      break;
    }

    case "version": {
      printBanner();
      const pkgPath = path.join(PACKAGE_ROOT, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      console.log(`Liem OS Local Version: v${pkg.version}`);
      console.log("\nChecking for updates...");
      await checkUpdatesCommand();
      break;
    }

    case "changelog": {
      printBanner();
      const changelogPath = path.join(PACKAGE_ROOT, "CHANGELOG.md");
      if (fs.existsSync(changelogPath)) {
        const content = fs.readFileSync(changelogPath, "utf8");
        console.log(content);
      } else {
        console.log("Changelog file not found.");
      }
      break;
    }

    default: {
      console.error(`[ERROR] Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error("[ERROR] Uncaught exception:", err);
  process.exit(1);
});
