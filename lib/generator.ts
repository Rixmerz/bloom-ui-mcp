import fs from "node:fs/promises";
import path from "node:path";
import {
  TEMPLATES,
  BASE_FILES,
  loadTemplate,
  loadBaseTemplate,
  replacePlaceholders,
  toDisplayName,
  toToolName,
  type Placeholders,
} from "./templates.js";

export interface GenerateOptions {
  name: string;
  description: string;
  template: keyof typeof TEMPLATES;
  outputDir: string;
  version?: string;
  author?: string;
}

export interface GenerateResult {
  success: boolean;
  projectPath: string;
  files: string[];
  claudeDesktopConfig: string;
  errors?: string[];
}

export async function generateMcpApp(
  options: GenerateOptions
): Promise<GenerateResult> {
  const {
    name,
    description,
    template,
    outputDir,
    version = "1.0.0",
    author,
  } = options;

  const projectPath = path.join(outputDir, name);
  const files: string[] = [];
  const errors: string[] = [];

  // Validate template
  if (!TEMPLATES[template]) {
    return {
      success: false,
      projectPath,
      files: [],
      claudeDesktopConfig: "",
      errors: [`Unknown template: ${template}. Available: ${Object.keys(TEMPLATES).join(", ")}`],
    };
  }

  // Create placeholders
  const placeholders: Placeholders = {
    NAME: name,
    DISPLAY_NAME: toDisplayName(name),
    DESCRIPTION: description,
    TOOL_NAME: toToolName(name),
    VERSION: version,
    AUTHOR: author,
  };

  try {
    // Create directories
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, "src"), { recursive: true });

    // Write base files
    for (const tmplFile of BASE_FILES) {
      const content = await loadBaseTemplate(tmplFile);
      const processed = replacePlaceholders(content, placeholders);
      const destFile = tmplFile.replace(".tmpl", "");
      await fs.writeFile(path.join(projectPath, destFile), processed);
      files.push(destFile);
    }

    // Write template-specific files
    const templateInfo = TEMPLATES[template];
    for (const tmplFile of templateInfo.files) {
      const content = await loadTemplate(template, tmplFile);
      const processed = replacePlaceholders(content, placeholders);
      const destFile = tmplFile.replace(".tmpl", "");

      // Determine destination: HTML goes to root, others go to src/
      if (destFile === "mcp-app.html") {
        await fs.writeFile(path.join(projectPath, destFile), processed);
        files.push(destFile);
      } else {
        await fs.writeFile(path.join(projectPath, "src", destFile), processed);
        files.push(`src/${destFile}`);
      }
    }

    // Copy global.css to src/
    const globalCss = await loadBaseTemplate("global.css.tmpl");
    const processedCss = replacePlaceholders(globalCss, placeholders);
    await fs.writeFile(path.join(projectPath, "src", "global.css"), processedCss);
    // Note: global.css is already in files from BASE_FILES, but we need it in src/ too
    files.push("src/global.css");

    // Remove the root global.css (it was created but should only be in src/)
    try {
      await fs.unlink(path.join(projectPath, "global.css"));
      const idx = files.indexOf("global.css");
      if (idx > -1) files.splice(idx, 1);
    } catch {
      // Ignore if doesn't exist
    }

    // Create .gitignore
    await fs.writeFile(
      path.join(projectPath, ".gitignore"),
      "node_modules/\ndist/\n"
    );
    files.push(".gitignore");

    // Generate Claude Desktop config snippet
    const claudeDesktopConfig = JSON.stringify(
      {
        [name]: {
          command: "/path/to/node/v22/bin/node",
          args: [`${projectPath}/dist/index.js`, "--stdio"],
        },
      },
      null,
      2
    );

    return {
      success: true,
      projectPath,
      files,
      claudeDesktopConfig,
    };
  } catch (error) {
    return {
      success: false,
      projectPath,
      files,
      claudeDesktopConfig: "",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export interface AddToolOptions {
  projectPath: string;
  toolName: string;
  toolDescription: string;
  toolTitle: string;
}

export async function addToolToProject(
  options: AddToolOptions
): Promise<{ success: boolean; message: string }> {
  const { projectPath, toolName, toolDescription, toolTitle } = options;
  const serverPath = path.join(projectPath, "server.ts");

  try {
    const content = await fs.readFile(serverPath, "utf-8");

    // Find the return statement for the server
    const returnMatch = content.match(/return server;/);
    if (!returnMatch) {
      return {
        success: false,
        message: "Could not find 'return server;' in server.ts",
      };
    }

    // Generate new tool code
    const newToolCode = `
  // Additional tool: ${toolName}
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      // ... existing tools ...
      {
        name: "${toolName}",
        description: "${toolDescription}",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "${toolName}") {
      return {
        content: [{ type: "text", text: "${toolTitle} executed." }],
      };
    }
    throw new Error(\`Unknown tool: \${request.params.name}\`);
  });

`;

    // Insert before return statement
    const newContent = content.replace(
      "return server;",
      `${newToolCode}  return server;`
    );

    await fs.writeFile(serverPath, newContent);

    return {
      success: true,
      message: `Tool "${toolName}" added to server.ts. Note: You may need to manually merge with existing tool handlers.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
