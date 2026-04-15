import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Send, Zap } from 'lucide-react';
import { addLog, getPhases } from '@/lib/store';

interface QuickLogFormProps {
  onLogged: () => void;
}

export function QuickLogForm({ onLogged }: QuickLogFormProps) {
  const phases = getPhases();
  const [hours, setHours] = useState('');
  const [topic, setTopic] = useState('');
  const [phase, setPhase] = useState(phases[0]?.name || '');
  const [wasted, setWasted] = useState('');
  const [focus, setFocus] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [discipline, setDiscipline] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !topic) return;

    addLog({
      date: format(new Date(), 'yyyy-MM-dd'),
      hoursStudied: parseFloat(hours),
      topicsCovered: topic,
      phase,
      wastedHours: parseFloat(wasted) || 0,
      focusRating: focus,
      energyRating: energy,
      disciplineRating: discipline,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setHours('');
      setTopic('');
      setWasted('');
      setFocus(3);
      setEnergy(3);
      setDiscipline(3);
      onLogged();
    }, 1000);
  };

  if (submitted) {
    return (
      <motion.div
        className="glass-card p-8 flex flex-col items-center justify-center gap-3"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Zap className="w-12 h-12 text-primary" />
        </motion.div>
        <span className="text-lg font-semibold text-primary">Logged!</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" /> Quick Log
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Hours Studied</label>
          <input
            type="number" step="0.5" min="0" max="16"
            value={hours} onChange={e => setHours(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground font-mono text-lg focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Wasted (hrs)</label>
          <input
            type="number" step="0.5" min="0" max="16"
            value={wasted} onChange={e => setWasted(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground font-mono text-lg focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Topic Covered</label>
        <input
          type="text" value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Neural Networks"
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          required
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Phase</label>
        <select
          value={phase} onChange={e => setPhase(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        >
          {phases.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-muted-foreground block">Self Rating</label>
        {[
          { label: 'Focus', value: focus, set: setFocus },
          { label: 'Energy', value: energy, set: setEnergy },
          { label: 'Discipline', value: discipline, set: setDiscipline },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16">{label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n} type="button"
                  onClick={() => set(n)}
                  className={`w-8 h-8 rounded-md text-xs font-semibold transition-all ${
                    n <= value
                      ? 'bg-primary/20 border border-primary/50 text-primary'
                      : 'bg-input border border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-[var(--neon-glow)]"
      >
        <Send className="w-4 h-4" /> Log Entry
      </motion.button>
    </form>
  );
}
