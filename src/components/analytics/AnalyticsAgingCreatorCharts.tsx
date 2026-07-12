import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from 'recharts';
import { format } from 'date-fns';
import { Task } from '../../types';
import { getTaskAging, getCreatorDistribution } from '../../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, CATEGORY_PALETTE, C } from '../common/analyticsShared';
import { RepositoryHandoff, handoffCreatedRange } from '../../utils/repositoryHandoff';

const AGING_COLORS = ['#10B981', '#84CC16', C.amber, '#F97316', '#EF4444'];
const WARNING_THRESHOLD = 10;

function ymd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function agingBucketHandoff(index: number): RepositoryHandoff {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  switch (index) {
    case 0: return handoffCreatedRange(ymd(daysAgo(7)), ymd(now));
    case 1: return handoffCreatedRange(ymd(daysAgo(15)), ymd(daysAgo(8)));
    case 2: return handoffCreatedRange(ymd(daysAgo(30)), ymd(daysAgo(16)));
    case 3: return handoffCreatedRange(ymd(daysAgo(60)), ymd(daysAgo(31)));
    default: return handoffCreatedRange('', ymd(daysAgo(60)));
  }
}

interface AnalyticsAgingCreatorChartsProps {
  tasks: Task[];
  onViewInRepository: (handoff: RepositoryHandoff) => void;
}

export function AnalyticsAgingCreatorCharts({ tasks, onViewInRepository }: AnalyticsAgingCreatorChartsProps) {
  const agingData = getTaskAging(tasks);
  const creatorDataRaw = [...getCreatorDistribution(tasks)].sort((a, b) => b.value - a.value);
  const top8 = creatorDataRaw.slice(0, 8);
  const othersTotal = creatorDataRaw.slice(8).reduce((s, d) => s + d.value, 0);
  const creatorData = othersTotal > 0 ? [...top8, { name: 'Others', value: othersTotal }] : top8;

  const hasAging = agingData.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Task Aging" subtitle="Open tasks grouped by age since creation — click a bar to view">
        {!hasAging ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={agingData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="value"
                name="Tasks"
                radius={[6, 6, 0, 0]}
                animationDuration={700}
                onClick={(_, i) => onViewInRepository(agingBucketHandoff(i))}
                style={{ cursor: 'pointer' }}
              >
                {agingData.map((_, i) => (
                  <Cell key={i} fill={AGING_COLORS[i % AGING_COLORS.length]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  content={({ x, y, width, value }) => {
                    const v = Number(value);
                    const isWarning = v > WARNING_THRESHOLD;
                    const cx = Number(x) + Number(width) / 2;
                    return (
                      <text x={cx} y={Number(y) - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={isWarning ? '#EF4444' : '#F1F5F9'}>
                        {isWarning ? `⚠ ${v}` : v}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Task Distribution by Creator" subtitle="Who created the tasks">
        {creatorData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, creatorData.length * 32)}>
            <BarChart data={creatorData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barSize={16}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: C.muted, fontSize: 11 }} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700}>
                {creatorData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />
                ))}
                <LabelList dataKey="value" position="right" style={{ fill: C.muted, fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
