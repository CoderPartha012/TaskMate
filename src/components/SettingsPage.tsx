import React, { useState } from 'react';
import {
  User, Building2, Users, ShieldCheck, ListChecks, Workflow, KanbanSquare, Sparkles,
  FileSignature, Bell, Palette, Table2, BarChart2, FileDown, Plug, Lock, DatabaseBackup,
  Mail, Settings2, ScrollText, LifeBuoy, Construction,
} from 'lucide-react';
import { RolesPermissionsPage } from './RolesPermissionsPage';

interface SettingsFeature {
  key: string;
  label: string;
  icon: React.ReactNode;
  overview: string;
}

const SETTINGS_FEATURES: SettingsFeature[] = [
  { key: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, overview: 'Manage your personal information, avatar, and account preferences.' },
  { key: 'organization', label: 'Organization', icon: <Building2 className="w-5 h-5" />, overview: 'Configure organization details, branding, and company-wide defaults.' },
  { key: 'user-management', label: 'User Management', icon: <Users className="w-5 h-5" />, overview: 'Add, remove, and manage user accounts across the organization.' },
  { key: 'roles-permissions', label: 'Roles & Permissions', icon: <ShieldCheck className="w-5 h-5" />, overview: 'Define roles and control what each role can view, create, or manage.' },
  { key: 'task-settings', label: 'Task Settings', icon: <ListChecks className="w-5 h-5" />, overview: 'Configure default behavior, statuses, and options for general tasks.' },
  { key: 'workflow-settings', label: 'Workflow Settings', icon: <Workflow className="w-5 h-5" />, overview: 'Configure stages, approval levels, and SLA rules for workflow-based tasks.' },
  { key: 'project-settings', label: 'Project Settings', icon: <KanbanSquare className="w-5 h-5" />, overview: 'Manage sprints, epics, milestones, and project defaults.' },
  { key: 'ai-settings', label: 'AI Settings', icon: <Sparkles className="w-5 h-5" />, overview: 'Configure AI models, execution rules, and automation defaults.' },
  { key: 'contract-settings', label: 'Contract Settings', icon: <FileSignature className="w-5 h-5" />, overview: 'Manage contract types, templates, and compliance defaults.' },
  { key: 'notification', label: 'Notification', icon: <Bell className="w-5 h-5" />, overview: "Control which events trigger notifications and how they're delivered." },
  { key: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" />, overview: 'Customize theme, colors, and display preferences.' },
  { key: 'repository', label: 'Repository', icon: <Table2 className="w-5 h-5" />, overview: 'Configure default views, columns, and filters for the task repository.' },
  { key: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" />, overview: 'Customize dashboard widgets, default filters, and KPI targets.' },
  { key: 'reports', label: 'Reports', icon: <FileDown className="w-5 h-5" />, overview: 'Manage report templates, defaults, and export preferences.' },
  { key: 'integrations', label: 'Integrations', icon: <Plug className="w-5 h-5" />, overview: 'Connect TaskMate with third-party tools and external services.' },
  { key: 'security', label: 'Security', icon: <Lock className="w-5 h-5" />, overview: 'Manage authentication, sessions, and access security settings.' },
  { key: 'backup-restore', label: 'Backup & Restore', icon: <DatabaseBackup className="w-5 h-5" />, overview: 'Export, back up, or restore your TaskMate data.' },
  { key: 'email-configuration', label: 'Email Configuration', icon: <Mail className="w-5 h-5" />, overview: 'Configure outgoing email settings for notifications and reports.' },
  { key: 'system-configuration', label: 'System Configuration', icon: <Settings2 className="w-5 h-5" />, overview: 'Manage core system-wide preferences and defaults.' },
  { key: 'audit-logs', label: 'Audit Logs', icon: <ScrollText className="w-5 h-5" />, overview: 'Review a complete history of system and user activity.' },
  { key: 'help-support', label: 'Help & Support', icon: <LifeBuoy className="w-5 h-5" />, overview: 'Access documentation, guides, and support resources.' },
];

const IMPLEMENTED_FEATURES: Record<string, React.ComponentType> = {
  'roles-permissions': RolesPermissionsPage,
};

export function SettingsPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = SETTINGS_FEATURES.find((f) => f.key === selectedKey) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SETTINGS_FEATURES.map((feature) => {
          const isActive = feature.key === selectedKey;
          return (
            <button
              key={feature.key}
              type="button"
              onClick={() => setSelectedKey(feature.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                isActive
                  ? 'border-jade bg-jade/[0.07]'
                  : 'border-white/[0.07] hover:border-white/[0.15] bg-noir-700'
              }`}
            >
              <span className={`p-2 rounded-lg ${isActive ? 'bg-jade/15 text-jade' : 'bg-white/5 text-white/40'}`}>
                {feature.icon}
              </span>
              <div>
                <p className={`text-xs font-bold leading-snug ${isActive ? 'text-jade' : 'text-white/80'}`}>
                  {feature.label}
                </p>
                <p className="text-[10px] text-white/35 mt-1 leading-relaxed">{feature.overview}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="p-2.5 rounded-xl bg-jade/10 text-jade shrink-0">{selected.icon}</span>
            <div>
              <h2 className="font-display font-bold text-base text-white">{selected.label}</h2>
              <p className="text-xs text-white/45 mt-1 leading-relaxed max-w-lg">{selected.overview}</p>
            </div>
          </div>

          {IMPLEMENTED_FEATURES[selected.key] ? (
            <div className="pt-2 border-t border-white/[0.06] mt-2">
              {React.createElement(IMPLEMENTED_FEATURES[selected.key])}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mt-6">
              <Construction className="w-3.5 h-3.5 shrink-0" />
              This settings page hasn't been built yet — let me know when you'd like to configure it.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-10 text-center text-white/30 text-sm">
          Select a settings category above to view its details.
        </div>
      )}
    </div>
  );
}
