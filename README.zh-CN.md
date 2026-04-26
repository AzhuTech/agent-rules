# agent-rules

[![CI](https://github.com/AzhuTech/agent-rules/actions/workflows/ci.yml/badge.svg)](https://github.com/AzhuTech/agent-rules/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

为 Codex、Claude Code、Cursor 和其他 AI coding agents 生成仓库级规则文件。

大多数 coding agents 进入一个仓库时都缺少上下文。`agent-rules` 会扫描项目，并生成 `AGENTS.md`、`CLAUDE.md`、Cursor rules 等实用指令文件，让 agent 在修改代码前先理解项目命令、目录结构和维护约定。

## 快速开始

```bash
npx @azhutech/agent-rules init
```

预览所有支持的输出文件，但不写入：

```bash
node ./src/cli.js init --target all --dry-run
```

## 它解决什么问题

使用前：

- agent 猜测包管理器
- agent 跳过项目特定测试命令
- agent 可能编辑生成文件或依赖目录
- 每个 AI 工具都需要手写一份规则文件

使用后：

- 一次扫描生成多种工具的起始规则
- 生成内容包含检测到的命令和关键路径
- 维护者可以基于清晰默认值继续编辑
- 后续 agent 会话从本地上下文开始

## 当前会检测什么

- JavaScript 和 TypeScript 包管理器
- Python 项目文件
- Go 和 Rust 项目文件
- 测试目录与常见测试命令
- docs、source、configuration 目录结构
- README 和已有 agent instruction 文件

## 命令

```bash
agent-rules init
agent-rules init --target all
agent-rules init --target codex
agent-rules init --target claude
agent-rules init --target cursor
agent-rules init --dry-run
agent-rules init --force
```

## 生成文件

- `AGENTS.md`：用于 Codex 和通用 agent tooling
- `CLAUDE.md`：用于 Claude Code
- `.cursor/rules/agent-rules.mdc`：用于 Cursor

示例输出：

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

## 为什么需要它

AI coding agents 在知道本地规则时表现更好：应该运行什么命令、哪些文件不要碰、项目约定是什么、如何验证修改。多数仓库还没有这些上下文，所以 agent 往往是在半盲状态下开始工作。

`agent-rules` 给项目一个可以快速生成、可以继续编辑的起点。

## Roadmap

- GitHub Action：在 PR 中提示规则文件是否缺失或过期
- 更丰富的框架检测
- monorepo package 映射
- frontend、Python、Go、Rust、docs、data project 模板包
- 可选的 LLM-assisted rule refinement

## License

MIT
