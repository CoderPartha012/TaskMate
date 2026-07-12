import React from 'react';
import { Plug, MessageSquare, Video, Github, Trello } from 'lucide-react';
import { OrgIntegration } from '../../../store/organizationStore';

const INTEGRATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  teams: Video,
  slack: MessageSquare,
  'google-workspace': Plug,
  github: Github,
  jira: Trello,
};

interface OrgIntegrationsSectionProps {
  integrations: OrgIntegration[];
  onToggle: (key: string) => void;
}

export function OrgIntegrationsSection({ integrations, onToggle }: OrgIntegrationsSectionProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Integrations</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {integrations.map((integration) => {
          const Icon = INTEGRATION_ICONS[integration.key] ?? Plug;
          return (
            <div key={integration.key} className="flex items-center gap-3 bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3">
              <span className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white/50" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/85 truncate">{integration.name}</p>
                <span className={`text-[10px] font-bold ${integration.connected ? 'text-jade' : 'text-white/35'}`}>
                  {integration.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggle(integration.key)}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors shrink-0"
              >
                Manage
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
