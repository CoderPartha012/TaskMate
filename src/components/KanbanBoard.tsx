import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../store/taskStore';
import { Status } from '../types';
import { motion } from 'framer-motion';

const columns: { id: Status; title: string }[] = [
  { id: 'pending', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' }
];

export function KanbanBoard() {
  const { tasks, updateTask } = useTaskStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    updateTask(draggableId, { status: destination.droppableId as Status });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ id, title }) => {
          const count = tasks.filter(t => t.status === id && !t.archived).length;
          return (
            <div key={id} className="bg-noir-700 border border-white/[0.06] rounded-xl p-4 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full
                  ${title === 'Completed'   ? 'bg-jade'      :
                    title === 'In Progress' ? 'bg-amber-400'  :
                                             'bg-white/25'}`} />
                <h3 className={`font-semibold text-[11px] uppercase tracking-widest
                  ${title === 'Completed'   ? 'text-jade'      :
                    title === 'In Progress' ? 'text-amber-400'  :
                                             'text-white/40'}`}>
                  {title}
                </h3>
                <span className="ml-auto text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
              <Droppable droppableId={id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {tasks
                      .filter((task) => task.status === id && !task.archived)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                <TaskCard task={task} />
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
