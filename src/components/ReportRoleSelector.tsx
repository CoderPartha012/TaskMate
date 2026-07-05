import React from 'react';
import { UserCog } from 'lucide-react';
import { REPORT_ROLES, ReportRole } from '../types/report.types';

interface ReportRoleSelectorProps {
  role: ReportRole;
  onChange: (role: ReportRole) => void;
}

export function ReportRoleSelector({ role, onChange }: ReportRoleSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/50" title="Simulated role — gates report actions for demo purposes only, not real security">
      <UserCog className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Viewing as</span>
      <select
        value={role}
        onChange={(e) => onChange(e.target.value as ReportRole)}
        className="bg-noir-600 border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-jade"
      >
        {REPORT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}
