import React, { Suspense, lazy } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskCard } from './components/TaskCard';
import { TaskFilters } from './components/TaskFilter';
import { TaskProgress } from './components/TaskProgress';
import { SearchBar } from './components/SearchBar';
import { ViewToggle } from './components/ViewToggle';
import { NotificationPanel } from './components/NotificationPanel';
import { CheckCircle2, Undo2, Redo2, Download } from 'lucide-react';
import { useTaskStore } from './store/taskStore';
import { useNotificationChecker } from './hooks/useNotificationChecker';
import { useBrowserNotifications } from './hooks/useBrowserNotifications';
import { motion, AnimatePresence } from 'framer-motion';

// Heavy components — loaded only when first needed
const KanbanBoard  = lazy(() => import('./components/KanbanBoard').then(m => ({ default: m.KanbanBoard })));
const Analytics    = lazy(() => import('./components/Analytics').then(m => ({ default: m.Analytics })));
const ExportModal  = lazy(() => import('./components/ExportModal').then(m => ({ default: m.ExportModal })));

function ChunkLoader() {
  return (
    <div className="flex items-center justify-center py-20 text-white/25 text-xs">
      Loading…
    </div>
  );
}

function App() {
  useNotificationChecker();
  useBrowserNotifications();

  const [showExport, setShowExport] = React.useState(false);

  const { tasks, filters, undo, redo } = useTaskStore();

  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (!filters.showArchived && task.archived) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const w = { low: 0, medium: 1, high: 2 };
          return w[b.priority] - w[a.priority];
        }
        case 'estimatedTime':
          return (b.estimatedTime || 0) - (a.estimatedTime || 0);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const renderContent = () => {
    if (filters.viewMode === 'analytics') {
      return (
        <Suspense fallback={<ChunkLoader />}>
          <Analytics />
        </Suspense>
      );
    }

    if (filters.viewMode === 'kanban') {
      return (
        <Suspense fallback={<ChunkLoader />}>
          <KanbanBoard />
        </Suspense>
      );
    }

    return (
      <div className={
        filters.viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      }>
        {filteredAndSortedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-white/30 text-sm col-span-full"
          >
            No tasks found. Start by adding a new task!
          </motion.div>
        ) : (
          filteredAndSortedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-noir-800">
      <div className="container mx-auto px-4 py-8">
        <header className="bg-noir-900 border-b border-white/[0.07] sticky top-0 z-50 mb-8 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={undo}
                aria-label="Undo last action"
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white"
              >
                <Undo2 className="w-5 h-5" aria-hidden="true" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={redo}
                aria-label="Redo last action"
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white"
              >
                <Redo2 className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </div>

            <h1 className="font-display font-black text-lg sm:text-xl text-jade tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" aria-hidden="true" />
              TaskMate
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExport(true)}
                aria-label="Export tasks"
                className="p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
              </button>
              <NotificationPanel />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mt-3">
            <SearchBar />
            <ViewToggle />
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <TaskProgress />
          {filters.viewMode !== 'analytics' && (
            <>
              <TaskForm />
              <TaskFilters />
            </>
          )}

          <AnimatePresence>
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      {showExport && (
        <Suspense fallback={null}>
          <ExportModal
            onClose={() => setShowExport(false)}
            filteredTasks={filteredAndSortedTasks}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
