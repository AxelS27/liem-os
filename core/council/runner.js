import { prepareCouncil, formatSummonsInstructions } from "../mcp/council.mjs";

function main() {
  const args = process.argv.slice(2);
  let topic = "";
  let membersStr = "";
  let mode = "debate";

  // Basic arguments parser
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--topic" && args[i + 1]) {
      topic = args[i + 1];
    } else if (args[i] === "--members" && args[i + 1]) {
      membersStr = args[i + 1];
    } else if (args[i] === "--mode" && args[i + 1]) {
      mode = args[i + 1];
    }
  }

  if (!topic) {
    console.log("🏛️ Liem OS Agent Council CLI Runner");
    console.log("Usage: node core/council/runner.js --topic \"<topic>\" [--members \"agent1,agent2\"] [--mode \"debate|one-shot\"]");
    console.log("\nSummoning default simulation...");
    topic = "Designing a secure multi-tenant database schema with Supabase Row-Level Security (RLS) policies";
  }

  const membersList = membersStr ? membersStr.split(",").map(m => m.trim()) : undefined;

  try {
    const agenda = prepareCouncil(topic, membersList, mode);
    const instructions = formatSummonsInstructions(agenda);
    console.log(instructions);
  } catch (e) {
    console.error("❌ Failed to initialize council:", e.message);
    process.exit(1);
  }
}

main();
