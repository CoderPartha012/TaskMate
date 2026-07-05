export type PermissionKey =
  | 'tasks.create' | 'tasks.edit' | 'tasks.delete'
  | 'repository.view' | 'repository.export'
  | 'analytics.view' | 'analytics.export'
  | 'reports.view' | 'reports.generate' | 'reports.export' | 'reports.delete' | 'reports.schedule'
  | 'settings.manage';

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  group: string;
}

export const PERMISSION_DEFS: PermissionDef[] = [
  { key: 'tasks.create', label: 'Create Tasks', group: 'Tasks' },
  { key: 'tasks.edit', label: 'Edit Tasks', group: 'Tasks' },
  { key: 'tasks.delete', label: 'Delete Tasks', group: 'Tasks' },
  { key: 'repository.view', label: 'View Repository', group: 'Repository' },
  { key: 'repository.export', label: 'Export Repository Data', group: 'Repository' },
  { key: 'analytics.view', label: 'View Analytics', group: 'Analytics' },
  { key: 'analytics.export', label: 'Export Analytics Data', group: 'Analytics' },
  { key: 'reports.view', label: 'View Reports', group: 'Reports' },
  { key: 'reports.generate', label: 'Generate Reports', group: 'Reports' },
  { key: 'reports.export', label: 'Export Reports', group: 'Reports' },
  { key: 'reports.delete', label: 'Delete Reports', group: 'Reports' },
  { key: 'reports.schedule', label: 'Schedule Reports', group: 'Reports' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'System' },
];

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Record<PermissionKey, boolean>;
}

function emptyPermissions(): Record<PermissionKey, boolean> {
  return PERMISSION_DEFS.reduce((acc, p) => {
    acc[p.key] = false;
    return acc;
  }, {} as Record<PermissionKey, boolean>);
}

function withPermissions(overrides: Partial<Record<PermissionKey, boolean>>): Record<PermissionKey, boolean> {
  return { ...emptyPermissions(), ...overrides };
}

export function createEmptyRolePermissions(): Record<PermissionKey, boolean> {
  return emptyPermissions();
}

export function createDefaultRoles(): Role[] {
  return [
    {
      id: 'administrator',
      name: 'Administrator',
      description: 'Full access to every feature, including system and settings management.',
      isSystem: true,
      permissions: withPermissions(PERMISSION_DEFS.reduce((acc, p) => { acc[p.key] = true; return acc; }, {} as Record<PermissionKey, boolean>)),
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Can manage tasks, repository, analytics, and reports, but not system settings.',
      isSystem: true,
      permissions: withPermissions({
        'tasks.create': true, 'tasks.edit': true, 'tasks.delete': true,
        'repository.view': true, 'repository.export': true,
        'analytics.view': true, 'analytics.export': true,
        'reports.view': true, 'reports.generate': true, 'reports.export': true, 'reports.delete': true, 'reports.schedule': true,
      }),
    },
    {
      id: 'team-lead',
      name: 'Team Lead',
      description: 'Can create and edit tasks and generate reports, with limited delete or schedule access.',
      isSystem: true,
      permissions: withPermissions({
        'tasks.create': true, 'tasks.edit': true,
        'repository.view': true, 'repository.export': true,
        'analytics.view': true,
        'reports.view': true, 'reports.generate': true, 'reports.export': true,
      }),
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'Basic access to view and work on tasks, repository, and reports.',
      isSystem: true,
      permissions: withPermissions({
        'tasks.create': true, 'tasks.edit': true,
        'repository.view': true,
        'analytics.view': true,
        'reports.view': true,
      }),
    },
  ];
}
