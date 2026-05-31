import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskNotification } from '../types/notification.types';

interface NotificationState {
  notifications: TaskNotification[];
  unreadCount: number;
  addNotification: (n: Omit<TaskNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notificationData) => {
        set((state) => {
          const isDuplicate = state.notifications.some(
            (n) =>
              n.taskId === notificationData.taskId &&
              n.type === notificationData.type &&
              n.message === notificationData.message
          );
          if (isDuplicate) return state;

          const notification: TaskNotification = {
            ...notificationData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            read: false,
          };

          const notifications = [notification, ...state.notifications].slice(0, 50);
          return {
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'notification-storage' }
  )
);
