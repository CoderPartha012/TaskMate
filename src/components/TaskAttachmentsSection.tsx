import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { FileText, FileSpreadsheet, FileImage, FileArchive, Download, Eye, Paperclip, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import {
  MAX_FILE_BYTES,
  ACCEPTED_LABEL,
  ACCEPT_ATTR,
  isAcceptedFile,
  formatFileSize,
  readFileAsDataUrl,
} from '../utils/attachmentRules';

function fileIcon(name: string) {
  const lower = name.toLowerCase();
  if (/\.(png|jpe?g|gif)$/.test(lower)) return <FileImage className="w-4 h-4 text-purple-400" />;
  if (/\.(xlsx?|csv)$/.test(lower)) return <FileSpreadsheet className="w-4 h-4 text-jade" />;
  if (/\.zip$/.test(lower)) return <FileArchive className="w-4 h-4 text-amber-400" />;
  return <FileText className="w-4 h-4 text-blue-400" />;
}

interface TaskAttachmentsSectionProps {
  task: Task;
}

export function TaskAttachmentsSection({ task }: TaskAttachmentsSectionProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const attachments = task.attachments ?? [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');

    const accepted = [];
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

    if (accepted.length > 0) {
      updateTask(
        task.id,
        { attachments: [...attachments, ...accepted] },
        [{
          type: 'attachment_added',
          message: accepted.length === 1
            ? `Uploaded "${accepted[0].name}"`
            : `Uploaded ${accepted.length} files`,
          user: 'You',
        }]
      );
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4">Attachments</h3>

      {attachments.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-3 bg-noir-600 border border-white/[0.07] rounded-lg px-3 py-2.5"
            >
              {fileIcon(att.name)}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80 truncate">{att.name}</p>
                <p className="text-[10px] text-white/35 mt-0.5">
                  {formatFileSize(att.size)} · Uploaded {format(new Date(att.uploadedAt), 'MMM d, yyyy')} by {att.uploadedBy}
                </p>
              </div>
              <a
                href={att.dataUrl}
                target="_blank"
                rel="noreferrer"
                title="View"
                className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
              </a>
              <a
                href={att.dataUrl}
                download={att.name}
                title="Download"
                className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/30 mb-4">No attachments yet.</p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-jade border border-dashed border-white/[0.15] hover:border-jade/40 rounded-lg px-3 py-2 transition-colors"
      >
        <Paperclip className="w-3.5 h-3.5" />
        Upload Attachment
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
        Supported formats: {ACCEPTED_LABEL}
        <br />
        Maximum file size: 5 MB per file
      </p>

      {error && (
        <p className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
