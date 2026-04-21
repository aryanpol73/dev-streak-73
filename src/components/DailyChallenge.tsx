import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Lock, CheckCircle2, AlertCircle, Code2 as Code2 as Github, Link2, FileText, Code2 } from 'lucide-react';
import { getTodayChallenge, addSubmission, getTodaySubmissions, type DailySubmission } from '@/lib/store';
import { toast } from 'sonner';

interface Props { onSubmit: () => void; }

export function DailyChallenge({ onSubmit }: Props) {
  const challenge = getTodayChallenge();
  const todaySubs = getTodaySubmissions();
  const [open, setOpen] = useState(false);
  const [proofType, setProofType] = useState<DailySubmission['proofType']>('commit');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [leetcode, setLeetcode] = useState(0);
  const [difficulty, setDifficulty] = useState<DailySubmission['difficulty']>('medium');

  if (!challenge) {
    return (
      <div className="glass-card p-8 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
        <h3 className="font-display text-xl">All topics in active phase complete!</h3>
        <p className="text-sm text-muted-foreground">Move to the next phase or ship a project.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addSubmission({
      date: new Date().toISOString().slice(0, 10),
      challengeId: challenge.topic.id,
      challengeName: challenge.topic.name,
      phaseNumber: challenge.phase.number,
      minutesStudied: minutes,
      proofType,
      proofUrl: proofUrl || undefined,
      proofNotes,
      leetcodeProblems: leetcode,
      difficulty,
    });
    if (!result.ok) { toast.error(result.error || 'Submission rejected'); return; }
    toast.success(result.submission?.verified ? '✅ Verified submission' : '📝 Submitted (low proof)');
    setOpen(false); setProofUrl(''); setProofNotes(''); setMinutes(60); setLeetcode(0);
    onSubmit();
  };

  const completedToday = todaySubs.some(s => s.challengeId === challenge.topic.id);
  const charsLeft = 80 - proofNotes.trim().length;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-border/40 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-mono">
            <Target className="w-4 h-4" /> Today's Challenge
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-muted/50 border border-border/50">
            PHASE {challenge.phase.number} · WK {challenge.phase.weekStart}-{challenge.phase.weekEnd}
          </span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {challenge.topic.name}
        </h2>
        <p className="text-xs text-muted-foreground mt-2 font-mono">{challenge.sectionTitle}</p>
      </div>

      {!open ? (
        <div className="p-6 space-y-4">
          {completedToday ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm">Submitted today. Come back tomorrow.</span>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <Lock className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div className="text-xs text-foreground/80">
                <strong>No cheating.</strong> You must submit proof: a GitHub commit URL, deployed link, or detailed notes (≥80 chars). Self-reported hours alone don't count.
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-[var(--neon-glow-strong)] transition-all flex items-center justify-center gap-2"
          >
            <Code2 className="w-4 h-4" /> Submit Proof of Work
          </button>
        </div>
      ) : (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-4">
          {/* Proof type */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Proof Type</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { v: 'commit', icon: Code2 as Github, label: 'Commit' },
                { v: 'deploy', icon: Link2, label: 'Deploy' },
                { v: 'leetcode', icon: Code2, label: 'LeetCode' },
                { v: 'notes', icon: FileText, label: 'Notes' },
              ] as const).map(({ v, icon: Icon, label }) => (
                <button key={v} type="button" onClick={() => setProofType(v)}
                  className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                    proofType === v ? 'bg-primary/20 border-primary text-primary' : 'bg-input border-border text-muted-foreground hover:border-primary/40'
                  }`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          {(proofType === 'commit' || proofType === 'deploy') && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {proofType === 'commit' ? 'GitHub commit / PR URL' : 'Deployed URL'} <span className="text-destructive">*</span>
              </label>
              <input type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                placeholder={proofType === 'commit' ? 'https://github.com/you/repo/commit/...' : 'https://your-app.vercel.app'}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/60" required />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Minutes</label>
              <input type="number" min={15} max={720} value={minutes} onChange={e => setMinutes(+e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/60" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">LeetCode</label>
              <input type="number" min={0} max={20} value={leetcode} onChange={e => setLeetcode(+e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/60" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/60">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
              <span>What did you actually do? (min 80 chars) <span className="text-destructive">*</span></span>
              <span className={`font-mono ${charsLeft > 0 ? 'text-warning' : 'text-primary'}`}>
                {charsLeft > 0 ? `${charsLeft} more` : `${proofNotes.trim().length} chars ✓`}
              </span>
            </label>
            <textarea value={proofNotes} onChange={e => setProofNotes(e.target.value)} rows={4}
              placeholder="Built the JWT refresh token endpoint. Tested with Postman. Stored refresh tokens in MySQL with expiry. Handled rotation on refresh. Committed to feat/jwt branch."
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/60 resize-none" required />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-3 bg-muted/50 text-foreground font-medium rounded-lg hover:bg-muted transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-[var(--neon-glow-strong)] transition flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Submit
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
