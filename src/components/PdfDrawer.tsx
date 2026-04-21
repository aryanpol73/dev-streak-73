import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Download } from 'lucide-react';

export function PdfDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition">
        <BookOpen className="w-3.5 h-3.5" /> Roadmap PDF
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-5xl h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-[var(--neon-glow-strong)]">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold">AI Product Developer Roadmap</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href="/roadmap.pdf" download className="p-2 rounded-md hover:bg-muted/50 transition" title="Download">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-muted/50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <iframe src="/roadmap.pdf" className="flex-1 w-full bg-muted" title="Roadmap" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
