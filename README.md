# TaskMate — Enterprise Task Management Platform

![TaskMate](https://i.postimg.cc/c4SYbKQ8/jkd.png)

TaskMate is a dark-themed, enterprise-grade task management platform built with React, TypeScript, and Vite. What started as a task tracker has grown into a full mini task management suite: five distinct task categories with their own workflows, a professional data-grid Repository, an 18-section Analytics dashboard, a complete Reports module with a custom report builder and scheduling, and a Settings area with a real Roles & Permissions system — all running entirely client-side, with no backend required.

---

## 📚 Table of Contents

- [Navigation](#-navigation)
- [Task Categories](#-five-task-categories)
- [Add New Task](#-add-new-task)
- [Task Details Page](#-task-details-page)
- [Repository](#-repository)
- [Analytics Dashboard](#-analytics-dashboard)
- [Reports Module](#-reports-module)
- [Settings](#-settings)
- [Smart Notifications](#-smart-notifications)
- [Sample Data](#-sample-data)
- [Known Limitations](#-known-limitations)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Design System](#-design-system)
- [Credits](#-credits)

---

## 🧭 Navigation

A persistent left sidebar provides five top-level sections: **Add New Task**, **Repository**, **Analytics**, **Reports**, and **Settings**. A global header holds a project-wide task search box and the notification bell; Undo/Redo appear only where they're meaningful (Add New Task and Task Details).

---

## 🗂 Five Task Categories

Every task belongs to one of five categories, each with its own dedicated set of metadata fields:

| Category | Example fields |
| --- | --- |
| **General Task Type** | Priority, Status, Due/Start Date, Category, Tags, Attachments, Comments |
| **Workflow-Based Tasks** | Current/Next Stage, Reviewer, Approver, Approval Level, SLA (hours), Escalation Rule — with automatic **SLA breach detection** |
| **Project Management Tasks** | Epic, Sprint, Milestone, Team, Story Points, Estimated/Actual Hours, Progress % |
| **AI & Smart Tasks** | AI Model, Prompt, Input Source, Output Type, Confidence Threshold, Retry Policy — with a working **Execute** action that simulates a real async AI run (Started/Completed timestamps, Result, Logs) |
| **Contract / Business Workflow Tasks** | Contract ID (auto-generated), Contract Type, Counterparty, Effective/Expiry/Renewal Date, Compliance Status — with automatic **expiry/renewal alerts** |

---

## ➕ Add New Task

Instead of one long form, the Add New Task screen opens on a clean category picker (a 2×2 grid + one centered card) with an icon and short overview per category. Selecting a category reveals only the fields relevant to it, with a "Change category" escape hatch back to the picker. Attachments support PDF/DOC/DOCX/XLS/XLSX/PPT/PPTX/TXT/CSV/PNG/JPG/JPEG/GIF/ZIP up to 5 MB per file.

On submit, the app **automatically navigates to the new task's Task Details page**.

📄 Full field-by-field breakdown for all five categories, validation rules, and how each one renders on the Task Details page: [docs/ADD_NEW_TASK.md](docs/ADD_NEW_TASK.md)

---

## 📄 Task Details Page

A Jira/Azure DevOps–style detail view for every task:

- **Header** — Task ID, category badge, status, title/description, and Edit / Assign / Complete / Delete actions (delete has an inline confirm)
- **General Information** — two-column layout: core fields on the left, a live progress bar / remaining-days / estimated & actual hours / last-updated summary on the right
- **Category Details** — the fields specific to that task's category (including the full AI Execution panel with a working Execute button)
- **Attachments** — upload, view, and download, each entry showing uploader and upload date
- **Comments** — threaded, timestamped, with avatar initials
- **Activity Timeline** — a full audit trail per task: created, assigned, status/due-date changes, workflow stage changes, AI execution started/completed, contract signed, attachments/comments added
- **Quick Summary sidebar** — sticky panel with status, priority, assignee, created/updated dates, progress, remaining days, and a Watchers list
- **Edit mode** — toggled from the header, diffs every change into typed activity-log entries on Save

---

## 🗃 Repository

A single, clean professional data table (no card wrapper — page background shows through, matching Jira/Azure DevOps/GitHub Issues styling):

- Columns: Task ID, Task Title, Task Category, Status, Priority, Assignee, Created By, Created Date, Due Date, Last Updated — every column is sortable
- Global search (Task ID / Title / Assignee) in the header, live-filtering
- An advanced **Filter drawer** (Task ID, Title, Category, Status, Priority, Assignee, Created By, Created/Due Date ranges) with Apply / Reset / Clear All
- Pagination — 15/25/50/100 rows per page, page numbers, "Showing X–Y of Z tasks"
- Row actions: **View** (opens Task Details), **Edit** (opens Task Details already in edit mode), **Delete** (confirm dialog)
- A **Load Sample Data** button seeds 20 realistic demo tasks across all 5 categories — additive and fully undo-able

📄 Full breakdown of every column, filter field, and pagination behavior: [docs/REPOSITORY.md](docs/REPOSITORY.md)

---

## 📊 Analytics Dashboard

An enterprise BI-style dashboard, entirely computed client-side from your task data:

- **8 KPI cards** with period-over-period deltas: Total, Completed, Pending, In Progress, Overdue, High Priority, Completion Rate, Avg. Completion Time
- **18 charts/sections**, including: Status (doughnut) & Priority (bar), Category & Assignee Workload (horizontal bars), Due-Date Timeline & Completion Rate by Category, Task Creation/Completion trends (daily/weekly/monthly toggle), Overdue trend & Monthly Summary, Task Aging & Creator distribution, and three specialized panels — **SLA Compliance** (workflow), **Contract Analytics** (active/expiring/expired/renewed), and **AI Task Analytics** (success/failed/running/queued)
- A sortable **Team Productivity** table and a global **Recent Activity** feed
- Global filters (date range, category, status, priority, assignee, created by) and one-click Export (CSV/Excel/PDF)
- Loading skeletons and empty states throughout

📄 What every chart represents and how it's computed, plus filters and export: [docs/ANALYTICS.md](docs/ANALYTICS.md)

---

## 🧾 Reports Module

A tabbed reporting workspace: **Dashboard · Report Builder · Saved Reports · History · Scheduled · Audit Log**.

- **25 predefined report categories** across Task/User/Workflow/Project/AI/Contract groups, plus **7 templates** (Executive Summary, Weekly Team Report, SLA Report, etc.) — picking one preloads the builder with sensible columns/filters
- **Custom Report Builder** — pick columns, filter (date range, category, status, priority, assignee, created by, project, workflow, contract type), sort, group by, and optionally attach a chart (Pie/Bar/Line/Doughnut)
- **Live preview** — searchable, sortable, paginated, with grouped section headers
- **Export** to CSV/Excel/PDF (preserving filters/sort/grouping/columns), **Print** (print-friendly popout), and **Email** (opens your default mail client via `mailto:` with the report pre-filled)
- **Schedule** reports (Daily/Weekly/Monthly/Quarterly, start date/time/timezone, recipients) — runs via an in-app timer while the tab stays open
- **Saved Reports** (Favorites + Open/Duplicate/Delete), **History** (search + pagination + re-download), and a full **Audit Log**
- A "Viewing as [role]" switcher gates Generate/Export/Delete/Schedule based on the shared Roles & Permissions system (see Settings)

---

## ⚙ Settings

A horizontal card grid of 21 settings areas (Profile, Organization, User Management, Roles & Permissions, Task/Workflow/Project/AI/Contract Settings, Notification, Appearance, Repository, Analytics, Reports, Integrations, Security, Backup & Restore, Email Configuration, System Configuration, Audit Logs, Help & Support) — click a card to open its content below.

**Roles & Permissions** is fully implemented:

- 4 built-in roles (Administrator, Manager, Team Lead, Employee) plus the ability to **add/delete custom roles**
- A 13-permission matrix (Tasks, Repository, Analytics, Reports, System) with per-role checkboxes — Administrator is locked to full access
- Click any role card to simulate "viewing as" that role across the app (currently wired into the Reports module's action gating)

The remaining 20 areas are scaffolded with an icon and description, ready to be built out one at a time.

---

## 🔔 Smart Notifications

- In-app bell dropdown with unread badge, native browser Notification API integration
- Due-date awareness (due today / upcoming / overdue) checked on load and hourly
- **SLA breach / due-soon** alerts for Workflow tasks and **contract expiring / expired** alerts for Contract tasks, surfaced as badges on task cards and in notifications
- Mark-as-read, mark-all-as-read, clear all — persisted across refreshes

---

## 🌱 Sample Data

Repository → **Load Sample Data** adds 20 hand-crafted demo tasks — 4 per category — including a workflow task with a deliberately breached SLA, an AI task in each of the four execution states, and contracts covering active/expiring-soon/expired/renewed, so Analytics and Repository are meaningful immediately. It's additive (never overwrites existing tasks) and fully undo-able.

---

## ⚠ Known Limitations

TaskMate is a **frontend-only** app (Zustand + localStorage, no server). A few features are honest client-side approximations rather than the real thing:

- **Email** (Reports → Email) opens your default mail client via a `mailto:` link — TaskMate does not send email itself.
- **Scheduled reports** only run while the browser tab stays open (checked every 60s); there's no server to execute them in the background.
- **Roles & Permissions** is a simulated "viewing as" switcher for demonstrating gated UI, not real authentication/authorization.

---

## ⚡ Performance

- Heavy chunks are lazy-loaded — Analytics, Recharts, jsPDF/jsPDF-AutoTable, and SheetJS (xlsx) only download when a chart, PDF export, or Excel export is actually requested
- Manual Rollup vendor chunk splitting for better browser caching
- Google Fonts loaded non-blocking (`media="print"` swap pattern)

---

## 🛠 Tech Stack

| Layer | Library |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 (custom dark palette) |
| State | Zustand with persist middleware (separate stores for tasks, notifications, reports, roles) |
| Animation | Framer Motion |
| Charts | Recharts |
| Date utils | date-fns |
| Export | SheetJS (xlsx) + jsPDF/jsPDF-AutoTable — all lazy loaded |
| Icons | Lucide React |
| Fonts | Inter via Google Fonts |

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/CoderPartha012/TaskMate.git
cd TaskMate

# 2. Install (must include dev deps — npm omit=dev may be set globally, e.g. via NODE_ENV=production)
npm install --include=dev

# 3. Dev server
npm run dev
# → http://localhost:5173

# 4. Production build
npm run build

# 5. Preview production build locally
npm run preview
# → http://localhost:4173
```

---

## 🌍 Live Demo

[taskmate-partha.netlify.app](https://taskmatebypartha.netlify.app/)

---

## 📁 Project Structure

```text
src/
├── App.tsx                        # Root layout: sidebar + header + section router
├── types.ts                       # Core Task/Priority/Status/TaskType + per-category meta types
├── types/
│   ├── notification.types.ts      # TaskNotification + NotificationType
│   ├── report.types.ts            # ReportConfig, history, scheduling, categories, templates
│   └── roles.types.ts             # Role + PermissionKey definitions
├── store/
│   ├── taskStore.ts                # Tasks, filters, undo/redo, sample data (persisted)
│   ├── notificationStore.ts        # Notifications (persisted)
│   ├── reportsStore.ts             # Saved reports, history, schedules, audit log (persisted)
│   └── rolesStore.ts               # Roles + permission matrix (persisted)
├── hooks/
│   ├── useBrowserNotifications.ts  # Native Notification API
│   └── useNotificationChecker.ts   # Due-date / SLA / contract polling
├── utils/
│   ├── exportUtils.ts              # Raw task CSV/Excel/PDF export
│   ├── reportBuilder.ts            # Report filter/sort/group/export/schedule logic
│   ├── analyticsData.ts            # All Analytics KPI/chart computations
│   ├── taskAlerts.ts               # SLA breach + contract expiry helpers
│   ├── taskProgress.ts             # Progress %, remaining days, hours
│   ├── attachmentRules.ts          # Shared file-type/size validation
│   ├── metaDraft.ts                # Per-category meta draft (build/seed) helpers
│   └── sampleData.ts               # 20-task demo data generator
└── components/
    ├── Sidebar.tsx                          # Top-level navigation
    ├── TaskForm.tsx, TaskTypeSelector.tsx     # Add New Task + category picker
    ├── AttachmentsField.tsx, MetaFieldGroup.tsx
    ├── TaskDetailPage.tsx                    # Task detail orchestrator
    ├── TaskGeneralInfo.tsx, TaskCategoryMetaSection.tsx,
    │   TaskAttachmentsSection.tsx, TaskCommentsSection.tsx,
    │   TaskActivityTimeline.tsx, TaskQuickSummarySidebar.tsx
    ├── RepositoryTableView.tsx, RepositoryTable.tsx,
    │   RepositoryFilterDrawer.tsx, RepositoryPagination.tsx
    ├── Analytics.tsx                         # Dashboard orchestrator
    ├── AnalyticsKPICards.tsx, AnalyticsSkeleton.tsx, AnalyticsFilterDrawer.tsx,
    │   AnalyticsExportMenu.tsx, analyticsShared.tsx, analyticsFilterTypes.ts,
    │   Analytics*Charts.tsx (7 chart-row components)
    ├── ReportsPage.tsx                       # Reports module orchestrator (tabbed)
    ├── ReportCategoriesGrid.tsx, ReportBuilderPanel.tsx, ReportPreviewTable.tsx,
    │   ReportExportBar.tsx, ReportChart.tsx, ReportEmailModal.tsx, ReportScheduleModal.tsx,
    │   SavedReportsList.tsx, ReportHistoryTable.tsx, ScheduledReportsList.tsx,
    │   ReportAuditLogTable.tsx, ReportsGlobalFilterDrawer.tsx, ReportRoleSelector.tsx
    ├── SettingsPage.tsx, RolesPermissionsPage.tsx
    └── NotificationPanel.tsx
```

---

## 🎨 Design System

| Token | Value | Usage |
| --- | --- | --- |
| `noir-900` | `#07070B` | Header / sidebar background |
| `noir-800` | `#0A0A0F` | Page background |
| `noir-700` | `#13131A` | Card surface |
| `noir-600` | `#1C1C28` | Elevated / input background |
| `jade` | `#00C896` | Primary accent, CTAs, success |
| `priority-high` | `#FF4757` | High priority, overdue, breached SLA |
| `priority-medium` | `#FFA502` | Medium priority, due soon |
| `priority-low` | `#00C896` | Low priority |

---

## 🙏 Credits

- Icons — [Lucide React](https://lucide.dev)
- Fonts — [Google Fonts](https://fonts.google.com) (Inter)
- Charts — [Recharts](https://recharts.org)
- PDF export — [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- Excel export — [SheetJS](https://sheetjs.com)
- Built with [Vite](https://vitejs.dev) + [React](https://react.dev)
