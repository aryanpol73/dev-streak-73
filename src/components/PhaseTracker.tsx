import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { getPhases, toggleTopic, getPhaseProgress, type Phase } from '@/lib/store';

interface PhaseTrackerProps {
  onUpdate: () => void;
}

export function PhaseTracker({ onUpdate }: PhaseTrackerProps) {
  const [phases, setPhases] = useState(getPhases);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (phaseId: string, topicIndex: number) => {
    const updated = toggleTopic(phaseId, topicIndex);
    setPhases(updated);
    onUpdate();
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Roadmap Phases</h3>
      <div className="space-y-2">
        {phases.map((phase) => {
          const progress = getPhaseProgress(phase);
          const isExpanded = expandedId === phase.id;
          return (
            <div key={phase.id} className="rounded-xl overflow-hidden border border-border/50">
              <button
                onClick={() => setExpandedId(isExpanded ? null : phase.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-foreground">{phase.name}</div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono text-primary tabular-nums">{progress}%</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1">
                      {phase.topics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => handleToggle(phase.id, i)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className={`text-sm ${topic.completed ? 'text-primary line-through opacity-70' : 'text-foreground'}`}>
                            {topic.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
