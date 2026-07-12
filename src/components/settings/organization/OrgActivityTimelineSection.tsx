import React from 'react';
import { format } from 'date-fns';
import {
  Building2, UserPlus, Palette, Globe2, Clock3, CalendarCheck, HardDrive, Pencil,
} from 'lucide-react';
import { OrgActivityEntry } from '../../../store/organizationStore';

function getActivityIcon(message: string): { icon: React.ComponentType<{ className?: string }>; color: string } {
  const lower = message.toLowerCase();
  if (lower.includes('logo')) return { icon: Palette, color: 'text-purple-400' };
  if (lower.includes('color')) return { icon: Palette, color: 'text-purple-400' };
  if (lower.includes('timezone')) return { icon: Globe2, color: 'text-blue-400' };
  if (lower.includes('name')) return { icon: Building2, color: 'text-jade' };
  if (lower.includes('member') || lower.includes('joined') || lower.includes('invit')) return { icon: UserPlus, color: 'text-blue-400' };
  if (lower.includes('holiday')) return { icon: CalendarCheck, color: 'text-amber-400' };
  if (lower.includes('storage')) return { icon: HardDrive, color: 'text-jade' };
  if (lower.includes('workspace url')) return { icon: Clock3, color: 'text-amber-400' };
  return { icon: Pencil, color: 'text-white/50' };
}

interface OrgActivityTimelineSectionProps {
  entries: OrgActivityEntry[];
}

export function OrgActivityTimelineSection({ entries }: OrgActivityTimelineSectionProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Activity Timeline</h3>

      {entries.length === 0 ? (
        <p className="text-xs text-white/30">No activity yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-1 bottom-1 w-px bg-white/[0.08]" aria-hidden="true" />
          <ul className="space-y-5">
            {entries.map((entry) => {
              const { icon: Icon, color } = getActivityIcon(entry.message);
              return (
                <li key={entry.id} className="relative pl-9">
                  <span className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full bg-noir-600 border border-white/[0.08] flex items-center justify-center z-10">
                    <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />
                  </span>
                  <p className="text-xs text-white/80">
                    <span className="font-semibold text-white/90">{entry.user}</span> — {entry.message}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">{format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
