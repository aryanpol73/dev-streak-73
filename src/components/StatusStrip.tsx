import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { getHonestStatus } from '@/lib/store';

const ICONS = { good: CheckCircle2, warn: AlertTriangle, bad: XCircle };
const COLORS = {
  good: 'text-primary border-primary/40 bg-primary/10',
  warn: 'text-warning border-warning/40 bg-warning/10',
  bad: 'text-destructive border-destructive/40 bg-destructive/10',
};

export function StatusStrip({ refreshKey }: { refreshKey: number }) {
  const status = getHonestStatus();
  return (
    <div className="space-y-2">
      {status.map((s, i) => {
        const Icon = ICONS[s.tone];
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-mono ${COLORS[s.tone]}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{s.line}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
