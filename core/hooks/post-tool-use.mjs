import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIEM_OS_DIR = path.resolve(__dirname, "../..");
const CONFIG_FILE = path.join(LIEM_OS_DIR, ".liem_os_config.json");

function main() {
  if (!fs.existsSync(CONFIG_FILE)) return;

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    const transcriptPath = path.join(
      config.appDataDir,
      "brain",
      config.conversationId,
      ".system_generated",
      "logs",
      "transcript.jsonl"
    );

    if (fs.existsSync(transcriptPath)) {
      const stats = fs.statSync(transcriptPath);
      const used = Math.round(stats.size / 3.5);
      const limit = config.tokenLimit || 128000;
      const pct = ((used / limit) * 100).toFixed(1);
      
      console.log(`Liem OS Metrics: ${used}/${limit} tokens (${pct}%)`);
      if (pct >= 80) {
        console.warn("⚠️ CONTEXT LIMIT WARNING: Context is above 80% usage. Consider running compaction!");
      }
    }
  } catch (e) {
    // Ignore metric tracking errors in hook
  }
}

main();
