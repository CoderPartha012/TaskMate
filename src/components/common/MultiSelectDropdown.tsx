import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectDropdown({ label, options, selected, onChange }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleValue = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 border border-white/[0.08] focus:outline-none focus:border-jade transition-colors"
      >
        <span className={selected.length === 0 ? 'text-white/35' : ''}>
          {selected.length === 0 ? `All ${label.toLowerCase()}` : `${selected.length} selected`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-white/35 shrink-0" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-noir-600 border border-white/[0.1] rounded-lg shadow-2xl py-1 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                  className="w-3.5 h-3.5 rounded accent-jade"
                />
                {opt.label}
              </span>
              {opt.count != null && <span className="text-white/30">({opt.count})</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
