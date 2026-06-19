import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIEM_OS_DIR = path.resolve(__dirname, "../..");
const SCRATCH_DIR = path.join(LIEM_OS_DIR, "core/memory/scratch");

function main() {
  console.log("Liem OS: Promoting self-learned patterns to staging...");

  if (!fs.existsSync(SCRATCH_DIR)) {
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  }

  const args = process.argv.slice(2);
  const patternName = args[0] || `pattern_${Date.now()}`;
  const patternDescription = args[1] || "Automated instinct extraction.";
  const patternCode = args[2] || "// No code patterns captured.";

  const fileDest = path.join(SCRATCH_DIR, `${patternName}.json`);

  const stagedPattern = {
    name: patternName,
    description: patternDescription,
    code: patternCode,
    stagedAt: new Date().toISOString(),
    status: "STAGED",
    requiresApproval: true
  };

  try {
    fs.writeFileSync(fileDest, JSON.stringify(stagedPattern, null, 2), "utf8");
    console.log(`\nInstinct staged successfully!`);
    console.log(`File: ${fileDest}`);
    console.log(`\nTo promote this pattern to the core system, verify it and move it to: core/memory/approved/`);
  } catch (e) {
    console.error("Failed to stage pattern:", e.message);
  }
}

main();
