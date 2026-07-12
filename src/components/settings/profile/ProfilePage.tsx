import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, X, Save } from 'lucide-react';
import { useUserProfileStore, UserProfile } from '../../../store/userProfileStore';
import { useToastStore } from '../../../store/toastStore';
import { ProfileLeftNav, ProfileNavKey, PROFILE_NAV_LABELS } from './ProfileLeftNav';
import { ProfileBasicInfoCard } from './ProfileBasicInfoCard';
import { ProfileAdditionalInfoCard } from './ProfileAdditionalInfoCard';
import { ProfileCompletionPanel } from './ProfileCompletionPanel';
import { ProfileAboutMePanel } from './ProfileAboutMePanel';
import { ProfileActivityPanel } from './ProfileActivityPanel';
import { ProfileComingSoonPanel } from './ProfileComingSoonPanel';
import { ProfileSkeleton } from './ProfileSkeleton';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const profile = useUserProfileStore((s) => s.profile);
  const avatarDataUrl = useUserProfileStore((s) => s.avatarDataUrl);
  const skills = useUserProfileStore((s) => s.skills);
  const teams = useUserProfileStore((s) => s.teams);
  const joinedAt = useUserProfileStore((s) => s.joinedAt);
  const activityLog = useUserProfileStore((s) => s.activityLog);
  const updateProfile = useUserProfileStore((s) => s.updateProfile);
  const setAvatar = useUserProfileStore((s) => s.setAvatar);
  const addSkill = useUserProfileStore((s) => s.addSkill);
  const removeSkill = useUserProfileStore((s) => s.removeSkill);
  const addActivityEntry = useUserProfileStore((s) => s.addActivityEntry);

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [avatarDraft, setAvatarDraft] = useState<string | null>(avatarDataUrl);
  const [activeNavKey, setActiveNavKey] = useState<ProfileNavKey>('personal');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(profile) || avatarDraft !== avatarDataUrl;

  const handleFieldChange = (patch: Partial<UserProfile>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const handleCancel = () => {
    setDraft(profile);
    setAvatarDraft(avatarDataUrl);
  };

  const handleSave = () => {
    if (!isDirty) return;
    const avatarChanged = avatarDraft !== avatarDataUrl;
    updateProfile(draft);
    if (avatarChanged) setAvatar(avatarDraft);
    addActivityEntry(avatarChanged ? 'Changed profile avatar' : 'Updated profile information');
    useToastStore.getState().showToast({ message: 'Profile saved successfully' });
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white/35 hover:text-jade transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Settings
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
            <p className="text-xs text-white/45 mt-1">Manage your personal information and account settings.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!isDirty}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>

        {isDirty && (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            You have unsaved changes
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6 items-start pb-20 lg:pb-0">
        <ProfileLeftNav profile={draft} avatarDataUrl={avatarDraft} activeKey={activeNavKey} onSelect={setActiveNavKey} />

        <div className="space-y-6 min-w-0">
          {activeNavKey === 'personal' && (
            <>
              <ProfileBasicInfoCard draft={draft} avatarDataUrl={avatarDraft} onChange={handleFieldChange} onAvatarChange={setAvatarDraft} />
              <ProfileAdditionalInfoCard draft={draft} onChange={handleFieldChange} />
            </>
          )}
          {activeNavKey === 'activity' && (
            <ProfileActivityPanel entries={activityLog} title="All Activity" />
          )}
          {activeNavKey !== 'personal' && activeNavKey !== 'activity' && (
            <ProfileComingSoonPanel title={PROFILE_NAV_LABELS[activeNavKey]} />
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <ProfileCompletionPanel draft={draft} onNavigate={setActiveNavKey} />
          <ProfileAboutMePanel
            draft={draft}
            joinedAt={joinedAt}
            teams={teams}
            skills={skills}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
          />
          <ProfileActivityPanel entries={activityLog} limit={4} onViewAll={() => setActiveNavKey('activity')} />
        </div>
      </div>

      {isDirty && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-noir-800 border-t border-white/[0.08] px-4 py-3 flex items-center justify-between gap-3 z-30">
          <span className="text-[11px] text-amber-400 font-semibold">Unsaved changes</span>
          <div className="flex gap-2">
            <button type="button" onClick={handleCancel} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-jade text-noir-800">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
