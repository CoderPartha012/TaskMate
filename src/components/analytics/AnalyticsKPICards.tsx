import React from 'react';
import { ListChecks, CheckCircle2, Clock, RefreshCw, AlertTriangle, Flame, PieChart, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { KPIData, pctChange } from '../../utils/analyticsData';
import { DeltaBadge } from '../common/analyticsShared';
import { RepositoryHandoff, handoffQuickFilter, handoffStatus } from '../../utils/repositoryHandoff';

interface AnalyticsKPICardsProps {
  current: KPIData;
  trendCurrent: KPIData;
  trendPrevious: KPIData;
  comparisonLabel: string;
  onNavigate: (handoff: RepositoryHandoff) => void;
}

function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 48) return `${hours}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function AnalyticsKPICards({ current, trendCurrent, trendPrevious, comparisonLabel, onNavigate }: AnalyticsKPICardsProps) {
  const cards = [
    { label: 'Total Tasks', value: current.totalTasks, delta: pctChange(trendCurrent.totalTasks, trendPrevious.totalTasks), icon: <ListChecks className="w-4 h-4" />, color: 'text-blue-400', handoff: handoffQuickFilter('all') },
    { label: 'Completed', value: current.completed, delta: pctChange(trendCurrent.completed, trendPrevious.completed), icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-jade', handoff: handoffQuickFilter('completed') },
    { label: 'Pending', value: current.pending, delta: pctChange(trendCurrent.pending, trendPrevious.pending), icon: <Clock className="w-4 h-4" />, color: 'text-white/50', handoff: handoffStatus('pending') },
    { label: 'In Progress', value: current.inProgress, delta: pctChange(trendCurrent.inProgress, trendPrevious.inProgress), icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-400', handoff: handoffStatus('in-progress') },
    { label: 'Overdue', value: current.overdue, delta: pctChange(trendCurrent.overdue, trendPrevious.overdue), icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400', handoff: handoffQuickFilter('overdue') },
    { label: 'High Priority', value: current.highPriority, delta: pctChange(trendCurrent.highPriority, trendPrevious.highPriority), icon: <Flame className="w-4 h-4" />, color: 'text-amber-400', handoff: handoffQuickFilter('high-priority') },
    { label: 'Completion Rate', value: `${current.completionRate}%`, delta: pctChange(trendCurrent.completionRate, trendPrevious.completionRate), icon: <PieChart className="w-4 h-4" />, color: 'text-jade', handoff: handoffQuickFilter('completed') },
    { label: 'Avg. Completion Time', value: formatHours(current.avgCompletionHours), delta: null, icon: <Timer className="w-4 h-4" />, color: 'text-purple-400', handoff: null },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, delta, icon, color, handoff }) => (
        <motion.div
          key={label}
          whileHover={{ scale: 1.02 }}
          onClick={handoff ? () => onNavigate(handoff) : undefined}
          title={handoff ? 'Click to view in Repository' : undefined}
          className={`bg-noir-700 border border-white/[0.06] rounded-xl p-4 ${handoff ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={color}>{icon}</span>
            <DeltaBadge value={delta} />
          </div>
          <p className="font-display font-black text-2xl text-white leading-none">{value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mt-1.5">{label}</p>
          {delta !== null && <p className="text-[9px] text-white/25 mt-1">{comparisonLabel}</p>}
        </motion.div>
      ))}
    </div>
  );
}
