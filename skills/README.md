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