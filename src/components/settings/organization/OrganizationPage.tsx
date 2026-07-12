import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, AlertTriangle, X, Save } from 'lucide-react';
import {
  useOrganizationStore, OrgOverview, OrgBranding, OrgRegional, OrgWorkspaceDefaults, OrgWorkingCalendar,
} from '../../../store/organizationStore';
import { useToastStore } from '../../../store/toastStore';
import { exportOrganizationReport } from '../../../utils/orgReportExport';
import { OrgOverviewSection } from './OrgOverviewSection';
import { OrgBrandingSection } from './OrgBrandingSection';
import { OrgRegionalSection } from './OrgRegionalSection';
import { OrgWorkspaceDefaultsSection } from './OrgWorkspaceDefaultsSection';
import { OrgWorkingDaysSection } from './OrgWorkingDaysSection';
import { OrgMembersSummarySection } from './OrgMembersSummarySection';
import { OrgStorageSection } from './OrgStorageSection';
import { OrgSecuritySection } from './OrgSecuritySection';
import { OrgIntegrationsSection } from './OrgIntegrationsSection';
import { OrgActivityTimelineSection } from './OrgActivityTimelineSection';
import { OrgHealthSidebar } from './OrgHealthSidebar';
import { ProfileSkeleton } from '../profile/ProfileSkeleton';

interface OrgDraft {
  overview: OrgOverview;
  branding: OrgBranding;
  regional: OrgRegional;
  workspaceDefaults: OrgWorkspaceDefaults;
  workingCalendar: Omit<OrgWorkingCalendar, 'holidays'>;
}

function buildDraft(state: {
  overview: OrgOverview; branding: OrgBranding; regional: OrgRegional;
  workspaceDefaults: OrgWorkspaceDefaults; workingCalendar: OrgWorkingCalendar;
}): OrgDraft {
  return {
    overview: state.overview,
    branding: state.branding,
    regional: state.regional,
    workspaceDefaults: state.workspaceDefaults,
    workingCalendar: {
      workingDays: state.workingCalendar.workingDays,
      startTime: state.workingCalendar.startTime,
      endTime: state.workingCalendar.endTime,
      lunchStart: state.workingCalendar.lunchStart,
      lunchEnd: state.workingCalendar.lunchEnd,
    },
  };
}

interface OrganizationPageProps {
  onBack: () => void;
  onNavigateUserManagement: () => void;
}

export function OrganizationPage({ onBack, onNavigateUserManagement }: OrganizationPageProps) {
  const store = useOrganizationStore();

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<OrgDraft>(() => buildDraft(store));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const storedDraft = buildDraft(store);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(storedDraft);

  const handleCancel = () => setDraft(storedDraft);

  const handleSave = () => {
    if (!isDirty) return;
    store.updateOverview(draft.overview);
    store.updateBranding(draft.branding);
    store.updateRegional(draft.regional);
    store.updateWorkspaceDefaults(draft.workspaceDefaults);
    store.updateWorkingCalendar(draft.workingCalendar);
    store.addActivityEntry('Organization settings updated');
    useToastStore.getState().showToast({ message: 'Organization settings saved successfully' });
  };

  const handleDownloadReport = () => {
    exportOrganizationReport({
      overview: store.overview,
      members: store.members,
      storage: store.storage,
      security: store.security,
      plan: store.plan,
    });
    useToastStore.getState().showToast({ message: 'Organization report downloaded' });
  };

  const comingSoon = () => {
    useToastStore.getState().showToast({ message: "This section hasn't been built yet" });
  };

  const healthScore = Math.min(100, Math.round(store.security.score * 1.03));

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
            <h1 className="font-display font-bold text-2xl text-white">Organization</h1>
            <p className="text-xs text-white/45 mt-1">Manage your organization's information, branding, regional settings and workspace defaults.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!isDirty}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Discard
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start pb-16">
        <div className="space-y-6 min-w-0">
          <OrgOverviewSection
            draft={draft.overview}
            logoDataUrl={draft.branding.logoDataUrl}
            onChange={(patch) => setDraft((d) => ({ ...d, overview: { ...d.overview, ...patch } }))}
            onLogoChange={(dataUrl) => setDraft((d) => ({ ...d, branding: { ...d.branding, logoDataUrl: dataUrl } }))}
          />

          <OrgBrandingSection
            draft={draft.branding}
            onChange={(patch) => setDraft((d) => ({ ...d, branding: { ...d.branding, ...patch } }))}
          />

          <OrgRegionalSection
            draft={draft.regional}
            onChange={(patch) => setDraft((d) => ({ ...d, regional: { ...d.regional, ...patch } }))}
          />

          <OrgWorkspaceDefaultsSection
            draft={draft.workspaceDefaults}
            onChange={(patch) => setDraft((d) => ({ ...d, workspaceDefaults: { ...d.workspaceDefaults, ...patch } }))}
          />

          <OrgWorkingDaysSection
            draft={{ ...draft.workingCalendar, holidays: store.workingCalendar.holidays }}
            timezone={draft.regional.timezone}
            onChange={(patch) => setDraft((d) => ({ ...d, workingCalendar: { ...d.workingCalendar, ...patch } }))}
            onImportCSV={store.importHolidaysFromCSV}
            onImportPublicHolidays={store.importPublicHolidays}
            onRemoveHoliday={store.removeHoliday}
          />

          <OrgMembersSummarySection members={store.members} onViewAll={onNavigateUserManagement} />

          <OrgStorageSection storage={store.storage} onUpgrade={store.upgradeStorage} onCleanTemporaryFiles={store.cleanTemporaryFiles} />

          <OrgSecuritySection security={store.security} />

          <OrgIntegrationsSection integrations={store.integrations} onToggle={store.toggleIntegration} />

          <OrgActivityTimelineSection entries={store.activityLog} />
        </div>

        <OrgHealthSidebar
          healthScore={healthScore}
          createdAt={store.createdAt}
          owner={store.owner}
          plan={store.plan}
          totalUsers={store.members.totalUsers}
          storageUsed={`${store.storage.usedGB} / ${store.storage.totalGB} GB`}
          timezone={store.regional.timezone}
          country={store.regional.country}
          lastModified={store.lastModified}
          onInviteUsers={onNavigateUserManagement}
          onManageBilling={comingSoon}
          onManageWorkspaces={comingSoon}
          onDownloadReport={handleDownloadReport}
        />
      </div>

      <div className="sticky bottom-0 bg-noir-800/95 backdrop-blur-sm border-t border-white/[0.06] px-1 py-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-white/30">Last Updated: {format(new Date(store.lastModified), 'MMM d, yyyy h:mm a')}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
