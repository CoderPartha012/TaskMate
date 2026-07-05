import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { computeKPIs, splitByTrailingPeriod } from '../utils/analyticsData';
import { AnalyticsFilters, EMPTY_ANALYTICS_FILTERS, applyAnalyticsFilters } from './analyticsFilterTypes';
import { AnalyticsFilterDrawer } from './AnalyticsFilterDrawer';
import { AnalyticsExportMenu } from './AnalyticsExportMenu';
import { AnalyticsKPICards } from './AnalyticsKPICards';
import { AnalyticsSkeleton } from './AnalyticsSkeleton';
import { AnalyticsStatusPriorityCharts } from './AnalyticsStatusPriorityCharts';
import { AnalyticsCategoryAssigneeCharts } from './AnalyticsCategoryAssigneeCharts';
import { AnalyticsDueDateCompletionCharts } from './AnalyticsDueDateCompletionCharts';
import { AnalyticsTrendCharts } from './AnalyticsTrendCharts';
import { AnalyticsOverdueMonthlyCharts } from './AnalyticsOverdueMonthlyCharts';
import { AnalyticsAgingCreatorCharts } from './AnalyticsAgingCreatorCharts';
import { AnalyticsSpecializedCharts } from './AnalyticsSpecializedCharts';
import { AnalyticsTeamProductivityTable } from './AnalyticsTeamProductivityTable';
import { AnalyticsActivityFeed } from './AnalyticsActivityFeed';

export function Analytics() {
  const allTasks = useTaskStore((s) => s.tasks);
  const activeTasks = useMemo(() => allTasks.filter((t) => !t.archived), [allTasks]);

  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<AnalyticsFilters>(EMPTY_ANALYTICS_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>(EMPTY_ANALYTICS_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const filteredTasks = useMemo(
    () => applyAnalyticsFilters(activeTasks, appliedFilters),
    [activeTasks, appliedFilters]
  );

  const { previous: previousPeriodTasks } = useMemo(
    () => splitByTrailingPeriod(filteredTasks, 30),
    [filteredTasks]
  );

  const currentKPIs = useMemo(() => computeKPIs(filteredTasks), [filteredTasks]);
  const previousKPIs = useMemo(() => computeKPIs(previousPeriodTasks), [previousPeriodTasks]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const handleApply = () => { setAppliedFilters(filterDraft); setFilterOpen(false); };
  const handleReset = () => { setFilterDraft(EMPTY_ANALYTICS_FILTERS); setAppliedFilters(EMPTY_ANALYTICS_FILTERS); };
  const handleClearAll = () => { setFilterDraft(EMPTY_ANALYTICS_FILTERS); setAppliedFilters(EMPTY_ANALYTICS_FILTERS); setFilterOpen(false); };

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-jade text-noir-800 text-[9px] font-bold rounded-full px-1">
              {activeFilterCount}
            </span>
          )}
        </button>
        <AnalyticsExportMenu tasks={filteredTasks} />
      </div>

      {/* Section 1: KPI Summary */}
      <AnalyticsKPICards current={currentKPIs} previous={previousKPIs} />

      {/* Section 2: Status + Priority */}
      <AnalyticsStatusPriorityCharts tasks={filteredTasks} />

      {/* Section 3: Category + Assignee Workload */}
      <AnalyticsCategoryAssigneeCharts tasks={filteredTasks} />

      {/* Due Date Timeline + Completion Rate by Category */}
      <AnalyticsDueDateCompletionCharts tasks={filteredTasks} />

      {/* Section 4: Creation Trend + Completion Trend */}
      <AnalyticsTrendCharts tasks={filteredTasks} />

      {/* Overdue Trend + Monthly Summary */}
      <AnalyticsOverdueMonthlyCharts tasks={filteredTasks} />

      {/* Section 5: Task Aging + Creator Distribution */}
      <AnalyticsAgingCreatorCharts tasks={filteredTasks} />

      {/* Section 6: SLA + Contract + AI */}
      <AnalyticsSpecializedCharts tasks={filteredTasks} />

      {/* Section 7: Team Productivity */}
      <AnalyticsTeamProductivityTable tasks={filteredTasks} />

      {/* Section 8: Recent Activity Timeline */}
      <AnalyticsActivityFeed tasks={filteredTasks} />

      <AnalyticsFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        draft={filterDraft}
        onDraftChange={(patch) => setFilterDraft((d) => ({ ...d, ...patch }))}
        onApply={handleApply}
        onReset={handleReset}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
