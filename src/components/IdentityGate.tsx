import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, KeyRound, Sparkles, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { newPhrase, signInOrUp, isValidPhrase, cachePhraseLocally, getCachedPhrase } from '@/lib/identity';
import { toast } from 'sonner';
import { pullAllFromCloud, primeSyncListeners } from '@/lib/cloudSync';

type Mode = 'choose' | 'create' | 'restore' | 'unlock';

export function IdentityGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>('choose');
  const [phrase, setPhrase] = useState('');
  const [input, setInput] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Listener first, then check current session
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      if (data.session) {
        primeSyncListeners();
        pullAllFromCloud().catch(() => {});
      } else if (getCachedPhrase()) {
        setMode('unlock');
      }
    });
    return () => { sub.data.subscription.unsubscribe(); };
  }, []);

  if (authed === null) return <FullScreen><Loader2 className="w-6 h-6 animate-spin text-primary" /></FullScreen>;
  if (authed) return <>{children}</>;

  const startCreate = () => {
    setPhrase(newPhrase());
    setMode('create');
  };

  const handleConfirm = async () => {
    setBusy(true);
    const r = await signInOrUp(phrase);
    setBusy(false);
    if (!r.ok) return toast.error(r.error || 'Failed');
    cachePhraseLocally(phrase);
    toast.success('Identity created. Welcome.');
    primeSyncListeners();
  };

  const handleUnlock = async () => {
    const p = mode === 'unlock' ? (getCachedPhrase() || input) : input;
    if (!isValidPhrase(p)) return toast.error('Phrase is not valid (must be 12 BIP39 words).');
    setBusy(true);
    const r = await signInOrUp(p);
    setBusy(false);
    if (!r.ok) return toast.error(r.error || 'Failed');
    cachePhraseLocally(p);
    toast.success('Unlocked.');
    primeSyncListeners();
    pullAllFromCloud().catch(() => {});
  };

  const copy = async () => {
    await navigator.clipboard.writeText(phrase);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };

  return (
    <FullScreen>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">DevStreak</h1>
          <p className="text-xs text-muted-foreground font-mono">No password. No email. Just your phrase.</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-5 space-y-3">
              <button onClick={startCreate}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-[var(--neon-glow-strong)] transition flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Create new identity
              </button>
              <button onClick={() => setMode('restore')}
                className="w-full py-3 bg-muted/50 text-foreground font-medium rounded-lg hover:bg-muted transition flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" /> I have a phrase
              </button>
              <p className="text-[11px] text-muted-foreground text-center pt-1 leading-relaxed">
                Same 12-word phrase = same account on any device. The code is open source — only the phrase unlocks your data.
              </p>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-5 space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Save these 12 words somewhere safe (notes app, password manager). They are the <strong>only</strong> way to access your data on a new device.
                </p>
              </div>
              <div className="relative">
                <div className={`grid grid-cols-3 gap-2 p-3 rounded-lg bg-input border border-border font-mono text-sm ${showPhrase ? '' : 'blur-sm select-none'}`}>
                  {phrase.split(' ').map((w, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-primary">{w}</span>
                    </div>
                  ))}
                </div>
                {!showPhrase && (
                  <button onClick={() => setShowPhrase(true)}
                    className="absolute inset-0 flex items-center justify-center text-xs font-mono uppercase tracking-wider text-primary">
                    Tap to reveal
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 py-2 bg-muted/50 rounded-lg text-xs font-mono uppercase flex items-center justify-center gap-1.5">
                  {copied ? <><Check className="w-3.5 h-3.5 text-primary" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={handleConfirm} disabled={busy || !showPhrase}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>I saved it · Continue</>}
                </button>
              </div>
            </motion.div>
          )}

          {(mode === 'restore' || mode === 'unlock') && (
            <motion.div key="restore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-5 space-y-3">
              {mode === 'unlock' && getCachedPhrase() ? (
                <>
                  <p className="text-xs text-muted-foreground">Welcome back. Tap to unlock with the saved phrase on this device.</p>
                  <button onClick={handleUnlock} disabled={busy}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-40">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4" /> Unlock</>}
                  </button>
                  <button onClick={() => setMode('restore')} className="w-full text-[11px] text-muted-foreground hover:text-primary">
                    Use a different phrase
                  </button>
                </>
              ) : (
                <>
                  <label className="text-xs text-muted-foreground">Enter your 12-word phrase</label>
                  <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
                    placeholder="word1 word2 word3 ..."
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/60 resize-none" />
                  <button onClick={handleUnlock} disabled={busy}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-40">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock'}
                  </button>
                  <button onClick={() => setMode('choose')} className="w-full text-[11px] text-muted-foreground hover:text-primary">
                    Back
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </FullScreen>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      {children}
    </div>
  );
}