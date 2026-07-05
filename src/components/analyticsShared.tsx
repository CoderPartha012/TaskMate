import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const C = {
  jade:   '#00C896',
  amber:  '#FFA502',
  coral:  '#FF4757',
  blue:   '#5382ED',
  purple: '#AF52DE',
  pink:   '#EC4899',
  gray:   '#9CA3AF',
  muted:  '#787E8C',
  bg:     '#13131A',
};

export const CATEGORY_COLORS = [C.blue, C.purple, C.amber, C.pink, C.coral];
export const STATUS_COLORS = [C.coral, C.amber, C.jade, C.gray, C.muted];
export const PRIORITY_COLORS = [C.jade, C.amber, C.coral, C.purple];

export const tooltipStyle: React.CSSProperties = {
  background: C.bg,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#F4F4F8',
  fontSize: '12px',
  padding: '8px 12px',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      {label && <p className="text-[11px] text-white/50 mb-1">{label}</p>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: p.color || p.fill || C.jade }}>
          {p.name ? `${p.name}: ` : ''}{p.value}
        </p>
      ))}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, className = '', action }: ChartCardProps) {
  return (
    <div className={`bg-noir-700 border border-white/[0.06] rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-display font-bold text-sm text-white/80 leading-tight">{title}</p>
          <p className="text-[10px] text-white/35 mt-0.5">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ label = 'No data yet — add some tasks to see charts' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-white/20 text-xs text-center px-4">
      {label}
    </div>
  );
}

export function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const isUp = value > 0;
  const isFlat = value === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
      isFlat ? 'text-white/30' : isUp ? 'text-jade' : 'text-red-400'
    }`}>
      {!isFlat && (isUp ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
      {isFlat ? '—' : `${Math.abs(value)}%`}
    </span>
  );
}

export const GranularityToggle = ({
  value, onChange,
}: { value: 'daily' | 'weekly' | 'monthly'; onChange: (v: 'daily' | 'weekly' | 'monthly') => void }) => (
  <div className="flex gap-0.5 bg-noir-600 rounded-lg p-0.5">
    {(['daily', 'weekly', 'monthly'] as const).map((g) => (
      <button
        key={g}
        type="button"
        onClick={() => onChange(g)}
        className={`text-[10px] font-semibold px-2 py-1 rounded-md capitalize transition-colors ${
          value === g ? 'bg-jade/15 text-jade' : 'text-white/40 hover:text-white/70'
        }`}
      >
        {g}
      </button>
    ))}
  </div>
);
