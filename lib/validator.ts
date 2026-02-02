import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface ValidationCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  summary: string;
}

export async function validateProject(
  projectPath: string
): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];

  // 1. Check Node version
  try {
    const { stdout } = await execAsync("node --version");
    const version = stdout.trim();
    const majorVersion = parseInt(version.replace("v", "").split(".")[0], 10);

    if (majorVersion >= 20) {
      checks.push({
        name: "Node Version",
        status: "pass",
        message: `${version} (>= 20 required for import.meta.dirname)`,
      });
    } else {
      checks.push({
        name: "Node Version",
        status: "fail",
        message: `${version} is too old. Node >= 20 required for import.meta.dirname`,
      });
    }
  } catch {
    checks.push({
      name: "Node Version",
      status: "fail",
      message: "Could not detect Node version",
    });
  }

  // 2. Check Bun
  try {
    const { stdout } = await execAsync("bun --version");
    checks.push({
      name: "Bun",
      status: "pass",
      message: `Bun ${stdout.trim()} installed (required for build)`,
    });
  } catch {
    checks.push({
      name: "Bun",
      status: "fail",
      message: "Bun not found. Install from https://bun.sh",
    });
  }

  // 3. Check project structure
  const requiredFiles = [
    "main.ts",
    "server.ts",
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.server.json",
    "mcp-app.html",
  ];

  const requiredDirs = ["src"];

  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(projectPath, file));
      checks.push({
        name: `File: ${file}`,
        status: "pass",
        message: "Exists",
      });
    } catch {
      checks.push({
        name: `File: ${file}`,
        status: "fail",
        message: "Missing",
      });
    }
  }

  for (const dir of requiredDirs) {
    try {
      const stat = await fs.stat(path.join(projectPath, dir));
      if (stat.isDirectory()) {
        checks.push({
          name: `Directory: ${dir}`,
          status: "pass",
          message: "Exists",
        });
      } else {
        checks.push({
          name: `Directory: ${dir}`,
          status: "fail",
          message: "Not a directory",
        });
      }
    } catch {
      checks.push({
        name: `Directory: ${dir}`,
        status: "fail",
        message: "Missing",
      });
    }
  }

  // 4. Check package.json dependencies
  try {
    const pkgPath = path.join(projectPath, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    const requiredDeps = [
      "@modelcontextprotocol/ext-apps",
      "@modelcontextprotocol/sdk",
    ];

    const requiredDevDeps = ["cross-env", "vite-plugin-singlefile", "vite"];

    for (const dep of requiredDeps) {
      if (pkg.dependencies?.[dep]) {
        checks.push({
          name: `Dependency: ${dep}`,
          status: "pass",
          message: pkg.dependencies[dep],
        });
      } else {
        checks.push({
          name: `Dependency: ${dep}`,
          status: "fail",
          message: "Missing from dependencies",
        });
      }
    }

    for (const dep of requiredDevDeps) {
      if (pkg.devDependencies?.[dep]) {
        checks.push({
          name: `DevDependency: ${dep}`,
          status: "pass",
          message: pkg.devDependencies[dep],
        });
      } else {
        checks.push({
          name: `DevDependency: ${dep}`,
          status: "fail",
          message: "Missing from devDependencies",
        });
      }
    }

    // 5. Check build script
    if (pkg.scripts?.build) {
      const buildScript = pkg.scripts.build;
      const hasNpx = buildScript.includes("npx");
      const hasBunBuild = buildScript.includes("bun build");
      const hasCrossEnv = buildScript.includes("cross-env INPUT=");

      if (hasNpx && hasBunBuild && hasCrossEnv) {
        checks.push({
          name: "Build Script",
          status: "pass",
          message: "Contains npx, bun build, and cross-env INPUT",
        });
      } else {
        const missing: string[] = [];
        if (!hasNpx) missing.push("npx");
        if (!hasBunBuild) missing.push("bun build");
        if (!hasCrossEnv) missing.push("cross-env INPUT=");

        checks.push({
          name: "Build Script",
          status: "warn",
          message: `Missing: ${missing.join(", ")}`,
        });
      }
    } else {
      checks.push({
        name: "Build Script",
        status: "fail",
        message: "No build script defined",
      });
    }
  } catch (error) {
    checks.push({
      name: "package.json",
      status: "fail",
      message: error instanceof Error ? error.message : "Could not read",
    });
  }

  // 6. Check for dist folder (if built)
  try {
    const distPath = path.join(projectPath, "dist");
    const stat = await fs.stat(distPath);
    if (stat.isDirectory()) {
      const distFiles = await fs.readdir(distPath);
      const hasIndex = distFiles.includes("index.js");
      const hasMcpApp = distFiles.includes("mcp-app.html");

      if (hasIndex && hasMcpApp) {
        checks.push({
          name: "Build Output",
          status: "pass",
          message: "dist/index.js and dist/mcp-app.html exist",
        });
      } else {
        const missing: string[] = [];
        if (!hasIndex) missing.push("index.js");
        if (!hasMcpApp) missing.push("mcp-app.html");
        checks.push({
          name: "Build Output",
          status: "warn",
          message: `dist/ exists but missing: ${missing.join(", ")}. Run npm run build`,
        });
      }
    }
  } catch {
    checks.push({
      name: "Build Output",
      status: "warn",
      message: "dist/ not found. Run npm install && npm run build",
    });
  }

  // Calculate result
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const passCount = checks.filter((c) => c.status === "pass").length;

  const valid = failCount === 0;
  const summary = `${passCount} passed, ${warnCount} warnings, ${failCount} failed`;

  return { valid, checks, summary };
}
