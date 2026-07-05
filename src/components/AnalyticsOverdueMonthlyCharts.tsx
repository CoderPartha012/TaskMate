import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Task } from '../types';
import { getOverdueTrend, getMonthlyTaskSummary, Granularity } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, GranularityToggle, C } from './analyticsShared';

export function AnalyticsOverdueMonthlyCharts({ tasks }: { tasks: Task[] }) {
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const overdueData = getOverdueTrend(tasks, granularity);
  const monthlyData = getMonthlyTaskSummary(tasks);

  const hasOverdue = overdueData.some((d) => d.count > 0);
  const hasMonthly = monthlyData.some((d) => d.Created > 0 || d.Completed > 0 || d.Pending > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard
        title="Overdue Tasks Trend"
        subtitle="Overdue tasks bucketed by due date"
        action={<GranularityToggle value={granularity} onChange={setGranularity} />}
      >
        {!hasOverdue ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={overdueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="overdueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.coral} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.coral} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Overdue"
                stroke={C.coral}
                strokeWidth={2}
                fill="url(#overdueGradient)"
                dot={{ r: 3, fill: C.coral, stroke: '#0A0A0F', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Monthly Task Summary" subtitle="Created, completed, and pending tasks by month">
        {!hasMonthly ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} iconType="circle" iconSize={8} />
              <Bar dataKey="Created" stackId="a" fill={C.blue} radius={[0, 0, 0, 0]} animationDuration={700} />
              <Bar dataKey="Completed" stackId="a" fill={C.jade} radius={[0, 0, 0, 0]} animationDuration={700} />
              <Bar dataKey="Pending" stackId="a" fill={C.amber} radius={[4, 4, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
