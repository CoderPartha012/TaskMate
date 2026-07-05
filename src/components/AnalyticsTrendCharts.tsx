import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Task } from '../types';
import { generateTrend, Granularity } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, GranularityToggle, C } from './analyticsShared';

export function AnalyticsTrendCharts({ tasks }: { tasks: Task[] }) {
  const [creationGranularity, setCreationGranularity] = useState<Granularity>('daily');
  const [completionGranularity, setCompletionGranularity] = useState<Granularity>('daily');

  const creationData = generateTrend(tasks, 'createdAt', creationGranularity);
  const completionData = generateTrend(tasks.filter((t) => t.status === 'completed'), 'completedAt', completionGranularity);

  const hasCreation = creationData.some((d) => d.count > 0);
  const hasCompletion = completionData.some((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard
        title="Task Creation Trend"
        subtitle="Tasks created over time"
        action={<GranularityToggle value={creationGranularity} onChange={setCreationGranularity} />}
      >
        {!hasCreation ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={creationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Created"
                stroke={C.blue}
                strokeWidth={2}
                dot={{ r: 3, fill: C.blue, stroke: '#0A0A0F', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Task Completion Trend"
        subtitle="Tasks completed over time"
        action={<GranularityToggle value={completionGranularity} onChange={setCompletionGranularity} />}
      >
        {!hasCompletion ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Completed"
                stroke={C.jade}
                strokeWidth={2}
                dot={{ r: 3, fill: C.jade, stroke: '#0A0A0F', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
