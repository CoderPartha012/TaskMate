import React from 'react';
import {
  User, Settings, Shield, SlidersHorizontal, Bell, History, Monitor, Plug, AlertTriangle, LifeBuoy,
} from 'lucide-react';
import { UserProfile } from '../../../store/userProfileStore';

export type ProfileNavKey =
  | 'personal' | 'account' | 'security' | 'preferences' | 'notifications'
  | 'activity' | 'sessions' | 'connected' | 'danger';

const NAV_ITEMS: { key: ProfileNavKey; label: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean }[] = [
  { key: 'personal', label: 'Personal Information', icon: User },
  { key: 'account', label: 'Account Settings', icon: Settings },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'activity', label: 'Activity', icon: History },
  { key: 'sessions', label: 'Sessions', icon: Monitor },
  { key: 'connected', label: 'Connected Accounts', icon: Plug },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

export const PROFILE_NAV_LABELS: Record<ProfileNavKey, string> = NAV_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item.key]: item.label }),
  {} as Record<ProfileNavKey, string>
);

interface ProfileLeftNavProps {
  profile: UserProfile;
  avatarDataUrl: string | null;
  activeKey: ProfileNavKey;
  onSelect: (key: ProfileNavKey) => void;
}

export function ProfileLeftNav({ profile, avatarDataUrl, activeKey, onSelect }: ProfileLeftNavProps) {
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5 text-center">
        <div className="relative inline-block mb-3">
          {avatarDataUrl ? (
            <img src={avatarDataUrl} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-jade/15 text-jade flex items-center justify-center text-lg font-bold mx-auto">
              {initials}
            </div>
          )}
          <span
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-jade border-2 border-noir-700"
            aria-hidden="true"
            title="Online"
          />
        </div>
        <p className="text-sm font-bold text-white truncate">{profile.displayName || `${profile.firstName} ${profile.lastName}`}</p>
        <p className="text-xs text-white/45 mt-0.5 truncate">{profile.jobTitle}</p>
        <p className="text-[11px] text-white/30 mt-1 truncate">{profile.email}</p>
      </div>

      <nav className="bg-noir-700 border border-white/[0.06] rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        {NAV_ITEMS.map(({ key, label, icon: Icon, danger }) => {
          const isActive = key === activeKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-lg whitespace-nowrap shrink-0 lg:shrink transition-colors border-l-2 ${
                isActive
                  ? danger
                    ? 'bg-red-500/10 text-red-400 border-red-500'
                    : 'bg-jade/10 text-jade border-jade'
                  : danger
                    ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/5 border-transparent'
                    : 'text-white/50 hover:text-white/85 hover:bg-white/5 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-4 hidden lg:block">
        <p className="text-xs font-bold text-white/80 mb-1">Need Help?</p>
        <p className="text-[11px] text-white/40 leading-relaxed mb-3">Visit our Help Center or contact support.</p>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          Help Center
        </button>
      </div>
    </div>
  );
}
