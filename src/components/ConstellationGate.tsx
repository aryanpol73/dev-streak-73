import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, KeyRound, Copy, Check, AlertTriangle, Loader2, RotateCcw, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  STAR_FIELD, PATH_LENGTH, pathToCreds, sigilToCreds, signInOrUpWithCreds,
  genRecoverySigil, getCooldownRemaining, recordFailedAttempt, clearAttempts,
  cachePath, getCachedPath, forgetCachedPath,
} from '@/lib/constellation';
import { primeSyncListeners, pullAllFromCloud } from '@/lib/cloudSync';

type Mode = 'choose' | 'forge-draw' | 'forge-confirm' | 'forge-sigil' | 'unlock' | 'recover';

export function ConstellationGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>('choose');
  const [path, setPath] = useState<number[]>([]);
  const [confirmPath, setConfirmPath] = useState<number[]>([]);
  const [sigil, setSigil] = useState('');
  const [sigilInput, setSigilInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      if (data.session) {
        primeSyncListeners();
        pullAllFromCloud().catch(() => {});
      } else if (getCachedPath()) {
        setMode('unlock');
      }
    });
    return () => { sub.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCooldown(getCooldownRemaining()), 500);
    return () => clearInterval(t);
  }, []);

  if (authed === null) return <Shell><Loader2 className="w-6 h-6 animate-spin text-primary" /></Shell>;
  if (authed) return <>{children}</>;

  const onComplete = async (drawn: number[]) => {
    if (mode === 'forge-draw') {
      setPath(drawn);
      setMode('forge-confirm');
      return;
    }
    if (mode === 'forge-confirm') {
      if (drawn.join(',') !== path.join(',')) {
        toast.error('Paths do not match. Try again.');
        setMode('forge-draw');
        setPath([]);
        return;
      }
      setConfirmPath(drawn);
      setSigil(genRecoverySigil());
      setMode('forge-sigil');
      return;
    }
    if (mode === 'unlock') {
      if (cooldown > 0) return;
      setBusy(true);
      const creds = await pathToCreds(drawn);
      const r = await signInOrUpWithCreds(creds);
      setBusy(false);
      if (!r.ok) {
        recordFailedAttempt();
        setCooldown(getCooldownRemaining());
        toast.error('Wrong constellation.');
        return;
      }
      clearAttempts();
      cachePath(drawn);
      primeSyncListeners();
      pullAllFromCloud().catch(() => {});
      toast.success('Unlocked.');
    }
  };

  const finishForge = async () => {
    setBusy(true);
    // 1. Sign up the path account
    const pCreds = await pathToCreds(path);
    const r1 = await signInOrUpWithCreds(pCreds);
    if (!r1.ok) { setBusy(false); return toast.error(r1.error || 'Failed'); }
    // 2. Also create the sigil account (deterministic, separate auth row that maps to same data via re-forge)
    const sCreds = await sigilToCreds(sigil);
    await supabase.auth.signOut();
    await signInOrUpWithCreds(sCreds);
    await supabase.auth.signOut();
    // 3. Sign back in as path account
    await signInOrUpWithCreds(pCreds);
    setBusy(false);
    cachePath(path);
    primeSyncListeners();
    toast.success('Constellation forged.');
  };

  const recoverWithSigil = async () => {
    if (sigilInput.replace(/[^A-Z2-7]/gi, '').length !== 6) return toast.error('Sigil must be 6 characters.');
    setBusy(true);
    const creds = await sigilToCreds(sigilInput);
    const r = await signInOrUpWithCreds(creds);
    setBusy(false);
    if (!r.ok) return toast.error('Invalid sigil.');
    forgetCachedPath();
    toast.success('Recovered. Draw a new constellation to replace your old one.');
    primeSyncListeners();
    pullAllFromCloud().catch(() => {});
  };

  const copySigil = async () => {
    await navigator.clipboard.writeText(sigil);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-5 space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">DevStreak</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {mode === 'unlock' ? 'Re-draw your constellation to unlock' :
             mode === 'forge-draw' ? `Tap ${PATH_LENGTH} stars in order — that is your key` :
             mode === 'forge-confirm' ? 'Re-draw the same path to confirm' :
             mode === 'recover' ? 'Enter your recovery sigil' :
             'Your night sky. Your private path.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-5 space-y-3">
              <button onClick={() => { setPath([]); setMode('forge-draw'); }}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-[var(--neon-glow-strong)] transition flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Forge a new constellation
              </button>
              <button onClick={() => setMode('unlock')}
                className="w-full py-3 bg-muted/50 text-foreground font-medium rounded-lg hover:bg-muted transition flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" /> I have a constellation
              </button>
              <p className="text-[11px] text-muted-foreground text-center pt-1 leading-relaxed">
                Same path on any device → same account. The starfield is public; the order of your 5 stars is the secret.
              </p>
            </motion.div>
          )}

          {(mode === 'forge-draw' || mode === 'forge-confirm' || mode === 'unlock') && (
            <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3">
              <StarCanvas onComplete={onComplete} disabled={busy || cooldown > 0} mode={mode} />
              {cooldown > 0 && (
                <p className="text-xs text-warning text-center font-mono">
                  Too many attempts. Wait {Math.ceil(cooldown / 1000)}s.
                </p>
              )}
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <button onClick={() => setMode('choose')} className="hover:text-primary flex items-center gap-1">
                  <Undo2 className="w-3 h-3" /> Back
                </button>
                {mode === 'unlock' && (
                  <button onClick={() => setMode('recover')} className="hover:text-primary">
                    Forgot path? Use sigil
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'forge-sigil' && (
            <motion.div key="sigil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-5 space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Save this <strong>recovery sigil</strong>. It is the only fallback if you forget your constellation. We never store it.
                </p>
              </div>
              <div className="text-center py-6 rounded-lg bg-input border border-border">
                <div className="font-mono text-3xl font-bold text-primary tracking-[0.3em]">{sigil}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={copySigil}
                  className="flex-1 py-2 bg-muted/50 rounded-lg text-xs font-mono uppercase flex items-center justify-center gap-1.5">
                  {copied ? <><Check className="w-3.5 h-3.5 text-primary" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={finishForge} disabled={busy}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'I saved it · Enter'}
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'recover' && (
            <motion.div key="recover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-5 space-y-3">
              <label className="text-xs text-muted-foreground">Recovery sigil (e.g. K7-MQ-9F)</label>
              <input value={sigilInput} onChange={e => setSigilInput(e.target.value.toUpperCase())}
                placeholder="XX-XX-XX" maxLength={8}
                className="w-full px-3 py-3 bg-input border border-border rounded-lg text-center font-mono text-xl tracking-[0.3em] focus:outline-none focus:ring-1 focus:ring-primary/60" />
              <button onClick={recoverWithSigil} disabled={busy}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-40">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /> Recover</>}
              </button>
              <button onClick={() => setMode('choose')} className="w-full text-[11px] text-muted-foreground hover:text-primary">
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Shell>
  );
}

function StarCanvas({ onComplete, disabled, mode }: { onComplete: (path: number[]) => void; disabled: boolean; mode: Mode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 360, h: 360 });
  const [picks, setPicks] = useState<number[]>([]);
  const tRef = useRef(0);
  const [, force] = useState(0);

  useEffect(() => { setPicks([]); }, [mode]);

  useEffect(() => {
    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth;
      setSize({ w, h: Math.min(w, 360) });
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Twinkle animation
  useEffect(() => {
    let raf = 0;
    const loop = () => { tRef.current += 0.03; force(n => (n + 1) % 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const positioned = useMemo(() => STAR_FIELD.map(s => ({
    ...s, px: s.x * size.w, py: s.y * size.h,
  })), [size]);

  const pick = (id: number) => {
    if (disabled) return;
    if (picks.includes(id)) return;
    const next = [...picks, id];
    setPicks(next);
    if (next.length === PATH_LENGTH) {
      setTimeout(() => onComplete(next), 250);
    }
  };

  const undo = () => setPicks(p => p.slice(0, -1));
  const reset = () => setPicks([]);

  return (
    <div className="space-y-2">
      <div ref={wrapRef} className="relative rounded-xl border border-border overflow-hidden bg-gradient-to-b from-[hsl(220_40%_4%)] to-[hsl(260_40%_8%)]"
        style={{ height: size.h }}>
        <svg width={size.w} height={size.h} className="absolute inset-0">
          {/* connecting lines */}
          {picks.slice(1).map((id, i) => {
            const a = positioned[picks[i]];
            const b = positioned[id];
            return <line key={i} x1={a.px} y1={a.py} x2={b.px} y2={b.py}
              stroke="hsl(var(--primary))" strokeWidth={1.5} strokeOpacity={0.7}
              strokeLinecap="round" filter="url(#glow)" />;
          })}
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="2" /></filter>
          </defs>
          {positioned.map(s => {
            const idx = picks.indexOf(s.id);
            const sel = idx >= 0;
            const tw = 0.6 + 0.4 * Math.sin(tRef.current + s.tw);
            return (
              <g key={s.id}>
                {sel && (
                  <circle cx={s.px} cy={s.py} r={s.r * 3.5}
                    fill="hsl(var(--primary))" fillOpacity={0.15} />
                )}
                <circle cx={s.px} cy={s.py} r={sel ? s.r * 1.6 : s.r}
                  fill={sel ? 'hsl(var(--primary))' : `hsl(0 0% 100% / ${tw})`}
                  className="cursor-pointer"
                  onClick={() => pick(s.id)}
                  style={{ transition: 'r 0.15s' }} />
                {/* invisible larger hit-target */}
                <circle cx={s.px} cy={s.py} r={Math.max(s.r * 4, 12)}
                  fill="transparent" className="cursor-pointer"
                  onClick={() => pick(s.id)} />
                {sel && (
                  <text x={s.px} y={s.py - s.r * 2.5} textAnchor="middle"
                    fontSize="10" fill="hsl(var(--primary))" fontFamily="monospace">{idx + 1}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-muted-foreground">{picks.length}/{PATH_LENGTH} stars</span>
        <div className="flex gap-3">
          <button onClick={undo} disabled={!picks.length} className="text-muted-foreground hover:text-primary disabled:opacity-30 flex items-center gap-1">
            <Undo2 className="w-3 h-3" /> Undo
          </button>
          <button onClick={reset} disabled={!picks.length} className="text-muted-foreground hover:text-primary disabled:opacity-30 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      {children}
    </div>
  );
}