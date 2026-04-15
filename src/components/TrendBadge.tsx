import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendBadgeProps {
  trend: 'improving' | 'declining' | 'stable';
  weeklyAvg: number;
}

export function TrendBadge({ trend, weeklyAvg }: TrendBadgeProps) {
  const config = {
    improving: { icon: TrendingUp, text: 'Improving', color: 'text-success bg-success/10' },
    declining: { icon: TrendingDown, text: 'Declining', color: 'text-danger bg-danger/10' },
    stable: { icon: Minus, text: 'Stable', color: 'text-muted-foreground bg-muted/50' },
  }[trend];

  const Icon = config.icon;

  return (
    <div className="glass-card p-6 flex flex-col gap-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weekly Avg</span>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-mono font-bold text-foreground tabular-nums">{weeklyAvg}</span>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.text}
        </div>
      </div>
    </div>
  );
}
