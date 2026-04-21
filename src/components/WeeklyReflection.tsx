import { useState } from 'react';
import { format, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { NotebookPen, Save } from 'lucide-react';
import { addReflection, getReflections } from '@/lib/store';
import { toast } from 'sonner';

export function WeeklyReflection() {
  const [shipped, setShipped] = useState('');
  const [blocked, setBlocked] = useState('');
  const [next, setNext] = useState('');
  const reflections = getReflections().slice(-3).reverse();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shipped.length < 30 || next.length < 20) { toast.error('Be specific. At least 30 chars for "shipped" and 20 for "next focus".'); return; }
    addReflection({
      weekStart: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      whatShipped: shipped, whatBlocked: blocked, nextWeekFocus: next,
    });
    toast.success('Reflection saved');
    setShipped(''); setBlocked(''); setNext('');
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-display text-lg font-bold flex items-center gap-2">
        <NotebookPen className="w-5 h-5 text-primary" /> Weekly Reflection
      </h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">What did I actually ship? (commits, deploys, features)</label>
          <textarea value={shipped} onChange={e => setShipped(e.target.value)} rows={2}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/60" required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">What blocked me? (be honest, no excuses)</label>
          <textarea value={blocked} onChange={e => setBlocked(e.target.value)} rows={2}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/60" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Next week — single biggest focus</label>
          <textarea value={next} onChange={e => setNext(e.target.value)} rows={2}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/60" required />
        </div>
        <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:shadow-[var(--neon-glow)]">
          <Save className="w-4 h-4" /> Save Reflection
        </button>
      </form>
      {reflections.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-border/40">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Past Reflections</div>
          {reflections.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-1">
              <div className="font-mono text-primary">Week of {r.weekStart}</div>
              <div><span className="text-muted-foreground">Shipped: </span>{r.whatShipped}</div>
              {r.whatBlocked && <div><span className="text-muted-foreground">Blocked: </span>{r.whatBlocked}</div>}
              <div><span className="text-muted-foreground">Next: </span>{r.nextWeekFocus}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
