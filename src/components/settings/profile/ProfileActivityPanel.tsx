import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Image, ShieldCheck, Bell, KeyRound, UserPlus, ChevronRight } from 'lucide-react';
import { ProfileActivityEntry } from '../../../store/userProfileStore';

function getActivityVisual(message: string): { icon: React.ComponentType<{ className?: string }>; color: string } {
  const lower = message.toLowerCase();
  if (lower.includes('avatar') || lower.includes('picture')) return { icon: Image, color: 'bg-purple-500/15 text-purple-400' };
  if (lower.includes('password') || lower.includes('authentication') || lower.includes('security')) return { icon: ShieldCheck, color: 'bg-amber-500/15 text-amber-400' };
  if (lower.includes('notification')) return { icon: Bell, color: 'bg-blue-500/15 text-blue-400' };
  if (lower.includes('emergency') || lower.includes('contact')) return { icon: UserPlus, color: 'bg-jade/15 text-jade' };
  if (lower.includes('session') || lower.includes('login')) return { icon: KeyRound, color: 'bg-red-500/15 text-red-400' };
  return { icon: Pencil, color: 'bg-white/10 text-white/50' };
}

interface ProfileActivityPanelProps {
  entries: ProfileActivityEntry[];
  title?: string;
  limit?: number;
  onViewAll?: () => void;
}

export function ProfileActivityPanel({ entries, title = 'Recent Activity', limit, onViewAll }: ProfileActivityPanelProps) {
  const visible = limit ? entries.slice(0, limit) : entries;
  const hasMore = !!limit && entries.length > limit;

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-white">{title}</h3>
        {hasMore && onViewAll && (
          <button type="button" onClick={onViewAll} className="flex items-center gap-0.5 text-[11px] font-semibold text-jade hover:text-jade-light transition-colors">
            View all
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-white/30">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((entry) => {
            const { icon: Icon, color } = getActivityVisual(entry.message);
            return (
              <li key={entry.id} className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-white/80">{entry.message}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
