import React from 'react';
import { format } from 'date-fns';
import { UserPlus, CreditCard, LayoutGrid, Download, ChevronRight } from 'lucide-react';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30';

interface QuickInfoRowProps {
  label: string;
  value: string;
}

function QuickInfoRow({ label, value }: QuickInfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className="text-xs text-white/70 text-right truncate max-w-[140px]">{value}</span>
    </div>
  );
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onClick: () => void;
}

interface OrgHealthSidebarProps {
  healthScore: number;
  createdAt: string;
  owner: string;
  plan: string;
  totalUsers: number;
  storageUsed: string;
  timezone: string;
  country: string;
  lastModified: string;
  onInviteUsers: () => void;
  onManageBilling: () => void;
  onManageWorkspaces: () => void;
  onDownloadReport: () => void;
}

export function OrgHealthSidebar({
  healthScore, createdAt, owner, plan, totalUsers, storageUsed, timezone, country, lastModified,
  onInviteUsers, onManageBilling, onManageWorkspaces, onDownloadReport,
}: OrgHealthSidebarProps) {
  const actions: QuickAction[] = [
    { icon: UserPlus, label: 'Invite Users', description: 'Open User Management', onClick: onInviteUsers },
    { icon: CreditCard, label: 'Manage Billing', description: 'View plan and invoices', onClick: onManageBilling },
    { icon: LayoutGrid, label: 'Manage Workspaces', description: 'Create and manage workspaces', onClick: onManageWorkspaces },
    { icon: Download, label: 'Download Organization Report', description: 'Export a summary file', onClick: onDownloadReport },
  ];

  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5 text-center">
        <p className="text-xs font-bold text-white/70 mb-3">Organization Health</p>
        <div
          className="relative w-24 h-24 rounded-full mx-auto"
          style={{ background: `conic-gradient(#00C896 ${healthScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
        >
          <div className="absolute inset-[7px] rounded-full bg-noir-700 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white leading-none">{healthScore}%</span>
          </div>
        </div>
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
        <p className="text-xs font-bold text-white/70 mb-2">Quick Information</p>
        <QuickInfoRow label="Workspace Created" value={format(new Date(createdAt), 'MMM d, yyyy')} />
        <QuickInfoRow label="Owner" value={owner} />
        <QuickInfoRow label="Current Plan" value={plan} />
        <QuickInfoRow label="Total Users" value={String(totalUsers)} />
        <QuickInfoRow label="Storage" value={storageUsed} />
        <QuickInfoRow label="Timezone" value={timezone} />
        <QuickInfoRow label="Country" value={country} />
        <QuickInfoRow label="Last Modified" value={format(new Date(lastModified), 'MMM d, yyyy h:mm a')} />
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
        <p className="text-xs font-bold text-white/70 mb-3">Quick Actions</p>
        <div className="space-y-1">
          {actions.map(({ icon: Icon, label, description, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="w-full flex items-center gap-3 text-left px-2.5 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 text-jade">
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/85">{label}</p>
                <p className="text-[10px] text-white/35 truncate">{description}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/25 shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
