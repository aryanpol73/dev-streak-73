import { generateMnemonic, validateMnemonic } from 'bip39';
import { supabase } from '@/integrations/supabase/client';

const PEPPER = 'devstreak-v1-pepper-2026';

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface DerivedCreds { email: string; password: string; }

export async function deriveCreds(phrase: string): Promise<DerivedCreds> {
  const norm = phrase.trim().toLowerCase().split(/\s+/).join(' ');
  // PBKDF2-style stretching via repeated SHA-256 (4096 rounds) — keeps it in WebCrypto only
  let h = await sha256Hex(norm + ':' + PEPPER);
  for (let i = 0; i < 4096; i++) h = await sha256Hex(h + ':' + i);
  const emailHash = (await sha256Hex(h + ':email')).slice(0, 24);
  const password = await sha256Hex(h + ':password');
  return { email: `id-${emailHash}@devstreak.app`, password };
}

export function newPhrase(): string {
  return generateMnemonic(128); // 12 words
}

export function isValidPhrase(p: string): boolean {
  return validateMnemonic(p.trim().toLowerCase());
}

export async function signInOrUp(phrase: string): Promise<{ ok: boolean; error?: string; created?: boolean }> {
  if (!isValidPhrase(phrase)) return { ok: false, error: 'Invalid 12-word phrase.' };
  const { email, password } = await deriveCreds(phrase);

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signIn.error) return { ok: true };

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.error) return { ok: false, error: signUp.error.message };
  // After signUp the session is set if auto-confirm is on.
  return { ok: true, created: true };
}

const PHRASE_CACHE_KEY = 'devstreak_phrase_cached';

export function cachePhraseLocally(phrase: string) {
  try { localStorage.setItem(PHRASE_CACHE_KEY, phrase); } catch {}
}
export function getCachedPhrase(): string | null {
  try { return localStorage.getItem(PHRASE_CACHE_KEY); } catch { return null; }
}
export function forgetCachedPhrase() {
  try { localStorage.removeItem(PHRASE_CACHE_KEY); } catch {}
}

export async function signOut() {
  forgetCachedPhrase();
  await supabase.auth.signOut();
}