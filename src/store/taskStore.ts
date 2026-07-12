import { create } from 'zustand';
import { ActivityEntry, AIExecutionRun, AppSection, Comment, Task, TaskFilter, ThemeConfig } from '../types';
import { persist } from 'zustand/middleware';
import { useNotificationStore } from './notificationStore';
import { generateSampleTasks } from '../utils/sampleData';
import { simulateAIExecution } from '../utils/aiSimulation';
import { RepositoryFilters, QuickFilterKey } from '../components/repository/repositoryFilterTypes';
import type { TaskDetailTabKey } from '../components/task-detail/TaskDetailTabs';

export interface PendingRepositoryHandoff {
  filters: RepositoryFilters;
  quickFilter: QuickFilterKey;
}

type NewTaskData = Omit<Task, 'id' | 'createdAt' | 'lastModified' | 'subtasks' | 'archived' | 'comments' | 'activityLog' | 'createdBy' | 'watchers'> & {
  initialComment?: string;
};

type NewActivityEntry = Omit<ActivityEntry, 'id' | 'timestamp'>;

interface TaskState {
  tasks: Task[];
  filters: TaskFilter;
  theme: ThemeConfig;
  activeSection: AppSection;
  viewingTaskId: string | null;
  editOnOpen: boolean;
  pendingRepositoryHandoff: PendingRepositoryHandoff | null;
  pendingTaskDetailTab: TaskDetailTabKey | null;
  settingsResetToken: number;
  history: {
    past: Task[][];
    future: Task[][];
  };
  addTask: (task: NewTaskData) => string;
  updateTask: (id: string, updates: Partial<Task>, activityEntries?: NewActivityEntry[]) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => void;
  bulkDeleteTasks: (ids: string[]) => void;
  deleteTask: (id: string) => void;
  archiveTask: (id: string) => void;
  restoreTask: (id: string) => void;
  addComment: (taskId: string, content: string) => void;
  updateFilters: (filters: Partial<TaskFilter>) => void;
  setActiveSection: (section: AppSection) => void;
  setViewingTaskId: (id: string | null) => void;
  setEditOnOpen: (value: boolean) => void;
  setPendingRepositoryHandoff: (handoff: PendingRepositoryHandoff | null) => void;
  setPendingTaskDetailTab: (tab: TaskDetailTabKey | null) => void;
  resetSettingsView: () => void;
  runAITask: (id: string) => void;
  duplicateTask: (id: string) => string;
  loadSampleData: () => void;
  undo: () => void;
  redo: () => void;
}

function makeActivityEntry(entry: NewActivityEntry): ActivityEntry {
  return { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: {
        status: 'all',
        priority: 'all',
        category: 'all',
        sortBy: 'dueDate',
        showArchived: false,
      },
      theme: {
        accentColor: '#3B82F6',
      },
      activeSection: 'repository',
      viewingTaskId: null,
      editOnOpen: false,
      pendingRepositoryHandoff: null,
      pendingTaskDetailTab: null,
      settingsResetToken: 0,
      history: {
        past: [],
        future: [],
      },
      addTask: (taskData) => {
        const { initialComment, ...rest } = taskData;
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const comments: Comment[] = initialComment?.trim()
          ? [{
              id: crypto.randomUUID(),
              taskId: id,
              userId: 'you',
              content: initialComment.trim(),
              createdAt: now,
              mentions: [],
            }]
          : [];

        const task: Task = {
          ...rest,
          id,
          createdAt: now,
          lastModified: now,
          subtasks: [],
          archived: false,
          comments,
          createdBy: 'You',
          watchers: [],
          activityLog: [makeActivityEntry({ type: 'created', message: 'Task created', user: 'You' })],
        };
        set((state) => {
          const newTasks = [...state.tasks, task];
          const { addNotification } = useNotificationStore.getState();
          addNotification({
            type: 'task_added',
            taskId: task.id,
            taskTitle: task.title,
            message: `New task added — ${task.title}`,
          });
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
        return id;
      },
      updateTask: (id, updates, activityEntries) => {
        set((state) => {
          const existing = state.tasks.find((t) => t.id === id);
          const newTasks = state.tasks.map((task) => {
            if (task.id !== id) return task;
            const entries = (activityEntries ?? []).map(makeActivityEntry);
            return {
              ...task,
              ...updates,
              lastModified: new Date().toISOString(),
              activityLog: entries.length > 0 ? [...task.activityLog, ...entries] : task.activityLog,
            };
          });

          if (existing && updates.status && updates.status !== existing.status) {
            const { addNotification } = useNotificationStore.getState();
            if (updates.status === 'completed') {
              addNotification({
                type: 'completed',
                taskId: id,
                taskTitle: existing.title,
                message: `"${existing.title}" has been completed`,
              });
            } else {
              addNotification({
                type: 'status_changed',
                taskId: id,
                taskTitle: existing.title,
                message: `"${existing.title}" status changed to ${updates.status}`,
              });
            }
          }

          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      bulkUpdateTasks: (ids, updates) => {
        set((state) => {
          const idSet = new Set(ids);
          const now = new Date().toISOString();
          const newTasks = state.tasks.map((task) =>
            idSet.has(task.id) ? { ...task, ...updates, lastModified: now } : task
          );
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      bulkDeleteTasks: (ids) => {
        set((state) => {
          const idSet = new Set(ids);
          const newTasks = state.tasks.filter((task) => !idSet.has(task.id));
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      addComment: (taskId, content) => {
        const trimmed = content.trim();
        if (!trimmed) return;
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  comments: [
                    ...task.comments,
                    {
                      id: crypto.randomUUID(),
                      taskId,
                      userId: 'You',
                      content: trimmed,
                      createdAt: new Date().toISOString(),
                      mentions: [],
                    },
                  ],
                  activityLog: [
                    ...task.activityLog,
                    makeActivityEntry({ type: 'comment_added', message: 'Added a comment', user: 'You' }),
                  ],
                  lastModified: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      deleteTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.filter((task) => task.id !== id);
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      archiveTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, archived: true, lastModified: new Date().toISOString() } : task
          );
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      restoreTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, archived: false, lastModified: new Date().toISOString() } : task
          );
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      updateFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      setActiveSection: (section) => {
        set({ activeSection: section });
      },
      setViewingTaskId: (id) => {
        set({ viewingTaskId: id });
      },
      setEditOnOpen: (value) => {
        set({ editOnOpen: value });
      },
      setPendingRepositoryHandoff: (handoff) => {
        set({ pendingRepositoryHandoff: handoff });
      },
      setPendingTaskDetailTab: (tab) => {
        set({ pendingTaskDetailTab: tab });
      },
      resetSettingsView: () => {
        set((state) => ({ settingsResetToken: state.settingsResetToken + 1 }));
      },
      runAITask: (id) => {
        const startedAt = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id && t.aiMeta
              ? {
                  ...t,
                  aiMeta: {
                    ...t.aiMeta,
                    executionStatus: 'running',
                    result: '',
                    startedAt,
                    completedAt: undefined,
                    logs: [...t.aiMeta.logs, `[${new Date().toLocaleTimeString()}] Execution started…`],
                  },
                  activityLog: [
                    ...t.activityLog,
                    makeActivityEntry({ type: 'ai_execution_started', message: 'AI execution started', user: 'You' }),
                  ],
                  lastModified: new Date().toISOString(),
                }
              : t
          ),
        }));

        setTimeout(() => {
          set((state) => {
            const task = state.tasks.find((t) => t.id === id);
            if (!task?.aiMeta) return state;

            const sim = simulateAIExecution({
              model: task.aiMeta.model,
              prompt: task.aiMeta.prompt,
              outputType: task.aiMeta.outputType,
              confidenceThreshold: task.aiMeta.confidenceThreshold,
            });
            const logs = [...task.aiMeta.logs, ...sim.logLines];
            const completedAt = new Date().toISOString();

            const run: AIExecutionRun = {
              id: crypto.randomUUID(),
              startedAt: task.aiMeta.startedAt ?? startedAt,
              completedAt,
              status: sim.success ? 'success' : 'failed',
              prompt: task.aiMeta.prompt,
              result: sim.result,
              logs: sim.logLines,
              durationMs: new Date(completedAt).getTime() - new Date(task.aiMeta.startedAt ?? startedAt).getTime(),
              retryCount: 0,
              tokenUsage: sim.tokenUsage,
              model: task.aiMeta.model,
              temperature: task.aiMeta.temperature,
            };

            const { addNotification } = useNotificationStore.getState();
            addNotification({
              type: sim.success ? 'completed' : 'status_changed',
              taskId: task.id,
              taskTitle: task.title,
              message: sim.success
                ? `AI task "${task.title}" executed successfully`
                : `AI task "${task.title}" execution failed`,
            });

            return {
              tasks: state.tasks.map((t) =>
                t.id === id && t.aiMeta
                  ? {
                      ...t,
                      aiMeta: {
                        ...t.aiMeta,
                        executionStatus: sim.success ? 'success' : 'failed',
                        result: sim.result,
                        logs,
                        completedAt,
                        executionHistory: [run, ...(t.aiMeta.executionHistory ?? [])],
                      },
                      activityLog: [
                        ...t.activityLog,
                        makeActivityEntry({
                          type: 'ai_execution_completed',
                          message: sim.success ? 'AI execution completed successfully' : 'AI execution failed',
                          user: 'You',
                        }),
                      ],
                      lastModified: new Date().toISOString(),
                    }
                  : t
              ),
            };
          });
        }, 1500);
      },
      duplicateTask: (id) => {
        const source = get().tasks.find((t) => t.id === id);
        if (!source) return '';

        const now = new Date().toISOString();
        const newId = crypto.randomUUID();

        const duplicate: Task = {
          ...source,
          id: newId,
          title: `${source.title} (Copy)`,
          createdAt: now,
          lastModified: now,
          status: 'pending',
          completedAt: undefined,
          subtasks: source.subtasks.map((s) => ({ ...s, id: crypto.randomUUID(), completed: false })),
          comments: [],
          watchers: [],
          activeTimerStartedAt: undefined,
          createdBy: 'You',
          activityLog: [
            makeActivityEntry({
              type: 'created',
              message: `Duplicated from "${source.title}"`,
              user: 'You',
            }),
          ],
          aiMeta: source.aiMeta
            ? { ...source.aiMeta, executionStatus: 'idle', result: '', logs: [], startedAt: undefined, completedAt: undefined }
            : undefined,
        };

        set((state) => {
          const newTasks = [...state.tasks, duplicate];
          const { addNotification } = useNotificationStore.getState();
          addNotification({
            type: 'task_added',
            taskId: duplicate.id,
            taskTitle: duplicate.title,
            message: `Duplicated task — ${duplicate.title}`,
          });
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });

        return newId;
      },
      loadSampleData: () => {
        set((state) => {
          const sampleTasks = generateSampleTasks();
          const { addNotification } = useNotificationStore.getState();
          addNotification({
            type: 'task_added',
            taskId: sampleTasks[0]?.id ?? '',
            taskTitle: 'Sample data',
            message: `Loaded ${sampleTasks.length} sample tasks across all 5 categories`,
          });
          return {
            tasks: [...state.tasks, ...sampleTasks],
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      undo: () => {
        set((state) => {
          const previous = state.history.past[state.history.past.length - 1];
          if (!previous) return state;

          const newPast = state.history.past.slice(0, -1);
          return {
            tasks: previous,
            history: {
              past: newPast,
              future: [state.tasks, ...state.history.future],
            },
          };
        });
      },
      redo: () => {
        set((state) => {
          const next = state.history.future[0];
          if (!next) return state;

          const newFuture = state.history.future.slice(1);
          return {
            tasks: next,
            history: {
              past: [...state.history.past, state.tasks],
              future: newFuture,
            },
          };
        });
      },
    }),
    {
      name: 'task-storage',
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as TaskState;
        if (state?.tasks) {
          state.tasks = state.tasks.map((task) => ({
            ...task,
            lastModified: task.lastModified ?? task.createdAt,
            taskType: task.taskType ?? 'general',
            createdBy: task.createdBy ?? 'You',
            watchers: task.watchers ?? [],
            activityLog: task.activityLog ?? [
              makeActivityEntry({ type: 'created', message: 'Task created', user: task.createdBy ?? 'You' }),
            ],
            attachments: (task.attachments ?? []).map((att) => ({
              ...att,
              uploadedBy: att.uploadedBy ?? 'You',
              uploadedAt: att.uploadedAt ?? task.createdAt,
            })),
          }));
        }
        if (!state?.viewingTaskId) {
          state.viewingTaskId = null;
        }
        if (!state?.activeSection) {
          state.activeSection = 'repository';
        }
        if (state && !state.pendingRepositoryHandoff) {
          state.pendingRepositoryHandoff = null;
        }
        return state;
      },
    }
  )
);