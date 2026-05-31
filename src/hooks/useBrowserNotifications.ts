import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';

export function useBrowserNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const permissionRef = useRef<NotificationPermission>('default');
  const firedIds = useRef(new Set<string>());

  useEffect(() => {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then((permission) => {
      permissionRef.current = permission;
    });
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || permissionRef.current !== 'granted') return;

    const newUnread = notifications.filter(
      (n) => !n.read && !firedIds.current.has(n.id)
    );

    newUnread.forEach((n) => {
      new Notification('TaskMate', { body: n.message });
      firedIds.current.add(n.id);
    });
  }, [notifications]);
}
