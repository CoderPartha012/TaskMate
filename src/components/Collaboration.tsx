import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { User, Comment } from '../types';
import { motion } from 'framer-motion';
import { Share2, MessageSquare, Users } from 'lucide-react';
import { nanoid } from 'nanoid';

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', avatar: 'https://i.pravatar.cc/150?u=3' },
];

interface CollaborationProps {
  taskId: string;
}

export function Collaboration({ taskId }: CollaborationProps) {
  const { tasks, updateTask } = useTaskStore();
  const task = tasks.find((t) => t.id === taskId);
  const [comment, setComment] = useState('');
  const [showAssignees, setShowAssignees] = useState(false);

  if (!task) return null;

  const handleAddComment = () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      id: nanoid(),
      taskId,
      userId: '1', // Current user ID (mock)
      content: comment,
      createdAt: new Date().toISOString(),
      mentions: [], // Extract mentions from comment
    };

    updateTask(taskId, {
      comments: [...(task.comments || []), newComment],
    });

    setComment('');
  };

  const handleShareTask = () => {
    const shareLink = `${window.location.origin}/task/${taskId}`;
    updateTask(taskId, { sharedLink: shareLink });
    // In a real app, you'd probably want to copy this to clipboard
    alert(`Task shared! Link: ${shareLink}`);
  };

  const toggleAssignee = (userId: string) => {
    const currentAssignees = task.assignees || [];
    const newAssignees = currentAssignees.includes(userId)
      ? currentAssignees.filter((id) => id !== userId)
      : [...currentAssignees, userId];

    updateTask(taskId, { assignees: newAssignees });
  };

  return (
    <div className="space-y-6">
      {/* Assignees Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assignees
          </h3>
          <button
            onClick={() => setShowAssignees(!showAssignees)}
            className="text-blue-600 hover:text-blue-700"
          >
            {showAssignees ? 'Done' : 'Manage'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {showAssignees ? (
            mockUsers.map((user) => (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleAssignee(user.id)}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  task.assignees?.includes(user.id)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
                <span>{user.name}</span>
              </motion.button>
            ))
          ) : (
            task.assignees?.map((userId) => {
              const user = mockUsers.find((u) => u.id === userId);
              return (
                <div key={userId} className="flex items-center gap-2">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{user?.name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" />
          Comments
        </h3>

        <div className="space-y-4 mb-4">
          {task.comments?.map((comment) => {
            const user = mockUsers.find((u) => u.id === comment.userId);
            return (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{user?.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Comment
          </motion.button>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5" />
          Share Task
        </h3>

        {task.sharedLink ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={task.sharedLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigator.clipboard.writeText(task.sharedLink!)}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg"
            >
              Copy
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShareTask}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Generate Share Link
          </motion.button>
        )}
      </div>
    </div>
  );
}