import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Task } from '../types';
import { getTaskAging, getCreatorDistribution } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, CATEGORY_COLORS, C } from './analyticsShared';

export function AnalyticsAgingCreatorCharts({ tasks }: { tasks: Task[] }) {
  const agingData = getTaskAging(tasks);
  const creatorData = getCreatorDistribution(tasks);

  const hasAging = agingData.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Task Aging" subtitle="Open tasks grouped by age since creation">
        {!hasAging ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" name="Tasks" fill={C.purple} radius={[6, 6, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Task Distribution by Creator" subtitle="Who created the tasks">
        {creatorData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={creatorData}
                cx="40%"
                cy="50%"
                innerRadius={0}
                outerRadius={90}
                dataKey="value"
                animationDuration={800}
                label={false}
              >
                {creatorData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend
                iconSize={8}
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: 11, color: C.muted, paddingLeft: 16 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
