import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTaskStore((state) => ({
    isDarkMode: state.theme.isDarkMode,
    toggleTheme: state.theme.toggleTheme,
  }));

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </motion.button>
  );
}