import React from 'react';
import { format } from 'date-fns';
import { AtSign, BadgeCheck, Download, Mail } from 'lucide-react';
import { UserAccount } from '../../../store/userProfileStore';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

interface ProfileAccountSettingsSectionProps {
  draft: UserAccount;
  email: string;
  joinedAt: string;
  onChange: (patch: Partial<UserAccount>) => void;
  onVerifyEmail: () => void;
  onDownloadData: () => void;
}

export function ProfileAccountSettingsSection({
  draft, email, joinedAt, onChange, onVerifyEmail, onDownloadData,
}: ProfileAccountSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-2">
          <AtSign className="w-4 h-4 text-jade" aria-hidden="true" />
          Account Overview
        </h3>
        <p className="text-xs text-white/40 mb-5">Your unique identifiers within TaskMate.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className={labelClass} htmlFor="acct-username">Username</label>
            <input
              id="acct-username"
              type="text"
              value={draft.username}
              onChange={(e) => onChange({ username: e.target.value })}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="acct-id">Account ID</label>
            <input id="acct-id" type="text" value={draft.accountId} readOnly disabled className={`${inputBase} opacity-50 cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelClass}>Member Since</label>
            <p className="text-sm text-white/70 px-3 py-2">{format(new Date(joinedAt), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <label className={labelClass}>Account Type</label>
            <p className="text-sm text-white/70 px-3 py-2">Standard Member</p>
          </div>
        </div>
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-jade" aria-hidden="true" />
          Email Verification
        </h3>
        <p className="text-xs text-white/40 mb-4">Verify your email address to secure account recovery.</p>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3 max-w-xl">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">{email}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-0.5 ${draft.emailVerified ? 'text-jade' : 'text-amber-400'}`}>
              {draft.emailVerified && <BadgeCheck className="w-3 h-3" aria-hidden="true" />}
              {draft.emailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          {!draft.emailVerified && (
            <button
              type="button"
              onClick={onVerifyEmail}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors shrink-0"
            >
              Verify Now
            </button>
          )}
        </div>
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-jade" aria-hidden="true" />
          Your Data
        </h3>
        <p className="text-xs text-white/40 mb-4">Download a copy of your profile, preferences, and account data.</p>
        <button
          type="button"
          onClick={onDownloadData}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download My Data
        </button>
      </div>
    </div>
  );
}
