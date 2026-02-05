# Dashboard Research: Best-in-Class Patterns for CEO Decision-Making

> **Created by:** COLE | **Date:** 2026-02-05 | **Purpose:** Inform EVOX dashboard redesign

---

## TL;DR — Actionable Design Principles

| Principle | Example | Apply to EVOX |
|-----------|---------|---------------|
| **Glanceability** | Linear's minimal UI | Status at a glance in <3 seconds |
| **Information Hierarchy** | Vercel's deployment status | Critical metrics top-left |
| **Predictable Layout** | Datadog's grid system | Consistent widget placement |
| **Single Purpose** | Mercury's account overview | One dashboard = one question |
| **Real-time Updates** | Vercel's SWR pattern | Convex already does this! |

---

## 1. Linear — Task Management Excellence

**What They Do Best:**

```
┌─────────────────────────────────────────────────────────┐
│  [My Issues]  [Active]  [Backlog]  [Cycles]             │
├─────────────────────────────────────────────────────────┤
│  ▸ AGT-275  Fix postToChannel...     ● In Progress      │
│  ▸ AGT-271  @mention alerts          ○ Todo             │
│  ▸ AGT-273  Agent heartbeat          ○ Todo             │
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**

| Pattern | Description | EVOX Application |
|---------|-------------|------------------|
| **Monochrome + Accent** | Black/white base, color only for status | Use zinc-900 base, colored status dots |
| **Keyboard-First** | `Cmd+K` command palette | Add command palette for quick actions |
| **Dense Lists** | High information density, scannable | Dispatch queue as dense list |
| **Cycle Progress** | Visual progress bars | Sprint/cycle progress indicator |
| **Filters as Tabs** | Quick filter switching | Agent filter tabs (Sam/Leo/Quinn/Max) |

**Design Philosophy:**
> "Linear design adds linearity—being direct and offering minimal choices. Simple visual effects and logical progression reduce cognitive load."

**Steal This:**
- ✅ Command palette (Cmd+K)
- ✅ Monochrome base with status colors only
- ✅ Dense, scannable lists
- ✅ Keyboard shortcuts for everything

**Sources:** [Linear App](https://linear.app), [Linear Design Blog](https://linear.app/now/how-we-redesigned-the-linear-ui)

---

## 2. Mercury — Banking Dashboard Clarity

**What They Do Best:**

```
┌─────────────────────────────────────────────────────────┐
│                    $127,450.32                          │
│                  Available Balance                       │
├─────────────────────────────────────────────────────────┤
│  ↑ +$12,500   Income      │  ↓ -$8,200   Expenses       │
│  This Month               │  This Month                  │
├─────────────────────────────────────────────────────────┤
│  Recent Activity                                         │
│  • Stripe          +$5,000    Today                     │
│  • AWS             -$1,200    Yesterday                 │
│  • Vercel          -$200      2 days ago                │
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**

| Pattern | Description | EVOX Application |
|---------|-------------|------------------|
| **Hero Number** | Single large metric dominates | Tasks completed today: **12** |
| **Generous Whitespace** | Calm, controlled feeling | More spacing between widgets |
| **Security Cues** | Trust indicators | Show "Last sync: 2s ago" |
| **Simple Typography** | 1-2 fonts, weight for hierarchy | Use Inter, bold for numbers |
| **Consistent Icons** | Same icon = same meaning | Standardize agent/status icons |

**Design Philosophy:**
> "The financial sector deals with sensitive information—the interface should constantly reassure users with visual cues of security and control."

**Steal This:**
- ✅ Hero metric pattern (biggest number = most important)
- ✅ Generous whitespace for calm
- ✅ Consistent iconography
- ✅ Real-time sync indicators

**Sources:** [Mercury Demo](https://demo.mercury.com/dashboard), [Mercury Dribbble](https://dribbble.com/mercuryfi)

---

## 3. Vercel — Deployment Status at a Glance

**What They Do Best:**

```
┌─────────────────────────────────────────────────────────┐
│  evox-ten.vercel.app                                    │
│  ● Production  ✓ Ready  3m ago                          │
├─────────────────────────────────────────────────────────┤
│  Latest Deployments                                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │ ● feat: Add @mention alerts    ✓ 2m    main        ││
│  │ ● fix: postToChannel docs      ✓ 15m   uat         ││
│  │ ○ chore: agent file            ⏳ building          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**

| Pattern | Description | EVOX Application |
|---------|-------------|------------------|
| **Status First** | Green dot = good, no click needed | Agent status dots prominent |
| **Time Relative** | "3m ago" not "10:42 AM" | Use relative timestamps |
| **Commit Context** | Show what changed | Show task/ticket with activity |
| **Progressive Disclosure** | Summary → Details on click | Expand agent cards for details |
| **Mobile-Ready** | Works on phone | Responsive grid layout |

**Performance Principles:**
> "The dashboard decreased First Meaningful Paint by 1.2s. Use memoization, batched updates, and SWR for real-time data."

**Steal This:**
- ✅ Status dots as primary indicator
- ✅ Relative timestamps
- ✅ Commit/activity context in lists
- ✅ Progressive disclosure

**Sources:** [Vercel Dashboard Blog](https://vercel.com/blog/dashboard-redesign), [Vercel Docs](https://vercel.com/docs/dashboard-features)

---

## 4. Datadog — Monitoring Dashboard Mastery

**What They Do Best:**

```
┌─────────────────────────────────────────────────────────┐
│  System Health                        [Last 1h ▼]       │
├──────────────────────┬──────────────────────────────────┤
│  CPU Usage           │  Memory Usage                    │
│  ████████░░ 78%      │  ██████░░░░ 62%                  │
├──────────────────────┼──────────────────────────────────┤
│  Error Rate          │  Request Latency                 │
│  ██░░░░░░░░ 2.1%     │  ████░░░░░░ 245ms                │
├──────────────────────┴──────────────────────────────────┤
│  [Graph: Requests over time with anomaly detection]     │
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**

| Pattern | Description | EVOX Application |
|---------|-------------|------------------|
| **Grid Layout** | Predictable widget placement | 3-column grid for metrics |
| **Time Range Selector** | "Last 1h, 24h, 7d" | Add time filters to activity |
| **Color = Severity** | Green/Yellow/Red only | Stick to status color system |
| **Sparklines** | Tiny trend graphs | Add mini graphs to agent cards |
| **Investigation Flow** | High-level → Specific | Dashboard → Agent → Task drill-down |

**Design Philosophy:**
> "Dashboard sections should be ordered to guide you through a typical investigation workflow—high-level service metrics first, then more specific."

**Steal This:**
- ✅ Grid-based layout
- ✅ Time range selector
- ✅ Sparklines for trends
- ✅ Investigation workflow ordering

**Sources:** [Datadog Docs](https://docs.datadoghq.com/dashboards/), [Effective Dashboards](https://github.com/DataDog/effective-dashboards)

---

## 5. Notion — Workspace Organization

**What They Do Best:**

```
┌─────────────────────────────────────────────────────────┐
│  🏠 Dashboard                                           │
├─────────────────────────────────────────────────────────┤
│  Quick Access                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ 📋 Tasks│ │ 📊 Stats│ │ 📝 Docs │ │ ⚙️ Settings│    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│  Today's Focus                                           │
│  ☐ Review agent performance                             │
│  ☐ Check deployment status                              │
│  ☑ Approve UAT changes                                  │
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**

| Pattern | Description | EVOX Application |
|---------|-------------|------------------|
| **Hub Page** | Central jumping-off point | CEO Dashboard as hub |
| **Quick Access Grid** | Icon cards for navigation | Agent cards as navigation |
| **Today's Focus** | Priority tasks surfaced | "Needs Attention" section |
| **Database Views** | Multiple views of same data | Filter views for agents |
| **Linked Content** | Work from dashboard directly | Inline task actions |

**Design Philosophy:**
> "The simpler the system is to use, the more the user gets done. Set up separate pages for different purposes, with an overview page showing only the most critical, high-level information."

**Steal This:**
- ✅ Hub page pattern
- ✅ Quick access grid
- ✅ "Today's Focus" section
- ✅ Inline actions (approve, assign, etc.)

**Sources:** [Notion Help](https://www.notion.com/help/guides/personal-work-dashboard), [Notion Templates](https://www.notion.com/templates/dashboard)

---

## CEO Dashboard Design Principles

### The Airplane Cockpit Analogy

> "Think of it as the instrument panel of an airplane for a CEO—the pilot doesn't need to know the mechanical specifics of every engine component, but they do need to see altitude, speed, fuel levels, and any critical warnings instantly."

### Essential CEO Metrics (Apply to EVOX)

| Category | Metric | EVOX Equivalent |
|----------|--------|-----------------|
| **Health** | Overall system status | All agents online? |
| **Velocity** | Tasks completed | Tasks done today/week |
| **Efficiency** | Cost per task | Token cost per task |
| **Quality** | Error rate | Build failures, bugs |
| **Bottlenecks** | Blockers | Stuck tasks >30 min |

### Information Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  1. CRITICAL ALERTS (Red banner if any)                 │
├─────────────────────────────────────────────────────────┤
│  2. HERO METRICS (Tasks today, Active agents)           │
├─────────────────────────────────────────────────────────┤
│  3. AGENT STATUS (Quick scan of team health)            │
├─────────────────────────────────────────────────────────┤
│  4. ACTIVITY FEED (What's happening now)                │
├─────────────────────────────────────────────────────────┤
│  5. DETAILED VIEWS (On-demand, click to expand)         │
└─────────────────────────────────────────────────────────┘
```

---

## EVOX Dashboard Redesign Recommendations

### Immediate Changes (This Week)

1. **Add Hero Metrics Section**
   - Tasks completed today: **12**
   - Active agents: **4/4**
   - Cost today: **$2.34**

2. **Improve Agent Cards**
   - Status dot more prominent
   - Add sparkline for activity
   - Show current task inline

3. **Add Time Range Selector**
   - "Last 1h | 24h | 7d | 30d"
   - Apply to all activity feeds

4. **Critical Alerts Banner**
   - Red banner at top if any agent offline
   - Yellow if task stuck >30 min

### Medium-Term (This Month)

1. **Command Palette (Cmd+K)**
   - Quick actions: "Assign to Sam", "View AGT-275"
   - Navigation: "Go to Live Dashboard"

2. **Investigation Drill-Down**
   - Dashboard → Agent → Task → Logs
   - Breadcrumb navigation

3. **Today's Focus Section**
   - Tasks needing approval
   - Stuck tasks
   - Pending reviews

### Long-Term (This Quarter)

1. **Role-Based Dashboards**
   - CEO: High-level health
   - PM: Task flow and velocity
   - Dev: Technical metrics

2. **Custom Widget Builder**
   - Drag-and-drop layout
   - Save dashboard configurations

---

## Design System Recommendations

### Colors (Status Only)

```css
--status-online: #22c55e;    /* green-500 */
--status-busy: #eab308;      /* yellow-500 */
--status-idle: #71717a;      /* zinc-500 */
--status-offline: #ef4444;   /* red-500 */
--status-error: #ef4444;     /* red-500 */
--background: #18181b;       /* zinc-900 */
--text: #fafafa;             /* zinc-50 */
```

### Typography

```css
--font-family: 'Inter', sans-serif;
--font-size-hero: 48px;      /* Hero numbers */
--font-size-title: 24px;     /* Section titles */
--font-size-body: 14px;      /* Body text */
--font-size-small: 12px;     /* Timestamps, labels */
```

### Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## Summary: What Makes Great Dashboards

| Product | Superpower | Key Lesson |
|---------|------------|------------|
| **Linear** | Keyboard-first, minimal | Reduce cognitive load |
| **Mercury** | Trust and clarity | Hero metrics + whitespace |
| **Vercel** | Status at a glance | Green dot = good |
| **Datadog** | Investigation workflow | High-level → specific |
| **Notion** | Flexible hub | One dashboard per purpose |

**EVOX Advantage:** We have real-time Convex, Linear integration, and CEO visibility. Apply these patterns to become best-in-class.

---

## Sources

- [Linear App](https://linear.app) | [Linear Design Blog](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Mercury Demo](https://demo.mercury.com/dashboard) | [Fintech Design Guide](https://www.eleken.co/blog-posts/modern-fintech-design-guide)
- [Vercel Dashboard Blog](https://vercel.com/blog/dashboard-redesign) | [Vercel Docs](https://vercel.com/docs/dashboard-features)
- [Datadog Docs](https://docs.datadoghq.com/dashboards/) | [Effective Dashboards GitHub](https://github.com/DataDog/effective-dashboards)
- [Notion Help](https://www.notion.com/help/guides/personal-work-dashboard)
- [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/)
- [Executive Dashboard Examples](https://www.klipfolio.com/resources/dashboard-examples/executive)
- [Dashboard Design Best Practices](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)

---

*Last updated: 2026-02-05 by COLE*
*Next review: Before dashboard redesign sprint*
