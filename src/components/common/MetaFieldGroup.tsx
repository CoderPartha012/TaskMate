import React from 'react';
import { MetaFieldConfig } from './metaFieldConfigs';

const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none transition-colors placeholder:text-white/25 border border-white/[0.08] focus:border-jade disabled:opacity-40 disabled:cursor-not-allowed';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-widest text-white/40';

interface MetaFieldGroupProps {
  fields: MetaFieldConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function MetaFieldGroup({ fields, values, onChange }: MetaFieldGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const id = `meta-${field.key}`;
        const value = values[field.key] ?? '';
        const wide = field.type === 'textarea';

        return (
          <div key={field.key} className={wide ? 'md:col-span-2' : undefined}>
            <label htmlFor={id} className={labelClass}>
              {field.label} {field.required && <span className="text-priority-high" aria-hidden="true">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                rows={3}
                readOnly={field.readOnly}
                disabled={field.readOnly}
                placeholder={field.placeholder}
                className={`${inputBase} resize-none`}
              />
            ) : field.type === 'select' ? (
              <select
                id={id}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={field.readOnly}
                className={inputBase}
              >
                <option value="">— Select —</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                type={field.type}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                readOnly={field.readOnly}
                disabled={field.readOnly}
                placeholder={field.placeholder}
                className={inputBase}
              />
            )}

            {field.helpText && (
              <p className="mt-1 text-[10px] text-white/25">{field.helpText}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
