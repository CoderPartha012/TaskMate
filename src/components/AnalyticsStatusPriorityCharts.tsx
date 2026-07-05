import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Task } from '../types';
import { getStatusBreakdown, getPriorityBreakdown } from '../utils/analyticsData';
import { ChartCard, DarkTooltip, EmptyState, STATUS_COLORS, PRIORITY_COLORS, C } from './analyticsShared';

export function AnalyticsStatusPriorityCharts({ tasks }: { tasks: Task[] }) {
  const statusData = getStatusBreakdown(tasks).filter((d) => d.value > 0);
  const priorityData = getPriorityBreakdown(tasks);
  const total = tasks.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Tasks by Status" subtitle="Distribution across all statuses">
        {statusData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                    labelLine={false}
                    label={false}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0];
                      const pct = total ? Math.round((Number(d.value) / total) * 100) : 0;
                      return (
                        <div style={{ background: C.bg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px' }}>
                          <p style={{ color: d.payload.fill }} className="font-semibold text-xs">{d.name}</p>
                          <p className="text-white/70 text-xs">{d.value} tasks · {pct}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display font-black text-3xl text-white leading-none">{total}</span>
                <span className="text-[10px] text-white/35 mt-0.5">Tasks</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                  <span className="text-[11px] text-white/50">{d.name}</span>
                  <span className="text-[11px] font-bold text-white/70">{d.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </ChartCard>

      <ChartCard title="Tasks by Priority" subtitle="Task count broken down by priority level">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]} animationDuration={700}>
              {priorityData.map((_, i) => (
                <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
