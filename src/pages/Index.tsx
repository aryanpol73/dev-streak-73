import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { ScoreRing } from '@/components/ScoreRing';
import { StreakDisplay } from '@/components/StreakDisplay';
import { QuickLogForm } from '@/components/QuickLogForm';
import { PhaseTracker } from '@/components/PhaseTracker';
import { NudgePanel } from '@/components/NudgePanel';
import { StatsChart } from '@/components/StatsChart';
import { WastedTimeInsights } from '@/components/WastedTimeInsights';
import { WeeklyReflection } from '@/components/WeeklyReflection';
import { TrendBadge } from '@/components/TrendBadge';
import {
  getTodayLog,
  getStreak,
  getWeeklyAverage,
  getScoreTrend,
  getNudges,
  getOverallProgress,
} from '@/lib/store';

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const todayLog = getTodayLog();
  const streak = getStreak();
  const weeklyAvg = getWeeklyAverage();
  const trend = getScoreTrend();
  const nudges = getNudges();
  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Top bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-primary text-lg tracking-tight glow-text">DEVSTREAK</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Overall: <span className="text-primary font-mono font-semibold">{overallProgress}%</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card p-6 flex items-center justify-center">
            <ScoreRing score={todayLog?.score || 0} />
          </div>
          <StreakDisplay current={streak.current} longest={streak.longest} isAtRisk={streak.isAtRisk} />
          <TrendBadge trend={trend} weeklyAvg={weeklyAvg} />
        </motion.div>

        {/* Nudges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <NudgePanel nudges={nudges} />
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickLogForm onLogged={refresh} />
            <WeeklyReflection />
          </motion.div>

          {/* Right column */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatsChart refreshKey={refreshKey} />
            <WastedTimeInsights refreshKey={refreshKey} />
            <PhaseTracker onUpdate={refresh} />
          </motion.div>
        </div>
      </main>

      {/* Neon line footer */}
      <div className="mt-12 neon-line" />
      <footer className="text-center py-6 text-xs text-muted-foreground">
        Built for discipline. Powered by consistency.
      </footer>
    </div>
  );
};

export default Index;
