import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Task } from '../types';
import { getDueDateTimeline, getCompletionRateByCategory } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, C } from './analyticsShared';

const DUE_COLORS = [C.coral, C.amber, C.blue, C.purple, C.gray];

export function AnalyticsDueDateCompletionCharts({ tasks }: { tasks: Task[] }) {
  const dueData = getDueDateTimeline(tasks);
  const completionData = getCompletionRateByCategory(tasks);
  const hasCompletionData = completionData.some((d) => d.Completed > 0 || d.Remaining > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Due Date Timeline" subtitle="Upcoming (non-overdue) tasks by due window">
        {dueData.every((d) => d.value === 0) ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]} animationDuration={700}>
                {dueData.map((_, i) => (
                  <Cell key={i} fill={DUE_COLORS[i % DUE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Completion Rate by Category" subtitle="Completed vs remaining tasks per category">
        {!hasCompletionData ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} iconType="circle" iconSize={8} />
              <Bar dataKey="Completed" fill={C.jade} radius={[4, 4, 0, 0]} animationDuration={700} />
              <Bar dataKey="Remaining" fill={C.coral} radius={[4, 4, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
