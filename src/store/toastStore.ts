import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface NewToast {
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (toast: NewToast) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  showToast: (toast) => {
    const item: ToastItem = { duration: 2000, ...toast, id: crypto.randomUUID() };
    set((state) => ({ toasts: [...state.toasts, item] }));
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
