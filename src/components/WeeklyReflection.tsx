import { useState } from 'react';
import { format, startOfWeek } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';
import { addReflection, getReflections } from '@/lib/store';

export function WeeklyReflection() {
  const [isOpen, setIsOpen] = useState(false);
  const [well, setWell] = useState('');
  const [failed, setFailed] = useState('');
  const [improve, setImprove] = useState('');
  const [reflections, setReflections] = useState(getReflections);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReflection({
      weekStart: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      whatWentWell: well,
      whatFailed: failed,
      improvement: improve,
    });
    setWell('');
    setFailed('');
    setImprove('');
    setReflections(getReflections());
  };

  return (
    <div className="glass-card p-6 space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Weekly Reflection
        </h3>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              {[
                { label: 'What went well?', value: well, set: setWell, color: 'text-success' },
                { label: 'What failed?', value: failed, set: setFailed, color: 'text-danger' },
                { label: 'What will you improve?', value: improve, set: setImprove, color: 'text-primary' },
              ].map(({ label, value, set, color }) => (
                <div key={label}>
                  <label className={`text-xs ${color} mb-1 block`}>{label}</label>
                  <textarea
                    value={value}
                    onChange={e => set(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all"
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2 bg-primary/20 text-primary border border-primary/30 font-medium rounded-lg text-sm hover:bg-primary/30 transition-all"
              >
                Save Reflection
              </button>
            </form>

            {reflections.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-xs text-muted-foreground">Previous</span>
                {reflections.slice(-3).reverse().map(r => (
                  <div key={r.id} className="p-3 bg-muted/20 rounded-lg text-xs space-y-1">
                    <span className="text-muted-foreground">{r.weekStart}</span>
                    <p className="text-foreground/70">✅ {r.whatWentWell}</p>
                    <p className="text-foreground/70">❌ {r.whatFailed}</p>
                    <p className="text-foreground/70">🔄 {r.improvement}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
