import React from 'react';
import { isToday } from 'date-fns';
import { FileText, CalendarClock, Share2, Star, FilePlus2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReportsStore } from '../../store/reportsStore';

export function ReportsKPICards() {
  const { savedReports, history, scheduled, auditLog } = useReportsStore();

  const generatedToday = history.filter((h) => isToday(new Date(h.generatedAt))).length;
  const sharedCount = auditLog.filter((a) => a.type === 'shared').length;
  const favoriteCount = savedReports.filter((r) => r.isFavorite).length;

  const cards = [
    { label: 'Total Reports', value: history.length, icon: <FileText className="w-4 h-4" />, color: 'text-blue-400' },
    { label: 'Generated Today', value: generatedToday, icon: <FilePlus2 className="w-4 h-4" />, color: 'text-jade' },
    { label: 'Scheduled Reports', value: scheduled.length, icon: <CalendarClock className="w-4 h-4" />, color: 'text-amber-400' },
    { label: 'Shared Reports', value: sharedCount, icon: <Share2 className="w-4 h-4" />, color: 'text-purple-400' },
    { label: 'Favorite Reports', value: favoriteCount, icon: <Star className="w-4 h-4" />, color: 'text-amber-300' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon, color }) => (
        <motion.div
          key={label}
          whileHover={{ scale: 1.02 }}
          className="bg-noir-700 border border-white/[0.06] rounded-xl p-4"
        >
          <span className={color}>{icon}</span>
          <p className="font-display font-black text-2xl text-white leading-none mt-2">{value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mt-1.5">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}
