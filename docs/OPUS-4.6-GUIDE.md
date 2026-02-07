# Claude Opus 4.6 -- Complete Guide

> **Last Updated:** 2026-02-06
> **Consolidated from:** `docs/OPUS-4.6-ROLLOUT.md`, `docs/OPUS-4.6-UPGRADE.md`, `docs/HOW-TO-USE-OPUS.md`

**For:** All EVOX agents (SAM, LEO, QUINN, EVOX, MAX)
**Model ID:** `claude-opus-4-6`

---

## Section 1: Overview & Rollout Plan

### What's New: Opus 4.6

Anthropic's most intelligent model. Industry-leading for coding, enterprise agents, and professional work.

**Release Date:** February 5, 2026

### The Claude 4.5/4.6 Family

```
Opus 4.6    -- Flagship (most capable, most expensive)
Sonnet 4.5  -- Workhorse (balanced performance/cost)
Haiku 4.5   -- Speed demon (fast, cheap, simple tasks)
```

### Headline Features

| Feature | Detail | EVOX Impact |
|---------|--------|-------------|
| **1M Token Context** | First Opus with 1 million token window (beta) | Handle entire codebase in single session -- no more context fragmentation |
| **Agent Teams** | Agents split tasks, coordinate directly, own their piece | This IS what EVOX does. Native support for our architecture. |
| **Improved Reasoning** | Stronger logical reasoning on complex problems | Better architectural decision-making, enhanced code analysis |
| **Reliable Tool Use** | More consistent function calling and API interactions | Fewer failed Convex mutations, more reliable Linear/MCP calls |
| **Financial Reasoning** | Stronger numerical and analytical capabilities | Better cost tracking, metrics accuracy |
| **Reduced Latency** | Faster time-to-first-token, better streaming | Smoother agent operations |

### What Changes For Agents

1. **1M token context** -- Handle bigger codebases in a single session. Less "I lost context" errors.
2. **Better tool calling** -- Convex API calls, Linear MCP, git operations will be more reliable.
3. **Smarter planning** -- Better task breakdown, fewer wrong turns.
4. **Agent Teams support** -- Native ability to split work and coordinate with other agents. This aligns directly with our dispatch + messaging architecture.
5. **Cleaner code** -- Fewer syntax errors, better patterns, more idiomatic TypeScript.

### What Stays The Same

- Your prompts and workflows do not change
- CLAUDE.md rules still apply
- CULTURE.md protocols still apply
- Convex messaging endpoints unchanged
- Model switch is automatic -- no action needed from you

### Cost Comparison

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Speed | Use Case |
|-------|----------------------|------------------------|-------|----------|
| Opus 4.6 | ~$15 | ~$75 | Slower | Complex reasoning |
| Sonnet 4.5 | ~$3 | ~$15 | Fast | General work |
| Haiku 4.5 | ~$0.25 | ~$1.25 | Fastest | Simple tasks |

**Rule of Thumb:**
- Opus 4.6: ~5x cost of Sonnet
- Sonnet 4.5: ~12x cost of Haiku
- Always use the cheapest model that can do the job well

### Cost Awareness

Opus 4.6 uses more tokens per response due to deeper reasoning. Monitor weekly usage limits (currently at ~98% capacity). Opus is significantly more expensive per token than Sonnet.

Quick cost estimation:
```bash
# Check token count of your prompt
echo "Your long prompt here" | wc -c
# ~1 char = 0.25 tokens (rough estimate)

# If prompt = 50K chars -> ~12.5K tokens
# Opus cost: 12.5K * $15/1M = ~$0.19 input
# Sonnet cost: 12.5K * $3/1M = ~$0.04 input
```

| Model | 100K tokens | 1M tokens |
|-------|-------------|-----------|
| Opus 4.6 | $1.50 | $15 |
| Sonnet 4.5 | $0.30 | $3 |
| Haiku 4.5 | $0.025 | $0.25 |

### North Star Alignment

Opus 4.6 moves us closer to:

> **Agents that work like senior engineers -- proactive, self-sufficient, high-quality output, 24/7.**

| Capability | North Star Connection |
|------------|----------------------|
| 1M context | Agents understand full codebase = fewer mistakes = less CEO intervention |
| Agent Teams | Native multi-agent coordination = our dispatch system gets smarter |
| Better planning | Agents break down tasks correctly the first time = higher velocity |
| Reliable tools | Fewer failed API calls = smoother autonomous operation |

### Rollout Timeline

**Week 1: Pilot (Feb 5-12)**
- Each agent tries 1-2 Opus tasks
- Collect feedback
- Share learnings

**Week 2: Expand (Feb 12-19)**
- Update agent instructions with Opus guidelines
- Add Opus to planning workflows
- Monitor costs

**Week 3: Optimize (Feb 19-26)**
- Analyze cost/benefit data
- Refine usage guidelines
- Set team standards

**Week 4+: BAU (Business as Usual)**
- Opus for complex reasoning (10% of tasks)
- Sonnet for general work (80% of tasks)
- Haiku for simple tasks (10% of tasks)

### Rollout Steps

| Step | Owner | Status |
|------|-------|--------|
| 1. Prepare upgrade document | EVOX | Done |
| 2. MAX review + feedback | MAX | Done |
| 3. CEO approval | CEO | Pending |
| 4. Team broadcast via #dev | MAX | After approval |
| 5. Activate Opus 4.6 for all agents | CEO | After approval |
| 6. Monitor performance (first 24h) | MAX + QUINN | After activation |

### Migration Strategy

**Phase 1: Selective Adoption (Week 1)**

Agents that should try Opus 4.6 first:

1. **MAX (PM)** -- Major planning sessions, architecture decisions, multi-week roadmap planning, risk assessment
2. **SAM (Backend)** -- Complex database schema design, performance bottleneck analysis, security audit planning, API architecture design
3. **LEO (Frontend)** -- Complex state management design, performance optimization strategies, accessibility audit planning
4. **QUINN (QA)** -- Test strategy planning, complex bug root cause analysis, E2E test architecture design

**Phase 2: Default Switch (Week 2-3)**

After validating Opus 4.6 performance:
- Update agent configurations
- Set as default for planning tasks
- Keep Sonnet for implementation
- Keep Haiku for simple tasks

---

## Section 2: Upgrade Instructions

### Configuration

For agent-loop scripts, the model ID:
```
claude-opus-4-6
```

For API calls:
```typescript
model: "claude-opus-4-6"
// Previous Sonnet: "claude-sonnet-4-5-20250929"
// Previous Haiku: "claude-haiku-4-5-20251001"
```

### Model IDs Reference

```typescript
// Latest models
"claude-opus-4-6"            // Opus 4.6 (flagship)
"claude-sonnet-4-5-20250929" // Sonnet 4.5 (workhorse)
"claude-haiku-4-5-20251001"  // Haiku 4.5 (speed)

// Legacy (don't use)
"claude-opus-4"              // Old Opus 4
"claude-sonnet-3-5"          // Old Sonnet
```

### Model Options

```typescript
model: "opus"    // Claude Opus 4.6 (most capable)
model: "sonnet"  // Claude Sonnet 4.5 (default, balanced)
model: "haiku"   // Claude Haiku 4.5 (fast, cheap)
// No model parameter = uses Sonnet 4.5
```

---

## Section 3: How to Use

### Decision Tree: Which Model?

```
Is task complex? (architecture, design, multi-phase)
-- YES -> Use Opus 4.6
-- NO

Is task standard development? (features, bugs, tests)
-- YES -> Use Sonnet 4.5 (default)
-- NO

Is task simple? (formatting, quick scripts)
-- YES -> Use Haiku 4.5
-- When in doubt -> Start with Sonnet, escalate to Opus if needed
```

### When to Use Each Model

**Use Opus 4.6 For:**

- Complex Architecture Decisions: designing new systems, major refactoring, cross-cutting concerns
- Deep Code Analysis: debugging hard-to-reproduce issues, performance optimization, security assessment
- High-Stakes Tasks: production deployment decisions, database migration planning, API design with long-term implications
- Complex Planning: multi-phase project breakdowns, dependency analysis, risk assessment

**Use Sonnet 4.5 For (Current Default):**

- Standard Development Work: feature implementation, bug fixes, writing tests, documentation
- Code Reviews: PR reviews, code quality checks, suggesting improvements
- Daily Coordination: task management, message handling, status updates

**Use Haiku 4.5 For:**

- Simple, High-Volume Tasks: syntax checking, code formatting, simple data transformations, quick status checks
- Rapid Prototyping: quick scripts, one-off utilities, POC code

### Method 1: Claude Code CLI (Interactive Sessions)

```bash
# Use Opus for complex planning
claude --model opus "Design the agent identity system architecture"

# Use Sonnet (default) for implementation
claude "Implement AGT-332: Agent ID System"

# Use Haiku for simple tasks
claude --model haiku "Format this JSON file"
```

With file context:
```bash
# Analyze complex codebase with Opus
claude --model opus --files "convex/**/*.ts" "Find performance bottlenecks"

# Regular development with Sonnet
claude --files "convex/schema.ts" "Add a new field to agents table"
```

Interactive mode:
```bash
# Start Opus session
claude --model opus
# Then type your prompts
```

### Method 2: Environment Variable

```bash
# Use Opus for planning session
export ANTHROPIC_MODEL=opus
claude "Plan Q1 2026 roadmap"
claude "Design database migration strategy"
unset ANTHROPIC_MODEL  # Reset to default (Sonnet)

# Or inline
ANTHROPIC_MODEL=opus claude "Your complex task"
```

In scripts:
```bash
#!/bin/bash
export ANTHROPIC_MODEL=opus
echo "Using Opus 4.6 for planning..."
claude "Design system architecture"
claude "Analyze dependencies"
claude "Estimate timeline"
unset ANTHROPIC_MODEL
```

### Method 3: Task Tool (Agent Spawning)

```typescript
// When spawning planning agent
await Task({
  subagent_type: "Plan",
  model: "opus",  // Explicitly use Opus 4.6
  description: "Design Loop system",
  prompt: "Create comprehensive implementation plan for The Loop..."
});

// Regular task (uses default Sonnet)
await Task({
  subagent_type: "general-purpose",
  description: "Implement feature",
  prompt: "Implement AGT-332..."
  // No model specified = Sonnet 4.5
});

// Fast task (use Haiku)
await Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Quick search",
  prompt: "Find all files using agentId field"
});
```

### Method 4: API (For Custom Scripts)

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: "claude-opus-4-6",  // Full model ID
  max_tokens: 4096,
  messages: [{
    role: "user",
    content: "Design the agent identity system"
  }]
});
```

### Cheat Sheet

| Task Type | Model | Command |
|-----------|-------|---------|
| Architecture design | Opus | `claude --model opus "Design X"` |
| Complex planning | Opus | `claude --model opus "Plan Y"` |
| Deep debugging | Opus | `claude --model opus "Analyze Z"` |
| Feature implementation | Sonnet | `claude "Implement AGT-X"` |
| Bug fixes | Sonnet | `claude "Fix bug in file.ts"` |
| Code review | Sonnet | `claude "Review PR #123"` |
| Format code | Haiku | `claude --model haiku "Format X"` |
| Quick scripts | Haiku | `claude --model haiku "Write script"` |

### Best Practices

**DO:**

- Use Opus for the "Think" phase, Sonnet for "Build" phase:
  `Planning (Opus) -> Implementation (Sonnet) -> Simple tasks (Haiku)`
- Document when you use Opus and why
- Measure cost/benefit -- track tasks where Opus saved significant time
- Use Opus for learning/exploration -- understanding new codebases, researching best practices

**DON'T:**

- Don't use Opus for routine tasks (standard CRUD, simple bug fixes, code formatting)
- Don't use Opus without considering cost (estimate token usage first)
- Don't use Opus as default for everything (only escalate when complexity warrants it)
- Don't forget to unset `ANTHROPIC_MODEL` after a planning session

### Common Mistakes

```bash
# WRONG: Don't use Opus for simple tasks
claude --model opus "Format this JSON"  # Waste of money

# WRONG: Don't leave Opus as default
export ANTHROPIC_MODEL=opus  # Then forget to unset

# RIGHT: Use Opus selectively
claude --model opus "Design architecture"  # High value
claude "Implement the design"              # Sonnet is fine
```

### Pilot Program: Week 1 Goals

Each agent picks 1-2 complex tasks to try Opus 4.6:

- **MAX:** Multi-phase roadmap planning for Q1 2026
- **SAM:** Database migration strategy (Convex -> ?)
- **LEO:** Dashboard performance optimization strategy
- **QUINN:** E2E test strategy for The Loop

### Feedback Template

After using Opus 4.6, report:

```markdown
**Task:** [Description]
**Model Used:** Opus 4.6
**Outcome:** [What was produced]
**vs Sonnet:** [Would Sonnet have done as well?]
**Cost:** [Estimated tokens used]
**Worth it?** Yes/No + reason
```

Post feedback to: `#dev` channel in agent messages

### Success Metrics

1. **Quality Improvement** -- Better architectural decisions, fewer rework cycles, higher CEO satisfaction
2. **Cost Efficiency** -- Right model for right task, no wasteful Opus usage, overall cost per task decreases
3. **Team Adoption** -- 100% of complex planning uses Opus, 90% of implementation uses Sonnet, 100% of simple tasks use Haiku

### Troubleshooting

**Q: How do I know if Opus is actually being used?**
A: Check Anthropic dashboard (https://console.anthropic.com) -> Usage tab -> See model breakdown

**Q: Opus seems slow. Is this normal?**
A: Yes, Opus is slower than Sonnet due to more compute. Trade-off for better reasoning.

**Q: Can I switch models mid-conversation?**
A: Not in interactive mode. Exit and restart with new model.

**Q: What if I accidentally use Opus for simple task?**
A: It's okay, just don't make it a habit. Monitor your costs.

**Q: Is Opus 4.6 always better?**
A: No. It's more capable but slower and 5x more expensive. Use selectively.

**Q: Will Opus replace Sonnet as default?**
A: No. Sonnet remains default for general work. Opus is for complex reasoning tasks.

**Q: How do I know if task needs Opus?**
A: Rule of thumb: If you'd spend 30+ min thinking through the problem yourself, use Opus. If it's straightforward implementation, use Sonnet.

### Resources

- Anthropic Announcement: https://www.anthropic.com/news (Feb 5, 2026)
- Claude Models Documentation: https://docs.anthropic.com/en/docs/about-claude/models
- AWS Bedrock Availability: https://aws.amazon.com/about-aws/whats-new/2026/2/claude-opus-4.6-available-amazon-bedrock/
- API Reference: https://docs.anthropic.com/claude/reference/messages_post
- Pricing: https://www.anthropic.com/pricing
- Internal -- Agent SDK docs for model selection
- Internal -- Dashboard -> Analytics -> Cost per task

### Support

- Technical questions: Ask SAM or MAX
- Cost concerns: Check with CEO
- Best practices: Share in #dev channel

---

_Document version: 2.0 (consolidated)_
_Last updated: 2026-02-06_
_Next review: After Week 1 pilot (Feb 12, 2026)_
