import { useMemo, useState } from 'react';
import { format, parseISO, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { getActivityHeatmap, getStreak } from '@/lib/store';

export function ActivityHeatmap({ refreshKey }: { refreshKey: number }) {
  const data = useMemo(() => getActivityHeatmap(), [refreshKey]);
  const streak = useMemo(() => getStreak(), [refreshKey]);
  const [hover, setHover] = useState<typeof data[0] | null>(null);

  // Build 12 columns × 7 rows (Mon-Sun)
  const weeks: typeof data[] = [];
  let current: typeof data = [];
  data.forEach(day => {
    const dow = (getDay(parseISO(day.date)) + 6) % 7; // Mon=0
    if (current.length === 0 && dow > 0) {
      for (let i = 0; i < dow; i++) current.push({ date: '', count: 0, minutes: 0 });
    }
    current.push(day);
    if (current.length === 7) { weeks.push(current); current = []; }
  });
  if (current.length) {
    while (current.length < 7) current.push({ date: '', count: 0, minutes: 0 });
    weeks.push(current);
  }

  const intensity = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/55';
    return 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]';
  };

  const totalSubs = data.reduce((s, d) => s + d.count, 0);
  const totalMins = data.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" /> Activity (last 12 weeks)
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {totalSubs} submissions · {Math.round(totalMins / 60)}h logged
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-display font-bold text-primary streak-pulse">{streak.current}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</div>
          </div>
          <div className="text-right border-l border-border/50 pl-3">
            <div className="text-2xl font-display font-bold text-foreground">{streak.longest}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Best</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <motion.div
                  key={`${wi}-${di}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.003 }}
                  onMouseEnter={() => day.date && setHover(day)}
                  onMouseLeave={() => setHover(null)}
                  className={`w-3.5 h-3.5 rounded-sm ${intensity(day.count)} ${day.date ? 'cursor-pointer' : 'opacity-30'} transition-all hover:ring-1 hover:ring-primary`}
                  title={day.date ? `${day.date}: ${day.count} subs, ${day.minutes}min` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span className="h-4">{hover && `${format(parseISO(hover.date), 'MMM d')} — ${hover.count} sub${hover.count === 1 ? '' : 's'}, ${hover.minutes}min`}</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${intensity(n)}`} />)}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
