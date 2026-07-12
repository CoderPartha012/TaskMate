import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Task } from '../../types';
import { getDueDateTimeline, getCompletionRateByCategory } from '../../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, C } from '../common/analyticsShared';
import { RepositoryHandoff, handoffDueRange } from '../../utils/repositoryHandoff';

const DUE_COLORS = [C.coral, C.amber, '#FBBF24', C.blue, C.muted];

function ymd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function dueBucketHandoff(index: number): RepositoryHandoff {
  const now = new Date();
  const dayOffset = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  switch (index) {
    case 0: return handoffDueRange(ymd(now), ymd(now));
    case 1: return handoffDueRange(ymd(dayOffset(1)), ymd(dayOffset(1)));
    case 2: return handoffDueRange(ymd(dayOffset(2)), ymd(dayOffset(7)));
    case 3: return handoffDueRange(ymd(dayOffset(8)), ymd(dayOffset(14)));
    default: return handoffDueRange(ymd(dayOffset(15)), '');
  }
}

interface AnalyticsDueDateCompletionChartsProps {
  tasks: Task[];
  onViewInRepository: (handoff: RepositoryHandoff) => void;
}

export function AnalyticsDueDateCompletionCharts({ tasks, onViewInRepository }: AnalyticsDueDateCompletionChartsProps) {
  const dueData = getDueDateTimeline(tasks);

  const rawCompletion = getCompletionRateByCategory(tasks);
  const completionData = rawCompletion.map((d) => {
    const totalInCat = d.Completed + d.Remaining;
    const completedPct = totalInCat ? Math.round((d.Completed / totalInCat) * 100) : 0;
    return { name: d.name, CompletedPct: completedPct, RemainingPct: totalInCat ? 100 - completedPct : 0, totalInCat };
  });
  const hasCompletionData = completionData.some((d) => d.totalInCat > 0);
  const overallCompletedTotal = rawCompletion.reduce((s, d) => s + d.Completed, 0);
  const overallTotal = rawCompletion.reduce((s, d) => s + d.Completed + d.Remaining, 0);
  const avgCompletionPct = overallTotal > 0 ? Math.round((overallCompletedTotal / overallTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Due Date Timeline" subtitle="Upcoming (non-overdue) tasks by due window — click a column to view">
        {dueData.every((d) => d.value === 0) ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dueData} margin={{ top: 24, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="value"
                name="Tasks"
                radius={[6, 6, 0, 0]}
                animationDuration={700}
                onClick={(_, i) => onViewInRepository(dueBucketHandoff(i))}
                style={{ cursor: 'pointer' }}
              >
                {dueData.map((_, i) => (
                  <Cell key={i} fill={DUE_COLORS[i % DUE_COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fill: '#F1F5F9', fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Completion Rate by Category" subtitle="Completed proportion of each category's tasks">
        {!hasCompletionData ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <ReferenceLine y={avgCompletionPct} stroke={C.muted} strokeDasharray="4 4" label={{ value: `Avg ${avgCompletionPct}%`, position: 'right', fill: C.muted, fontSize: 10 }} />
              <Bar dataKey="CompletedPct" name="Completed %" stackId="a" fill={C.jade} animationDuration={700}>
                <LabelList
                  dataKey="CompletedPct"
                  position="center"
                  content={({ x, y, width, height, value }) => (
                    Number(value) > 8 ? (
                      <text x={Number(x) + Number(width) / 2} y={Number(y) + Number(height) / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0A0A0F">
                        {value}%
                      </text>
                    ) : null
                  )}
                />
              </Bar>
              <Bar dataKey="RemainingPct" name="Remaining %" stackId="a" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
