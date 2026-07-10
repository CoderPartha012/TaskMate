# Add New Task — Feature Documentation

This document explains how the **Add New Task** section works: the category-picker flow, exactly what fields exist for each of the five task categories, what's required vs optional, what happens on submit, and how each category's data is then displayed on the **Task Details** page.

> Source files referenced in this doc: `src/components/TaskForm.tsx`, `src/components/TaskTypeSelector.tsx`, `src/components/metaFieldConfigs.ts`, `src/components/TaskDetailPage.tsx`, `src/components/TaskCategoryMetaSection.tsx`, `src/store/taskStore.ts`.

---

## 1. Overview

Add New Task is reached from the sidebar. Instead of one long form, it opens on a **category picker** — five cards (General, Workflow, Project, AI, Contract), each with an icon and a one-line overview, laid out as two rows of two plus one centered card. **No fields are shown until a category is chosen.**

Selecting a category swaps the picker for a form containing:

1. A title field (relabeled per category — see below)
2. Only the fields relevant to that category
3. A **"← Change category"** link (top-right of the form) that discards the current draft and returns to the picker
4. An **Add Task** button, disabled until the title is filled in

On submit, the task is created and **the app automatically navigates to that task's Task Details page** — you never land back on a list after creating a task.

---

## 2. Fields common to every form

| Field | Notes |
| --- | --- |
| Title | Always present, but **relabeled per category** (see table below). The only field required for every category. |
| Due Date | Shown for **General, Workflow, Project** only. Required when shown. |
| Priority | Shown for **General, Project** only (Low / Medium / High). Required when shown. |
| Status | Shown for **General, Workflow, Project, Contract** (Pending / In Progress / Completed). Defaults to Pending. |
| Assignee | Shown for **General, Workflow, Project**. Free-text (no user directory exists), comma-separated for multiple people. Labeled "Task Owner" for Project. |

Fields that a category's form doesn't show are still given sensible silent defaults so the rest of the app (Repository table, Analytics, sorting) always has usable data:

- **Due Date**, when not collected (AI, Contract): defaults to the Contract's Effective Date if provided, otherwise today.
- **Priority**, when not collected (Workflow, AI, Contract): defaults to `medium`.
- **Category** (the legacy Work/Personal/Urgent/Other tag — distinct from Task Category/Type): only collected for General; defaults to `other` for every other type.
- **Status**, when not collected (AI): defaults to `pending`.

### Title label per category

| Category | Title field label |
| --- | --- |
| General Task Type | Task Name |
| Workflow-Based Tasks | Workflow Name |
| Project Management Tasks | Project Name |
| AI & Smart Task | Task Title |
| Contract / Business Workflow Tasks | Task Title |

---

## 3. General Task Type

The everyday to-do. Every field from the original spec is present:

| Field | Type | Required |
| --- | --- | --- |
| Task Name | text | ✅ |
| Description | textarea | — |
| Due Date | date | ✅ |
| Priority | select (Low/Medium/High) | ✅ |
| Category | select (Work/Personal/Urgent/Other) | ✅ |
| Assignee | text | — |
| Status | select | — (defaults Pending) |
| Recurrence | select (None/Daily/Weekly/Monthly) | — |
| Estimated Time (minutes) | number | — |
| Start Date | date | — |
| Tags | text, comma-separated | — |
| Attachments | file upload | — |
| Comments | textarea (becomes the task's first comment) | — |

**Attachments**: supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, PNG, JPG, JPEG, GIF, ZIP, up to **5 MB per file**. Files are stored as data URLs (no backend — everything lives in `localStorage`), each tagged with uploader and upload timestamp.

---

## 4. Workflow-Based Tasks

For approval/stage-driven work.

| Field | Type | Notes |
| --- | --- | --- |
| Workflow Name | text | The title field, required |
| Due Date | date | Required |
| Assignee | text | — |
| Status | select | — |
| Current Stage | text | e.g. "Draft" |
| Next Stage | text | e.g. "Review" |
| Reviewer | text | — |
| Approver | text | — |
| Approval Level | select (Level 1 / Level 2 / Level 3 / Executive) | — |
| Trigger Condition | text | e.g. "On document upload" |
| SLA (hours) | number | Drives automatic SLA breach detection |
| Escalation Rule | text | e.g. "Notify manager after breach" |

**SLA behavior**: the deadline is `createdAt + SLA hours`. If the current time passes that deadline and the task isn't completed, it's flagged **SLA Breached** (red badge); within 4 hours of the deadline it shows **SLA Due Soon** (amber badge). Both trigger an in-app notification the first time they're detected.

---

## 5. Project Management Tasks

| Field | Type | Notes |
| --- | --- | --- |
| Project Name | text | The title field, required |
| Due Date | date | Required |
| Priority | select | Required |
| Task Owner | text | The Assignee field, relabeled |
| Status | select | — |
| Epic | text | — |
| Sprint | text | — |
| Milestone | text | — |
| Team | text | — |
| Story Points | number | — |
| Estimated Hours | number | — |
| Actual Hours | number | — |
| Dependencies | text, comma-separated | Free-text task titles/IDs — not validated against real tasks |
| Progress (%) | number, 0–100 | — |

---

## 6. AI & Smart Task

For prompt-driven automation jobs. No Due Date, Priority, Category, Assignee, or Status fields — those don't apply to an automation job.

| Field | Type | Required |
| --- | --- | --- |
| Task Title | text | ✅ |
| AI Model | select (GPT-4o / Claude / Gemini / Custom Model) | — |
| Prompt | textarea | ✅ |
| Input Source | text | — |
| Output Type | select (Text / JSON / Image / Structured Data) | — |
| Trigger | select (Manual / Scheduled / Event-Based) | — |
| Automation Rule | text | — |
| Confidence Threshold (%) | number | — |
| Retry Policy | select (None / Retry Once / Retry 3x / Exponential Backoff) | — |
| Schedule | text | e.g. "Every day at 9am" |

**Execution Status** and **Result** are shown as **read-only, disabled fields** in the create form (they can't be meaningfully filled in before the task exists) and start at `idle` / empty. They — plus a running **Logs** list — only get populated once you use the **Execute** button on the Task Details page (see §10).

---

## 7. Contract / Business Workflow Tasks

| Field | Type | Notes |
| --- | --- | --- |
| Task Title | text | Required |
| Status | select | — |
| Contract ID | text | **Auto-generated** (`CTR-XXXXXX`) if left blank |
| Contract Type | select (NDA / MSA / SOW / Employment / Vendor Agreement / Other) | — |
| Template | text | — |
| Requestor | text | — |
| Business Unit | text | — |
| Counterparty | text | — |
| Reviewer | text | — |
| Approver | text | — |
| Signatory | text | — |
| Effective Date | date | — |
| Expiry Date | date | Drives the expiry alert |
| Renewal Date | date | Drives the "Renewed" bucket in Analytics |
| Compliance Status | select (Compliant / Non-Compliant / Pending Review) | — |
| Workflow Stage | text | e.g. "Legal Review" |
| Document Version | text | e.g. "v1.0" |

**Expiry behavior**: if the Expiry Date has passed, the task shows an **Expired** badge; if it's within 30 days, it shows **Expiring Soon**. Both surface as notifications the first time they're detected.

---

## 8. Validation summary

| Rule | Applies to |
| --- | --- |
| Title required | All categories |
| Due Date required | General, Workflow, Project |
| Priority required | General, Project |
| Category (Work/Personal/Urgent/Other) required | General only |
| Prompt required | AI only |

The **Add Task** button itself is disabled until the title is non-empty; other required-field errors appear inline after a submit attempt.

---

## 9. What happens on submit

1. A new `Task` object is created (`taskStore.addTask`), stamped with `id`, `createdAt`, `lastModified`, `createdBy: 'You'`, and an initial `activityLog` entry (`"Task created"`).
2. The form resets (still on the same category, in case you want to add another).
3. **You are navigated straight to that task's Task Details page** (`activeSection` → `task-detail`, `viewingTaskId` → the new task's id).

---

## 10. The Task Details page

Every category lands on the same page shell, but the **Category Details** panel renders different fields depending on the task's type.

### Always present, for every category

- **Header** — Task ID (short form), category badge, status badge, title/description (editable inline in Edit mode), and action buttons: **Edit Task**, **Assign**, **Complete Task**, **Delete Task** (with an inline confirm).
- **General Information** — two columns: Assignee / Priority / Status / Start Date / Due Date / Category on the left; a live Progress bar, Remaining Days, Estimated/Actual Hours, and Last Updated on the right.
- **Attachments** — list with file-type icon, filename, size, uploader, and upload date; upload button with the same 14-format/5 MB rule as the create form.
- **Comments** — threaded, timestamped, with an avatar initial; add new ones from a textarea at the bottom.
- **Activity Timeline** — every event recorded for this task (created, status changed, assigned, due date changed, attachment/comment added, plus the category-specific events below), newest first.
- **Quick Summary sidebar** (sticky) — Status, Priority, Assignee, Created By, Created On, Last Updated, Due Date, Progress, Remaining Days, and a Watchers list you can add/remove names from.
- **Edit mode** — toggled from "Edit Task"; turns the General Information fields and the Category Details fields into editable inputs. Saving diffs what changed into specific activity-log entries (e.g. "Status changed to completed", "Due date changed to Aug 10, 2026") rather than one generic message.

### Category Details panel, per category

- **General** — just **Tags** (everything else general-specific — Assignee/Priority/Status/Dates/Category — already lives in General Information; Attachments/Comments have their own sections).
- **Workflow** — Current Stage, Next Stage, Reviewer, Approver, Approval Level, Trigger Condition, SLA, Escalation Rule, plus the **SLA Breached / SLA Due Soon** badge when applicable. Editing the Current Stage logs a "Workflow stage changed" activity entry.
- **Project** — Epic, Sprint, Milestone, Team, Story Points, Estimated/Actual Hours, Dependencies, Progress %.
- **AI** — the input configuration fields (Model, Prompt, Input Source, Output Type, Trigger, Automation Rule, Confidence Threshold, Retry Policy, Schedule), plus a dedicated **AI Execution** block:
  - An **Execute** button that runs a simulated async job (~1.5s)
  - Live **Execution Status** badge (idle → running → success/failed)
  - **Started Time** / **Completed Time**
  - **Execution Output** (Result) once it finishes
  - A scrolling **Execution Logs** panel
  
  Execution status is randomized against the Confidence Threshold you set, so re-running can succeed or fail.
- **Contract** — all 15 contract fields, plus the **Expiring Soon / Expired** badge. If Compliance Status becomes "Compliant" or a Signatory is filled in where it was previously blank, a "Contract approved / signed" activity entry is logged automatically.

### Row actions elsewhere

From the **Repository** table, the **View** action opens a task's Details page in read-only mode; **Edit** opens the same page but jumps straight into Edit mode.

---

## 11. Known simplifications

- There's no real user/auth system — Assignee, Reviewer, Approver, Requestor, etc. are all free-text, not validated against a directory.
- AI execution is a **client-side simulation** (randomized against your confidence threshold) — no real model is called.
- Everything is stored in the browser's `localStorage` via Zustand's persist middleware; there is no server or database.
