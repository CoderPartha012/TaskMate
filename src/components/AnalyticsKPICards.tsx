import React from 'react';
import { ListChecks, CheckCircle2, Clock, RefreshCw, AlertTriangle, Flame, PieChart, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { KPIData, pctChange } from '../utils/analyticsData';
import { DeltaBadge } from './analyticsShared';

interface AnalyticsKPICardsProps {
  current: KPIData;
  previous: KPIData;
}

function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 48) return `${hours}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function AnalyticsKPICards({ current, previous }: AnalyticsKPICardsProps) {
  const cards = [
    { label: 'Total Tasks', value: current.totalTasks, delta: pctChange(current.totalTasks, previous.totalTasks), icon: <ListChecks className="w-4 h-4" />, color: 'text-blue-400' },
    { label: 'Completed', value: current.completed, delta: pctChange(current.completed, previous.completed), icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-jade' },
    { label: 'Pending', value: current.pending, delta: pctChange(current.pending, previous.pending), icon: <Clock className="w-4 h-4" />, color: 'text-white/50' },
    { label: 'In Progress', value: current.inProgress, delta: pctChange(current.inProgress, previous.inProgress), icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-400' },
    { label: 'Overdue', value: current.overdue, delta: pctChange(current.overdue, previous.overdue), icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400' },
    { label: 'High Priority', value: current.highPriority, delta: pctChange(current.highPriority, previous.highPriority), icon: <Flame className="w-4 h-4" />, color: 'text-amber-400' },
    { label: 'Completion Rate', value: `${current.completionRate}%`, delta: pctChange(current.completionRate, previous.completionRate), icon: <PieChart className="w-4 h-4" />, color: 'text-jade' },
    { label: 'Avg. Completion Time', value: formatHours(current.avgCompletionHours), delta: null, icon: <Timer className="w-4 h-4" />, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, delta, icon, color }) => (
        <motion.div
          key={label}
          whileHover={{ scale: 1.02 }}
          className="bg-noir-700 border border-white/[0.06] rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={color}>{icon}</span>
            <DeltaBadge value={delta} />
          </div>
          <p className="font-display font-black text-2xl text-white leading-none">{value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mt-1.5">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}
