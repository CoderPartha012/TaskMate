# Add New Task — Feature Documentation

This document explains how the **Add New Task** section works: the category-picker flow, the tab-based category switcher, the drafts/auto-save system, exactly what fields exist for each of the five task categories, what's required vs optional, what happens on submit, and how each category's data is then displayed on the **Task Details** page.

> Source files referenced in this doc: `src/components/task-form/TaskForm.tsx`, `src/components/task-form/TaskCategoryTabs.tsx`, `src/components/common/TaskTypeSelector.tsx`, `src/components/common/metaFieldConfigs.ts`, `src/components/task-form/DraftsSection.tsx`, `src/components/task-form/DraftCard.tsx`, `src/utils/draftFormData.ts`, `src/store/draftStore.ts`, `src/components/task-detail/TaskDetailPage.tsx`, `src/components/task-detail/TaskDetailTabs.tsx`, `src/components/task-detail/TaskDetailsTab.tsx`, `src/components/task-detail/TaskGeneralInfo.tsx`, `src/components/task-detail/TaskDescriptionSection.tsx`, `src/components/task-detail/TaskSubtasksSection.tsx`, `src/components/task-detail/TaskCommentsSection.tsx`, `src/components/task-detail/TaskRelatedTasksSection.tsx`, `src/components/task-detail/TaskTimeTracker.tsx`, `src/components/task-detail/TaskDocumentsTab.tsx`, `src/components/task-detail/TaskLogsTab.tsx`, `src/components/task-detail/TaskObligationsTab.tsx`, `src/components/task-detail/TaskObligationDrawer.tsx`, `src/components/task-detail/TaskCreateObligationModal.tsx`, `src/components/task-detail/TaskCategoryMetaSection.tsx`, `src/components/common/ConfirmDeleteModal.tsx`, `src/store/taskStore.ts`.

---

## 1. Overview

Add New Task is reached from the sidebar. Instead of one long form, it opens on a **category picker** — five cards (General, Workflow, Project, AI, Contract), each with an icon and a one-line overview, laid out as two rows of two plus one centered card. **No fields are shown until a category is chosen.** If you have any saved drafts, they appear directly below the picker (see §3).

Selecting a category swaps the picker for a form containing:

1. A breadcrumb — **Add New Task → {category}** — where clicking "Add New Task" discards the current draft and returns to the picker
2. A horizontal **tab bar** for all five categories (see §2) so you can switch categories without losing shared fields or returning to the picker
3. A title field (relabeled per category — see below)
4. Only the fields relevant to that category, with category-specific fields fading in/out on switch
5. An **Add Task** button, disabled until the title is filled in

On submit, the task is created and **the app automatically navigates to that task's Task Details page** — you never land back on a list after creating a task. If you were editing a saved draft, it's deleted at that point since it's no longer needed.

---

## 2. Switching categories with the tab bar

Once a category is selected, a row of five tabs (General / Workflow / Project / AI / Contract) sits above the form. Clicking a different tab switches categories **without returning to the picker**, and behaves differently from the old "back to picker" flow:

- **Shared fields are preserved** — Title, Description, Due Date, Priority, Status, and Assignee carry over automatically to the new category's form.
- **Category-specific fields are cleared** — the `meta` fields (Current Stage, Prompt, Contract ID, etc.) and, when leaving General, the General-only extras (Start Date, Tags, Attachments, Comments) are reset.
- **A warning appears only when there's something to lose** — if you've filled in any category-specific field, an inline amber banner reads *"Switching will clear {category}-specific fields. Common fields will be kept."* with **Continue** / **Cancel**. If nothing category-specific was filled in, the switch happens immediately with no prompt.
- **The category-specific fields block animates** — a short fade/slide transition plays as fields swap in.
- **If a draft already exists for the category you're switching to**, a second banner appears: *"You have an existing draft for {category}. Resume it or start fresh?"* with **Resume Draft** (loads that draft's saved fields) or **Start Fresh** (keeps the blank/carried-over fields and dismisses the prompt).

The breadcrumb's **"Add New Task"** link is the one action that still does a full reset back to the category picker.

---

## 3. Drafts — auto-save and resume

Add New Task auto-saves your in-progress work as a **draft** so you don't lose it by navigating away. Drafts are stored in `localStorage` via a dedicated `draftStore`, separate from real tasks.

### When a draft is created or updated

- **Navigating away** — clicking any sidebar item while a category is selected and at least one field is filled saves a draft (detected on the form unmounting).
- **Switching categories via the tab bar** — the previous category's data is saved as a draft before the fields are cleared (see §2).
- **Clicking "Add New Task"** in the breadcrumb (with data filled in) — same as above, saves before resetting.
- **Every 30 seconds** while the form has at least one field filled in.

A draft is **never** created if the category was selected but no field was ever filled in, or if the only filled field is a title that's just whitespace. Each editing session updates the **same** draft (not a new one each time) — a fresh draft is only created the first time a session has something worth saving.

### The Drafts list

When at least one draft exists, a **📝 DRAFTS (N)** section appears below the category picker cards, separated by a divider. It shows your 3 most recently edited drafts (by last-modified time), with a **"Show all N drafts"** toggle if you have more. Each draft card shows:

- A colored category badge (icon + label, using the category's accent color)
- A title preview (first 50 characters, or *"Untitled Draft"* in italic if no title was set)
- 2–3 "preview chips" of the most relevant filled fields for that category (e.g. General shows Due/Priority/Assignee; Workflow shows Stage/Reviewer/SLA; Contract shows Type/Counterparty/Expiry)
- A thin completion-percentage bar (based on how many of that category's fields are filled) and a "last edited" relative timestamp
- **Resume** and **Delete** buttons, plus a **⋮** menu with *Resume editing*, *Delete draft*, and *Convert to different category* (keeps Title/Description/Due Date/Priority/Status/Assignee, clears everything category-specific, and lets you pick a new category)

### Resuming a draft

Clicking **Resume** loads that draft's category and every saved field back into the form, and shows an info bar at the top: *"📝 Resuming draft from {relative time}"* with a **Discard draft** link (deletes the draft and returns to the picker). If the draft had attachments, the info bar adds a note that attachments weren't saved with the draft and need to be re-uploaded — **attachment file data (the actual file contents) is deliberately not stored in drafts**, only the filename/size/type, since data URLs are too large to keep duplicating into `localStorage` on every auto-save.

### Limits and expiry

- **Maximum 10 drafts.** Once you're at the limit, a banner on the picker screen explains it and new drafts silently stop being created until you delete or complete one.
- **Drafts older than 30 days are silently removed** on app load — no notification, they just age out.
- Deleting a draft (from the list, the card menu, or the resume info bar's "Discard") shows a toast — deletion is final, there's no undo.

---

## 4. Fields common to every form

| Field | Notes |
| --- | --- |
| Title | Always present, but **relabeled per category** (see table below). The only field required for every category. |
| Due Date | Shown for **General, Workflow, Project** only. Required when shown. Shows an inline advisory (not blocking) if the date falls on a weekend or is already in the past. |
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

## 5. General Task Type

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

## 6. Workflow-Based Tasks

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

## 7. Project Management Tasks

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

## 8. AI & Smart Task

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

**Execution Status** and **Result** are shown as **read-only, disabled fields** in the create form (they can't be meaningfully filled in before the task exists) and start at `idle` / empty. They — plus a running **Logs** list — only get populated once you use the **Execute** button on the Task Details page (see §11).

---

## 9. Contract / Business Workflow Tasks

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

## 10. Validation summary

| Rule | Applies to |
| --- | --- |
| Title required | All categories |
| Due Date required | General, Workflow, Project |
| Priority required | General, Project |
| Category (Work/Personal/Urgent/Other) required | General only |
| Prompt required | AI only |

The **Add Task** button itself is disabled until the title is non-empty; other required-field errors appear inline after a submit attempt. The Due Date advisory (weekend / past date) is purely informational and never blocks submission.

---

## 11. The Task Details page

The page was rebuilt into an enterprise-style **tabbed workspace** — a single scrolling page with everything stacked in one column no longer exists. Every category lands on the same shell (header + tab bar); only the **Category Details** block inside the Details tab renders different fields depending on the task's type.

### Header

- **Back to Repository** link, top-left.
- **Badge row**: Task ID (short form, monospace), Category badge, a **live Status dropdown** (Pending / In Progress / Completed — changes save immediately and log a "Status changed from X to Y" activity entry, whether or not you're in Edit mode), and a **live Priority dropdown** (Low / Medium / High, same immediate-save behavior, logs a "Priority changed to X" entry).
- **Title** — large (32px bold), editable inline when in Edit mode. The description is *not* shown in the header — see the Description card in §11.1.
- **Actions, top-right**: a primary **Edit Task** button, and a **"…" overflow menu** containing **Complete Task**, **Duplicate Task** (creates a copy titled "{Title} (Copy)" with status reset to Pending, subtasks unchecked, comments/watchers/timer cleared, and — for AI tasks — execution state reset to idle, then navigates you straight to the new task), and **Delete Task**. There's no separate "Assign" button anymore — it was folded into Edit Task since it did the exact same thing.
- **Delete Task** opens a proper confirmation **popup** (backdrop + centered dialog, via the shared `ConfirmDeleteModal`) rather than an inline banner — the same popup component used for deleting Documents and Obligations (§11.5, §11.7).

### Tab bar

Below the header sits a horizontal tab bar with a sliding jade underline (Framer Motion) marking the active tab. Switching tabs never reloads the page and fades the new content in. The tabs, in order:

**Details → Subtasks → Comments → Related Tasks → Documents → Logs → Obligations**

### 11.1 Details tab

The default tab. A two-column layout (main content ~65%, a sticky **Quick Summary** sidebar ~35%):

- **General Information** — two sub-columns: Assignee / Priority / Status / Start Date / Due Date / Category on the left (editable in Edit mode); a live Progress bar, Remaining Days, Estimated/Actual Hours, **Created By**, **Created On**, and Last Updated on the right (read-only). The Progress bar is driven by **Subtasks** when the task has any (completed ÷ total), falling back to the category's own progress logic otherwise.
- **Description** — its own card, separate from the header now; shows the task description, or an editable textarea in Edit mode.
- **Time Tracker** — a Start/Stop timer card. Starting stamps a start time on the task; while running it shows a live elapsed-time readout. Stopping adds the elapsed minutes to the task's Actual Time (and, for Project tasks, to Actual Hours too) and logs a "Worked for Xh Ym" activity entry. Timer state lives on the task itself, so it survives navigation/reload, and every task has its own independent timer.
- **Category Details** — the category-specific panel, see §11.2 below.
- **Quick Summary sidebar** (sticky) — Status, Priority, Assignee, Created By, Created On, Last Updated, Due Date, Progress, Remaining Days, and a Watchers list you can add/remove names from. (The sidebar no longer shows a recent-activity preview — Logs is now the single place to check activity, see §11.6.)
- **Edit mode** — toggled from "Edit Task"; turns the General Information, Description, and Category Details fields into editable inputs. A **Cancel / Save Changes** bar appears at the bottom of the Details tab while editing. Saving diffs what changed into specific activity-log entries (e.g. "Status changed from pending to completed", "Due date changed to Aug 10, 2026") rather than one generic message.

### 11.2 Category Details panel, per category

- **General** — just **Tags** (everything else general-specific already lives in General Information; Subtasks/Comments/Documents have their own tabs).
- **Workflow** — Current Stage, Next Stage, Reviewer, Approver, Approval Level, Trigger Condition, SLA, Escalation Rule, plus the **SLA Breached / SLA Due Soon** badge when applicable. Editing the Current Stage logs a "Workflow stage changed" activity entry.
- **Project** — Epic, Sprint, Milestone, Team, Story Points, Estimated/Actual Hours, Dependencies, Progress %.
- **AI** — the input configuration fields (Model, Prompt, Input Source, Output Type, Trigger, Automation Rule, Confidence Threshold, Retry Policy, Schedule), plus a dedicated **AI Execution** block (Execute button, live Execution Status badge, Started/Completed time, Execution Output, a scrolling Execution Logs panel). Execution status is randomized against the Confidence Threshold you set, so re-running can succeed or fail.
- **Contract** — all 15 contract fields, plus the **Expiring Soon / Expired** badge. If Compliance Status becomes "Compliant" or a Signatory is filled in where it was previously blank, a "Contract approved / signed" activity entry is logged automatically.

### 11.3 Subtasks tab

The checklist that used to live inside the Details tab now has its own tab: add via text input + Enter/Add, toggle complete via checkbox, delete via a trash icon, with an "X/Y done" count. Shown for **all five categories**. Adding, completing, or removing a subtask logs an activity entry.

### 11.4 Comments tab

Also promoted to its own tab. Threaded, timestamped comments with an avatar initial; add new ones from a textarea at the bottom.

### 11.5 Documents tab

Replaces the old flat "Attachments" list with a full document-management table — **File Name, Type, Version, Uploaded By, Upload Date, Size, Actions**:

- **Upload Document** button, a **search box**, and a **type filter** (All / Documents / Spreadsheets / Images / Archives) in the toolbar.
- **Real version history** — each file's **Version** column shows `vN`; the **Replace Version** action (a refresh icon) uploads a new file over an existing one and pushes the old one into that document's version history rather than discarding it. Files with more than one version get a clickable version badge that opens a small popover listing every prior version (uploader, date, and a download link).
- **Rename** (inline, click the pencil icon) and **Delete** (trash icon, opens the shared confirm popup) per row.
- **Bulk delete** — a checkbox column (plus a header "select all on this page" checkbox) and a bulk-action bar that appears once anything is checked, with a **Delete Selected** button (confirmed via the same popup, scoped to however many are checked).
- **Pagination** — 10 rows per page by default (adjustable), with the same "Showing X–Y of Z" + page controls used on Repository.
- Same upload rules as the create form: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, PNG, JPG, JPEG, GIF, ZIP, up to 5 MB per file.
- Empty state shows a centered icon + "No documents yet — upload your first file to get started."

### 11.6 Logs tab

Replaces the old inline "Activity Timeline" section — now the **single place** to review everything that happened to a task (the Details-tab sidebar no longer shows an activity preview). Features:

- A **toolbar**: search (matches message text or the acting user), an **Activity Type** filter (checkbox list over every event type — Status Changes, Assigned, Metadata Updated, Attachment Added, Comment Added, Due Date Changed, AI Execution Started/Completed, Workflow Stage Changed, Contract Events), and an **Export** button that downloads the currently-filtered entries as a CSV.
- Entries render as a **timeline** (connector line + icon dot per event) grouped under **Today / Yesterday / Earlier** headers, each showing a short bold event title, the existing descriptive message, a colored avatar for the acting user, and a timestamp.

### 11.7 Related Tasks tab

New feature — surfaces the task's `dependencies` (an array of related task IDs that already existed on the data model but had no dedicated UI before). Shows each linked task as a row with a status dot, its title, a **View** button (jumps to that task's own Details page), and a remove button. A search-as-you-type box below the list lets you link any other existing task by title; there's no "add dependency" limit.

### 11.8 Obligations tab

A fully new **contract-lifecycle-management-style** sub-feature — obligations are commitments tied to a task (e.g. "Renew software license"), independent from Subtasks:

- **+ Create Obligation** opens a form (not a blank drawer) — Title, Owner, Priority, Due Date, Reminder, and an optional Description — before anything is created.
- The table lists every obligation: **Obligation, Owner, Due Date, Reminder, Status, Priority, Progress, Actions**. **Status** is computed automatically from the due date (Upcoming / Due Soon within 7 days / Overdue) unless the obligation has been explicitly marked Completed.
- Clicking a row (or its **Eye** action) opens a **right-side slide-in drawer** with: Owner/Priority/Due Date/Reminder fields, Description, Notes, a **Completion** progress slider plus a Mark-as-Complete/Reopen button, a **Documents** section (uploads here are tagged to that specific obligation and also show up in the main Documents tab), a **Comments** thread scoped to that obligation, and an auto-tracked **History** log of what changed and when.
- **Bulk delete** (checkbox column + bulk-action bar) and **pagination** work exactly the same way as the Documents tab (§11.5).
- Delete (single or bulk) goes through the same shared confirm popup as Task/Document delete.

### Row actions elsewhere

From the **Repository** table, the **View** action opens a task's Details page (defaulting to the Details tab) in read-only mode; **Edit** opens the same page but jumps straight into Edit mode on the Details tab. The Repository table also lets you change Status and Priority directly from its own row badges — see `docs/REPOSITORY.md`.

---

## 12. Known simplifications

- There's no real user/auth system — Assignee, Reviewer, Approver, Requestor, etc. are all free-text, not validated against a directory.
- AI execution is a **client-side simulation** (randomized against your confidence threshold) — no real model is called.
- An Obligation's **Reminder** date is stored and displayed but doesn't trigger a real notification — there's no scheduled-job/email layer behind it, consistent with the rest of the app's client-side-only "real-time" features.
- Everything is stored in the browser's `localStorage` via Zustand's persist middleware; there is no server or database — this includes drafts, which live in their own persisted store separate from real tasks.
- The global **Undo/Redo** buttons (top-right of the app header) are only shown on the **Task Details** page — not on Add New Task, since drafts already provide the relevant safety net there.
