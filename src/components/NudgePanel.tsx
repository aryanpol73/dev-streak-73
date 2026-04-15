import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface NudgePanelProps {
  nudges: string[];
}

export function NudgePanel({ nudges }: NudgePanelProps) {
  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" /> Coach Says
      </h3>
      <div className="space-y-2">
        {nudges.map((nudge, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="p-3 rounded-lg bg-muted/30 border-l-2 border-primary/60 text-sm text-foreground/80"
          >
            {nudge}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
