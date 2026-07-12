import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Task } from '../../types';
import { getSLACompliance, getContractAnalytics, getAITaskAnalytics } from '../../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, C } from '../common/analyticsShared';
import { RepositoryHandoff, handoffAIExecutionStatus, handoffContractExpiringSoon } from '../../utils/repositoryHandoff';

const SLA_COLORS = [C.jade, C.coral];
const CONTRACT_COLORS = [C.jade, C.amber, C.coral, C.blue];

function thresholdColor(pct: number): string {
  if (pct >= 90) return C.jade;
  if (pct >= 70) return C.amber;
  return C.coral;
}

interface MiniDoughnutProps {
  data: { name: string; value: number }[];
  colors: string[];
  centerLabel?: React.ReactNode;
}

function MiniDoughnut({ data, colors, centerLabel }: MiniDoughnutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyState />;
  return (
    <>
      <div className="relative">
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
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerLabel}
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-[10px] text-white/50">{d.name}</span>
            <span className="text-[10px] font-bold text-white/70">
              {d.value} ({total ? Math.round((d.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

interface AnalyticsSpecializedChartsProps {
  tasks: Task[];
  onViewInRepository: (handoff: RepositoryHandoff) => void;
}

export function AnalyticsSpecializedCharts({ tasks, onViewInRepository }: AnalyticsSpecializedChartsProps) {
  const slaData = getSLACompliance(tasks);
  const contractData = getContractAnalytics(tasks);
  const aiData = getAITaskAnalytics(tasks);
  const hasAI = aiData[0].Successful + aiData[0].Failed + aiData[0].Running + aiData[0].Queued > 0;

  const slaTotal = slaData.reduce((s, d) => s + d.value, 0);
  const slaMet = slaData.find((d) => d.name === 'SLA Met')?.value ?? 0;
  const slaPct = slaTotal > 0 ? Math.round((slaMet / slaTotal) * 100) : 0;

  const contractTotal = contractData.reduce((s, d) => s + d.value, 0);
  const expiringSoon = contractData.find((d) => d.name === 'Expiring Soon')?.value ?? 0;

  const aiTotal = aiData[0].Successful + aiData[0].Failed + aiData[0].Running + aiData[0].Queued;
  const successRate = aiTotal > 0 ? Math.round((aiData[0].Successful / aiTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ChartCard title="SLA Compliance" subtitle="Workflow-based tasks only">
        <MiniDoughnut
          data={slaData}
          colors={SLA_COLORS}
          centerLabel={
            slaTotal > 0 ? (
              <>
                <span className="font-display font-black text-2xl leading-none" style={{ color: thresholdColor(slaPct) }}>{slaPct}%</span>
                <span className="text-[9px] text-white/35 mt-0.5">Compliant</span>
              </>
            ) : undefined
          }
        />
      </ChartCard>

      <ChartCard title="Contract Analytics" subtitle="Contract / business workflow tasks only">
        <MiniDoughnut
          data={contractData}
          colors={CONTRACT_COLORS}
          centerLabel={
            contractTotal > 0 ? (
              <>
                <span className="font-display font-black text-2xl text-white leading-none">{contractTotal}</span>
                <span className="text-[9px] text-white/35 mt-0.5">Contracts</span>
              </>
            ) : undefined
          }
        />
        {expiringSoon > 0 && (
          <button
            type="button"
            onClick={() => onViewInRepository(handoffContractExpiringSoon())}
            className="w-full text-center text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors mt-2"
          >
            {expiringSoon} contract{expiringSoon > 1 ? 's' : ''} expiring within 30 days →
          </button>
        )}
      </ChartCard>

      <ChartCard title="AI Task Analytics" subtitle="AI & Smart Task execution outcomes">
        {!hasAI ? (
          <EmptyState />
        ) : (
          <>
            <p className="text-center text-[11px] text-white/50 mb-1">
              Success rate: <span className="font-bold" style={{ color: thresholdColor(successRate) }}>{successRate}%</span>
            </p>
            <ResponsiveContainer width="100%" height={180}>
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
            {aiData[0].Failed > 0 && (
              <button
                type="button"
                onClick={() => onViewInRepository(handoffAIExecutionStatus('failed'))}
                className="w-full text-center text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors mt-1"
              >
                View failures →
              </button>
            )}
          </>
        )}
      </ChartCard>
    </div>
  );
}
