import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { X, Send, Paperclip, Download, CheckCircle2, RotateCcw } from 'lucide-react';
import { Obligation, ObligationComment, Priority, Task, TaskAttachment } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { MAX_FILE_BYTES, ACCEPT_ATTR, isAcceptedFile, readFileAsDataUrl, ACCEPTED_LABEL } from '../../utils/attachmentRules';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30 block mb-1';

const AVATAR_COLORS = ['bg-jade/20 text-jade', 'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-amber-500/20 text-amber-400'];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface TaskObligationDrawerProps {
  task: Task;
  obligationId: string;
  onClose: () => void;
}

export function TaskObligationDrawer({ task, obligationId, onClose }: TaskObligationDrawerProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const fileRef = useRef<HTMLInputElement>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [titleDraft, setTitleDraft] = useState('');

  const obligations = task.obligations ?? [];
  const obligation = obligations.find((o) => o.id === obligationId);

  useEffect(() => {
    if (obligation) setTitleDraft(obligation.title);
  }, [obligation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!obligation) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obligation]);

  if (!obligation) return null;

  const patch = (fields: Partial<Obligation>, historyMessage?: string) => {
    const updated = obligations.map((o) => {
      if (o.id !== obligation.id) return o;
      const merged = { ...o, ...fields };
      if (historyMessage) {
        merged.history = [...o.history, { id: crypto.randomUUID(), message: historyMessage, user: 'You', timestamp: new Date().toISOString() }];
      }
      return merged;
    });
    updateTask(task.id, { obligations: updated });
  };

  const commitTitle = () => {
    const title = titleDraft.trim();
    if (!title || title === obligation.title) { setTitleDraft(obligation.title); return; }
    patch({ title }, `Renamed to "${title}"`);
  };

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    const comment: ObligationComment = { id: crypto.randomUUID(), user: 'You', content: commentDraft.trim(), createdAt: new Date().toISOString() };
    patch({ comments: [...obligation.comments, comment] }, 'Added a comment');
    setCommentDraft('');
  };

  const handleToggleComplete = () => {
    if (obligation.status === 'completed') {
      patch({ status: 'upcoming', progress: obligation.progress, completedAt: undefined }, 'Reopened obligation');
    } else {
      patch({ status: 'completed', progress: 100, completedAt: new Date().toISOString() }, 'Marked as complete');
    }
  };

  const handleUploadDocument = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!isAcceptedFile(file) || file.size > MAX_FILE_BYTES) return;
    const dataUrl = await readFileAsDataUrl(file);
    const attachment: TaskAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      dataUrl,
      uploadedBy: 'You',
      uploadedAt: new Date().toISOString(),
      obligationId: obligation.id,
    };
    updateTask(task.id, { attachments: [...(task.attachments ?? []), attachment] });
    patch({}, `Attached "${file.name}"`);
    if (fileRef.current) fileRef.current.value = '';
  };

  const linkedDocuments = (task.attachments ?? []).filter((a) => a.obligationId === obligation.id);
  const sortedComments = [...obligation.comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const sortedHistory = [...obligation.history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-noir-800 border-l border-white/[0.08] z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-noir-800 border-b border-white/[0.06] px-5 py-4 flex items-start justify-between gap-3 z-10">
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            aria-label="Obligation title"
            className="flex-1 min-w-0 bg-transparent font-display font-bold text-lg text-white focus:outline-none focus:bg-noir-600 rounded-lg px-2 py-1 -mx-2 transition-colors"
          />
          <button type="button" onClick={onClose} aria-label="Close drawer" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Owner</label>
              <input type="text" value={obligation.owner} onChange={(e) => patch({ owner: e.target.value })} className={inputBase} />
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select value={obligation.priority} onChange={(e) => patch({ priority: e.target.value as Priority })} className={inputBase}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input type="date" value={obligation.dueDate.slice(0, 10)} onChange={(e) => patch({ dueDate: e.target.value }, 'Changed due date')} className={inputBase} />
            </div>
            <div>
              <label className={labelClass}>Reminder</label>
              <input type="date" value={obligation.reminderDate?.slice(0, 10) ?? ''} onChange={(e) => patch({ reminderDate: e.target.value || undefined })} className={inputBase} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={obligation.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={3}
              placeholder="What does this obligation require?"
              className={`${inputBase} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={obligation.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={3}
              placeholder="Internal notes…"
              className={`${inputBase} resize-none`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={labelClass}>Completion</span>
              <span className="text-xs font-bold text-jade">{obligation.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={obligation.progress}
              onChange={(e) => patch({ progress: Number(e.target.value) })}
              className="w-full accent-jade mb-3"
              aria-label="Obligation progress"
            />
            <button
              type="button"
              onClick={handleToggleComplete}
              className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                obligation.status === 'completed'
                  ? 'border border-white/[0.1] text-white/60 hover:text-white'
                  : 'bg-jade hover:bg-jade-dark text-noir-800'
              }`}
            >
              {obligation.status === 'completed' ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {obligation.status === 'completed' ? 'Reopen Obligation' : 'Mark as Complete'}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={labelClass}>Documents</span>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-[11px] font-semibold text-jade hover:text-jade-light transition-colors">
                <Paperclip className="w-3 h-3" />
                Attach
              </button>
              <input ref={fileRef} type="file" accept={ACCEPT_ATTR} className="hidden" onChange={(e) => handleUploadDocument(e.target.files)} title={ACCEPTED_LABEL} />
            </div>
            {linkedDocuments.length > 0 ? (
              <ul className="space-y-1.5">
                {linkedDocuments.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 bg-noir-600 border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs">
                    <span className="flex-1 min-w-0 truncate text-white/70">{doc.name}</span>
                    <a href={doc.dataUrl} download={doc.name} aria-label={`Download ${doc.name}`} className="text-white/35 hover:text-jade transition-colors shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-white/25">No documents linked yet.</p>
            )}
          </div>

          <div>
            <span className={labelClass}>Comments</span>
            {sortedComments.length > 0 && (
              <ul className="space-y-3 mt-2 mb-2">
                {sortedComments.map((c) => (
                  <li key={c.id} className="flex items-start gap-2.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(c.user)}`}>
                      {c.user.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/80">{c.user}</span>
                        <span className="text-[10px] text-white/30">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 leading-relaxed break-words">{c.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-start gap-2 mt-2">
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={2}
                placeholder="Write a comment…"
                className={`${inputBase} resize-none flex-1`}
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!commentDraft.trim()}
                className="p-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Add comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <span className={labelClass}>History</span>
            <ul className="space-y-2 mt-2">
              {sortedHistory.map((h) => (
                <li key={h.id} className="text-xs text-white/50">
                  <span className="text-white/70">{h.message}</span>
                  <span className="text-white/25"> · {format(new Date(h.timestamp), 'MMM d, h:mm a')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </>
  );
}
