import { supabase } from '@/integrations/supabase/client';

const PEPPER = 'devstreak-constellation-v1-2026';
const PBKDF2_ROUNDS = 200_000;

// Deterministic pseudo-random from fixed seed → identical starfield on every device.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Star { id: number; x: number; y: number; r: number; tw: number; }

export const STAR_COUNT = 80;
export const PATH_LENGTH = 5;

function buildField(): Star[] {
  const rnd = mulberry32(0xC0FFEE42);
  const stars: Star[] = [];
  // Jittered grid 10 cols × 8 rows = 80 stars, normalized 0..1
  const COLS = 10, ROWS = 8;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = r * COLS + c;
      const jx = (rnd() - 0.5) * 0.55;
      const jy = (rnd() - 0.5) * 0.55;
      stars.push({
        id,
        x: (c + 0.5 + jx) / COLS,
        y: (r + 0.5 + jy) / ROWS,
        r: 1.4 + rnd() * 2.2,
        tw: rnd() * Math.PI * 2,
      });
    }
  }
  return stars;
}

export const STAR_FIELD: Star[] = buildField();

async function pbkdf2Hex(input: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(input), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: PBKDF2_ROUNDS, hash: 'SHA-256' },
    keyMat,
    256,
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface Creds { email: string; password: string; }

async function deriveFromSecret(secret: string, kind: 'path' | 'sigil'): Promise<Creds> {
  const root = await pbkdf2Hex(secret, PEPPER + ':' + kind);
  const emailHash = root.slice(0, 24);
  const password = root.slice(24, 88);
  return { email: `c-${emailHash}@devstreak.app`, password };
}

export function pathToCreds(path: number[]): Promise<Creds> {
  const secret = path.join('-');
  return deriveFromSecret(secret, 'path');
}

export function sigilToCreds(code: string): Promise<Creds> {
  const norm = code.replace(/[^A-Z2-7]/gi, '').toUpperCase();
  return deriveFromSecret(norm, 'sigil');
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // base32-ish, no confusing chars
export function genRecoverySigil(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${out.slice(0, 2)}-${out.slice(2, 4)}-${out.slice(4, 6)}`;
}

export async function signInOrUpWithCreds({ email, password }: Creds): Promise<{ ok: boolean; error?: string }> {
  const a = await supabase.auth.signInWithPassword({ email, password });
  if (!a.error) return { ok: true };
  const b = await supabase.auth.signUp({ email, password });
  if (b.error) return { ok: false, error: b.error.message };
  return { ok: true };
}

// --- Local cooldown for brute-force resistance ---
const ATTEMPT_KEY = 'devstreak_constellation_attempts';
const COOLDOWN_KEY = 'devstreak_constellation_cooldown_until';

export function getCooldownRemaining(): number {
  try {
    const until = Number(localStorage.getItem(COOLDOWN_KEY) || '0');
    return Math.max(0, until - Date.now());
  } catch { return 0; }
}

export function recordFailedAttempt() {
  try {
    const n = Number(localStorage.getItem(ATTEMPT_KEY) || '0') + 1;
    localStorage.setItem(ATTEMPT_KEY, String(n));
    if (n >= 5) {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + 30_000));
      localStorage.setItem(ATTEMPT_KEY, '0');
    }
  } catch {}
}

export function clearAttempts() {
  try { localStorage.removeItem(ATTEMPT_KEY); localStorage.removeItem(COOLDOWN_KEY); } catch {}
}

const PATH_CACHE = 'devstreak_constellation_cached';
export function cachePath(path: number[]) {
  try { localStorage.setItem(PATH_CACHE, JSON.stringify(path)); } catch {}
}
export function getCachedPath(): number[] | null {
  try { const v = localStorage.getItem(PATH_CACHE); return v ? JSON.parse(v) : null; } catch { return null; }
}
export function forgetCachedPath() {
  try { localStorage.removeItem(PATH_CACHE); } catch {}
}