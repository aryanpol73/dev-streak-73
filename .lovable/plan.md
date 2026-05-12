## Constellation Lock — replace the 12-word phrase

A private night-sky becomes your password. You connect a sequence of stars in a specific order; only that exact path unlocks your data. Same path on any device → same account → synced streak, roadmap and reflections.

### How it feels

1. **First time** — "Forge your constellation" screen.
   - A 12×8 grid of ~80 stars twinkles on a deep-space canvas.
   - You tap **5 stars in order** to draw your constellation. A glowing neon-green line connects them as you go.
   - You re-draw the same path **twice** to confirm.
   - We show a tiny **recovery sigil** (a 6-character base32 code, e.g. `K7-MQ-9F`) — the only fallback if you forget the path. One screen, copy button, "I saved it" gate.
2. **Returning / new device** — same starfield appears (deterministic, not random). Re-draw your 5-star path → in. Wrong path 5 times in a row → 30-second cooldown.
3. **Forgot path** — tap "Use recovery sigil", enter the 6-char code → reset and draw a new constellation.
4. **Lock button** in header re-engages the gate anytime. "Forget this device" wipes the cached unlock so the constellation is required again.

### Why it's safe (even though the repo is open source)

- The starfield itself is public — anyone can see the dots. The **secret is the order of 5 specific stars out of ~80**, which is `80 × 79 × 78 × 77 × 76 ≈ 2.9 billion` ordered combinations. With a 5-attempt-then-cooldown limit, brute force is infeasible.
- The path is hashed locally with **PBKDF2 (200k rounds, SHA-256)** + a public app pepper, then used to derive a synthetic email + password for Lovable Cloud auth. The path itself **never leaves the device**.
- The starfield layout is **deterministic from a fixed seed** baked into the code, so the exact same dots appear on every device — your path works everywhere.
- Recovery sigil is a separate 30-bit code (base32) hashed the same way; stored only in your head/notes.

### What changes

**Replace** `IdentityGate` phrase flow with a `ConstellationGate` while keeping the rest of the cloud-sync stack (Supabase auth, RLS, `cloudSync.ts`, widget) exactly as is — only the *credential derivation* changes.

```text
                ┌──────────────────────────┐
   tap path ──▶ │  pathToCreds(path)       │ ──▶ email + password
                │  PBKDF2(stars+pepper)    │      │
                └──────────────────────────┘      ▼
                                       supabase.auth.signIn / signUp
```

### Files

- **Add** `src/lib/constellation.ts`
  - `STAR_FIELD` — deterministic array of ~80 `{x, y, twinkle}` from a fixed seed.
  - `pathToCreds(starIds: number[])` — PBKDF2 → `{ email, password }`.
  - `sigilToCreds(code: string)` — same derivation for recovery code.
  - `genRecoverySigil()` — 6-char base32.
- **Add** `src/components/ConstellationGate.tsx`
  - Canvas with twinkling stars (Framer Motion + requestAnimationFrame).
  - Tap/drag interaction → builds ordered path, draws neon-green polyline, shows star numbers 1-5 above each tapped node.
  - Modes: `forge` (draw → confirm-redraw → show sigil → continue), `unlock` (single draw), `recover` (enter sigil → re-forge).
  - Cooldown timer + attempt counter in localStorage.
  - "Reset constellation" link inside the unlock view → goes to `recover`.
- **Edit** `src/App.tsx` — swap `<IdentityGate>` for `<ConstellationGate>`.
- **Edit** `src/components/IdentityGate.tsx` — delete (or keep as dead code? → delete).
- **Edit** `src/lib/identity.ts` — keep `signOut`, drop phrase helpers; expose new `signInOrUpWithCreds(email, password)` consumed by both paths.
- **Edit** `src/pages/Index.tsx` header — "Lock" button label stays, "Reset constellation" lives inside the gate.
- **Remove** `bip39` dependency from `package.json` (no longer needed).

### Security notes

- 5-star path = ~31 bits of entropy → safe behind cooldown + 200k PBKDF2 rounds.
- Optional upgrade later: bump path length to 6 stars (`>200B` combos, ~37 bits) if user wants extra strength — exposed as a setting.
- Recovery sigil shown **once**, never stored server-side, never echoed in logs.
- All cloud RLS and tables stay identical → no migration needed.

### Order of work

1. Build `constellation.ts` (starfield seed, derivation, sigil).
2. Build `ConstellationGate.tsx` with forge / unlock / recover modes + canvas.
3. Wire into `App.tsx`, delete `IdentityGate`, trim `identity.ts`.
4. QA: forge on desktop → unlock on phone with same path → wrong-path cooldown → recover via sigil → cloud data still syncs.
