# TaskMate — Modern Task Management System

![TaskMate](https://i.postimg.cc/zfSgNgcw/Taskmate.png)

TaskMate is a fully-featured, dark-themed task management app built with React, TypeScript, and Vite. It combines a polished UI with smart notifications, rich analytics, drag-and-drop kanban, CSV/Excel export, and a Lighthouse performance score of **98**.

---

## ✨ Features

### 📋 Task Management

- Create tasks with mandatory field validation — Title, Priority, Category, Due Date
- Set priority levels (Low, Medium, High) with colour-coded priority strips on each card
- Categorise tasks (Work, Personal, Urgent, Other) with per-category badge colours
- Add due dates, estimated time, and recurrence (Daily, Weekly, Monthly)
- Track status through Pending → In Progress → Completed
- Add subtasks with an animated progress bar showing completed / total
- Archive tasks and restore them at any time
- Full undo / redo history

### 🔍 Search & Filtering

- Live search with auto-complete suggestions
- Chip-style filter rows for Status, Priority, Category, and Sort order
- All active filters persist across view switches

### 📐 Multiple Views

| View | Description |
| --- | --- |
| **List** | Single-column stacked cards |
| **Grid** | Responsive 1 → 2 → 3 column card grid |
| **Kanban** | Drag-and-drop board across To Do / In Progress / Completed columns |
| **Analytics** | Full dashboard with 5 chart types (see below) |

### 📊 Analytics Dashboard

Five distinct chart sections in a responsive grid layout:

- **Donut chart** — Task status distribution with centre label and animated entrance
- **Gradient area chart** — Tasks completed over the last 7 days with a jade gradient fill
- **Horizontal bar chart** — Tasks by priority with background tracks and count labels
- **Radial bar chart** — Tasks by category as concentric rings with a legend
- **Calendar heatmap** — 365-day activity grid with dark jade colour scale and weekday labels

### 🔔 Smart Notification System

- In-app notification panel with unread badge (capped at 9+)
- Six notification types with distinct icon and border colours:
  - `task_added` — jade (new task created)
  - `completed` — jade (task marked done)
  - `status_changed` — blue (status updated)
  - `due_today` — amber (due date is today)
  - `upcoming` — jade (due within 2 days)
  - `overdue` — red (past due, not completed)
- Due-date checker runs on load and every hour automatically
- Native browser Notification API integration (requests permission once)
- Mark individual or all notifications as read; clear all
- Notifications persist across page refreshes via Zustand persist

### 📤 Export Tasks

- Export to **CSV** (pure JS, no extra download size on initial load)
- Export to **Excel** via SheetJS — loaded on-demand only (saves ~430 KB from initial bundle)
- Choose between **All Tasks** or **Current View** (respects active filters)
- Column widths, formatted dates, and `3 / 6` subtask counts included in the file
- Empty-state warning when the selected scope has no tasks

### 📱 Responsive Design

- Fully responsive from 320 px to wide desktop
- View toggle labels hidden on mobile (icons only below `sm:` breakpoint)
- Search bar expands full-width when stacked on narrow screens
- Notification dropdown capped to viewport width on mobile
- Single-column stack for all grids on small screens

---

## ⚡ Performance

Lighthouse scores on the production build:

| Category | Score |
| --- | --- |
| Performance | **98** |
| Accessibility | **93** |
| Best Practices | **96** |
| SEO | **91** |

| Core Web Vital | Value |
| --- | --- |
| First Contentful Paint | 1.8 s |
| Largest Contentful Paint | 1.8 s |
| Total Blocking Time | 10 ms |
| Cumulative Layout Shift | 0.005 |
| Time to Interactive | 2.1 s |

**How it's achieved:**

- Heavy chunks lazily loaded — recharts (413 KB), xlsx (429 KB), react-beautiful-dnd (245 KB) only download when first needed
- Manual Rollup chunk splitting — vendors cached separately by the browser
- Google Fonts loaded non-blocking (`media="print"` swap pattern)
- `aria-label` on all icon buttons, `htmlFor`/`id` on all form fields, `role="alert"` on validation errors

---

## 🛠️ Tech Stack

| Layer | Library |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite 5 (esbuild minify, esnext target) |
| Styling | Tailwind CSS 3 (custom dark palette) |
| State | Zustand with persist middleware |
| Animation | Framer Motion |
| Charts | Recharts |
| Drag & Drop | React Beautiful DnD |
| Calendar | React Calendar Heatmap |
| Date utils | date-fns |
| Export | SheetJS (xlsx) — lazy loaded |
| Icons | Lucide React |
| Fonts | Syne (display) + Manrope (body) via Google Fonts |

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/yourusername/taskmate.git
cd taskmate

# 2. Install (must include dev deps — npm omit=dev may be set globally)
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

```
src/
├── components/
│   ├── Analytics.tsx          # 5-chart analytics dashboard
│   ├── ExportModal.tsx        # CSV / Excel export modal
│   ├── KanbanBoard.tsx        # Drag-and-drop kanban
│   ├── NotificationPanel.tsx  # Bell dropdown + notification list
│   ├── TaskCard.tsx           # Individual task card
│   ├── TaskFilter.tsx         # Chip-style filter bar
│   ├── TaskForm.tsx           # Validated add-task form
│   ├── TaskProgress.tsx       # Overall progress bar
│   ├── ViewToggle.tsx         # List / Grid / Kanban / Analytics tabs
│   └── SearchBar.tsx          # Live search with autocomplete
├── hooks/
│   ├── useBrowserNotifications.ts   # Native Notification API
│   └── useNotificationChecker.ts    # Due-date polling hook
├── store/
│   ├── notificationStore.ts   # Notification state (persisted)
│   └── taskStore.ts           # Task state with undo/redo (persisted)
├── types/
│   └── notification.types.ts  # TaskNotification + NotificationType
├── utils/
│   └── exportUtils.ts         # exportToCSV / exportToExcel (xlsx lazy)
├── types.ts                   # Core domain types
├── App.tsx                    # Root layout + lazy chunk boundaries
└── index.css                  # Tailwind + CSS variables + heatmap overrides
```

---

## 🎨 Design System

| Token | Value | Usage |
| --- | --- | --- |
| `noir-900` | `#07070B` | Header background |
| `noir-800` | `#0A0A0F` | Page background |
| `noir-700` | `#13131A` | Card surface |
| `noir-600` | `#1C1C28` | Elevated / input background |
| `jade` | `#00C896` | Primary accent, CTAs, success |
| `priority-high` | `#FF4757` | High priority, overdue |
| `priority-medium` | `#FFA502` | Medium priority, due today |
| `priority-low` | `#00C896` | Low priority, upcoming |

---

## 🙏 Credits

- Icons — [Lucide React](https://lucide.dev)
- Fonts — [Google Fonts](https://fonts.google.com) (Syne, Manrope)
- Charts — [Recharts](https://recharts.org)
- Built with [Vite](https://vitejs.dev) + [React](https://react.dev)
