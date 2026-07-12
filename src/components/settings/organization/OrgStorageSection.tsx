import React from 'react';
import { HardDrive, Sparkles } from 'lucide-react';
import { OrgStorage } from '../../../store/organizationStore';

interface OrgStorageSectionProps {
  storage: OrgStorage;
  onUpgrade: () => void;
  onCleanTemporaryFiles: () => void;
}

const BREAKDOWN_COLORS = ['#00C896', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444'];

export function OrgStorageSection({ storage, onUpgrade, onCleanTemporaryFiles }: OrgStorageSectionProps) {
  const usedPercent = Math.min(100, Math.round((storage.usedGB / storage.totalGB) * 100));
  const maxBreakdown = Math.max(...storage.breakdown.map((b) => b.gb), 1);

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5 flex items-center gap-2">
        <HardDrive className="w-4 h-4 text-jade" aria-hidden="true" />
        Storage
      </h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">{storage.usedGB} GB used</span>
          <span className="text-xs text-white/40">of {storage.totalGB} GB</span>
        </div>
        <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${usedPercent > 90 ? 'bg-red-500' : usedPercent > 70 ? 'bg-amber-400' : 'bg-jade'}`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Storage Breakdown</p>
      <div className="space-y-2.5 mb-6">
        {storage.breakdown.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-white/60 w-24 shrink-0">{item.label}</span>
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(item.gb / maxBreakdown) * 100}%`, background: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] }}
              />
            </div>
            <span className="text-xs text-white/40 w-14 text-right shrink-0">{item.gb} GB</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUpgrade}
          className="text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
        >
          Upgrade Storage
        </button>
        <button
          type="button"
          onClick={onCleanTemporaryFiles}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Clean Temporary Files
        </button>
      </div>
    </div>
  );
}
