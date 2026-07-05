import React from 'react';
import { CheckCircle2, PlusCircle, Table2, BarChart2, FileDown, Settings } from 'lucide-react';
import { AppSection } from '../types';
import { useTaskStore } from '../store/taskStore';
import { motion } from 'framer-motion';

const SECTIONS: { section: AppSection; icon: React.ReactNode; label: string }[] = [
  { section: 'add-task',   icon: <PlusCircle className="w-4.5 h-4.5" />, label: 'Add New Task' },
  { section: 'repository', icon: <Table2 className="w-4.5 h-4.5" />,     label: 'Repository' },
  { section: 'analytics',  icon: <BarChart2 className="w-4.5 h-4.5" />,  label: 'Analytics' },
  { section: 'reports',    icon: <FileDown className="w-4.5 h-4.5" />,   label: 'Reports' },
  { section: 'settings',   icon: <Settings className="w-4.5 h-4.5" />,   label: 'Settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onNavigate: () => void;
}

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  const { activeSection, setActiveSection } = useTaskStore();

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 h-screen w-52 shrink-0 bg-noir-900 border-r border-white/[0.07] z-40 flex flex-col transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="px-5 py-6 flex items-center gap-2 border-b border-white/[0.07]">
        <CheckCircle2 className="w-6 h-6 text-jade shrink-0" aria-hidden="true" />
        <span className="font-display font-black text-lg text-jade tracking-tight">TaskMate</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {SECTIONS.map(({ section, icon, label }) => {
          const isActive = activeSection === section;
          return (
            <motion.button
              key={section}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveSection(section);
                onNavigate();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-jade/10 text-jade border border-jade/25'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }`}
            >
              {icon}
              {label}
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}
