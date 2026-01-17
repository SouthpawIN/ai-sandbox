# Code Reviewer Skill

Perform comprehensive code reviews and generate LLM-friendly review prompts.

## Overview

The Code Reviewer skill enables automated code analysis, test execution, and structured review generation. It integrates with Terminal Tester for automated testing and produces reviews formatted as prompts for LLM consumption.

## Quick Start

### Basic Code Review:

```bash
# Review a single file
senter @code-reviewer --file /path/to/file.py

# Review a directory
senter @code-reviewer --directory /path/to/project

# Review code snippet
senter @code-reviewer --code "def foo(): return 42"
```

### With Testing:

```bash
# Review and run tests
senter @code-reviewer --file /path/to/file.py --test

# Review with specific test command
senter @code-reviewer --file /path/to/file.py --test-cmd "pytest -v"
```

### Output Formats:

```bash
# Full report
senter @code-reviewer --file file.py --full

# LLM prompt only
senter @code-reviewer --file file.py --prompt-only

# Summary only
senter @code-reviewer --file file.py --summary
```

## How It Works

### Architecture:

```
Code Input (File/Snippet/Directory)
    ↓
Context Analysis (imports, dependencies, tests)
    ↓
Terminal Tester → Run Tests
    ↓
Code Analysis (Correctness, Quality, Performance, Security)
    ↓
Generate Report (Structured + LLM Prompt)
    ↓
Output to User
```

### Analysis Dimensions:

#### 1. Correctness
- Logic errors
- Edge cases not handled
- Input validation
- Error handling

#### 2. Code Quality
- Readability
- Naming conventions
- Code structure
- Complexity

#### 3. Performance
- Algorithm efficiency
- Data structure usage
- Memory allocation
- I/O operations

#### 4. Security
- SQL injection
- XSS vulnerabilities
- Authentication/authorization
- Sensitive data handling

#### 5. Maintainability
- Documentation
- Test coverage
- Code organization
- Consistency

## Usage Patterns

### Pattern 1: Single File Review

```bash
# Review a Python file
senter @code-reviewer --file src/auth.py

# Output:
# ══════════════════════════════════════════════════════════════
#                     CODE REVIEW REPORT
# ══════════════════════════════════════════════════════════════
#
# 📁 File Reviewed: src/auth.py
# 📊 Test Results: 12 passed, 0 failed
# ⏱️  Review Date: 2026-01-17 15:30:00
#
# [... detailed review ...]
```

### Pattern 2: Code Snippet Review

```bash
# Review a code snippet
senter @code-reviewer --code "
def process_data(data):
    result = []
    for item in data:
        if item['value'] > 100:
            result.append(item)
    return result
"

# Output:
# CRITICAL ISSUES
# - No error handling for missing 'value' key
#
# MAJOR ISSUES
# - Type hints missing
#
# MINOR ISSUES
# - Could use list comprehension
```

### Pattern 3: Directory Review

```bash
# Review entire project
senter @code-reviewer --directory /home/user/myproject

# Output:
# Scanning project...
# Found 47 files
#
# ══════════════════════════════════════════════════════════════
#                PROJECT CODE REVIEW REPORT
# ══════════════════════════════════════════════════════════════
#
# Project: /home/user/myproject
# Files Reviewed: 47
# Test Coverage: 87.5%
#
# [... comprehensive review ...]
```

### Pattern 4: With Automated Testing

```bash
# Review and run tests
senter @code-reviewer --file src/utils.py --test

# Internally:
# 1. Read file
# 2. Find tests (pytest, unittest, jest, etc.)
# 3. Call Terminal Tester to run tests
# 4. Analyze test results
# 5. Perform code review
# 6. Generate combined report
```

### Pattern 5: Continuous Review Mode

```bash
# Watch for changes and auto-review
senter @code-reviewer --watch --directory src/

# This monitors directory and auto-reviews on changes
```

## LLM Prompt Generation

The Code Reviewer generates LLM-friendly prompts:

```markdown
# Code Review Request

## Code to Review

File: src/auth.py

```python
def login(username, password):
    if not username or not password:
        return {"error": "Missing credentials"}

    user = db.query(f"SELECT * FROM users WHERE username = '{username}'")

    if not user:
        return {"error": "User not found"}

    if bcrypt.checkpw(password.encode(), user.password_hash):
        token = generate_token(user.id)
        return {"token": token}

    return {"error": "Invalid password"}
```

## Context

Authentication module for a web API. Handles user login and JWT token generation.

## Review Focus Areas

1. **Security** - Primary concern for authentication code
2. **Correctness** - Must properly validate credentials
3. **Performance** - Should be efficient for high traffic

## Test Results

Tests passed: 8/10
Failing tests:
- test_sql_injection: Expected security check
- test_special_characters: Fails on username with special chars

## Specific Questions

1. Are there any security vulnerabilities I missed?
2. Is the SQL query safe?
3. Should I use an ORM instead of raw SQL?

## Expected Output Format

Please provide:
1. **Critical Issues** - Must fix before merging
2. **Major Issues** - Should fix but not blocking
3. **Minor Issues** - Nice to have improvements
4. **Suggestions** - Alternative approaches or optimizations
5. **Positive Feedback** - What's done well

For each issue, include:
- Exact location (file:line or code snippet)
- Explanation of why it's a problem
- Specific fix or improvement suggestion
- Reference to best practices or standards
```

## Integration with Terminal Tester

The Code Reviewer uses Terminal Tester for test execution:

```python
# Internal call to Terminal Tester
def run_tests(file_path):
    """Run tests for the given file"""

    # Find test framework
    test_framework = detect_test_framework(file_path)

    # Build test command
    if test_framework == "pytest":
        test_cmd = f"pytest {file_path.replace('.py', '_test.py')} -v"
    elif test_framework == "jest":
        test_cmd = f"npm test -- {file_path}"
    # ... other frameworks

    # Call Terminal Tester
    result = call_terminal_tester(test_cmd)

    return result
```

## Review Templates

### Python Code Review Template:

```python
# Check for:
- PEP 8 compliance
- Type hints (PEP 484)
- Docstrings (PEP 257)
- Exception handling
- Mutable default arguments
- Unused imports
- List comprehension efficiency
- f-strings vs .format()
```

### JavaScript/TypeScript Code Review Template:

```javascript
// Check for:
- ESLint rules
- TypeScript types
- Async/await error handling
- Null/undefined checks
- Memory leaks (listeners, intervals)
- Arrow functions vs function
- const/let vs var
- Template literals
```

### SQL Code Review Template:

```sql
-- Check for:
- SQL injection vulnerabilities
- Index usage
- N+1 query problems
- JOIN efficiency
- WHERE clauses on UPDATE/DELETE
- Transaction management
```

## Advanced Features

### Custom Review Rules:

```bash
# Review with custom rules
senter @code-reviewer --file file.py --rules no-print-statements,max-complexity=10
```

### Focus Areas:

```bash
# Review only security
senter @code-reviewer --file file.py --focus security

# Review only performance
senter @code-reviewer --file file.py --focus performance

# Review only security and performance
senter @code-reviewer --file file.py --focus security,performance
```

### Custom Output Format:

```bash
# JSON output
senter @code-reviewer --file file.py --format json

# Markdown output (default)
senter @code-reviewer --file file.py --format markdown

# Plain text
senter @code-reviewer --file file.py --format text
```

### Severity Filtering:

```bash
# Show only critical and major issues
senter @code-reviewer --file file.py --severity critical,major

# Show only minor issues and suggestions
senter @code-reviewer --file file.py --severity minor,suggestion
```

## Command Reference

### Main Options:

```bash
--file PATH          # Review specific file
--directory PATH     # Review directory
--code "CODE"        # Review code snippet
--test               # Run tests during review
--test-cmd CMD       # Use custom test command
--full               # Full report (default)
--summary            # Summary only
--prompt-only        # LLM prompt only
--watch              # Watch mode (auto-review on changes)
--focus AREAS        # Focus on specific areas
--severity LEVELS    # Filter by severity
--format FORMAT      # Output format (json|markdown|text)
--rules RULES        # Custom review rules
--verbose            # Detailed output
```

### Focus Areas:

```bash
security        # Security vulnerabilities
correctness     # Logic and correctness
performance     # Performance issues
quality         # Code quality
maintainability # Maintainability
testing         # Test coverage and quality
```

### Severity Levels:

```bash
critical   # Must fix before merging
major      # Should fix but not blocking
minor      # Nice to have improvements
suggestion # Alternative approaches
```

## Examples

### Example 1: Simple File Review

```bash
$ senter @code-reviewer --file src/utils.py

🔍 Analyzing: src/utils.py
📊 Found 3 related files
🧪 Running tests...

═══════════════════════════════════════════════════════════════
                    CODE REVIEW REPORT
═══════════════════════════════════════════════════════════════

📁 File Reviewed: src/utils.py
📊 Test Results: 15 passed, 0 failed
⏱️  Review Date: 2026-01-17 15:30:00

─────────────────────────────────────────────────────────────────
CRITICAL ISSUES (Must Fix)
─────────────────────────────────────────────────────────────────

None found ✅

─────────────────────────────────────────────────────────────────
MAJOR ISSUES (Should Fix)
─────────────────────────────────────────────────────────────────

1. Missing Input Validation
   Location: src/utils.py:23
   Problem: Function doesn't validate input type
   Fix: Add type checking
   ```python
   def process_data(data: List[Dict]) -> List[Dict]:
       if not isinstance(data, list):
           raise TypeError("data must be a list")
       # ...
   ```

─────────────────────────────────────────────────────────────────
MINOR ISSUES (Nice to Have)
─────────────────────────────────────────────────────────────────

1. Could Use List Comprehension
   Location: src/utils.py:45-49
   Problem: For loop could be more concise
   Fix: Use list comprehension
   ```python
   # Before:
   result = []
   for item in data:
       if item['active']:
           result.append(item)

   # After:
   result = [item for item in data if item['active']]
   ```

─────────────────────────────────────────────────────────────────
POSITIVE FEEDBACK
─────────────────────────────────────────────────────────────────

✅ Good function naming
✅ Clear documentation
✅ Proper error handling
✅ Test coverage is good

═══════════════════════════════════════════════════════════════
```

### Example 2: Security-Focused Review

```bash
$ senter @code-reviewer --file src/auth.py --focus security

🔍 Analyzing: src/auth.py (security focus)
📊 Found 2 related files
🧪 Running tests...

═══════════════════════════════════════════════════════════════
               SECURITY CODE REVIEW REPORT
═══════════════════════════════════════════════════════════════

📁 File Reviewed: src/auth.py
🔒 Focus: Security Issues
⏱️  Review Date: 2026-01-17 15:30:00

─────────────────────────────────────────────────────────────────
CRITICAL SECURITY ISSUES
─────────────────────────────────────────────────────────────────

1. SQL Injection Vulnerability
   Location: src/auth.py:87
   Severity: CRITICAL
   Problem: Using string formatting in SQL query
   Fix: Use parameterized queries
   ```python
   # Bad:
   cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")

   # Good:
   cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
   ```

2. Weak Password Hashing
   Location: src/auth.py:45
   Severity: CRITICAL
   Problem: bcrypt cost factor too low (4)
   Fix: Increase to 12 or higher
   ```python
   hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))
   ```

─────────────────────────────────────────────────────────────────
MAJOR SECURITY ISSUES
─────────────────────────────────────────────────────────────────

1. Missing Rate Limiting
   Location: src/auth.py:23-56
   Severity: MAJOR
   Problem: No rate limiting on login endpoint
   Fix: Implement rate limiting
   ```python
   from flask_limiter import Limiter

   limiter = Limiter(app, key_func=get_remote_address)

   @app.route('/login', methods=['POST'])
   @limiter.limit("10 per minute")
   def login():
       # ...
   ```

2. No Token Expiration Validation
   Location: src/auth.py:112
   Severity: MAJOR
   Problem: JWT token expiration not checked
   Fix: Validate expiration before use

═══════════════════════════════════════════════════════════════
```

### Example 3: Generate LLM Prompt Only

```bash
$ senter @code-reviewer --file src/auth.py --prompt-only

# Code Review Request

## Code to Review

File: src/auth.py

[Full code...]

## Context

Authentication module for a web application...

## Review Focus Areas

1. **Security** - Primary concern for authentication code
2. **Correctness** - Must properly validate credentials
3. **Performance** - Should be efficient for high traffic

## Test Results

Tests passed: 8/10
Failing tests: test_sql_injection, test_special_characters

## Specific Questions

1. Are there any security vulnerabilities I missed?
2. Is the SQL query safe?
3. Should I use an ORM instead of raw SQL?

## Expected Output Format

Please provide:
1. **Critical Issues** - Must fix before merging
2. **Major Issues** - Should fix but not blocking
3. **Minor Issues** - Nice to have improvements
4. **Suggestions** - Alternative approaches or optimizations
5. **Positive Feedback** - What's done well
```

## Integration with SAGA

Use Code Reviewer within SAGA workflow:

```bash
# Review SAGA plan
senter @code-reviewer --file SAGA_PLAN.md

# Review generated specifications
senter @code-reviewer --file specs.md

# Review architecture decisions
senter @code-reviewer --file architecture.md

# Review Ralph's implementation
senter @code-reviewer --directory src/
```

## Troubleshooting

### File Not Found:

```bash
$ senter @code-reviewer --file nonexistent.py

❌ Error: File not found: nonexistent.py
   Please check the file path

   Current directory: /home/user/project
```

### No Tests Found:

```bash
$ senter @code-reviewer --file src/utils.py --test

⚠️  Warning: No tests found for src/utils.py
   Performing static analysis only

   Consider adding tests for better coverage
```

### Test Failures:

```bash
$ senter @code-reviewer --file src/auth.py --test

📊 Test Results: 8 passed, 2 failed

Failing tests:
- test_sql_injection: Expected security check
- test_special_characters: Fails on special chars

⚠️  Review will focus on these failing tests
```

## Best Practices

1. **Always run tests** - Use `--test` flag when possible
2. **Focus on specific areas** - Use `--focus` for targeted reviews
3. **Generate LLM prompts** - Use `--prompt-only` for automated reviews
4. **Watch for changes** - Use `--watch` for continuous review
5. **Filter by severity** - Use `--severity` to prioritize issues

## See Also

- [Code Reviewer Agent](../agents/code-reviewer.md) - Agent implementation
- [Terminal Tester Skill](./terminal-tester.md) - Terminal execution and testing
- [SAGA Automation](./saga-automation.md) - SAGA workflow integration
- [Terminal Launcher](./terminal-launcher.md) - Terminal management

---

**Automate code reviews, run tests, generate LLM prompts!**
