import React, { useState } from 'react';
import { CalendarIcon, CheckCircleIcon, Clock } from 'lucide-react';
import { Priority, Category, RecurrencePattern } from '../types';
import { useTaskStore } from '../store/taskStore';

type Errors = {
  title: string;
  dueDate: string;
  priority: string;
  category: string;
};

const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none transition-colors placeholder:text-white/25';
const selectBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none transition-colors';
const borderNormal = 'border border-white/[0.08] focus:border-jade';
const borderError  = 'border border-red-500/60 focus:border-red-500';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-widest text-white/40';
const req = <span className="text-priority-high" aria-hidden="true">*</span>;

export function TaskForm() {
  const addTask = useTaskStore((state) => state.addTask);

  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [dueDate,       setDueDate]       = useState('');
  const [priority,      setPriority]      = useState<Priority | ''>('');
  const [category,      setCategory]      = useState<Category | ''>('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [recurrence,    setRecurrence]    = useState<RecurrencePattern>('none');
  const [submitted,     setSubmitted]     = useState(false);
  const [errors,        setErrors]        = useState<Errors>({
    title: '', dueDate: '', priority: '', category: '',
  });

  const validate = (): Errors => ({
    title:    !title.trim() ? 'Title is required'        : '',
    dueDate:  !dueDate      ? 'Due date is required'     : '',
    priority: !priority     ? 'Please select a priority' : '',
    category: !category     ? 'Please select a category' : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    addTask({
      title: title.trim(),
      description,
      dueDate,
      priority:      priority  as Priority,
      status:        'pending',
      category:      category  as Category,
      recurrence,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined,
      subtasks:      [],
      dependencies:  [],
      archived:      false,
    });

    setTitle(''); setDescription(''); setDueDate('');
    setPriority(''); setCategory(''); setEstimatedTime('');
    setRecurrence('none'); setSubmitted(false);
    setErrors({ title: '', dueDate: '', priority: '', category: '' });
  };

  const err = (key: keyof Errors) => submitted && errors[key];

  return (
    <form onSubmit={handleSubmit} className="bg-noir-700 border border-white/[0.06] rounded-xl p-6 mb-6" noValidate>
      <h2 className="font-display font-bold text-base text-white mb-5 flex items-center gap-2">
        <CheckCircleIcon className="w-4 h-4 text-jade" aria-hidden="true" />
        Add New Task
      </h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className={labelClass}>
            Title {req}
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            aria-required="true"
            aria-describedby={err('title') ? 'err-title' : undefined}
            className={`${inputBase} ${err('title') ? borderError : borderNormal}`}
          />
          {err('title') && (
            <p id="err-title" role="alert" className="mt-1 text-[10px] text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className={labelClass}>Description</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Enter task description"
            className={`${inputBase} ${borderNormal} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label htmlFor="task-due" className={labelClass}>
              Due Date {req}
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4 pointer-events-none" aria-hidden="true" />
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-required="true"
                aria-describedby={err('dueDate') ? 'err-due' : undefined}
                className={`${inputBase} pl-9 ${err('dueDate') ? borderError : borderNormal}`}
              />
            </div>
            {err('dueDate') && (
              <p id="err-due" role="alert" className="mt-1 text-[10px] text-red-400">{errors.dueDate}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="task-priority" className={labelClass}>
              Priority {req}
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority | '')}
              aria-required="true"
              aria-describedby={err('priority') ? 'err-priority' : undefined}
              className={`${selectBase} ${err('priority') ? borderError : borderNormal}`}
            >
              <option value="" disabled>— Select priority —</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {err('priority') && (
              <p id="err-priority" role="alert" className="mt-1 text-[10px] text-red-400">{errors.priority}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="task-category" className={labelClass}>
              Category {req}
            </label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | '')}
              aria-required="true"
              aria-describedby={err('category') ? 'err-category' : undefined}
              className={`${selectBase} ${err('category') ? borderError : borderNormal}`}
            >
              <option value="" disabled>— Select category —</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
              <option value="other">Other</option>
            </select>
            {err('category') && (
              <p id="err-category" role="alert" className="mt-1 text-[10px] text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Recurrence */}
          <div>
            <label htmlFor="task-recurrence" className={labelClass}>Recurrence</label>
            <select
              id="task-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
              className={`${selectBase} ${borderNormal}`}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Estimated Time */}
        <div>
          <label htmlFor="task-time" className={labelClass}>Estimated Time (minutes)</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4 pointer-events-none" aria-hidden="true" />
            <input
              id="task-time"
              type="number"
              min="0"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 30"
              className={`${inputBase} pl-9 ${borderNormal}`}
            />
          </div>
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-white/25 mb-3">
            Fields marked with <span className="text-priority-high">*</span> are required
          </p>
          <button
            type="submit"
            disabled={!title.trim()}
            aria-disabled={!title.trim()}
            className="bg-jade hover:bg-jade-dark text-noir-800 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}
