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
  updateProfile: (patch: Partial<UserProfile>) => void;
  setAvatar: (dataUrl: string | null) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  addActivityEntry: (message: string) => void;
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
