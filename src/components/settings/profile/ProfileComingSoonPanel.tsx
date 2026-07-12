import React from 'react';
import { Construction } from 'lucide-react';

interface ProfileComingSoonPanelProps {
  title: string;
}

export function ProfileComingSoonPanel({ title }: ProfileComingSoonPanelProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-4">{title}</h3>
      <div className="flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
        <Construction className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        This section hasn't been built yet — let me know when you'd like to configure it.
      </div>
    </div>
  );
}
