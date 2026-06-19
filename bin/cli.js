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

// Orchestrator: Register all detected coding agents
function registerAllInstalledMCP(serverPath, targetDir) {
  const home = os.homedir();
  const isWin = os.platform() === "win32";

  // 1. Claude Desktop
  const claudePath = isWin
    ? path.join(process.env.APPDATA || path.join(home, "AppData/Roaming"), "Claude", "claude_desktop_config.json")
    : path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  if (fs.existsSync(path.dirname(claudePath))) {
    registerClaudeMCP(claudePath, serverPath);
  }

  // 2. Cursor Global
  const cursorGlobalPath = path.join(home, ".cursor", "mcp.json");
  if (fs.existsSync(path.dirname(cursorGlobalPath))) {
    registerJsonMCP(cursorGlobalPath, serverPath, "Cursor");
  }

  // 3. Trae Global
  const traeGlobalPath = path.join(home, ".trae", "mcp.json");
  if (fs.existsSync(path.dirname(traeGlobalPath))) {
    registerJsonMCP(traeGlobalPath, serverPath, "Trae");
  }

  // 4. Windsurf Global
  const windsurfGlobalPath = path.join(home, ".codeium", "windsurf", "mcp_config.json");
  if (fs.existsSync(path.dirname(windsurfGlobalPath))) {
    registerJsonMCP(windsurfGlobalPath, serverPath, "Windsurf");
  }

  // 5. OpenCode Global
  const openCodeGlobalPath = path.join(home, ".opencode.json");
  if (fs.existsSync(openCodeGlobalPath) || fs.existsSync(path.join(home, ".config", "opencode")) || fs.existsSync(path.join(home, ".opencode"))) {
    registerOpenCodeMCP(openCodeGlobalPath, serverPath);
  }

  // 6. Codex Global
  const codexGlobalPath = path.join(home, ".codex", "config.toml");
  if (fs.existsSync(path.dirname(codexGlobalPath))) {
    registerCodexMCP(codexGlobalPath, serverPath);
  }

  // 7. VS Code Cline/Roo Code Global
  const codeGlobalDir = (() => {
    if (isWin) {
      return path.join(process.env.APPDATA || path.join(home, "AppData/Roaming"), "Code", "User", "globalStorage");
    }
    if (os.platform() === "darwin") {
      return path.join(home, "Library", "Application Support", "Code", "User", "globalStorage");
    }
    return path.join(home, ".config", "Code", "User", "globalStorage");
  })();

  if (fs.existsSync(codeGlobalDir)) {
    const clinePath = path.join(codeGlobalDir, "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
    if (fs.existsSync(path.dirname(clinePath))) {
      registerJsonMCP(clinePath, serverPath, "VS Code Cline");
    }
    const rooPath = path.join(codeGlobalDir, "roodevhops.roo-cline", "settings", "cline_mcp_settings.json");
    if (fs.existsSync(path.dirname(rooPath))) {
      registerJsonMCP(rooPath, serverPath, "VS Code Roo Code");
    }
  }

  // Local Project configurations
  if (targetDir) {
    const cursorLocalPath = path.join(targetDir, ".cursor", "mcp.json");
    if (fs.existsSync(path.dirname(cursorLocalPath))) {
      registerJsonMCP(cursorLocalPath, serverPath, "Local Cursor");
    }

    const traeLocalPath = path.join(targetDir, ".trae", "mcp.json");
    if (fs.existsSync(path.dirname(traeLocalPath))) {
      registerJsonMCP(traeLocalPath, serverPath, "Local Trae");
    }

    const codexLocalPath = path.join(targetDir, ".codex", "config.toml");
    if (fs.existsSync(path.dirname(codexLocalPath))) {
      registerCodexMCP(codexLocalPath, serverPath);
    }
  }
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

// Execute core command router
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

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
      const template = flags.template || "monorepo";
      console.log(`[INFO] Initializing Liem OS workspace in: ${targetDir}`);
      console.log(`[INFO] Using template: ${template}`);

      // 1. Establish permanent global directory
      const home = os.homedir();
      const globalInstallDir = path.join(home, ".liem-os");
      console.log(`\n[INFO] Installing Liem OS permanently to: ${globalInstallDir}`);
      
      // Ensure the directory exists and copy package contents
      if (!fs.existsSync(globalInstallDir)) {
        fs.mkdirSync(globalInstallDir, { recursive: true });
      }
      copyDir(PACKAGE_ROOT, globalInstallDir);

      // Run npm/pnpm install in the permanent directory
      console.log("[INFO] Installing core dependencies in the permanent folder...");
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
        execSync(installCmd, { cwd: globalInstallDir, stdio: "inherit" });
      } catch (e) {
        console.warn("[WARNING] Dependency installation failed. You can run 'npm install' inside ~/.liem-os/ manually.");
      }

      // 2. Resolve source template path
      let srcDir = "";
      if (template === "docs") {
        srcDir = path.join(globalInstallDir, "scaffolds/docs-project");
      } else if (template === "research") {
        srcDir = path.join(globalInstallDir, "scaffolds/research-project");
      } else if (template === "content") {
        srcDir = path.join(globalInstallDir, "scaffolds/content-project");
      } else {
        srcDir = path.join(globalInstallDir, "scaffolds/fullstack-app");
      }

      if (!fs.existsSync(srcDir)) {
        console.error(`[ERROR] Source template at '${srcDir}' not found.`);
        process.exit(1);
      }

      // 3. Scaffold files to current directory
      console.log("[INFO] Scaffolding files into target workspace...");
      copyDir(srcDir, targetDir);

      // 4. Compile rules to .cursorrules
      console.log("[INFO] Compiling rules to .cursorrules...");
      const commonRulesPath = path.join(globalInstallDir, "core/rules/common/rules.md");
      const codingRulesPath = path.join(globalInstallDir, "core/rules/coding/rules.md");
      
      let mergedRules = "";
      if (fs.existsSync(commonRulesPath)) mergedRules += fs.readFileSync(commonRulesPath, "utf8") + "\n\n";
      if (fs.existsSync(codingRulesPath)) mergedRules += fs.readFileSync(codingRulesPath, "utf8") + "\n\n";
      
      fs.writeFileSync(path.join(targetDir, ".cursorrules"), mergedRules, "utf8");

      // 5. Register MCP servers for all installed/detected agents
      const mcpServerPath = path.join(globalInstallDir, "core/mcp/server.mjs");
      registerAllInstalledMCP(mcpServerPath, targetDir);

      console.log("\n\x1b[32m==========================================\x1b[0m");
      console.log("\x1b[32mLiem OS Workspace Setup Completed!        \x1b[0m");
      console.log("\x1b[32m==========================================\x1b[0m");
      console.log(`\nOpen this folder in your AI editor (Cursor / VS Code / Trae).`);
      console.log(`Antigravity / Gemini will automatically load the rules from the '.agents' folder.`);
      console.log(`Liem OS MCP server has been registered in all detected coding agents.`);
      
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

      const home = os.homedir();
      const globalInstallDir = path.join(home, ".liem-os");
      const baseDir = fs.existsSync(globalInstallDir) ? globalInstallDir : PACKAGE_ROOT;

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
