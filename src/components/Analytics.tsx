import React from 'react';
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LabelList,
  RadialBarChart, RadialBar, Legend,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import { useTaskStore } from '../store/taskStore';
import { format, subDays } from 'date-fns';
import { Category, Priority } from '../types';
import { motion } from 'framer-motion';
import 'react-calendar-heatmap/dist/styles.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const C = {
  jade:   '#00C896',
  amber:  '#FFA502',
  coral:  '#FF4757',
  blue:   '#5382ED',
  purple: '#AF52DE',
  gray:   '#9CA3AF',
  muted:  '#787E8C',
  bg:     '#13131A',
};

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipStyle = {
  background: C.bg,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#F4F4F8',
  fontSize: '12px',
  padding: '8px 12px',
};

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-noir-700 border border-white/[0.06] rounded-xl p-5 ${className}`}>
      <p className="font-display font-bold text-sm text-white/80 leading-tight">{title}</p>
      <p className="text-[10px] text-white/35 mt-0.5 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

// ─── Custom dark tooltip ──────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      {label && <p className="text-[11px] text-white/50 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: p.color || C.jade }}>
          {p.name ? `${p.name}: ` : ''}{p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Analytics() {
  const tasks = useTaskStore((s) => s.tasks);

  const completedTasks  = tasks.filter((t) => t.status === 'completed');
  const pendingTasks    = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');

  const totalTimeSpent      = completedTasks.reduce((a, t) => a + (t.actualTime || 0), 0);
  const averageTimePerTask  = completedTasks.length ? totalTimeSpent / completedTasks.length : 0;

  // Status donut data
  const statusData = [
    { name: 'Completed',   value: completedTasks.length,  color: C.jade  },
    { name: 'In Progress', value: inProgressTasks.length, color: C.amber },
    { name: 'Pending',     value: pendingTasks.length,    color: C.coral },
  ].filter((d) => d.value > 0);
  const totalTasks = tasks.length;

  // 7-day area data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d   = subDays(new Date(), 6 - i);
    const str = format(d, 'yyyy-MM-dd');
    return {
      date:  format(d, 'MMM d'),
      count: completedTasks.filter(
        (t) => t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === str
      ).length,
    };
  });

  // Priority horizontal bar data
  const tasksByPriority = tasks.reduce((a, t) => {
    a[t.priority] = (a[t.priority] || 0) + 1;
    return a;
  }, {} as Record<Priority, number>);

  const priorityData = [
    { name: 'High',   value: tasksByPriority.high   || 0, fill: C.coral  },
    { name: 'Medium', value: tasksByPriority.medium || 0, fill: C.amber  },
    { name: 'Low',    value: tasksByPriority.low    || 0, fill: C.jade   },
  ];
  const maxPriority = Math.max(...priorityData.map((d) => d.value), 1);
  const priorityWithBg = priorityData.map((d) => ({ ...d, bg: maxPriority }));

  // Category radial data
  const tasksByCategory = tasks.reduce((a, t) => {
    a[t.category] = (a[t.category] || 0) + 1;
    return a;
  }, {} as Record<Category, number>);

  const categoryData = [
    { name: 'Work',     value: tasksByCategory.work     || 0, fill: C.blue   },
    { name: 'Personal', value: tasksByCategory.personal || 0, fill: C.purple },
    { name: 'Urgent',   value: tasksByCategory.urgent   || 0, fill: C.coral  },
    { name: 'Other',    value: tasksByCategory.other    || 0, fill: C.gray   },
  ].filter((d) => d.value > 0);

  // Heatmap
  const last365Days = Array.from({ length: 365 }, (_, i) => {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const count = completedTasks.filter(
      (t) => t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === date
    ).length;
    return { date, count };
  }).reverse();

  return (
    <div className="space-y-4">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Completed',      value: completedTasks.length,           suffix: '' },
          { label: 'Pending',        value: pendingTasks.length,             suffix: '' },
          { label: 'Time Spent',     value: Math.round(totalTimeSpent / 60), suffix: 'h' },
          { label: 'Avg per Task',   value: Math.round(averageTimePerTask),  suffix: 'm' },
        ].map(({ label, value, suffix }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }}
            className="bg-noir-700 border border-white/[0.06] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
            <p className="font-display font-black text-3xl text-jade mt-1">{value}{suffix}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Top row: Donut + Area ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Chart 1 — Donut */}
        <ChartCard title="Task Status" subtitle="Distribution across all statuses">
          {statusData.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <defs>
                    {statusData.map((d) => (
                      <filter key={d.name} id={`glow-${d.name}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={d.color} floodOpacity="0.4" />
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    labelLine={false}
                    label={false}
                  >
                    {statusData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0];
                      const pct = totalTasks ? Math.round((Number(d.value) / totalTasks) * 100) : 0;
                      return (
                        <div style={tooltipStyle}>
                          <p style={{ color: d.payload.color }} className="font-semibold">{d.name}</p>
                          <p className="text-white/70">{d.value} tasks · {pct}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display font-black text-3xl text-white leading-none">{totalTasks}</span>
                <span className="text-[10px] text-white/35 mt-0.5">Tasks</span>
              </div>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-5 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[11px] text-white/50">{d.name}</span>
                    <span className="text-[11px] font-bold text-white/70">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Chart 2 — Gradient Area */}
        <ChartCard title="Completion Trend" subtitle="Tasks completed over the last 7 days">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.jade} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.jade} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="transparent"
                tick={{ fill: C.muted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: C.muted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Completed"
                stroke={C.jade}
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={{ r: 4, fill: C.jade, stroke: '#0A0A0F', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: C.jade, stroke: '#0A0A0F', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Middle row: H-Bar + Radial ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Chart 3 — Horizontal Bar (Priority) */}
        <ChartCard title="By Priority" subtitle="Task count broken down by priority level">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={priorityWithBg}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
              barSize={14}
            >
              <XAxis type="number" hide domain={[0, maxPriority]} />
              <YAxis
                type="category"
                dataKey="name"
                width={55}
                axisLine={false}
                tickLine={false}
                tick={{ fill: C.muted, fontSize: 11 }}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              {/* Background track */}
              <Bar dataKey="bg" fill="rgba(255,255,255,0.05)" radius={[0, 6, 6, 0]} isAnimationActive={false}>
              </Bar>
              {/* Foreground bar */}
              <Bar dataKey="value" radius={[0, 6, 6, 0]} animationBegin={200} animationDuration={700}>
                {priorityWithBg.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fill: C.muted, fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4 — Radial Bar (Category) */}
        <ChartCard title="By Category" subtitle="Task distribution across work categories">
          {categoryData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="35%"
                cy="50%"
                innerRadius={20}
                outerRadius={90}
                data={categoryData}
                startAngle={90}
                endAngle={-270}
                barSize={12}
              >
                <RadialBar
                  background={{ fill: 'rgba(255,255,255,0.04)' }}
                  dataKey="value"
                  cornerRadius={6}
                  animationBegin={0}
                  animationDuration={800}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tooltipStyle}>
                        <p style={{ color: d.fill }} className="font-semibold">{d.name}</p>
                        <p className="text-white/70">{d.value} tasks</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: 11, color: C.muted, paddingLeft: 16 }}
                  formatter={(value, entry: any) => (
                    <span style={{ color: '#787E8C' }}>
                      {value}{' '}
                      <span style={{ color: '#F4F4F8', fontWeight: 600 }}>
                        {entry.payload?.value}
                      </span>
                    </span>
                  )}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Bottom row: Heatmap ── */}
      <ChartCard title="Activity Heatmap" subtitle="Daily task completions over the past year">
        <CalendarHeatmap
          startDate={subDays(new Date(), 365)}
          endDate={new Date()}
          values={last365Days}
          showWeekdayLabels
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count < 3) return 'color-scale-1';
            if (value.count < 5) return 'color-scale-2';
            return 'color-scale-3';
          }}
          titleForValue={(value) =>
            value && value.count
              ? `${value.date}: ${value.count} task${value.count !== 1 ? 's' : ''} completed`
              : 'No completions'
          }
        />
        {/* Color scale legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-white/30">Less</span>
          {['bg-white/5', 'bg-jade/25', 'bg-jade/55', 'bg-jade'].map((cls, i) => (
            <span key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
          ))}
          <span className="text-[10px] text-white/30">More</span>
        </div>
      </ChartCard>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-48 text-white/20 text-xs">
      No data yet — add some tasks to see charts
    </div>
  );
}
