# agent-rules

Generate repository-specific instructions for AI coding agents.

`agent-rules` scans a project and creates practical guidance files such as `AGENTS.md`, `CLAUDE.md`, and Cursor rules. The goal is simple: make AI coding agents understand how your repo is built, tested, and maintained before they edit code.

## Quickstart

```bash
npx @azhutech/agent-rules init
```

Local development:

```bash
node ./src/cli.js init --target all --dry-run
```

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

## Why This Exists

AI coding agents are much better when repositories tell them the local rules: commands to run, files to avoid, conventions to preserve, and how to verify changes. Most repos do not have this context yet, so every agent starts half blind.

`agent-rules` gives projects a fast default that maintainers can edit.

## Roadmap

- GitHub Action for PR rule suggestions
- richer framework detection
- monorepo package mapping
- template packs for frontend, Python, Go, Rust, docs, and data projects
- optional LLM-assisted rule refinement

## License

MIT
