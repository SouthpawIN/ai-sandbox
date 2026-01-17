# SAGA Automation

Automate the SAGA (Scientific Autonomous Goal-evolving Agent) workflow using Code Reviewer and Terminal Tester agents.

## Overview

SAGA Automation enables you to:
- Automate the Planner → Implementer → Optimizer → Analyzer loop
- Use terminal testing for validation at each step
- Generate code reviews in LLM-friendly formats
- Delegate to Ralph for autonomous implementation

## Architecture

```
User Request
    ↓
SAGA Automation (orchestrator)
    ↓
┌─────────────┬──────────────┬──────────────┐
│   Planner   │ Implementer  │  Optimizer   │
│   Agent     │   Agent      │    Agent     │
└─────────────┴──────────────┴──────────────┘
    ↓              ↓              ↓
Terminal Tester Terminal Tester Terminal Tester
    ↓              ↓              ↓
Validation      Validation    Validation
    ↓              ↓              ↓
┌─────────────┬──────────────┬──────────────┐
│   Analyzer  │ Code Review  │     Ralph    │
│   Agent     │   Agent      │   Agent      │
└─────────────┴──────────────┴──────────────┘
```

## Quick Start

### Option 1: Full SAGA Automation

```bash
# Run complete SAGA automation loop
senter @saga-writer
```

### Option 2: Manual SAGA Steps

```bash
# Step 1: Planning phase
senter @code-reviewer --phase planner

# Step 2: Implementation testing
senter @terminal-tester --run-tests

# Step 3: Code review
senter @code-reviewer --review

# Step 4: Delegate to Ralph
senter @ralph
```

## SAGA Automation Workflow

### Phase 1: Planner (Requirements Analysis)

**Purpose:** Decompose PROMPT.md into concrete objectives.

**Automation:**
1. Read PROMPT.md
2. Generate objectives list
3. Use Terminal Tester to validate requirements (if possible)
4. Output structured objectives

**Example:**

```bash
# Invoke SAGA automation in planning mode
senter @saga-writer --phase planner

# Output:
# ═══════════════════════════════════════════════════════════════
#                        PLANNER PHASE
# ═══════════════════════════════════════════════════════════════
#
# Objectives Generated:
#
# 1. [HIGH] Implement user authentication
#    - Rationale: Core security requirement
#    - Constraint: Must use JWT
#
# 2. [MED] Build REST API
#    - Rationale: Enable client-server communication
#    - Constraint: Must follow REST principles
#
# ...
```

### Phase 2: Implementer (Specification)

**Purpose:** Convert objectives into testable specs.

**Automation:**
1. For each objective, define acceptance criteria
2. Write verification logic
3. Identify necessary libraries
4. Use Terminal Tester to validate feasibility

**Example:**

```bash
# Invoke SAGA automation in implementer mode
senter @saga-writer --phase implementer

# Output:
# ═══════════════════════════════════════════════════════════════
#                      IMPLEMENTER PHASE
# ═══════════════════════════════════════════════════════════════
#
# Acceptance Criteria:
#
# 1. User Authentication
#    - Users can register with email/password
#    - Users can login with JWT token
#    - Verification: pytest tests/test_auth.py
#
# 2. REST API
#    - GET /api/users returns user list
#    - POST /api/users creates user
#    - Verification: Integration tests
#
# ...
```

### Phase 3: Optimizer (Architecture)

**Purpose:** Generate implementation candidates and best plan.

**Automation:**
1. Propose 3 distinct implementation strategies
2. Use Terminal Tester to validate each approach
3. Evaluate trade-offs
4. Output best draft plan

**Example:**

```bash
# Invoke SAGA automation in optimizer mode
senter @saga-writer --phase optimizer

# Output:
# ═══════════════════════════════════════════════════════════════
#                       OPTIMIZER PHASE
# ═══════════════════════════════════════════════════════════════
#
# Candidate Plans:
#
# Candidate A (Conservative): Monolithic Next.js app
#   - Pros: Simple, well-documented
#   - Cons: Harder to scale
#
# Candidate B (Ambitious): Microservices architecture
#   - Pros: Highly scalable
#   - Cons: Complex, more infrastructure
#
# Candidate C (Novel): Serverless with edge functions
#   - Pros: Auto-scaling, low cost
#   - Cons: Cold starts, vendor lock-in
#
# Best Draft Plan: Hybrid of A + C
# - Monolithic for simplicity
# - Edge functions for critical paths
#
# ...
```

### Phase 4: Analyzer (Validation)

**Purpose:** Critique plan and determine convergence.

**Automation:**
1. Check for reward hacking
2. Validate feasibility
3. Use Terminal Tester for prototype testing
4. Output verdict (CONTINUE or TERMINATE)

**Example:**

```bash
# Invoke SAGA automation in analyzer mode
senter @saga-writer --phase analyzer

# Output:
# ═══════════════════════════════════════════════════════════════
#                       ANALYZER PHASE
# ═══════════════════════════════════════════════════════════════
#
# Reward Hacking Check:
# ✅ No reward hacking detected
#   - Plan meets objectives without shortcuts
#   - No gaming of acceptance criteria
#
# Feasibility Check:
# ✅ Feasible
#   - All technologies are standard
#   - Team has required skills
#   - Timeline is realistic
#
# Verdict: TERMINATE
#
# Plan is ready for implementation!
#
# ...
```

## Integration with Code Reviewer

### Automated Code Review in SAGA Loop

The Code Reviewer agent is integrated at multiple points:

#### After Implementer Phase:

```bash
# Review generated specifications
senter @code-reviewer --file specs.md
```

#### After Optimizer Phase:

```bash
# Review architecture decisions
senter @code-reviewer --file architecture.md
```

#### During Ralph Implementation:

```bash
# Review code as Ralph implements
senter @code-reviewer --phase continuous
```

### Code Review as LLM Prompt

The Code Reviewer generates LLM-friendly prompts:

```markdown
# SAGA Implementation Plan Review

## Plan to Review

[Insert SAGA plan here]

## Review Focus

1. Completeness - Are all objectives covered?
2. Feasibility - Is this realistic?
3. Trade-offs - Are trade-offs justified?

## Automated Test Results

[Terminal Tester output]

## Questions for LLM Review

1. Are there any overlooked objectives?
2. Are acceptance criteria measurable?
3. Is the timeline realistic?

## Expected Output

Please provide:
1. Missing objectives (if any)
2. Unrealistic expectations (if any)
3. Suggestions for improvement
```

## Integration with Terminal Tester

### Validation at Each SAGA Phase

#### Phase 1: Planner Validation

```bash
# Test if requirements are testable
senter @terminal-tester --command "npm list --depth=0"
```

#### Phase 2: Implementer Validation

```bash
# Run verification tests
senter @terminal-tester --command "pytest --collect-only"
```

#### Phase 3: Optimizer Validation

```bash
# Test candidate approaches
senter @terminal-tester --script "test_candidates.sh"
```

#### Phase 4: Analyzer Validation

```bash
# Prototype testing
senter @terminal-tester --command "python prototype.py"
```

## Full Automation Example

```bash
# Complete SAGA automation with testing and review

# 1. Start with PROMPT.md creation
senter @saga-writer
[Collaborate to create PROMPT.md]

# 2. Run automated SAGA planning
senter @saga-writer --auto

# This internally:
# - Runs Planner phase
# - Uses Terminal Tester to validate objectives
# - Runs Implementer phase
# - Uses Terminal Tester to check feasibility
# - Runs Optimizer phase
# - Uses Terminal Tester to test candidates
# - Runs Analyzer phase
# - Determines convergence

# 3. Review the final plan
senter @code-reviewer --file SAGA_PLAN.md

# 4. Delegate to Ralph
senter @ralph

# 5. During implementation, continuous review
senter @code-reviewer --phase continuous
senter @terminal-tester --phase continuous
```

## SAGA Automation Commands

### Single Phase Execution:

```bash
# Run specific phase
senter @saga-writer --phase [planner|implementer|optimizer|analyzer]
```

### Full Loop Execution:

```bash
# Run all phases until convergence
senter @saga-writer --auto
```

### With Testing:

```bash
# Run with terminal testing at each phase
senter @saga-writer --auto --test
```

### With Code Review:

```bash
# Run with code review after each phase
senter @saga-writer --auto --review
```

### With Everything:

```bash
# Full automation with testing and review
senter @saga-writer --auto --test --review
```

## Output Formats

### SAGA Plan Output:

```markdown
# SAGA Implementation Plan

## Objectives

1. [HIGH] Objective Name
   - Rationale: Why this is needed
   - Priority: High/Medium/Low
   - Constraints: Technical constraints

## Acceptance Criteria

For each objective:
- Criteria 1
- Criteria 2
- Verification: How to test

## Implementation Strategy

- Architecture: [Description]
- Technology Stack: [List]
- Design Patterns: [Patterns used]

## Verification Plan

- Unit Tests: [Test coverage]
- Integration Tests: [Test scenarios]
- Performance Tests: [Metrics]
```

### Convergence Report:

```
═══════════════════════════════════════════════════════════════
                    SAGA CONVERGENCE REPORT
═══════════════════════════════════════════════════════════════

📊 Iterations: [number of iterations]
⏱️  Time: [total planning time]
🎯 Convergence: [YES/NO]

─────────────────────────────────────────────────────────────────
FINAL OBJECTIVES
─────────────────────────────────────────────────────────────────

[Objectives list]

─────────────────────────────────────────────────────────────────
ACCEPTANCE CRITERIA
─────────────────────────────────────────────────────────────────

[Acceptance criteria for each objective]

─────────────────────────────────────────────────────────────────
IMPLEMENTATION PLAN
─────────────────────────────────────────────────────────────────

[Best draft plan]

─────────────────────────────────────────────────────────────────
TEST RESULTS
─────────────────────────────────────────────────────────────────

[Terminal Tester validation results]

─────────────────────────────────────────────────────────────────
CODE REVIEW SUMMARY
─────────────────────────────────────────────────────────────────

[Code Reviewer summary]

─────────────────────────────────────────────────────────────────
RECOMMENDATION
─────────────────────────────────────────────────────────────────

[READY FOR RALPH / NEEDS REVISION]

═══════════════════════════════════════════════════════════════
```

## Best Practices

### For Planning Phase:

1. **Be Specific** - Clear, measurable objectives
2. **Prioritize** - Mark High/Medium/Low priority
3. **Identify Constraints** - Technical, resource, time constraints

### For Implementation Phase:

1. **Define Acceptance Criteria** - How will we know it's done?
2. **Write Verification Logic** - How will we test it?
3. **Identify Dependencies** - What libraries, services needed?

### For Optimization Phase:

1. **Consider Multiple Approaches** - Conservative, ambitious, novel
2. **Evaluate Trade-offs** - Pros and cons of each approach
3. **Combine Best Aspects** - Merge strengths from different candidates

### For Analysis Phase:

1. **Check for Reward Hacking** - Technical compliance vs. spirit
2. **Validate Feasibility** - Is this realistic?
3. **Be Honest** - CONTINUE if not ready, TERMINATE if ready

### For Ralph Implementation:

1. **Follow the Plan** - Stick to SAGA objectives
2. **Test Continuously** - Use Terminal Tester for validation
3. **Review Progress** - Use Code Reviewer for feedback

## Troubleshooting

### SAGA Not Converging:

```bash
# Check what's blocking convergence
senter @saga-writer --debug

# Common issues:
# - Objectives too vague → Make them specific
# - Acceptance criteria untestable → Define measurable criteria
# - Plan too ambitious → Scale back scope
```

### Tests Failing:

```bash
# Run terminal tester separately
senter @terminal-tester --command "pytest -v"

# Check:
# - Test environment setup
# - Dependencies installed
# - Test data correct
```

### Code Review Issues:

```bash
# Get detailed review
senter @code-reviewer --verbose

# Address:
# - Critical issues first
# - Major issues second
# - Minor issues last
```

## Advanced Usage

### Custom SAGA Phases:

```bash
# Add custom validation phase
senter @saga-writer --phase custom-validate
```

### Integration with CI/CD:

```bash
# Add to CI pipeline
- name: Run SAGA Planning
  run: senter @saga-writer --auto --test --review

- name: Review Plan
  run: senter @code-reviewer --file SAGA_PLAN.md

- name: Delegate to Ralph
  run: senter @ralph
```

### Multi-Project SAGA:

```bash
# Run SAGA for multiple projects
for project in project1 project2 project3; do
  cd $project
  senter @saga-writer --auto --test --review
  senter @ralph
  cd ..
done
```

## See Also

- [Code Reviewer Skill](./code-reviewer.md) - Automated code reviews
- [Terminal Tester Skill](./terminal-tester.md) - Terminal execution and testing
- [SAGA Writer Agent](../agents/saga-writer.md) - SAGA orchestrator
- [Ralph Agent](../agents/ralph.md) - Autonomous implementation
- [Terminal Launcher Skill](./terminal-launcher.md) - Terminal management

---

**Automate SAGA, validate with testing, review with LLMs, implement with Ralph!**
