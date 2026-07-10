# Repository — Feature Documentation

This document explains the **Repository** section: the data table itself, global search, the advanced filter drawer, sorting, pagination, row actions, and the sample-data loader.

> Source files referenced in this doc: `src/components/RepositoryTableView.tsx`, `src/components/RepositoryTable.tsx`, `src/components/RepositoryFilterDrawer.tsx`, `src/components/RepositoryPagination.tsx`, `src/components/repositoryFilterTypes.ts`, `src/utils/sampleData.ts`.

---

## 1. Overview

Repository is the single, professional data-grid view of every task in the app, across all five task categories. It's deliberately built as a **plain table on the page background** — no card wrapper, no rounded outer border — with a bold divider under the header row and thin dividers between rows, matching the look of Jira/Azure DevOps/GitHub Issues rather than a "card list" UI.

Archived tasks are excluded by default (controlled by `filters.showArchived` in the task store; there's currently no UI toggle exposed for it, so archived tasks stay hidden).

---

## 2. Layout

From top to bottom:

1. **Toolbar** (top-right of the page) — **Load Sample Data** button, then **Filters** button (with an active-filter-count badge).
2. **The table** — sortable columns, one row per task, an Actions column on the right.
3. **Pagination bar** — "Showing X–Y of Z tasks", a rows-per-page selector, and page navigation.

The global **search box** (Task ID / Title / Assignee) is *not* inside the Repository page itself — it lives in the app's persistent header at the top of the project, so it's available from any section, but it only filters data on the Repository page.

---

## 3. Table columns

| Column | Sortable | Source |
| --- | --- | --- |
| Task ID | ✅ | First 8 characters of the task's internal ID (hover to see the full ID) |
| Task Title | ✅ | — |
| Task Category | ✅ | The task's type — General / Workflow / Project / AI / Contract (shown as a short badge) |
| Status | ✅ | Pending / In Progress / Completed, color-coded badge |
| Priority | ✅ | Low / Medium / High, color-coded badge |
| Assignee | ✅ | Comma-joined list of assignees, or `—` if none |
| Created By | ✅ | — |
| Created Date | ✅ | Formatted `MMM d, yyyy` |
| Due Date | ✅ | Formatted `MMM d, yyyy` |
| Last Updated | ✅ | The task's `lastModified` timestamp |
| Actions | — | View / Edit / Delete icon buttons |

Clicking a column header sorts by it; clicking the same header again flips the direction (an arrow icon shows the current sort column and direction). The table defaults to sorting by **Created Date, descending** (newest first) and supports horizontal scrolling on narrow screens rather than reflowing the columns.

---

## 4. Search

The header search box matches (case-insensitive, substring) against:

- Task ID
- Task Title
- Assignee names

It updates the table live as you type — there's no separate "search" button. Search and the advanced filters (below) apply together (AND logic).

---

## 5. Filters

Click **Filters** (top-right) to open a right-side drawer with:

| Filter | Type |
| --- | --- |
| Task ID | text (substring match) |
| Task Title | text (substring match) |
| Task Category | dropdown — General / Workflow / Project / AI / Contract |
| Status | dropdown — Pending / In Progress / Completed |
| Priority | dropdown — Low / Medium / High |
| Assignee | text (substring match) |
| Created By | text (substring match) |
| Created Date | date range (From / To) |
| Due Date | date range (From / To) |

All fields are optional and combine with **AND** logic — e.g. setting both Status and Priority only shows tasks matching both.

### Drawer buttons

- **Apply Filter** — copies the drawer's draft values into the active filter set, closes the drawer, and resets to page 1.
- **Reset** — clears the drawer's fields back to blank *and* immediately clears any already-applied filters (the table goes back to showing everything), but leaves the drawer open so you can build a new filter.
- **Clear All** — same as Reset, but also closes the drawer.

A small badge on the **Filters** button shows how many filter fields are currently active.

---

## 6. Pagination

- **15 / 25 / 50 / 100** rows per page (selector next to the "Showing…" text)
- **Previous** / **Next** buttons, disabled at the first/last page
- Numbered page buttons — for more than 7 pages, it condenses to first page, last page, the current page, and its immediate neighbors, with `…` for the gaps
- "Showing *X*–*Y* of *Z* tasks" text reflects the current page and the total after search + filters are applied
- Changing the search term, applying filters, or changing rows-per-page all reset you back to page 1

---

## 7. Row actions

Each row has three icon actions on the right:

| Action | Icon | Behavior |
| --- | --- | --- |
| View | eye | Opens the task's **Task Details** page in read-only mode |
| Edit | pencil | Opens the same Task Details page, but **jumps straight into Edit mode** |
| Delete | trash | Opens a confirmation dialog ("Delete this task permanently? This cannot be undone.") before removing the task |

See [`docs/ADD_NEW_TASK.md`](ADD_NEW_TASK.md) §10 for what the Task Details page shows for each task category.

---

## 8. Load Sample Data

The **Load Sample Data** button (top-left of the toolbar, jade-outlined) adds **20 hand-crafted demo tasks — 4 per category** — so Repository and Analytics have meaningful data to look at immediately:

- **General**: a budget review, a completed onboarding-docs task, an urgent bug fix, a personal event
- **Workflow**: four approval-style workflows, including one with a deliberately tight SLA so you can see the **SLA Breached** badge
- **Project**: sprint work items at different progress stages
- **AI**: one task in each of the four execution states — `success`, `running`, `failed`, `idle`
- **Contract**: one each of active, expiring-soon, expired, and "renewed"

It's **additive** — it never removes or overwrites your existing tasks — and goes through the normal undo/redo history, so `Ctrl+Z` (via the Undo button, shown on the Add Task/Task Details screens) removes it like any other action.

---

## 9. What Repository does *not* do

- No bulk/multi-select actions (no "select all + bulk delete", etc.) — actions are per-row.
- No inline cell editing — Edit always routes through the full Task Details edit mode.
- No column show/hide or reordering — the column set is fixed.
- No List/Grid/Kanban view toggle — Repository is table-only by design (an earlier version had these; they were intentionally removed in favor of a single professional data grid, consistent with Jira/Azure DevOps/ServiceNow-style tools).
