import React, { useEffect } from 'react';
import { Task, TaskFilter } from './types';
import { TaskForm } from './components/TaskForm';
import { TaskCard } from './components/TaskCard';
import { TaskFilters } from './components/TaskFilter';
import { TaskProgress } from './components/TaskProgress';
import { SearchBar } from './components/SearchBar';
import { ViewToggle } from './components/ViewToggle';
import { KanbanBoard } from './components/KanbanBoard';
import { CheckCircle2, Undo2, Redo2 } from 'lucide-react';
import { useTaskStore } from './store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const {
    tasks,
    filters,
    undo,
    redo,
  } = useTaskStore();

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
          const priorityWeight = { low: 0, medium: 1, high: 2 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        case 'estimatedTime':
          return ((b.estimatedTime || 0) - (a.estimatedTime || 0));
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const renderTaskList = () => {
    if (filters.viewMode === 'kanban') {
      return <KanbanBoard />;
    }

    return (
      <div className={`${
        filters.viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-4'
      }`}>
        {filteredAndSortedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-gray-500 col-span-full"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={undo}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white"
                title="Undo"
              >
                <Undo2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={redo}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white"
                title="Redo"
              >
                <Redo2 className="w-5 h-5" />
              </motion.button>
            </div>
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
              <CheckCircle2 className="w-10 h-10" />
              TaskMate
            </h1>
            <div className="w-20"></div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-6">
            <SearchBar />
            <ViewToggle />
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <TaskProgress />
          <TaskForm />
          <TaskFilters />
          
          <AnimatePresence>
            {renderTaskList()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;