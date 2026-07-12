import { NotificationPreferences, UserAccount, UserPreferences, UserProfile } from '../store/userProfileStore';

interface ProfileDataExportInput {
  profile: UserProfile;
  account: UserAccount;
  preferences: UserPreferences;
  notificationPreferences: NotificationPreferences;
  skills: string[];
  teams: string[];
  joinedAt: string;
}

export function exportProfileData(data: ProfileDataExportInput): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.account.username || 'taskmate-user'}-profile-data.json`;
  a.click();
  URL.revokeObjectURL(url);
}
