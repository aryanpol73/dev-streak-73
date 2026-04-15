import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

interface StreakDisplayProps {
  current: number;
  longest: number;
  isAtRisk: boolean;
}

export function StreakDisplay({ current, longest, isAtRisk }: StreakDisplayProps) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</span>
        {isAtRisk && (
          <motion.span
            className="text-xs font-semibold text-warning px-2 py-0.5 rounded-full bg-warning/10"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            AT RISK
          </motion.span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <motion.div
          animate={current > 0 ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-8 h-8 text-primary" />
        </motion.div>
        <span className="text-4xl font-mono font-bold text-primary streak-pulse tabular-nums">{current}</span>
        <span className="text-sm text-muted-foreground">days</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="w-4 h-4" />
        <span>Best: <span className="text-foreground font-semibold">{longest}</span></span>
      </div>
    </div>
  );
}
