import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle, Rocket, ExternalLink, Github } from 'lucide-react';
import { getPhases, toggleTopic, updateProject, getPhaseProgress } from '@/lib/store';
import { toast } from 'sonner';

export function RoadmapView({ refreshKey, onUpdate }: { refreshKey: number; onUpdate: () => void }) {
  const phases = getPhases();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {phases.map(phase => {
        const prog = getPhaseProgress(phase);
        const isOpen = expanded === phase.id;
        return (
          <div key={phase.id} className="glass-card overflow-hidden">
            <button onClick={() => setExpanded(isOpen ? null : phase.id)}
              className="w-full p-5 flex items-center gap-4 hover:bg-muted/20 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold shrink-0 text-sm"
                style={{ background: `hsl(${phase.color} / 0.18)`, color: `hsl(${phase.color})`, boxShadow: `0 0 20px hsl(${phase.color} / 0.2)` }}>
                P{phase.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-foreground truncate">{phase.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                    WK {phase.weekStart}-{phase.weekEnd}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{phase.focus}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: `hsl(${phase.color})` }}
                      initial={{ width: 0 }} animate={{ width: `${prog.pct}%` }} transition={{ duration: 0.6 }} />
                  </div>
                  <span className="text-xs font-mono tabular-nums shrink-0" style={{ color: `hsl(${phase.color})` }}>
                    {prog.topicsDone}/{prog.topicsTotal}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="px-5 pb-5 space-y-5 border-t border-border/40 pt-4">
                    <div className="text-xs text-muted-foreground italic">🎯 {phase.outcome}</div>

                    {phase.sections.map((section, si) => (
                      <div key={si} className="space-y-2">
                        <h4 className="text-xs font-mono uppercase tracking-widest" style={{ color: `hsl(${phase.color})` }}>
                          {section.title}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-1">
                          {section.topics.map(topic => (
                            <button key={topic.id} onClick={() => { toggleTopic(phase.id, si, topic.id); onUpdate(); }}
                              className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/30 transition text-left group">
                              {topic.completed
                                ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: `hsl(${phase.color})` }} />
                                : <Circle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground" />}
                              <span className={`text-sm leading-snug ${topic.completed ? 'line-through opacity-60' : 'text-foreground'}`}>
                                {topic.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {phase.projects.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-mono uppercase tracking-widest" style={{ color: `hsl(${phase.color})` }}>
                          🚀 Projects to Ship
                        </h4>
                        {phase.projects.map(p => (
                          <div key={p.id} className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-foreground">{p.name}</span>
                                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                                    p.difficulty === 'Expert' ? 'bg-destructive/20 text-destructive' :
                                    p.difficulty === 'Advanced' ? 'bg-warning/20 text-warning' :
                                    'bg-primary/20 text-primary'
                                  }`}>{p.difficulty}</span>
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{p.stack}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted/50" title="Repo"><Github className="w-3.5 h-3.5" /></a>}
                                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted/50" title="Live"><ExternalLink className="w-3.5 h-3.5" /></a>}
                                <span className={`text-[10px] font-mono px-2 py-1 rounded ${
                                  p.status === 'shipped' ? 'bg-primary/20 text-primary' :
                                  p.status === 'building' ? 'bg-warning/20 text-warning' :
                                  'bg-muted text-muted-foreground'
                                }`}>{p.status === 'shipped' ? '✓ SHIPPED' : p.status === 'building' ? 'BUILDING' : 'TODO'}</span>
                              </div>
                            </div>
                            <p className="text-xs text-foreground/70">{p.description}</p>
                            <p className="text-[11px] text-primary/80 italic">★ {p.whyUnique}</p>

                            {editingProject === p.id ? (
                              <ProjectEditForm phase={phase.id} project={p} onClose={() => { setEditingProject(null); onUpdate(); }} />
                            ) : (
                              <button onClick={() => setEditingProject(p.id)}
                                className="text-[11px] font-mono text-primary hover:underline">
                                {p.status === 'shipped' ? 'Edit links' : 'Update status / add links'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ProjectEditForm({ phase, project, onClose }: { phase: string; project: any; onClose: () => void }) {
  const [status, setStatus] = useState(project.status);
  const [repoUrl, setRepoUrl] = useState(project.repoUrl || '');
  const [liveUrl, setLiveUrl] = useState(project.liveUrl || '');

  const save = () => {
    if (status === 'shipped' && !repoUrl) { toast.error('Shipped projects need a repo URL'); return; }
    updateProject(phase, project.id, { status, repoUrl: repoUrl || undefined, liveUrl: liveUrl || undefined });
    toast.success('Updated');
    onClose();
  };

  return (
    <div className="space-y-2 pt-2 border-t border-border/40">
      <div className="grid grid-cols-3 gap-2">
        {(['not-started', 'building', 'shipped'] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`text-[10px] py-1.5 rounded font-mono uppercase ${
              status === s ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-input border border-border text-muted-foreground'
            }`}>{s}</button>
        ))}
      </div>
      <input type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="GitHub repo URL"
        className="w-full px-2 py-1.5 bg-input border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/60" />
      <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="Live URL (optional)"
        className="w-full px-2 py-1.5 bg-input border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/60" />
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-1.5 text-xs bg-muted rounded">Cancel</button>
        <button onClick={save} className="flex-1 py-1.5 text-xs bg-primary text-primary-foreground rounded font-semibold flex items-center justify-center gap-1">
          <Rocket className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  );
}
