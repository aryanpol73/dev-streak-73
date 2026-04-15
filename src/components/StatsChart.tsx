import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getChartData } from '@/lib/store';

interface StatsChartProps {
  refreshKey: number;
}

export function StatsChart({ refreshKey }: StatsChartProps) {
  const data = getChartData(14);

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">14-Day Overview</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="studiedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wastedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(0, 0%, 63%)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(0, 0%, 63%)' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 10%)',
                border: '1px solid hsl(0, 0%, 20%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="studied" stroke="hsl(152, 100%, 50%)" fill="url(#studiedGrad)" strokeWidth={2} name="Studied (hrs)" />
            <Area type="monotone" dataKey="wasted" stroke="hsl(0, 84%, 60%)" fill="url(#wastedGrad)" strokeWidth={2} name="Wasted (hrs)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
