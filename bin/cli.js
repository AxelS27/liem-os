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
function registerClaudeMCP(serverPath) {
  const isWin = os.platform() === "win32";
  const home = os.homedir();
  const configPath = isWin
    ? path.join(process.env.APPDATA || path.join(home, "AppData/Roaming"), "Claude", "claude_desktop_config.json")
    : path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");

  console.log(`\n🔍 Checking for Claude Desktop configuration at: ${configPath}`);

  let config = { mcpServers: {} };

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.log("⚠️ Existing Claude Desktop config is invalid JSON. Overwriting...");
    }
  } else {
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers["liem-os"] = {
    command: "node",
    args: [serverPath]
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    console.log("✅ Successfully registered Liem OS MCP Server in Claude Desktop!");
  } catch (e) {
    console.log("❌ Failed to write Claude Desktop configuration:", e.message);
  }
}

// Execute core command router
function main() {
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
      console.log(`🚀 Initializing Liem OS workspace in: ${targetDir}`);
      console.log(`Using template: ${template}`);

      // 1. Resolve source template path
      let srcDir = "";
      if (template === "docs") {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/docs-project");
      } else if (template === "research") {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/research-project");
      } else if (template === "content") {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/content-project");
      } else {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/fullstack-app");
      }

      if (!fs.existsSync(srcDir)) {
        console.error(`❌ Source template at '${srcDir}' not found.`);
        process.exit(1);
      }

      // 2. Scaffold files to current directory
      console.log("Scaffolding files...");
      copyDir(srcDir, targetDir);

      // 3. Compile rules to .cursorrules
      console.log("Compiling rules to .cursorrules...");
      const commonRulesPath = path.join(PACKAGE_ROOT, "core/rules/common/rules.md");
      const codingRulesPath = path.join(PACKAGE_ROOT, "core/rules/coding/rules.md");
      
      let mergedRules = "";
      if (fs.existsSync(commonRulesPath)) mergedRules += fs.readFileSync(commonRulesPath, "utf8") + "\n\n";
      if (fs.existsSync(codingRulesPath)) mergedRules += fs.readFileSync(codingRulesPath, "utf8") + "\n\n";
      
      fs.writeFileSync(path.join(targetDir, ".cursorrules"), mergedRules, "utf8");

      // 4. Register the MCP server globally in Claude Desktop
      const mcpServerPath = path.join(PACKAGE_ROOT, "core/mcp/server.mjs");
      registerClaudeMCP(mcpServerPath);

      console.log("\n\x1b[32m==========================================\x1b[0m");
      console.log("\x1b[32m🎉 Liem OS Workspace Setup Completed! \x1b[0m");
      console.log("\x1b[32m==========================================\x1b[0m");
      console.log(`\n👉 Open this folder in your AI editor (Cursor / VS Code).`);
      console.log(`👉 Antigravity / Gemini will automatically load the rules from the '.agents' folder.`);
      console.log(`\n👉 To register the MCP server in Cursor:`);
      console.log(`   1. Open Settings > Features > MCP > Add New MCP Server`);
      console.log(`   2. Name: Liem OS`);
      console.log(`   3. Command: node "${mcpServerPath}"`);
      break;
    }

    case "scaffold": {
      const name = flags.name || flags.projectName;
      const target = flags.target || flags.targetPath;
      const template = flags.template || "monorepo";

      if (!name || !target) {
        console.error("❌ Error: Missing --name or --target parameters.");
        console.log("Usage: npx liem-os scaffold --name <project-name> --target <absolute-path>");
        process.exit(1);
      }

      const absoluteTarget = path.resolve(target);
      console.log(`Deploying template '${template}' to '${absoluteTarget}'...`);

      let srcDir = "";
      if (template === "docs") {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/docs-project");
      } else if (template === "research") {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/research-project");
      } else if (template === "content") {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/content-project");
      } else {
        srcDir = path.join(PACKAGE_ROOT, "scaffolds/fullstack-app");
      }

      if (!fs.existsSync(srcDir)) {
        console.error(`❌ Source template at '${srcDir}' not found.`);
        process.exit(1);
      }

      copyDir(srcDir, absoluteTarget);
      console.log(`✅ Successfully scaffolded project '${name}'!`);
      break;
    }

    case "council": {
      const topic = flags.topic;
      if (!topic) {
        console.error("❌ Error: Missing --topic parameter.");
        process.exit(1);
      }
      
      const runnerPath = path.join(PACKAGE_ROOT, "core/council/runner.js");
      try {
        execSync(`node "${runnerPath}" --topic "${topic}"`, { stdio: "inherit" });
      } catch (e) {
        console.error("❌ Agent Council runner failed.");
        process.exit(1);
      }
      break;
    }

    case "server": {
      const serverPath = path.join(PACKAGE_ROOT, "core/mcp/server.mjs");
      console.log("Starting Liem OS MCP Server on stdio...");
      try {
        execSync(`node "${serverPath}"`, { stdio: "inherit" });
      } catch (e) {
        console.error("❌ MCP Server stopped.");
        process.exit(1);
      }
      break;
    }

    default: {
      console.error(`❌ Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  }
}

main();
