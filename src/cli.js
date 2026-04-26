#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const TARGETS = new Set(["codex", "claude", "cursor", "all"]);

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.command !== "init") {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (!TARGETS.has(args.target)) {
    fail(`Unknown target "${args.target}". Use one of: ${Array.from(TARGETS).join(", ")}`);
  }

  const root = path.resolve(args.cwd);
  const profile = await scanRepository(root);
  const outputs = buildOutputs(profile, args.target);

  for (const output of outputs) {
    const filePath = path.join(root, output.path);
    if (existsSync(filePath) && !args.force && !args.dryRun) {
      fail(`${output.path} already exists. Re-run with --force to overwrite.`);
    }

    if (args.dryRun) {
      console.log(`--- ${output.path} ---\n${output.content}\n`);
      continue;
    }

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, output.content, "utf8");
    console.log(`wrote ${output.path}`);
  }
}

function parseArgs(argv) {
  const result = {
    command: argv[0],
    cwd: process.cwd(),
    target: "codex",
    dryRun: false,
    force: false,
    help: false
  };

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--dry-run") result.dryRun = true;
    else if (arg === "--force") result.force = true;
    else if (arg === "--target") result.target = argv[++i] ?? "";
    else if (arg.startsWith("--target=")) result.target = arg.slice("--target=".length);
    else if (arg === "--cwd") result.cwd = argv[++i] ?? result.cwd;
    else if (arg.startsWith("--cwd=")) result.cwd = arg.slice("--cwd=".length);
    else fail(`Unknown argument: ${arg}`);
  }

  return result;
}

async function scanRepository(root) {
  const files = await listFiles(root);
  const fileSet = new Set(files);
  const packageJson = await readJsonIfExists(path.join(root, "package.json"));

  return {
    rootName: path.basename(root),
    languages: detectLanguages(fileSet),
    packageManager: detectPackageManager(fileSet),
    scripts: packageJson?.scripts ?? {},
    hasReadme: files.some((file) => /^readme(\.|$)/i.test(path.basename(file))),
    hasTests: files.some((file) => /(^|\/)(test|tests|__tests__|spec)(\/|$)/i.test(file)),
    existingAgentFiles: files.filter((file) =>
      ["AGENTS.md", "CLAUDE.md", ".cursor/rules/agent-rules.mdc"].includes(file)
    ),
    notablePaths: files.filter((file) =>
      /^(src|app|lib|packages|docs|test|tests|\.github)\//.test(file)
    ).slice(0, 20)
  };
}

async function listFiles(root, dir = "", depth = 0) {
  if (depth > 4) return [];

  const fullDir = path.join(root, dir);
  let entries = [];

  try {
    entries = await readdir(fullDir);
  } catch {
    return [];
  }

  const ignored = new Set([".git", "node_modules", "dist", "build", ".next", ".venv", "__pycache__"]);
  const files = [];

  for (const entry of entries.sort()) {
    if (ignored.has(entry)) continue;

    const relative = path.join(dir, entry);
    const fullPath = path.join(root, relative);
    const info = await stat(fullPath);

    if (info.isDirectory()) {
      files.push(...await listFiles(root, relative, depth + 1));
    } else if (info.isFile()) {
      files.push(relative.split(path.sep).join("/"));
    }
  }

  return files;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function detectLanguages(fileSet) {
  const languages = [];

  if (hasAny(fileSet, ["package.json", "tsconfig.json"]) || hasExt(fileSet, [".ts", ".tsx"])) {
    languages.push("TypeScript/JavaScript");
  }
  if (hasAny(fileSet, ["pyproject.toml", "requirements.txt"]) || hasExt(fileSet, [".py"])) {
    languages.push("Python");
  }
  if (hasAny(fileSet, ["go.mod"]) || hasExt(fileSet, [".go"])) languages.push("Go");
  if (hasAny(fileSet, ["Cargo.toml"]) || hasExt(fileSet, [".rs"])) languages.push("Rust");
  if (languages.length === 0) languages.push("unknown or docs-first");

  return languages;
}

function detectPackageManager(fileSet) {
  if (fileSet.has("pnpm-lock.yaml")) return "pnpm";
  if (fileSet.has("yarn.lock")) return "yarn";
  if (fileSet.has("package-lock.json")) return "npm";
  if (fileSet.has("uv.lock")) return "uv";
  if (fileSet.has("poetry.lock")) return "poetry";
  if (fileSet.has("package.json")) return "npm";
  return "unknown";
}

function buildOutputs(profile, target) {
  const content = generateMarkdown(profile);
  const outputs = [];

  if (target === "codex" || target === "all") outputs.push({ path: "AGENTS.md", content });
  if (target === "claude" || target === "all") outputs.push({ path: "CLAUDE.md", content });
  if (target === "cursor" || target === "all") {
    outputs.push({
      path: ".cursor/rules/agent-rules.mdc",
      content: `---\ndescription: Repository guidance for AI coding agents\nalwaysApply: true\n---\n\n${content}`
    });
  }

  return outputs;
}

function generateMarkdown(profile) {
  const commands = inferCommands(profile);

  return `# Agent Instructions

## Repository Profile

- Project: ${profile.rootName}
- Languages: ${profile.languages.join(", ")}
- Package manager: ${profile.packageManager}
- README present: ${profile.hasReadme ? "yes" : "no"}
- Tests detected: ${profile.hasTests ? "yes" : "no"}

## Working Rules

- Read existing code before editing and preserve local conventions.
- Keep changes focused on the requested behavior.
- Do not overwrite generated, vendored, or dependency folders.
- Prefer small, reviewable patches.
- Update tests or examples when behavior changes.

## Useful Commands

${commands.map((command) => `- \`${command}\``).join("\n")}

## Notable Paths

${profile.notablePaths.length > 0 ? profile.notablePaths.map((file) => `- \`${file}\``).join("\n") : "- No common source or docs paths detected yet."}

## Verification

- Run the most specific relevant test command before finishing.
- If no automated tests exist, describe the manual check performed.
- Mention any command that could not be run and why.

## Existing Agent Files

${profile.existingAgentFiles.length > 0 ? profile.existingAgentFiles.map((file) => `- \`${file}\``).join("\n") : "- None detected before generation."}
`;
}

function inferCommands(profile) {
  const commands = [];
  const scripts = profile.scripts;

  for (const name of ["test", "lint", "typecheck", "build", "format"]) {
    if (scripts[name]) commands.push(`${packageRunner(profile.packageManager)} ${name}`);
  }

  if (commands.length === 0 && profile.languages.includes("Python")) {
    commands.push("python -m pytest");
  }
  if (commands.length === 0 && profile.languages.includes("Go")) {
    commands.push("go test ./...");
  }
  if (commands.length === 0 && profile.languages.includes("Rust")) {
    commands.push("cargo test");
  }
  if (commands.length === 0) {
    commands.push("Add project-specific test, lint, and build commands here.");
  }

  return commands;
}

function packageRunner(packageManager) {
  if (packageManager === "pnpm") return "pnpm";
  if (packageManager === "yarn") return "yarn";
  return "npm run";
}

function hasAny(fileSet, names) {
  return names.some((name) => fileSet.has(name));
}

function hasExt(fileSet, extensions) {
  return Array.from(fileSet).some((file) => extensions.some((extension) => file.endsWith(extension)));
}

function printHelp() {
  console.log(`agent-rules

Usage:
  agent-rules init [--target codex|claude|cursor|all] [--dry-run] [--force] [--cwd path]
`);
}

function fail(message) {
  console.error(`agent-rules: ${message}`);
  process.exit(1);
}

main().catch((error) => fail(error.message));
