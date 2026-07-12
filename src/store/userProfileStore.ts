import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileActivityEntry {
  id: string;
  message: string;
  timestamp: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  timeZone: string;
  language: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  workLocation: string;
  address: string;
  postalCode: string;
  emergencyContact: string;
  manager: string;
  employmentType: string;
  joiningDate: string;
  officeLocation: string;
}

export interface UserPreferences {
  theme: 'dark' | 'system';
  compactMode: boolean;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 'monday' | 'sunday';
  defaultLandingPage: string;
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null;
}

export interface UserAccount {
  username: string;
  accountId: string;
  emailVerified: boolean;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  desktopNotifications: boolean;
  inAppNotifications: boolean;
  notifyTaskDueDates: boolean;
  notifyTaskAssigned: boolean;
  notifyComments: boolean;
  notifyStatusChanges: boolean;
  notifyAIExecutions: boolean;
  notifyContractWorkflowAlerts: boolean;
  weeklySummaryEmail: boolean;
}

const DEFAULT_ACCOUNT: UserAccount = {
  username: 'alex.morgan',
  accountId: 'ACC-84213-XQ',
  emailVerified: true,
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  desktopNotifications: false,
  inAppNotifications: true,
  notifyTaskDueDates: true,
  notifyTaskAssigned: true,
  notifyComments: true,
  notifyStatusChanges: false,
  notifyAIExecutions: true,
  notifyContractWorkflowAlerts: true,
  weeklySummaryEmail: false,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  compactMode: false,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  weekStartsOn: 'monday',
  defaultLandingPage: 'Repository',
};

const DEFAULT_SECURITY: UserSecurity = {
  twoFactorEnabled: true,
  lastPasswordChange: null,
};

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Alex',
  lastName: 'Morgan',
  displayName: 'Alex Morgan',
  jobTitle: 'QA Engineer',
  department: 'Quality Assurance',
  employeeId: 'EMP-0001',
  email: 'demo.user@taskmate.io',
  phone: '+1 555-0100',
  country: 'United States',
  city: 'San Francisco',
  timeZone: '(GMT-08:00) America/Los_Angeles',
  language: 'English',
  bio: 'Passionate about quality, automation, and building reliable products.',
  dateOfBirth: '',
  gender: 'Prefer not to say',
  workLocation: 'Hybrid',
  address: '',
  postalCode: '',
  emergencyContact: '',
  manager: 'Team Lead',
  employmentType: 'Full-time',
  joiningDate: '2026-01-15',
  officeLocation: 'San Francisco HQ',
};

interface UserProfileState {
  profile: UserProfile;
  avatarDataUrl: string | null;
  skills: string[];
  teams: string[];
  joinedAt: string;
  activityLog: ProfileActivityEntry[];
  preferences: UserPreferences;
  security: UserSecurity;
  account: UserAccount;
  notificationPreferences: NotificationPreferences;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setAvatar: (dataUrl: string | null) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  addActivityEntry: (message: string) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  toggleTwoFactor: () => void;
  recordPasswordChange: () => void;
  updateAccount: (patch: Partial<UserAccount>) => void;
  verifyEmail: () => void;
  updateNotificationPreferences: (patch: Partial<NotificationPreferences>) => void;
}

function makeActivityEntry(message: string): ProfileActivityEntry {
  return { id: crypto.randomUUID(), message, timestamp: new Date().toISOString() };
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      avatarDataUrl: null,
      skills: ['Selenium', 'Playwright', 'API Testing', 'Jira', 'TestNG'],
      teams: ['QA', 'PROJ', 'AUT', 'REL', 'SEC'],
      joinedAt: '2026-07-10T00:00:00.000Z',
      activityLog: [
        makeActivityEntry('Updated profile information'),
        makeActivityEntry('Changed profile avatar'),
        makeActivityEntry('Enabled two-factor authentication'),
        makeActivityEntry('Updated notification preferences'),
      ],
      preferences: DEFAULT_PREFERENCES,
      security: DEFAULT_SECURITY,
      account: DEFAULT_ACCOUNT,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,

      updateProfile: (patch) => {
        set((state) => ({ profile: { ...state.profile, ...patch } }));
      },

      setAvatar: (dataUrl) => {
        set({ avatarDataUrl: dataUrl });
      },

      addSkill: (skill) => {
        const trimmed = skill.trim();
        if (!trimmed) return;
        set((state) => (state.skills.includes(trimmed) ? state : { skills: [...state.skills, trimmed] }));
      },

      removeSkill: (skill) => {
        set((state) => ({ skills: state.skills.filter((s) => s !== skill) }));
      },

      addActivityEntry: (message) => {
        set((state) => ({ activityLog: [makeActivityEntry(message), ...state.activityLog].slice(0, 30) }));
      },

      updatePreferences: (patch) => {
        set((state) => ({ preferences: { ...state.preferences, ...patch } }));
      },

      toggleTwoFactor: () => {
        set((state) => ({ security: { ...state.security, twoFactorEnabled: !state.security.twoFactorEnabled } }));
      },

      recordPasswordChange: () => {
        set((state) => ({ security: { ...state.security, lastPasswordChange: new Date().toISOString() } }));
      },

      updateAccount: (patch) => {
        set((state) => ({ account: { ...state.account, ...patch } }));
      },

      verifyEmail: () => {
        set((state) => ({ account: { ...state.account, emailVerified: true } }));
      },

      updateNotificationPreferences: (patch) => {
        set((state) => ({ notificationPreferences: { ...state.notificationPreferences, ...patch } }));
      },
    }),
    {
      name: 'user-profile-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as UserProfileState;
        if (state?.profile?.email === 'partha@taskmate.com') {
          state.profile = DEFAULT_PROFILE;
        }
        return state;
      },
    }
  )
);
