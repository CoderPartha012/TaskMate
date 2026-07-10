import React, { Suspense, lazy, useEffect, useState } from 'react';
import { TaskForm } from './components/TaskForm';
import { NotificationPanel } from './components/NotificationPanel';
import { Sidebar } from './components/Sidebar';
import { RepositoryTableView } from './components/RepositoryTableView';
import { ReportsPage } from './components/ReportsPage';
import { TaskDetailPage } from './components/TaskDetailPage';
import { SettingsPage } from './components/SettingsPage';
import { ToastContainer } from './components/ToastContainer';
import { Menu, Undo2, Redo2, Search } from 'lucide-react';
import { useTaskStore } from './store/taskStore';
import { useDraftStore } from './store/draftStore';
import { useNotificationChecker } from './hooks/useNotificationChecker';
import { useBrowserNotifications } from './hooks/useBrowserNotifications';
import { motion } from 'framer-motion';

// Heavy components — loaded only when first needed
const Analytics = lazy(() => import('./components/Analytics').then(m => ({ default: m.Analytics })));

function ChunkLoader() {
  return (
    <div className="flex items-center justify-center py-20 text-xs text-white/25">
      Loading…
    </div>
  );
}

const SECTION_TITLES = {
  'add-task': 'Add New Task',
  repository: 'Repository',
  analytics: 'Analytics',
  reports: 'Reports',
  'task-detail': 'Task Details',
  settings: 'Settings',
} as const;

function App() {
  useNotificationChecker();
  useBrowserNotifications();

  useEffect(() => {
    useDraftStore.getState().expireOldDrafts();
  }, []);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { tasks, filters, activeSection, viewingTaskId, undo, redo } = useTaskStore();

  const renderSection = () => {
    switch (activeSection) {
      case 'add-task':
        return (
          <div className="max-w-2xl mx-auto">
            <TaskForm />
          </div>
        );
      case 'analytics':
        return (
          <Suspense fallback={<ChunkLoader />}>
            <Analytics />
          </Suspense>
        );
      case 'reports':
        return <ReportsPage />;
      case 'task-detail':
        return <TaskDetailPage taskId={viewingTaskId} />;
      case 'settings':
        return <SettingsPage />;
      case 'repository':
      default:
        return (
          <RepositoryTableView
            tasks={tasks.filter(t => filters.showArchived || !t.archived)}
            searchTerm={searchTerm}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-noir-800 lg:flex">
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="px-4 py-8">
          <header className="bg-noir-900 border-b border-white/[0.07] sticky top-0 z-20 mb-8 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                className="p-2 transition-colors rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 lg:hidden"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <h1 className="text-base font-bold tracking-tight text-white font-display sm:text-lg whitespace-nowrap">
                {SECTION_TITLES[activeSection]}
              </h1>
            </div>

            {activeSection !== 'settings' && (
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" aria-hidden="true" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Task ID, title, or assignee…"
                  aria-label="Search tasks"
                  className="w-full bg-noir-700 border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
                />
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {activeSection !== 'repository' && activeSection !== 'analytics' && activeSection !== 'reports' && activeSection !== 'settings' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={undo}
                    aria-label="Undo last action"
                    className="p-2 text-white rounded-lg bg-white/20 backdrop-blur-sm"
                  >
                    <Undo2 className="w-5 h-5" aria-hidden="true" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={redo}
                    aria-label="Redo last action"
                    className="p-2 text-white rounded-lg bg-white/20 backdrop-blur-sm"
                  >
                    <Redo2 className="w-5 h-5" aria-hidden="true" />
                  </motion.button>
                </>
              )}
              {activeSection !== 'settings' && <NotificationPanel />}
            </div>
          </header>

          <div className="max-w-6xl mx-auto">
            {renderSection()}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
