import { supabase } from '@/integrations/supabase/client';
import { getSubmissions, getReflections, getPhases, type DailySubmission, type WeeklyReflection, type Phase } from '@/lib/store';

let listenersPrimed = false;

export function primeSyncListeners() {
  if (listenersPrimed) return;
  listenersPrimed = true;
  // Push pending changes whenever the store fires a 'devstreak:changed' event
  window.addEventListener('devstreak:changed', () => { pushAllToCloud().catch(() => {}); });
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function pushAllToCloud() {
  const uid = await getUserId();
  if (!uid) return;
  await Promise.all([pushSubmissions(uid), pushReflections(uid), pushRoadmap(uid)]);
}

async function pushSubmissions(uid: string) {
  const subs = getSubmissions();
  if (!subs.length) return;
  const rows = subs.map((s: DailySubmission) => ({
    id: s.id, user_id: uid, date: s.date,
    challenge_id: s.challengeId, challenge_name: s.challengeName, phase_number: s.phaseNumber,
    minutes_studied: s.minutesStudied, proof_type: s.proofType, proof_url: s.proofUrl ?? null,
    proof_notes: s.proofNotes, leetcode_problems: s.leetcodeProblems,
    difficulty: s.difficulty, verified: s.verified,
    attachments: (s.attachments ?? []).map(a => ({ id: a.id, name: a.name, type: a.type, size: a.size, kind: a.kind })),
  }));
  await supabase.from('submissions').upsert(rows, { onConflict: 'id' });
}

async function pushReflections(uid: string) {
  const refls = getReflections();
  if (!refls.length) return;
  const rows = refls.map((r: WeeklyReflection) => ({
    user_id: uid,
    week_iso: r.weekStart,
    content: JSON.stringify({ shipped: r.whatShipped, blocked: r.whatBlocked, next: r.nextWeekFocus }),
    score: null,
  }));
  await supabase.from('reflections').upsert(rows, { onConflict: 'user_id,week_iso' });
}

async function pushRoadmap(uid: string) {
  const phases = getPhases();
  const rows: { user_id: string; phase_id: string; topic_id: string; completed_at: string }[] = [];
  phases.forEach((p: Phase) => p.sections.forEach(s => s.topics.forEach(t => {
    if (t.completed && t.completedAt) {
      rows.push({ user_id: uid, phase_id: p.id, topic_id: t.id, completed_at: t.completedAt });
    }
  })));
  if (rows.length) await supabase.from('roadmap_progress').upsert(rows, { onConflict: 'user_id,phase_id,topic_id' });
}

export async function pullAllFromCloud() {
  const uid = await getUserId();
  if (!uid) return;
  // Pull submissions and merge into local
  const { data: cloudSubs } = await supabase.from('submissions').select('*').eq('user_id', uid);
  if (cloudSubs && cloudSubs.length) {
    const local = getSubmissions();
    const byId = new Map(local.map(s => [s.id, s]));
    cloudSubs.forEach((row: any) => {
      if (byId.has(row.id)) return;
      byId.set(row.id, {
        id: row.id, date: row.date, challengeId: row.challenge_id,
        challengeName: row.challenge_name, phaseNumber: row.phase_number,
        minutesStudied: row.minutes_studied, proofType: row.proof_type,
        proofUrl: row.proof_url ?? undefined, proofNotes: row.proof_notes ?? '',
        leetcodeProblems: row.leetcode_problems ?? 0, difficulty: row.difficulty,
        verified: !!row.verified, createdAt: row.created_at,
        attachments: (row.attachments ?? []).map((a: any) => ({ ...a, dataUrl: '' })),
      });
    });
    localStorage.setItem('devstreak_submissions_v2', JSON.stringify(Array.from(byId.values())));
  }
  // Notify UI
  window.dispatchEvent(new Event('devstreak:synced'));
}

export async function createWidgetToken(): Promise<string | null> {
  const uid = await getUserId();
  if (!uid) return null;
  // try existing
  const { data: existing } = await supabase.from('widget_tokens').select('public_id').eq('user_id', uid).limit(1).maybeSingle();
  if (existing?.public_id) return existing.public_id;
  const publicId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const { error } = await supabase.from('widget_tokens').insert({ user_id: uid, public_id: publicId });
  if (error) return null;
  return publicId;
}

export async function rotateWidgetToken(): Promise<string | null> {
  const uid = await getUserId();
  if (!uid) return null;
  await supabase.from('widget_tokens').delete().eq('user_id', uid);
  return createWidgetToken();
}