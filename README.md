# AI Development Tools Collection

A growing monorepo of tools for autonomous AI development, compatible with OpenCode, Senter, Claude Code, and Cursor.

Transform rough ideas into working applications in 3-5 hours instead of weeks or months.

---

## 🎯 What's Included

### [Agents](./agents/README.md)
AI agents for requirements gathering, code review, and autonomous development:
- **SAGA-Writer** - Creates complete, validated SAGA plans directly in PROMPT.md
- **Ralph** - Executes autonomous development loop with SAGA and Cartographer
- **Code Reviewer** - Performs comprehensive code reviews with automated testing
- **Terminal Tester** - Executes scripts and commands in terminals, captures output

### [Scripts](./scripts/README.md)
Supporting tools and automation scripts:
- **Ralph Loop** - Autonomous development execution script
- **Cartographer** - Codebase architecture mapper
- **SAGA Protocol** - Structured planning template
- **Installation Scripts** - One-click setup

 ### [Plugins](./plugins/README.md)
OpenCode plugins for extended functionality:
- **Discord Plugin** - Real-time Discord monitoring and interaction

### [Skills](./skills/README.md)
OpenCode and Senter skills for extended functionality:
- **Terminal Launcher** - Open and monitor terminal sessions in real-time
- **SAGA Automation** - Automate SAGA workflow with testing and code review
- **Code Reviewer** - Automated code reviews with LLM-friendly prompts
- **Terminal Tester** - Terminal execution and testing

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/SouthpawIN/ai-sandbox.git
cd ai-sandbox

# Run installation script
chmod +x install.sh
./install.sh
```

---

## 📋 Compatibility

| Tool | OpenCode | Senter | Claude Code | Cursor |
|-------|-----------|--------|-------------|---------|
| Agents | ✅ | ✅ | ✅ | ✅ |
| Scripts | ✅ | ✅ | ✅ | ✅ |
| Plugins | ✅ | ❓ | ❓ | ❓ |
| Skills | ✅ | ✅ | ❓ | ❓ |

---

## 📂 Architecture

```
ai-sandbox/
├── agents/              # AI agent configurations
│   ├── saga-writer.md  # SAGA-Writer agent
│   ├── ralph.md         # Ralph agent
│   ├── code-reviewer.md # Code Reviewer agent
│   └── terminal-tester.md # Terminal Tester agent
├── scripts/             # Automation and utility scripts
│   ├── cartographer.py   # Architecture mapper
│   ├── SAGA_PROTOCOL.md # Planning template
│   ├── ralph_loop.sh    # Autonomous development loop
│   ├── setup-ralph.sh  # Ralph setup
│   ├── terminal-tools/   # Terminal management tools
│   └── install-*.sh     # Installation scripts
├── skills/              # OpenCode and Senter skills
│   ├── terminal-launcher.md # Terminal session management
│   ├── saga-automation.md # SAGA workflow automation
│   ├── code-reviewer.md # Automated code reviews
│   └── terminal-tester.md # Terminal execution and testing
├── plugins/             # OpenCode plugins
│   └── discord-plugin/  # Discord integration
│       ├── src/         # TypeScript source
│       ├── package.json  # Plugin manifest
│       └── README.md     # Plugin documentation
├── install.sh           # One-click installation
└── README.md           # This file
```

---

## 🎓 Version History

### v3.0 (January 17, 2026)
- ✨ Added Code Reviewer agent for automated code reviews
- ✨ Added Terminal Tester agent for script execution
- ✨ Added SAGA Automation skill for workflow automation
- 🔧 Integration between Code Reviewer and Terminal Tester
- 📝 Code reviews now generate LLM-friendly prompts
- 🧪 Automated testing in SAGA workflow

### v2.1 (January 17, 2026)
- ✨ Added Terminal Launcher skill for real-time terminal monitoring
- 📂 Added skills directory for OpenCode and Senter extensions
- 🔧 Created terminal-tools scripts for alacritty and gnome-terminal
- 📝 Updated README with skills section

### v2.0 (January 17, 2026)
- ✨ Added Discord Plugin for OpenCode
- 🔄 Renamed prompt-fixer to saga-writer (SAGA methodology)
- 📝 Updated README to reflect monorepo structure
- 📂 Added individual READMEs for each component

### v1.0 (January 15, 2026)
- 🎉 Initial release
- ✅ Prompt-Fixer agent
- ✅ Ralph autonomous development
- ✅ SAGA planning
- ✅ Cartographer mapping

---

## 🤝 Contributing

This is a collection of tools that can grow over time. Each component is maintained independently:

- **Agents** - See [agents/README.md](./agents/README.md)
- **Scripts** - See [scripts/README.md](./scripts/README.md)
- **Plugins** - See [plugins/README.md](./plugins/README.md)

---

## 📄 License

MIT License

---

**Transform ideas into reality with autonomous AI development!**

From rough idea to working application in hours, not weeks.

**Built for:** OpenCode | Senter | Claude Code | Cursor
