# Analytics — Feature Documentation

This document explains the **Analytics** dashboard: every KPI card and chart section (what data each one represents and how it's computed), the global filters, and export.

> Source files referenced in this doc: `src/components/Analytics.tsx`, `src/utils/analyticsData.ts`, `src/components/analyticsFilterTypes.ts`, `src/components/AnalyticsFilterDrawer.tsx`, `src/components/AnalyticsExportMenu.tsx`, `src/components/AnalyticsKPICards.tsx`.

All numbers on this page are computed **entirely client-side** from whatever tasks are currently in the store (excluding archived tasks) — there's no separate analytics backend or database; it's a live read of the same data shown in Repository.

---

## 1. Loading & empty states

On first mount, Analytics shows a **skeleton** (pulsing placeholder cards/charts) for ~450ms before rendering real data — this is a deliberate UX pause, not an actual async fetch. Every chart that has no matching data shows its own empty-state message (e.g. "No data yet — add some tasks to see charts") instead of an empty plot.

---

## 2. Global Filters

Click **Filters** (top-right) to open a drawer with:

| Filter | Type |
| --- | --- |
| Date Range | From / To — matched against each task's **Created Date** |
| Task Category | General / Workflow / Project / AI / Contract |
| Status | Pending / In Progress / Completed |
| Priority | Low / Medium / High |
| Assignee | text, substring match |
| Created By | text, substring match |

**Apply Filters** commits the drawer's draft and re-computes every KPI/chart on the page. **Reset** clears the draft and the active filters (but leaves the drawer open). **Clear All** does the same and closes the drawer. A badge on the Filters button shows how many filters are active. Every chart and table on the page reacts to the same filter set — there's no per-chart filtering.

---

## 3. KPI Summary Cards

Eight cards at the top of the page:

| Card | What it counts |
| --- | --- |
| Total Tasks | All tasks matching the current filters |
| Completed | Status = Completed |
| Pending | Status = Pending |
| In Progress | Status = In Progress |
| Overdue | Status ≠ Completed **and** Due Date is in the past |
| High Priority | Priority = High |
| Completion Rate | `completed / total`, as a percentage |
| Avg. Completion Time | Average of (`completedAt − createdAt`) across completed tasks that have a completion timestamp; shown in hours if under 48h, otherwise in days. `—` if no completed tasks have timestamps. |

**Trend badges**: every card except Avg. Completion Time shows a green/red ▲▼ badge — the percentage change of that metric versus a **trailing comparison window**. Specifically: the "previous" bucket is tasks whose **Created Date** falls 30–60 days ago, compared against the *current* value (everything matching your active filters, not just the last 30 days). This is an approximation, not a strict period-over-period comparison — treat the badges as a rough trend indicator rather than an exact "vs. last month" figure.

---

## 4. Charts & sections

The dashboard renders in this order:

### Tasks by Status — doughnut chart
Pending / In Progress / Completed, plus **On Hold** and **Cancelled** shown as reserved categories that always read 0 (those statuses don't exist elsewhere in the app yet — see [Known Limitations](../README.md#-known-limitations)).

### Tasks by Priority — vertical bar chart
Low / Medium / High, plus a **Critical** bucket that always reads 0 for the same reason (Priority only has three real levels in the app).

### Tasks by Category — horizontal bar chart
One bar per task category (General/Workflow/Project/AI/Contract) — the clearest view of how your work is distributed across the five task types.

### Assignee Workload — horizontal bar chart
Number of tasks per assignee, sorted descending. Tasks with no assignee are grouped under **"Unassigned."** A task with multiple assignees counts once toward each of them.

### Due Date Timeline — column chart
Only **non-completed, non-overdue** tasks, bucketed by how soon they're due: **Due Today**, **Tomorrow**, **This Week** (2–7 days out), **Next Week** (8–14 days out), **Later** (15+ days out). Overdue tasks are deliberately excluded here — they're covered by the Overdue Trend chart instead.

### Completion Rate by Category — grouped bar chart
For each of the 5 categories: **Completed** vs **Remaining** task counts, side by side.

### Task Creation Trend — line chart
Tasks bucketed by **Created Date**. Toggle between **Daily** (last 14 days), **Weekly** (last 12 weeks), or **Monthly** (last 12 months).

### Task Completion Trend — line chart
Same daily/weekly/monthly toggle, but bucketed by **Completed Date** and restricted to completed tasks.

### Overdue Tasks Trend — area chart
Tasks that are **not completed** and whose due date has already passed, bucketed by **Due Date** with the same daily/weekly/monthly toggle. This is a proxy for "when did today's overdue tasks originally come due," not a true historical snapshot (the app doesn't store day-by-day history of overdue counts).

### Monthly Task Summary — stacked column chart
For each of the last 6 months: **Created** (tasks created that month), **Completed** (tasks completed that month, by completion date), and **Pending** (tasks created that month that are still not completed as of now).

### Task Aging — bar chart / histogram
Non-completed tasks grouped by age since creation: **0–7**, **8–15**, **16–30**, **31–60**, and **60+ days**. Useful for spotting tasks that are quietly going stale.

### Task Distribution by Creator — pie chart
Tasks grouped by **Created By**.

### SLA Compliance — doughnut chart
**Workflow-category tasks only.** Splits into **SLA Met** vs **SLA Breached**, using the same breach logic as the SLA badge on task cards (deadline = `createdAt + SLA hours`; breached once that deadline has passed on an incomplete task).

### Contract Analytics — doughnut chart
**Contract-category tasks only.** Four buckets:
- **Active** — not expiring soon, not expired, not in a renewal window
- **Expiring Soon** — Expiry Date within 30 days
- **Expired** — Expiry Date already passed
- **Renewed** — Renewal Date has passed but Expiry Date hasn't (i.e. the contract carried through a renewal checkpoint)

### AI Task Analytics — stacked bar chart
**AI-category tasks only.** One stacked bar broken into **Successful**, **Failed**, **Running**, and **Queued** (tasks that haven't been executed yet — `idle` status), based on each task's current AI execution status.

### Team Productivity — sortable table
One row per assignee: **Assigned**, **Completed**, **Pending** counts, **Completion %**, and **Avg. Completion Time**. Click any column header to sort by it.

### Recent Activity Timeline
A single feed combining the activity log from **every task** (task creation, status changes, comments, AI executions, contract signing, etc.), sorted newest-first and capped at the 30 most recent entries across the whole app.

---

## 5. Export

The **Export** button (top-right, next to Filters) downloads the **currently filtered task list** — not chart images or aggregated numbers — in one of three formats:

| Format | Notes |
| --- | --- |
| CSV | Instant, no extra library load |
| Excel (.xlsx) | Loaded on demand via SheetJS |
| PDF | Loaded on demand via jsPDF + jsPDF-AutoTable |

Each export includes Title, Priority, Category, Status, Due Date, Estimated Time, Subtasks Completed, and Created At for every task matching the active filters — the same underlying export used by the Reports module's raw task export.

---

## 6. What Analytics does *not* do

- Charts don't drill down — clicking a slice/bar doesn't filter the rest of the page or navigate anywhere.
- There's no way to export a chart as an image, or export the dashboard as a PDF report (for that, use the **Reports** section instead, which supports building a custom report with an optional chart and exporting the whole thing).
- KPI trend badges are an approximation (see §3) — they're not a precise "same period last month" comparison.
