import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { format, parseISO, getDay, subDays } from 'date-fns';
import { Activity, Flame, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Day { date: string; count: number; minutes: number }

export default function Widget() {
  const { publicId } = useParams<{ publicId: string }>();
  const [params] = useSearchParams();
  const range = (params.get('range') as 'month' | 'year') || 'month';
  const [days, setDays] = useState<Day[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) return;
    (async () => {
      const { data: tok } = await supabase.from('widget_tokens').select('user_id').eq('public_id', publicId).maybeSingle();
      if (!tok) { setError('Widget link not found.'); return; }
      const since = subDays(new Date(), range === 'year' ? 365 : 30);
      const { data: subs } = await supabase
        .from('submissions')
        .select('date, minutes_studied')
        .eq('user_id', tok.user_id)
        .gte('date', format(since, 'yyyy-MM-dd'));
      const lookup = new Map<string, { count: number; minutes: number }>();
      (subs || []).forEach((s: any) => {
        const cur = lookup.get(s.date) || { count: 0, minutes: 0 };
        cur.count += 1; cur.minutes += s.minutes_studied || 0;
        lookup.set(s.date, cur);
      });
      const total = range === 'year' ? 365 : 30;
      const out: Day[] = [];
      for (let i = total - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const v = lookup.get(d) || { count: 0, minutes: 0 };
        out.push({ date: d, ...v });
      }
      setDays(out);
    })();
  }, [publicId, range]);

  const streak = useMemo(() => {
    if (!days) return 0;
    let s = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) s++; else break;
    }
    return s;
  }, [days]);

  const totalSubs = days?.reduce((a, d) => a + d.count, 0) ?? 0;
  const totalMins = days?.reduce((a, d) => a + d.minutes, 0) ?? 0;

  const intensity = (c: number) => {
    if (c === 0) return 'bg-muted/30';
    if (c === 1) return 'bg-primary/30';
    if (c === 2) return 'bg-primary/55';
    return 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]';
  };

  // Build week grid
  const weeks = useMemo(() => {
    if (!days) return [];
    const w: Day[][] = [];
    let cur: Day[] = [];
    days.forEach(day => {
      const dow = (getDay(parseISO(day.date)) + 6) % 7;
      if (cur.length === 0 && dow > 0) for (let i = 0; i < dow; i++) cur.push({ date: '', count: 0, minutes: 0 });
      cur.push(day);
      if (cur.length === 7) { w.push(cur); cur = []; }
    });
    if (cur.length) { while (cur.length < 7) cur.push({ date: '', count: 0, minutes: 0 }); w.push(cur); }
    return w;
  }, [days]);

  return (
    <div className="min-h-screen bg-background bg-grid p-4 flex items-center justify-center">
      <div className="glass-card p-5 sm:p-6 w-full max-w-3xl space-y-4" id="widget-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-mono font-bold text-primary text-sm tracking-tight glow-text">DEVSTREAK</span>
            <span className="text-[10px] font-mono text-muted-foreground border-l border-border/50 pl-2 ml-1">
              {range === 'year' ? '12 MONTHS' : '30 DAYS'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-xl font-display font-bold text-primary streak-pulse flex items-center gap-1 justify-end">
                <Flame className="w-4 h-4" />{streak}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Streak</div>
            </div>
            <div className="border-l border-border/50 pl-3">
              <div className="text-xl font-display font-bold">{totalSubs}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Logs</div>
            </div>
            <div className="border-l border-border/50 pl-3 hidden sm:block">
              <div className="text-xl font-display font-bold">{Math.round(totalMins / 60)}h</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Time</div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!days && !error && <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}

        {days && (
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-[3px] min-w-fit">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <div key={`${wi}-${di}`}
                      className={`${range === 'year' ? 'w-2.5 h-2.5' : 'w-4 h-4'} rounded-sm ${intensity(day.count)} ${day.date ? '' : 'opacity-30'}`}
                      title={day.date ? `${day.date}: ${day.count} logs · ${day.minutes}min` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>Proof of work · live</span>
          <a href="/" className="hover:text-primary">devstreak →</a>
        </div>
      </div>
    </div>
  );
}