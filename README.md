# DuqsiPay — School Fee Management

A fast, minimal school fee management app for Somali schools: students, classes,
payments, receipts, WhatsApp/SMS fee reminders, reports, CSV import, activity log
and JSON backups — plus a marketing landing page with plan-based sales inquiries.

**Stack (all-in-one, one framework, one database):**
Next.js 16 (App Router, server components + server actions) · React 19 ·
Tailwind CSS 4 · Drizzle ORM · PostgreSQL · TypeScript.
No other backend, auth provider or paid service required.

---

## Quick start (local)

```bash
npm install                       # 1. dependencies
cp .env.example .env              # 2. set DATABASE_URL
npx drizzle-kit push              # 3. create the tables
npm run build && npm start        # 4. production build
# or: npm run dev
```

Open http://localhost:3000 → **landing page**. The app itself is at `/dashboard`.
First visit auto-creates default school settings; everything else starts empty
(you can load optional sample data from **Settings → Data & safety**).

## Deploy to Vercel (one-time setup)

1. Push this repo to GitHub/GitLab and **Import Project** in Vercel
   (framework auto-detected: Next.js — no config needed).
2. Create a Postgres database. **Recommended: [Neon](https://neon.tech) free tier** —
   your data persists indefinitely (it may suspend compute during long inactivity but
   never deletes data, and resumes in ~1s on the first request). Supabase's free tier
   *pauses* projects after inactivity — Neon is the safest free choice here.
3. Add Environment Variables (Production):
   - `DATABASE_URL` = your hosted Postgres connection string
   - `DATABASE_SSL` = `true`  ← required for Neon/Vercel Postgres
   - `NEXT_PUBLIC_SALES_WHATSAPP` = your sales number, digits only (e.g. `252612345678`)
4. Deploy. Then create tables once:
   - locally: `DATABASE_URL="postgres://…" npx drizzle-kit push`
   - or run the same SQL from the dashboard SQL editor.
5. Done. Subsequent deploys are `git push` only.

## Speed & offline (built in)

- Marketing pages (`/`, `/pricing`, `/demo`, `/offline`) are **statically prerendered**
  — instant TTFB and CDN-cacheable on Vercel. App pages stay dynamic so numbers are
  always live.
- A hand-written **service worker** (`public/sw.js`) caches static assets cache-first
  and pages network-first, with an offline fallback — previously visited screens keep
  opening without a connection. API routes and writes are never cached.
- Installable as a PWA (manifest + icons in `public/`): "Add to Home Screen" on Android.

## Accounts, roles & demo mode

- **First visit** → `/signup` creates the workspace **owner** (email + password, scrypt-hashed,
  httpOnly session cookie, 30-day sliding expiry, 8-strike lockout).
- **Staff** are added from Settings → Staff accounts (roles: `owner`, `admin`, `staff`).
  Admins change settings/classes/deletions/staff/backups; staff handle students, payments,
  imports and reminders. All write actions are guarded server-side — never just hidden in the UI.
- **Demo mode**: `/demo/enter` opens a read-only sample school (clear banner, writes rejected
  server-side, 1-day session). Demo data is flagged `is_demo`; it never mixes with real records.
- **Password reset**: full token flow (SHA-256 hashed, 30-minute, single-use, invalidates sessions).
  Emails send via Resend when `RESEND_API_KEY` is set; otherwise `EMAIL_DEV_LINKS=true`
  prints the link on screen (dev only).

## Configuration (single places to edit)

| What | Where |
|---|---|
| Prices, plans, setup fees, sales WhatsApp, lifetime disclaimer | `src/lib/pricing.ts` |
| School name/logo/currency/language/classes/fees/receipts | In-app **Settings** page (persisted in DB) |
| Phone normalization, WhatsApp/SMS link builders | `src/lib/phone.ts` |
| DB schema | `src/db/schema.ts` → apply with `npx drizzle-kit push` |

## Routes

- `/` — landing (pain points, features, pricing, FAQ, sign-up form)
- `/pricing` — dedicated pricing page
- `/dashboard` — app home · `/students` · `/classes` · `/payments` · `/reports`
  · `/import` · `/activity` · `/settings` · `/receipts/[id]`
- APIs: `/api/health`, `/api/backup` (full JSON export), `/api/import-template` (CSV)

## Honest messaging model (by design)

No message is ever sent automatically. Buttons open **WhatsApp app**
(`wa.me`), **WhatsApp Web** (`web.whatsapp.com/send`, works when app links
are blocked) or the **native SMS app** (`sms:` deep link) with the text
pre-filled — the user always presses send. Somali numbers are normalized
to +252 automatically.

## Data safety

- Students with payment history **cannot be hard-deleted** (archive instead).
- Classes with enrolled students can't be deleted. Every action is logged.
- Payments store name/class snapshots → history survives profile edits.
- One-click JSON backup (`/api/backup`) before any risky operation.
- Optional **sample data** is flagged `is_demo` and removed with one click.

## Known boundaries (intentional)

- Single school per deployment; no staff logins/roles yet (Pro roadmap).
- No online card checkout — plan selection opens a WhatsApp/SMS inquiry,
  sales activates workspaces manually (no fake payment flow).
