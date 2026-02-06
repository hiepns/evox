# EVOX Dashboard v0.2 - Lean Rebuild

> **Philosophy:** Less is more. Only what matters.

---

## What v0.2 IS

- ✅ Minimal, clean, works
- ✅ Mobile-first
- ✅ 3-second glance
- ✅ Database from v0.1 preserved

## What v0.2 IS NOT

- ❌ Feature-complete
- ❌ Complex UI
- ❌ Multiple views/tabs

---

## 5 MUST-HAVE Features

| # | Feature | Component |
|---|---------|-----------|
| 1 | **Agent Status** | 6 dots (online/offline) |
| 2 | **Live Activity** | Last 10 events, real-time |
| 3 | **Key Metrics** | Tasks today, Cost today |
| 4 | **Alerts** | Red banner if blocked |
| 5 | **Works on Mobile** | Single column, scrollable |

---

## UI Layout (Single Page)

```
┌─────────────────────────────────────┐
│  EVOX v0.2                    [⚙️]  │
├─────────────────────────────────────┤
│  🟢🟢🟢🟢🟡🔴  4/6 online          │  ← Agent dots
├─────────────────────────────────────┤
│  12 tasks  │  $4.20 cost            │  ← Metrics
├─────────────────────────────────────┤
│  🔴 ALERT: SAM offline 10min        │  ← Only if blocked
├─────────────────────────────────────┤
│  LIVE                               │
│  • 2m ago - MAX posted #dev         │  ← Activity
│  • 5m ago - LEO pushed uat          │
│  • 8m ago - SAM completed task      │
│  • ...                              │
└─────────────────────────────────────┘
```

---

## File Structure

```
app/v2/
  page.tsx        # Single page, all components inline
  
convex/
  (keep existing) # Database preserved
```

---

## API Endpoints (Keep)

- `GET /status` - Agent status + activity
- `POST /postToChannel` - Agent messages
- `POST /createDispatch` - Task queue

---

## Delete/Ignore from v0.1

- Complex component hierarchy
- Multiple dashboard views
- Terminal embed (later)
- Fancy animations

---

## Ship Criteria

1. Page loads in <1s
2. Shows real agent data
3. Works on iPhone
4. No console errors

---

*v0.2 = Foundation. v0.3 = Features.*
