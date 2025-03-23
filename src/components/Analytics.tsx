import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import { useTaskStore } from '../store/taskStore';
import { format, subDays } from 'date-fns';
import { Category, Priority } from '../types';
import { motion } from 'framer-motion';
import 'react-calendar-heatmap/dist/styles.css';

const COLORS = {
  completed: '#10B981',
  pending: '#F59E0B',
  inProgress: '#3B82F6',
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const CATEGORY_COLORS = {
  work: '#3B82F6',
  personal: '#8B5CF6',
  urgent: '#EF4444',
  other: '#6B7280',
};

export function Analytics() {
  const tasks = useTaskStore((state) => state.tasks);

  // Calculate analytics data
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');

  const totalTimeSpent = completedTasks.reduce((acc, task) => acc + (task.actualTime || 0), 0);
  const averageTimePerTask = completedTasks.length ? totalTimeSpent / completedTasks.length : 0;

  // Task distribution by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<Category, number>);

  // Task distribution by priority
  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<Priority, number>);

  // Daily task completion data for heatmap
  const last365Days = Array.from({ length: 365 }, (_, i) => {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const count = completedTasks.filter(
      (task) => task.completedAt && format(new Date(task.completedAt), 'yyyy-MM-dd') === date
    ).length;
    return { date, count };
  }).reverse();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingTasks.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Total Time Spent</h3>
          <p className="text-3xl font-bold text-blue-600">{Math.round(totalTimeSpent / 60)}h</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Avg. Time per Task</h3>
          <p className="text-3xl font-bold text-purple-600">{Math.round(averageTimePerTask)}m</p>
        </motion.div>
      </div>

      {/* Task Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(tasksByCategory).map(([category, value]) => ({
                  name: category,
                  value,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(tasksByCategory).map(([category], index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[category as Category]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(tasksByPriority).map(([priority, count]) => ({
                priority,
                count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8">
                {Object.entries(tasksByPriority).map(([priority], index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[priority as Priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Completion Heatmap */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Completion Heatmap</h3>
        <CalendarHeatmap
          startDate={subDays(new Date(), 365)}
          endDate={new Date()}
          values={last365Days}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count < 3) return 'color-scale-1';
            if (value.count < 5) return 'color-scale-2';
            return 'color-scale-3';
          }}
        />
      </div>
    </div>
  );
}