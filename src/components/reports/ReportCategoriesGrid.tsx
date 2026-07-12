import React from 'react';
import { FileText, LayoutTemplate } from 'lucide-react';
import { REPORT_CATEGORIES, REPORT_TEMPLATES } from '../../types/report.types';

interface ReportCategoriesGridProps {
  onSelect: (name: string, category: string) => void;
}

export function ReportCategoriesGrid({ onSelect }: ReportCategoriesGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(REPORT_CATEGORIES).map(([group, reports]) => (
          <div key={group} className="bg-noir-700 border border-white/[0.06] rounded-xl p-4">
            <p className="font-display font-bold text-xs text-white/70 uppercase tracking-wide mb-3">{group}</p>
            <ul className="space-y-1">
              {reports.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => onSelect(name, group)}
                    className="w-full flex items-center gap-2 text-left text-xs text-white/55 hover:text-jade px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-4">
        <p className="font-display font-bold text-xs text-white/70 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5 text-jade" />
          Report Templates
        </p>
        <div className="flex flex-wrap gap-2">
          {REPORT_TEMPLATES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name, 'Template')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/[0.08] text-white/60 hover:text-jade hover:border-jade/30 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
