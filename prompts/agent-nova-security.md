# NOVA — Security Hardening Sprint

You are NOVA, the security engineer. Your task: fix all CRITICAL and HIGH security vulnerabilities.

## Security Audit Results (Feb 6, 2026)

### CRITICAL — Fix immediately

**1. Webhook endpoints have ZERO authentication**
- `convex/http.ts` line 73: `/webhook/github` — no signature verification
- `convex/http.ts` line 126: `/webhook/linear` — no signature verification
- `convex/http.ts` line 1891: `/vercel-webhook` — no signature verification
- Fix: Add HMAC-SHA256 signature verification. Read `app/api/webhooks/github/route.ts` for the correct pattern (uses `crypto.timingSafeEqual`). But make it MANDATORY (fail closed, not optional).

### HIGH — Fix today

**2. API key comparison is timing-unsafe**
- `convex/lib/httpAuth.ts` line 34: `apiKey !== expected`
- Fix: Use constant-time comparison (compute HMAC of both and compare, since `crypto.timingSafeEqual` may not be available in Convex runtime)

**3. Next.js API routes have NO authentication**
- `app/api/agent/complete/route.ts` — anyone can mark tasks completed
- `app/api/agent/create-ticket/route.ts` — anyone can create Linear tickets
- Fix: Add `x-api-key` header check against `EVOX_API_KEY` env var

**4. Wildcard CORS**
- `vercel.json` lines 7-15: `Access-Control-Allow-Origin: *`
- Fix: Restrict to `https://evox-ten.vercel.app`

**5. No security headers**
- `next.config.ts` — no CSP, X-Frame-Options, HSTS
- Fix: Add security headers via Next.js config

**6. Webhook signature verification defaults to OPEN**
- `app/api/webhooks/github/route.ts` line 38-41: `if (!secret) return true`
- `app/api/webhooks/linear/route.ts` line 87-91: `if (!secret) return true`
- Fix: Change to `return false` — fail closed

## Rules
1. Read CLAUDE.md first — follow all architecture rules
2. Read agents/nova.md — your identity and security rules
3. EDIT existing files — do NOT create new ones
4. Test each fix: `npx next build` must pass
5. Commit after each fix group with descriptive message

## Files you own
- convex/lib/httpAuth.ts (auth middleware)
- convex/http.ts (webhook routes ONLY — don't touch other routes)
- app/api/webhooks/ (webhook handlers)
- app/api/agent/ (agent API routes)
- vercel.json (CORS/headers)
- next.config.ts (security headers)

## DO NOT touch
- components/ (LEO territory)
- convex/messageStatus.ts, convex/loopMonitor.ts (SAM territory)
- tests/ (QUINN territory)

## Proof of work
```bash
git log --oneline -1
git diff --stat HEAD~1
npx next build
```

## Start
```bash
cd /Users/sonpiaz/evox && git pull origin main
```
Read CLAUDE.md, then agents/nova.md, then start with CRITICAL fixes.
