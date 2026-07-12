import React, { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Filter, RefreshCw, GitCompare } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { computeKPIs, getComparisonTaskSets, formatComparisonLabel } from '../../utils/analyticsData';
import { RepositoryHandoff, handoffFromAnalyticsFilters } from '../../utils/repositoryHandoff';
import { AnalyticsFilters, EMPTY_ANALYTICS_FILTERS, applyAnalyticsFilters } from './analyticsFilterTypes';
import { AnalyticsFilterDrawer } from './AnalyticsFilterDrawer';
import { AnalyticsExportMenu } from './AnalyticsExportMenu';
import { AnalyticsBreadcrumb } from './AnalyticsBreadcrumb';
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
  const setActiveSection = useTaskStore((s) => s.setActiveSection);
  const setPendingRepositoryHandoff = useTaskStore((s) => s.setPendingRepositoryHandoff);

  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<AnalyticsFilters>(EMPTY_ANALYTICS_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>(EMPTY_ANALYTICS_FILTERS);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [, forceTick] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLastUpdated(new Date());
  }, [allTasks]);

  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredTasks = useMemo(
    () => applyAnalyticsFilters(activeTasks, appliedFilters),
    [activeTasks, appliedFilters]
  );

  const { current: trendCurrentTasks, previous: trendPreviousTasks, windows } = useMemo(
    () => getComparisonTaskSets(activeTasks, appliedFilters),
    [activeTasks, appliedFilters]
  );

  const currentKPIs = useMemo(() => computeKPIs(filteredTasks), [filteredTasks]);
  const trendCurrentKPIs = useMemo(() => computeKPIs(trendCurrentTasks), [trendCurrentTasks]);
  const trendPreviousKPIs = useMemo(() => computeKPIs(trendPreviousTasks), [trendPreviousTasks]);
  const comparisonLabel = formatComparisonLabel(windows, !!(appliedFilters.dateFrom && appliedFilters.dateTo));
  const dashboardHandoff = useMemo(() => handoffFromAnalyticsFilters(appliedFilters), [appliedFilters]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const handleApply = () => { setAppliedFilters(filterDraft); setFilterOpen(false); };
  const handleReset = () => { setFilterDraft(EMPTY_ANALYTICS_FILTERS); setAppliedFilters(EMPTY_ANALYTICS_FILTERS); };
  const handleClearAll = () => { setFilterDraft(EMPTY_ANALYTICS_FILTERS); setAppliedFilters(EMPTY_ANALYTICS_FILTERS); setFilterOpen(false); };

  const handleDrillDown = (patch: Partial<AnalyticsFilters>) => {
    setAppliedFilters((f) => ({ ...f, ...patch }));
    setFilterDraft((f) => ({ ...f, ...patch }));
  };

  const handleBreadcrumbChange = (next: AnalyticsFilters) => {
    setAppliedFilters(next);
    setFilterDraft(next);
  };

  const handleViewInRepository = (handoff: RepositoryHandoff) => {
    setPendingRepositoryHandoff(handoff);
    setActiveSection('repository');
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 450);
  };

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <RefreshCw className="w-3 h-3" aria-hidden="true" />
          Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh dashboard"
            className="text-white/40 hover:text-jade transition-colors underline decoration-dotted underline-offset-2"
          >
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCompareEnabled((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
              compareEnabled
                ? 'bg-jade/15 border-jade/40 text-jade'
                : 'border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare Periods
          </button>
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
      </div>

      <AnalyticsBreadcrumb filters={appliedFilters} onChange={handleBreadcrumbChange} />

      {/* Section 1: KPI Summary */}
      <AnalyticsKPICards
        current={currentKPIs}
        trendCurrent={trendCurrentKPIs}
        trendPrevious={trendPreviousKPIs}
        comparisonLabel={comparisonLabel}
        onNavigate={handleViewInRepository}
      />

      {/* Section 2: Status + Priority */}
      <AnalyticsStatusPriorityCharts
        tasks={filteredTasks}
        onDrillDown={handleDrillDown}
        onViewInRepository={handleViewInRepository}
        viewInRepositoryHandoff={dashboardHandoff}
      />

      {/* Section 3: Category + Assignee Workload */}
      <AnalyticsCategoryAssigneeCharts
        tasks={filteredTasks}
        onDrillDown={handleDrillDown}
        onViewInRepository={handleViewInRepository}
        viewInRepositoryHandoff={dashboardHandoff}
      />

      {/* Due Date Timeline + Completion Rate by Category */}
      <AnalyticsDueDateCompletionCharts tasks={filteredTasks} onViewInRepository={handleViewInRepository} />

      {/* Section 4: Creation Trend + Completion Trend */}
      <AnalyticsTrendCharts
        tasks={filteredTasks}
        compareEnabled={compareEnabled}
        comparisonTasks={trendPreviousTasks}
        comparisonAnchor={windows.previousEnd}
      />

      {/* Overdue Trend + Monthly Summary */}
      <AnalyticsOverdueMonthlyCharts tasks={filteredTasks} />

      {/* Section 5: Task Aging + Creator Distribution */}
      <AnalyticsAgingCreatorCharts tasks={filteredTasks} onViewInRepository={handleViewInRepository} />

      {/* Section 6: SLA + Contract + AI */}
      <AnalyticsSpecializedCharts tasks={filteredTasks} onViewInRepository={handleViewInRepository} />

      {/* Section 7: Team Productivity */}
      <AnalyticsTeamProductivityTable tasks={filteredTasks} onViewInRepository={handleViewInRepository} />

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
