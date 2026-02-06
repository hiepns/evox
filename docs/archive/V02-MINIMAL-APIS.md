# v0.2 Backend - Minimal APIs Specification

**Status:** READY
**Database:** Giữ nguyên Convex, không thay đổi schema
**Data từ v0.1:** Fully compatible

---

## Minimal API Set (3 endpoints)

### 1. GET /status
**Purpose:** System overview - all-in-one status check

**Response:**
```json
{
  "timestamp": 1770321312396,
  "agents": [
    {"name": "SAM", "role": "backend", "status": "busy", "currentTask": "..."}
  ],
  "pendingDispatches": 5,
  "dispatches": [...],
  "recentActivity": [...]
}
```

**Usage:**
```bash
curl https://gregarious-elk-556.convex.site/status
```

---

### 2. GET /getAgentStatuses
**Purpose:** All agents với computed online/offline status

**Response:**
```json
[
  {
    "name": "SAM",
    "role": "backend",
    "status": "busy",
    "computedStatus": "online",
    "lastHeartbeat": 1770321000097,
    "msSinceHeartbeat": 312280,
    "isOnline": true,
    "currentTask": "..."
  }
]
```

**Usage:**
```bash
curl https://gregarious-elk-556.convex.site/getAgentStatuses
```

---

### 3. GET /activity/mobile
**Purpose:** Activity feed với pagination

**Query params:**
- `limit` (optional, default: 20, max: 30)
- `cursor` (optional, for pagination)

**Response:**
```json
{
  "events": [
    {
      "agentName": "SAM",
      "category": "task",
      "eventType": "status_change",
      "title": "SAM completed AGT-306",
      "timestamp": 1770321085039
    }
  ],
  "nextCursor": 1770321000000
}
```

**Usage:**
```bash
curl "https://gregarious-elk-556.convex.site/activity/mobile?limit=10"
```

---

## Supporting APIs (Optional cho v0.2)

| Endpoint | Purpose | Keep? |
|----------|---------|-------|
| `/agentHealth` | Health scores + metrics | YES |
| `/agentHealthByName?name=X` | Single agent health | YES |
| `/api/heartbeat` (POST) | Agent heartbeat | YES |
| `/postToChannel` (POST) | Agent messaging | YES |

---

## Deprecated (Consider removing in v0.3)

- `/bootContext` - Legacy boot flow
- `/v2/*` messaging endpoints - Consolidate
- Multiple dispatch endpoints - Unify

---

## Database Tables Used by Minimal APIs

| Table | Used by | Notes |
|-------|---------|-------|
| `agents` | All 3 APIs | Core |
| `activityEvents` | /status, /activity | Core |
| `dispatches` | /status | Core |
| `heartbeats` | /getAgentStatuses | Status computation |

---

## Implementation Notes

1. **No schema changes needed** - All tables exist
2. **Data backwards compatible** - v0.1 data works
3. **APIs already deployed** - Just document & standardize
4. **http.ts cleanup** - 4000+ lines, could split into modules

---

## Recommended v0.2 Action Items

- [ ] Document these 3 core APIs
- [ ] Add health endpoints to minimal set
- [ ] Consider splitting http.ts (too large)
- [ ] Deprecation warnings for legacy endpoints
