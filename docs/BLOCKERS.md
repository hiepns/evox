# BLOCKERS.md — Recurring Auth Bottlenecks

> Những vấn đề cần CEO giải quyết 1 lần để team tự chạy 24/7.

---

## 🔴 P0: Critical (Blocking Deployment)

### 1. GitHub Push Access
**Problem:** Không thể push code lên GitHub
**Impact:** 29+ commits stuck local, UAT không deploy được
**Times requested:** 3+

**Solutions (pick one):**

**A. SSH Key (recommended):**
```bash
# Key đã tạo sẵn, chỉ cần add vào GitHub
cat ~/.ssh/id_ed25519_evox.pub
# Copy output → https://github.com/settings/ssh/new
```

**B. Device Code:**
```
Code: 242B-4E35
URL: https://github.com/login/device
```

**C. Personal Access Token:**
- https://github.com/settings/tokens/new
- Scopes: `repo`, `workflow`
- Save to `~/.netrc` or `git config credential.helper store`

---

### 2. Vercel Deploy Access  
**Problem:** Không thể deploy lên Vercel
**Impact:** Không có UAT environment, chỉ có localtunnel tạm

**Solution:**
```
Code: QJPF-TZSW
URL: https://vercel.com/oauth/device?user_code=QJPF-TZSW
```

Or provide Vercel token:
```bash
vercel login --token <TOKEN>
```

---

### 3. Convex Deploy Access
**Problem:** Backend changes không deploy được
**Impact:** API changes stuck local

**Solution:**
```bash
npx convex login
# Opens browser, login với Convex account
```

---

## 🟡 P1: Important (Quality of Life)

### 4. ngrok Auth (optional)
**Problem:** ngrok cần account để tạo stable tunnels
**Current workaround:** Dùng localtunnel (free, no auth)

**Solution if needed:**
- https://dashboard.ngrok.com/signup
- Get authtoken → `ngrok config add-authtoken <TOKEN>`

---

## 🟢 Resolved

*(Move items here after CEO resolves)*

---

## Process: Khi Gặp Auth Block

1. **Try workaround first** — localtunnel, Tailscale, etc.
2. **Document in this file** — với steps cụ thể
3. **Notify CEO once** — không spam
4. **Continue other work** — đừng chờ

---

## One-Time Setup Checklist

Sau khi CEO hoàn thành, team sẽ tự chạy 24/7:

- [ ] GitHub SSH key added
- [ ] Vercel logged in
- [ ] Convex logged in
- [ ] (Optional) ngrok configured

**Estimated CEO time:** 5-10 minutes total
**ROI:** Unlimited autonomous deployments

---

_Last updated: 2026-02-05 03:50 PST_

---

## Vercel 401 Issue — Current Workaround

**Problem:** Vercel Preview có Password Protection, cần manual disable.

**Immediate Solutions (no CEO action needed):**

1. **Tailscale (RECOMMENDED):**
   - URL: http://100.106.143.17:3000
   - Works for anyone on Tailscale network
   - ✅ Already working

2. **localtunnel (Public access):**
   ```bash
   npx localtunnel --port 3000
   ```
   - Password: `157.131.255.168` (Mac mini public IP)
   - URL changes each restart

3. **Long-term:** Deploy to Netlify/Railway with API token (SAM researching)

**Status:** Using Tailscale as official UAT for now.
