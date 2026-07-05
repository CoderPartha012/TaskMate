import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Task } from '../types';
import { getSLACompliance, getContractAnalytics, getAITaskAnalytics } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, C } from './analyticsShared';

const SLA_COLORS = [C.jade, C.coral];
const CONTRACT_COLORS = [C.jade, C.amber, C.coral, C.blue];

function MiniDoughnut({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyState />;
  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" animationDuration={800}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-[10px] text-white/50">{d.name}</span>
            <span className="text-[10px] font-bold text-white/70">{d.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function AnalyticsSpecializedCharts({ tasks }: { tasks: Task[] }) {
  const slaData = getSLACompliance(tasks);
  const contractData = getContractAnalytics(tasks);
  const aiData = getAITaskAnalytics(tasks);
  const hasAI = aiData[0].Successful + aiData[0].Failed + aiData[0].Running + aiData[0].Queued > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ChartCard title="SLA Compliance" subtitle="Workflow-based tasks only">
        <MiniDoughnut data={slaData} colors={SLA_COLORS} />
      </ChartCard>

      <ChartCard title="Contract Analytics" subtitle="Contract / business workflow tasks only">
        <MiniDoughnut data={contractData} colors={CONTRACT_COLORS} />
      </ChartCard>

      <ChartCard title="AI Task Analytics" subtitle="AI & Smart Task execution outcomes">
        {!hasAI ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={aiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} iconType="circle" iconSize={7} />
              <Bar dataKey="Successful" stackId="ai" fill={C.jade} />
              <Bar dataKey="Failed" stackId="ai" fill={C.coral} />
              <Bar dataKey="Running" stackId="ai" fill={C.blue} />
              <Bar dataKey="Queued" stackId="ai" fill={C.gray} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
