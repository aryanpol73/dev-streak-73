import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Copy, Check, RefreshCw, Download, ExternalLink, Loader2 } from 'lucide-react';
import { createWidgetToken, rotateWidgetToken } from '@/lib/cloudSync';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

export function WidgetShare() {
  const [open, setOpen] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [range, setRange] = useState<'month' | 'year'>('month');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || publicId) return;
    setBusy(true);
    createWidgetToken().then(id => { setPublicId(id); setBusy(false); });
  }, [open, publicId]);

  const widgetUrl = publicId ? `${window.location.origin}/w/${publicId}?range=${range}` : '';
  const embed = `<iframe src="${widgetUrl}" width="100%" height="220" style="border:0;border-radius:16px"></iframe>`;

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
    toast.success('Copied');
  };

  const downloadImage = async () => {
    // Open the widget URL in an off-screen iframe, snapshot it
    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.width = '820px';
    iframe.style.height = '320px';
    document.body.appendChild(iframe);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const node = iframe.contentDocument?.getElementById('widget-card');
      if (!node) throw new Error('not ready');
      const png = await toPng(node, { backgroundColor: '#0a0a0a', pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = png; a.download = `devstreak-${range}.png`; a.click();
    } catch {
      toast.error('Could not generate PNG. Try opening the link instead.');
    } finally {
      iframe.remove();
    }
  };

  const rotate = async () => {
    setBusy(true);
    const id = await rotateWidgetToken();
    setBusy(false);
    setPublicId(id);
    toast.success('New widget link generated. Old one revoked.');
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider bg-muted/40 text-foreground border border-border hover:border-primary/40 hover:text-primary transition">
        <Share2 className="w-3.5 h-3.5" /> Widget
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-card border border-border rounded-2xl p-5 space-y-4 shadow-[var(--neon-glow-strong)]">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" /> Activity Widget
                </h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted/50"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/40 border border-border/50 w-fit">
                {(['month', 'year'] as const).map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase transition ${
                      range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    {r === 'month' ? '30 days' : '12 months'}
                  </button>
                ))}
              </div>

              {busy || !publicId ? (
                <div className="flex items-center justify-center h-24"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Public link</label>
                    <div className="flex gap-2 mt-1">
                      <input readOnly value={widgetUrl}
                        className="flex-1 px-2 py-2 bg-input border border-border rounded-md text-xs font-mono" />
                      <button onClick={() => copy(widgetUrl)} className="px-3 bg-primary text-primary-foreground rounded-md text-xs font-bold flex items-center gap-1">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a href={widgetUrl} target="_blank" rel="noopener" className="px-3 bg-muted/50 rounded-md text-xs flex items-center"><ExternalLink className="w-3.5 h-3.5" /></a>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Embed (Notion, README, blog)</label>
                    <textarea readOnly value={embed} rows={2}
                      className="w-full mt-1 px-2 py-2 bg-input border border-border rounded-md text-xs font-mono resize-none" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={downloadImage} className="py-2 bg-muted/50 rounded-md text-xs font-mono uppercase flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> PNG
                    </button>
                    <button onClick={rotate} className="py-2 bg-muted/50 rounded-md text-xs font-mono uppercase flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Revoke
                    </button>
                    <a href={widgetUrl} target="_blank" rel="noopener" className="py-2 bg-primary/15 text-primary border border-primary/40 rounded-md text-xs font-mono uppercase flex items-center justify-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                  </div>

                  <div className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/50 pt-3 space-y-1">
                    <p><strong className="text-foreground">📱 Add to home screen:</strong> open the link on your phone, then Share → Add to Home Screen. The heatmap becomes a tile.</p>
                    <p><strong className="text-foreground">🔒 Privacy:</strong> only counts and minutes are shared. No proof content, URLs, or files.</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}