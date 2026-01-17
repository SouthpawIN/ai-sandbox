# Terminal Tester Skill

Execute scripts and commands in terminals, capture output, and report results.

## Overview

The Terminal Tester skill enables automated terminal execution, real-time output monitoring, and detailed success/failure reporting. It integrates with the Terminal Launcher skill and provides a clean interface for running tests, builds, and scripts.

## Quick Start

### Execute Single Command:

```bash
# Run a command
senter @terminal-tester --command "pytest -v"

# Run in specific directory
senter @terminal-tester --command "npm test" --directory /home/user/frontend

# Run script
senter @terminal-tester --script /home/user/test.sh
```

### Execute Multiple Commands:

```bash
# Run multiple commands sequentially
senter @terminal-tester --commands "npm install,npm test"

# Run with custom separator
senter @terminal-tester --commands "npm install && npm test" --separator " && "
```

### Background Execution:

```bash
# Run in background
senter @terminal-tester --command "npm run dev" --background

# Run in interactive terminal
senter @terminal-tester --command "python manage.py shell" --interactive
```

## How It Works

### Architecture:

```
User Request (Command/Script)
    ↓
Prepare Execution (Check dependencies, create pipe)
    ↓
Launch Terminal (via Terminal Launcher)
    ↓
Monitor Output (Read named pipe, clean ANSI codes)
    ↓
Generate Report (Success/failure, exit code, output)
    ↓
Return to User
```

### Execution Flow:

```python
# Internal execution flow
def execute_command(command, working_dir=None, timeout=300):
    # 1. Create named pipe for output capture
    pipe_path = create_pipe()

    # 2. Wrap command with script utility
    script_cmd = f'script -f {pipe_path} -c "{command}"'

    # 3. Launch terminal via Terminal Launcher
    terminal_pid = launch_terminal(script_cmd, working_dir)

    # 4. Monitor pipe for output
    output_lines = monitor_pipe(pipe_path, timeout)

    # 5. Wait for process completion
    exit_code = wait_for_process(terminal_pid)

    # 6. Generate report
    report = generate_report(command, exit_code, output_lines)

    # 7. Cleanup
    cleanup(pipe_path)

    return report
```

## Usage Patterns

### Pattern 1: Simple Command Execution

```bash
# Run a single command
senter @terminal-tester --command "ls -la"

# Output:
# 🚀 Executing: ls -la
# 📁 Directory: /home/user
# ⏱️  Started at: 2026-01-17 15:30:00
#
# Running...
#
# ✅ Execution complete!
#
# ══════════════════════════════════════════════════════════════
#                 TERMINAL EXECUTION REPORT
# ════════════════════════════════════════════════════════════════
#
# 📋 Command: ls -la
# 📁 Directory: /home/user
# ⏱️  Duration: 0.05s
# 📊 Status: SUCCESS
#
# [... output ...]
```

### Pattern 2: Test Execution

```bash
# Run Python tests
senter @terminal-tester --command "pytest -v"

# Run JavaScript tests
senter @terminal-tester --command "npm test"

# Run Go tests
senter @terminal-tester --command "go test ./..."

# Output includes:
# - Test execution progress
# - Test results summary
# - Exit code interpretation
# - Detailed test output
```

### Pattern 3: Build Commands

```bash
# Build Node.js project
senter @terminal-tester --command "npm run build"

# Build Python project
senter @terminal-tester --command "python setup.py build"

# Build Rust project
senter @terminal-tester --command "cargo build --release"

# Output includes:
# - Build progress
# - Compilation errors (if any)
# - Build artifacts created
```

### Pattern 4: Linting

```bash
# Python linting
senter @terminal-tester --command "pylint src/"

# JavaScript linting
senter @terminal-tester --command "eslint src/"

# Output includes:
# - Linting errors and warnings
# - Code quality metrics
# - Exit code (0 for success)
```

### Pattern 5: Script Execution

```bash
# Execute shell script
senter @terminal-tester --script /home/user/deploy.sh

# Execute Python script
senter @terminal-tester --script /home/user/runner.py

# Execute with arguments
senter @terminal-tester --script /home/user/test.sh --args "--verbose --output results.json"
```

## Command Reference

### Main Options:

```bash
--command CMD          # Execute single command
--commands CMDS        # Execute multiple commands (comma-separated)
--script PATH          # Execute script file
--args ARGS            # Arguments for script
--directory PATH       # Working directory
--timeout SECONDS      # Execution timeout (default: 300)
--background           # Run in background
--interactive          # Run in interactive terminal
--separator SEP        # Command separator (default: ",")
--env KEY=VALUE        # Set environment variables
--format FORMAT        # Output format (text|json|markdown)
--verbose              # Detailed output
--full                 # Full output (default)
--summary              # Summary only
```

### Execution Modes:

```bash
--sync                 # Synchronous execution (default)
--async                # Asynchronous execution
--background           # Background execution
--interactive          # Interactive terminal
```

### Output Options:

```bash
--full                 # Full output (default)
--summary              # Summary only
--output PATH          # Save output to file
--no-ansi              # Strip ANSI codes
--line-numbers         # Add line numbers to output
```

## Output Formats

### Success Report:

```markdown
═══════════════════════════════════════════════════════════════
                TERMINAL EXECUTION REPORT
═══════════════════════════════════════════════════════════════

📋 Command: pytest -v
📁 Directory: /home/user/project
⏱️  Duration: 4.23s
📊 Status: SUCCESS

─────────────────────────────────────────────────────────────────
OUTPUT SUMMARY
─────────────────────────────────────────────────────────────────

✅ All tests passed!
- 47 tests passed
- 0 tests failed
- Coverage: 87.5%

─────────────────────────────────────────────────────────────────
KEY FINDINGS
─────────────────────────────────────────────────────────────────

✅ All test suites executed successfully
✅ No failures or errors detected
✅ Test coverage meets requirements (>80%)

─────────────────────────────────────────────────────────────────
EXIT CODE
─────────────────────────────────────────────────────────────────

Code: 0
Meaning: Success - All tests passed

═══════════════════════════════════════════════════════════════
```

### Failure Report:

```markdown
═══════════════════════════════════════════════════════════════
                TERMINAL EXECUTION REPORT
═══════════════════════════════════════════════════════════════

📋 Command: pytest -v
📁 Directory: /home/user/project
⏱️  Duration: 3.87s
📊 Status: FAILED

─────────────────────────────────────────────────────────────────
OUTPUT SUMMARY
─────────────────────────────────────────────────────────────────

❌ Tests failed!
- 45 tests passed
- 2 tests failed
- Coverage: 85.2%

─────────────────────────────────────────────────────────────────
KEY FINDINGS
─────────────────────────────────────────────────────────────────

❌ 2 tests failing in test_auth.py
⚠️  Coverage slightly below target (85.2% < 87%)
✅ 45 tests passing successfully

─────────────────────────────────────────────────────────────────
FAILING TESTS
─────────────────────────────────────────────────────────────────

1. test_invalid_token (src/test_auth.py:23)
   Expected: 401 Unauthorized
   Got: 200 OK
   Error: Token should be rejected but was accepted

2. test_expiration (src/test_auth.py:47)
   Expected: Token to expire after 24h
   Got: Token still valid
   Error: Expiration logic not working

─────────────────────────────────────────────────────────────────
EXIT CODE
─────────────────────────────────────────────────────────────────

Code: 1
Meaning: Failure - Some tests did not pass

═══════════════════════════════════════════════════════════════
```

## Common Command Templates

### Python:

```bash
# pytest
senter @terminal-tester --command "pytest -v --tb=short"

# unittest
senter @terminal-tester --command "python -m unittest discover -v"

# coverage
senter @terminal-tester --command "pytest --cov=src --cov-report=html"

# linting
senter @terminal-tester --command "pylint src/"

# formatting
senter @terminal-tester --command "black src/"
```

### JavaScript/Node.js:

```bash
# npm test
senter @terminal-tester --command "npm test"

# jest
senter @terminal-tester --command "npx jest --verbose"

# mocha
senter @terminal-tester --command "npx mocha --reporter spec"

# eslint
senter @terminal-tester --command "eslint src/"

# build
senter @terminal-tester --command "npm run build"
```

### Go:

```bash
# tests
senter @terminal-tester --command "go test ./..."

# build
senter @terminal-tester --command "go build"

# vet
senter @terminal-tester --command "go vet ./..."

# fmt
senter @terminal-tester --command "go fmt ./..."
```

### Rust:

```bash
# tests
senter @terminal-tester --command "cargo test"

# build
senter @terminal-tester --command "cargo build --release"

# clippy
senter @terminal-tester --command "cargo clippy"

# fmt
senter @terminal-tester --command "cargo fmt"
```

### Shell:

```bash
# run script
senter @terminal-tester --script ./deploy.sh

# run with arguments
senter @terminal-tester --script ./deploy.sh --args "--verbose --dry-run"

# multiple commands
senter @terminal-tester --commands "mkdir build,cd build,cmake ..,make"
```

## Integration with Code Reviewer

The Terminal Tester is called by Code Reviewer for automated testing:

```bash
# Code Reviewer internally calls Terminal Tester
senter @code-reviewer --file src/utils.py --test

# This internally:
# 1. Reads src/utils.py
# 2. Finds test files
# 3. Calls Terminal Tester:
#    senter @terminal-tester --command "pytest tests/test_utils.py -v"
# 4. Captures test results
# 5. Performs code review
# 6. Generates combined report
```

## Integration with SAGA

Use Terminal Tester within SAGA workflow:

```bash
# Phase 1: Validate objectives
senter @terminal-tester --command "npm list --depth=0"

# Phase 2: Test feasibility
senter @terminal-tester --command "pytest --collect-only"

# Phase 3: Test candidates
senter @terminal-tester --script "test_candidates.sh"

# Phase 4: Prototype testing
senter @terminal-tester --command "python prototype.py"
```

## Advanced Usage

### Environment Variables:

```bash
# Set environment variables
senter @terminal-tester --command "pytest" --env "NODE_ENV=test,API_URL=http://localhost:3000"

# Multiple environment variables
senter @terminal-tester --command "pytest" --env "TEST_DB=test.db,VERBOSE=true"
```

### Output to File:

```bash
# Save output to file
senter @terminal-tester --command "pytest" --output /tmp/test-results.txt

# Append to file
senter @terminal-tester --command "pytest" --output /tmp/test-results.txt --append
```

### Custom Timeout:

```bash
# Set custom timeout
senter @terminal-tester --command "pytest" --timeout 600

# Timeout in minutes
senter @terminal-tester --command "pytest" --timeout 3600  # 1 hour
```

### Background Execution:

```bash
# Run in background
senter @terminal-tester --command "npm run dev" --background

# Get background process status
senter @terminal-tester --status

# Stop background process
senter @terminal-tester --stop
```

### JSON Output:

```bash
# JSON format output
senter @terminal-tester --command "pytest" --format json

# Output:
# {
#   "command": "pytest -v",
#   "exit_code": 0,
#   "status": "SUCCESS",
#   "duration": 4.23,
#   "output": "..."
# }
```

## Examples

### Example 1: Simple Test Run

```bash
$ senter @terminal-tester --command "pytest -v"

🚀 Executing: pytest -v
📁 Directory: /home/user/project
⏱️  Started at: 2026-01-17 15:30:00

Running tests...

✅ Execution complete!

═══════════════════════════════════════════════════════════════
                TERMINAL EXECUTION REPORT
═══════════════════════════════════════════════════════════════

📋 Command: pytest -v
📁 Directory: /home/user/project
⏱️  Duration: 4.23s
📊 Status: SUCCESS

─────────────────────────────────────────────────────────────────
OUTPUT SUMMARY
─────────────────────────────────────────────────────────────────

✅ All tests passed!
- 47 tests passed
- 0 tests failed
- Coverage: 87.5%

─────────────────────────────────────────────────────────────────
EXIT CODE
─────────────────────────────────────────────────────────────────

Code: 0
Meaning: Success - All tests passed

═══════════════════════════════════════════════════════════════
```

### Example 2: Build Command

```bash
$ senter @terminal-tester --command "npm run build" --directory /home/user/frontend

🚀 Executing: npm run build
📁 Directory: /home/user/frontend
⏱️  Started at: 2026-01-17 15:30:00

Building...

✅ Build complete!

═══════════════════════════════════════════════════════════════
                TERMINAL EXECUTION REPORT
═══════════════════════════════════════════════════════════════

📋 Command: npm run build
📁 Directory: /home/user/frontend
⏱️  Duration: 12.45s
📊 Status: SUCCESS

─────────────────────────────────────────────────────────────────
OUTPUT SUMMARY
─────────────────────────────────────────────────────────────────

✅ Build successful!
- Bundle size: 245KB
- Modules: 127
- Assets: 45

─────────────────────────────────────────────────────────────────
KEY FINDINGS
─────────────────────────────────────────────────────────────────

✅ No build warnings
✅ No build errors
✅ Bundle size optimized
✅ All assets generated

─────────────────────────────────────────────────────────────────
EXIT CODE
─────────────────────────────────────────────────────────────────

Code: 0
Meaning: Success - Build completed

═══════════════════════════════════════════════════════════════
```

### Example 3: Script Execution

```bash
$ senter @terminal-tester --script /home/user/deploy.sh --args "--verbose"

🚀 Executing: /home/user/deploy.sh --verbose
📁 Directory: /home/user
⏱️  Started at: 2026-01-17 15:30:00

Running deployment script...

✅ Deployment complete!

═══════════════════════════════════════════════════════════════
                TERMINAL EXECUTION REPORT
═══════════════════════════════════════════════════════════════

📋 Script: /home/user/deploy.sh --verbose
📁 Directory: /home/user
⏱️  Duration: 45.67s
📊 Status: SUCCESS

─────────────────────────────────────────────────────────────────
OUTPUT SUMMARY
─────────────────────────────────────────────────────────────────

✅ Deployment successful!
- Environment: production
- Version: v1.2.3
- Deployed to: 3 servers

─────────────────────────────────────────────────────────────────
KEY FINDINGS
─────────────────────────────────────────────────────────────────

✅ All services started
✅ Health checks passed
✅ No deployment errors
✅ Zero downtime

─────────────────────────────────────────────────────────────────
EXIT CODE
─────────────────────────────────────────────────────────────────

Code: 0
Meaning: Success - Deployment completed

═══════════════════════════════════════════════════════════════
```

### Example 4: Multiple Commands

```bash
$ senter @terminal-tester --commands "npm install,npm test"

🚀 Executing: npm install
📁 Directory: /home/user/project
⏱️  Started at: 2026-01-17 15:30:00

Installing dependencies...

✅ npm install complete!

🚀 Executing: npm test

Running tests...

✅ npm test complete!

═══════════════════════════════════════════════════════════════
              COMBINED EXECUTION REPORT
═══════════════════════════════════════════════════════════════

Commands Executed:
1. npm install (SUCCESS, 8.23s)
2. npm test (SUCCESS, 4.56s)

Total Duration: 12.79s
Overall Status: SUCCESS

═══════════════════════════════════════════════════════════════
```

## Troubleshooting

### Command Not Found:

```bash
$ senter @terminal-tester --command "pytest"

❌ Error: Command not found: pytest
   Please ensure pytest is installed and in PATH

   Try:
   - pip install pytest
   - which pytest
```

### File Not Found:

```bash
$ senter @terminal-tester --script /home/user/test.sh

❌ Error: File not found: /home/user/test.sh
   Please check the file path

   Current directory: /home/user/project
```

### Timeout:

```bash
$ senter @terminal-tester --command "pytest" --timeout 10

⏱️  Timeout: Command exceeded 10 seconds
   The command may still be running in the terminal

   Options:
   1. Increase timeout: --timeout 300
   2. Run in background: --background
   3. Cancel and try again
```

### Permission Denied:

```bash
$ senter @terminal-tester --script /home/user/test.sh

❌ Error: Permission denied: /home/user/test.sh
   Try:
   - chmod +x /home/user/test.sh
   - sudo /home/user/test.sh (use with caution)
```

## Best Practices

1. **Use appropriate timeout** - Don't set timeout too low or too high
2. **Specify working directory** - Use `--directory` for project-specific commands
3. **Save output for long commands** - Use `--output` to save results
4. **Use summary mode for quick checks** - Use `--summary` for brief output
5. **Use JSON for automation** - Use `--format json` for programmatic processing

## See Also

- [Terminal Tester Agent](../agents/terminal-tester.md) - Agent implementation
- [Code Reviewer Skill](./code-reviewer.md) - Automated code reviews
- [SAGA Automation](./saga-automation.md) - SAGA workflow integration
- [Terminal Launcher](./terminal-launcher.md) - Terminal management

---

**Execute commands, capture output, report results!**
