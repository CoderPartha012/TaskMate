import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { useRolesStore } from '../../store/rolesStore';
import { PERMISSION_DEFS } from '../../types/roles.types';

const PERMISSION_GROUPS = [...new Set(PERMISSION_DEFS.map((p) => p.group))];

export function RolesPermissionsPage() {
  const { roles, currentRoleId, addRole, updateRole, deleteRole, setPermission, setCurrentRoleId } = useRolesStore();
  const [addingRole, setAddingRole] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddRole = () => {
    if (!newName.trim()) return;
    addRole(newName, newDescription);
    setNewName('');
    setNewDescription('');
    setAddingRole(false);
  };

  return (
    <div className="space-y-5">
      {/* Role cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Roles — click a card to simulate viewing as that role
          </p>
          <button
            type="button"
            onClick={() => setAddingRole((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Role
          </button>
        </div>

        {addingRole && (
          <div className="flex flex-col sm:flex-row gap-2 bg-noir-600 border border-white/[0.07] rounded-lg p-3 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Role name"
              className="flex-1 bg-noir-700 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short description"
              className="flex-1 bg-noir-700 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
            />
            <button type="button" onClick={handleAddRole} disabled={!newName.trim()} className="text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
              Save
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((role) => {
            const isActive = role.id === currentRoleId;
            const grantedCount = Object.values(role.permissions).filter(Boolean).length;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setCurrentRoleId(role.id)}
                className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all ${
                  isActive ? 'border-jade bg-jade/[0.07]' : 'border-white/[0.07] hover:border-white/[0.15] bg-noir-600'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className={`text-xs font-bold ${isActive ? 'text-jade' : 'text-white/80'}`}>{role.name}</span>
                  {role.isSystem ? (
                    <ShieldCheck className="w-3 h-3 text-white/25 shrink-0" />
                  ) : (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); deleteRole(role.id); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); deleteRole(role.id); } }}
                      title="Delete role"
                      className="ml-auto text-white/25 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/35 leading-relaxed">{role.description}</p>
                <p className="text-[10px] font-semibold text-white/30">{grantedCount}/{PERMISSION_DEFS.length} permissions</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-white/[0.12]">
              <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Permission</th>
              {roles.map((role) => (
                <th key={role.id} className="px-3 py-2.5 text-[11px] font-semibold text-white/60 text-center whitespace-nowrap">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <React.Fragment key={group}>
                <tr>
                  <td colSpan={roles.length + 1} className="px-3 pt-4 pb-1 text-[10px] font-bold text-jade uppercase tracking-wide">
                    {group}
                  </td>
                </tr>
                {PERMISSION_DEFS.filter((p) => p.group === group).map((perm) => (
                  <tr key={perm.key} className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-3 py-2 text-xs text-white/65 whitespace-nowrap">{perm.label}</td>
                    {roles.map((role) => {
                      const locked = role.id === 'administrator';
                      return (
                        <td key={role.id} className="px-3 py-2 text-center">
                          {locked ? (
                            <span title="Administrators always have full access" className="inline-flex">
                              <Lock className="w-3.5 h-3.5 text-jade/60 mx-auto" />
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={role.permissions[perm.key]}
                              onChange={(e) => setPermission(role.id, perm.key, e.target.checked)}
                              className="accent-jade w-3.5 h-3.5"
                              aria-label={`${perm.label} for ${role.name}`}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional description editing for custom roles */}
      {roles.some((r) => !r.isSystem) && (
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">Edit Custom Role Details</p>
          <div className="space-y-2">
            {roles.filter((r) => !r.isSystem).map((role) => (
              <div key={role.id} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={role.name}
                  onChange={(e) => updateRole(role.id, { name: e.target.value })}
                  className="flex-1 bg-noir-600 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-jade transition-colors"
                />
                <input
                  type="text"
                  value={role.description}
                  onChange={(e) => updateRole(role.id, { description: e.target.value })}
                  className="flex-1 bg-noir-600 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-jade transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
