import { OrgMembersSummary, OrgOverview, OrgSecurity, OrgStorage } from '../store/organizationStore';

interface OrgReportInput {
  overview: OrgOverview;
  members: OrgMembersSummary;
  storage: OrgStorage;
  security: OrgSecurity;
  plan: string;
}

export function exportOrganizationReport({ overview, members, storage, security, plan }: OrgReportInput): void {
  const lines = [
    `Organization Report — ${overview.name}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '== Overview ==',
    `Organization ID: ${overview.orgId}`,
    `Workspace URL: ${overview.workspaceUrl}`,
    `Industry: ${overview.industry}`,
    `Company Size: ${overview.companySize}`,
    `Business Type: ${overview.businessType}`,
    `Founded: ${overview.foundedYear}`,
    `Plan: ${plan}`,
    '',
    '== Members ==',
    `Total Users: ${members.totalUsers}`,
    `Admins: ${members.admins}`,
    `Managers: ${members.managers}`,
    `Employees: ${members.employees}`,
    `Guests: ${members.guests}`,
    `Pending Invitations: ${members.pendingInvitations}`,
    '',
    '== Storage ==',
    `Used: ${storage.usedGB} GB / ${storage.totalGB} GB`,
    ...storage.breakdown.map((b) => `  ${b.label}: ${b.gb} GB`),
    '',
    '== Security ==',
    `Two-Factor Authentication: ${security.twoFactorEnabled ? 'Enabled' : 'Disabled'}`,
    `SSO: ${security.ssoConfigured ? 'Configured' : 'Not Configured'}`,
    `Password Policy: ${security.passwordPolicy}`,
    `Security Score: ${security.score}%`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${overview.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-organization-report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
