/**
 * MCP App Generator - Entry Point
 * Run with: node dist/index.js --stdio
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();

  // Only stdio mode supported for this generator MCP
  if (!process.argv.includes("--stdio")) {
    console.error("Usage: node dist/index.js --stdio");
    console.error("This MCP server only supports stdio transport.");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
