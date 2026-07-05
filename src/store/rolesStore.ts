import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, PermissionKey, createDefaultRoles, createEmptyRolePermissions } from '../types/roles.types';

interface RolesState {
  roles: Role[];
  currentRoleId: string;
  addRole: (name: string, description: string) => void;
  updateRole: (id: string, updates: Partial<Pick<Role, 'name' | 'description'>>) => void;
  deleteRole: (id: string) => void;
  setPermission: (roleId: string, key: PermissionKey, value: boolean) => void;
  setCurrentRoleId: (id: string) => void;
}

export const useRolesStore = create<RolesState>()(
  persist(
    (set) => ({
      roles: createDefaultRoles(),
      currentRoleId: 'administrator',

      addRole: (name, description) => {
        set((state) => ({
          roles: [...state.roles, {
            id: crypto.randomUUID(),
            name: name.trim() || 'Untitled Role',
            description: description.trim(),
            isSystem: false,
            permissions: createEmptyRolePermissions(),
          }],
        }));
      },
      updateRole: (id, updates) => {
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },
      deleteRole: (id) => {
        set((state) => ({
          roles: state.roles.filter((r) => !(r.id === id && !r.isSystem)),
          currentRoleId: state.currentRoleId === id ? 'administrator' : state.currentRoleId,
        }));
      },
      setPermission: (roleId, key, value) => {
        set((state) => ({
          roles: state.roles.map((r) =>
            r.id === roleId ? { ...r, permissions: { ...r.permissions, [key]: value } } : r
          ),
        }));
      },
      setCurrentRoleId: (id) => set({ currentRoleId: id }),
    }),
    { name: 'roles-storage' }
  )
);
