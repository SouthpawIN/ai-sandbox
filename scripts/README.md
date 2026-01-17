# Scripts

Automation and utility scripts for AI development.

## Overview

This directory contains supporting scripts for autonomous development, codebase mapping, and terminal management.

## Available Scripts

### Ralph Loop

**File**: `ralph_loop.sh`

**Purpose**: Autonomous development execution loop using Ralph agent.

**Usage**:
```bash
./scripts/ralph_loop.sh
```

### Cartographer

**File**: `cartographer.py`

**Purpose**: Map codebase architecture and generate comprehensive documentation.

**Usage**:
```bash
python3 scripts/cartographer.py
```

### Setup Ralph

**File**: `setup-ralph.sh`

**Purpose**: Configure Ralph environment and dependencies.

**Usage**:
```bash
./scripts/setup-ralph.sh
```

## Terminal Tools

### Open Senter Terminal

**File**: `terminal-tools/open-senter-terminal.py`

**Purpose**: Open alacritty terminal, run senter, and monitor output in real-time.

**Usage**:
```bash
python3 scripts/terminal-tools/open-senter-terminal.py
```

**Features**:
- Opens GUI terminal (alacritty or gnome-terminal)
- Runs senter automatically
- Monitors output via named pipe
- Displays real-time output with line numbers
- Cleans up automatically on exit

### Terminal Monitor

**File**: `terminal-tools/terminal-monitor.py`

**Purpose**: General utility for monitoring terminal output via named pipes.

**Usage**:
```bash
# Create pipe
mkfifo /tmp/my-terminal.pipe

# Start monitoring
python3 scripts/terminal-tools/terminal-monitor.py /tmp/my-terminal.pipe

# In another terminal, write to pipe
echo "Hello from pipe" > /tmp/my-terminal.pipe
```

## Installation Scripts

### Install

**File**: `install.sh`

**Purpose**: One-click installation of all tools and dependencies.

**Usage**:
```bash
./install.sh
```

## Templates

### SAGA Protocol

**File**: `SAGA_PROTOCOL.md`

**Purpose**: Structured planning template for SAGA methodology.

## Running Scripts

### With Correct Python

```bash
# Use uv or python3
python3 scripts/cartographer.py
./scripts/ralph_loop.sh
```

### From Any Directory

```bash
# Full path
/home/user/ai-sandbox/scripts/cartographer.py

# Or add to PATH
export PATH="$PATH:/home/user/ai-sandbox/scripts"
cartographer.py
```

## Troubleshooting

### Script Not Found

```bash
# Check file exists
ls -la scripts/cartographer.py

# Check permissions
chmod +x scripts/ralph_loop.sh
```

### Python Errors

```bash
# Use python3 explicitly
python3 scripts/cartographer.py

# Check dependencies
python3 -m pip install -r requirements.txt  # if exists
```

### Terminal Not Opening

```bash
# Check DISPLAY
echo $DISPLAY  # Should be :0

# Check alacritty
which alacritty

# Try gnome-terminal fallback
```

## Adding New Scripts

### Python Scripts

```bash
# Add to scripts directory
# Make executable
chmod +x scripts/my-script.py

# Test
python3 scripts/my-script.py
```

### Shell Scripts

```bash
# Add shebang
#!/bin/bash

# Make executable
chmod +x scripts/my-script.sh

# Test
./scripts/my-script.sh
```

### Documentation

Create a README or inline documentation:
```bash
#!/bin/bash
# My Script - Brief description
#
# Usage: ./my-script.sh [options]
#
# Examples:
#   ./my-script.sh --verbose
#   ./my-script.sh --file input.txt
```

## See Also

- [Skills](../skills/README.md) - OpenCode and Senter skills
- [Agents](../agents/README.md) - AI agent configurations
- [Plugins](../plugins/README.md) - OpenCode plugins