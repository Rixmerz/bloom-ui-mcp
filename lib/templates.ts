import fs from "node:fs/promises";
import path from "node:path";

// Use import.meta.dirname for ES modules (requires Node >= 20)
const TEMPLATES_DIR = path.join(import.meta.dirname, "..", "templates");

export interface TemplateInfo {
  name: string;
  description: string;
  files: string[];
}

export const TEMPLATES: Record<string, TemplateInfo> = {
  blank: {
    name: "Blank",
    description: "Minimal MCP App with a single button to send messages",
    files: ["mcp-app.html.tmpl", "mcp-app.ts.tmpl", "mcp-app.css.tmpl"],
  },
  calculator: {
    name: "Calculator",
    description: "Interactive calculator that sends results to the agent",
    files: ["mcp-app.html.tmpl", "mcp-app.ts.tmpl", "mcp-app.css.tmpl"],
  },
  form: {
    name: "Form",
    description: "Form template with inputs that sends data to the agent",
    files: ["mcp-app.html.tmpl", "mcp-app.ts.tmpl", "mcp-app.css.tmpl"],
  },
  chart: {
    name: "Chart",
    description: "Canvas-based bar chart with interactive data",
    files: ["mcp-app.html.tmpl", "mcp-app.ts.tmpl", "mcp-app.css.tmpl"],
  },
};

export const BASE_FILES = [
  "main.ts.tmpl",
  "server.ts.tmpl",
  "package.json.tmpl",
  "vite.config.ts.tmpl",
  "tsconfig.json.tmpl",
  "tsconfig.server.json.tmpl",
  "global.css.tmpl",
];

export async function loadTemplate(
  templateType: keyof typeof TEMPLATES,
  fileName: string
): Promise<string> {
  // Check template-specific first, then base
  const templatePath = path.join(TEMPLATES_DIR, templateType, fileName);
  const basePath = path.join(TEMPLATES_DIR, "base", fileName);

  try {
    return await fs.readFile(templatePath, "utf-8");
  } catch {
    return await fs.readFile(basePath, "utf-8");
  }
}

export async function loadBaseTemplate(fileName: string): Promise<string> {
  const filePath = path.join(TEMPLATES_DIR, "base", fileName);
  return await fs.readFile(filePath, "utf-8");
}

export interface Placeholders {
  NAME: string;
  DISPLAY_NAME: string;
  DESCRIPTION: string;
  TOOL_NAME: string;
  VERSION: string;
  AUTHOR?: string;
}

export function replacePlaceholders(
  content: string,
  placeholders: Placeholders
): string {
  let result = content;
  for (const [key, value] of Object.entries(placeholders)) {
    if (value) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
  }
  return result;
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function toDisplayName(kebabCase: string): string {
  return kebabCase
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toToolName(kebabCase: string): string {
  return kebabCase.replace(/-/g, "_");
}
