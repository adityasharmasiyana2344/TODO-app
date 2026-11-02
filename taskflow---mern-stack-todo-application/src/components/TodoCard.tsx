import React from 'react';
import {
  Check,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Todo } from '../types/todo';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  isUpdating?: boolean;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  isUpdating = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Format dates cleanly
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return null;
    }
  };

  const isOverdue =
    !todo.completed &&
    todo.dueDate &&
    new Date(todo.dueDate).setHours(23, 59, 59, 999) < Date.now();

  const formattedDueDate = formatDate(todo.dueDate);
  const formattedCreatedAt = formatDate(todo.createdAt);

  const priorityStyles = {
    high: 'bg-rose-50 text-rose-700 border-rose-200/80',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/80',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
        todo.completed
          ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        {/* Completion Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggleComplete(todo._id, todo.completed)}
          disabled={isUpdating}
          title={todo.completed ? 'Mark as pending' : 'Mark as completed'}
          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            todo.completed
              ? 'bg-gradient-to-tr from-blue-600 to-purple-600 border-transparent text-white shadow-xs'
              : 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50'
          }`}
        >
          {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50 duration-150" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title with line-through on completed */}
            <h4
              onClick={() => onToggleComplete(todo._id, todo.completed)}
              className={`text-base sm:text-[17px] font-semibold text-slate-900 cursor-pointer select-none transition-all ${
                todo.completed
                  ? 'line-through text-slate-400 font-normal'
                  : 'text-slate-800 hover:text-indigo-600'
              }`}
            >
              {todo.title}
            </h4>

            {/* Priority Badge */}
            {todo.priority && (
              <span
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  priorityStyles[todo.priority]
                }`}
              >
                {todo.priority}
              </span>
            )}

            {/* Category Badge */}
            {todo.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                {todo.category}
              </span>
            )}
          </div>

          {/* Description */}
          {todo.description && (
            <div className="mt-1.5">
              <p
                className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${
                  todo.completed ? 'text-slate-400 line-through' : ''
                } ${!isExpanded && todo.description.length > 120 ? 'line-clamp-2' : ''}`}
              >
                {todo.description}
              </p>
              {todo.description.length > 120 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer inline-flex items-center gap-0.5"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Metadata Badges: Due Date & Created Date */}
          <div className="mt-3 flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-400 font-medium">
            {formattedDueDate && (
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                  isOverdue
                    ? 'bg-rose-50 text-rose-600 font-semibold'
                    : 'bg-slate-50 text-slate-500'
                }`}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>Due: {formattedDueDate}</span>
                {isOverdue && <span className="font-bold ml-0.5">(Overdue)</span>}
              </div>
            )}

            {formattedCreatedAt && (
              <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Added {formattedCreatedAt}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center space-x-1 shrink-0 pt-0.5">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(todo)}
            title="Edit task"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(todo)}
            title="Delete task"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
