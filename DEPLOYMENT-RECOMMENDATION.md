# Deployment Recommendation - 2026-02-06

**Question from CEO:** "MAX đã làm việc tốt hôm nay. Có nên đẩy hết lên production không? Hay đẩy phần nào?"

---

## 📊 What MAX Delivered Today

### 1. ✅ EVOX Retraining System (READY for production)
- `agents/evox.md` - Updated identity with 4 golden rules
- `docs/EVOX-QUALITY-GUIDELINES.md` - Training playbook (2000+ words)
- `docs/EVOX-CHEAT-SHEET.md` - Quick reference
- `scripts/record-learning.sh` - Record learnings
- `scripts/sync-learnings.sh` - Sync to Convex
- **Impact:** Quality improvement for EVOX coordination
- **Risk:** LOW - Only documentation and scripts, no code changes
- **Recommendation:** ✅ DEPLOY

### 2. ✅ Device Sync System (READY for production)
- `convex/deviceSync.ts` - Session state management (270 lines)
- `convex/schema.ts` - sessionStates table
- `convex/http.ts` - 4 new endpoints
- `app/sync/page.tsx` - Real-time sync dashboard
- `scripts/heartbeat-*.sh` - Heartbeat scripts
- `scripts/check-sync.sh` - Status checker
- **Impact:** Mac Mini ↔ MacBook coordination
- **Risk:** LOW - New features, don't affect existing functionality
- **Recommendation:** ✅ DEPLOY

### 3. ✅ EVOX Monitoring System (READY for production)
- `scripts/check-evox-status.sh` - Status monitoring
- `HOW-TO-MONITOR-EVOX.md` - CEO guide
- `CEO-TO-EVOX-MESSAGE.txt` - Message template
- **Impact:** CEO can monitor EVOX status
- **Risk:** LOW - Only scripts and docs
- **Recommendation:** ✅ DEPLOY

### 4. ⚠️ Message Status System (NOT COMPLETE)
- `convex/messageStatus.ts` - NEW file (in progress)
- Adds read receipts and status tracking
- **Status:** Incomplete - schema not updated yet
- **Risk:** MEDIUM - May break if deployed half-done
- **Recommendation:** ❌ DON'T DEPLOY YET - Complete first

### 5. ✅ Agent Learning System (READY for production)
- `convex/agentLearning.ts` - Feedback/learnings/skills tracking
- `convex/schema.ts` - agentFeedback, agentLearnings, agentSkills tables
- `scripts/give-feedback.sh` - Give feedback to agents
- **Impact:** Continuous improvement for agents
- **Risk:** LOW - New tables, don't affect existing data
- **Recommendation:** ✅ DEPLOY

---

## 🎯 Recommendation: PHASED DEPLOYMENT

### Phase 1: Deploy Safe Changes (NOW) ✅

**What to deploy:**
```bash
# Safe files - documentation, scripts, new features
- agents/evox.md
- docs/*.md (all training docs)
- scripts/*.sh (all scripts)
- convex/agentLearning.ts
- convex/deviceSync.ts
- convex/schema.ts (agentFeedback, agentLearnings, agentSkills, sessionStates)
- convex/http.ts (device sync endpoints)
- app/sync/page.tsx (sync dashboard)
```

**Why safe:**
- Documentation doesn't affect runtime
- Scripts are optional tools
- New Convex tables don't break existing queries
- New endpoints are additive
- New UI page doesn't affect existing pages

**Risk level:** ⚠️ LOW

**Expected impact:**
- ✅ EVOX gets training materials
- ✅ Device sync becomes available
- ✅ CEO can monitor EVOX
- ✅ Learning system starts tracking feedback

### Phase 2: Complete Message Status (LATER) ⏳

**What to complete first:**
```
1. Update convex/schema.ts - add status fields to agentMessages
2. Test message status functions
3. Create UI dashboard for message threads
4. Deploy together
```

**Why wait:**
- Currently incomplete
- Schema changes need testing
- UI not built yet

---

## 📋 Deployment Steps for Phase 1

### Step 1: Verify Build (Already Done ✅)

```bash
npx next build
# Result: ✓ Compiled successfully
```

### Step 2: Deploy Convex Schema

```bash
npx convex deploy
```

**Expected changes:**
- ✅ Add agentFeedback table
- ✅ Add agentLearnings table
- ✅ Add agentSkills table
- ✅ Add sessionStates table
- ✅ Add deviceSync functions
- ✅ Add agentLearning functions
- ✅ Add HTTP endpoints

### Step 3: Deploy Vercel (Frontend)

```bash
git push origin main
# Vercel auto-deploys from main branch
```

**Expected:** New /sync page available

### Step 4: Start Heartbeats (Post-deployment)

```bash
# On Mac Mini
./scripts/heartbeat-loop.sh evox "monitoring" 60 &
./scripts/heartbeat-loop.sh sam "idle" 90 &
./scripts/heartbeat-loop.sh leo "idle" 90 &

# On MacBook
./scripts/heartbeat-loop.sh max "coordination" 120 &
```

---

## ⚠️ What NOT to Deploy Yet

```
❌ convex/messageStatus.ts - Incomplete, needs schema update
❌ Any UI for message status - Not built yet
```

**Reason:** These are half-done. Complete first, then deploy in Phase 2.

---

## 🎯 Deployment Command for CEO → EVOX

**Clear instructions for EVOX:**

```markdown
EVOX, deploy Phase 1 changes to production:

**Requirements:**
1. ✅ Verify build passes:
   ```
   npx next build
   ```
   Must see: "✓ Compiled successfully"

2. ✅ Deploy Convex:
   ```
   npx convex deploy
   ```
   Confirm new tables added:
   - agentFeedback
   - agentLearnings
   - agentSkills
   - sessionStates

3. ✅ Deploy Vercel:
   ```
   git push origin main
   ```
   Wait for Vercel deployment to complete
   Check: https://evox-ten.vercel.app/

4. ✅ Verify deployment:
   - Check /sync page works
   - Check new endpoints respond
   - Check no errors in logs

5. ✅ Start heartbeats:
   Run heartbeat-loop.sh for all agents (see DEVICE-SYNC-SETUP.md)

**Files included:**
- agents/evox.md
- All docs/*.md training materials
- All scripts/*.sh
- convex/agentLearning.ts
- convex/deviceSync.ts
- convex/schema.ts updates
- convex/http.ts endpoints
- app/sync/page.tsx

**Files EXCLUDED (deploy later):**
- convex/messageStatus.ts (incomplete)

**Success criteria:**
- ✅ Build passes
- ✅ Convex deployed
- ✅ Vercel deployed
- ✅ No errors
- ✅ New features accessible

**Timeline:** 10-15 minutes total

— MAX
```

---

## 📊 Risk Assessment

| Component | Risk | Impact if Fails | Mitigation |
|-----------|------|-----------------|------------|
| EVOX training docs | LOW | Only docs | None needed |
| Device sync | LOW | New feature, isolated | Can disable if issues |
| Learning system | LOW | New tables, isolated | Can pause if issues |
| Scripts | LOW | Optional tools | Don't affect runtime |
| Message status | MEDIUM | Incomplete | Don't deploy yet |

**Overall risk:** ⚠️ LOW for Phase 1

---

## ✅ Recommendation

**YES, deploy Phase 1 NOW:**

1. ✅ Safe changes only
2. ✅ Build passes
3. ✅ New features are isolated
4. ✅ No breaking changes
5. ✅ Easy rollback if needed

**DON'T deploy:**
- ❌ convex/messageStatus.ts (incomplete)

**Next steps:**
1. CEO approves deployment
2. CEO gives clear instructions to EVOX (use template above)
3. EVOX executes deployment
4. MAX monitors for issues
5. Complete Phase 2 (message status) later

---

## 📝 Instructions for CEO to Give EVOX

Copy this to EVOX:

```
EVOX, deploy today's work to production.

Phase 1 scope:
- EVOX training materials
- Device sync system
- Learning system
- Monitoring tools

Steps:
1. npx next build (verify ✓)
2. npx convex deploy (add new tables)
3. git push origin main (deploy frontend)
4. Verify: Check /sync page + no errors
5. Start heartbeats (all agents)

Exclude: convex/messageStatus.ts (incomplete)

Timeline: 15 minutes
Report back when done.

— CEO Son
```

---

**MAX's recommendation: ✅ GO for Phase 1 deployment NOW.**
