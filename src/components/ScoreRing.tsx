import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function ScoreRing({ score, size = 180, label = "Today's Score" }: ScoreRingProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="score-ring -rotate-90">
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="hsl(var(--border))" strokeWidth="6"
          />
          <motion.circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.span
            className="text-5xl font-mono font-bold text-primary glow-text tabular-nums"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>
    </div>
  );
}
