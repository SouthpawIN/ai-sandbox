# Agents

AI agents for requirements gathering, code review, and autonomous development.

## Overview

This directory contains specialized AI agents that can be loaded and used by OpenCode and Senter.

## Available Agents

### SAGA-Writer

**File**: `saga-writer.md`

**Purpose**: Collaborates with user on PROMPT.md requirements, then runs internal SAGA planning to create concrete implementation plans.

**Features**:
- ✅ Collaborates with user on project requirements
- ✅ Runs internal 4-agent SAGA planning loop (Planner, Implementer, Optimizer, Analyzer)
- ✅ Validates requirements before planning
- ✅ Creates concrete, actionable plans
- ✅ Delegates to Ralph for implementation

**Usage**:
```bash
# Start SAGA-Writer
senter @saga-writer
```

### Ralph

**File**: `ralph.md`

**Purpose**: Executes autonomous development loop with SAGA planning and Cartographer integration.

**Features**:
- ✅ Runs Ralph autonomous development script
- ✅ Integrates with SAGA plans
- ✅ Maps codebase architecture with Cartographer
- ✅ Implements projects autonomously
- ✅ Reports progress and status

**Usage**:
```bash
# Start Ralph
@ralph

# With specific flags
@ralph --saga --cartographer --monitor
```

### Code Reviewer

**File**: `code-reviewer.md`

**Purpose**: Performs comprehensive code reviews with automated testing and LLM-friendly prompt generation.

**Features**:
- ✅ Analyzes code for correctness, quality, performance, security
- ✅ Runs tests automatically via Terminal Tester agent
- ✅ Generates LLM-friendly review prompts
- ✅ Produces structured reports (Critical > Major > Minor > Suggestions)
- ✅ Classifies issues by severity

**Usage**:
```bash
# Review a file
senter @code-reviewer --file src/utils.py

# Review with full test suite
senter @code-reviewer --file src/utils.py --full-test

# Generate LLM prompt only
senter @code-reviewer --file src/utils.py --prompt-only

# Watch mode for continuous review
senter @code-reviewer --watch
```

### Terminal Tester

**File**: `terminal-tester.md`

**Purpose**: Executes scripts and commands in isolated GUI terminals with output capture and reporting.

**Features**:
- ✅ Opens GUI terminals (alacritty or gnome-terminal)
- ✅ Executes scripts/commands in isolated environments
- ✅ Captures output in real-time via named pipes
- ✅ Reports success/failure with detailed output
- ✅ Supports multiple execution modes (test, verify, benchmark)
- ✅ JSON output for automation

**Usage**:
```bash
# Execute a command
senter @terminal-tester --command "pytest -v"

# Execute a script
senter @terminal-tester --script /path/to/test.sh

# Run tests in isolated terminal
senter @terminal-tester --test

# Verify functionality
senter @terminal-tester --verify

# Benchmark performance
senter @terminal-tester --benchmark

# Execute with custom arguments
senter @terminal-tester --script test.py -- --verbose --no-color
```

## Agent Workflows

### SAGA-Writer → Ralph (Recommended)

```bash
# Step 1: Define requirements
senter @saga-writer

# Step 2: SAGA creates plan automatically

# Step 3: Ralph implements autonomously
@ralph
```

### Code Reviewer with Testing

```bash
# Step 1: Code Reviewer analyzes and tests
senter @code-reviewer --file src/utils.py --full-test

# Step 2: Generates review with test results

# Step 3: Feed review to LLM for fixes
# (Output is in LLM-friendly prompt format)
```

### Terminal Tester for Validation

```bash
# Step 1: Terminal Tester runs script
senter @terminal-tester --script run-tests.sh

# Step 2: Captures output and reports results

# Step 3: Can be integrated with Code Reviewer
# For automated code review with test validation
```

### Full SAGA Automation Workflow

```bash
# Step 1: SAGA-Writer creates plan
senter @saga-writer

# Step 2: Code Reviewer validates code
senter @code-reviewer --full-test

# Step 3: Terminal Tester executes tests
senter @terminal-tester --test

# Step 4: Ralph iterates on feedback
@ralph --monitor
```

## Agent Configuration

All agents use the standard agent YAML format:

```yaml
---
description: [agent description]
mode: [subagent]
model: [model name]
temperature: [0.0-1.0]
tools:
  write: true
  edit: true
  bash: true
  glob: false
  grep: false
  webfetch: true
  websearch: true
  codesearch: true
  read: true
  multi-edit: false
  task: true
  todowrite: false
  toread: true
  question: true
---
```

## Adding New Agents

### Agent Structure

```markdown
---
description: [Brief description]
mode: subagent
model: [model name]
temperature: [0.0-1.0]
tools:
  write: true
  edit: true
  bash: true
  glob: false
  grep: false
  webfetch: true
  websearch: true
  codesearch: true
  read: true
  multi-edit: false
  task: true
  todowrite: false
  toread: true
  question: true
---

# Agent Name

Brief description of what this agent does.

## Your Purpose

Detailed explanation of agent functionality.

## Your Workflow

Step-by-step process of how agent works.

## Examples

Example usage patterns with expected outputs.
```

### Best Practices

1. **Clear Purpose**: Each agent should have a single, well-defined purpose
2. **Compatible Tools**: Use tools compatible with OpenCode and Senter
3. **Documentation**: Include examples, troubleshooting, and usage patterns
4. **Integration**: Design agents to work together in workflows
5. **Error Handling**: Handle errors gracefully and provide helpful feedback

## Compatibility

| Agent | OpenCode | Senter | Claude Code | Cursor |
|-------|-----------|--------|-------------|---------|
| SAGA-Writer | ✅ | ✅ | ✅ | ✅ |
| Ralph | ✅ | ✅ | ✅ | ✅ |
| Code Reviewer | ✅ | ✅ | ✅ | ✅ |
| Terminal Tester | ✅ | ✅ | ✅ | ✅ |

## See Also

- [Skills](../skills/README.md) - OpenCode and Senter skills
- [Scripts](../scripts/README.md) - Supporting scripts and automation
- [Plugins](../plugins/README.md) - OpenCode plugins