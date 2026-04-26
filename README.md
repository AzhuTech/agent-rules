# agent-rules

[![CI](https://github.com/AzhuTech/agent-rules/actions/workflows/ci.yml/badge.svg)](https://github.com/AzhuTech/agent-rules/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docs: 中文](https://img.shields.io/badge/docs-中文-yellow.svg)](README.zh-CN.md)

English | [中文](README.zh-CN.md)

Generate repo-aware instructions for Codex, Claude Code, Cursor, and other AI coding agents.

Most coding agents start a repository half blind. `agent-rules` scans your project and creates practical guidance files such as `AGENTS.md`, `CLAUDE.md`, and Cursor rules so agents know your commands, layout, and conventions before editing.

## Quickstart

```bash
npx @azhutech/agent-rules init
```

Preview every supported output without writing files:

```bash
node ./src/cli.js init --target all --dry-run
```

## Why It Helps

Before:

- agents guess the package manager
- agents skip project-specific test commands
- agents edit generated or dependency folders
- every new AI tool needs another hand-written instruction file

After:

- one scan creates starter instructions for multiple tools
- generated files include detected commands and notable paths
- maintainers get a clear baseline they can review and edit
- future agent sessions start with local context

## What It Detects

- JavaScript and TypeScript package managers
- Python project files
- Go and Rust project files
- test folders and common test commands
- docs, source, and configuration layout
- README presence and existing agent instruction files

## Commands

```bash
agent-rules init
agent-rules init --target all
agent-rules init --target codex
agent-rules init --target claude
agent-rules init --target cursor
agent-rules init --dry-run
agent-rules init --force
```

## Generated Files

- `AGENTS.md` for Codex and general agent tooling
- `CLAUDE.md` for Claude Code
- `.cursor/rules/agent-rules.mdc` for Cursor

Example output:

```md
# Agent Instructions

## Repository Profile

- Project: agent-rules
- Languages: TypeScript/JavaScript
- Package manager: npm
- README present: yes
- Tests detected: yes

## Useful Commands

- `npm run test`
```

## Why This Exists

AI coding agents are much better when repositories tell them the local rules: commands to run, files to avoid, conventions to preserve, and how to verify changes. Most repos do not have this context yet, so every agent starts half blind.

`agent-rules` gives projects a fast default that maintainers can edit.

## Roadmap

- GitHub Action for PR rule suggestions
- richer framework detection
- monorepo package mapping
- template packs for frontend, Python, Go, Rust, docs, and data projects
- optional LLM-assisted rule refinement

## 中文

`agent-rules` 会扫描仓库，并为 Codex、Claude Code、Cursor 等 AI coding agents 生成仓库规则文件，例如 `AGENTS.md`、`CLAUDE.md` 和 Cursor rules。

目标很简单：让 AI agent 在修改代码之前先理解项目命令、目录结构、测试方式和维护约定。

中文文档见 [README.zh-CN.md](README.zh-CN.md)。

## License

MIT
