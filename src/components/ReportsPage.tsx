import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useReportsStore } from '../store/reportsStore';
import {
  ReportConfig, ReportFilters, EMPTY_REPORT_FILTERS, createEmptyReportConfig,
  ReportHistoryEntry, REPORT_COLUMNS, ROLE_PERMISSIONS, ScheduleFrequency,
} from '../types/report.types';
import { buildReport, getReportPreset, exportReportCSV, exportReportExcel, exportReportPDF } from '../utils/reportBuilder';
import { ReportsKPICards } from './ReportsKPICards';
import { ReportCategoriesGrid } from './ReportCategoriesGrid';
import { ReportBuilderPanel } from './ReportBuilderPanel';
import { ReportPreviewTable } from './ReportPreviewTable';
import { ReportExportBar } from './ReportExportBar';
import { ReportChart } from './ReportChart';
import { ReportEmailModal } from './ReportEmailModal';
import { ReportScheduleModal } from './ReportScheduleModal';
import { SavedReportsList } from './SavedReportsList';
import { ReportHistoryTable } from './ReportHistoryTable';
import { ScheduledReportsList } from './ScheduledReportsList';
import { ReportAuditLogTable } from './ReportAuditLogTable';
import { ReportsGlobalFilterDrawer } from './ReportsGlobalFilterDrawer';
import { ReportRoleSelector } from './ReportRoleSelector';

type Tab = 'dashboard' | 'builder' | 'saved' | 'history' | 'scheduled' | 'audit';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'builder', label: 'Report Builder' },
  { key: 'saved', label: 'Saved Reports' },
  { key: 'history', label: 'History' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'audit', label: 'Audit Log' },
];

export function ReportsPage() {
  const tasks = useTaskStore((s) => s.tasks.filter((t) => !t.archived));
  const {
    savedReports, history, scheduled, auditLog, currentRole,
    saveReport, deleteReport, duplicateReport, toggleFavorite,
    addHistoryEntry, deleteHistoryEntry,
    addScheduledReport, updateScheduledReport, deleteScheduledReport, runDueSchedules,
    addAuditEntry, setCurrentRole,
  } = useReportsStore();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [globalFilterDraft, setGlobalFilterDraft] = useState<ReportFilters>(EMPTY_REPORT_FILTERS);
  const [appliedGlobalFilters, setAppliedGlobalFilters] = useState<ReportFilters>(EMPTY_REPORT_FILTERS);
  const [emailOpen, setEmailOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const perms = ROLE_PERMISSIONS[currentRole];

  // Simulated scheduler: check every 60s while the tab is open
  useEffect(() => {
    const interval = setInterval(() => runDueSchedules(), 60_000);
    runDueSchedules();
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => (config ? config.columns.map((key) => REPORT_COLUMNS.find((c) => c.key === key)!).filter(Boolean) : []),
    [config]
  );

  const groups = useMemo(() => (config ? buildReport(tasks, config) : []), [tasks, config]);

  const openCategory = (name: string, category: string) => {
    const preset = getReportPreset(name);
    const next = createEmptyReportConfig(name, category);
    next.columns = preset.columns;
    next.filters = { ...appliedGlobalFilters, ...preset.filters };
    next.overdueOnly = preset.overdueOnly;
    next.groupBy = preset.groupBy;
    next.sortBy = preset.sortBy;
    next.sortDir = preset.sortDir;
    setConfig(next);
    setActiveTab('builder');
  };

  const newCustomReport = () => {
    const next = createEmptyReportConfig('Untitled Report', 'Custom Report');
    next.filters = { ...appliedGlobalFilters };
    setConfig(next);
    setActiveTab('builder');
  };

  const openSavedReport = (report: ReportConfig) => {
    setConfig({ ...report });
    setActiveTab('builder');
  };

  const openHistoryEntry = (entry: ReportHistoryEntry) => {
    setConfig({ ...entry.config });
    setActiveTab('builder');
  };

  const recordGeneration = (format: ReportHistoryEntry['exportFormat']) => {
    if (!config) return;
    addHistoryEntry({ reportName: config.name, reportType: config.category, generatedBy: 'You', exportFormat: format, status: 'completed', config });
    addAuditEntry('You', `Generated "${config.name}" (${format.toUpperCase()})`, 'generated');
  };

  const handleGenerate = () => {
    if (!config || !perms.generate) return;
    recordGeneration('view');
  };

  const handleExported = (format: 'csv' | 'excel' | 'pdf') => {
    recordGeneration(format);
    addAuditEntry('You', `Downloaded "${config?.name}" as ${format.toUpperCase()}`, 'downloaded');
  };

  const handlePrinted = () => {
    if (!config) return;
    addAuditEntry('You', `Printed "${config.name}"`, 'printed');
  };

  const handleSave = () => {
    if (!config) return;
    saveReport(config);
    addAuditEntry('You', `Saved report "${config.name}"`, 'generated');
  };

  const handleEmailSent = (recipients: string[], _subject: string, _message: string) => {
    if (!config) return;
    addAuditEntry('You', `Shared "${config.name}" with ${recipients.join(', ')}`, 'shared');
    setEmailOpen(false);
  };

  const handleScheduleCreate = (s: { frequency: ScheduleFrequency; startDate: string; time: string; timezone: string; recipients: string[] }) => {
    if (!config) return;
    addScheduledReport({ reportName: config.name, config, frequency: s.frequency, startDate: s.startDate, time: s.time, timezone: s.timezone, recipients: s.recipients, active: true });
    addAuditEntry('You', `Scheduled "${config.name}" (${s.frequency})`, 'scheduled');
    setScheduleOpen(false);
  };

  const handleDownloadFromHistory = async (entry: ReportHistoryEntry) => {
    const entryColumns = entry.config.columns.map((key) => REPORT_COLUMNS.find((c) => c.key === key)!).filter(Boolean);
    const entryGroups = buildReport(tasks, entry.config);
    const fmt = entry.exportFormat === 'pdf' || entry.exportFormat === 'excel' ? entry.exportFormat : 'csv';
    if (fmt === 'excel') await exportReportExcel(entry.reportName, entryGroups, entryColumns, entry.config.groupBy);
    else if (fmt === 'pdf') await exportReportPDF(entry.reportName, entryGroups, entryColumns, entry.config.groupBy);
    else exportReportCSV(entry.reportName, entryGroups, entryColumns, entry.config.groupBy);
    addAuditEntry('You', `Downloaded "${entry.reportName}" from history`, 'downloaded');
  };

  const handleDeleteReport = (id: string) => {
    if (!perms.delete) return;
    deleteReport(id);
    addAuditEntry('You', 'Deleted a saved report', 'deleted');
  };

  const handleDeleteHistory = (id: string) => {
    if (!perms.delete) return;
    deleteHistoryEntry(id);
    addAuditEntry('You', 'Deleted a history entry', 'deleted');
  };

  const handleDeleteSchedule = (id: string) => {
    if (!perms.delete) return;
    deleteScheduledReport(id);
    addAuditEntry('You', 'Deleted a scheduled report', 'deleted');
  };

  const applyGlobalFilters = () => { setAppliedGlobalFilters(globalFilterDraft); setGlobalFilterOpen(false); };
  const resetGlobalFilters = () => { setGlobalFilterDraft(EMPTY_REPORT_FILTERS); setAppliedGlobalFilters(EMPTY_REPORT_FILTERS); };
  const clearAllGlobalFilters = () => { setGlobalFilterDraft(EMPTY_REPORT_FILTERS); setAppliedGlobalFilters(EMPTY_REPORT_FILTERS); setGlobalFilterOpen(false); };
  const activeGlobalFilterCount = Object.values(appliedGlobalFilters).filter(Boolean).length;

  const recentReports = history.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 bg-noir-700 border border-white/[0.06] rounded-lg p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === t.key ? 'bg-jade/15 text-jade' : 'text-white/45 hover:text-white/75'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ReportRoleSelector role={currentRole} onChange={setCurrentRole} />
          <button
            type="button"
            onClick={() => setGlobalFilterOpen(true)}
            className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeGlobalFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-jade text-noir-800 text-[9px] font-bold rounded-full px-1">
                {activeGlobalFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <ReportsKPICards />
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-sm text-white/80">Report Categories</p>
            <button type="button" onClick={newCustomReport} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Custom Report
            </button>
          </div>
          <ReportCategoriesGrid onSelect={openCategory} />

          {recentReports.length > 0 && (
            <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
              <p className="font-display font-bold text-xs text-white/70 uppercase tracking-wide mb-3">Recent Reports</p>
              <ul className="space-y-2">
                {recentReports.map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-white/70 font-semibold">{r.reportName}</span>
                    <span className="text-white/35">{r.generatedBy} · {new Date(r.generatedAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'builder' && (
        config ? (
          <div className="space-y-4">
            <ReportBuilderPanel config={config} onChange={(patch) => setConfig((c) => (c ? { ...c, ...patch } : c))} />
            {config.includeChart && <ReportChart groups={groups} chartType={config.chartType} />}
            <ReportPreviewTable groups={groups} columns={columns} groupBy={config.groupBy} />
            <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!perms.generate}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Report
              </button>
              <ReportExportBar
                config={config}
                groups={groups}
                columns={columns}
                onExported={handleExported}
                onPrinted={handlePrinted}
                onOpenEmail={() => setEmailOpen(true)}
                onOpenSchedule={() => setScheduleOpen(true)}
                onSave={handleSave}
                canExport={perms.export}
                canSchedule={perms.schedule}
              />
            </div>
          </div>
        ) : (
          <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-10 text-center text-white/30 text-sm">
            Pick a report category from the Dashboard tab, or{' '}
            <button type="button" onClick={newCustomReport} className="text-jade hover:text-jade-light font-semibold">start a custom report</button>.
          </div>
        )
      )}

      {activeTab === 'saved' && (
        <SavedReportsList
          reports={savedReports}
          onOpen={openSavedReport}
          onDelete={handleDeleteReport}
          onDuplicate={duplicateReport}
          onToggleFavorite={toggleFavorite}
          canDelete={perms.delete}
        />
      )}

      {activeTab === 'history' && (
        <ReportHistoryTable
          history={history}
          onView={openHistoryEntry}
          onDownload={handleDownloadFromHistory}
          onDelete={handleDeleteHistory}
          canDelete={perms.delete}
        />
      )}

      {activeTab === 'scheduled' && (
        <ScheduledReportsList
          scheduled={scheduled}
          onToggleActive={(id, active) => updateScheduledReport(id, { active })}
          onDelete={handleDeleteSchedule}
        />
      )}

      {activeTab === 'audit' && <ReportAuditLogTable auditLog={auditLog} />}

      {config && (
        <>
          <ReportEmailModal open={emailOpen} reportName={config.name} onClose={() => setEmailOpen(false)} onSend={handleEmailSent} />
          <ReportScheduleModal open={scheduleOpen} reportName={config.name} onClose={() => setScheduleOpen(false)} onCreate={handleScheduleCreate} />
        </>
      )}

      <ReportsGlobalFilterDrawer
        open={globalFilterOpen}
        onClose={() => setGlobalFilterOpen(false)}
        draft={globalFilterDraft}
        onDraftChange={(patch) => setGlobalFilterDraft((d) => ({ ...d, ...patch }))}
        onApply={applyGlobalFilters}
        onReset={resetGlobalFilters}
        onClearAll={clearAllGlobalFilters}
      />
    </div>
  );
}
