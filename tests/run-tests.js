import { execSync } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DIR = path.resolve(__dirname, "../core/mcp");

console.log("==========================================");
echo("           Liem OS Verification Run       ");
console.log("==========================================");

try {
  let testCmd = "npm test";
  try {
    execSync("pnpm --version", { cwd: MCP_DIR, stdio: "ignore" });
    testCmd = "pnpm test";
  } catch (e) {}

  console.log(`Running MCP Unit Tests using ${testCmd}...`);
  const output = execSync(testCmd, { cwd: MCP_DIR, encoding: "utf8" });
  console.log(output);
  console.log("✅ Verification succeeded!");
  process.exit(0);
} catch (e) {
  console.error("❌ Verification failed!");
  console.error(e.stderr || e.message);
  process.exit(1);
}

// Shell-like print helper
function echo(text) {
  console.log(text);
}
