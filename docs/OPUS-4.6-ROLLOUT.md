# Claude Opus 4.6 - Team Rollout Guide

**Date:** Feb 5, 2026
**Author:** MAX
**Target:** All EVOX agents (SAM, LEO, QUINN, EVOX, MAX)

---

## 🚀 What's New: Opus 4.6

**Model ID:** `claude-opus-4-6`

### The Claude 4.5/4.6 Family

```
Opus 4.6    → 🏆 Flagship (most capable, most expensive)
Sonnet 4.5  → ⚡ Workhorse (balanced performance/cost)
Haiku 4.5   → 🎯 Speed demon (fast, cheap, simple tasks)
```

### Key Improvements in Opus 4.6

1. **Extended Context Window**
   - Previous: 200K tokens
   - Opus 4.6: Enhanced processing of long contexts
   - Better retention across massive codebases

2. **Improved Reasoning**
   - Stronger logical reasoning on complex problems
   - Better architectural decision-making
   - Enhanced code analysis and debugging

3. **Better Tool Use**
   - More accurate function calling
   - Improved multi-step tool orchestration
   - Better error recovery

4. **Enhanced Coding Abilities**
   - Deeper understanding of system architecture
   - Better refactoring suggestions
   - More accurate bug root cause analysis

5. **Reduced Latency**
   - Faster time-to-first-token
   - Better streaming performance

---

## 💡 When to Use Which Model

### Use Opus 4.6 For:

✅ **Complex Architecture Decisions**
- Designing new systems from scratch
- Major refactoring planning
- Cross-cutting concerns (security, scalability)
- Example: "Design The Loop accountability system"

✅ **Deep Code Analysis**
- Debugging hard-to-reproduce issues
- Performance optimization analysis
- Security vulnerability assessment
- Example: "Why is this memory leak happening?"

✅ **High-Stakes Tasks**
- Production deployment decisions
- Database migration planning
- API design with long-term implications
- Example: "Should we migrate from Convex to Postgres?"

✅ **Complex Planning**
- Multi-phase project breakdowns
- Dependency analysis
- Risk assessment
- Example: "Plan a 3-month roadmap for agent system"

### Use Sonnet 4.5 For (Current Default):

✅ **Standard Development Work**
- Feature implementation
- Bug fixes (non-critical)
- Writing tests
- Documentation
- Example: "Implement AGT-332: Agent ID System"

✅ **Code Reviews**
- PR reviews
- Code quality checks
- Suggesting improvements
- Example: "Review this PR for security issues"

✅ **Daily Coordination**
- Task management
- Message handling
- Status updates
- Example: "Check inbox and respond to MAX"

### Use Haiku 4.5 For:

✅ **Simple, High-Volume Tasks**
- Syntax checking
- Code formatting
- Simple data transformations
- Quick status checks
- Example: "Format this JSON file"

✅ **Rapid Prototyping**
- Quick scripts
- One-off utilities
- POC code
- Example: "Write a script to parse git logs"

---

## 📊 Cost Comparison

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Speed | Use Case |
|-------|----------------------|------------------------|-------|----------|
| Opus 4.6 | ~$15 | ~$75 | Slower | Complex reasoning |
| Sonnet 4.5 | ~$3 | ~$15 | Fast | General work |
| Haiku 4.5 | ~$0.25 | ~$1.25 | Fastest | Simple tasks |

**Rule of Thumb:**
- Opus 4.6: ~5x cost of Sonnet
- Sonnet 4.5: ~12x cost of Haiku
- **Always use the cheapest model that can do the job well**

---

## 🎯 Migration Strategy

### Phase 1: Selective Adoption (Week 1)

**Agents that should try Opus 4.6 first:**

1. **MAX (PM)** - Use for:
   - Major planning sessions
   - Architecture decisions
   - Multi-week roadmap planning
   - Risk assessment

2. **SAM (Backend)** - Use for:
   - Complex database schema design
   - Performance bottleneck analysis
   - Security audit planning
   - API architecture design

3. **LEO (Frontend)** - Use for:
   - Complex state management design
   - Performance optimization strategies
   - Accessibility audit planning

4. **QUINN (QA)** - Use for:
   - Test strategy planning
   - Complex bug root cause analysis
   - E2E test architecture design

### Phase 2: Default Switch (Week 2-3)

After validating Opus 4.6 performance:
- Update agent configurations
- Set as default for planning tasks
- Keep Sonnet for implementation
- Keep Haiku for simple tasks

---

## 🛠️ How to Use Opus 4.6

### Option 1: Explicit Model Selection (Recommended)

When using Claude Code CLI:

```bash
# For complex planning
claude --model opus "Design the agent identity system architecture"

# For standard work (default)
claude "Implement AGT-332"  # Uses Sonnet 4.5

# For simple tasks
claude --model haiku "Format this JSON"
```

### Option 2: In Agent Instructions

Update agent playbooks to specify when to use Opus:

```markdown
## When to Escalate to Opus 4.6

If task involves:
- [ ] Designing new system architecture
- [ ] Complex multi-phase planning
- [ ] High-stakes production decisions
- [ ] Deep debugging of critical issues

Then: Use `--model opus` or request Opus in agent spawn.
```

### Option 3: Task Tool with Model Parameter

```typescript
// In agent code
await Task({
  subagent_type: "Plan",
  model: "opus",  // Explicitly request Opus 4.6
  prompt: "Design the Loop accountability system"
});
```

---

## 📝 Best Practices

### DO:

✅ **Use Opus for the "Think" phase, Sonnet for "Build" phase**
```
Planning (Opus) → Implementation (Sonnet) → Simple tasks (Haiku)
```

✅ **Document when you use Opus and why**
```
"Using Opus 4.6 for AGT-XXX because: complex architecture decision with
long-term implications"
```

✅ **Measure cost/benefit**
- Track tasks where Opus saved significant time
- Note tasks where Sonnet would have been sufficient
- Share learnings with team

✅ **Use Opus for learning/exploration**
- Understanding new codebases
- Researching best practices
- Architectural deep-dives

### DON'T:

❌ **Don't use Opus for routine tasks**
- Standard CRUD implementation
- Simple bug fixes
- Code formatting
- Documentation updates

❌ **Don't use Opus without considering cost**
- Estimate token usage first
- Is the task worth 5x cost?
- Would Sonnet suffice?

❌ **Don't use Opus as default for everything**
- Only escalate when complexity warrants it
- Sonnet 4.5 is excellent for 90% of tasks

---

## 🧪 Pilot Program

### Week 1 Goals

Each agent picks **1-2 complex tasks** to try Opus 4.6:

**MAX:**
- [ ] Task: Multi-phase roadmap planning for Q1 2026
- [ ] Compare: Did Opus provide better insights than Sonnet?

**SAM:**
- [ ] Task: Database migration strategy (Convex → ?)
- [ ] Compare: Root cause analysis depth vs Sonnet

**LEO:**
- [ ] Task: Dashboard performance optimization strategy
- [ ] Compare: Architectural suggestions vs Sonnet

**QUINN:**
- [ ] Task: E2E test strategy for The Loop
- [ ] Compare: Test coverage insights vs Sonnet

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

---

## 🎓 Training Resources

### Learn More About Opus 4.6

1. **Anthropic Docs:** https://docs.anthropic.com/claude/docs/models-overview
2. **API Reference:** https://docs.anthropic.com/claude/reference/messages_post
3. **Pricing:** https://www.anthropic.com/pricing

### Internal Resources

- **Agent SDK:** See `claude-agent-sdk` docs for model selection
- **Cost Tracking:** Dashboard → Analytics → Cost per task
- **Team Learning:** `docs/learnings/` (share your Opus learnings)

---

## 📞 Support & Questions

### Common Questions

**Q: Is Opus 4.6 always better?**
A: No. It's more capable but slower and 5x more expensive. Use selectively.

**Q: Will Opus replace Sonnet as default?**
A: No. Sonnet remains default for general work. Opus is for complex reasoning tasks.

**Q: How do I know if task needs Opus?**
A: Rule of thumb: If you'd spend 30+ min thinking through the problem yourself, use Opus. If it's straightforward implementation, use Sonnet.

**Q: Can I switch models mid-task?**
A: Yes. Use Opus for planning phase, then switch to Sonnet for implementation.

**Q: What if I'm unsure?**
A: Start with Sonnet. If output quality is insufficient, retry with Opus.

### Need Help?

- **Technical questions:** Ask SAM or MAX
- **Cost concerns:** Check with CEO
- **Best practices:** Share in #dev channel

---

## 📈 Success Metrics

We'll measure success by:

1. **Quality Improvement**
   - Better architectural decisions
   - Fewer rework cycles
   - Higher CEO satisfaction

2. **Cost Efficiency**
   - Right model for right task
   - No wasteful Opus usage
   - Overall cost per task ↓

3. **Team Adoption**
   - 100% of complex planning uses Opus
   - 90% of implementation uses Sonnet
   - 100% of simple tasks use Haiku

---

## 🚀 Rollout Timeline

### Week 1: Pilot (Feb 5-12)
- Each agent tries 1-2 Opus tasks
- Collect feedback
- Share learnings

### Week 2: Expand (Feb 12-19)
- Update agent instructions with Opus guidelines
- Add Opus to planning workflows
- Monitor costs

### Week 3: Optimize (Feb 19-26)
- Analyze cost/benefit data
- Refine usage guidelines
- Set team standards

### Week 4+: BAU (Business as Usual)
- Opus for complex reasoning (10% of tasks)
- Sonnet for general work (80% of tasks)
- Haiku for simple tasks (10% of tasks)

---

## ✅ Action Items

### For All Agents:

- [ ] Read this doc thoroughly
- [ ] Identify 1-2 upcoming tasks suitable for Opus pilot
- [ ] Try Opus 4.6 on pilot tasks
- [ ] Submit feedback using template above
- [ ] Share learnings with team

### For MAX:

- [ ] Monitor pilot program progress
- [ ] Collect and synthesize feedback
- [ ] Update guidelines based on learnings
- [ ] Report to CEO on cost/benefit

### For CEO:

- [ ] Approve Opus 4.6 rollout
- [ ] Set cost guardrails if needed
- [ ] Review Week 1 pilot results
- [ ] Decide on Week 2+ expansion

---

**Questions?** Ask MAX in #dev channel.

**Ready to try Opus 4.6?** Pick your pilot task and go! 🚀

---

_Document version: 1.0_
_Last updated: Feb 5, 2026_
_Next review: After Week 1 pilot (Feb 12, 2026)_
