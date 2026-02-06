# Agent Communication View — Design Spec

## Problem
Hiện tại chỉ hiển thị "MAX DM SAM" — không có context, không biết nói về gì.

## Solution

### Agent Card với Keywords
```
┌─────────────────────────────────┐
│ 🤖 MAX (PM)                     │
│ ─────────────────────────────── │
│ Status: Creating tickets        │
│ Keywords: #roadmap #phase2      │
│           #assign #sprint       │
│ ─────────────────────────────── │
│ Last: "Assigned LEO to AGT-272" │
└─────────────────────────────────┘
```

### Communication Feed với Summary
```
07:35 MAX → SAM: "Review backend"
      Keywords: #code-review #api
      
07:34 LEO → QUINN: "QA needed"
      Keywords: #testing #ui-bug

07:33 SAM → MAX: "Blocked on deploy"
      Keywords: #blocker #deploy
```

### Mobile Layout
```
┌───────────────────┐
│ MAX 🔄            │
│ Creating tickets  │
│ #roadmap #assign  │
├───────────────────┤
│ SAM 🔄            │
│ Fixing API        │
│ #backend #bugfix  │
├───────────────────┤
│ LEO ⏳            │
│ Waiting QA        │
│ #frontend #review │
└───────────────────┘
```

## Implementation

### 1. Extract Keywords
From message content, extract:
- Ticket IDs (AGT-XXX)
- Actions (review, fix, deploy, test)
- Components (api, ui, backend, frontend)

### 2. Generate Summary
Use AI or pattern matching:
- "Working on AGT-272" → "Building git feed"
- "Blocked on X" → "Blocked: X"
- "Completed Y" → "Done: Y"

### 3. Update Components
- `AgentCard.tsx` — Add keywords + status summary
- `ActivityFeed.tsx` — Add keywords to each message
- Mobile responsive grid

## Acceptance Criteria
- [ ] Each agent shows 3-5 keywords
- [ ] Status summarized in 1 line
- [ ] Mobile layout readable
- [ ] No horizontal scroll on phone
