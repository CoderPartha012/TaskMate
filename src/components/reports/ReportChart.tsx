import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ReportGroup } from '../../utils/reportBuilder';
import { ReportConfig } from '../../types/report.types';
import { ChartCard, DarkTooltip, CATEGORY_PALETTE, C } from '../common/analyticsShared';

interface ReportChartProps {
  groups: ReportGroup[];
  chartType: ReportConfig['chartType'];
}

export function ReportChart({ groups, chartType }: ReportChartProps) {
  if (!chartType) return null;

  const data = groups.filter((g) => g.label).map((g) => ({ name: g.label, value: g.rows.length }));

  if (data.length === 0) {
    return (
      <ChartCard title="Report Chart" subtitle="Set a Group By in the builder to visualize this report">
        <div className="flex items-center justify-center h-40 text-white/20 text-xs">No grouped data to chart yet</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Report Chart" subtitle="Reflects the current grouping">
      <ResponsiveContainer width="100%" height={220}>
        {chartType === 'pie' || chartType === 'doughnut' ? (
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={chartType === 'doughnut' ? 55 : 0} outerRadius={85} dataKey="value" paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<DarkTooltip />} />
          </PieChart>
        ) : chartType === 'line' ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} />
            <Line type="monotone" dataKey="value" stroke={C.jade} strokeWidth={2} dot={{ r: 3, fill: C.jade }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="transparent" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="transparent" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />)}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartCard>
  );
}
