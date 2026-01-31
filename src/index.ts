import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * Business AI Agent
 *
 * This agent helps with business-related tasks such as:
 * - Analyzing business documents
 * - Generating reports
 * - Researching business information
 * - Automating business workflows
 */

async function main() {
  const prompt = process.argv[2] || "Hello! I'm your Business AI assistant. How can I help you today?";

  console.log("🤖 Business AI Agent starting...\n");
  console.log(`Prompt: ${prompt}\n`);

  try {
    for await (const message of query({
      prompt: prompt,
      options: {
        // Allow the agent to read files, search the web, and run commands
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "WebSearch", "WebFetch", "AskUserQuestion"],

        // Use bypass mode for this demo (in production, consider using other permission modes)
        permissionMode: "bypassPermissions",
      },
    })) {
      // Print agent messages
      if ("result" in message) {
        console.log("\n✅ Result:");
        console.log(message.result);
      } else if (message.type === "agent") {
        console.log(`\n💬 Agent: ${message.text}`);
      } else if (message.type === "error") {
        console.error(`\n❌ Error: ${message.text}`);
      }
    }
  } catch (error) {
    console.error("\n❌ Error running agent:", error);
    process.exit(1);
  }
}

main();
