import React from 'react';
import { UserCog } from 'lucide-react';

interface ReportRoleSelectorProps {
  roles: { id: string; name: string }[];
  currentRoleId: string;
  onChange: (id: string) => void;
}

export function ReportRoleSelector({ roles, currentRoleId, onChange }: ReportRoleSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/50" title="Simulated role — gates report actions for demo purposes only, not real security">
      <UserCog className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Viewing as</span>
      <select
        value={currentRoleId}
        onChange={(e) => onChange(e.target.value)}
        className="bg-noir-600 border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-jade"
      >
        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
    </div>
  );
}
