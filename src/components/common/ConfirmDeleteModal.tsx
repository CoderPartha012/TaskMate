import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ title, message, confirmLabel = 'Yes, delete', onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-noir-700 border border-white/[0.08] rounded-xl p-5 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <h3 className="font-display font-bold text-sm text-white">{title}</h3>
          </div>
          <p className="text-xs text-white/50 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
