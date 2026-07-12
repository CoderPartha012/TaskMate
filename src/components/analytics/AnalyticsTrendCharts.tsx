import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Task } from '../../types';
import { generateTrend, withMovingAverage, Granularity } from '../../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, GranularityToggle, C } from '../common/analyticsShared';

interface AnalyticsTrendChartsProps {
  tasks: Task[];
  compareEnabled: boolean;
  comparisonTasks: Task[];
  comparisonAnchor: Date;
}

export function AnalyticsTrendCharts({ tasks, compareEnabled, comparisonTasks, comparisonAnchor }: AnalyticsTrendChartsProps) {
  const [creationGranularity, setCreationGranularity] = useState<Granularity>('daily');
  const [completionGranularity, setCompletionGranularity] = useState<Granularity>('daily');
  const [showVsCreation, setShowVsCreation] = useState(false);

  const maWindow = (g: Granularity) => (g === 'daily' ? 3 : 2);

  const creationRaw = generateTrend(tasks, 'createdAt', creationGranularity);
  const creationWithMA = withMovingAverage(creationRaw, maWindow(creationGranularity));
  const creationComparison = compareEnabled
    ? generateTrend(comparisonTasks, 'createdAt', creationGranularity, comparisonAnchor)
    : [];
  const creationData = creationWithMA.map((p, i) => ({ ...p, compareCount: creationComparison[i]?.count ?? null }));

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completionRaw = generateTrend(completedTasks, 'completedAt', completionGranularity);
  const completionWithMA = withMovingAverage(completionRaw, maWindow(completionGranularity));
  const completionComparison = compareEnabled
    ? generateTrend(comparisonTasks.filter((t) => t.status === 'completed'), 'completedAt', completionGranularity, comparisonAnchor)
    : [];
  const creationForOverlay = showVsCreation ? generateTrend(tasks, 'createdAt', completionGranularity) : [];
  const completionData = completionWithMA.map((p, i) => ({
    ...p,
    compareCount: completionComparison[i]?.count ?? null,
    createdCount: creationForOverlay[i]?.count ?? null,
  }));

  const hasCreation = creationData.some((d) => d.count > 0);
  const hasCompletion = completionData.some((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard
        title="Task Creation Trend"
        subtitle={compareEnabled ? 'Current period (solid) vs. previous period (dashed)' : 'Tasks created over time'}
        action={<GranularityToggle value={creationGranularity} onChange={setCreationGranularity} />}
      >
        {!hasCreation ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={creationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="creationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Created"
                stroke={C.blue}
                strokeWidth={2}
                fill="url(#creationGradient)"
                dot={{ r: 3, fill: C.blue, stroke: '#0A0A0F', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
              <Line type="monotone" dataKey="ma" name="Trend" stroke={C.blue} strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
              {compareEnabled && (
                <Line type="monotone" dataKey="compareCount" name="Previous period" stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Task Completion Trend"
        subtitle={compareEnabled ? 'Current period (solid) vs. previous period (dashed)' : 'Tasks completed over time'}
        action={
          <div className="flex items-center gap-2">
            {!compareEnabled && (
              <button
                type="button"
                onClick={() => setShowVsCreation((v) => !v)}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${
                  showVsCreation ? 'bg-jade/15 text-jade' : 'text-white/40 hover:text-white/70'
                }`}
              >
                vs. Creation
              </button>
            )}
            <GranularityToggle value={completionGranularity} onChange={setCompletionGranularity} />
          </div>
        }
      >
        {!hasCompletion ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.jade} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.jade} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              {showVsCreation && <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} iconType="circle" iconSize={7} />}
              <Area
                type="monotone"
                dataKey="count"
                name="Completed"
                stroke={C.jade}
                strokeWidth={2}
                fill="url(#completionGradient)"
                dot={{ r: 3, fill: C.jade, stroke: '#0A0A0F', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
              <Line type="monotone" dataKey="ma" name="Trend" stroke={C.jade} strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
              {compareEnabled && (
                <Line type="monotone" dataKey="compareCount" name="Previous period" stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              )}
              {showVsCreation && (
                <Line type="monotone" dataKey="createdCount" name="Created" stroke={C.blue} strokeWidth={2} dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
