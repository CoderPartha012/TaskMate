import React from 'react';
import { format } from 'date-fns';
import { OrgMembersSummary } from '../../../store/organizationStore';

interface OrgMembersSummarySectionProps {
  members: OrgMembersSummary;
  onViewAll: () => void;
}

export function OrgMembersSummarySection({ members, onViewAll }: OrgMembersSummarySectionProps) {
  const stats: { label: string; value: number; colorClass: string }[] = [
    { label: 'Total Users', value: members.totalUsers, colorClass: 'text-white' },
    { label: 'Admins', value: members.admins, colorClass: 'text-jade' },
    { label: 'Managers', value: members.managers, colorClass: 'text-blue-400' },
    { label: 'Employees', value: members.employees, colorClass: 'text-purple-400' },
    { label: 'Guests', value: members.guests, colorClass: 'text-amber-400' },
    { label: 'Pending Invitations', value: members.pendingInvitations, colorClass: 'text-red-500' },
  ];

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Organization Members</h3>

      <div className="flex flex-wrap gap-1 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-start gap-1 px-3.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{stat.label}</span>
            <span className={`text-xl font-bold font-display leading-none ${stat.colorClass}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Latest Members</p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Name</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Department</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Role</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.latest.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.03] transition-colors text-xs">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-jade/15 text-jade flex items-center justify-center text-[10px] font-bold shrink-0">
                      {member.name.split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <span className="font-semibold text-white/80">{member.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-white/50">{member.department}</td>
                <td className="px-3 py-2.5 text-white/50">{member.role}</td>
                <td className="px-3 py-2.5 text-white/40 whitespace-nowrap">{format(new Date(member.joinedDate), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="text-xs font-semibold text-jade hover:text-jade-light transition-colors"
      >
        View All Users
      </button>
    </div>
  );
}
