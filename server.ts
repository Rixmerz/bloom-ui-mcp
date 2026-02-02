import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateMcpApp, addToolToProject } from "./lib/generator.js";
import { TEMPLATES, toKebabCase } from "./lib/templates.js";
import { validateProject } from "./lib/validator.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "bloom-ui-mcp",
    version: "1.0.0",
  });

  // Tool 1: create_mcp_app
  server.tool(
    "create_mcp_app",
    "Generate a new MCP App project with UI. Creates a complete project structure with all necessary files for building an MCP App that works with Claude Desktop.",
    {
      name: z
        .string()
        .describe("Project name in kebab-case (e.g., 'my-awesome-app')"),
      description: z
        .string()
        .describe("Description of what the app does"),
      template: z
        .enum(["blank", "calculator", "form", "chart"])
        .describe("Template to use: blank (minimal), calculator, form, or chart"),
      outputDir: z
        .string()
        .describe("Absolute path to the output directory where the project will be created"),
      version: z
        .string()
        .optional()
        .describe("Version number (default: 1.0.0)"),
    },
    async ({ name, description, template, outputDir, version }) => {
      const kebabName = toKebabCase(name);

      const result = await generateMcpApp({
        name: kebabName,
        description,
        template,
        outputDir,
        version,
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create project:\n${result.errors?.join("\n") || "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Project created successfully!

**Project Path:** ${result.projectPath}

**Files Created:**
${result.files.map((f) => `- ${f}`).join("\n")}

**Next Steps:**
1. cd ${result.projectPath}
2. npm install
3. npm run build

**Claude Desktop Config (add to claude_desktop_config.json):**
\`\`\`json
${result.claudeDesktopConfig}
\`\`\`

Remember to replace "/path/to/node/v22/bin/node" with your actual Node v22+ path.
You can find it with: \`which node\` or \`nvm which 22\``,
          },
        ],
      };
    }
  );

  // Tool 2: list_templates
  server.tool(
    "list_templates",
    "List all available MCP App templates with their descriptions.",
    {},
    async () => {
      const templateList = Object.entries(TEMPLATES)
        .map(([key, info]) => `- **${key}** (${info.name}): ${info.description}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Available MCP App Templates:

${templateList}

Use these template names with the \`create_mcp_app\` tool.`,
          },
        ],
      };
    }
  );

  // Tool 3: validate_project
  server.tool(
    "validate_project",
    "Validate an existing MCP App project to check for common issues and missing dependencies.",
    {
      projectPath: z
        .string()
        .describe("Absolute path to the MCP App project directory"),
    },
    async ({ projectPath }) => {
      const result = await validateProject(projectPath);

      const checkResults = result.checks
        .map((c) => {
          const icon =
            c.status === "pass" ? "✅" : c.status === "warn" ? "⚠️" : "❌";
          return `${icon} **${c.name}**: ${c.message}`;
        })
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Validation Results for: ${projectPath}

**Status:** ${result.valid ? "✅ Valid" : "❌ Invalid"}
**Summary:** ${result.summary}

**Checks:**
${checkResults}

${
  !result.valid
    ? `
**To fix issues:**
- Ensure Node >= 20 is installed
- Install Bun: curl -fsSL https://bun.sh/install | bash
- Run: npm install
- Run: npm run build`
    : ""
}`,
          },
        ],
      };
    }
  );

  // Tool 4: add_tool
  server.tool(
    "add_tool",
    "Add a new tool to an existing MCP App project. Note: This adds basic scaffolding that may need manual adjustment.",
    {
      projectPath: z
        .string()
        .describe("Absolute path to the MCP App project directory"),
      toolName: z
        .string()
        .describe("Name for the new tool (snake_case, e.g., 'my_new_tool')"),
      toolTitle: z
        .string()
        .describe("Display title for the tool"),
      toolDescription: z
        .string()
        .describe("Description of what the tool does"),
    },
    async ({ projectPath, toolName, toolTitle, toolDescription }) => {
      const result = await addToolToProject({
        projectPath,
        toolName,
        toolTitle,
        toolDescription,
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to add tool: ${result.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Tool added successfully!

${result.message}

**Important:** After adding the tool, you'll need to:
1. Review server.ts and merge the tool handlers
2. Run \`npm run build\` to rebuild
3. Restart Claude Desktop to pick up changes`,
          },
        ],
      };
    }
  );

  return server;
}
