import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ReportConfig, ReportHistoryEntry, ScheduledReport, ReportAuditEntry, ReportAuditType, ReportRole,
} from '../types/report.types';
import { computeNextRun } from '../utils/reportBuilder';

interface ReportsState {
  savedReports: ReportConfig[];
  history: ReportHistoryEntry[];
  scheduled: ScheduledReport[];
  auditLog: ReportAuditEntry[];
  currentRole: ReportRole;

  saveReport: (config: ReportConfig) => void;
  updateReport: (id: string, updates: Partial<ReportConfig>) => void;
  deleteReport: (id: string) => void;
  duplicateReport: (id: string) => void;
  toggleFavorite: (id: string) => void;

  addHistoryEntry: (entry: Omit<ReportHistoryEntry, 'id' | 'generatedAt'>) => void;
  deleteHistoryEntry: (id: string) => void;

  addScheduledReport: (schedule: Omit<ScheduledReport, 'id' | 'nextRunAt'>) => void;
  updateScheduledReport: (id: string, updates: Partial<ScheduledReport>) => void;
  deleteScheduledReport: (id: string) => void;
  runDueSchedules: () => void;

  addAuditEntry: (user: string, activity: string, type: ReportAuditType) => void;
  setCurrentRole: (role: ReportRole) => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      savedReports: [],
      history: [],
      scheduled: [],
      auditLog: [],
      currentRole: 'Administrator',

      saveReport: (config) => {
        set((state) => ({ savedReports: [config, ...state.savedReports] }));
      },
      updateReport: (id, updates) => {
        set((state) => ({
          savedReports: state.savedReports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },
      deleteReport: (id) => {
        set((state) => ({ savedReports: state.savedReports.filter((r) => r.id !== id) }));
      },
      duplicateReport: (id) => {
        set((state) => {
          const original = state.savedReports.find((r) => r.id === id);
          if (!original) return state;
          const copy: ReportConfig = { ...original, id: crypto.randomUUID(), name: `${original.name} (Copy)`, createdAt: new Date().toISOString() };
          return { savedReports: [copy, ...state.savedReports] };
        });
      },
      toggleFavorite: (id) => {
        set((state) => ({
          savedReports: state.savedReports.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)),
        }));
      },

      addHistoryEntry: (entry) => {
        set((state) => ({
          history: [{ ...entry, id: crypto.randomUUID(), generatedAt: new Date().toISOString() }, ...state.history].slice(0, 200),
        }));
      },
      deleteHistoryEntry: (id) => {
        set((state) => ({ history: state.history.filter((h) => h.id !== id) }));
      },

      addScheduledReport: (schedule) => {
        const nextRunAt = computeNextRun(schedule.frequency, schedule.startDate, schedule.time);
        set((state) => ({
          scheduled: [{ ...schedule, id: crypto.randomUUID(), nextRunAt }, ...state.scheduled],
        }));
      },
      updateScheduledReport: (id, updates) => {
        set((state) => ({
          scheduled: state.scheduled.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },
      deleteScheduledReport: (id) => {
        set((state) => ({ scheduled: state.scheduled.filter((s) => s.id !== id) }));
      },
      runDueSchedules: () => {
        const now = new Date();
        const due = get().scheduled.filter((s) => s.active && new Date(s.nextRunAt) <= now);
        if (due.length === 0) return;

        due.forEach((s) => {
          get().addHistoryEntry({
            reportName: s.reportName,
            reportType: s.config.category,
            generatedBy: 'Scheduler',
            exportFormat: 'view',
            status: 'completed',
            config: s.config,
          });
          get().addAuditEntry('Scheduler', `Auto-generated scheduled report "${s.reportName}"`, 'generated');
        });

        set((state) => ({
          scheduled: state.scheduled.map((s) => {
            if (!due.find((d) => d.id === s.id)) return s;
            return {
              ...s,
              lastRunAt: now.toISOString(),
              nextRunAt: computeNextRun(s.frequency, s.startDate, s.time, now),
            };
          }),
        }));
      },

      addAuditEntry: (user, activity, type) => {
        set((state) => ({
          auditLog: [{ id: crypto.randomUUID(), user, timestamp: new Date().toISOString(), activity, type }, ...state.auditLog].slice(0, 300),
        }));
      },
      setCurrentRole: (role) => set({ currentRole: role }),
    }),
    { name: 'reports-storage' }
  )
);
