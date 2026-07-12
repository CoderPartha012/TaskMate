# Repository — Feature Documentation

This document explains the **Repository** section: the data table, quick filters, the advanced filter drawer, row grouping, bulk selection, column customization, saved views, sorting, pagination, row actions, export, and the sample-data loader.

> Source files referenced in this doc: `src/components/repository/RepositoryTableView.tsx`, `src/components/repository/RepositoryTable.tsx`, `src/components/repository/RepositoryFilterDrawer.tsx`, `src/components/repository/RepositoryQuickFilters.tsx`, `src/components/repository/RepositoryActiveFilterPills.tsx`, `src/components/repository/RepositorySummaryBar.tsx`, `src/components/repository/RepositoryColumnsMenu.tsx`, `src/components/repository/RepositoryExportMenu.tsx`, `src/components/repository/RepositoryBulkActionBar.tsx`, `src/components/repository/RepositorySavedViewTabs.tsx`, `src/components/repository/repositoryFilterTypes.ts`, `src/components/repository/repositoryColumnTypes.ts`, `src/components/common/RepositoryPagination.tsx`, `src/components/common/TaskTypeSelector.tsx`, `src/components/common/analyticsShared.tsx`, `src/store/repositoryViewStore.ts`, `src/utils/sampleData.ts`.

---

## 1. Overview

Repository is the single, professional data-grid view of every task in the app, across all five task categories. It follows an **enterprise-SaaS visual language** (Linear/GitHub Issues/Notion-style) — a flat, borderless surface with generous vertical spacing between sections rather than boxed cards: no card wrapper around the table, no rounded outer border, and no divider lines — rows are distinguished purely by hover tint, selection tint, and an overdue red tint. The app's existing dark `noir`/`jade` color tokens are used throughout rather than a separate palette, so Repository stays visually consistent with the rest of the app.

Archived tasks are excluded by default (controlled by `filters.showArchived` in the task store; there's currently no UI toggle exposed for it, so archived tasks stay hidden).

---

## 2. Layout

From top to bottom, with roughly 24px of breathing room between each section (no boxed containers between them):

1. **Saved View tabs** — rounded pills; the one matching your current filters/sort/grouping is highlighted in jade with a check icon. See §9.
2. **Quick filter tabs** — a full-width icon + label nav-tab row with a sliding jade underline under the active tab, see §5.
3. **Task count summary metrics** — Total/Pending/In Progress/Completed/Overdue as stacked label-over-number blocks, see §6.
4. **Toolbar** — **Load Sample Data** on the left; on the right, a **Group By** dropdown, a **Relative/Absolute Dates** toggle, the **Columns** menu, **Export**, and **Filters** (with an active-filter-count badge).
5. **Active filter pills** (only shown when a filter is applied) — see §7.
6. **Bulk action bar** — appears whenever one or more rows are selected. See §8.
7. **"Select all N tasks across all pages"** link — appears only when every row on the current page is selected and more match elsewhere.
8. **The table** — sortable, groupable, resizable/reorderable columns, a leading checkbox column, one row per task, an Actions column on the right.
9. **Pagination bar** — "Showing X–Y of Z tasks", a rows-per-page selector, and page navigation (hidden while a Group By is active, since grouped view shows every matching row ungated).

The global **search box** (Task ID / Title / Assignee) is *not* inside the Repository page itself — it lives in the app's persistent header at the top of the project, so it's available from any section, but it only filters data on the Repository page.

---

## 3. Table columns

| Column | Sortable | Source |
| --- | --- | --- |
| Task ID | ✅ | First 8 characters of the task's internal ID (a full random UUID, so this prefix is effectively unique per task — hover to see the full ID) |
| Task Title | ✅ | — |
| Task Category | ✅ | The task's type — General / Workflow / Project / AI / Contract (shown as a small **outlined** badge) |
| Status | ✅ | Pending / In Progress / Completed — **click the badge to change it inline**, see §11 |
| Priority | ✅ | Low / Medium / High — **click the badge to change it inline**, see §11 |
| Assignee | ✅ | A colored-initial avatar plus the first assignee's name, with a muted `+N` suffix if there's more than one; `—` if none |
| Created By | ✅ | — |
| Created Date | ✅ | Relative ("2 days ago") or absolute ("MMM d, yyyy"), per the toolbar's date-display toggle; hover always shows the absolute date |
| Due Date | ✅ | Same relative/absolute display; shown in **bold red** when the task is overdue |
| Last Updated | ✅ | The task's `lastModified` timestamp, same relative/absolute display |
| Actions | — | View / Edit / Delete icon buttons |

Clicking a column header sorts by it; clicking the same header again flips the direction (an arrow icon shows the current sort column and direction). The table defaults to sorting by **Created Date, descending** (newest first) and supports horizontal scrolling on narrow screens rather than reflowing the columns. The header row is **sticky** while scrolling.

**Column customization** (via the toolbar's **Columns** button): a dropdown lists every column with a visibility checkbox and ▲/▼ buttons to reorder it — there's no drag-and-drop, by design (see §10). Column widths are also **resizable** — hover the right edge of any header to drag it wider or narrower. Visibility, order, and widths all persist across reloads.

**Keyboard navigation**: click into the table (or Tab to it) and use **Arrow Up/Down** to move a focus ring between rows, **Enter** to open the focused row's Task Details, **Delete** to open its delete confirmation, and **Escape** to clear focus.

**Row hover preview**: hovering a row for **500ms** shows a small floating card with the task's description (first 150 characters), tags, and a mini progress bar — useful for scanning without clicking in.

---

## 4. Search

The header search box matches (case-insensitive, substring) against:

- Task ID
- Task Title
- Assignee names

It updates the table live as you type. Search, the quick filter chip, and the advanced filters all apply together (search always narrows further, regardless of the filter-logic setting described in §6).

---

## 5. Quick filters

A full-width row of icon + label tabs sits above the summary metrics: **All Tasks, My Tasks, Due Today, Due This Week, Overdue, High Priority, Completed.** Only one is active at a time (default: All Tasks) — the active tab gets a sliding jade underline (animated with Framer Motion), jade text, and a soft jade background wash; inactive tabs are muted with a smooth hover transition. "My Tasks" matches tasks where Created By is `"You"` (there's no real auth, so this is the fixed placeholder used everywhere in this app for "you"). Quick filters apply as an extra condition **on top of** whatever's in the filter drawer — they don't replace it.

The task-count summary metrics' **Overdue** figure and the **Total Tasks** label are also clickable shortcuts into the equivalent quick filter / a full reset (see §6).

---

## 6. Task count summary metrics

A row of stacked label/number blocks sits below the quick filter tabs — **Total Tasks, Pending, In Progress, Completed**, and (only when non-zero) **Overdue** — each showing a small uppercase muted label with a large bold number underneath (Pending in amber, In Progress in blue, Completed in jade, Overdue in red, Total in white). There's no card or box background — just typography and spacing, directly on the page. Every metric is clickable: Total Tasks clears all filters, Pending/In Progress/Completed jump straight to that status, and Overdue activates the Overdue quick filter. Counts reflect the current search term but not yet the drawer filters, so the row always shows the full breakdown you could filter into.

---

## 7. Active filter pills

Whenever a quick filter or any drawer filter is active, a row appears below the toolbar listing each one as a dismissible pill (e.g. `Status: Pending ✕`, `Priority: High ✕`, `Due Date: Jul 1 – Jul 15 ✕`) plus a **Clear all** link on the right. There's no outer card/box around the row — it sits directly on the page — but each individual pill has its own subtle border so it still reads as a distinct chip. Removing a pill takes effect immediately — no need to reopen the drawer and click Apply.

---

## 8. Row grouping

The toolbar's **Group By** dropdown lets you group the table by **Category, Status, Priority,** or **Assignee** (or **No Grouping**, the default). When active, rows render under collapsible section headers like **"Status: In Progress (12 tasks)"** — click a header to collapse/expand that group. Grouped view shows every matching row across all groups at once (pagination is hidden while grouped, since "page 2 of a group" isn't a useful concept here).

---

## 9. Filters

Click **Filters** (top-right) to open a right-side drawer. From top to bottom:

- **Recent** — up to 5 of your most recently applied filter combinations, shown as one-click chips.
- **Saved Filters** — any combinations you've explicitly saved by name (see below), each removable with a small ✕.
- **Match filters: ALL (AND) / ANY (OR)** — a toggle controlling whether the fields below must *all* match (default) or whether matching *any one* of them is enough.
- **Task ID**, **Task Title** — text, substring match.
- **Task Category**, **Status**, **Priority** — now **multi-select** dropdowns (checkbox lists) instead of single-value selects, each option showing a live count of matching tasks. Category options are General/Workflow/Project/AI/Contract; Status is Pending/In Progress/Completed; Priority is Low/Medium/High.
- **Assignee**, **Created By** — text, substring match.
- **Created Date (Range)** — manual From/To date pickers.
- **Due Date (Range)** — From/To pickers, plus **quick range buttons**: Today, This Week, This Month, This Quarter.
- **Category-specific filters** — a section that slides in only when exactly **one** category is selected above:
  - **Workflow** → Approval Level, SLA Status (Breached / Due Soon / On Track)
  - **Contract** → Contract Type, Compliance Status
  - **AI** → Execution Status (Queued / Running / Successful / Failed)
- **Save this filter as…** — name the current draft and it's added to Saved Filters for reuse later.

### Drawer buttons

- **Apply Filter** — copies the drawer's draft values into the active filter set, records it in Recent, closes the drawer, and resets to page 1.
- **Reset Filters** — clears the drawer's fields back to blank *and* immediately clears any already-applied filters, but leaves the drawer open so you can build a new filter.
- **Clear All** — same as Reset, but also closes the drawer.

A small badge on the **Filters** button shows how many filter fields are currently active.

---

## 10. Bulk selection and actions

Every row (and the header) has a checkbox. The header checkbox selects/deselects everyone on the current page; once every row on the page is selected, a **"Select all N tasks across all pages"** link appears to extend the selection beyond the current page.

As soon as one or more rows are selected, a **bulk action bar** appears directly under the toolbar (not floating — it's part of the normal page flow) with:

- **Change Status** — dropdown; applying it updates every selected task's status in one action.
- **Change Assignee** — opens a small popover with a comma-separated name input and an Apply button.
- **Change Priority** — dropdown, same pattern as Status.
- **Export Selected** — runs the same CSV/Excel/PDF export as the toolbar's Export button, but scoped to just the selected rows.
- **Delete Selected** — asks for a "Delete N?" confirmation before removing them.

Every bulk action is a **single undo step** — one click of Undo (on the Task Details page's header, since Repository itself doesn't show the Undo/Redo buttons) reverts the whole batch, not one task at a time. Bulk status/priority changes don't fire individual per-task notifications (a single toast confirms the batch instead), to avoid flooding the notification panel.

---

## 11. Inline quick-edit

The **Status** and **Priority** badges in the table are themselves dropdowns — click one and pick a new value without leaving the table or opening the task. The change saves immediately and shows a small toast confirmation.

---

## 12. Column customization

See §3 for the mechanics (Columns menu, resize handles). Design note: reordering uses **▲/▼ move buttons**, not drag-and-drop — this was a deliberate choice over using a drag library, since the app's only installed drag dependency is unmaintained and the marginal UX gain didn't justify the risk for a short checkbox list. A **Reset to default** link at the bottom of the Columns menu restores the original column set, order, and widths.

---

## 13. Saved Views

Beyond per-filter presets (§9), you can save a **whole view** — filters, quick filter, sort column/direction, and grouping — as a named tab that appears above the table. Click **"+ Save current view"**, name it, and it becomes a one-click tab to jump back into that exact configuration later. Whichever saved view currently matches your live filters/sort/grouping exactly is highlighted with a jade background and a check icon, so you can tell at a glance whether you're looking at a saved configuration or an ad-hoc one. Tabs can be deleted individually (hover to reveal a small ✕).

---

## 14. Pagination

- **15 / 25 / 50 / 100** rows per page (selector next to the "Showing…" text)
- **Previous** / **Next** buttons, disabled at the first/last page
- Numbered page buttons — for more than 7 pages, it condenses to first page, last page, the current page, and its immediate neighbors, with `…` for the gaps
- "Showing *X*–*Y* of *Z* tasks" text reflects the current page and the total after search + quick filter + drawer filters are applied
- Changing the search term, applying filters, switching the quick filter, or changing rows-per-page all reset you back to page 1
- Hidden entirely when a Group By is active (see §8)

---

## 15. Row actions

Each row has three icon actions on the right:

| Action | Icon | Behavior |
| --- | --- | --- |
| View | eye | Opens the task's **Task Details** page in read-only mode |
| Edit | pencil | Opens the same Task Details page, but **jumps straight into Edit mode** |
| Delete | trash | Opens a confirmation dialog ("Delete this task permanently? This cannot be undone.") before removing the task |

See [`docs/ADD_NEW_TASK.md`](ADD_NEW_TASK.md) §11 for what the Task Details page shows for each task category.

---

## 16. Export

The toolbar's **Export** button downloads the **currently filtered/sorted task list** (search + quick filter + drawer filters all applied) in CSV, Excel (.xlsx), or PDF — the same underlying exporter used by Analytics. The bulk action bar's **Export Selected** uses the identical menu, scoped to just your checked rows instead.

---

## 17. Load Sample Data

The **Load Sample Data** button (toolbar, jade-outlined) adds **20 hand-crafted demo tasks — 4 per category** — so Repository and Analytics have meaningful data to look at immediately:

- **General**: a budget review, a completed onboarding-docs task, an urgent bug fix, a personal event
- **Workflow**: four approval-style workflows, including one with a deliberately tight SLA so you can see the **SLA Breached** badge
- **Project**: sprint work items at different progress stages
- **AI**: one task in each of the four execution states — `success`, `running`, `failed`, `idle`
- **Contract**: one each of active, expiring-soon, expired, and "renewed"

It's **additive** — it never removes or overwrites your existing tasks — and goes through the normal undo/redo history, so a single Undo click (available on the Task Details page's header) removes it like any other action. Each sample task gets its own randomly generated ID, same as a manually created task, so Task IDs stay unique even across a full sample-data load.

---

## 18. What Repository does *not* do

- No cross-page bulk selection beyond the explicit "Select all N across all pages" link — there's no "select everything matching this filter without paginating" shortcut beyond that.
- No inline cell editing beyond Status and Priority — every other field still routes through the full Task Details edit mode.
- Column **reordering** is button-based (▲/▼), not drag-and-drop — see §12 for why.
- No natural-language filter input — filters are structured fields only.
- No List/Grid/Kanban view toggle — Repository is table-only by design, consistent with Jira/Azure DevOps/ServiceNow-style tools.
