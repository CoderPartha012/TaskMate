import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../../store/userProfileStore';
import { ProfileNavKey } from './ProfileLeftNav';

interface ChecklistGroup {
  label: string;
  complete: boolean;
  navKey: ProfileNavKey;
}

interface ProfileCompletionPanelProps {
  draft: UserProfile;
  onNavigate: (key: ProfileNavKey) => void;
}

export function ProfileCompletionPanel({ draft, onNavigate }: ProfileCompletionPanelProps) {
  const groups: ChecklistGroup[] = [
    {
      label: 'Basic Information',
      complete: !!(draft.firstName && draft.lastName && draft.displayName && draft.jobTitle && draft.email),
      navKey: 'personal',
    },
    {
      label: 'Job Information',
      complete: !!(draft.department && draft.employeeId && draft.manager && draft.employmentType),
      navKey: 'personal',
    },
    {
      label: 'Contact Information',
      complete: !!(draft.phone && draft.country && draft.city && draft.address),
      navKey: 'personal',
    },
    {
      label: 'Security Setup',
      complete: false,
      navKey: 'security',
    },
  ];

  const completedCount = groups.filter((g) => g.complete).length;
  const percent = Math.round((completedCount / groups.length) * 100);
  const firstIncomplete = groups.find((g) => !g.complete);

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4">Profile Completion</h3>

      <div className="flex items-center gap-4 mb-4">
        <div
          className="relative w-20 h-20 rounded-full shrink-0"
          style={{ background: `conic-gradient(#00C896 ${percent * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
        >
          <div className="absolute inset-[6px] rounded-full bg-noir-700 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-white leading-none">{percent}%</span>
            <span className="text-[9px] text-white/30 mt-0.5">Completed</span>
          </div>
        </div>
        <p className="text-[11px] text-white/45 leading-relaxed">
          {percent === 100 ? 'Your profile is fully complete.' : 'Great job! Keep your profile updated.'}
        </p>
      </div>

      <ul className="space-y-2 mb-4">
        {groups.map((group) => (
          <li key={group.label} className="flex items-center gap-2">
            {group.complete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-jade shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-white/20 shrink-0" aria-hidden="true" />
            )}
            <span className={`text-xs ${group.complete ? 'text-white/70' : 'text-white/35'}`}>{group.label}</span>
          </li>
        ))}
      </ul>

      {firstIncomplete && (
        <button
          type="button"
          onClick={() => onNavigate(firstIncomplete.navKey)}
          className="flex items-center gap-1 text-[11px] font-semibold text-jade hover:text-jade-light transition-colors"
        >
          Complete your profile
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
