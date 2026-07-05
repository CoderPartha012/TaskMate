import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Task } from '../types';
import { getCategoryBreakdown, getAssigneeWorkload } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, CATEGORY_COLORS, C } from './analyticsShared';

function HBar({ data, colorful }: { data: { name: string; value: number }[]; colorful?: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barSize={16}>
        <XAxis type="number" hide domain={[0, max]} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          axisLine={false}
          tickLine={false}
          tick={{ fill: C.muted, fontSize: 11 }}
        />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700}>
          {data.map((_, i) => (
            <Cell key={i} fill={colorful ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : C.jade} />
          ))}
          <LabelList dataKey="value" position="right" style={{ fill: C.muted, fontSize: 11, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsCategoryAssigneeCharts({ tasks }: { tasks: Task[] }) {
  const categoryData = getCategoryBreakdown(tasks);
  const assigneeData = getAssigneeWorkload(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Tasks by Category" subtitle="Task count across the five task categories">
        {categoryData.every((d) => d.value === 0) ? <EmptyState /> : <HBar data={categoryData} colorful />}
      </ChartCard>

      <ChartCard title="Assignee Workload" subtitle="Number of assigned tasks per person">
        {assigneeData.length === 0 ? <EmptyState /> : <HBar data={assigneeData} />}
      </ChartCard>
    </div>
  );
}
