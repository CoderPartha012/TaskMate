import React from 'react';
import { format } from 'date-fns';
import { ShieldCheck, KeyRound, Lock, DatabaseBackup } from 'lucide-react';
import { OrgSecurity } from '../../../store/organizationStore';

interface OrgSecuritySectionProps {
  security: OrgSecurity;
}

export function OrgSecuritySection({ security }: OrgSecuritySectionProps) {
  const cards = [
    {
      icon: ShieldCheck,
      label: 'Two-Factor Authentication',
      value: security.twoFactorEnabled ? 'Enabled' : 'Disabled',
      colorClass: security.twoFactorEnabled ? 'text-jade' : 'text-white/40',
    },
    {
      icon: KeyRound,
      label: 'SSO',
      value: security.ssoConfigured ? 'Configured' : 'Not Configured',
      colorClass: security.ssoConfigured ? 'text-jade' : 'text-amber-400',
    },
    {
      icon: Lock,
      label: 'Password Policy',
      value: security.passwordPolicy,
      colorClass: 'text-blue-400',
    },
    {
      icon: DatabaseBackup,
      label: 'Last Backup',
      value: format(new Date(security.lastBackup), 'MMM d, yyyy'),
      colorClass: 'text-white/70',
    },
  ];

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Organization Security Overview</h3>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map(({ icon: Icon, label, value, colorClass }) => (
            <div key={label} className="flex items-center gap-3 bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3">
              <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white/40" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-white/35 uppercase tracking-wide truncate">{label}</p>
                <p className={`text-xs font-bold ${colorClass}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-self-center">
          <div
            className="relative w-24 h-24 rounded-full"
            style={{ background: `conic-gradient(#00C896 ${security.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
          >
            <div className="absolute inset-[7px] rounded-full bg-noir-700 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white leading-none">{security.score}%</span>
            </div>
          </div>
          <p className="text-[10px] text-white/35 mt-2">Security Score</p>
        </div>
      </div>
    </div>
  );
}
