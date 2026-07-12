import React, { useState } from 'react';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';

const AVATAR_COLORS = ['bg-jade/20 text-jade', 'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-amber-500/20 text-amber-400'];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface TaskCommentsSectionProps {
  task: Task;
}

export function TaskCommentsSection({ task }: TaskCommentsSectionProps) {
  const addComment = useTaskStore((s) => s.addComment);
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    if (!draft.trim()) return;
    addComment(task.id, draft);
    setDraft('');
  };

  const sorted = [...task.comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4">Comments</h3>

      {sorted.length > 0 ? (
        <ul className="space-y-4 mb-4">
          {sorted.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(c.userId)}`}>
                {c.userId.slice(0, 1).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/80">{c.userId}</span>
                  <span className="text-[10px] text-white/30">{format(new Date(c.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <p className="text-xs text-white/60 mt-1 leading-relaxed break-words">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/30 mb-4">No comments yet.</p>
      )}

      <div className="flex items-start gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Write a comment…"
          className="flex-1 rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors placeholder:text-white/25 resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Add Comment
        </button>
      </div>
    </div>
  );
}
