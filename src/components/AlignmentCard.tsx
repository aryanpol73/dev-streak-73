import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Target, Clock, Zap } from 'lucide-react';
import { getRoadmapAlignment, setStartDate, getStartDate, getWeeklyStats, getTotalLeetcode } from '@/lib/store';

export function AlignmentCard({ refreshKey }: { refreshKey: number }) {
  const [start, setStart] = useState<string | null>(null);
  const [input, setInput] = useState('');
  useEffect(() => { setStart(getStartDate()); }, [refreshKey]);

  const align = getRoadmapAlignment();
  const week = getWeeklyStats();
  const totalLC = getTotalLeetcode();

  if (!start) {
    return (
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-mono">
          <Calendar className="w-4 h-4" /> Set Start Date
        </div>
        <p className="text-xs text-muted-foreground">When did you / will you start the 14-month roadmap?</p>
        <div className="flex gap-2">
          <input type="date" value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/60" />
          <button onClick={() => { if (input) { setStartDate(input); setStart(input); } }}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm">
            Lock In
          </button>
        </div>
      </div>
    );
  }

  const Icon = align && align.behindPct > 5 ? TrendingDown : TrendingUp;
  const color = !align ? 'text-muted-foreground' : align.onTrack ? 'text-primary' : align.behindPct > 15 ? 'text-destructive' : 'text-warning';

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-muted-foreground">
          <Target className="w-3.5 h-3.5" /> Roadmap Alignment
        </div>
        {align && <Icon className={`w-4 h-4 ${color}`} />}
      </div>

      {align && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Week</div>
              <div className="font-display text-2xl font-bold text-foreground">{align.currentWeek}<span className="text-sm text-muted-foreground">/48</span></div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Expected</div>
              <div className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>P{align.expectedPhaseNumber}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Actual {align.actualPct}%</span>
              <span>Expected {align.expectedPct}%</span>
            </div>
            <div className="relative h-2 bg-muted/40 rounded-full overflow-hidden">
              <div className="absolute h-full bg-foreground/30 rounded-full" style={{ width: `${align.expectedPct}%` }} />
              <div className="absolute h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.6)]" style={{ width: `${align.actualPct}%` }} />
            </div>
            <p className={`text-xs ${color} font-mono`}>
              {align.behindPct <= 0 ? `🚀 ${Math.abs(align.behindPct)}% AHEAD` :
               align.behindPct <= 5 ? '✅ On track' :
               `⚠ ${align.behindPct}% behind schedule`}
            </p>
          </div>

          {/* Prediction */}
          {align.predictedFinishMonths !== null && (
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                <Zap className="w-3 h-3" /> Pace Prediction
              </div>
              <p className="text-sm text-foreground leading-snug">
                At current pace, you'll finish in <span className="font-display font-bold text-primary">{align.predictedFinishMonths}</span> months
                <span className="text-muted-foreground"> (~{align.predictedFinishDays} days)</span>.
              </p>
              {align.delayDays !== null && (
                <p className={`text-[11px] font-mono ${align.delayDays > 14 ? 'text-destructive' : align.delayDays > 0 ? 'text-warning' : 'text-primary'}`}>
                  <Clock className="w-3 h-3 inline -mt-0.5" />{' '}
                  {align.delayDays > 0
                    ? `${align.delayDays} days behind 14-month target`
                    : align.delayDays < 0
                      ? `${Math.abs(align.delayDays)} days ahead of target`
                      : 'Right on the 14-month target'}
                </p>
              )}
            </div>
          )}
          {align.predictedFinishMonths === null && (
            <p className="text-[11px] text-muted-foreground font-mono italic">Log a few more days to unlock pace prediction.</p>
          )}
        </>
      )}

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40">
        <div className="text-center">
          <div className="font-display text-lg font-bold text-foreground">{week.daysActive}</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">days/wk</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg font-bold text-foreground">{Math.round(week.minutes / 60)}h</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">this wk</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg font-bold text-primary">{totalLC}</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">leetcode</div>
        </div>
      </div>
    </div>
  );
}
