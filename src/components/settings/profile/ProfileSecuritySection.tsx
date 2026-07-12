import React, { useState } from 'react';
import { format } from 'date-fns';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { UserSecurity } from '../../../store/userProfileStore';
import { ToggleSwitch } from '../../common/ToggleSwitch';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

interface ProfileSecuritySectionProps {
  security: UserSecurity;
  email: string;
  onToggleTwoFactor: () => void;
  onPasswordChanged: () => void;
}

export function ProfileSecuritySection({ security, email, onToggleTwoFactor, onPasswordChanged }: ProfileSecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onPasswordChanged();
  };

  return (
    <div className="space-y-6">
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-jade" aria-hidden="true" />
          Change Password
        </h3>
        <p className="text-xs text-white/40 mb-5">Signed in as {email}</p>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
          <div>
            <label className={labelClass} htmlFor="sec-current-password">Current Password</label>
            <input
              id="sec-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="sec-new-password">New Password</label>
            <input
              id="sec-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="sec-confirm-password">Confirm New Password</label>
            <input
              id="sec-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={inputBase}
            />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <button type="submit" className="text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors">
            Update Password
          </button>
        </form>

        {security.lastPasswordChange && (
          <p className="text-[11px] text-white/30 mt-4">
            Last changed {format(new Date(security.lastPasswordChange), 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-jade" aria-hidden="true" />
          Two-Factor Authentication
        </h3>
        <p className="text-xs text-white/40 mb-4">Add an extra layer of security to your account when signing in.</p>
        <div className="flex items-center justify-between bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3 max-w-sm">
          <div>
            <p className="text-xs font-semibold text-white/80">Two-Factor Authentication</p>
            <span className={`text-[10px] font-bold ${security.twoFactorEnabled ? 'text-jade' : 'text-white/35'}`}>
              {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <ToggleSwitch checked={security.twoFactorEnabled} onChange={onToggleTwoFactor} />
        </div>
      </div>
    </div>
  );
}
