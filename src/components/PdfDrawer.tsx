import { BookOpen } from 'lucide-react';

export function PdfDrawer() {
  return (
    <a href="/roadmap.pdf" target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition">
      <BookOpen className="w-3.5 h-3.5" /> Roadmap PDF
    </a>
  );
}
