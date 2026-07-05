import React, { useRef, useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  CheckCheck,
  ShieldAlert,
  FileWarning,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationType, TaskNotification } from '../types/notification.types';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; border: string; label: string }
> = {
  overdue: {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
    border: 'border-l-red-500',
    label: 'Overdue',
  },
  due_today: {
    icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    border: 'border-l-amber-400',
    label: 'Due Today',
  },
  upcoming: {
    icon: <Calendar className="w-3.5 h-3.5 text-jade" />,
    border: 'border-l-jade',
    label: 'Upcoming',
  },
  completed: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-jade" />,
    border: 'border-l-jade',
    label: 'Completed',
  },
  status_changed: {
    icon: <RefreshCw className="w-3.5 h-3.5 text-blue-400" />,
    border: 'border-l-blue-400',
    label: 'Status Changed',
  },
  task_added: {
    icon: <Plus className="w-3.5 h-3.5 text-jade" />,
    border: 'border-l-jade',
    label: 'Task Added',
  },
  sla_due_soon: {
    icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
    border: 'border-l-amber-400',
    label: 'SLA Due Soon',
  },
  sla_breached: {
    icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
    border: 'border-l-red-500',
    label: 'SLA Breached',
  },
  contract_expiring: {
    icon: <FileWarning className="w-3.5 h-3.5 text-amber-400" />,
    border: 'border-l-amber-400',
    label: 'Contract Expiring',
  },
  contract_expired: {
    icon: <FileWarning className="w-3.5 h-3.5 text-red-400" />,
    border: 'border-l-red-500',
    label: 'Contract Expired',
  },
};

function NotificationItem({ notification }: { notification: TaskNotification }) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const config = TYPE_CONFIG[notification.type];

  return (
    <button
      onClick={() => markAsRead(notification.id)}
      className={`w-full text-left px-4 py-3 border-l-2 ${config.border} ${
        notification.read ? 'bg-transparent' : 'bg-white/[0.03]'
      } hover:bg-white/[0.05] transition-colors`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white/80 leading-snug">{notification.message}</p>
          <p className="text-[10px] text-white/30 mt-1">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <span className="w-1.5 h-1.5 rounded-full bg-jade shrink-0 mt-1.5" />
        )}
      </div>
    </button>
  );
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotificationStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const badgeCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 leading-none">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <span className="text-xs font-semibold text-white/80">Notifications</span>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] text-white/40 hover:text-jade transition-colors px-2 py-1 rounded"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                All read
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[10px] text-white/40 hover:text-red-400 transition-colors px-2 py-1 rounded"
                title="Clear all"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-6 h-6 text-white/15 mx-auto mb-2" />
                <p className="text-[11px] text-white/30">You're all caught up</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
