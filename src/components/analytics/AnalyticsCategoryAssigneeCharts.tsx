import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine,
} from 'recharts';
import { Task, TaskType } from '../../types';
import { getCategoryBreakdown, getAssigneeWorkloadByStatus } from '../../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, STATUS_COLORS, AssigneeAvatar, C } from '../common/analyticsShared';
import { CATEGORY_COLORS } from '../../utils/categoryColors';
import { AnalyticsFilters } from './analyticsFilterTypes';
import { RepositoryHandoff } from '../../utils/repositoryHandoff';

const CATEGORY_ORDER: TaskType[] = ['general', 'workflow', 'project', 'ai', 'contract'];

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

interface CategoryBarProps {
  data: { name: string; value: number }[];
  onDrillDown: (patch: Partial<AnalyticsFilters>) => void;
}

function CategoryBar({ data, onDrillDown }: CategoryBarProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }} barSize={16}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={140} axisLine={false} tickLine={false} tick={{ fill: C.muted, fontSize: 11 }} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar
          dataKey="value"
          radius={[0, 6, 6, 0]}
          animationDuration={700}
          onClick={(_, i) => onDrillDown({ taskCategory: CATEGORY_ORDER[i] })}
          style={{ cursor: 'pointer' }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[CATEGORY_ORDER[i]]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            content={({ x, y, width, height, value }) => {
              const pct = total ? Math.round((Number(value) / total) * 100) : 0;
              return (
                <text
                  x={Number(x) + Number(width) + 6}
                  y={Number(y) + Number(height) / 2 + 4}
                  fontSize={11}
                  fontWeight={600}
                  fill={C.muted}
                >
                  {value} ({pct}%)
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AssigneeTick({ x, y, payload }: any) {
  const name: string = payload.value;
  return (
    <foreignObject x={Number(x) - 140} y={Number(y) - 10} width={132} height={20}>
      <div className="flex items-center gap-1.5 justify-end h-full">
        <span className="text-[11px] text-white/50 truncate">{name}</span>
        <AssigneeAvatar name={name} size={16} />
      </div>
    </foreignObject>
  );
}

interface AssigneeWorkloadChartProps {
  tasks: Task[];
  onDrillDown: (patch: Partial<AnalyticsFilters>) => void;
}

function AssigneeWorkloadChart({ tasks, onDrillDown }: AssigneeWorkloadChartProps) {
  const [showAll, setShowAll] = useState(false);
  const allRows = getAssigneeWorkloadByStatus(tasks);
  const rows = showAll ? allRows : allRows.slice(0, 10);
  const avg = allRows.length > 0 ? allRows.reduce((s, r) => s + r.total, 0) / allRows.length : 0;

  if (allRows.length === 0) return <EmptyState />;

  const handleBarClick = (data: { name?: string }) => {
    if (data?.name) onDrillDown({ assignee: data.name });
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 42)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barSize={16}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={140} axisLine={false} tickLine={false} tick={<AssigneeTick />} />
          <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine x={avg} stroke={C.muted} strokeDasharray="4 4" ifOverflow="extendDomain" />
          <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS[0]} onClick={handleBarClick} style={{ cursor: 'pointer' }} />
          <Bar dataKey="inProgress" name="In Progress" stackId="a" fill={STATUS_COLORS[1]} onClick={handleBarClick} style={{ cursor: 'pointer' }} />
          <Bar dataKey="completed" name="Completed" stackId="a" fill={STATUS_COLORS[2]} radius={[0, 6, 6, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
            <LabelList dataKey="total" position="right" style={{ fill: C.muted, fontSize: 11, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {allRows.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-[11px] font-semibold text-jade hover:text-jade-light transition-colors mt-2"
        >
          {showAll ? 'Show top 10' : `Show all ${allRows.length} assignees`}
        </button>
      )}
    </>
  );
}

interface AnalyticsCategoryAssigneeChartsProps {
  tasks: Task[];
  onDrillDown: (patch: Partial<AnalyticsFilters>) => void;
  onViewInRepository: (handoff: RepositoryHandoff) => void;
  viewInRepositoryHandoff: RepositoryHandoff;
}

export function AnalyticsCategoryAssigneeCharts({ tasks, onDrillDown, onViewInRepository, viewInRepositoryHandoff }: AnalyticsCategoryAssigneeChartsProps) {
  const categoryData = getCategoryBreakdown(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard
        title="Tasks by Category"
        subtitle="Task count across the five task categories — click a bar to filter"
        action={<ViewTasksAction onClick={() => onViewInRepository(viewInRepositoryHandoff)} />}
      >
        {categoryData.every((d) => d.value === 0) ? <EmptyState /> : <CategoryBar data={categoryData} onDrillDown={onDrillDown} />}
      </ChartCard>

      <ChartCard
        title="Assignee Workload"
        subtitle="Status composition per assignee — click a segment to filter"
        action={<ViewTasksAction onClick={() => onViewInRepository(viewInRepositoryHandoff)} />}
      >
        <AssigneeWorkloadChart tasks={tasks} onDrillDown={onDrillDown} />
      </ChartCard>
    </div>
  );
}
