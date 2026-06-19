import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIEM_OS_DIR = path.resolve(__dirname, "../..");
const CONFIG_FILE = path.join(LIEM_OS_DIR, ".liem_os_config.json");

function main() {
  console.log("Liem OS: Preparing for context compaction...");
  
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log("Config file not found. Skipping optimization scan.");
    return;
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  const transcriptPath = path.join(
    config.appDataDir,
    "brain",
    config.conversationId,
    ".system_generated",
    "logs",
    "transcript.jsonl"
  );

  if (!fs.existsSync(transcriptPath)) {
    console.log("Transcript not found. Ready for basic compaction.");
    return;
  }

  try {
    const content = fs.readFileSync(transcriptPath, "utf8");
    const lines = content.trim().split("\n");
    console.log(`Analyzing ${lines.length} steps in conversation transcript...`);

    // Basic optimization scans: duplicate rules checks, redundant code buddy outputs
    let toolCallsCount = 0;
    let systemInstructionsCount = 0;
    let rawBytes = fs.statSync(transcriptPath).size;

    for (const line of lines) {
      if (!line) continue;
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) toolCallsCount += parsed.tool_calls.length;
      if (parsed.type === "SYSTEM") systemInstructionsCount++;
    }

    console.log("\n--- CONTEXT OPTIMIZATION SCAN ---");
    console.log(`Total Conversation Steps: ${lines.length}`);
    console.log(`Total Tool Executions: ${toolCallsCount}`);
    console.log(`Raw Log Size: ${(rawBytes / 1024).toFixed(2)} KB`);
    console.log("\nRecommendations:");
    console.log("1. Summarize earlier steps and ask the model to compile its memories.");
    console.log("2. Use /handoff to sync progress, then start a fresh clean session to discard history.");
    console.log("--------------------------------\n");
  } catch (e) {
    console.error("Optimization scan failed:", e.message);
  }
}

main();
