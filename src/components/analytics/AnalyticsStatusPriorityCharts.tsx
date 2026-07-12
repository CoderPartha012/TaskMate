import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Priority, Status, Task } from '../../types';
import { getStatusBreakdown, getPriorityBreakdown } from '../../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, STATUS_COLORS, PRIORITY_COLORS, C } from '../common/analyticsShared';
import { AnalyticsFilters } from './analyticsFilterTypes';
import { RepositoryHandoff } from '../../utils/repositoryHandoff';

const PRIORITY_KEYS: Priority[] = ['low', 'medium', 'high'];

const STATUS_NAME_TO_KEY: Record<string, Status> = {
  Pending: 'pending',
  'In Progress': 'in-progress',
  Completed: 'completed',
};

function ViewTasksAction({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-semibold text-jade hover:text-jade-light transition-colors whitespace-nowrap"
    >
      View tasks →
    </button>
  );
}

interface AnalyticsStatusPriorityChartsProps {
  tasks: Task[];
  onDrillDown: (patch: Partial<AnalyticsFilters>) => void;
  onViewInRepository: (handoff: RepositoryHandoff) => void;
  viewInRepositoryHandoff: RepositoryHandoff;
}

export function AnalyticsStatusPriorityCharts({ tasks, onDrillDown, onViewInRepository, viewInRepositoryHandoff }: AnalyticsStatusPriorityChartsProps) {
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState<number | null>(null);
  const statusData = getStatusBreakdown(tasks).filter((d) => d.value > 0);
  const priorityData = getPriorityBreakdown(tasks);
  const total = tasks.length;
  const hoveredStatus = hoveredStatusIndex !== null ? statusData[hoveredStatusIndex] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard
        title="Tasks by Status"
        subtitle="Distribution across all statuses — click a slice to filter"
        action={<ViewTasksAction onClick={() => onViewInRepository(viewInRepositoryHandoff)} />}
      >
        {statusData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                    labelLine={false}
                    label={false}
                    onMouseEnter={(_, i) => setHoveredStatusIndex(i)}
                    onMouseLeave={() => setHoveredStatusIndex(null)}
                    onClick={(_, i) => onDrillDown({ status: STATUS_NAME_TO_KEY[statusData[i].name] })}
                    style={{ cursor: 'pointer' }}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0];
                      const pct = total ? Math.round((Number(d.value) / total) * 100) : 0;
                      return (
                        <div style={{ background: C.bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px' }}>
                          <p style={{ color: d.payload.fill }} className="font-semibold text-xs">{d.name}</p>
                          <p className="text-white/70 text-xs">{d.value} tasks · {pct}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {hoveredStatus ? (
                  <>
                    <span className="font-display font-black text-3xl text-white leading-none">{hoveredStatus.value}</span>
                    <span className="text-[10px] text-white/35 mt-0.5">
                      {hoveredStatus.name} · {total ? Math.round((hoveredStatus.value / total) * 100) : 0}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-display font-black text-3xl text-white leading-none">{total}</span>
                    <span className="text-[10px] text-white/35 mt-0.5">Tasks</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                  <span className="text-[11px] text-white/50">{d.name}</span>
                  <span className="text-[11px] font-bold text-white/70">
                    {d.value} ({total ? Math.round((d.value / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </ChartCard>

      <ChartCard
        title="Tasks by Priority"
        subtitle="Task count broken down by priority level — click a bar to filter"
        action={<ViewTasksAction onClick={() => onViewInRepository(viewInRepositoryHandoff)} />}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={priorityData} margin={{ top: 24, right: 10, left: -20, bottom: 0 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey="value"
              name="Tasks"
              radius={[6, 6, 0, 0]}
              animationDuration={700}
              onClick={(_, i) => onDrillDown({ priority: PRIORITY_KEYS[i] })}
              style={{ cursor: 'pointer' }}
            >
              {priorityData.map((_, i) => (
                <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                content={({ x, y, width, value }) => {
                  const pct = total ? Math.round((Number(value) / total) * 100) : 0;
                  const cx = Number(x) + Number(width) / 2;
                  return (
                    <text x={cx} y={Number(y) - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#F1F5F9">
                      {value} ({pct}%)
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
