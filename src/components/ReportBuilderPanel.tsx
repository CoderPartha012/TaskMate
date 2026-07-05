import React from 'react';
import { ArrowUpDown, PieChart as PieIcon, BarChart2, LineChart as LineIcon, Circle } from 'lucide-react';
import { ReportConfig, REPORT_COLUMNS, GroupByKey } from '../types/report.types';
import { TASK_TYPE_LABELS } from './TaskTypeSelector';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/40';
const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

interface ReportBuilderPanelProps {
  config: ReportConfig;
  onChange: (patch: Partial<ReportConfig>) => void;
}

const GROUP_OPTIONS: { value: GroupByKey; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'taskType', label: 'Category' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'project', label: 'Project' },
  { value: 'workflow', label: 'Workflow' },
];

const CHART_TYPES: { value: NonNullable<ReportConfig['chartType']>; label: string; icon: React.ReactNode }[] = [
  { value: 'pie', label: 'Pie', icon: <PieIcon className="w-3.5 h-3.5" /> },
  { value: 'bar', label: 'Bar', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { value: 'line', label: 'Line', icon: <LineIcon className="w-3.5 h-3.5" /> },
  { value: 'doughnut', label: 'Doughnut', icon: <Circle className="w-3.5 h-3.5" /> },
];

export function ReportBuilderPanel({ config, onChange }: ReportBuilderPanelProps) {
  const toggleColumn = (key: ReportConfig['columns'][number]) => {
    const has = config.columns.includes(key);
    onChange({ columns: has ? config.columns.filter((c) => c !== key) : [...config.columns, key] });
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5 space-y-5">
      <div>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Report name"
          className="w-full bg-transparent font-display font-bold text-base text-white focus:outline-none border-b border-white/[0.08] focus:border-jade pb-2"
        />
      </div>

      {/* Columns */}
      <div>
        <p className={labelClass}>Columns</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
          {REPORT_COLUMNS.map((col) => (
            <label key={col.key} className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={config.columns.includes(col.key)}
                onChange={() => toggleColumn(col.key)}
                className="accent-jade"
              />
              {col.label}
            </label>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div>
        <p className={labelClass}>Filters</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div className="grid grid-cols-2 gap-2 md:col-span-2">
            <input type="date" value={config.filters.dateFrom} onChange={(e) => onChange({ filters: { ...config.filters, dateFrom: e.target.value } })} aria-label="Date from" className={inputBase} />
            <input type="date" value={config.filters.dateTo} onChange={(e) => onChange({ filters: { ...config.filters, dateTo: e.target.value } })} aria-label="Date to" className={inputBase} />
          </div>
          <select value={config.filters.taskCategory} onChange={(e) => onChange({ filters: { ...config.filters, taskCategory: e.target.value as never } })} className={inputBase}>
            <option value="">All Categories</option>
            {Object.entries(TASK_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={config.filters.status} onChange={(e) => onChange({ filters: { ...config.filters, status: e.target.value as never } })} className={inputBase}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={config.filters.priority} onChange={(e) => onChange({ filters: { ...config.filters, priority: e.target.value as never } })} className={inputBase}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input type="text" value={config.filters.assignee} onChange={(e) => onChange({ filters: { ...config.filters, assignee: e.target.value } })} placeholder="Assignee" className={inputBase} />
          <input type="text" value={config.filters.createdBy} onChange={(e) => onChange({ filters: { ...config.filters, createdBy: e.target.value } })} placeholder="Created By" className={inputBase} />
          <input type="text" value={config.filters.project} onChange={(e) => onChange({ filters: { ...config.filters, project: e.target.value } })} placeholder="Project (epic/sprint/milestone)" className={inputBase} />
          <input type="text" value={config.filters.workflow} onChange={(e) => onChange({ filters: { ...config.filters, workflow: e.target.value } })} placeholder="Workflow stage" className={inputBase} />
          <input type="text" value={config.filters.contractType} onChange={(e) => onChange({ filters: { ...config.filters, contractType: e.target.value } })} placeholder="Contract Type (e.g. NDA)" className={inputBase} />
          <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
            <input type="checkbox" checked={config.overdueOnly} onChange={(e) => onChange({ overdueOnly: e.target.checked })} className="accent-jade" />
            Overdue only
          </label>
        </div>
      </div>

      {/* Sort + Group */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <p className={labelClass}>Sort By</p>
          <select value={config.sortBy} onChange={(e) => onChange({ sortBy: e.target.value as never })} className={inputBase}>
            {config.columns.map((key) => {
              const def = REPORT_COLUMNS.find((c) => c.key === key);
              return <option key={key} value={key}>{def?.label ?? key}</option>;
            })}
          </select>
        </div>
        <div>
          <p className={labelClass}>Direction</p>
          <button
            type="button"
            onClick={() => onChange({ sortDir: config.sortDir === 'asc' ? 'desc' : 'asc' })}
            className={`${inputBase} flex items-center justify-between hover:border-jade/40 transition-colors`}
          >
            {config.sortDir === 'asc' ? 'Ascending' : 'Descending'}
            <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
        <div>
          <p className={labelClass}>Group By</p>
          <select value={config.groupBy} onChange={(e) => onChange({ groupBy: e.target.value as GroupByKey })} className={inputBase}>
            {GROUP_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div>
        <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer mb-2">
          <input type="checkbox" checked={config.includeChart} onChange={(e) => onChange({ includeChart: e.target.checked, chartType: e.target.checked ? (config.chartType || 'bar') : '' })} className="accent-jade" />
          Include chart in report
        </label>
        {config.includeChart && (
          <div className="flex gap-2">
            {CHART_TYPES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onChange({ chartType: c.value })}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  config.chartType === c.value ? 'border-jade/30 bg-jade/10 text-jade' : 'border-white/[0.08] text-white/40 hover:text-white/65'
                }`}
              >
                {c.icon}
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
