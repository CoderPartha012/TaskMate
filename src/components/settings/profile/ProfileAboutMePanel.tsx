import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, User as UserIcon, Users, Building2, MapPin, Tag, X, Plus } from 'lucide-react';
import { UserProfile } from '../../../store/userProfileStore';

const TEAM_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-amber-500/20 text-amber-400',
  'bg-jade/20 text-jade',
  'bg-red-500/20 text-red-400',
];

interface RowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function Row({ icon: Icon, label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs text-white/50">
        <Icon className="w-3.5 h-3.5 text-white/25" aria-hidden="true" />
        {label}
      </span>
      <span className="text-xs font-semibold text-white/75 text-right truncate max-w-[140px]">{value}</span>
    </div>
  );
}

interface ProfileAboutMePanelProps {
  draft: UserProfile;
  joinedAt: string;
  teams: string[];
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export function ProfileAboutMePanel({ draft, joinedAt, teams, skills, onAddSkill, onRemoveSkill }: ProfileAboutMePanelProps) {
  const [skillInput, setSkillInput] = useState('');
  const visibleTeams = teams.slice(0, 3);
  const extraTeams = teams.length - visibleTeams.length;

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    onAddSkill(skillInput.trim());
    setSkillInput('');
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5 space-y-4">
      <h3 className="font-display font-bold text-sm text-white">About Me</h3>

      <div className="space-y-2.5">
        <Row icon={Calendar} label="Member since" value={format(new Date(joinedAt), 'MMM d, yyyy')} />
        <Row icon={UserIcon} label="Role" value={draft.jobTitle || '—'} />
        <Row icon={Users} label="Reports to" value={draft.manager || '—'} />
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs text-white/50">
            <Users className="w-3.5 h-3.5 text-white/25" aria-hidden="true" />
            Teams
          </span>
          <div className="flex items-center -space-x-1.5">
            {visibleTeams.map((team, i) => (
              <span
                key={team}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-noir-700 ${TEAM_COLORS[i % TEAM_COLORS.length]}`}
              >
                {team.slice(0, 3)}
              </span>
            ))}
            {extraTeams > 0 && (
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-noir-700 bg-white/10 text-white/50">
                +{extraTeams}
              </span>
            )}
          </div>
        </div>
        <Row icon={Building2} label="Department" value={draft.department || '—'} />
        <Row icon={MapPin} label="Office" value={draft.officeLocation || '—'} />
      </div>

      <div>
        <span className="flex items-center gap-2 text-xs text-white/50 mb-2">
          <Tag className="w-3.5 h-3.5 text-white/25" aria-hidden="true" />
          Skills
        </span>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {skills.map((skill) => (
              <span key={skill} className="group flex items-center gap-1 text-[11px] font-semibold text-jade bg-jade/10 border border-jade/20 rounded-full px-2.5 py-1">
                {skill}
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="text-jade/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
            placeholder="Add a skill…"
            aria-label="Add a skill"
            className="flex-1 min-w-0 rounded-lg bg-noir-600 text-white/80 text-xs px-2.5 py-1.5 border border-white/[0.08] focus:border-jade focus:outline-none transition-colors placeholder:text-white/25"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            disabled={!skillInput.trim()}
            aria-label="Add skill"
            className="p-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
