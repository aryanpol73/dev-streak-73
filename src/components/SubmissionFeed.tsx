import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ShieldCheck, ShieldAlert, GitBranch as Github, Link2, FileText, Code2, Clock } from 'lucide-react';
import { getSubmissions } from '@/lib/store';

const ICONS = { commit: Github, deploy: Link2, leetcode: Code2, notes: FileText };

export function SubmissionFeed({ refreshKey }: { refreshKey: number }) {
  const subs = useMemo(() => getSubmissions().slice(-15).reverse(), [refreshKey]);

  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="font-display text-lg font-bold flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" /> Recent Submissions
      </h3>
      {subs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No submissions yet. Solve today's challenge.</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {subs.map(s => {
            const Icon = ICONS[s.proofType];
            return (
              <div key={s.id} className="p-3 rounded-lg border border-border/40 bg-muted/10 hover:border-primary/30 transition">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded ${s.verified ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{s.challengeName}</span>
                      {s.verified
                        ? <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        : <ShieldAlert className="w-3.5 h-3.5 text-warning shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground mt-0.5">
                      <span>{format(parseISO(s.date), 'MMM dd')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.minutesStudied}min</span>
                      <span>P{s.phaseNumber}</span>
                      {s.leetcodeProblems > 0 && <span className="text-primary">+{s.leetcodeProblems} LC</span>}
                    </div>
                    <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{s.proofNotes}</p>
                    {s.proofUrl && (
                      <a href={s.proofUrl} target="_blank" rel="noreferrer"
                        className="text-[10px] font-mono text-primary hover:underline mt-1 inline-block truncate max-w-full">
                        {s.proofUrl}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
