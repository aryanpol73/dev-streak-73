import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ShieldCheck, ShieldAlert, GitBranch as Github, Link2, FileText, Code2, Clock, Paperclip, X } from 'lucide-react';
import { getSubmissions } from '@/lib/store';

const ICONS = { commit: Github, deploy: Link2, leetcode: Code2, notes: FileText };

export function SubmissionFeed({ refreshKey }: { refreshKey: number }) {
  const subs = useMemo(() => getSubmissions().slice(-15).reverse(), [refreshKey]);
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);

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
                      {s.attachments && s.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-primary"><Paperclip className="w-3 h-3" />{s.attachments.length}</span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{s.proofNotes}</p>
                    {s.proofUrl && (
                      <a href={s.proofUrl} target="_blank" rel="noreferrer"
                        className="text-[10px] font-mono text-primary hover:underline mt-1 inline-block truncate max-w-full">
                        {s.proofUrl}
                      </a>
                    )}
                    {s.attachments && s.attachments.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {s.attachments.map(a => (
                          a.kind === 'image' ? (
                            <button key={a.id} type="button" onClick={() => setPreview({ src: a.dataUrl, name: a.name })}>
                              <img src={a.dataUrl} alt={a.name} className="w-12 h-12 object-cover rounded border border-border hover:border-primary transition" />
                            </button>
                          ) : (
                            <a key={a.id} href={a.dataUrl} download={a.name}
                              className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted/30 text-[10px] font-mono hover:border-primary hover:text-primary transition">
                              {a.kind === 'code' ? <Code2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              <span className="truncate max-w-[100px]">{a.name}</span>
                            </a>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {preview && (
        <div onClick={() => setPreview(null)} className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6">
          <button className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-muted/70"><X className="w-5 h-5" /></button>
          <img src={preview.src} alt={preview.name} className="max-w-full max-h-full rounded-lg border border-primary/40" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
