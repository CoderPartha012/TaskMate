import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrgOverview {
  name: string;
  orgId: string;
  workspaceUrl: string;
  industry: string;
  companySize: string;
  businessType: string;
  foundedYear: string;
  description: string;
}

export interface OrgBranding {
  primaryColor: string;
  accentColor: string;
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
  bannerDataUrl: string | null;
  darkModeDefault: boolean;
  lightModeSupport: boolean;
}

export interface OrgRegional {
  country: string;
  state: string;
  city: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 'monday' | 'sunday';
  financialYearStart: string;
}

export interface OrgWorkspaceDefaults {
  defaultTaskStatus: string;
  defaultPriority: string;
  defaultRepositoryView: 'table' | 'grouped' | 'compact';
  defaultAnalyticsDashboard: string;
  defaultTheme: 'dark' | 'system';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
}

export interface OrgHoliday {
  id: string;
  name: string;
  date: string;
}

export interface OrgWorkingCalendar {
  workingDays: string[];
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  holidays: OrgHoliday[];
}

export interface OrgMember {
  id: string;
  name: string;
  department: string;
  role: string;
  joinedDate: string;
}

export interface OrgMembersSummary {
  totalUsers: number;
  admins: number;
  managers: number;
  employees: number;
  guests: number;
  pendingInvitations: number;
  latest: OrgMember[];
}

export interface OrgStorageBreakdownItem {
  label: string;
  gb: number;
}

export interface OrgStorage {
  usedGB: number;
  totalGB: number;
  breakdown: OrgStorageBreakdownItem[];
}

export interface OrgSecurity {
  twoFactorEnabled: boolean;
  ssoConfigured: boolean;
  passwordPolicy: string;
  lastBackup: string;
  score: number;
}

export interface OrgIntegration {
  key: string;
  name: string;
  connected: boolean;
}

export interface OrgActivityEntry {
  id: string;
  message: string;
  user: string;
  timestamp: string;
}

interface OrganizationState {
  owner: string;
  plan: string;
  createdAt: string;
  lastModified: string;
  overview: OrgOverview;
  branding: OrgBranding;
  regional: OrgRegional;
  workspaceDefaults: OrgWorkspaceDefaults;
  workingCalendar: OrgWorkingCalendar;
  members: OrgMembersSummary;
  storage: OrgStorage;
  security: OrgSecurity;
  integrations: OrgIntegration[];
  activityLog: OrgActivityEntry[];

  updateOverview: (patch: Partial<OrgOverview>) => void;
  updateBranding: (patch: Partial<OrgBranding>) => void;
  updateRegional: (patch: Partial<OrgRegional>) => void;
  updateWorkspaceDefaults: (patch: Partial<OrgWorkspaceDefaults>) => void;
  updateWorkingCalendar: (patch: Partial<OrgWorkingCalendar>) => void;
  setLogo: (dataUrl: string | null) => void;
  setFavicon: (dataUrl: string | null) => void;
  setBanner: (dataUrl: string | null) => void;
  importHolidaysFromCSV: (text: string) => void;
  importPublicHolidays: () => void;
  removeHoliday: (id: string) => void;
  toggleIntegration: (key: string) => void;
  cleanTemporaryFiles: () => void;
  upgradeStorage: () => void;
  addActivityEntry: (message: string, user?: string) => void;
}

function makeActivityEntry(message: string, user: string): OrgActivityEntry {
  return { id: crypto.randomUUID(), message, user, timestamp: new Date().toISOString() };
}

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      owner: 'Alex Morgan',
      plan: 'Enterprise Plan',
      createdAt: '2022-01-15T00:00:00.000Z',
      lastModified: new Date().toISOString(),

      overview: {
        name: 'TaskMate Solutions',
        orgId: 'ORG-7F3A9D2B',
        workspaceUrl: 'taskmate.company.com',
        industry: 'Software Development',
        companySize: '51-200 employees',
        businessType: 'Private Company',
        foundedYear: '2022',
        description: 'TaskMate Solutions is an enterprise-grade task and project management platform designed to help teams plan, collaborate, and deliver with speed and clarity.',
      },

      branding: {
        primaryColor: '#00C896',
        accentColor: '#3B82F6',
        logoDataUrl: null,
        faviconDataUrl: null,
        bannerDataUrl: null,
        darkModeDefault: true,
        lightModeSupport: false,
      },

      regional: {
        country: 'India',
        state: 'Haryana',
        city: 'Gurgaon',
        timezone: '(GMT+05:30) Asia/Kolkata',
        language: 'English',
        currency: 'INR (₹)',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        weekStartsOn: 'monday',
        financialYearStart: 'April',
      },

      workspaceDefaults: {
        defaultTaskStatus: 'Pending',
        defaultPriority: 'Medium',
        defaultRepositoryView: 'table',
        defaultAnalyticsDashboard: 'Overview',
        defaultTheme: 'dark',
        notificationsEnabled: true,
        emailNotifications: true,
        desktopNotifications: false,
      },

      workingCalendar: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '18:00',
        lunchStart: '13:00',
        lunchEnd: '14:00',
        holidays: [
          { id: crypto.randomUUID(), name: 'Republic Day', date: '2026-01-26' },
          { id: crypto.randomUUID(), name: 'Independence Day', date: '2026-08-15' },
        ],
      },

      members: {
        totalUsers: 118,
        admins: 6,
        managers: 14,
        employees: 92,
        guests: 6,
        pendingInvitations: 4,
        latest: [
          { id: crypto.randomUUID(), name: 'John Doe', department: 'Engineering', role: 'Admin', joinedDate: '2026-07-10' },
          { id: crypto.randomUUID(), name: 'Emily Chen', department: 'Product', role: 'Manager', joinedDate: '2026-07-08' },
          { id: crypto.randomUUID(), name: 'Rohit Sharma', department: 'QA', role: 'Employee', joinedDate: '2026-07-05' },
          { id: crypto.randomUUID(), name: 'Ayesha Khan', department: 'Design', role: 'Employee', joinedDate: '2026-07-01' },
        ],
      },

      storage: {
        usedGB: 18,
        totalGB: 50,
        breakdown: [
          { label: 'Attachments', gb: 7.2 },
          { label: 'Documents', gb: 5.4 },
          { label: 'AI Outputs', gb: 2.8 },
          { label: 'Reports', gb: 1.6 },
          { label: 'Exports', gb: 1.0 },
        ],
      },

      security: {
        twoFactorEnabled: true,
        ssoConfigured: false,
        passwordPolicy: 'Strong',
        lastBackup: yesterday,
        score: 89,
      },

      integrations: [
        { key: 'teams', name: 'Microsoft Teams', connected: true },
        { key: 'slack', name: 'Slack', connected: false },
        { key: 'google-workspace', name: 'Google Workspace', connected: true },
        { key: 'github', name: 'GitHub', connected: true },
        { key: 'jira', name: 'Jira', connected: false },
      ],

      activityLog: [
        makeActivityEntry('New member John Doe joined the organization', 'System'),
        makeActivityEntry('Project "AI Automation" was created', 'Emily Chen'),
        makeActivityEntry('Domain taskmate.com was verified', 'System'),
      ],

      updateOverview: (patch) => {
        set((state) => ({ overview: { ...state.overview, ...patch }, lastModified: new Date().toISOString() }));
      },
      updateBranding: (patch) => {
        set((state) => ({ branding: { ...state.branding, ...patch }, lastModified: new Date().toISOString() }));
      },
      updateRegional: (patch) => {
        set((state) => ({ regional: { ...state.regional, ...patch }, lastModified: new Date().toISOString() }));
      },
      updateWorkspaceDefaults: (patch) => {
        set((state) => ({ workspaceDefaults: { ...state.workspaceDefaults, ...patch }, lastModified: new Date().toISOString() }));
      },
      updateWorkingCalendar: (patch) => {
        set((state) => ({ workingCalendar: { ...state.workingCalendar, ...patch }, lastModified: new Date().toISOString() }));
      },

      setLogo: (dataUrl) => set((state) => ({ branding: { ...state.branding, logoDataUrl: dataUrl } })),
      setFavicon: (dataUrl) => set((state) => ({ branding: { ...state.branding, faviconDataUrl: dataUrl } })),
      setBanner: (dataUrl) => set((state) => ({ branding: { ...state.branding, bannerDataUrl: dataUrl } })),

      importHolidaysFromCSV: (text) => {
        const rows = text.split('\n').map((r) => r.trim()).filter(Boolean);
        const parsed: OrgHoliday[] = rows
          .map((row) => {
            const [name, date] = row.split(',').map((c) => c.trim());
            return name && date ? { id: crypto.randomUUID(), name, date } : null;
          })
          .filter((h): h is OrgHoliday => !!h);
        if (parsed.length === 0) return;
        set((state) => ({
          workingCalendar: { ...state.workingCalendar, holidays: [...state.workingCalendar.holidays, ...parsed] },
        }));
        get().addActivityEntry(`Imported ${parsed.length} holiday${parsed.length > 1 ? 's' : ''} from CSV`);
      },

      importPublicHolidays: () => {
        const publicHolidays: OrgHoliday[] = [
          { id: crypto.randomUUID(), name: 'Holi', date: '2026-03-04' },
          { id: crypto.randomUUID(), name: 'Diwali', date: '2026-11-08' },
          { id: crypto.randomUUID(), name: 'Gandhi Jayanti', date: '2026-10-02' },
        ];
        set((state) => {
          const existingNames = new Set(state.workingCalendar.holidays.map((h) => h.name));
          const toAdd = publicHolidays.filter((h) => !existingNames.has(h.name));
          return { workingCalendar: { ...state.workingCalendar, holidays: [...state.workingCalendar.holidays, ...toAdd] } };
        });
        get().addActivityEntry('Public holidays imported for India');
      },

      removeHoliday: (id) => {
        set((state) => ({
          workingCalendar: { ...state.workingCalendar, holidays: state.workingCalendar.holidays.filter((h) => h.id !== id) },
        }));
      },

      toggleIntegration: (key) => {
        set((state) => ({
          integrations: state.integrations.map((i) => (i.key === key ? { ...i, connected: !i.connected } : i)),
        }));
        const integration = get().integrations.find((i) => i.key === key);
        if (integration) get().addActivityEntry(`${integration.name} ${integration.connected ? 'connected' : 'disconnected'}`);
      },

      cleanTemporaryFiles: () => {
        set((state) => {
          const reclaimed = Math.min(2.5, state.storage.usedGB);
          return { storage: { ...state.storage, usedGB: Math.max(0, Math.round((state.storage.usedGB - reclaimed) * 10) / 10) } };
        });
        get().addActivityEntry('Temporary files cleaned up');
      },

      upgradeStorage: () => {
        set((state) => ({ storage: { ...state.storage, totalGB: state.storage.totalGB + 50 } }));
        get().addActivityEntry('Storage plan upgraded');
      },

      addActivityEntry: (message, user = 'You') => {
        set((state) => ({ activityLog: [makeActivityEntry(message, user), ...state.activityLog].slice(0, 30) }));
      },
    }),
    {
      name: 'organization-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as OrganizationState;
        if (state?.owner === 'Partha Rakshit') {
          state.owner = 'Alex Morgan';
        }
        return state;
      },
    }
  )
);
