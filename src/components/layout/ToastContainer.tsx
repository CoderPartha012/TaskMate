import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useToastStore, ToastItem } from '../../store/toastStore';

function Toast({ toast }: { toast: ToastItem }) {
  const dismissToast = useToastStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      className="flex items-center gap-2.5 bg-noir-700 border border-white/[0.1] rounded-lg shadow-lg px-4 py-2.5 text-xs text-white/80 min-w-[220px]"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-jade shrink-0" aria-hidden="true" />
      <span className="flex-1">{toast.message}</span>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            dismissToast(toast.id);
          }}
          className="text-[11px] font-bold text-jade hover:text-jade-light transition-colors shrink-0"
        >
          {toast.actionLabel}
        </button>
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
