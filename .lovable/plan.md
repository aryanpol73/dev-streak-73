## 1. Passkey lock (WebAuthn) + Lovable Cloud sync

**Enable Lovable Cloud** (required for cross-device sync and passkey verification).

### Auth flow
- **First visit** → "Create your DevStreak passkey" → Face ID / fingerprint / Windows Hello → account created. Show a **12-word BIP39 recovery phrase** once; user must confirm 3 random words back before continuing.
- **Returning / new device** → "Unlock" → biometric → in. Passkeys auto-sync via iCloud Keychain / Google Password Manager, so the same biometric works on phone, laptop, tablet.
- **Lost all devices** → "Restore with recovery phrase" → enter 12 words → re-register a passkey on the new device.
- **Lock button** in header re-engages the gate at any time.

### Tech
- Library: `@simplewebauthn/browser` (client) + `@simplewebauthn/server` (edge function).
- Two edge functions:
  - `passkey-register` → returns registration options, stores credential.
  - `passkey-authenticate` → verifies assertion, mints a Cloud session via `signInWithPassword` against a derived synthetic email + per-user random password stored in `auth_users` table (server-side only).
- `bip39` lib for recovery phrase; the phrase deterministically derives a backup credential the server accepts as a one-time fallback.

### Data tables (Cloud, all RLS `auth.uid() = user_id`)
- `submissions` — mirrors current `DailySubmission`.
- `roadmap_progress` — `(phase_id, topic_id, completed_at)`.
- `reflections` — `(week_iso, content, score)`.
- `attachments` — `(submission_id, storage_path, kind, name, size)`.
- `widget_tokens` — `(user_id, public_id, created_at)` for shareable widget URLs.
- Storage bucket `proofs/` (private, signed URLs).

### Sync strategy
- **Local-first**: writes still hit localStorage immediately for instant UI.
- Background pusher in `src/lib/cloudSync.ts` flushes a queue to Cloud.
- On unlock, pull from Cloud and merge by `(date, challengeId)` for submissions, `(phase_id, topic_id)` for roadmap, `week_iso` for reflections (last-write-wins by `updated_at`).
- Attachments: new uploads go to Cloud Storage; old base64 ones get migrated on next edit.

### Files
- **Add** `src/components/PasskeyGate.tsx` — full-screen gate (setup, unlock, recovery).
- **Add** `src/lib/passkey.ts` — register/authenticate/recover helpers.
- **Add** `src/lib/cloudSync.ts` — push/pull/merge.
- **Add** `supabase/functions/passkey-register/index.ts`, `supabase/functions/passkey-authenticate/index.ts`.
- **Add** migration for the 5 tables, RLS policies, storage bucket, and `passkey_credentials` table (`user_id`, `credential_id`, `public_key`, `counter`, `transports`).
- **Edit** `src/App.tsx` → wrap routes in `<PasskeyGate>`.
- **Edit** `src/lib/store.ts` → emit change events for the sync layer.
- **Edit** `src/pages/Index.tsx` header → sync indicator (✓ Synced / ⏳ Syncing / 🔒 Local) + Lock button.

## 2. Roadmap PDF — open instantly

Current `PdfDrawer` opens an in-app drawer that loads the PDF lazily, which feels laggy.

Change:
- Replace the drawer with a simple anchor: clicking "Roadmap" opens `/roadmap.pdf` in a **new tab** via `<a href="/roadmap.pdf" target="_blank" rel="noopener">` so the browser's native viewer renders it instantly, with download + zoom built in.
- Keep a small "View inline" link as secondary option (uses existing `<iframe>`).
- **Edit** `src/components/PdfDrawer.tsx` → swap drawer trigger for direct anchor, keep iframe behind a "View inline" toggle.

## 3. Activity widget (any-device, month + year)

A shareable, read-only widget URL you can pin anywhere — phone home screen (Add to Home Screen), Notion embed, GitHub README, second monitor tab, etc.

### What it is
- Public route `/w/:publicId?range=month|year&theme=dark|light`.
- Renders **only** the heatmap + streak badge + "DevStreak" wordmark — no nav, no header.
- `publicId` is a random UUID stored in `widget_tokens`; revocable from inside the app.
- Month view: 5×7 grid of the last 30 days with intensity shading.
- Year view: 53-week GitHub-style heatmap with month labels + monthly totals on hover.
- Auto-refreshes every 5 min; SSR-friendly via Cloud anonymous read using the public ID.

### Embed / install options (in a "Share Widget" modal in-app)
- **Copy link** (month / year toggle).
- **"Install as widget"** → opens the widget URL with `display: standalone` manifest scoped to `/w/`, so iOS/Android "Add to Home Screen" produces a true home-screen tile that opens straight to your heatmap.
- **Download as PNG** (uses `html-to-image`) for static share / wallpaper.
- **Embed code** (`<iframe>` snippet) for Notion / blogs.
- **Revoke link** button (rotates `publicId`).

### Files
- **Add** `src/pages/Widget.tsx` — public, no-auth route reading from a Cloud edge function `widget-data?id=…&range=…`.
- **Add** `supabase/functions/widget-data/index.ts` — looks up `widget_tokens.public_id`, returns aggregated daily counts (no PII, no proof content).
- **Add** `src/components/WidgetShare.tsx` — modal with toggle (month/year), copy, download PNG, embed snippet, install instructions, revoke.
- **Add** `public/widget-manifest.webmanifest` with `scope: "/w/"`, `start_url: "/w/<id>?range=month"` injected at install time.
- **Edit** `src/App.tsx` → add `/w/:publicId` route outside the `<PasskeyGate>` wrapper.
- **Edit** `src/pages/Index.tsx` header → add "📊 Widget" button next to PDF link, opens `WidgetShare`.

## Order of work
1. Enable Lovable Cloud + migration (auth, tables, storage, widget tokens).
2. Passkey edge functions + `PasskeyGate` + recovery flow.
3. `cloudSync` layer + migrate localStorage data on first unlock.
4. Roadmap PDF → direct-open anchor.
5. Widget route + share modal + edge function.
6. QA: register on desktop, unlock on phone via synced passkey, verify data appears, test recovery phrase, test widget URL on a second device, test PDF opens in one click.

## Notes
- Passkeys require HTTPS — works on the published URL and on `localhost`. The Lovable preview iframe also works.
- Browser support: all modern Chrome/Safari/Edge/Firefox. Older browsers fall back to recovery-phrase login.
- Widget data is intentionally minimal (date + count + streak) — no submission text, no file URLs — so a leaked widget link can't expose your work.