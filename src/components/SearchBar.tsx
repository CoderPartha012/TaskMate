import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const tasks = useTaskStore((state) => state.tasks);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filteredSuggestions = tasks
        .filter(task => 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(task => task.title)
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchTerm, tasks]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-noir-700 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/35 w-full sm:w-48">
        <Search className="w-3.5 h-3.5 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="bg-transparent outline-none w-full placeholder:text-white/25 text-white/70"
        />
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-noir-700 border border-white/[0.08] rounded-lg shadow-xl overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(suggestion);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-[12px] text-white/70 hover:bg-white/5 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}