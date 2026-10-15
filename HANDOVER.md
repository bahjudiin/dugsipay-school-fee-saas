# DugsiPAY — Handover Guide (for the next developer / opencode)

Everything needed to pick this up with zero context. Read `README.md` first,
then this file for the internal map.

## 1. Architecture at a glance

```
Browser ──► Next.js App Router (single app: landing + dashboard + API)
              │
              ├── server components fetch via Drizzle (node-postgres Pool)
              ├── server actions ("use server") handle ALL mutations
              └── PostgreSQL — the ONLY backend service
```

No Nest/Express, no Redis, no auth service, no queues. If you feel the urge to
add one — don't; the brief is "fast and simple".

## 2. File map

| Area | Files |
|---|---|
| DB schema (6 tables) | `src/db/schema.ts` (`school_settings`, `classes`, `students`, `payments`, `activity_log`, `signups`) |
| DB connection (SSL toggle) | `src/db/index.ts` |
| **Pricing config — EDIT FOR PRICE CHANGES** | `src/lib/pricing.ts` |
| Phone helpers (+252 normalize, wa.me / WhatsApp Web / sms: links) | `src/lib/phone.ts` |
| Money/date formatting, words | `src/lib/format.ts`, `src/lib/words.ts` |
| i18n dictionary (en/so) | `src/lib/i18n.ts` |
| CSV parse + template | `src/lib/csv.ts` |
| Activity logging | `src/lib/activity.ts` |
| Server actions | `src/lib/actions/{students,payments,settings-actions,import,signup}.ts` |
| Shared UI kit (buttons/Card/Stat/Badge/Alert) | `src/components/ui.tsx` |
| App shell (sidebar/drawer) | `src/components/AppShell.tsx` |
| Contact menu (WA app / WA Web / SMS / copy) | `src/components/ContactMenu.tsx` |
| Landing marketing sections | `src/app/page.tsx`, `src/components/marketing/PricingSection.tsx` |
| App pages (in route group `(app)`, keeps URLs `/dashboard`, `/students`, …) | `src/app/(app)/**` |

Route groups: `src/app/(app)` applies the sidebar layout only to app routes;
`/` and `/pricing` are marketing pages without chrome. All internal app URLs are
unchanged — don't move folders out of `(app)` or links break.

## 3. Auth & tenancy model

- One deployment = one school workspace (stronger isolation than row-level: separate DB).
- Auth = `src/lib/auth.ts`: scrypt hashing (Node built-in, no deps), opaque-token sessions in
  `sessions` (SHA-256 stored), `users` with roles `owner/admin/staff/demo`.
- EVERY mutation is guarded server-side via `guardWriteAction()` (owner/admin/staff) or
  `guardAdminAction()` (owner/admin). Demo reads allowed, writes rejected. Follow this pattern
  for any new action — never rely on hiding UI.
- Auth pages live in `src/app/(auth)`; the app group `(app)/layout.tsx` redirects to `/login`.
- Password reset: hashed single-use tokens (`password_reset_tokens`); mail via Resend REST
  (`RESEND_API_KEY`) or `EMAIL_DEV_LINKS=true` locally.
- Supabase Auth can replace this module later: swap `getAuthUser` + actions in
  `src/lib/actions/auth.ts`; the guard pattern stays identical.

## 4. Money & safety rules (do not break)

1. **Receipt/roll numbers** are race-safe counters on the single
   `school_settings` row, consumed inside the same DB transaction as the insert.
2. **Payments snapshot** student name + class at write time → editing a student
   never rewrites financial history. Deleting a student with payments is blocked.
3. `is_demo` flag = sample data; `purgeDemoData()` only touches flagged rows.
4. `updateSettings / addClass / deleteClass` etc. validate + log to `activity_log`.
5. Balances are *derived* (months since enrolment × class fee − paid). There is
   no stored balance column to get out of sync.

## 5. WhatsApp / SMS (fix history)

Earlier `wa.me`-only links could be blocked inside in-app browsers. The fix is
`ContactMenu.tsx`: WhatsApp app (`wa.me`), **WhatsApp Web**
(`web.whatsapp.com/send?phone=…&text=…`), native **SMS** (`sms:+252…?&body=…`),
or copy-text. Use `ContactMenu` everywhere instead of raw anchors.

## 6. Pricing ## 5. Pricing & sales flow sales flow

- Prices/plans/setup fees/disclaimer/sales number → **one file**: `src/lib/pricing.ts`
  (sales number can also come from `NEXT_PUBLIC_SALES_WHATSAPP`).
- "Choose plan" → `/?plan=<id>#signup` → `SignupForm` shows the selected plan,
  stores it in `signups.plan`. "Ask on WhatsApp/SMS" → pre-filled inquiry to sales.
- There is deliberately **no checkout**. Do not add fake payment buttons.
- Lifetime = software license. The mandatory disclaimer lives in pricing.ts —
  keep it in any redesign.

## 7. Demo / sample data

- Settings → Data & safety → **Load sample data** (26 flagged students, 95
  payments, 2 archived alumni; refuses to run twice).
- **Clean demo data** removes only flagged rows (+ their payments).
- Real records are never seeded or removed implicitly.

## 8. Ops

- Backup DB: `/api/backup` (JSON) or `pg_dump` (there are SQL dumps in
  `backups/` locally — gitignored).
- Apply schema: `npx drizzle-kit push` (config: `drizzle.config.ts`, reads
  `DATABASE_URL`).
- Hosted DB (Neon/Vercel): set `DATABASE_SSL=true`. Neon free tier = data never
  deleted/expired data — compute may nap; first request wakes it (~1s).
- Health check: `GET /api/health`.
- Marketing routes (`/`, `/pricing`, `/demo`, `/offline`) are **`○` static** —
  don't add server/request APIs to them or they'll silently go dynamic again.
  App routes under `(app)` stay `ƒ` dynamic on purpose.
- PWA: `public/sw.js` (network-first pages, cache-first assets, `/api/*` bypass),
  registered by `src/components/SWRegister.tsx` (production only). Bump `VERSION`
  in sw.js when changing precached files.
- Client crash-safety: every client call into a server action is wrapped in
  try/catch + toast (see ConfirmAction/ImportWizard pattern) — follow it when
  adding new flows so a failed POST never becomes "X is not a function" in prod.

## 9. Pre-flight checklist (build once, no errors)

```bash
npm install
npm exec tsc -- --noEmit          # 0 errors expected
npx next typegen
npm run build                     # expect: 16 routes, all ƒ (dynamic)
npm start                         # smoke: /, /pricing, /dashboard, /api/health
```

Validated on the handover build: 16 routes, all 200; report totals cross-checked
against SQL; signup/pricing links grep-verified.

## 10. Not implemented on purpose (roadmap, don't fabricate)

- Staff accounts / permissions / multi-tenant schools (needs an auth decision).
- Automatic message sending (would need a paid WhatsApp Business API).
- Online card checkout (sales flow is WhatsApp/SMS-first by design).
