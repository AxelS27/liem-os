#!/usr/bin/env node

/**
 * @file Liem OS CLI Router
 * @purpose Routes CLI commands (init, scaffold, council, server, research-*) for developer workspaces.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";
import { runAudit } from "../core/mcp/verifier.mjs";

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
  console.log("  update                      Actively check for updates and auto-update the workspace");
  console.log("  verify --file <p>           Audit a single file against Liem OS Quality Gates");
  console.log("  verify --all                Audit all modified/untracked Git files in the workspace");
  console.log("");
  console.log("\x1b[36m--- Research Engine (v0.2.0) ---\x1b[0m");
  console.log("  research-audit --file <p>   Severity-based paper linter (FAIL/WARN/INFO) with fix suggestions");
  console.log("  research-init --tasks <t>   Deploy composable research task modules (comma-separated)");
  console.log("  research-test [--target <d>] Run all test_*.py scripts, validate artifacts");
  console.log("  research-lock [--verify]    Generate or verify reproducibility lockfile (research.lock)");
  console.log("  env install                 Bootstrap Python environment from deployed task manifests");
  console.log("");
  console.log("  Available tasks:");
  console.log("    ablation, latency-decomposition, batch-scaling, error-analysis, energy-estimate");
  console.log("    descriptive-stats, correlation-matrix, significance-test, topic-modeling");
  console.log("    trend-analysis, generate-data");
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

// Active check command with verbose status output and auto-update
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
        console.log(`[INFO] Automatically updating Liem OS to v${remoteVersion}...`);
        console.log(`-------------------------\n`);
        
        try {
          execSync("npx -y github:AxelS27/liem-os init", { stdio: "inherit" });
          console.log(`\n[SUCCESS] Liem OS has been successfully updated to v${remoteVersion}! 🎉`);
        } catch (err) {
          console.error(`[ERROR] Auto-update failed: ${err.message}`);
          console.log(`Please run manually: npx github:AxelS27/liem-os init`);
        }
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
      const rulesRootDir = path.join(localInstallDir, "core/rules");
      let mergedRules = "";
      if (fs.existsSync(rulesRootDir)) {
        const categories = fs.readdirSync(rulesRootDir).sort((a, b) => {
          if (a === "common") return -1;
          if (b === "common") return 1;
          if (a === "coding") return -1;
          if (b === "coding") return 1;
          return a.localeCompare(b);
        });
        for (const cat of categories) {
          const ruleFilePath = path.join(rulesRootDir, cat, "rules.md");
          if (fs.existsSync(ruleFilePath)) {
            console.log(`  - Including rules: ${cat}`);
            mergedRules += fs.readFileSync(ruleFilePath, "utf8") + "\n\n";
          }
        }
      }
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

      // 6. Install Token Optimizers automatically
      console.log("\n[INFO] Checking system pre-requisites and installing recommended Token Optimizers...");

      const home = os.homedir();
      const isWin = os.platform() === "win32";

      // A. Check and Auto-Install UV
      let uvCmd = "uv";
      let hasUv = false;
      try {
        execSync("uv --version", { stdio: "ignore" });
        hasUv = true;
      } catch {
        // Not in path, check default install location
        const defaultUvPath = isWin
          ? path.join(home, ".local", "bin", "uv.exe")
          : path.join(home, ".local", "bin", "uv");
        if (fs.existsSync(defaultUvPath)) {
          uvCmd = `"${defaultUvPath}"`;
          hasUv = true;
        }
      }

      if (!hasUv) {
        console.log("[INFO] uv not found. Installing uv automatically...");
        try {
          if (isWin) {
            execSync('powershell -ExecutionPolicy Bypass -c "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://astral.sh/uv/install.ps1 | iex"', { stdio: "inherit" });
          } else {
            execSync("curl -LsSf https://astral.sh/uv/install.sh | sh", { stdio: "inherit" });
          }
          const defaultUvPath = isWin
            ? path.join(home, ".local", "bin", "uv.exe")
            : path.join(home, ".local", "bin", "uv");
          if (fs.existsSync(defaultUvPath)) {
            uvCmd = `"${defaultUvPath}"`;
            hasUv = true;
            console.log("[SUCCESS] uv installed successfully!");
          }
        } catch (err) {
          console.warn("[WARNING] Failed to install uv automatically: " + err.message);
        }
      }

      // B. Ensure Python is available (prefer user's active python, fallback to 3.12.10 via UV if missing)
      let pythonVersionToUse = "3.12.10";
      let hasSystemPython = false;
      try {
        const sysPyVer = execSync("python --version", { encoding: "utf8" }).trim();
        hasSystemPython = true;
        console.log(`[INFO] System Python detected: ${sysPyVer}`);
      } catch {
        try {
          const sysPyVer3 = execSync("python3 --version", { encoding: "utf8" }).trim();
          hasSystemPython = true;
          console.log(`[INFO] System Python detected: ${sysPyVer3}`);
        } catch {
          // No system python found
        }
      }

      if (!hasSystemPython && hasUv) {
        console.log(`[INFO] No system Python found. Installing Python ${pythonVersionToUse} via uv...`);
        try {
          execSync(`${uvCmd} python install ${pythonVersionToUse}`, { stdio: "inherit" });
          console.log(`[SUCCESS] Python ${pythonVersionToUse} is ready!`);
        } catch (err) {
          console.warn(`[WARNING] uv failed to install Python ${pythonVersionToUse}. Falling back to default Python.`);
        }
      }

      // B.5. Set up virtual environment (.venv) locally in the workspace
      console.log("\n[INFO] Setting up project-local virtual environment (.venv)...");
      const venvPath = path.join(targetDir, ".venv");
      let hasVenv = fs.existsSync(venvPath);

      if (!hasVenv) {
        try {
          if (hasUv) {
            const pythonVersionFlag = hasSystemPython ? "" : `--python ${pythonVersionToUse}`;
            execSync(`${uvCmd} venv ${pythonVersionFlag}`, { stdio: "inherit" });
          } else {
            const pyCmd = isWin ? "python" : "python3";
            execSync(`${pyCmd} -m venv .venv`, { stdio: "inherit" });
          }
          hasVenv = true;
          console.log("[SUCCESS] .venv created successfully!");
        } catch (err) {
          console.warn("[WARNING] Failed to create virtual environment (.venv): " + err.message);
        }
      } else {
        console.log("[INFO] Existing .venv detected.");
      }

      // B.6. Install required tools inside the local .venv (e.g. markitdown)
      if (hasVenv) {
        console.log("[INFO] Installing required tools (markitdown) inside .venv...");
        try {
          if (hasUv) {
            execSync(`${uvCmd} pip install markitdown`, { stdio: "inherit" });
          } else {
            const pipPath = isWin
              ? path.join(venvPath, "Scripts", "pip.exe")
              : path.join(venvPath, "bin", "pip");
            execSync(`"${pipPath}" install markitdown`, { stdio: "inherit" });
          }
          console.log("[SUCCESS] markitdown installed inside .venv!");
        } catch (err) {
          console.warn("[WARNING] Failed to install markitdown in .venv: " + err.message);
        }
      }

      // C. Install code-review-graph (user global/tool space)
      console.log("[INFO] Installing code-review-graph...");
      try {
        if (hasUv) {
          // Use uv tool install. If system python was found, let uv manage it automatically. If not, use 3.12.10.
          const pythonFlag = hasSystemPython ? "" : `--python ${pythonVersionToUse}`;
          execSync(`${uvCmd} tool install ${pythonFlag} code-review-graph`, { stdio: "inherit" });
        } else {
          execSync("pip install --user code-review-graph", { stdio: "inherit" });
        }
        console.log("[SUCCESS] code-review-graph installed!");
      } catch (err) {
        // Fallback for tool install if 3.12.10 pin failed
        if (hasUv && err.message.includes(pythonVersionToUse)) {
          try {
            execSync(`${uvCmd} tool install code-review-graph`, { stdio: "inherit" });
            console.log("[SUCCESS] code-review-graph installed!");
          } catch (e2) {
            console.warn("[WARNING] Failed to install code-review-graph: " + e2.message);
          }
        } else {
          console.warn("[WARNING] Failed to install code-review-graph: " + err.message);
        }
      }

      // D. Install token-optimizer (local)
      console.log("[INFO] Installing token-optimizer...");
      try {
        if (usePnpm) {
          execSync("pnpm add -D token-optimizer", { stdio: "inherit" });
        } else {
          execSync("npm install --save-dev token-optimizer", { stdio: "inherit" });
        }
        console.log("[SUCCESS] token-optimizer installed!");
      } catch (err) {
        console.warn("[WARNING] Failed to install token-optimizer automatically: " + err.message);
      }

      // E. Check and Auto-Install Rust/Cargo
      let cargoCmd = "cargo";
      let hasCargo = false;
      try {
        execSync("cargo --version", { stdio: "ignore" });
        hasCargo = true;
      } catch {
        const defaultCargoPath = isWin
          ? path.join(home, ".cargo", "bin", "cargo.exe")
          : path.join(home, ".cargo", "bin", "cargo");
        if (fs.existsSync(defaultCargoPath)) {
          cargoCmd = `"${defaultCargoPath}"`;
          hasCargo = true;
        }
      }

      if (!hasCargo) {
        console.log("[INFO] Rust/Cargo not found. Installing Rustup silently...");
        try {
          if (isWin) {
            execSync('powershell -ExecutionPolicy Bypass -c "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile(\'https://win.rustup.rs/x86_64\', \'rustup-init.exe\'); Start-Process -FilePath \'./rustup-init.exe\' -ArgumentList \'-y --default-toolchain stable\' -NoNewWindow -Wait; Remove-Item \'./rustup-init.exe\'"', { stdio: "inherit" });
          } else {
            execSync("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", { stdio: "inherit" });
          }
          const defaultCargoPath = isWin
            ? path.join(home, ".cargo", "bin", "cargo.exe")
            : path.join(home, ".cargo", "bin", "cargo");
          if (fs.existsSync(defaultCargoPath)) {
            cargoCmd = `"${defaultCargoPath}"`;
            hasCargo = true;
            console.log("[SUCCESS] Rust/Cargo installed successfully!");
          }
        } catch (err) {
          console.warn("[WARNING] Failed to install Rust/Cargo automatically: " + err.message);
        }
      }

      // F. Install RTK (global Cargo)
      console.log("[INFO] Installing RTK (Rust Token Killer) globally...");
      if (hasCargo) {
        try {
          execSync(`${cargoCmd} install rtk`, { stdio: "inherit" });
          console.log("[SUCCESS] RTK installed globally!");
        } catch (err) {
          console.warn("[WARNING] Failed to install RTK globally: " + err.message);
        }
      } else {
        console.warn("[WARNING] Cargo not found. Skipping global RTK installation.");
      }

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

    case "update":
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

    case "verify": {
      printBanner();
      const fileArg = flags.file;
      const allArg = flags.all || args.includes("--all");

      if (!fileArg && !allArg) {
        console.error("[ERROR] Missing parameters. Please specify --file <path> or --all.");
        console.log("Usage:");
        console.log("  npx liem-os verify --file <path-to-file>");
        console.log("  npx liem-os verify --all");
        process.exit(1);
      }

      const filesToAudit = [];

      if (fileArg) {
        const absPath = path.resolve(fileArg);
        if (!fs.existsSync(absPath)) {
          console.error(`[ERROR] File not found: ${absPath}`);
          process.exit(1);
        }
        filesToAudit.push(absPath);
      } else if (allArg) {
        console.log("[INFO] Scanning for modified or untracked files in Git...");
        try {
          const statusOutput = execSync("git status --porcelain", { encoding: "utf8" });
          const lines = statusOutput.trim().split("\n");
          
          for (const line of lines) {
            if (!line) continue;
            const filePath = line.substring(3).trim();
            const absPath = path.resolve(filePath);
            if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
              filesToAudit.push(absPath);
            }
          }
        } catch (err) {
          console.error("[ERROR] Failed to run git status. Is this a Git repository?");
          process.exit(1);
        }
      }

      if (filesToAudit.length === 0) {
        console.log("[SUCCESS] No files to verify.");
        process.exit(0);
      }

      console.log(`[INFO] Auditing ${filesToAudit.length} file(s) against Liem OS Quality Gates...\n`);
      let totalFailures = 0;

      for (const file of filesToAudit) {
        const relativeName = path.relative(process.cwd(), file);
        try {
          const content = fs.readFileSync(file, "utf8");
          const failures = runAudit(content, file);
          
          if (failures.length === 0) {
            console.log(`\x1b[32m[PASS]\x1b[0m ${relativeName}`);
          } else {
            console.log(`\x1b[31m[FAIL]\x1b[0m ${relativeName}`);
            failures.forEach(f => console.log(`  - \x1b[33m${f}\x1b[0m`));
            totalFailures += failures.length;
          }
        } catch (e) {
          console.error(`\x1b[31m[ERROR]\x1b[0m Failed to audit ${relativeName}: ${e.message}`);
          totalFailures += 1;
        }
      }

      console.log(`\n==========================================`);
      if (totalFailures === 0) {
        console.log(`\x1b[32m[VERDICT] All audits passed successfully! (GO) \x1b[0m`);
        process.exit(0);
      } else {
        console.log(`\x1b[31m[VERDICT] Quality Gate failed with ${totalFailures} error(s). (NO-GO) \x1b[0m`);
        process.exit(1);
      }
    }

    // ─── research-audit ───────────────────────────────────────────────────────
    case "research-audit": {
      printBanner();
      const fileArg = flags.file;
      if (!fileArg) {
        console.error("[ERROR] Missing --file <path>. Usage: npx liem-os research-audit --file paper.md");
        process.exit(1);
      }
      const absFile = path.resolve(fileArg);
      if (!fs.existsSync(absFile)) {
        console.error(`[ERROR] File not found: ${absFile}`);
        process.exit(1);
      }

      const auditModPath = path.join(PACKAGE_ROOT, "core/research/audit/audit.mjs");
      if (!fs.existsSync(auditModPath)) {
        console.error("[ERROR] Research audit module not found. Is Liem OS v0.2.0 installed correctly?");
        process.exit(1);
      }

      const { runResearchAudit } = await import(pathToFileURL(auditModPath).href);
      const content = fs.readFileSync(absFile, "utf8");
      const results = await runResearchAudit(content, absFile);

      const COLORS = { FAIL: "\x1b[31m", WARN: "\x1b[33m", INFO: "\x1b[36m" };
      const RESET = "\x1b[0m";

      let fails = 0, warns = 0, infos = 0;
      for (const r of results) {
        const col = COLORS[r.severity] || "";
        console.log(`${col}[${r.severity}]${RESET} ${r.id.padEnd(24)} ${r.message}`);
        if (r.suggestion) {
          console.log(`         ${"\x1b[90m"}→ ${r.suggestion}${RESET}`);
        }
        if (r.severity === "FAIL") fails++;
        else if (r.severity === "WARN") warns++;
        else infos++;
      }

      console.log(`\n${"=".repeat(50)}`);
      console.log(`VERDICT: ${fails > 0 ? "\x1b[31m" : "\x1b[32m"}${fails} FAIL${RESET}  ${warns} WARN  ${infos} INFO`);
      if (fails > 0) {
        console.log("\x1b[31mPaper has critical issues. Fix FAILs before submission.\x1b[0m");
      } else if (warns > 0) {
        console.log("\x1b[33mPaper is close. Address WARNs to strengthen contribution.\x1b[0m");
      } else {
        console.log("\x1b[32mPaper passes all research quality checks!\x1b[0m");
      }
      process.exit(fails > 0 ? 1 : 0);
    }

    // ─── research-init ────────────────────────────────────────────────────────
    case "research-init": {
      printBanner();
      const tasksArg = flags.tasks;
      const targetArg = flags.target || ".";
      if (!tasksArg) {
        console.error("[ERROR] Missing --tasks. Usage: npx liem-os research-init --tasks ablation,significance-test");
        console.log("Available tasks: ablation, latency-decomposition, batch-scaling, error-analysis, energy-estimate,");
        console.log("                 descriptive-stats, correlation-matrix, significance-test, topic-modeling, trend-analysis, generate-data");
        process.exit(1);
      }

      const requestedTasks = tasksArg.split(",").map(t => t.trim());
      const researchTasksDir = path.join(PACKAGE_ROOT, "core/research/tasks");
      const targetDir = path.resolve(targetArg);

      // Resolve depends_on chain (simple one-level expansion)
      const allTasksToInstall = new Set();
      for (const task of requestedTasks) {
        allTasksToInstall.add(task);
        const manifestPath = path.join(researchTasksDir, task, "task.manifest.yaml");
        if (fs.existsSync(manifestPath)) {
          const manifest = fs.readFileSync(manifestPath, "utf8");
          const depMatches = manifest.match(/depends_on:[^\n]*\n((?:\s+-\s+[^\n]+\n)*)/m);
          if (depMatches) {
            const deps = depMatches[1].match(/-\s+([^\n]+)/g) || [];
            for (const d of deps) allTasksToInstall.add(d.replace(/^-\s+/, "").trim());
          }
        }
      }

      console.log(`[INFO] Installing ${allTasksToInstall.size} task(s) to: ${targetDir}\n`);
      for (const task of allTasksToInstall) {
        const srcTask = path.join(researchTasksDir, task);
        const destTask = path.join(targetDir, task);
        if (!fs.existsSync(srcTask)) {
          console.log(`\x1b[31m[NOT FOUND]\x1b[0m ${task} — task not available in this version`);
          continue;
        }
        copyDir(srcTask, destTask);
        const indicator = requestedTasks.includes(task) ? "" : " (dependency)";
        console.log(`\x1b[32m[OK]\x1b[0m ${task}${indicator}`);
      }

      console.log(`\n\x1b[32mDone! Task specifications deployed.\x1b[0m`);
      console.log(`Instructions for each task are in their respective INSTRUCTIONS.md files.`);
      console.log(`Please ask your AI coding assistant to implement the research scripts and tests.`);
      console.log(`Once implemented, run your test verification:`);
      console.log(`  npx liem-os research-test`);
      break;
    }

    // ─── research-test ───────────────────────────────────────────────────────
    case "research-test": {
      printBanner();
      const testTarget = path.resolve(flags.target || ".");
      console.log(`[INFO] Discovering test_*.py scripts in: ${testTarget}\n`);

      const pythonCmd = (() => {
        for (const cmd of ["python3", "python"]) {
          try { execSync(`${cmd} --version`, { stdio: "ignore" }); return cmd; } catch { /* */ }
        }
        return "python";
      })();

      // Discover all test_*.py recursively (up to 2 levels)
      const testFiles = [];
      const scanDir = (dir, depth = 0) => {
        if (depth > 2 || !fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) scanDir(path.join(dir, entry.name), depth + 1);
          else if (entry.name.startsWith("test_") && entry.name.endsWith(".py")) {
            testFiles.push(path.join(dir, entry.name));
          }
        }
      };
      scanDir(testTarget);

      if (testFiles.length === 0) {
        console.log("[INFO] No test_*.py files found. Run: npx liem-os research-init --tasks <tasks>");
        process.exit(0);
      }

      console.log(`Found ${testFiles.length} test script(s).\n`);
      let passed = 0, failed = 0;

      for (const testFile of testFiles) {
        const relName = path.relative(testTarget, testFile);
        console.log(`\x1b[36m[RUNNING]\x1b[0m ${relName}`);
        const result = spawnSync(pythonCmd, [testFile], {
          cwd: path.dirname(testFile),
          encoding: "utf8",
          stdio: "pipe",
        });
        if (result.status === 0) {
          const outputLines = (result.stdout || "").split("\n").filter(l => l.trim());
          outputLines.forEach(l => console.log(`  ${l}`));
          console.log(`\x1b[32m  PASSED\x1b[0m\n`);
          passed++;
        } else {
          const errLines = (result.stderr || result.stdout || "").split("\n").slice(0, 5);
          errLines.forEach(l => console.log(`  \x1b[31m${l}\x1b[0m`));
          console.log(`\x1b[31m  FAILED\x1b[0m\n`);
          failed++;
        }
      }

      console.log("=".repeat(50));
      console.log(`VERDICT: ${passed} passed, ${failed} failed`);
      if (failed > 0) {
        console.log("\x1b[31mSome tests failed. Check output above.\x1b[0m");
        process.exit(1);
      } else {
        console.log("\x1b[32mAll research tests passed. Artifacts generated.\x1b[0m");
        process.exit(0);
      }
    }

    // ─── research-lock ───────────────────────────────────────────────────────
    case "research-lock": {
      printBanner();
      const lockModPath = path.join(PACKAGE_ROOT, "core/research/lock/lockfile.mjs");
      const { generateLock, verifyLock } = await import(pathToFileURL(lockModPath).href);
      const cwd = process.cwd();

      if (args.includes("--verify")) {
        console.log("[INFO] Verifying research.lock against current environment...\n");
        const { ok, warnings, errors } = verifyLock(cwd);
        if (errors) { errors.forEach(e => console.log(`\x1b[31m[ERROR]\x1b[0m ${e}`)); process.exit(1); }
        if (ok) {
          console.log("\x1b[32m[OK] Environment matches research.lock — results should be reproducible.\x1b[0m");
        } else {
          warnings.forEach(w => console.log(`\x1b[33m[WARNING]\x1b[0m ${w}`));
          console.log("\n\x1b[33mEnvironment differs from locked state. Results may not match exactly.\x1b[0m");
        }
      } else {
        console.log("[INFO] Generating research.lock...\n");
        const dataPath = flags.data || null;
        const { lockPath, lock } = generateLock({ cwd, dataPath, seed: parseInt(flags.seed || "42") });
        console.log(`\x1b[32m[OK]\x1b[0m research.lock generated at: ${lockPath}`);
        console.log(`     Python : ${lock.environment.python}`);
        console.log(`     OS     : ${lock.environment.os.name} ${lock.environment.os.version}`);
        console.log(`     Tasks  : ${Object.keys(lock.tasks).join(", ") || "(none deployed)"}`);
        console.log(`     Commit : ${lock.code.git_commit}`);
        console.log(`\nCommit this file to ensure reproducibility.`);
      }
      break;
    }

    // ─── env install ─────────────────────────────────────────────────────────
    case "env": {
      const subCmd = args[1];
      if (subCmd !== "install") {
        console.error(`[ERROR] Unknown env sub-command: ${subCmd}. Usage: npx liem-os env install`);
        process.exit(1);
      }
      printBanner();
      console.log("[INFO] Scanning deployed task manifests for dependencies...\n");

      const { buildRequirementsTxt } = await import(pathToFileURL(path.join(PACKAGE_ROOT, "core/research/runners/runner.mjs")).href);
      const reqContent = buildRequirementsTxt(process.cwd());

      if (!reqContent.trim() || reqContent.split("\n").filter(l => l && !l.startsWith("#")).length === 0) {
        console.log("[INFO] No task manifests found in current directory.");
        console.log("       Deploy tasks first: npx liem-os research-init --tasks <tasks>");
        process.exit(0);
      }

      const reqPath = path.join(process.cwd(), "requirements.txt");
      fs.writeFileSync(reqPath, reqContent, "utf8");
      console.log(`[OK] requirements.txt generated:\n`);
      console.log(reqContent);

      const pythonCmd = (() => {
        for (const cmd of ["python3", "python"]) {
          try { execSync(`${cmd} --version`, { stdio: "ignore" }); return cmd; } catch { /* */ }
        }
        return "python";
      })();

      console.log("\n[INFO] Installing packages...");
      try {
        execSync(`${pythonCmd} -m pip install -r requirements.txt`, { stdio: "inherit" });
        console.log("\n\x1b[32m[OK] Environment bootstrap complete!\x1b[0m");
      } catch (e) {
        console.error("[ERROR] pip install failed:", e.message);
        console.log("Try manually: pip install -r requirements.txt");
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
