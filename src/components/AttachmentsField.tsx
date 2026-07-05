import React, { useRef, useState } from 'react';
import { Paperclip, X, AlertCircle } from 'lucide-react';
import { TaskAttachment } from '../types';
import {
  MAX_FILE_BYTES,
  ACCEPTED_LABEL,
  ACCEPT_ATTR,
  isAcceptedFile,
  formatFileSize,
  readFileAsDataUrl,
} from '../utils/attachmentRules';

interface AttachmentsFieldProps {
  value: TaskAttachment[];
  onChange: (attachments: TaskAttachment[]) => void;
}

export function AttachmentsField({ value, onChange }: AttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');

    const accepted: TaskAttachment[] = [];
    for (const file of Array.from(files)) {
      if (!isAcceptedFile(file)) {
        setError(`"${file.name}" is not a supported file type (${ACCEPTED_LABEL})`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is too large (max 5 MB per file)`);
        continue;
      }
      const dataUrl = await readFileAsDataUrl(file);
      accepted.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString(),
      });
    }

    if (accepted.length > 0) onChange([...value, ...accepted]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    onChange(value.filter((a) => a.id !== id));
  };

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1">
        Attachments
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-jade border border-dashed border-white/[0.15] hover:border-jade/40 rounded-lg px-3 py-2 transition-colors"
      >
        <Paperclip className="w-3.5 h-3.5" />
        Add files
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-1.5 text-[10px] text-white/25 leading-relaxed">
        Supported file types: {ACCEPTED_LABEL}
        <br />
        Maximum file size: 5 MB
      </p>

      {error && (
        <p className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {value.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between gap-2 text-xs bg-noir-600 border border-white/[0.07] rounded-lg px-3 py-1.5"
            >
              <span className="truncate text-white/70">{att.name}</span>
              <span className="text-[10px] text-white/30 shrink-0">{formatFileSize(att.size)}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                aria-label={`Remove ${att.name}`}
                className="text-white/30 hover:text-red-400 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
