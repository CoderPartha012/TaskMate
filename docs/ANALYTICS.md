# Analytics — Feature Documentation

This document explains the **Analytics** dashboard: every KPI card and chart section (what data each one represents and how it's computed), drill-down and click-through navigation, comparison mode, the global filters, and export.

> Source files referenced in this doc: `src/components/Analytics.tsx`, `src/utils/analyticsData.ts`, `src/components/analyticsFilterTypes.ts`, `src/components/AnalyticsFilterDrawer.tsx`, `src/components/AnalyticsBreadcrumb.tsx`, `src/components/AnalyticsExportMenu.tsx`, `src/components/AnalyticsKPICards.tsx`, `src/utils/repositoryHandoff.ts`, `src/store/taskStore.ts`.

All numbers on this page are computed **entirely client-side** from whatever tasks are currently in the store (excluding archived tasks) — there's no separate analytics backend or database; it's a live read of the same data shown in Repository.

---

## 1. Loading & empty states

On first mount, Analytics shows a **skeleton** (pulsing placeholder cards/charts) for ~450ms before rendering real data — this is a deliberate UX pause, not an actual async fetch. Every chart that has no matching data shows its own empty-state message (e.g. "No data yet — add some tasks to see charts") instead of an empty plot.

---

## 2. Toolbar

Top-right of the page:

- **Last updated {relative time}** with a **Refresh** link, on the left. Since every chart already reads live from the same reactive task store, there's nothing to actually re-fetch — refreshing just resets the timestamp and briefly replays the loading skeleton for visual confirmation. The relative-time label itself re-renders every 30 seconds so it doesn't go stale (e.g. from "just now" to "2 minutes ago") even if nothing else changes.
- **Compare Periods** toggle — see §6.
- **Filters** button with an active-filter-count badge.
- **Export** button — see §9.

Directly below the toolbar, a **breadcrumb** appears whenever a drill-down or filter is active — see §3.

---

## 3. Drill-down and the breadcrumb trail

Every chart segment (a doughnut slice, a bar) is clickable. Clicking one **filters the entire dashboard** to match — e.g. clicking the "Pending" slice on the Status doughnut sets the Status filter to Pending and every KPI/chart on the page recomputes against that filter, exactly as if you'd set it in the Filters drawer. This is currently wired up on:

- **Tasks by Status** doughnut (click a slice → filters by that status)
- **Tasks by Priority** bar (click a bar → filters by that priority)
- **Tasks by Category** bar (click a bar → filters by that category)
- **Assignee Workload** bar (click any segment of a person's stacked bar → filters by that assignee)

A **breadcrumb trail** appears above the KPI cards whenever any filter is active, in a fixed order: **All Tasks → Date → Category → Status → Priority → Assignee → Created By**. Clicking a breadcrumb segment clears that field *and every field after it* in this order; clicking **"All Tasks"** clears everything. This lets you step back through a drill-down path the same way you built it up, without needing to remember which filter you set first.

---

## 4. Click-through to Repository

Since Analytics has no row-level actions of its own, every KPI card and most chart cards offer a way to jump to the equivalent, pre-filtered view in **Repository**:

- **KPI cards** are clickable (cursor changes on hover) — Total Tasks clears all Repository filters, Overdue/Completed/High Priority map to Repository's matching quick filter, Pending/In Progress map to a Status filter, and Completion Rate also jumps to Completed tasks.
- Most **chart cards** show a small **"View tasks →"** link in their header (reusing a slot the card layout already had) that opens Repository filtered to match whatever's currently driving that chart (the dashboard's active filters, translated into Repository's filter shape).
- A few charts have **more specific** click-throughs beyond the generic dashboard filter: Due Date Timeline columns jump to Repository with the matching due-date range; Task Aging bars jump to Repository with the matching created-date age range; the Contract "expiring soon" callout and the AI "View failures →" link both jump to precisely that subset.

This works via a small piece of state on the task store (`pendingRepositoryHandoff`) that Analytics sets right before navigating — Repository reads it once on mount, applies it, and clears it, the same pattern already used for "jump to a task's Details page in Edit mode."

---

## 5. Global Filters

Click **Filters** (top-right) to open a drawer with:

| Filter | Type |
| --- | --- |
| Date Range | From / To — matched against each task's **Created Date**. Preset buttons (**Today, Last 7 days, Last 30 days, This month, Last quarter, This year**) sit above the manual pickers; an **All time** button clears the range. |
| Task Category | General / Workflow / Project / AI / Contract |
| Status | Pending / In Progress / Completed |
| Priority | Low / Medium / High |
| Assignee | text, substring match |
| Created By | text, substring match |

**Apply Filters** commits the drawer's draft and re-computes every KPI/chart on the page. **Reset** clears the draft and the active filters (but leaves the drawer open). **Clear All** does the same and closes the drawer. A badge on the Filters button shows how many filters are active. Every chart and table on the page reacts to the same filter set — there's no per-chart filtering, though drilling into a specific chart (§3) sets these same shared filters.

---

## 6. Comparison mode

The **Compare Periods** toggle in the toolbar overlays a second time period on top of the current one:

- The **Task Creation Trend** and **Task Completion Trend** charts each gain a second, dimmer dashed line showing the equivalent trend for the **previous period** (the same-length window immediately before your current date range — or the 30 days before "the last 30 days" if no date filter is set).
- The KPI cards' trend badges already use this same previous-period comparison whether or not the toggle is on (see §7) — the toggle's main effect is the chart overlay, since duplicating the same delta information on every card would be redundant.

The Completion Trend chart also has its own independent **"vs. Creation"** toggle (in its own card header, hidden while Compare Periods is on to avoid three lines at once) that overlays the Creation Trend on the same chart instead — the gap between the two lines is a quick visual read on whether your backlog is growing or shrinking.

---

## 7. KPI Summary Cards

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

**Trend badges**: every card except Avg. Completion Time shows a green/red ▲▼ badge — the percentage change of that metric versus a **proper period-over-period comparison window**, with a small caption underneath (e.g. *"vs. previous 30 days"* or *"vs. Jun 1–30"*) so it's clear what's being compared. The comparison window is computed once and shared by the badges and the chart overlays in §6:

- If you have an explicit Date Range filter applied, the comparison window is the **same-length window immediately before it**.
- If no date filter is applied, the comparison is **the last 30 days vs. the 30 days before that**.

This replaced an earlier, looser approximation that always compared against a rough trailing 30–60-day window regardless of any active date filter, and that mismatched what the "current" and "previous" buckets actually represented. The **big number** on each card is unaffected by this — it always reflects the full set of tasks matching your filters (unbounded by the comparison window), only the trend badge's delta uses the matched-window comparison.

Click a card to jump to the equivalent filtered view in Repository (see §4).

---

## 8. Charts & sections

The dashboard renders in this order:

### Tasks by Status — doughnut chart
Pending / In Progress / Completed only — the previous placeholder **On Hold** and **Cancelled** buckets (which always read 0, since those statuses don't exist anywhere else in the app) have been removed rather than shown as dead slices. The center of the doughnut shows the total task count by default; **hovering a slice swaps the center text** to that slice's count and percentage. The legend below includes each status's count and percentage. **Click a slice to drill down** (§3).

### Tasks by Priority — vertical bar chart
Low / Medium / High only — the placeholder **Critical** bucket (always 0, since Priority only has three real levels) has been removed the same way. Bars are colored semantically (slate for Low, amber for Medium, red for High) and each bar shows its count and percentage-of-total as a label above it. **Click a bar to drill down** (§3).

### Tasks by Category — horizontal bar chart
One bar per task category (General/Workflow/Project/AI/Contract), now colored with each category's real accent color (the same indigo/amber/emerald/violet/red used in Repository's category badges, rather than an unrelated generic palette) with a count-and-percentage label. **Click a bar to drill down** (§3).

### Assignee Workload — horizontal bar chart
Each assignee's bar is now **stacked by status composition** (Pending/In Progress/Completed segments) instead of a single flat count, so you can see at a glance whether someone's workload is mostly done or mostly piling up. A dashed **average workload** reference line shows the mean across all assignees, and each name is prefixed with a small colored initial avatar for quick scanning. Limited to the top 10 assignees by default with a **"Show all N assignees"** toggle if more exist. Tasks with no assignee are grouped under **"Unassigned."** **Click any segment to drill down** by that assignee (§3).

### Due Date Timeline — column chart
Only **non-completed, non-overdue** tasks, bucketed by how soon they're due: **Due Today**, **Tomorrow**, **This Week** (2–7 days out), **Next Week** (8–14 days out), **Later** (15+ days out). Overdue tasks are deliberately excluded here — they're covered by the Overdue Trend chart instead. Columns are colored on an urgency gradient (red → amber → yellow → blue → slate) and each shows its count as a label. **Click a column to open Repository** filtered to that exact due-date range (§4).

### Completion Rate by Category — 100%-stacked bar chart
For each of the 5 categories, a single bar shows the **completed percentage** as a filled (green) portion against the remaining percentage (a faint gray fill) — this replaced the earlier side-by-side Completed/Remaining bar pair, since a single proportional bar reads faster than comparing two bar heights. The completed percentage is labeled directly on the green portion, and a dashed reference line marks the overall average completion rate across all categories so each one can be compared against the mean.

### Task Creation Trend — line/area chart
Tasks bucketed by **Created Date**, now rendered with a subtle filled area under the line and a dashed **moving-average trend line** layered on top to smooth out daily noise. Toggle between **Daily** (last 14 days), **Weekly** (last 12 weeks), or **Monthly** (last 12 months). Gains a second dashed series when Compare Periods is on (§6).

### Task Completion Trend — line/area chart
Same daily/weekly/monthly toggle, area fill, and moving-average line as Creation Trend, but bucketed by **Completed Date** and restricted to completed tasks. Has its own **"vs. Creation"** overlay toggle and the same Compare Periods overlay (§6).

### Overdue Tasks Trend — area chart
Tasks that are **not completed** and whose due date has already passed, bucketed by **Due Date** with the same daily/weekly/monthly toggle. The area fill now uses an amber-to-red "danger zone" gradient, a dashed **healthy threshold** reference line (default: 5) marks where overdue counts start being a concern, and the single highest point on the chart is marked with a small peak marker. This remains a proxy for "when did today's overdue tasks originally come due," not a true historical snapshot (the app doesn't store day-by-day history of overdue counts).

### Monthly Task Summary — stacked column chart
For each of the last 6 months: **Created** (now shown in indigo, tasks created that month), **Completed** (tasks completed that month, by completion date), and **Pending** (tasks created that month that are still not completed as of now). Each column now shows a small **net change** figure above it (Created − Completed for that month, in red if positive/growing backlog, green if negative/shrinking).

### Task Aging — bar chart / histogram
Non-completed tasks grouped by age since creation: **0–7**, **8–15**, **16–30**, **31–60**, and **60+ days**. Bars are now colored on a green→amber→red gradient by bucket, each shows its count as a label, and any bucket with more than 10 tasks gets a small ⚠ warning marker next to its count. **Click a bar to open Repository** filtered to that exact created-date age range (§4).

### Task Distribution by Creator — horizontal bar chart
Tasks grouped by **Created By**, now shown as a horizontal bar chart instead of a pie — pie slices of similar size are hard to compare at a glance, and a bar chart reads faster. Limited to the top 8 creators, with the rest grouped into an **"Others"** bar if there are more.

### SLA Compliance — doughnut chart
**Workflow-category tasks only.** Splits into **SLA Met** vs **SLA Breached**, using the same breach logic as the SLA badge on task cards (deadline = `createdAt + SLA hours`; breached once that deadline has passed on an incomplete task). The center of the doughnut now shows the compliance percentage, colored green (≥90%), amber (70–90%), or red (<70%); the legend shows each bucket's count and percentage.

### Contract Analytics — doughnut chart
**Contract-category tasks only.** Four buckets:
- **Active** — not expiring soon, not expired, not in a renewal window
- **Expiring Soon** — Expiry Date within 30 days
- **Expired** — Expiry Date already passed
- **Renewed** — Renewal Date has passed but Expiry Date hasn't (i.e. the contract carried through a renewal checkpoint)

The center of the doughnut shows the total contract count. When any contracts are expiring soon, an amber callout below the chart reads **"N contracts expiring within 30 days →"** and jumps to that exact subset in Repository (§4).

### AI Task Analytics — stacked bar chart
**AI-category tasks only.** One stacked bar broken into **Successful**, **Failed**, **Running**, and **Queued** (tasks that haven't been executed yet — `idle` status), based on each task's current AI execution status. The success rate percentage is now shown prominently above the chart, and if any tasks have failed, a **"View failures →"** link jumps to Repository filtered to exactly those.

### Team Productivity — sortable table
One row per assignee: **Assigned**, **Completed**, **Pending** counts, **Completion %**, and **Avg. Completion Time**. Click any column header to sort by it. The Completion % column now includes a small inline proportional bar alongside the number, and rows are tinted green or red depending on whether that assignee's completion rate is above or below the team average (the Avg. Completion Time cell is similarly colored against the team's average time). Limited to the top 10 assignees by assigned-task count, with a **"Show all N assignees"** toggle. **Click a row** to open Repository filtered to that assignee (§4).

### Recent Activity Timeline
A feed combining the activity log from **every task** (task creation, status changes, comments, AI executions, contract signing, etc.), sorted newest-first and now:
- Grouped under **day headers** ("Today" / "Yesterday" / the date), same pattern used on the Task Details page's own timeline.
- Filterable by **tabs**: All, Status Changes, Comments, Assignments, AI Executions, Contract Events.
- Each entry's **task name is clickable**, jumping straight to that task's Details page.
- No longer hard-capped at 30 entries — a **"Load more"** button reveals 30 more at a time.

---

## 9. Export

The **Export** button (top-right, next to Filters) downloads the **currently filtered task list** — not chart images or aggregated numbers — in one of three formats:

| Format | Notes |
| --- | --- |
| CSV | Instant, no extra library load |
| Excel (.xlsx) | Loaded on demand via SheetJS |
| PDF | Loaded on demand via jsPDF + jsPDF-AutoTable |

Each export includes Title, Priority, Category, Status, Due Date, Estimated Time, Subtasks Completed, and Created At for every task matching the active filters — the same underlying export used by the Reports module's raw task export.

---

## 10. What Analytics does *not* do

- Chart clicks only drill down on the four charts listed in §3 (Status, Priority, Category, Assignee Workload) — the remaining charts either aren't natural drill-down targets (trend lines, tables) or expose a more specific click-through instead (Due Date Timeline, Task Aging, Contract, AI — see §4).
- There's no way to export a chart as an image, or export the dashboard as a PDF report (for that, use the **Reports** section instead, which supports building a custom report with an optional chart and exporting the whole thing).
- No new KPI cards or chart types beyond what's listed in §8 — Tasks Created Today, Average Task Age, a dedicated SLA Compliance KPI card, Busiest Assignee, a Burndown chart, Cycle Time histogram, Priority-vs-completion-time scatter plot, Category Health scorecards, a Workload radar chart, and goal tracking are all designed but explicitly deferred, not built yet.
- No natural-language filter input.
- The full "premium" visual redesign (12-column grid layout, collapsible section groups, unified chart typography/animation system, empty/loading-state illustrations, print stylesheet) is a separate, explicitly deferred phase — what's described in this document is the functional layer on top of the existing visual design.
