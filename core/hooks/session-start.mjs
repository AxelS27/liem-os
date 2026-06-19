import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIEM_OS_DIR = path.resolve(__dirname, "../..");
const CONFIG_FILE = path.join(LIEM_OS_DIR, ".liem_os_config.json");
const STATE_FILE = path.join(LIEM_OS_DIR, ".liem_os_state.json");

function main() {
  const args = process.argv.slice(2);
  const conversationId = args[0] || process.env.CONVERSATION_ID || "003ec96b-4146-4959-882d-19072db83ec4";
  const appDataDir = args[1] || process.env.APP_DATA_DIR || "C:\\Users\\farre\\.gemini\\antigravity";
  const tokenLimit = parseInt(args[2] || process.env.TOKEN_LIMIT || "128000", 10);

  const config = {
    conversationId,
    appDataDir,
    tokenLimit
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  console.log(`Liem OS: Session initialized.`);
  console.log(`Config written to: ${CONFIG_FILE}`);
  console.log(`Conversation ID: ${conversationId}`);
  console.log(`App Data Dir: ${appDataDir}`);

  // Initialize or reset state attempts
  const state = {
    attempts: {},
    session_id: conversationId,
    timestamp: Date.now()
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  console.log(`State file initialized.`);
}

main();
