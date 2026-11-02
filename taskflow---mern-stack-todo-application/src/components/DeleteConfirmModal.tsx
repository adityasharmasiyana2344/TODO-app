import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Todo } from '../types/todo';

interface DeleteConfirmModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (todo: Todo) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  todo,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Delete Task</h3>
          <p className="text-sm text-slate-500 mt-1">
            Are you sure you want to permanently delete this task from the database?
          </p>

          {/* Task Preview Card */}
          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="text-sm font-semibold text-slate-800 line-clamp-2">
              "{todo.title}"
            </p>
            {todo.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {todo.description}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(todo)}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs hover:shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Task'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
