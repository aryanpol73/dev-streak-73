import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem('devstreak_install_dismissed') === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || hidden) return null;

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setHidden(true);
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem('devstreak_install_dismissed', '1');
    setHidden(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-50 glass-card p-4 border border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.3)] flex items-center gap-3 animate-in slide-in-from-bottom-5">
      <img src="/icon-192.png" alt="DevStreak" className="w-10 h-10 rounded-lg" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">Install DevStreak</p>
        <p className="text-[11px] text-muted-foreground">Add to home screen for daily access</p>
      </div>
      <button onClick={install} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 hover:shadow-[var(--neon-glow)]">
        <Download className="w-3.5 h-3.5" /> Install
      </button>
      <button onClick={dismiss} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
    </div>
  );
}
