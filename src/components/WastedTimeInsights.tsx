import { AlertTriangle } from 'lucide-react';
import { getWastedTimeInsights } from '@/lib/store';

interface Props {
  refreshKey: number;
}

export function WastedTimeInsights({ refreshKey }: Props) {
  const insights = getWastedTimeInsights();

  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" /> Wasted Time Analysis
      </h3>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <p key={i} className="text-sm text-foreground/80">{insight}</p>
        ))}
      </div>
    </div>
  );
}
