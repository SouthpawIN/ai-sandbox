# Skills

OpenCode and Senter skills for extended functionality.

## Overview

This directory contains reusable skills that can be loaded and used by OpenCode and Senter.

## Available Skills

### Terminal Launcher

**File**: `terminal-launcher.md`

**Purpose**: Open and monitor terminal sessions in real-time

**Features**:
- ✅ Open alacritty or gnome-terminal terminals
- ✅ Run commands with output capture
- ✅ Monitor via named pipes
- ✅ Real-time output display
- ✅ Automatic cleanup

**Usage**:
```bash
# Start terminal with senter
python3 /tmp/open-senter-terminal.py

# Learn more
# Load: terminal-launcher
```

**Requirements**:
- `python3`
- `alacritty` or `gnome-terminal`
- X11/Wayland display

### SAGA Automation

**File**: `saga-automation.md`

**Purpose**: Automate SAGA workflow with testing and code review

**Features**:
- ✅ Automate Planner → Implementer → Optimizer → Analyzer loop
- ✅ Use Terminal Tester for validation at each step
- ✅ Generate code reviews in LLM-friendly formats
- ✅ Delegate to Ralph for autonomous implementation

**Usage**:
```bash
# Full SAGA automation
senter @saga-writer --auto --test --review

# Learn more
# Load: saga-automation
```

**Integration**:
- Works with Code Reviewer agent
- Uses Terminal Tester agent
- Integrates with Ralph agent

### Code Reviewer

**File**: `code-reviewer.md`

**Purpose**: Perform comprehensive code reviews with automated testing

**Features**:
- ✅ Analyze code for correctness, quality, performance, security
- ✅ Run tests automatically via Terminal Tester
- ✅ Generate LLM-friendly review prompts
- ✅ Focus on specific areas (security, performance, etc.)
- ✅ Watch mode for continuous review

**Usage**:
```bash
# Review a file with testing
senter @code-reviewer --file src/utils.py --test

# Generate LLM prompt only
senter @code-reviewer --file src/auth.py --prompt-only

# Learn more
# Load: code-reviewer
```

**Requirements**:
- Terminal Tester skill (for automated testing)

### Terminal Tester

**File**: `terminal-tester.md`

**Purpose**: Execute scripts and commands in terminals, capture output

**Features**:
- ✅ Run commands in GUI terminals
- ✅ Capture output in real-time
- ✅ Report success/failure with details
- ✅ Multiple execution modes (sync, async, background)
- ✅ JSON output for automation

**Usage**:
```bash
# Run tests
senter @terminal-tester --command "pytest -v"

# Execute script
senter @terminal-tester --script /path/to/script.sh

# Learn more
# Load: terminal-tester
```

**Requirements**:
- `python3`
- `alacritty` or `gnome-terminal`
- X11/Wayland display

## Adding New Skills

### Skill Structure

```markdown
# Skill Name

Brief description of what this skill does.

## Overview

Detailed explanation of skill functionality.

## Quick Start

```bash
# Basic usage
command
```

## How It Works

Technical details.

## Usage Patterns

Common use cases with examples.

## Troubleshooting

Common issues and solutions.
```

### Skill Metadata

Add metadata to your skill:

```markdown
---
tags: ["terminal", "monitoring", "automation"]
requires: ["python3", "alacritty"]
compatibility: ["opencode", "senter"]
---
```

## Testing Skills

```bash
# Test skill syntax
# Open skill file and check for formatting

# Test functionality
# Follow skill's quick start instructions

# Report issues
# Check for common problems in troubleshooting section
```

## See Also

- [Scripts](../scripts/README.md) - Supporting scripts
- [Agents](../agents/README.md) - Autonomous AI agents
- [Plugins](../plugins/README.md) - OpenCode plugins