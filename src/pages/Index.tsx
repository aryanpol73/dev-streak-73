import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Toaster } from 'sonner';
import { DailyChallenge } from '@/components/DailyChallenge';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { RoadmapView } from '@/components/RoadmapView';
import { SubmissionFeed } from '@/components/SubmissionFeed';
import { StatusStrip } from '@/components/StatusStrip';
import { AlignmentCard } from '@/components/AlignmentCard';
import { PdfDrawer } from '@/components/PdfDrawer';
import { WeeklyReflection } from '@/components/WeeklyReflection';
import { getOverallProgress } from '@/lib/store';

const Index = () => {
  const [k, setK] = useState(0);
  const refresh = useCallback(() => setK(x => x + 1), []);
  const overall = getOverallProgress();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <Toaster theme="dark" position="top-right" richColors />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-primary text-lg tracking-tight glow-text">DEVSTREAK</span>
            <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground border-l border-border/50 pl-2 ml-1">PROOF-OF-WORK</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Roadmap: <span className="text-primary font-mono font-semibold">{overall}%</span>
            </span>
            <PdfDrawer />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DailyChallenge onSubmit={refresh} />
            <StatusStrip refreshKey={k} />
          </div>
          <div className="space-y-6">
            <AlignmentCard refreshKey={k} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ActivityHeatmap refreshKey={k} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">▸</span> 14-Month Roadmap
              </h2>
              <RoadmapView refreshKey={k} onUpdate={refresh} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="space-y-6">
            <SubmissionFeed refreshKey={k} />
            <WeeklyReflection />
          </motion.div>
        </div>
      </main>

      <div className="mt-12 neon-line" />
      <footer className="text-center py-6 text-xs text-muted-foreground font-mono">
        No fake hours. No fake progress. Only proof of work.
      </footer>
    </div>
  );
};

export default Index;
